"""
Secure File Handler - P0 Security Implementation
Handles secure file upload, storage, validation, and cleanup with path traversal prevention.
"""

import os
import uuid
import shutil
import tempfile
import logging
from pathlib import Path
from typing import Optional, Set
import time
import threading

logger = logging.getLogger(__name__)

class SecurityError(Exception):
    """Custom security exception for file handling operations"""
    pass

class SecureFileHandler:
    """
    Secure file handler implementing P0 security measures:
    - Path traversal prevention
    - Secure file storage with restricted permissions
    - Automatic file cleanup and expiration
    - File validation and size limits
    """
    
    def __init__(self):
        # Use temp directory for uploads (auto-cleanup on restart)
        self.upload_dir = Path(tempfile.gettempdir()) / "pdf_extractor_uploads"
        self.allowed_extensions = {'.pdf'}
        self.max_file_size_mb = 10
        self.file_expiry_hours = 1  # Files auto-delete after 1 hour
        
        # Thread-safe file tracking
        self._file_registry = {}
        self._registry_lock = threading.Lock()
        
        # Ensure upload directory exists with secure permissions
        self._setup_upload_directory()
        
        # Start cleanup thread
        self._start_cleanup_thread()
    
    def _setup_upload_directory(self):
        """Create upload directory with secure permissions"""
        try:
            self.upload_dir.mkdir(parents=True, exist_ok=True)
            
            # Set restrictive permissions (owner only)
            if os.name != 'nt':  # Unix/Linux
                os.chmod(self.upload_dir, 0o700)
            
            logger.info(f"Upload directory ready: {self.upload_dir}")
            
        except Exception as e:
            logger.error(f"Failed to setup upload directory: {e}")
            raise SecurityError("Could not initialize secure file storage")
    
    def secure_save_file(self, file_content: bytes, original_filename: str) -> str:
        """
        Securely save uploaded file with P0 security validation
        
        Args:
            file_content: Raw file bytes
            original_filename: Original filename from upload
            
        Returns:
            Unique file ID for retrieval
            
        Raises:
            SecurityError: If security validation fails
            ValueError: If file validation fails
        """
        # P0 Security: Validate file size
        if len(file_content) > self.max_file_size_mb * 1024 * 1024:
            raise ValueError(f"File too large (max {self.max_file_size_mb}MB)")
        
        # P0 Security: Validate filename
        self._validate_filename(original_filename)
        
        # Generate secure random file ID
        file_id = str(uuid.uuid4())
        
        # Get file extension
        _, ext = os.path.splitext(original_filename)
        if ext.lower() not in self.allowed_extensions:
            raise ValueError(f"Invalid file extension. Allowed: {self.allowed_extensions}")
        
        # Create secure filename
        secure_filename = f"{file_id}{ext}"
        file_path = self.upload_dir / secure_filename
        
        # P0 Security: Ensure path is within upload directory
        if not self._is_safe_path(file_path):
            raise SecurityError("Path traversal attempt detected")
        
        try:
            # Write file with restricted permissions
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            # Set restrictive file permissions (owner read/write only)
            if os.name != 'nt':  # Unix/Linux
                os.chmod(file_path, 0o600)
            
            # Register file for tracking and cleanup
            with self._registry_lock:
                self._file_registry[file_id] = {
                    'path': file_path,
                    'created_at': time.time(),
                    'original_name': original_filename,
                    'size': len(file_content)
                }
            
            logger.info(f"Securely saved file: {file_id} ({len(file_content)} bytes)")
            return file_id
            
        except Exception as e:
            # Cleanup on failure
            if file_path.exists():
                try:
                    file_path.unlink()
                except:
                    pass
            logger.error(f"Failed to save file {original_filename}: {e}")
            raise SecurityError("Failed to save file securely")
    
    def get_file_path(self, file_id: str) -> Optional[Path]:
        """
        Get secure path to uploaded file
        
        Args:
            file_id: Unique file identifier
            
        Returns:
            Path to file or None if not found/expired
        """
        if not self.is_valid_file_id(file_id):
            return None
        
        with self._registry_lock:
            file_info = self._file_registry.get(file_id)
        
        if not file_info:
            return None
        
        file_path = file_info['path']
        
        # Check if file still exists
        if not file_path.exists():
            self._remove_from_registry(file_id)
            return None
        
        # Check if file has expired
        if self._is_file_expired(file_info):
            self.cleanup_file(file_id)
            return None
        
        return file_path
    
    def get_export_file_path(self, file_id: str, format: str) -> Optional[Path]:
        """
        Get path to exported file (CSV, Excel, JSON)
        
        Args:
            file_id: Original file identifier
            format: Export format
            
        Returns:
            Path to export file or None if not found
        """
        if not self.is_valid_file_id(file_id):
            return None
        
        # Look for export file in upload directory
        export_patterns = {
            'csv': f"extracted_table*{file_id}*.csv",
            'excel': f"extracted_tables*{file_id}*.xlsx", 
            'json': f"extracted_tables*{file_id}*.json"
        }
        
        pattern = export_patterns.get(format)
        if not pattern:
            return None
        
        # Find matching export files
        matching_files = list(self.upload_dir.glob(pattern))
        
        if matching_files:
            # Return the first match (most recent)
            return matching_files[0]
        
        return None
    
    def is_valid_file_id(self, file_id: str) -> bool:
        """
        Validate file ID format (security check)
        
        Args:
            file_id: File identifier to validate
            
        Returns:
            True if valid UUID format
        """
        try:
            uuid.UUID(file_id)
            return True
        except (ValueError, TypeError):
            return False
    
    def cleanup_file(self, file_id: str) -> bool:
        """
        Manually cleanup file and associated exports
        
        Args:
            file_id: File identifier to cleanup
            
        Returns:
            True if cleanup successful
        """
        try:
            with self._registry_lock:
                file_info = self._file_registry.get(file_id)
            
            if not file_info:
                return False
            
            file_path = file_info['path']
            
            # Remove original file
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Cleaned up file: {file_id}")
            
            # Remove any export files for this file_id
            self._cleanup_export_files(file_id)
            
            # Remove from registry
            self._remove_from_registry(file_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to cleanup file {file_id}: {e}")
            return False
    
    def _validate_filename(self, filename: str):
        """
        Validate filename for security (P0 Security)
        
        Args:
            filename: Original filename to validate
            
        Raises:
            ValueError: If filename is invalid
        """
        if not filename:
            raise ValueError("Filename cannot be empty")
        
        if len(filename) > 255:
            raise ValueError("Filename too long")
        
        # Remove path components (security)
        filename = os.path.basename(filename)
        
        # Check for dangerous characters
        dangerous_chars = ['..', '/', '\\', ':', '*', '?', '"', '<', '>', '|']
        for char in dangerous_chars:
            if char in filename:
                raise ValueError(f"Invalid character in filename: {char}")
        
        # Check for null bytes
        if '\x00' in filename:
            raise ValueError("Null bytes not allowed in filename")
        
        # Check for reserved names (Windows)
        reserved_names = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 
                         'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 
                         'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
        
        name_without_ext = os.path.splitext(filename)[0].upper()
        if name_without_ext in reserved_names:
            raise ValueError(f"Reserved filename: {filename}")
    
    def _is_safe_path(self, file_path: Path) -> bool:
        """
        Check if file path is safe (within upload directory)
        
        Args:
            file_path: Path to validate
            
        Returns:
            True if path is safe
        """
        try:
            # Resolve both paths to handle symlinks and relative paths
            resolved_file_path = file_path.resolve()
            resolved_upload_dir = self.upload_dir.resolve()
            
            # Check if file path is within upload directory
            return resolved_file_path.is_relative_to(resolved_upload_dir)
            
        except Exception:
            # If resolution fails, assume unsafe
            return False
    
    def _is_file_expired(self, file_info: dict) -> bool:
        """
        Check if file has expired based on age
        
        Args:
            file_info: File registry entry
            
        Returns:
            True if file has expired
        """
        created_at = file_info['created_at']
        expiry_time = created_at + (self.file_expiry_hours * 3600)
        return time.time() > expiry_time
    
    def _remove_from_registry(self, file_id: str):
        """Remove file from tracking registry"""
        with self._registry_lock:
            self._file_registry.pop(file_id, None)
    
    def _cleanup_export_files(self, file_id: str):
        """Remove export files associated with file_id"""
        try:
            patterns = [
                f"*{file_id}*.csv",
                f"*{file_id}*.xlsx", 
                f"*{file_id}*.json",
                f"*{file_id}*.zip"
            ]
            
            for pattern in patterns:
                for export_file in self.upload_dir.glob(pattern):
                    try:
                        export_file.unlink()
                        logger.debug(f"Cleaned up export file: {export_file.name}")
                    except Exception as e:
                        logger.warning(f"Failed to cleanup export file {export_file}: {e}")
                        
        except Exception as e:
            logger.error(f"Error cleaning up export files for {file_id}: {e}")
    
    def _start_cleanup_thread(self):
        """Start background thread for automatic file cleanup"""
        def cleanup_worker():
            while True:
                try:
                    self._periodic_cleanup()
                    time.sleep(300)  # Run every 5 minutes
                except Exception as e:
                    logger.error(f"Cleanup thread error: {e}")
                    time.sleep(60)  # Wait 1 minute on error
        
        cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
        cleanup_thread.start()
        logger.info("File cleanup thread started")
    
    def _periodic_cleanup(self):
        """Periodic cleanup of expired files"""
        expired_files = []
        
        with self._registry_lock:
            for file_id, file_info in list(self._file_registry.items()):
                if self._is_file_expired(file_info):
                    expired_files.append(file_id)
        
        # Cleanup expired files
        for file_id in expired_files:
            self.cleanup_file(file_id)
        
        # Also cleanup any orphaned files in upload directory
        self._cleanup_orphaned_files()
        
        if expired_files:
            logger.info(f"Cleaned up {len(expired_files)} expired files")
    
    def _cleanup_orphaned_files(self):
        """Remove files that exist on disk but not in registry"""
        try:
            if not self.upload_dir.exists():
                return
            
            for file_path in self.upload_dir.iterdir():
                if file_path.is_file():
                    # Check if file is older than expiry time
                    file_age = time.time() - file_path.stat().st_mtime
                    if file_age > (self.file_expiry_hours * 3600):
                        try:
                            file_path.unlink()
                            logger.debug(f"Cleaned up orphaned file: {file_path.name}")
                        except Exception as e:
                            logger.warning(f"Failed to cleanup orphaned file {file_path}: {e}")
                            
        except Exception as e:
            logger.error(f"Error cleaning up orphaned files: {e}")
    
    def get_stats(self) -> dict:
        """Get file handler statistics"""
        with self._registry_lock:
            total_files = len(self._file_registry)
            total_size = sum(info['size'] for info in self._file_registry.values())
        
        return {
            'total_files': total_files,
            'total_size_bytes': total_size,
            'upload_dir': str(self.upload_dir),
            'max_file_size_mb': self.max_file_size_mb,
            'file_expiry_hours': self.file_expiry_hours
        }