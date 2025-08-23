"""
P0 Security: Input Validation & Sanitization
Critical security module for PDF file validation
"""

import os
import re
import magic
import hashlib
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, validator, Field
import pypdf


class SecurityError(Exception):
    """Custom exception for security violations"""
    pass


class FileUploadRequest(BaseModel):
    """Pydantic model for validating file uploads"""
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(..., pattern="^application/pdf$")
    file_size: int = Field(..., gt=0, le=10485760)  # Max 10MB
    
    @validator('filename')
    def sanitize_filename(cls, v):
        # Remove path components
        v = os.path.basename(v)
        # Remove dangerous characters
        v = re.sub(r'[^\w\s\-\.]', '', v)
        # Check for null bytes
        if '\x00' in v:
            raise ValueError("Null bytes not allowed")
        return v


class SecurePDFValidator:
    """P0 Security: Secure PDF validation before processing"""
    
    def __init__(self):
        self.max_pages = 100
        self.max_processing_time = 60
        self.max_file_size_mb = 10
        
    def validate_pdf_file(self, file_path: str) -> bool:
        """Critical: Validate PDF before processing"""
        try:
            # Check magic bytes (not just extension)
            mime_type = magic.from_file(file_path, mime=True)
            if mime_type != 'application/pdf':
                raise SecurityError("Invalid PDF file - magic bytes check failed")
            
            # Check file size
            if os.path.getsize(file_path) > self.max_file_size_mb * 1024 * 1024:
                raise SecurityError("File too large")
                
            # Check for embedded JavaScript/files
            with open(file_path, 'rb') as f:
                try:
                    pdf_reader = pypdf.PdfReader(f, strict=True)
                    
                    # Check for JavaScript
                    if '/JavaScript' in str(pdf_reader.trailer):
                        raise SecurityError("PDF contains JavaScript")
                    
                    # Check for embedded files
                    if '/EmbeddedFiles' in str(pdf_reader.trailer):
                        raise SecurityError("PDF contains embedded files")
                        
                    # Check page count
                    if len(pdf_reader.pages) > self.max_pages:
                        raise SecurityError(f"PDF exceeds {self.max_pages} pages")
                        
                except pypdf.errors.PdfReadError as e:
                    raise SecurityError(f"Invalid PDF structure: {str(e)}")
                    
            return True
            
        except Exception as e:
            raise SecurityError(f"PDF validation failed: {str(e)}")
    
    def generate_file_hash(self, file_path: str) -> str:
        """Generate SHA256 hash for file integrity"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()