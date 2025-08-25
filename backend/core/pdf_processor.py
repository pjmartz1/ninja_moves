"""
Core PDF Table Extraction Engine
Main business logic for extracting tables from PDFs
"""

import pandas as pd
import pdfplumber
import camelot
import tabula
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import logging
from security.validator import SecurePDFValidator
from core.ocr_service import OCRService

logger = logging.getLogger(__name__)


class TableExtractionResult:
    """Container for extraction results"""
    
    def __init__(self):
        self.tables: List[pd.DataFrame] = []
        self.confidence_scores: List[float] = []
        self.extraction_method: str = ""
        self.total_tables: int = 0
        self.processing_time: float = 0.0
        self.errors: List[str] = []


class PDFTableExtractor:
    """Main PDF table extraction engine with enhanced optimization and OCR support"""
    
    def __init__(self):
        self.validator = SecurePDFValidator()
        self.ocr_service = OCRService()
        # Ordered by reliability and speed
        self.extraction_methods = ['pdfplumber', 'camelot', 'tabula']
        self.max_processing_time = 30  # 30 second timeout
        self.confidence_threshold = 0.6  # Minimum confidence for valid extraction
        
    async def extract_tables(self, file_path: str, user_tier: str = 'free') -> TableExtractionResult:
        """Extract tables from PDF using optimized multi-method approach"""
        import time
        import asyncio
        start_time = time.time()
        
        result = TableExtractionResult()
        
        try:
            # P0 Security: Validate PDF first
            if not self.validator.validate_pdf_file(file_path):
                result.errors.append("PDF validation failed")
                return result
            
            # Quick pre-analysis to choose optimal method
            optimal_method = await self._select_optimal_method(file_path)
            
            # Try methods in optimized order
            methods_to_try = [optimal_method] + [m for m in self.extraction_methods if m != optimal_method]
            
            for method in methods_to_try:
                # Check timeout
                if time.time() - start_time > self.max_processing_time:
                    result.errors.append(f"Processing timeout after {self.max_processing_time}s")
                    break
                
                try:
                    if method == 'pdfplumber':
                        tables, confidence = await self._extract_with_pdfplumber(file_path)
                    elif method == 'camelot':
                        tables, confidence = await self._extract_with_camelot(file_path)
                    elif method == 'tabula':
                        tables, confidence = await self._extract_with_tabula(file_path)
                    
                    # Enhanced validation: check confidence threshold
                    if tables and confidence:
                        avg_confidence = sum(confidence) / len(confidence)
                        if avg_confidence >= self.confidence_threshold:
                            result.tables = tables
                            result.confidence_scores = confidence
                            result.extraction_method = method
                            result.total_tables = len(tables)
                            logger.info(f"Successful extraction with {method}: {len(tables)} tables, {avg_confidence:.2f} confidence")
                            break
                        else:
                            logger.warning(f"Method {method} confidence too low: {avg_confidence:.2f}")
                            
                except asyncio.TimeoutError:
                    logger.warning(f"Method {method} timed out")
                    result.errors.append(f"{method}: timeout")
                    continue
                except Exception as e:
                    logger.warning(f"Method {method} failed: {str(e)}")
                    result.errors.append(f"{method}: {str(e)}")
                    continue
            
            result.processing_time = time.time() - start_time
            
            # Apply fallback methods if primary methods failed
            if not result.tables:
                fallback_result = await self._apply_fallback_methods(file_path)
                if fallback_result.tables:
                    result = fallback_result
                    result.processing_time = time.time() - start_time
                else:
                    # OCR fallback for paid users if PDF might be scanned
                    if user_tier != 'free':
                        try:
                            is_scanned = await self.ocr_service.is_scanned_pdf(file_path)
                            if is_scanned:
                                logger.info("Detected scanned PDF, attempting OCR extraction (paid feature)")
                                ocr_result = await self.ocr_service.extract_tables_from_scanned_pdf(file_path, user_tier)
                                
                                if ocr_result.get('tables'):
                                    # Convert OCR results to our format
                                    result.tables = []
                                    result.confidence_scores = []
                                    
                                    for ocr_table in ocr_result['tables']:
                                        df = ocr_table.get('dataframe')
                                        if df is not None and not df.empty:
                                            result.tables.append(df)
                                            result.confidence_scores.append(0.7)  # OCR confidence
                                    
                                    if result.tables:
                                        result.extraction_method = "OCR_" + ocr_result.get('processing_method', 'tesseract')
                                        result.total_tables = len(result.tables)
                                        result.processing_time = time.time() - start_time
                                        logger.info(f"OCR extraction successful: {len(result.tables)} tables found")
                                        return result
                        except Exception as e:
                            logger.warning(f"OCR fallback failed: {str(e)}")
                            result.errors.append(f"OCR processing failed: {str(e)}")
                    else:
                        # Suggest OCR upgrade for free users with scanned PDFs
                        try:
                            is_scanned = await self.ocr_service.is_scanned_pdf(file_path)
                            if is_scanned:
                                result.errors.append("This appears to be a scanned PDF. OCR processing is available for paid users to extract tables from scanned documents.")
                        except:
                            pass
                    
                    if not result.tables:
                        result.errors.append("No tables found with any extraction method (including fallbacks)")
            
            return result
            
        except Exception as e:
            logger.error(f"PDF extraction failed: {str(e)}")
            result.errors.append(f"Extraction failed: {str(e)}")
            result.processing_time = time.time() - start_time
            return result
    
    async def _extract_with_pdfplumber(self, file_path: str) -> Tuple[List[pd.DataFrame], List[float]]:
        """Extract tables using pdfplumber (most reliable for text-based PDFs)"""
        tables = []
        confidence_scores = []
        
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                try:
                    # Extract tables from page
                    page_tables = page.extract_tables()
                    
                    for table_data in page_tables:
                        if table_data and len(table_data) > 1:  # At least header + 1 row
                            # Convert to DataFrame
                            df = pd.DataFrame(table_data[1:], columns=table_data[0])
                            
                            # Clean empty rows/columns
                            df = df.dropna(how='all').dropna(axis=1, how='all')
                            
                            if not df.empty and len(df) > 0:
                                tables.append(df)
                                # Simple confidence based on data completeness
                                confidence = self._calculate_confidence(df)
                                confidence_scores.append(confidence)
                                
                except Exception as e:
                    logger.warning(f"pdfplumber failed on page {page_num}: {str(e)}")
                    continue
        
        return tables, confidence_scores
    
    async def _extract_with_camelot(self, file_path: str) -> Tuple[List[pd.DataFrame], List[float]]:
        """Extract tables using Camelot (good for complex layouts)"""
        tables = []
        confidence_scores = []
        
        try:
            # Use lattice method for tables with clear borders
            camelot_tables = camelot.read_pdf(file_path, flavor='lattice')
            
            if not camelot_tables:
                # Fallback to stream method
                camelot_tables = camelot.read_pdf(file_path, flavor='stream')
            
            for table in camelot_tables:
                df = table.df
                
                if not df.empty and len(df) > 1:
                    # Clean the dataframe
                    df = df.dropna(how='all').dropna(axis=1, how='all')
                    
                    if not df.empty:
                        tables.append(df)
                        # Use Camelot's accuracy score
                        confidence = table.accuracy / 100.0 if hasattr(table, 'accuracy') else 0.8
                        confidence_scores.append(confidence)
                        
        except Exception as e:
            logger.warning(f"Camelot extraction failed: {str(e)}")
        
        return tables, confidence_scores
    
    async def _extract_with_tabula(self, file_path: str) -> Tuple[List[pd.DataFrame], List[float]]:
        """Extract tables using Tabula (Java-based, good fallback)"""
        tables = []
        confidence_scores = []
        
        try:
            # Extract all tables from PDF
            tabula_tables = tabula.read_pdf(file_path, pages='all', multiple_tables=True)
            
            for df in tabula_tables:
                if not df.empty and len(df) > 1:
                    # Clean the dataframe
                    df = df.dropna(how='all').dropna(axis=1, how='all')
                    
                    if not df.empty:
                        tables.append(df)
                        confidence = self._calculate_confidence(df)
                        confidence_scores.append(confidence)
                        
        except Exception as e:
            logger.warning(f"Tabula extraction failed: {str(e)}")
        
        return tables, confidence_scores
    
    def _calculate_confidence(self, df: pd.DataFrame) -> float:
        """Enhanced confidence score calculation with multiple quality metrics"""
        try:
            total_cells = df.shape[0] * df.shape[1]
            if total_cells == 0:
                return 0.0
            
            # Base confidence from data completeness
            non_empty_cells = df.count().sum()
            completeness = non_empty_cells / total_cells
            
            # Structure quality bonus
            structure_score = 0.0
            if df.shape[0] >= 3 and df.shape[1] >= 2:  # Minimum viable table
                structure_score += 0.1
            if df.shape[0] >= 5 and df.shape[1] >= 3:  # Well-formed table
                structure_score += 0.05
            
            # Data variety bonus (avoid tables with too many duplicates)
            try:
                uniqueness = len(df.drop_duplicates()) / len(df) if len(df) > 0 else 0
                variety_bonus = min(uniqueness * 0.08, 0.08)
            except:
                variety_bonus = 0
            
            # Numeric content bonus (tables often contain numbers)
            numeric_bonus = 0.0
            try:
                numeric_cols = df.select_dtypes(include=['number']).shape[1]
                if numeric_cols > 0:
                    numeric_bonus = min(numeric_cols / df.shape[1] * 0.05, 0.05)
            except:
                pass
            
            # Header detection bonus
            header_bonus = 0.0
            try:
                # Check if first row looks like headers (mostly strings, low numeric content)
                if not df.empty:
                    first_row = df.iloc[0]
                    string_count = sum(isinstance(val, str) and len(str(val)) > 0 for val in first_row)
                    if string_count >= len(first_row) * 0.7:  # 70% string content
                        header_bonus = 0.03
            except:
                pass
            
            # Column alignment bonus (consistent data types per column)
            alignment_bonus = 0.0
            try:
                consistent_cols = 0
                for col in df.columns:
                    col_data = df[col].dropna()
                    if len(col_data) > 0:
                        # Check if column has consistent data type
                        types = set(type(val).__name__ for val in col_data)
                        if len(types) <= 2:  # Allow some type variation
                            consistent_cols += 1
                alignment_bonus = min(consistent_cols / len(df.columns) * 0.04, 0.04)
            except:
                pass
            
            # Final confidence calculation
            confidence = min(
                completeness * 0.7 +  # 70% weight on completeness
                structure_score + 
                variety_bonus + 
                numeric_bonus + 
                header_bonus + 
                alignment_bonus,
                1.0
            )
            
            return round(confidence, 3)
            
        except Exception:
            return 0.5  # Default confidence
    
    async def _select_optimal_method(self, file_path: str) -> str:
        """Quick analysis to select the best extraction method for this PDF"""
        try:
            # Quick PDF analysis using pdfplumber (fastest for analysis)
            with pdfplumber.open(file_path) as pdf:
                if len(pdf.pages) == 0:
                    return 'pdfplumber'  # Default
                
                first_page = pdf.pages[0]
                
                # Check for explicit table structures
                page_text = first_page.extract_text() or ""
                
                # If lots of tabular characters, prefer camelot for structured tables
                tab_chars = page_text.count('\t') + page_text.count('|')
                if tab_chars > 20:
                    logger.info("Detected structured table format, using camelot")
                    return 'camelot'
                
                # If lots of numeric data, tabula might be better
                import re
                numbers = re.findall(r'\$?[\d,]+\.?\d*', page_text)
                if len(numbers) > 50:
                    logger.info("Detected numeric-heavy content, using tabula") 
                    return 'tabula'
                
                # Default to pdfplumber for text-based tables
                logger.info("Using default pdfplumber method")
                return 'pdfplumber'
                
        except Exception as e:
            logger.warning(f"Method selection failed: {e}, defaulting to pdfplumber")
            return 'pdfplumber'
    
    async def _apply_fallback_methods(self, file_path: str) -> TableExtractionResult:
        """Apply fallback extraction methods for difficult PDFs"""
        result = TableExtractionResult()
        
        try:
            # Fallback 1: Try pdfplumber with different extraction settings
            logger.info("Applying fallback method 1: Enhanced pdfplumber")
            tables, confidence = await self._extract_with_enhanced_pdfplumber(file_path)
            if tables and confidence:
                result.tables = tables
                result.confidence_scores = confidence
                result.extraction_method = "pdfplumber_enhanced"
                result.total_tables = len(tables)
                return result
            
            # Fallback 2: Try to extract as raw text and parse manually
            logger.info("Applying fallback method 2: Text parsing")
            tables, confidence = await self._extract_via_text_parsing(file_path)
            if tables and confidence:
                result.tables = tables
                result.confidence_scores = confidence
                result.extraction_method = "text_parsing"
                result.total_tables = len(tables)
                return result
            
        except Exception as e:
            logger.error(f"Fallback methods failed: {e}")
            result.errors.append(f"Fallback failed: {str(e)}")
        
        return result
    
    async def _extract_with_enhanced_pdfplumber(self, file_path: str) -> Tuple[List[pd.DataFrame], List[float]]:
        """Enhanced pdfplumber extraction with more aggressive table detection"""
        tables = []
        confidence_scores = []
        
        try:
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    try:
                        # Try with different table extraction settings
                        table_settings = [
                            {},  # Default
                            {"vertical_strategy": "lines", "horizontal_strategy": "lines"},
                            {"vertical_strategy": "text", "horizontal_strategy": "text"},
                            {"intersection_tolerance": 5, "edge_min_length": 10}
                        ]
                        
                        for settings in table_settings:
                            page_tables = page.extract_tables(table_settings=settings)
                            
                            for table_data in page_tables:
                                if table_data and len(table_data) > 1:
                                    try:
                                        df = pd.DataFrame(table_data[1:], columns=table_data[0])
                                        df = df.dropna(how='all').dropna(axis=1, how='all')
                                        
                                        if not df.empty and len(df) > 0:
                                            confidence = self._calculate_confidence(df)
                                            if confidence >= 0.3:  # Lower threshold for fallback
                                                tables.append(df)
                                                confidence_scores.append(confidence)
                                                break  # Found a good table with this setting
                                    except Exception:
                                        continue
                            
                            if tables:  # If we found tables with this setting, don't try others
                                break
                                
                    except Exception as e:
                        logger.warning(f"Enhanced pdfplumber failed on page {page_num}: {str(e)}")
                        continue
                        
        except Exception as e:
            logger.error(f"Enhanced pdfplumber extraction failed: {str(e)}")
        
        return tables, confidence_scores
    
    async def _extract_via_text_parsing(self, file_path: str) -> Tuple[List[pd.DataFrame], List[float]]:
        """Last resort: extract text and try to parse tabular data manually"""
        tables = []
        confidence_scores = []
        
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    try:
                        text = page.extract_text()
                        if not text:
                            continue
                        
                        # Look for patterns that suggest tabular data
                        lines = text.split('\n')
                        table_lines = []
                        
                        for line in lines:
                            # Detect lines that might be table rows
                            if self._looks_like_table_row(line):
                                table_lines.append(line)
                        
                        if len(table_lines) >= 3:  # At least header + 2 data rows
                            df = self._parse_text_table(table_lines)
                            if df is not None and not df.empty:
                                confidence = self._calculate_confidence(df) * 0.7  # Lower confidence for text parsing
                                tables.append(df)
                                confidence_scores.append(confidence)
                                
                    except Exception as e:
                        logger.warning(f"Text parsing failed: {str(e)}")
                        continue
                        
        except Exception as e:
            logger.error(f"Text parsing extraction failed: {str(e)}")
        
        return tables, confidence_scores
    
    def _looks_like_table_row(self, line: str) -> bool:
        """Heuristic to detect if a text line looks like a table row"""
        import re
        
        # Count numbers, currency symbols, and separators
        numbers = len(re.findall(r'[\d,]+\.?\d*', line))
        separators = line.count('\t') + line.count('  ') + line.count('|')
        currency = line.count('$') + line.count('€') + line.count('£')
        
        # If line has multiple numbers or clear separators, it might be tabular
        return (numbers >= 2 or separators >= 2 or currency >= 1) and len(line.strip()) > 10
    
    def _parse_text_table(self, lines: List[str]) -> Optional[pd.DataFrame]:
        """Parse lines of text into a DataFrame"""
        try:
            import re
            
            # Try to detect the separator pattern
            separators = ['\t', '  ', '   ', '|', ',']
            best_separator = None
            max_columns = 0
            
            for sep in separators:
                avg_cols = sum(len(line.split(sep)) for line in lines) / len(lines)
                if avg_cols > max_columns:
                    max_columns = avg_cols
                    best_separator = sep
            
            if best_separator and max_columns >= 2:
                # Parse the table
                parsed_data = []
                for line in lines:
                    row = [cell.strip() for cell in line.split(best_separator) if cell.strip()]
                    if row:
                        parsed_data.append(row)
                
                if len(parsed_data) >= 2:
                    # Use first row as headers, rest as data
                    headers = parsed_data[0]
                    data_rows = parsed_data[1:]
                    
                    # Normalize row lengths
                    max_cols = len(headers)
                    normalized_rows = []
                    for row in data_rows:
                        if len(row) < max_cols:
                            row.extend([''] * (max_cols - len(row)))
                        elif len(row) > max_cols:
                            row = row[:max_cols]
                        normalized_rows.append(row)
                    
                    df = pd.DataFrame(normalized_rows, columns=headers)
                    return df
                    
        except Exception as e:
            logger.warning(f"Text table parsing failed: {str(e)}")
        
        return None
    
    def get_table_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Get summary statistics for a table"""
        return {
            "rows": len(df),
            "columns": len(df.columns),
            "data_types": df.dtypes.to_dict(),
            "has_headers": bool(df.columns.tolist()),
            "sample_data": df.head(3).to_dict() if len(df) > 0 else {}
        }