"""
P0 Security: Rate Limiting
Critical DoS protection for file uploads
"""

import time
import asyncio
from typing import Dict, Optional
from fastapi import Request, HTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


class AdvancedRateLimiter:
    """Enhanced rate limiting with sliding window"""
    
    def __init__(self):
        self.requests = {}  # IP -> list of timestamps
        self.blocked_ips = {}  # IP -> block_until_timestamp
        
    def is_rate_limited(self, ip: str, max_requests: int = 10, window_minutes: int = 1) -> bool:
        """Check if IP is rate limited"""
        current_time = time.time()
        window_seconds = window_minutes * 60
        
        # Check if IP is currently blocked
        if ip in self.blocked_ips:
            if current_time < self.blocked_ips[ip]:
                return True
            else:
                del self.blocked_ips[ip]
        
        # Initialize or clean old requests
        if ip not in self.requests:
            self.requests[ip] = []
        
        # Remove old requests outside the window
        self.requests[ip] = [
            req_time for req_time in self.requests[ip]
            if current_time - req_time < window_seconds
        ]
        
        # Check if limit exceeded
        if len(self.requests[ip]) >= max_requests:
            # Block IP for 5 minutes
            self.blocked_ips[ip] = current_time + (5 * 60)
            return True
        
        # Add current request
        self.requests[ip].append(current_time)
        return False
    
    def get_remaining_requests(self, ip: str, max_requests: int = 10) -> int:
        """Get remaining requests for IP"""
        if ip not in self.requests:
            return max_requests
        return max(0, max_requests - len(self.requests[ip]))


# Global rate limiter instance
rate_limiter = AdvancedRateLimiter()

# Basic rate limiter for FastAPI
limiter = Limiter(key_func=get_remote_address)


def check_upload_rate_limit(request: Request) -> bool:
    """Check rate limit for file uploads"""
    client_ip = get_remote_address(request)
    
    # Stricter limits for file uploads
    if rate_limiter.is_rate_limited(client_ip, max_requests=5, window_minutes=1):
        raise HTTPException(
            status_code=429,
            detail="Too many upload requests. Please try again later."
        )
    
    return True


def get_rate_limit_headers(request: Request) -> Dict[str, str]:
    """Get rate limit headers for response"""
    client_ip = get_remote_address(request)
    remaining = rate_limiter.get_remaining_requests(client_ip, max_requests=5)
    
    return {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": str(remaining),
        "X-RateLimit-Reset": str(int(time.time()) + 60)
    }