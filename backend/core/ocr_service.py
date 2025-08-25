"""
OCR Service for processing scanned PDFs using Tesseract
Restricted to paid tier users only
"""
import os
import tempfile
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
from typing import List, Dict, Any, Optional
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
import pandas as pd
import io

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=2)
        # Configure Tesseract path for Windows if needed
        if os.name == 'nt':  # Windows
            try:
                # Try common Tesseract installation paths
                possible_paths = [
                    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                    r"C:\Users\pmart\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
                ]
                for path in possible_paths:
                    if os.path.exists(path):
                        pytesseract.pytesseract.tesseract_cmd = path
                        break
            except Exception as e:
                logger.warning(f"Could not configure Tesseract path: {e}")

    async def extract_tables_from_scanned_pdf(self, pdf_path: str, user_tier: str) -> Dict[str, Any]:
        """
        Extract tables from scanned PDF using OCR
        Only available for paid tier users
        """
        if user_tier == 'free':
            raise ValueError("OCR processing is only available for paid tier users")
        
        try:
            # Convert PDF to images
            images = await self._pdf_to_images(pdf_path)
            
            # Extract text from images using OCR
            all_text_data = []
            for i, image in enumerate(images):
                text_data = await self._extract_text_from_image(image, page_num=i+1)
                all_text_data.extend(text_data)
            
            # Process extracted text to identify and structure tables
            tables = self._process_ocr_text_to_tables(all_text_data)
            
            return {
                "tables": tables,
                "page_count": len(images),
                "processing_method": "OCR",
                "confidence_score": self._calculate_ocr_confidence(tables),
                "ocr_text_data": all_text_data
            }
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            raise Exception(f"OCR processing failed: {str(e)}")

    async def _pdf_to_images(self, pdf_path: str) -> List[Image.Image]:
        """Convert PDF pages to images"""
        loop = asyncio.get_event_loop()
        
        def convert_pdf():
            return convert_from_path(
                pdf_path,
                dpi=300,  # Higher DPI for better OCR accuracy
                first_page=1,
                last_page=10  # Limit to first 10 pages for performance
            )
        
        images = await loop.run_in_executor(self.executor, convert_pdf)
        return images

    async def _extract_text_from_image(self, image: Image.Image, page_num: int) -> List[Dict[str, Any]]:
        """Extract text from image using Tesseract OCR"""
        loop = asyncio.get_event_loop()
        
        def extract_text():
            # Get detailed OCR data with bounding boxes
            ocr_data = pytesseract.image_to_data(
                image, 
                output_type=pytesseract.Output.DICT,
                config='--psm 6'  # Assume a single uniform block of text
            )
            
            # Filter out low confidence results
            min_confidence = 30
            text_blocks = []
            
            for i in range(len(ocr_data['text'])):
                if int(ocr_data['conf'][i]) > min_confidence:
                    text = ocr_data['text'][i].strip()
                    if text:
                        text_blocks.append({
                            'text': text,
                            'confidence': int(ocr_data['conf'][i]),
                            'x': ocr_data['left'][i],
                            'y': ocr_data['top'][i],
                            'width': ocr_data['width'][i],
                            'height': ocr_data['height'][i],
                            'page': page_num
                        })
            
            return text_blocks
        
        return await loop.run_in_executor(self.executor, extract_text)

    def _process_ocr_text_to_tables(self, text_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process OCR text data to identify and structure tables
        Uses spatial positioning and text patterns
        """
        tables = []
        
        # Group text by pages
        pages = {}
        for item in text_data:
            page = item['page']
            if page not in pages:
                pages[page] = []
            pages[page].append(item)
        
        for page_num, page_data in pages.items():
            page_tables = self._extract_tables_from_page(page_data, page_num)
            tables.extend(page_tables)
        
        return tables

    def _extract_tables_from_page(self, page_data: List[Dict[str, Any]], page_num: int) -> List[Dict[str, Any]]:
        """Extract tables from a single page using spatial analysis"""
        if not page_data:
            return []
        
        # Sort by Y coordinate (top to bottom), then X coordinate (left to right)
        sorted_data = sorted(page_data, key=lambda x: (x['y'], x['x']))
        
        # Simple table detection: look for aligned text that could form rows/columns
        rows = self._group_text_into_rows(sorted_data)
        
        if len(rows) < 2:  # Need at least 2 rows to form a table
            return []
        
        # Convert rows to table format
        table_data = []
        max_cols = max(len(row) for row in rows)
        
        for row in rows:
            # Pad row to match max columns
            padded_row = row + [''] * (max_cols - len(row))
            table_data.append(padded_row)
        
        if table_data:
            # Create DataFrame for consistent formatting
            df = pd.DataFrame(table_data[1:], columns=table_data[0] if table_data else [])
            
            return [{
                'page': page_num,
                'table_index': 0,
                'headers': table_data[0] if table_data else [],
                'rows': table_data[1:] if len(table_data) > 1 else [],
                'row_count': len(table_data) - 1 if len(table_data) > 1 else 0,
                'col_count': max_cols,
                'dataframe': df,
                'extraction_method': 'OCR'
            }]
        
        return []

    def _group_text_into_rows(self, sorted_data: List[Dict[str, Any]], y_tolerance: int = 10) -> List[List[str]]:
        """Group text elements into rows based on Y coordinates"""
        if not sorted_data:
            return []
        
        rows = []
        current_row = []
        current_y = sorted_data[0]['y']
        
        for item in sorted_data:
            if abs(item['y'] - current_y) <= y_tolerance:
                # Same row
                current_row.append(item)
            else:
                # New row
                if current_row:
                    # Sort current row by X coordinate and extract text
                    row_text = [elem['text'] for elem in sorted(current_row, key=lambda x: x['x'])]
                    rows.append(row_text)
                current_row = [item]
                current_y = item['y']
        
        # Don't forget the last row
        if current_row:
            row_text = [elem['text'] for elem in sorted(current_row, key=lambda x: x['x'])]
            rows.append(row_text)
        
        return rows

    def _calculate_ocr_confidence(self, tables: List[Dict[str, Any]]) -> float:
        """Calculate overall confidence score for OCR results"""
        if not tables:
            return 0.0
        
        # Basic confidence calculation based on table structure
        total_score = 0
        for table in tables:
            score = 0.5  # Base score for detecting a table structure
            
            # Bonus for having headers
            if table.get('headers') and any(header.strip() for header in table['headers']):
                score += 0.2
            
            # Bonus for having multiple rows
            if table.get('row_count', 0) > 1:
                score += 0.2
            
            # Bonus for having multiple columns
            if table.get('col_count', 0) > 1:
                score += 0.1
            
            total_score += min(score, 1.0)
        
        return min(total_score / len(tables), 1.0)

    async def is_scanned_pdf(self, pdf_path: str) -> bool:
        """
        Determine if PDF is scanned (image-based) vs text-based
        """
        try:
            import pypdf
            
            with open(pdf_path, 'rb') as file:
                pdf_reader = pypdf.PdfReader(file)
                
                # Check first few pages for extractable text
                text_length = 0
                pages_to_check = min(3, len(pdf_reader.pages))
                
                for i in range(pages_to_check):
                    page = pdf_reader.pages[i]
                    text = page.extract_text().strip()
                    text_length += len(text)
                
                # If very little text is extractable, it's likely scanned
                avg_text_per_page = text_length / pages_to_check if pages_to_check > 0 else 0
                
                # Threshold: less than 50 characters per page suggests scanned PDF
                return avg_text_per_page < 50
                
        except Exception as e:
            logger.warning(f"Could not determine PDF type: {e}")
            # Default to assuming it might be scanned
            return True