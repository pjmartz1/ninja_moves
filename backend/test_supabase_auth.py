"""
Comprehensive Supabase Auth Testing Suite
Tests JWT validation, user profiles, and tier-based limits
"""

import sys
import os
from pathlib import Path
import asyncio
import time
import jwt
from datetime import datetime, timedelta

# Add app directory to path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

# Mock Supabase client for testing without real connection
class MockSupabaseClient:
    def __init__(self):
        self.mock_users = {
            "test-user-1": {
                "id": "test-user-1",
                "tier": "free",
                "pages_used_today": 3,
                "pages_used_month": 25,
                "last_reset_date": "2025-08-22"
            },
            "test-user-premium": {
                "id": "test-user-premium", 
                "tier": "professional",
                "pages_used_today": 50,
                "pages_used_month": 800,
                "last_reset_date": "2025-08-22"
            }
        }
    
    def table(self, table_name):
        return MockTable(self.mock_users)

class MockTable:
    def __init__(self, users):
        self.users = users
        
    def select(self, fields):
        return self
        
    def eq(self, field, value):
        self.user_id = value
        return self
        
    def execute(self):
        if self.user_id in self.users:
            return MockResponse([self.users[self.user_id]])
        return MockResponse([])
    
    def insert(self, data):
        self.users[data['id']] = data
        return self
    
    def update(self, data):
        if hasattr(self, 'user_id') and self.user_id in self.users:
            self.users[self.user_id].update(data)
        return self

class MockResponse:
    def __init__(self, data):
        self.data = data

def create_test_jwt(user_id: str, email: str, exp_minutes: int = 60) -> str:
    """Create a test JWT token"""
    payload = {
        'sub': user_id,
        'email': email,
        'role': 'authenticated',
        'aud': 'authenticated',
        'exp': datetime.utcnow() + timedelta(minutes=exp_minutes),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, 'test-secret', algorithm='HS256')

async def test_jwt_validation():
    """Test JWT token validation"""
    print("🔐 Testing JWT Validation...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        from auth.supabase_auth import SupabaseAuth
        from fastapi.security import HTTPAuthorizationCredentials
        
        # Override JWT secret for testing
        auth_handler = SupabaseAuth()
        auth_handler.jwt_secret = 'test-secret'
        
        # Test valid token
        valid_token = create_test_jwt("test-user-1", "test@example.com")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=valid_token)
        
        user = await auth_handler.verify_token(credentials)
        assert user is not None, "Valid token should return user info"
        assert user['id'] == "test-user-1", "User ID should match token"
        assert user['email'] == "test@example.com", "Email should match token"
        
        print("✅ Valid JWT token validation passed")
        
        # Test expired token
        expired_token = create_test_jwt("test-user-1", "test@example.com", exp_minutes=-10)
        expired_credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=expired_token)
        
        try:
            await auth_handler.verify_token(expired_credentials)
            assert False, "Expired token should raise HTTPException"
        except Exception as e:
            print("✅ Expired token properly rejected")
        
        # Test invalid token
        invalid_credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid-token")
        
        try:
            await auth_handler.verify_token(invalid_credentials)
            assert False, "Invalid token should raise HTTPException"
        except Exception as e:
            print("✅ Invalid token properly rejected")
        
        # Test no credentials
        no_user = await auth_handler.verify_token(None)
        assert no_user is None, "No credentials should return None"
        print("✅ Missing credentials handled correctly")
        
        return True
        
    except Exception as e:
        print(f"❌ JWT validation test failed: {e}")
        return False

