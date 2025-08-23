"""
Supabase Auth Integration - P1 Security Implementation
Handles JWT token validation and user tier management with Supabase
"""

import os
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from supabase import create_client, Client

logger = logging.getLogger(__name__)

# Initialize Supabase client
def get_supabase_client() -> Client:
    """Get Supabase client with service role key"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_service_key = os.environ.get('SUPABASE_SERVICE_KEY')
    
    if not supabase_url or not supabase_service_key:
        logger.error("Supabase environment variables not configured")
        raise HTTPException(status_code=500, detail="Auth service not configured")
    
    return create_client(supabase_url, supabase_service_key)

# Security scheme for JWT Bearer tokens
security = HTTPBearer(auto_error=False)

class SupabaseAuth:
    """
    Supabase authentication and authorization handler
    """
    
    def __init__(self):
        self.jwt_secret = os.environ.get('SUPABASE_JWT_SECRET')
        if not self.jwt_secret:
            logger.warning("SUPABASE_JWT_SECRET not configured - JWT validation disabled")
        
        self.tier_limits = {
            'free': {'daily': 5, 'monthly': 50},
            'starter': {'daily': 50, 'monthly': 500},
            'professional': {'daily': 150, 'monthly': 1500},
            'business': {'daily': 500, 'monthly': 5000},
            'enterprise': {'daily': -1, 'monthly': -1}  # Unlimited
        }
    
    async def verify_token(self, credentials: Optional[HTTPAuthorizationCredentials]) -> Optional[Dict[str, Any]]:
        """
        Verify Supabase JWT token and return user info
        
        Args:
            credentials: HTTP Bearer token credentials
            
        Returns:
            User info dict if valid, None if no token or invalid
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        if not credentials:
            return None
        
        if not self.jwt_secret:
            logger.warning("JWT validation skipped - secret not configured")
            return None
        
        try:
            # Decode JWT token
            payload = jwt.decode(
                credentials.credentials,
                self.jwt_secret,
                algorithms=['HS256'],
                audience='authenticated'
            )
            
            # Extract user info
            user_info = {
                'id': payload.get('sub'),
                'email': payload.get('email'),
                'role': payload.get('role', 'authenticated'),
                'exp': payload.get('exp')
            }
            
            logger.info(f"Token verified for user: {user_info['email']}")
            return user_info
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token: {e}")
            raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            raise HTTPException(status_code=401, detail="Authentication failed")
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile and usage information from Supabase
        
        Args:
            user_id: User ID from JWT token
            
        Returns:
            User profile dict with tier and usage info
        """
        try:
            supabase = get_supabase_client()
            
            # Get user profile
            response = supabase.table('user_profiles').select('*').eq('id', user_id).execute()
            
            if response.data:
                return response.data[0]
            else:
                # Create default profile if doesn't exist
                profile = {
                    'id': user_id,
                    'tier': 'free',
                    'pages_used_today': 0,
                    'pages_used_month': 0
                }
                
                create_response = supabase.table('user_profiles').insert(profile).execute()
                logger.info(f"Created new user profile for {user_id}")
                return profile
                
        except Exception as e:
            logger.error(f"Error fetching user profile for {user_id}: {e}")
            return None
    
    async def check_user_limits(self, user_id: str, tier: str) -> Dict[str, Any]:
        """
        Check if user has exceeded their tier limits
        
        Args:
            user_id: User ID
            tier: User tier (free, starter, professional, etc.)
            
        Returns:
            Dict with can_process boolean and reason if blocked
        """
        try:
            profile = await self.get_user_profile(user_id)
            if not profile:
                return {'can_process': False, 'reason': 'Could not load user profile'}
            
            limits = self.tier_limits.get(tier, self.tier_limits['free'])
            
            # Check daily limit
            if limits['daily'] > 0 and profile['pages_used_today'] >= limits['daily']:
                return {
                    'can_process': False,
                    'reason': f'Daily limit of {limits["daily"]} pages exceeded',
                    'current_usage': profile['pages_used_today'],
                    'limit': limits['daily']
                }
            
            # Check monthly limit
            if limits['monthly'] > 0 and profile['pages_used_month'] >= limits['monthly']:
                return {
                    'can_process': False,
                    'reason': f'Monthly limit of {limits["monthly"]} pages exceeded',
                    'current_usage': profile['pages_used_month'],
                    'limit': limits['monthly']
                }
            
            return {
                'can_process': True,
                'daily_remaining': max(0, limits['daily'] - profile['pages_used_today']) if limits['daily'] > 0 else -1,
                'monthly_remaining': max(0, limits['monthly'] - profile['pages_used_month']) if limits['monthly'] > 0 else -1
            }
            
        except Exception as e:
            logger.error(f"Error checking user limits for {user_id}: {e}")
            return {'can_process': False, 'reason': 'Error checking usage limits'}
    
    async def update_user_usage(self, user_id: str, pages_processed: int):
        """
        Update user's usage statistics
        
        Args:
            user_id: User ID
            pages_processed: Number of pages processed in this request
        """
        try:
            supabase = get_supabase_client()
            
            # Get current profile
            profile = await self.get_user_profile(user_id)
            if not profile:
                logger.error(f"Could not update usage for user {user_id} - profile not found")
                return
            
            # Check if we need to reset daily counter
            from datetime import date
            today = date.today().isoformat()
            should_reset_daily = profile.get('last_reset_date') != today
            
            # Calculate new usage
            new_daily = pages_processed if should_reset_daily else profile['pages_used_today'] + pages_processed
            new_monthly = profile['pages_used_month'] + pages_processed
            
            # Update profile
            update_data = {
                'pages_used_today': new_daily,
                'pages_used_month': new_monthly,
                'last_reset_date': today
            }
            
            response = supabase.table('user_profiles').update(update_data).eq('id', user_id).execute()
            
            logger.info(f"Updated usage for user {user_id}: +{pages_processed} pages (daily: {new_daily}, monthly: {new_monthly})")
            
        except Exception as e:
            logger.error(f"Error updating user usage for {user_id}: {e}")

# Global auth instance
auth_handler = SupabaseAuth()

# Dependency for optional authentication
async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[Dict[str, Any]]:
    """
    Get current user from JWT token (optional - doesn't raise on missing token)
    """
    if not credentials:
        return None
    return await auth_handler.verify_token(credentials)

# Dependency for required authentication
async def get_current_user_required(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Get current user from JWT token (required - raises 401 if missing)
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user = await auth_handler.verify_token(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    return user