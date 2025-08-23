"""
PDF Table Extractor Core - Secure PDF Processing with Table Detection
Implements P0 security measures and robust table extraction algorithms.
"""

import time
import logging
import tempfile
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
import json

# PDF processing libraries (with fallbacks for testing)
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    import camelot
    HAS_CAMELOT = True
except ImportError:
    HAS_CAMELOT = False

try:
    import tabula
    HAS_TABULA = True
except ImportError:
    HAS_TABULA = False

# Security and validation
try:
    import resource
    HAS_RESOURCE = True
except ImportError:
    # Windows doesn't have resource module
    HAS_RESOURCE = False

import signal
from concurrent.futures import ProcessPoolExecutor, TimeoutError as FutureTimeoutError

logger = logging.getLogger(__name__)

class PDFTableExtractor:
    """
    Secure PDF table extraction with multiple detection methods
    Implements P0 security measures including resource limits and timeout protection
    """
    
    def __init__(self):
        self.max_processing_time = 60  # 60 seconds max per PDF
        self.max_memory_mb = 512  # 512MB memory limit
        self.confidence_threshold = 0.7  # Minimum confidence for table detection
        
        # Table detection methods (in order of preference)
        self.extraction_methods = []
        if HAS_PDFPLUMBER:
            self.extraction_methods.append(self._extract_with_pdfplumber)
        if HAS_CAMELOT:
            self.extraction_methods.append(self._extract_with_camelot)
        if HAS_TABULA:
            self.extraction_methods.append(self._extract_with_tabula)
        
        # Fallback if no PDF libraries available
        if not self.extraction_methods:
            self.extraction_methods = [self._extract_mock]
    
    def extract_tables(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract tables from PDF with security limits and fallback methods
        
        Args:
            pdf_path: Path to validated PDF file
            
        Returns:
            Dict containing extracted tables, confidence scores, and metadata
        """
        start_time = time.time()
        
        try:
            # P0 Security: Process with resource limits
            with ProcessPoolExecutor(max_workers=1) as executor:
                future = executor.submit(self._limited_extract, pdf_path)
                
                try:
                    result = future.result(timeout=self.max_processing_time)
                    processing_time = time.time() - start_time
                    
                    result["processing_time"] = processing_time
                    result["success"] = True
                    
                    return result
                    
                except FutureTimeoutError:
                    future.cancel()
                    logger.warning(f"PDF processing timeout for {pdf_path}")
                    return {
                        "success": False,
                        "error": "Processing timeout",
                        "tables": [],
                        "processing_time": self.max_processing_time
                    }
                    
        except Exception as e:
            logger.error(f"Error extracting tables from {pdf_path}: {e}")
            return {
                "success": False,
                "error": str(e),
                "tables": [],
                "processing_time": time.time() - start_time
            }
    
    def _limited_extract(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract tables with memory and CPU limits (P0 Security)
        """
        # Set memory limit (Unix/Linux only)
        if HAS_RESOURCE:
            resource.setrlimit(
                resource.RLIMIT_AS,
                (self.max_memory_mb * 1024 * 1024, -1)
            )
        
        # Try each extraction method
        best_result = {"tables": [], "confidence": 0, "method": None}
        
        for method in self.extraction_methods:
            try:
                result = method(pdf_path)
                
                if result["confidence"] > best_result["confidence"]:
                    best_result = result
                    
                # If we have high confidence, use this result
                if result["confidence"] >= self.confidence_threshold:
                    break
                    
            except Exception as e:
                logger.warning(f"Extraction method {method.__name__} failed: {e}")
                continue
        
        return best_result
    
    def _extract_with_pdfplumber(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract tables using pdfplumber (best for simple tables)
        """
        tables = []
        total_confidence = 0
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    # Find tables on this page
                    page_tables = page.find_tables()
                    
                    for table_num, table in enumerate(page_tables):
                        try:
                            # Extract table data
                            table_data = table.extract()
                            
                            if table_data and len(table_data) > 1:  # At least header + 1 row
                                # Calculate confidence based on table structure
                                confidence = self._calculate_table_confidence(table_data)
                                
                                if confidence > 0.5:  # Only include decent tables
                                    tables.append({
                                        "data": table_data,
                                        "page": page_num + 1,
                                        "table_num": table_num + 1,
                                        "confidence": confidence,
                                        "rows": len(table_data),
                                        "cols": len(table_data[0]) if table_data[0] else 0,
                                        "method": "pdfplumber"
                                    })
                                    total_confidence += confidence
                                    
                        except Exception as e:
                            logger.warning(f"Error extracting table {table_num} from page {page_num}: {e}")
                            continue
        
        except Exception as e:
            logger.error(f"PDFPlumber extraction failed: {e}")
            return {"tables": [], "confidence": 0, "method": "pdfplumber"}
        
        avg_confidence = total_confidence / len(tables) if tables else 0
        
        return {
            "tables": tables,
            "confidence": avg_confidence,
            "method": "pdfplumber"
        }
    
    def _extract_with_camelot(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract tables using Camelot (best for complex tables)
        """
        tables = []
        
        try:
            # Try lattice method first (for tables with borders)
            camelot_tables = camelot.read_pdf(pdf_path, flavor='lattice')
            
            # If lattice fails or finds few tables, try stream method
            if len(camelot_tables) == 0:
                camelot_tables = camelot.read_pdf(pdf_path, flavor='stream')
            
            total_confidence = 0
            
            for i, table in enumerate(camelot_tables):
                try:
                    # Get table data as list of lists
                    table_data = table.df.values.tolist()
                    
                    # Add header row
                    header = table.df.columns.tolist()
                    table_data.insert(0, header)
                    
                    if len(table_data) > 1:  # At least header + 1 row
                        # Use Camelot's accuracy as confidence base
                        confidence = table.accuracy / 100.0
                        
                        # Adjust confidence based on table quality
                        confidence = self._adjust_camelot_confidence(confidence, table_data)
                        
                        if confidence > 0.4:  # Lower threshold for Camelot
                            tables.append({
                                "data": table_data,
                                "page": table.page,
                                "table_num": i + 1,
                                "confidence": confidence,
                                "rows": len(table_data),
                                "cols": len(table_data[0]) if table_data[0] else 0,
                                "method": "camelot",
                                "accuracy": table.accuracy
                            })
                            total_confidence += confidence
                            
                except Exception as e:
                    logger.warning(f"Error processing Camelot table {i}: {e}")
                    continue
        
        except Exception as e:
            logger.error(f"Camelot extraction failed: {e}")
            return {"tables": [], "confidence": 0, "method": "camelot"}
        
        avg_confidence = total_confidence / len(tables) if tables else 0
        
        return {
            "tables": tables,
            "confidence": avg_confidence,
            "method": "camelot"
        }
    
    def _extract_with_tabula(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract tables using Tabula (backup method)
        """
        tables = []
        
        try:
            # Read all tables from PDF
            tabula_tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)
            
            total_confidence = 0
            
            for i, df in enumerate(tabula_tables):
                try:
                    # Convert DataFrame to list of lists
                    table_data = df.values.tolist()
                    
                    # Add header row
                    header = df.columns.tolist()
                    table_data.insert(0, header)
                    
                    if len(table_data) > 1:  # At least header + 1 row
                        confidence = self._calculate_table_confidence(table_data)
                        
                        if confidence > 0.5:
                            tables.append({
                                "data": table_data,
                                "page": "unknown",  # Tabula doesn't provide page info easily
                                "table_num": i + 1,
                                "confidence": confidence,
                                "rows": len(table_data),
                                "cols": len(table_data[0]) if table_data[0] else 0,
                                "method": "tabula"
                            })
                            total_confidence += confidence
                            
                except Exception as e:
                    logger.warning(f"Error processing Tabula table {i}: {e}")
                    continue
        
        except Exception as e:
            logger.error(f"Tabula extraction failed: {e}")
            return {"tables": [], "confidence": 0, "method": "tabula"}
        
        avg_confidence = total_confidence / len(tables) if tables else 0
        
        return {
            "tables": tables,
            "confidence": avg_confidence,
            "method": "tabula"
        }
    
    def _calculate_table_confidence(self, table_data: List[List]) -> float:
        """
        Calculate confidence score for extracted table data
        """
        if not table_data or len(table_data) < 2:
            return 0.0
        
        confidence = 0.0
        
        # Check if we have consistent column count
        col_counts = [len(row) for row in table_data if row]
        if col_counts:
            most_common_cols = max(set(col_counts), key=col_counts.count)
            col_consistency = col_counts.count(most_common_cols) / len(col_counts)
            confidence += col_consistency * 0.4
        
        # Check for non-empty cells
        total_cells = sum(len(row) for row in table_data)
        non_empty_cells = sum(1 for row in table_data for cell in row if cell and str(cell).strip())
        if total_cells > 0:
            fill_ratio = non_empty_cells / total_cells
            confidence += fill_ratio * 0.3
        
        # Check for numeric data (good sign for tables)
        numeric_cells = 0
        for row in table_data[1:]:  # Skip header
            for cell in row:
                try:
                    float(str(cell).replace(',', '').replace('$', '').strip())
                    numeric_cells += 1
                except (ValueError, AttributeError):
                    pass
        
        if total_cells > 0:
            numeric_ratio = numeric_cells / total_cells
            confidence += numeric_ratio * 0.3
        
        return min(confidence, 1.0)
    
    def _adjust_camelot_confidence(self, base_confidence: float, table_data: List[List]) -> float:
        """
        Adjust Camelot confidence based on table quality
        """
        # Start with Camelot's accuracy
        confidence = base_confidence
        
        # Bonus for well-formed tables
        if len(table_data) >= 3:  # Header + at least 2 data rows
            confidence += 0.1
        
        # Check for consistent structure
        col_counts = [len(row) for row in table_data if row]
        if col_counts and len(set(col_counts)) == 1:  # All rows same length
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def export_tables(self, tables: List[Dict], format: str, output_dir: Path) -> Optional[Path]:
        """
        Export extracted tables to specified format
        
        Args:
            tables: List of extracted table dictionaries
            format: Export format (csv, excel, json)
            output_dir: Directory to save export file
            
        Returns:
            Path to exported file or None if failed
        """
        if not tables:
            return None
        
        try:
            timestamp = int(time.time())
            
            if format == "csv":
                return self._export_to_csv(tables, output_dir, timestamp)
            elif format == "excel":
                return self._export_to_excel(tables, output_dir, timestamp)
            elif format == "json":
                return self._export_to_json(tables, output_dir, timestamp)
            else:
                raise ValueError(f"Unsupported format: {format}")
                
        except Exception as e:
            logger.error(f"Error exporting tables to {format}: {e}")
            return None
    
    def _export_to_csv(self, tables: List[Dict], output_dir: Path, timestamp: int) -> Path:
        """Export tables to CSV format"""
        if len(tables) == 1:
            # Single table - direct CSV export
            output_path = output_dir / f"extracted_table_{timestamp}.csv"
            df = pd.DataFrame(tables[0]["data"][1:], columns=tables[0]["data"][0])
            df.to_csv(output_path, index=False)
        else:
            # Multiple tables - create separate CSV files in a zip
            import zipfile
            output_path = output_dir / f"extracted_tables_{timestamp}.zip"
            
            with zipfile.ZipFile(output_path, 'w') as zipf:
                for i, table in enumerate(tables):
                    csv_content = pd.DataFrame(table["data"][1:], columns=table["data"][0]).to_csv(index=False)
                    zipf.writestr(f"table_{i+1}_page_{table['page']}.csv", csv_content)
        
        return output_path
    
    def _export_to_excel(self, tables: List[Dict], output_dir: Path, timestamp: int) -> Path:
        """Export tables to Excel format"""
        output_path = output_dir / f"extracted_tables_{timestamp}.xlsx"
        
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            for i, table in enumerate(tables):
                sheet_name = f"Table_{i+1}_Page_{table['page']}"[:31]  # Excel sheet name limit
                df = pd.DataFrame(table["data"][1:], columns=table["data"][0])
                df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        return output_path
    
    def _export_to_json(self, tables: List[Dict], output_dir: Path, timestamp: int) -> Path:
        """Export tables to JSON format"""
        output_path = output_dir / f"extracted_tables_{timestamp}.json"
        
        # Convert tables to JSON-friendly format
        json_data = {
            "extracted_at": timestamp,
            "tables_count": len(tables),
            "tables": []
        }
        
        for table in tables:
            # Convert table data to list of dictionaries
            headers = table["data"][0]
            rows = table["data"][1:]
            
            table_json = {
                "page": table["page"],
                "confidence": table["confidence"],
                "method": table["method"],
                "dimensions": {"rows": table["rows"], "cols": table["cols"]},
                "data": [dict(zip(headers, row)) for row in rows]
            }
            json_data["tables"].append(table_json)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        
        return output_path
    
    def _extract_mock(self, pdf_path: str) -> Dict[str, Any]:
        """
        Mock extraction method for testing (when PDF libraries not available)
        """
        return {
            "tables": [
                {
                    "data": [
                        ["Header 1", "Header 2", "Header 3"],
                        ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"],
                        ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"]
                    ],
                    "page": 1,
                    "table_num": 1,
                    "confidence": 0.8,
                    "rows": 3,
                    "cols": 3,
                    "method": "mock"
                }
            ],
            "confidence": 0.8,
            "method": "mock"
        }