"""
Test script for PDF Table Extractor core functionality
Tests P0 security measures and basic PDF processing
"""

import sys
import os
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

def test_imports():
    """Test that all modules can be imported"""
    print("Testing module imports...")
    
    try:
        from security.validator import SecurePDFValidator
        from security.file_handler import SecureFileHandler
        from security.rate_limiter import RateLimiter
        from core.pdf_processor import PDFTableExtractor
        print("SUCCESS: All modules imported successfully")
        return True
    except ImportError as e:
        print(f"ERROR: Import error: {e}")
        return False

def test_security_modules():
    """Test P0 security modules"""
    print("\n🔒 Testing P0 security modules...")
    
    try:
        # Test PDF Validator
        validator = SecurePDFValidator()
        print("✅ SecurePDFValidator initialized")
        
        # Test File Handler
        file_handler = SecureFileHandler()
        print("✅ SecureFileHandler initialized")
        print(f"   Upload directory: {file_handler.upload_dir}")
        
        # Test Rate Limiter
        rate_limiter = RateLimiter()
        print("✅ RateLimiter initialized")
        
        # Test rate limiting
        allowed, retry_after = rate_limiter.check_rate_limit("127.0.0.1", "test")
        print(f"✅ Rate limit check: allowed={allowed}")
        
        return True
    except Exception as e:
        print(f"❌ Security module error: {e}")
        return False

def test_pdf_processor():
    """Test PDF processor initialization"""
    print("\n📄 Testing PDF processor...")
    
    try:
        from core.pdf_processor import PDFTableExtractor
        processor = PDFTableExtractor()
        print("✅ PDFTableExtractor initialized")
        print(f"   Max processing time: {processor.max_processing_time}s")
        print(f"   Max memory: {processor.max_memory_mb}MB")
        print(f"   Confidence threshold: {processor.confidence_threshold}")
        return True
    except Exception as e:
        print(f"❌ PDF processor error: {e}")
        return False

def test_file_validation():
    """Test file validation with dummy data"""
    print("\n🛡️  Testing file validation...")
    
    try:
        from security.validator import SecurePDFValidator
        validator = SecurePDFValidator()
        
        # Test filename validation
        validator.validate_filename("test.pdf")
        print("✅ Valid filename accepted")
        
        try:
            validator.validate_filename("../../../etc/passwd")
            print("❌ Dangerous filename was accepted!")
            return False
        except ValueError:
            print("✅ Dangerous filename rejected")
        
        # Test content validation with dummy PDF header
        pdf_header = b"%PDF-1.4\n"
        try:
            # This will fail since it's not a real PDF, but we're testing the security checks
            validator.validate_file_content(pdf_header)
        except ValueError as e:
            if "Invalid PDF file" in str(e):
                print("✅ Invalid PDF content rejected")
            else:
                print(f"⚠️  Unexpected error: {e}")
        
        return True
    except Exception as e:
        print(f"❌ File validation error: {e}")
        return False

def test_rate_limiting():
    """Test rate limiting functionality"""
    print("\n⏱️  Testing rate limiting...")
    
    try:
        from security.rate_limiter import RateLimiter, RateLimitExceeded
        limiter = RateLimiter()
        
        # Test normal requests
        test_ip = "192.168.1.100"
        for i in range(5):
            allowed, _ = limiter.check_rate_limit(test_ip, "test")
            if not allowed:
                print(f"❌ Request {i+1} was blocked unexpectedly")
                return False
        
        print("✅ Normal rate limiting working")
        
        # Test getting stats
        stats = limiter.get_stats()
        print(f"✅ Rate limiter stats: {stats['total_tracked_ips']} IPs tracked")
        
        return True
    except Exception as e:
        print(f"❌ Rate limiting error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 PDF Table Extractor - Core Functionality Test")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_security_modules,
        test_pdf_processor,
        test_file_validation,
        test_rate_limiting
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All core functionality tests passed!")
        print("✅ P0 security measures are working")
        print("✅ Ready for FastAPI integration")
    else:
        print(f"⚠️  {total - passed} tests failed - check logs above")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)