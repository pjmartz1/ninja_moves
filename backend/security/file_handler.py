"""
P0 Security: Secure File Handler
Critical path traversal prevention and secure file operations
"""

import os
import uuid
import tempfile
from pathlib import Path
from typing import Optional, Tuple
from .validator import SecurityError


class SecureFileHandler:
    """P0 Security: Prevent path traversal attacks"""
    
    def __init__(self):
        # Use system temp directory for security
        self.upload_dir = Path(tempfile.gettempdir()) / "pdftable_uploads"
        self.upload_dir.mkdir(exist_ok=True)
        self.allowed_extensions = {'.pdf'}
        
    def secure_save_file(self, file_content: bytes, original_filename: str) -> Tuple[str, str]:
        """Critical: Prevent path traversal attacks"""
        try:
            # Generate random filename
            file_id = str(uuid.uuid4())
            
            # Validate extension
            _, ext = os.path.splitext(original_filename)
            if ext.lower() not in self.allowed_extensions:
                raise SecurityError("Invalid file extension")
            
            # Create secure path
            secure_filename = f"{file_id}{ext}"
            file_path = self.upload_dir / secure_filename
            
            # Ensure path is within upload directory
            if not file_path.resolve().is_relative_to(self.upload_dir.resolve()):
                raise SecurityError("Path traversal attempt detected")
            
            # Write with restricted permissions
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            # Set restrictive file permissions (owner read/write only)
            os.chmod(file_path, 0o600)
            
            return file_id, str(file_path)
            
        except Exception as e:
            raise SecurityError(f"Secure file save failed: {str(e)}")
    
    def secure_delete_file(self, file_path: str) -> bool:
        """Securely delete file after processing"""
        try:
            if os.path.exists(file_path):
                # Verify file is in our upload directory
                path_obj = Path(file_path)
                if not path_obj.resolve().is_relative_to(self.upload_dir.resolve()):
                    raise SecurityError("Attempted to delete file outside upload directory")
                
                # Overwrite with zeros before deletion (basic)
                with open(file_path, 'r+b') as f:
                    length = f.tell()
                    f.seek(0)
                    f.write(b'\x00' * length)
                
                os.remove(file_path)
                return True
            return False
            
        except Exception as e:
            print(f"Error deleting file {file_path}: {str(e)}")
            return False
    
    def cleanup_old_files(self, max_age_hours: int = 1) -> int:
        """Auto-cleanup files older than max_age_hours"""
        import time
        
        cleaned_count = 0
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        try:
            for file_path in self.upload_dir.glob("*"):
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > max_age_seconds:
                        if self.secure_delete_file(str(file_path)):
                            cleaned_count += 1
                            
        except Exception as e:
            print(f"Error during cleanup: {str(e)}")
            
        return cleaned_count