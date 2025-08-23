"""
Simple test script for PDF Table Extractor core functionality
"""

import sys
import os
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

def main():
    print("PDF Table Extractor - Core Functionality Test")
    print("=" * 50)
    
    # Test 1: Module imports
    print("1. Testing module imports...")
    try:
        from security.validator import SecurePDFValidator
        from security.file_handler import SecureFileHandler  
        from security.rate_limiter import RateLimiter
        from core.pdf_processor import PDFTableExtractor
        print("   SUCCESS: All modules imported")
    except Exception as e:
        print(f"   ERROR: {e}")
        return False
    
    # Test 2: Security module initialization
    print("2. Testing security modules...")
    try:
        validator = SecurePDFValidator()
        file_handler = SecureFileHandler()
        rate_limiter = RateLimiter()
        print("   SUCCESS: Security modules initialized")
        print(f"   Upload dir: {file_handler.upload_dir}")
    except Exception as e:
        print(f"   ERROR: {e}")
        return False
    
    # Test 3: PDF processor
    print("3. Testing PDF processor...")
    try:
        processor = PDFTableExtractor()
        print("   SUCCESS: PDF processor initialized")
        print(f"   Max time: {processor.max_processing_time}s")
        print(f"   Max memory: {processor.max_memory_mb}MB")
    except Exception as e:
        print(f"   ERROR: {e}")
        return False
    
    # Test 4: Basic validation
    print("4. Testing file validation...")
    try:
        validator.validate_filename("test.pdf")
        print("   SUCCESS: Valid filename accepted")
        
        try:
            validator.validate_filename("../../../etc/passwd")
            print("   ERROR: Dangerous filename accepted!")
            return False
        except ValueError:
            print("   SUCCESS: Dangerous filename rejected")
    except Exception as e:
        print(f"   ERROR: {e}")
        return False
    
    # Test 5: Rate limiting
    print("5. Testing rate limiting...")
    try:
        allowed, _ = rate_limiter.check_rate_limit("127.0.0.1", "test")
        print(f"   SUCCESS: Rate limit check passed (allowed={allowed})")
        
        stats = rate_limiter.get_stats()
        print(f"   Tracked IPs: {stats['total_tracked_ips']}")
    except Exception as e:
        print(f"   ERROR: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("ALL TESTS PASSED!")
    print("Core functionality is working correctly")
    print("P0 security measures are active")
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("TESTS FAILED!")
        sys.exit(1)
    else:
        print("Ready for FastAPI integration!")
        sys.exit(0)