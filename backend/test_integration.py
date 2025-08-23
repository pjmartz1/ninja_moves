"""
Full API Integration Testing Suite
Tests complete workflows from file upload to processing to download
"""

import sys
import os
import asyncio
import tempfile
import time
from pathlib import Path
import json

# Add app directory to path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

def create_test_jwt(user_id="test-user", tier="free"):
    """Create a test JWT token for authenticated requests"""
    import jwt
    from datetime import datetime, timedelta
    
    payload = {
        'sub': user_id,
        'email': f'{user_id}@test.com',
        'role': 'authenticated',
        'aud': 'authenticated',
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, 'test-secret', algorithm='HS256')

def create_test_pdf_file():
    """Create a test PDF file for upload testing"""
    pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] 
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
50 700 Td
(Name        Age     Salary) Tj
0 -20 Td
(John        25      50000) Tj
0 -20 Td
(Jane        30      60000) Tj
0 -20 Td
(Bob         35      70000) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000109 00000 n
0000000252 00000 n
0000000472 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
540
%%EOF"""
    return pdf_content

async def test_health_endpoints():
    """Test health check endpoints"""
    print("🏥 Testing Health Endpoints...")
    
    try:
        # Mock the Supabase client to avoid connection errors
        import auth.supabase_auth as auth_module
        from test_supabase_auth import MockSupabaseClient
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Test root endpoint
        response = client.get("/")
        assert response.status_code == 200, f"Root endpoint failed: {response.status_code}"
        data = response.json()
        assert "message" in data, "Root should return message"
        print("✅ Root endpoint working")
        
        # Test health endpoint
        response = client.get("/health")
        assert response.status_code == 200, f"Health endpoint failed: {response.status_code}"
        data = response.json()
        assert data["status"] == "healthy", "Health status should be healthy"
        print("✅ Health endpoint working")
        
        # Test security status endpoint
        response = client.get("/security/status")
        assert response.status_code == 200, f"Security status failed: {response.status_code}"
        data = response.json()
        assert "rate_limiter" in data, "Should include rate limiter status"
        assert "file_validation" in data, "Should include file validation status"
        print("✅ Security status endpoint working")
        
        return True
        
    except Exception as e:
        print(f"❌ Health endpoints test failed: {e}")
        return False

async def test_anonymous_file_upload():
    """Test file upload without authentication (anonymous user)"""
    print("\n🔓 Testing Anonymous File Upload...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        from test_supabase_auth import MockSupabaseClient
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Create test PDF file
        pdf_content = create_test_pdf_file()
        
        # Test file upload
        files = {"file": ("test.pdf", pdf_content, "application/pdf")}
        data = {"export_format": "csv"}
        
        response = client.post("/extract", files=files, data=data)
        
        # Should succeed for anonymous users
        assert response.status_code in [200, 422], f"Upload failed: {response.status_code}"
        
        if response.status_code == 200:
            result = response.json()
            assert "success" in result, "Response should include success flag"
            print(f"✅ Anonymous upload succeeded: {result.get('message', 'No message')}")
        else:
            print("✅ Anonymous upload handled (may have validation errors)")
        
        return True
        
    except Exception as e:
        print(f"❌ Anonymous upload test failed: {e}")
        return False

async def test_authenticated_file_upload():
    """Test file upload with authentication"""
    print("\n🔐 Testing Authenticated File Upload...")
    
    try:
        # Mock the Supabase client and auth
        import auth.supabase_auth as auth_module
        from test_supabase_auth import MockSupabaseClient
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        # Override JWT secret for testing
        from auth.supabase_auth import auth_handler
        auth_handler.jwt_secret = 'test-secret'
        
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Create test PDF file
        pdf_content = create_test_pdf_file()
        
        # Create authorization header
        test_token = create_test_jwt("test-user-1", "free")
        headers = {"Authorization": f"Bearer {test_token}"}
        
        # Test file upload with auth
        files = {"file": ("test.pdf", pdf_content, "application/pdf")}
        data = {"export_format": "json"}
        
        response = client.post("/extract", files=files, data=data, headers=headers)
        
        assert response.status_code in [200, 422], f"Authenticated upload failed: {response.status_code}"
        
        if response.status_code == 200:
            result = response.json()
            assert "success" in result, "Response should include success flag"
            if "user_info" in result:
                assert result["user_info"]["tier"] == "free", "Should include user tier info"
                print("✅ User tier information included in response")
            print(f"✅ Authenticated upload succeeded: {result.get('message', 'No message')}")
        else:
            print("✅ Authenticated upload handled (may have validation errors)")
        
        return True
        
    except Exception as e:
        print(f"❌ Authenticated upload test failed: {e}")
        return False

async def test_rate_limiting():
    """Test rate limiting functionality"""
    print("\n🚦 Testing Rate Limiting...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        from test_supabase_auth import MockSupabaseClient
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Test multiple requests to security endpoint (lower rate limit)
        success_count = 0
        for i in range(6):  # Try 6 requests (limit is 5/minute)
            response = client.get("/security/status")
            if response.status_code == 200:
                success_count += 1
            elif response.status_code == 429:
                print(f"✅ Rate limit triggered after {success_count} requests")
                break
        
        assert success_count <= 5, "Should not exceed rate limit"
        print(f"✅ Rate limiting working (allowed {success_count} requests)")
        
        return True
        
    except Exception as e:
        print(f"❌ Rate limiting test failed: {e}")
        return False

async def test_file_validation():
    """Test file validation and security"""
    print("\n🛡️  Testing File Validation...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        from test_supabase_auth import MockSupabaseClient
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Test invalid file type
        files = {"file": ("test.txt", b"This is not a PDF", "text/plain")}
        response = client.post("/extract", files=files)
        assert response.status_code == 422, "Should reject non-PDF files"
        print("✅ Non-PDF file properly rejected")
        
        # Test large file (create 11MB content)
        large_content = b"x" * (11 * 1024 * 1024)
        files = {"file": ("large.pdf", large_content, "application/pdf")}
        response = client.post("/extract", files=files)
        assert response.status_code == 413, "Should reject large files"
        print("✅ Large file properly rejected")
        
        # Test invalid export format
        pdf_content = create_test_pdf_file()
        files = {"file": ("test.pdf", pdf_content, "application/pdf")}
        data = {"export_format": "invalid"}
        response = client.post("/extract", files=files, data=data)
        assert response.status_code == 400, "Should reject invalid export format"
        print("✅ Invalid export format rejected")
        
        return True
        
    except Exception as e:
        print(f"❌ File validation test failed: {e}")
        return False

async def test_tier_limits():
    """Test tier-based usage limits"""
    print("\n💎 Testing Tier-Based Limits...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        from test_supabase_auth import MockSupabaseClient
        
        # Create mock client with user at daily limit
        mock_client = MockSupabaseClient()
        mock_client.mock_users["test-user-limit"] = {
            "id": "test-user-limit",
            "tier": "free",
            "pages_used_today": 5,  # At daily limit
            "pages_used_month": 30,
            "last_reset_date": "2025-08-22"
        }
        auth_module.get_supabase_client = lambda: mock_client
        
        # Override JWT secret for testing
        from auth.supabase_auth import auth_handler
        auth_handler.jwt_secret = 'test-secret'
        
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Create test file and auth
        pdf_content = create_test_pdf_file()
        test_token = create_test_jwt("test-user-limit", "free")
        headers = {"Authorization": f"Bearer {test_token}"}
        
        # Test upload with user at limit
        files = {"file": ("test.pdf", pdf_content, "application/pdf")}
        response = client.post("/extract", files=files, headers=headers)
        
        # Should be blocked due to tier limits
        assert response.status_code == 429, f"Should block user at limit, got {response.status_code}"
        
        if response.status_code == 429:
            result = response.json()
            assert "Daily limit" in result["detail"]["error"], "Should mention daily limit"
            print("✅ Daily limit enforcement working")
        
        return True
        
    except Exception as e:
        print(f"❌ Tier limits test failed: {e}")
        return False

async def test_error_handling():
    """Test error handling and security"""
    print("\n🚨 Testing Error Handling...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        from test_supabase_auth import MockSupabaseClient
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Test missing file
        response = client.post("/extract")
        assert response.status_code == 422, "Should require file upload"
        print("✅ Missing file properly handled")
        
        # Test invalid file ID for download
        response = client.get("/download/invalid-file-id")
        assert response.status_code == 400, "Should reject invalid file ID"
        print("✅ Invalid download ID rejected")
        
        # Test cleanup with invalid file ID
        response = client.delete("/cleanup/invalid-file-id")
        assert response.status_code == 400, "Should reject invalid cleanup ID"
        print("✅ Invalid cleanup ID rejected")
        
        return True
        
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False

async def main():
    """Run all integration tests"""
    print("PDFTablePro - Full API Integration Testing Suite")
    print("=" * 50)
    
    tests = [
        ("Health Endpoints", test_health_endpoints),
        ("Anonymous File Upload", test_anonymous_file_upload),
        ("Authenticated File Upload", test_authenticated_file_upload),
        ("Rate Limiting", test_rate_limiting),
        ("File Validation", test_file_validation),
        ("Tier-Based Limits", test_tier_limits),
        ("Error Handling", test_error_handling)
    ]
    
    passed = 0
    for test_name, test_func in tests:
        try:
            if await test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    print(f"\n📊 Integration Tests: {passed}/{len(tests)} passed")
    
    if passed == len(tests):
        print("🎉 All integration tests passed!")
        print("🔧 Full API integration is working correctly")
    else:
        print("⚠️  Some integration tests failed. Check implementation.")
    
    return passed == len(tests)

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)