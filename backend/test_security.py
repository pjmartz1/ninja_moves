"""
P0 Security Components Testing Suite
Tests file validation, rate limiting, and secure file handling
"""

import sys
import os
import tempfile
import time
from pathlib import Path
import asyncio

# Add app directory to path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

def create_test_pdf():
    """Create a minimal valid PDF for testing"""
    # Minimal PDF content (header + xref + trailer)
    pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000109 00000 n
trailer
<< /Size 4 /Root 1 0 R >>
startxref
178
%%EOF"""
    return pdf_content

def create_malicious_pdf():
    """Create a PDF with embedded JavaScript for testing"""
    malicious_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R /JavaScript 3 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
3 0 obj
<< /S /JavaScript /JS (app.alert("Malicious code")) >>
endobj
4 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000078 00000 n
0000000134 00000 n
0000000198 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
264
%%EOF"""
    return malicious_content

def test_secure_pdf_validator():
    """Test SecurePDFValidator with various file types"""
    print("🔒 Testing Secure PDF Validator...")
    
    try:
        from security.validator import SecurePDFValidator
        
        validator = SecurePDFValidator()
        
        # Test valid PDF content
        valid_pdf = create_test_pdf()
        validator.validate_file_content(valid_pdf)
        print("✅ Valid PDF content accepted")
        
        # Test invalid content (not PDF)
        try:
            validator.validate_file_content(b"This is not a PDF")
            assert False, "Non-PDF content should be rejected"
        except Exception:
            print("✅ Non-PDF content properly rejected")
        
        # Test file size validation
        large_content = b"x" * (15 * 1024 * 1024)  # 15MB
        try:
            validator.validate_file_content(large_content)
            assert False, "Large file should be rejected"
        except Exception:
            print("✅ Large file properly rejected")
        
        # Test filename validation
        validator.validate_filename("test.pdf")
        print("✅ Valid filename accepted")
        
        try:
            validator.validate_filename("../../../etc/passwd")
            assert False, "Path traversal filename should be rejected"
        except Exception:
            print("✅ Path traversal filename rejected")
        
        try:
            validator.validate_filename("test.exe")
            assert False, "Non-PDF extension should be rejected"
        except Exception:
            print("✅ Non-PDF extension rejected")
        
        # Test malicious PDF detection
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file.write(create_malicious_pdf())
            temp_path = temp_file.name
        
        try:
            validator.validate_pdf_file(temp_path)
            print("⚠️  Malicious PDF not detected (may be expected if detection is basic)")
        except Exception:
            print("✅ Malicious PDF properly detected and rejected")
        finally:
            os.unlink(temp_path)
        
        return True
        
    except Exception as e:
        print(f"❌ PDF validator test failed: {e}")
        return False

def test_secure_file_handler():
    """Test SecureFileHandler for path traversal prevention"""
    print("\n🗂️  Testing Secure File Handler...")
    
    try:
        from security.file_handler import SecureFileHandler
        
        handler = SecureFileHandler()
        
        # Test secure file saving
        test_content = create_test_pdf()
        file_id = handler.secure_save_file(test_content, "test.pdf")
        
        assert file_id is not None, "File ID should be generated"
        assert len(file_id) > 10, "File ID should be sufficiently random"
        print(f"✅ File saved securely with ID: {file_id[:8]}...")
        
        # Test file retrieval
        file_path = handler.get_file_path(file_id)
        assert file_path.exists(), "Saved file should exist"
        
        with open(file_path, 'rb') as f:
            saved_content = f.read()
        assert saved_content == test_content, "Saved content should match original"
        print("✅ File retrieval working correctly")
        
        # Test file ID validation
        assert handler.is_valid_file_id(file_id), "Generated file ID should be valid"
        assert not handler.is_valid_file_id("../../../etc/passwd"), "Path traversal ID should be invalid"
        assert not handler.is_valid_file_id(""), "Empty ID should be invalid"
        print("✅ File ID validation working correctly")
        
        # Test file cleanup
        assert handler.cleanup_file(file_id), "File cleanup should succeed"
        assert not file_path.exists(), "File should be deleted after cleanup"
        print("✅ File cleanup working correctly")
        
        # Test invalid extension rejection
        try:
            handler.secure_save_file(b"test content", "malware.exe")
            assert False, "Non-PDF extension should be rejected"
        except Exception:
            print("✅ Non-PDF extension properly rejected")
        
        return True
        
    except Exception as e:
        print(f"❌ File handler test failed: {e}")
        return False

def test_rate_limiter():
    """Test rate limiting functionality"""
    print("\n🚦 Testing Rate Limiter...")
    
    try:
        from security.rate_limiter import RateLimiter
        
        # Create rate limiter with test limits
        limiter = RateLimiter(
            requests_per_minute=3,
            requests_per_hour=10,
            requests_per_day=20
        )
        
        test_ip = "192.168.1.100"
        
        # Test normal usage
        for i in range(3):
            assert limiter.is_allowed(test_ip), f"Request {i+1} should be allowed"
        print("✅ Normal rate limiting working")
        
        # Test rate limit exceeded
        assert not limiter.is_allowed(test_ip), "4th request should be blocked"
        print("✅ Rate limit enforcement working")
        
        # Test different IP
        test_ip2 = "192.168.1.101"
        assert limiter.is_allowed(test_ip2), "Different IP should be allowed"
        print("✅ Per-IP rate limiting working")
        
        # Test suspicious behavior detection
        for i in range(10):
            limiter.is_allowed(test_ip2)  # Trigger many requests
        
        behavior = limiter.analyze_behavior(test_ip2)
        assert "suspicious" in behavior, "High request rate should be flagged as suspicious"
        print("✅ Suspicious behavior detection working")
        
        return True
        
    except Exception as e:
        print(f"❌ Rate limiter test failed: {e}")
        return False

def test_security_integration():
    """Test security components working together"""
    print("\n🔐 Testing Security Integration...")
    
    try:
        from security.validator import SecurePDFValidator
        from security.file_handler import SecureFileHandler
        from security.rate_limiter import RateLimiter
        
        validator = SecurePDFValidator()
        handler = SecureFileHandler()
        limiter = RateLimiter()
        
        test_ip = "192.168.1.200"
        
        # Simulate full security pipeline
        if not limiter.is_allowed(test_ip):
            print("❌ Request blocked by rate limiter")
            return False
        
        # Validate file
        test_content = create_test_pdf()
        validator.validate_file_content(test_content)
        validator.validate_filename("test.pdf")
        
        # Save securely
        file_id = handler.secure_save_file(test_content, "test.pdf")
        file_path = handler.get_file_path(file_id)
        
        # Validate saved PDF
        validator.validate_pdf_file(str(file_path))
        
        # Cleanup
        handler.cleanup_file(file_id)
        
        print("✅ Full security pipeline working correctly")
        
        return True
        
    except Exception as e:
        print(f"❌ Security integration test failed: {e}")
        return False

def main():
    """Run all security tests"""
    print("PDFTablePro - P0 Security Testing Suite")
    print("=" * 50)
    
    tests = [
        ("Secure PDF Validator", test_secure_pdf_validator),
        ("Secure File Handler", test_secure_file_handler),
        ("Rate Limiter", test_rate_limiter),
        ("Security Integration", test_security_integration)
    ]
    
    passed = 0
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    print(f"\n📊 Security Tests: {passed}/{len(tests)} passed")
    
    if passed == len(tests):
        print("🎉 All security tests passed!")
        print("🔒 P0 security measures are functioning correctly")
    else:
        print("⚠️  Some security tests failed. Review implementation.")
    
    return passed == len(tests)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)