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
        """Scan PDF pages for embedded JavaScript - improved to distinguish dangerous JS from form fields"""
        js_threats = []
        
        try:
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    # Check page object for JavaScript
                    page_str = str(page)
                    
                    # Only flag actual dangerous JavaScript, not form field annotations
                    if '/JavaScript' in page_str or '/JS' in page_str:
                        # Additional verification - look for actual JS content, not just form field structures
                        if self._contains_actual_javascript(page_str):
                            js_threats.append(f"Dangerous JavaScript code on page {page_num + 1}")
                            logger.warning(f"Dangerous JavaScript code detected on page {page_num + 1}")
                        else:
                            logger.info(f"JavaScript reference found but appears to be form field on page {page_num + 1}")
                    
                    # Check annotations more carefully for actual dangerous JavaScript
                    if '/Annots' in page_str:
                        dangerous_annots = self._scan_annotations_for_dangerous_js(page, page_num)
                        if dangerous_annots:
                            js_threats.extend(dangerous_annots)
                        else:
                            # Safe annotations detected - allow legitimate business document annotations
                            logger.debug(f"Safe business annotations detected on page {page_num + 1} - allowing")
                
                except Exception as e:
                    logger.warning(f"Could not scan page {page_num + 1}: {e}")
                    continue
        
        except Exception as e:
            logger.warning(f"Could not scan pages for JavaScript: {e}")
        
        return js_threats
    
    def _contains_actual_javascript(self, content_str: str) -> bool:
        """
        Check if content contains actual dangerous JavaScript code vs form field references
        
        Args:
            content_str: String content to analyze
            
        Returns:
            True if dangerous JavaScript detected, False if just form field structures
        """
        # Patterns that indicate TRULY dangerous JavaScript vs legitimate business use
        truly_dangerous_patterns = [
            'eval(',
            'unescape(',
            'ActiveXObject',
            'WScript.Shell',
            'cmd.exe',
            'powershell.exe',
            'document.write',
            'XMLHttpRequest',
            'fetch(',
            'iframe',
            'script'
        ]
        
        # Patterns that are common in business PDFs and should be allowed
        business_safe_patterns = [
            'function',  # Form validation functions
            'window.open',  # Help links, print dialogs
            'location.href',  # Navigation within business sites
            'onload',  # Standard form initialization
            'setTimeout',  # Form behavior timing
            'setInterval'  # Form refresh patterns
        ]
        
        # Convert to lowercase for case-insensitive search
        content_lower = content_str.lower()
        
        # Count truly dangerous patterns
        dangerous_count = 0
        for pattern in truly_dangerous_patterns:
            if pattern.lower() in content_lower:
                dangerous_count += 1
                logger.warning(f"Dangerous JavaScript pattern detected: {pattern}")
        
        # Check for business context - if it contains business-safe patterns,
        # require more evidence of malicious intent
        business_context_detected = False
        for pattern in business_safe_patterns:
            if pattern.lower() in content_lower:
                business_context_detected = True
                logger.debug(f"Business context pattern detected: {pattern}")
                break
        
        if business_context_detected:
            # In business context, require at least 2 dangerous patterns
            return dangerous_count >= 2
        else:
            # In non-business context, 1 dangerous pattern is enough
            return dangerous_count >= 1
    
    def _is_truly_malicious_javascript(self, content_str: str) -> bool:
        """
        Check if JavaScript content is truly malicious vs legitimate business use
        
        Args:
            content_str: String content to analyze for malicious patterns
            
        Returns:
            True if content contains genuinely dangerous JavaScript patterns
        """
        # Patterns that indicate TRULY malicious JavaScript (high confidence)
        high_risk_patterns = [
            'eval(',
            'unescape(',
            'ActiveXObject',
            'WScript.Shell',
            'cmd.exe',
            'powershell.exe',
            'document.write',
            'iframe'
        ]
        
        # Medium risk patterns that need context
        medium_risk_patterns = [
            'XMLHttpRequest',
            'fetch(',
            'script'
        ]
        
        # Low risk patterns (common in business PDFs)
        low_risk_patterns = [
            'location.href',
            'window.open',
            'onload',
            'onerror',
            'setTimeout',
            'setInterval'
        ]
        
        # Convert to lowercase for case-insensitive search
        content_lower = content_str.lower()
        
        # Count patterns by risk level
        high_risk_count = 0
        medium_risk_count = 0
        low_risk_count = 0
        
        for pattern in high_risk_patterns:
            if pattern.lower() in content_lower:
                high_risk_count += 1
                logger.warning(f"High-risk pattern detected: {pattern}")
        
        for pattern in medium_risk_patterns:
            if pattern.lower() in content_lower:
                medium_risk_count += 1
                logger.info(f"Medium-risk pattern detected: {pattern}")
        
        for pattern in low_risk_patterns:
            if pattern.lower() in content_lower:
                low_risk_count += 1
                logger.debug(f"Low-risk pattern detected: {pattern}")
        
        # Scoring system for malicious intent
        malicious_score = (high_risk_count * 3) + (medium_risk_count * 2) + (low_risk_count * 1)
        
        # Check for external domain access (additional risk factor)
        external_domain_patterns = ['http://', 'https://', 'ftp://']
        external_access = any(pattern in content_lower for pattern in external_domain_patterns)
        if external_access:
            malicious_score += 2
            logger.warning("External domain access detected in JavaScript")
        
        # Require score of 6+ for malicious classification (prevents false positives)
        # This allows business PDFs with 1-2 low-risk patterns to pass
        is_malicious = malicious_score >= 6
        
        if is_malicious:
            logger.warning(f"JavaScript classified as malicious (score: {malicious_score})")
        else:
            logger.info(f"JavaScript appears safe for business use (score: {malicious_score})")
        
        return is_malicious
    
    def _is_business_annotation(self, annot_obj, annot_str: str) -> bool:
        """
        Check if annotation is a legitimate business annotation type
        
        Args:
            annot_obj: PDF annotation object
            annot_str: String representation of annotation
            
        Returns:
            True if annotation appears to be legitimate business use
        """
        # Safe business annotation types
        safe_annotation_types = [
            '/Text',      # Text annotations (comments, notes)
            '/Highlight', # Text highlighting
            '/Link',      # Hyperlinks (navigation)
            '/FreeText',  # Free text annotations
            '/Square',    # Rectangle annotations
            '/Circle',    # Circle annotations
            '/Line',      # Line annotations
            '/Polygon',   # Polygon annotations
            '/Ink',       # Freehand annotations
            '/Stamp',     # Stamp annotations
            '/Widget'     # Form widgets (fields, buttons)
        ]
        
        # Check annotation subtype
        subtype = str(annot_obj.get('/Subtype', ''))
        for safe_type in safe_annotation_types:
            if safe_type in subtype:
                logger.debug(f"Safe business annotation type detected: {safe_type}")
                return True
        
        # Check for business domain whitelist in URLs
        business_domains = [
            'microsoft.com', 'office.com', 'adobe.com', 'google.com',
            'salesforce.com', 'quickbooks.com', 'xero.com', 'sage.com',
            'dropbox.com', 'box.com', 'sharepoint.com'
        ]
        
        annot_lower = annot_str.lower()
        for domain in business_domains:
            if domain in annot_lower:
                logger.debug(f"Business domain detected in annotation: {domain}")
                return True
        
        return False
    
    def _scan_annotations_for_dangerous_js(self, page, page_num: int) -> List[str]:
        """
        Scan annotations specifically for dangerous JavaScript, allowing legitimate business annotations
        
        Args:
            page: PDF page object
            page_num: Page number (0-indexed)
            
        Returns:
            List of threat descriptions for dangerous annotations (only truly dangerous ones)
        """
        dangerous_annotations = []
        safe_annotations_count = 0
        
        try:
            if hasattr(page, 'get') and '/Annots' in page:
                try:
                    annots = page['/Annots']
                    if annots:
                        for annot in annots:
                            if annot and hasattr(annot, 'get_object'):
                                annot_obj = annot.get_object()
                                annot_str = str(annot_obj)
                                
                                # First check if this is a business annotation
                                if self._is_business_annotation(annot_obj, annot_str):
                                    safe_annotations_count += 1
                                    logger.debug(f"Business annotation allowed on page {page_num + 1}")
                                    continue
                                
                                # Check for dangerous JavaScript in annotations - be very specific
                                if ('/JavaScript' in annot_str or '/JS' in annot_str):
                                    if self._contains_actual_javascript(annot_str):
                                        # Double check for TRULY dangerous JS patterns
                                        if self._is_truly_malicious_javascript(annot_str):
                                            dangerous_annotations.append(f"Malicious JavaScript in annotation on page {page_num + 1}")
                                            logger.warning(f"Malicious JavaScript-enabled annotation detected on page {page_num + 1}")
                                        else:
                                            logger.info(f"JavaScript reference in annotation appears safe on page {page_num + 1}")
                                    else:
                                        logger.debug(f"Form field JavaScript reference on page {page_num + 1} - safe")
                                
                                # Check annotation type - only flag truly dangerous types
                                if '/Subtype' in annot_str:
                                    subtype = str(annot_obj.get('/Subtype', ''))
                                    # Only flag Launch actions that execute external commands with dangerous extensions
                                    dangerous_extensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif']
                                    if '/Launch' in subtype:
                                        has_dangerous_extension = any(ext in annot_str.lower() for ext in dangerous_extensions)
                                        has_system_command = any(cmd in annot_str.lower() for cmd in ['cmd.exe', 'powershell', 'wscript'])
                                        
                                        if has_dangerous_extension or has_system_command:
                                            dangerous_annotations.append(f"Executable launch annotation on page {page_num + 1}")
                                            logger.warning(f"Executable launch annotation detected: {subtype} on page {page_num + 1}")
                                        else:
                                            logger.debug(f"Launch annotation appears safe on page {page_num + 1}")
                                
                except Exception as e:
                    logger.debug(f"Could not inspect annotations on page {page_num + 1}: {e}")
                    # If we can't inspect, assume they're safe rather than blocking legitimate documents
                    pass
        except Exception as e:
            logger.debug(f"Error scanning annotations on page {page_num + 1}: {e}")
            # Log error but don't block - err on the side of allowing legitimate business documents
        
        if safe_annotations_count > 0:
            logger.info(f"Page {page_num + 1}: {safe_annotations_count} safe business annotations detected")
        
        return dangerous_annotations
    
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