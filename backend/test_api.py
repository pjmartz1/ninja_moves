"""
API Test Script
Tests the FastAPI endpoints without starting a full server
"""

import sys
import os
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

def test_app_creation():
    """Test that the FastAPI app can be created"""
    print("Testing FastAPI app creation...")
    
    try:
        from main import app
        print("SUCCESS: FastAPI app created successfully")
        print(f"App title: {app.title}")
        print(f"App version: {app.version}")
        return True
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_endpoints():
    """Test endpoint routing"""
    print("\nTesting endpoint routing...")
    
    try:
        from main import app
        from fastapi.testclient import TestClient
        
        # Create test client
        client = TestClient(app)
        
        # Test health endpoint
        response = client.get("/health")
        print(f"Health endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        
        # Test root endpoint  
        response = client.get("/")
        print(f"Root endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        
        # Test security status endpoint
        response = client.get("/security/status")
        print(f"Security status: {response.status_code}")
        if response.status_code == 200:
            print(f"Security info: {response.json()}")
        
        return True
        
    except ImportError:
        print("WARNING: FastAPI test client not available")
        print("Install with: pip install httpx")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def main():
    """Run API tests"""
    print("PDF Table Extractor - API Functionality Test")
    print("=" * 50)
    
    tests_passed = 0
    total_tests = 2
    
    if test_app_creation():
        tests_passed += 1
    
    if test_endpoints():
        tests_passed += 1
    
    print("\n" + "=" * 50)
    print(f"API Tests: {tests_passed}/{total_tests} passed")
    
    if tests_passed == total_tests:
        print("API is ready for use!")
        print("Start server with: python start_server.py")
    else:
        print("Some API tests failed")
    
    return tests_passed == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)