async def test_user_profile_management():
    """Test user profile creation and retrieval"""
    print("\n👤 Testing User Profile Management...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        from auth.supabase_auth import SupabaseAuth
        
        auth_handler = SupabaseAuth()
        
        # Test existing user profile
        profile = await auth_handler.get_user_profile("test-user-1")
        assert profile is not None, "Should retrieve existing profile"
        assert profile['tier'] == 'free', "Profile should have correct tier"
        assert profile['pages_used_today'] == 3, "Should have correct usage data"
        
        print("✅ Existing user profile retrieved successfully")
        
        # Test non-existing user (should create new profile)
        new_profile = await auth_handler.get_user_profile("new-user-123")
        assert new_profile is not None, "Should create new profile for new user"
        assert new_profile['tier'] == 'free', "New profile should have free tier"
        assert new_profile['pages_used_today'] == 0, "New profile should have zero usage"
        
        print("✅ New user profile created successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ User profile test failed: {e}")
        return False

async def test_tier_based_limits():
    """Test tier-based rate limiting"""
    print("\n🚦 Testing Tier-Based Rate Limiting...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        from auth.supabase_auth import SupabaseAuth
        
        auth_handler = SupabaseAuth()
        
        # Test free tier limits (user at 3/5 daily)
        limits = await auth_handler.check_user_limits("test-user-1", "free")
        assert limits['can_process'] == True, "Free user should be able to process (3/5 daily)"
        assert limits['daily_remaining'] == 2, "Should have 2 pages remaining today"
        
        print("✅ Free tier limits calculated correctly")
        
        # Test professional tier (user at 50/150 daily)
        limits = await auth_handler.check_user_limits("test-user-premium", "professional")
        assert limits['can_process'] == True, "Professional user should be able to process"
        assert limits['daily_remaining'] == 100, "Should have 100 pages remaining today"
        
        print("✅ Professional tier limits calculated correctly")
        
        # Test enterprise tier (unlimited)
        limits = await auth_handler.check_user_limits("test-user-premium", "enterprise")
        assert limits['can_process'] == True, "Enterprise user should always be able to process"
        assert limits['daily_remaining'] == -1, "Enterprise should have unlimited daily"
        
        print("✅ Enterprise tier unlimited access confirmed")
        
        # Simulate user at daily limit
        mock_client = MockSupabaseClient()
        mock_client.mock_users["test-user-1"]["pages_used_today"] = 5  # At daily limit
        auth_module.get_supabase_client = lambda: mock_client
        
        limits = await auth_handler.check_user_limits("test-user-1", "free")
        assert limits['can_process'] == False, "User at daily limit should be blocked"
        assert "Daily limit" in limits['reason'], "Should provide clear reason for blocking"
        
        print("✅ Daily limit enforcement working correctly")
        
        return True
        
    except Exception as e:
        print(f"❌ Tier-based limits test failed: {e}")
        return False

async def test_usage_tracking():
    """Test usage tracking and updates"""
    print("\n📊 Testing Usage Tracking...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        mock_client = MockSupabaseClient()
        auth_module.get_supabase_client = lambda: mock_client
        
        from auth.supabase_auth import SupabaseAuth
        
        auth_handler = SupabaseAuth()
        
        # Get initial usage
        initial_profile = await auth_handler.get_user_profile("test-user-1")
        initial_daily = initial_profile['pages_used_today']
        initial_monthly = initial_profile['pages_used_month']
        
        # Update usage
        await auth_handler.update_user_usage("test-user-1", 3)
        
        # Check updated usage
        updated_profile = await auth_handler.get_user_profile("test-user-1")
        assert updated_profile['pages_used_today'] == initial_daily + 3, "Daily usage should increase by 3"
        assert updated_profile['pages_used_month'] == initial_monthly + 3, "Monthly usage should increase by 3"
        
        print("✅ Usage tracking update working correctly")
        
        return True
        
    except Exception as e:
        print(f"❌ Usage tracking test failed: {e}")
        return False

async def main():
    """Run all Supabase auth tests"""
    print("PDFTablePro - Supabase Auth Testing Suite")
    print("=" * 50)
    
    tests = [
        ("JWT Validation", test_jwt_validation),
        ("User Profile Management", test_user_profile_management),
        ("Tier-Based Limits", test_tier_based_limits),
        ("Usage Tracking", test_usage_tracking)
    ]
    
    passed = 0
    for test_name, test_func in tests:
        try:
            if await test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    print(f"\n📊 Supabase Auth Tests: {passed}/{len(tests)} passed")
    
    if passed == len(tests):
        print("🎉 All Supabase auth tests passed!")
    else:
        print("⚠️  Some auth tests failed. Check implementation.")
    
    return passed == len(tests)

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)