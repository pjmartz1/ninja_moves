"""
Secure PDF Validator - P0 Security Implementation
Validates PDF files for security threats including embedded JavaScript, malicious content, and structural issues.
"""

import os
import logging
import hashlib
from pathlib import Path
from typing import Dict, Any, List
import pypdf
from pypdf.errors import PdfReadError
import tempfile

# Try to import python-magic, fallback to basic validation if not available
try:
    import magic
    HAS_MAGIC = True
except ImportError:
    HAS_MAGIC = False
    print("Warning: python-magic not available, using basic file validation")

logger = logging.getLogger(__name__)

class SecurityError(Exception):
    """Custom security exception for PDF validation"""
    pass

class SecurePDFValidator:
    """
    Secure PDF validator implementing P0 security measures:
    - Magic bytes validation (not just file extension)
    - Embedded JavaScript detection
    - Embedded files detection
    - Malformed PDF structure detection
    - File size and page count limits
    - Suspicious content pattern detection
    """
    
    def __init__(self):
        self.max_pages = 100
        self.max_processing_time = 60  # seconds
        self.max_file_size_mb = 10
        
        # Known dangerous PDF features
        self.dangerous_features = [
            '/JavaScript',
            '/JS',
            '/EmbeddedFiles',
            '/EmbeddedFile', 
            '/GoToE',
            '/GoToR',
            '/Launch',
            '/SubmitForm',
            '/ImportData'
        ]
        
        # Suspicious content patterns
        self.suspicious_patterns = [
            b'eval(',
            b'unescape(',
            b'String.fromCharCode(',
            b'document.write(',
            b'ActiveXObject',
            b'WScript.Shell',
            b'cmd.exe',
            b'powershell'
        ]
    
    def validate_file_content(self, file_content: bytes) -> Dict[str, Any]:
        """
        Validate raw file content for security threats
        
        Args:
            file_content: Raw PDF file bytes
            
        Returns:
            Dict containing validation results
            
        Raises:
            SecurityError: If security threats detected
            ValueError: If file validation fails
        """
        validation_result = {
            'valid': False,
            'file_size': len(file_content),
            'mime_type': None,
            'threats_detected': [],
            'warnings': []
        }
        
        # P0 Security: Check file size
        if len(file_content) > self.max_file_size_mb * 1024 * 1024:
            raise ValueError(f"File too large (max {self.max_file_size_mb}MB)")
        
        # P0 Security: Check magic bytes (not just extension)
        try:
            if HAS_MAGIC:
                mime_type = magic.from_buffer(file_content, mime=True)
                validation_result['mime_type'] = mime_type
                
                if mime_type != 'application/pdf':
                    raise ValueError(f"Invalid PDF file (detected: {mime_type})")
            else:
                # Fallback: Check PDF magic bytes manually
                if not file_content.startswith(b'%PDF-'):
                    raise ValueError("Invalid PDF file (missing PDF header)")
                validation_result['mime_type'] = 'application/pdf'
                
        except Exception as e:
            raise ValueError(f"Could not determine file type: {e}")
        
        # P0 Security: Scan for suspicious patterns in raw content
        threats = self._scan_suspicious_patterns(file_content)
        if threats:
            validation_result['threats_detected'].extend(threats)
            raise SecurityError(f"Suspicious content detected: {', '.join(threats)}")
        
        # P0 Security: Check for PDF bomb indicators (extreme compression ratios)
        compression_warnings = self._check_compression_ratio(file_content)
        if compression_warnings:
            validation_result['warnings'].extend(compression_warnings)
        
        validation_result['valid'] = True
        logger.info(f"PDF content validation passed ({len(file_content)} bytes)")
        
        return validation_result
    
    def validate_filename(self, filename: str):
        """
        Validate filename for security issues
        
        Args:
            filename: Original filename
            
        Raises:
            ValueError: If filename is invalid
        """
        if not filename:
            raise ValueError("Filename cannot be empty")
        
        # Remove path components for security
        safe_filename = os.path.basename(filename)
        
        # Check file extension
        if not safe_filename.lower().endswith('.pdf'):
            raise ValueError("File must have .pdf extension")
        
        # Check for dangerous characters
        dangerous_chars = ['..', '/', '\\', ':', '*', '?', '"', '<', '>', '|', '\x00']
        for char in dangerous_chars:
            if char in filename:
                raise ValueError(f"Invalid character in filename: {repr(char)}")
        
        # Check filename length
        if len(safe_filename) > 255:
            raise ValueError("Filename too long")
        
        logger.debug(f"Filename validation passed: {safe_filename}")
    
    def validate_pdf_file(self, file_path: str) -> Dict[str, Any]:
        """
        Comprehensive PDF file validation with structure analysis
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Dict containing detailed validation results
            
        Raises:
            SecurityError: If security threats detected
            ValueError: If PDF is invalid or corrupted
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise ValueError("PDF file does not exist")
        
        validation_result = {
            'valid': False,
            'file_size': file_path.stat().st_size,
            'page_count': 0,
            'pdf_version': None,
            'encrypted': False,
            'dangerous_features': [],
            'threats_detected': [],
            'warnings': [],
            'metadata': {}
        }
        
        try:
            # P0 Security: Open PDF with strict parsing
            with open(file_path, 'rb') as f:
                try:
                    pdf_reader = pypdf.PdfReader(f, strict=True)
                except PdfReadError as e:
                    raise ValueError(f"Corrupted or invalid PDF: {e}")
                
                # Basic PDF info
                validation_result['page_count'] = len(pdf_reader.pages)
                validation_result['encrypted'] = pdf_reader.is_encrypted
                
                # P0 Security: Check page count limit
                if len(pdf_reader.pages) > self.max_pages:
                    raise ValueError(f"PDF exceeds {self.max_pages} pages limit")
                
                # P0 Security: Check for encryption (we don't handle encrypted PDFs)
                if pdf_reader.is_encrypted:
                    raise SecurityError("Encrypted PDFs are not supported for security reasons")
                
                # P0 Security: Scan PDF structure for dangerous features
                dangerous_features = self._scan_pdf_structure(pdf_reader)
                if dangerous_features:
                    validation_result['dangerous_features'] = dangerous_features
                    raise SecurityError(f"Dangerous PDF features detected: {', '.join(dangerous_features)}")
                
                # Extract safe metadata
                try:
                    metadata = pdf_reader.metadata
                    if metadata:
                        safe_metadata = self._extract_safe_metadata(metadata)
                        validation_result['metadata'] = safe_metadata
                except Exception as e:
                    logger.warning(f"Could not extract PDF metadata: {e}")
                    validation_result['warnings'].append("Could not extract metadata")
                
                # P0 Security: Check for suspicious JavaScript in pages
                js_threats = self._scan_pages_for_javascript(pdf_reader)
                if js_threats:
                    validation_result['threats_detected'].extend(js_threats)
                    raise SecurityError(f"JavaScript detected in PDF: {', '.join(js_threats)}")
                
                # P0 Security: Validate PDF structure integrity
                structure_warnings = self._validate_pdf_structure(pdf_reader)
                if structure_warnings:
                    validation_result['warnings'].extend(structure_warnings)
        
        except (SecurityError, ValueError):
            # Re-raise security and validation errors
            raise
        except Exception as e:
            logger.error(f"PDF validation error: {e}")
            raise ValueError(f"Could not validate PDF: {e}")
        
        validation_result['valid'] = True
        logger.info(f"PDF validation passed: {validation_result['page_count']} pages, {validation_result['file_size']} bytes")
        
        return validation_result
    
    def _scan_suspicious_patterns(self, content: bytes) -> List[str]:
        """Scan raw content for suspicious patterns"""
        threats = []
        
        for pattern in self.suspicious_patterns:
            if pattern in content:
                threat_name = pattern.decode('utf-8', errors='ignore')
                threats.append(f"Suspicious pattern: {threat_name}")
                logger.warning(f"Suspicious pattern detected: {threat_name}")
        
        return threats
    
    def _check_compression_ratio(self, content: bytes) -> List[str]:
        """Check for extreme compression ratios (PDF bomb indicator)"""
        warnings = []
        
        # Simple heuristic: check for repeated null bytes or patterns
        null_ratio = content.count(b'\x00') / len(content)
        if null_ratio > 0.9:
            warnings.append("High null byte ratio - potential PDF bomb")
        
        # Check for extremely repetitive content
        if len(set(content)) < 50 and len(content) > 100000:
            warnings.append("Extremely repetitive content - potential PDF bomb")
        
        return warnings
    
    def _scan_pdf_structure(self, pdf_reader: pypdf.PdfReader) -> List[str]:
        """Scan PDF structure for dangerous features"""
        dangerous_found = []
        
        try:
            # Check PDF trailer for dangerous features
            if hasattr(pdf_reader, 'trailer') and pdf_reader.trailer:
                trailer_str = str(pdf_reader.trailer)
                
                for feature in self.dangerous_features:
                    if feature in trailer_str:
                        dangerous_found.append(feature)
                        logger.warning(f"Dangerous feature detected in trailer: {feature}")
            
            # Check PDF root object
            if hasattr(pdf_reader, 'root_object') and pdf_reader.root_object:
                root_str = str(pdf_reader.root_object)
                
                for feature in self.dangerous_features:
                    if feature in root_str:
                        dangerous_found.append(feature)
                        logger.warning(f"Dangerous feature detected in root: {feature}")
        
        except Exception as e:
            logger.warning(f"Could not scan PDF structure: {e}")
        
        return list(set(dangerous_found))  # Remove duplicates
    
    def _scan_pages_for_javascript(self, pdf_reader: pypdf.PdfReader) -> List[str]:
        """Scan PDF pages for embedded JavaScript"""
        js_threats = []
        
        try:
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    # Check page object for JavaScript
                    page_str = str(page)
                    
                    if '/JavaScript' in page_str or '/JS' in page_str:
                        js_threats.append(f"JavaScript on page {page_num + 1}")
                        logger.warning(f"JavaScript detected on page {page_num + 1}")
                    
                    # Check annotations for JavaScript
                    if '/Annots' in page_str:
                        js_threats.append(f"Potentially dangerous annotations on page {page_num + 1}")
                        logger.warning(f"Annotations detected on page {page_num + 1}")
                
                except Exception as e:
                    logger.warning(f"Could not scan page {page_num + 1}: {e}")
                    continue
        
        except Exception as e:
            logger.warning(f"Could not scan pages for JavaScript: {e}")
        
        return js_threats
    
    def _validate_pdf_structure(self, pdf_reader: pypdf.PdfReader) -> List[str]:
        """Validate PDF structure integrity"""
        warnings = []
        
        try:
            # Check if we can access basic PDF information
            if not hasattr(pdf_reader, 'pages') or len(pdf_reader.pages) == 0:
                warnings.append("PDF has no readable pages")
            
            # Try to read first page to validate structure
            if len(pdf_reader.pages) > 0:
                try:
                    first_page = pdf_reader.pages[0]
                    # Try to extract text to validate page structure
                    text = first_page.extract_text()
                    if text is None:
                        warnings.append("Could not extract text from first page")
                except Exception as e:
                    warnings.append(f"Could not read first page: {e}")
        
        except Exception as e:
            warnings.append(f"PDF structure validation failed: {e}")
        
        return warnings
    
    def _extract_safe_metadata(self, metadata) -> Dict[str, str]:
        """Extract safe metadata fields only"""
        safe_fields = ['/Title', '/Author', '/Subject', '/Creator', '/Producer', '/CreationDate', '/ModDate']
        safe_metadata = {}
        
        for field in safe_fields:
            if field in metadata:
                try:
                    value = str(metadata[field])
                    # Truncate long values
                    if len(value) > 200:
                        value = value[:200] + "..."
                    safe_metadata[field.lstrip('/')] = value
                except Exception:
                    continue
        
        return safe_metadata
    
    def calculate_file_hash(self, file_path: str) -> str:
        """
        Calculate SHA-256 hash of file for integrity checking
        
        Args:
            file_path: Path to file
            
        Returns:
            SHA-256 hash as hex string
        """
        try:
            with open(file_path, 'rb') as f:
                file_hash = hashlib.sha256()
                for chunk in iter(lambda: f.read(4096), b""):
                    file_hash.update(chunk)
                return file_hash.hexdigest()
        except Exception as e:
            logger.error(f"Could not calculate file hash: {e}")
            return ""
    
    def is_pdf_processable(self, file_path: str) -> bool:
        """
        Quick check if PDF is safe and processable
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            True if PDF appears safe to process
        """
        try:
            validation_result = self.validate_pdf_file(file_path)
            return validation_result['valid'] and not validation_result['dangerous_features']
        except Exception:
            return False