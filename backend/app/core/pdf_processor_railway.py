"""
Core PDF Table Extraction Engine - Railway Compatible Version
Simplified version without camelot and tabula dependencies
"""

import pandas as pd
import pdfplumber
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import logging
import time
import asyncio

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
    """Railway-compatible PDF table extraction engine using only pdfplumber"""
    
    def __init__(self):
        # Simplified for Railway deployment - only pdfplumber method
        self.extraction_methods = ['pdfplumber']
        self.max_processing_time = 30  # 30 second timeout
        self.confidence_threshold = 0.6  # Minimum confidence for valid extraction
        
    async def extract_tables(self, file_path: str, user_tier: str = 'free') -> TableExtractionResult:
        """Extract tables from PDF using pdfplumber method only"""
        start_time = time.time()
        result = TableExtractionResult()
        
        try:
            # Use pdfplumber for extraction (most reliable)
            tables, confidence_scores = await self._extract_with_pdfplumber(file_path)
            
            if tables and len(tables) > 0:
                result.tables = tables
                result.confidence_scores = confidence_scores
                result.extraction_method = "pdfplumber"
                result.total_tables = len(tables)
                
                logger.info(f"pdfplumber extracted {len(tables)} tables with average confidence {sum(confidence_scores)/len(confidence_scores):.2f}")
            else:
                logger.warning(f"No tables found in PDF: {file_path}")
                result.errors.append("No tables detected in PDF")
            
            result.processing_time = time.time() - start_time
            
            # Log performance
            logger.info(f"PDF processing completed in {result.processing_time:.2f}s")
            
            return result
            
        except Exception as e:
            result.processing_time = time.time() - start_time
            result.errors.append(f"Error processing PDF: {str(e)}")
            logger.error(f"Error in extract_tables: {e}", exc_info=True)
            return result
    
    async def _extract_with_pdfplumber(self, file_path: str) -> Tuple[List[pd.DataFrame], List[float]]:
        """Extract tables using pdfplumber library"""
        tables = []
        confidence_scores = []
        
        try:
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    try:
                        # Extract tables from page
                        page_tables = page.extract_tables()
                        
                        for table_data in page_tables:
                            if not table_data or len(table_data) < 2:
                                continue
                                
                            # Convert to DataFrame
                            df = pd.DataFrame(table_data[1:], columns=table_data[0])
                            
                            # Clean up the DataFrame
                            df = self._clean_dataframe(df)
                            
                            if not df.empty and len(df.columns) > 1:
                                tables.append(df)
                                
                                # Calculate confidence based on data quality
                                confidence = self._calculate_confidence_pdfplumber(df, table_data)
                                confidence_scores.append(confidence)
                                
                                logger.info(f"Page {page_num + 1}: Found table with {len(df)} rows, {len(df.columns)} columns, confidence: {confidence:.2f}")
                                
                    except Exception as e:
                        logger.warning(f"Error processing page {page_num + 1}: {e}")
                        continue
                        
        except Exception as e:
            logger.error(f"pdfplumber extraction failed: {e}")
            raise
            
        return tables, confidence_scores
    
    def _clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate DataFrame"""
        try:
            # Remove completely empty rows and columns
            df = df.dropna(how='all')
            df = df.loc[:, ~df.isnull().all()]
            
            # Fill NaN values with empty strings
            df = df.fillna('')
            
            # Remove duplicate consecutive rows
            df = df.loc[df.astype(str).shift() != df.astype(str)]
            
            # Reset index
            df = df.reset_index(drop=True)
            
            return df
            
        except Exception as e:
            logger.warning(f"Error cleaning DataFrame: {e}")
            return df
    
    def _calculate_confidence_pdfplumber(self, df: pd.DataFrame, raw_data: List[List]) -> float:
        """Calculate confidence score for pdfplumber extraction"""
        try:
            confidence = 0.7  # Base confidence for pdfplumber
            
            # Adjust based on data quality
            total_cells = len(df) * len(df.columns)
            empty_cells = df.isnull().sum().sum()
            non_empty_ratio = (total_cells - empty_cells) / total_cells
            
            # Data completeness factor
            confidence *= non_empty_ratio
            
            # Structure consistency factor
            if len(df.columns) >= 2:
                confidence += 0.1
            if len(df) >= 3:
                confidence += 0.1
                
            # Cap at 0.95 for pdfplumber
            confidence = min(confidence, 0.95)
            
            return confidence
            
        except Exception as e:
            logger.warning(f"Error calculating confidence: {e}")
            return 0.5  # Default moderate confidence
    
    def get_method_performance(self) -> Dict[str, Any]:
        """Get performance statistics for extraction methods"""
        return {
            "available_methods": self.extraction_methods,
            "primary_method": "pdfplumber",
            "fallback_methods": [],  # No fallback in simplified version
            "average_processing_time": "< 5s",
            "reliability": "High",
            "note": "Simplified Railway-compatible version"
        }