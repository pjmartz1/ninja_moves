"""
Rate Limiter - P0 Security Implementation
Implements basic rate limiting to prevent DoS attacks and resource exhaustion.
"""

import time
import logging
import threading
from typing import Dict, Optional, Tuple
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

@dataclass
class RateLimit:
    """Rate limit configuration"""
    requests: int  # Number of requests allowed
    window: int    # Time window in seconds
    
class RateLimitExceeded(Exception):
    """Exception raised when rate limit is exceeded"""
    def __init__(self, message: str, retry_after: int = None):
        super().__init__(message)
        self.retry_after = retry_after

class RateLimiter:
    """
    Basic in-memory rate limiter implementing P0 security measures:
    - Per-IP rate limiting with sliding window
    - Multiple rate limit tiers (by endpoint/action)
    - Automatic cleanup of old records
    - Thread-safe operations
    - Detailed logging for security monitoring
    """
    
    def __init__(self):
        # Rate limit configurations for different endpoints
        self.rate_limits = {
            'upload': RateLimit(10, 60),      # 10 uploads per minute
            'download': RateLimit(20, 60),    # 20 downloads per minute
            'cleanup': RateLimit(30, 60),     # 30 cleanup requests per minute
            'security': RateLimit(5, 60),     # 5 security requests per minute
            'default': RateLimit(30, 60)      # 30 general requests per minute
        }
        
        # Track requests per IP per endpoint
        # Structure: {ip: {endpoint: deque of timestamps}}
        self.request_history: Dict[str, Dict[str, deque]] = defaultdict(lambda: defaultdict(deque))
        
        # Track blocked IPs and their block expiry
        self.blocked_ips: Dict[str, float] = {}
        
        # Thread safety
        self._lock = threading.RLock()
        
        # Start cleanup thread
        self._start_cleanup_thread()
        
        logger.info("Rate limiter initialized with P0 security settings")
    
    def check_rate_limit(self, ip: str, endpoint: str = 'default') -> Tuple[bool, Optional[int]]:
        """
        Check if request should be allowed based on rate limits
        
        Args:
            ip: Client IP address
            endpoint: API endpoint being accessed
            
        Returns:
            Tuple of (allowed: bool, retry_after: Optional[int])
            
        Raises:
            RateLimitExceeded: If rate limit is exceeded
        """
        # Validate inputs
        if not ip or not isinstance(ip, str):
            logger.warning("Invalid IP provided to rate limiter")
            raise RateLimitExceeded("Invalid request", 60)
        
        # Clean IP for logging (remove potential injection attempts)
        clean_ip = self._sanitize_ip(ip)
        
        with self._lock:
            # Check if IP is currently blocked
            if self._is_ip_blocked(clean_ip):
                block_remaining = int(self.blocked_ips[clean_ip] - time.time())
                logger.warning(f"Blocked IP attempted request: {clean_ip}")
                raise RateLimitExceeded(f"IP temporarily blocked", block_remaining)
            
            # Get rate limit for endpoint
            rate_limit = self.rate_limits.get(endpoint, self.rate_limits['default'])
            
            # Get request history for this IP and endpoint
            ip_history = self.request_history[clean_ip]
            endpoint_history = ip_history[endpoint]
            
            # Clean old requests outside the window
            self._clean_old_requests(endpoint_history, rate_limit.window)
            
            # Check if limit exceeded
            current_requests = len(endpoint_history)
            
            if current_requests >= rate_limit.requests:
                # Calculate retry after time
                oldest_request = endpoint_history[0] if endpoint_history else time.time()
                retry_after = int(oldest_request + rate_limit.window - time.time()) + 1
                
                # Log rate limit violation
                logger.warning(f"Rate limit exceeded for IP {clean_ip} on endpoint {endpoint}: "
                             f"{current_requests}/{rate_limit.requests} in {rate_limit.window}s")
                
                # Check for aggressive behavior (multiple consecutive violations)
                if self._is_aggressive_behavior(clean_ip, endpoint):
                    self._block_ip(clean_ip, 300)  # Block for 5 minutes
                    logger.warning(f"IP {clean_ip} blocked for aggressive behavior")
                    raise RateLimitExceeded("IP temporarily blocked for aggressive behavior", 300)
                
                raise RateLimitExceeded(f"Rate limit exceeded", retry_after)
            
            # Record this request
            endpoint_history.append(time.time())
            
            # Log successful rate limit check (debug level)
            logger.debug(f"Rate limit check passed for {clean_ip} on {endpoint}: "
                        f"{current_requests + 1}/{rate_limit.requests}")
            
            return True, None
    
    def record_request(self, ip: str, endpoint: str = 'default'):
        """
        Record a request for rate limiting (alternative to check_rate_limit)
        
        Args:
            ip: Client IP address
            endpoint: API endpoint being accessed
        """
        clean_ip = self._sanitize_ip(ip)
        
        with self._lock:
            rate_limit = self.rate_limits.get(endpoint, self.rate_limits['default'])
            endpoint_history = self.request_history[clean_ip][endpoint]
            
            # Clean old requests
            self._clean_old_requests(endpoint_history, rate_limit.window)
            
            # Record new request
            endpoint_history.append(time.time())
    
    def is_rate_limited(self, ip: str, endpoint: str = 'default') -> bool:
        """
        Check if IP is currently rate limited (without recording request)
        
        Args:
            ip: Client IP address
            endpoint: API endpoint being checked
            
        Returns:
            True if rate limited
        """
        clean_ip = self._sanitize_ip(ip)
        
        with self._lock:
            # Check if IP is blocked
            if self._is_ip_blocked(clean_ip):
                return True
            
            # Check rate limit
            rate_limit = self.rate_limits.get(endpoint, self.rate_limits['default'])
            endpoint_history = self.request_history[clean_ip][endpoint]
            
            # Clean old requests
            self._clean_old_requests(endpoint_history, rate_limit.window)
            
            return len(endpoint_history) >= rate_limit.requests
    
    def get_remaining_requests(self, ip: str, endpoint: str = 'default') -> int:
        """
        Get number of remaining requests for IP and endpoint
        
        Args:
            ip: Client IP address
            endpoint: API endpoint
            
        Returns:
            Number of remaining requests in current window
        """
        clean_ip = self._sanitize_ip(ip)
        
        with self._lock:
            if self._is_ip_blocked(clean_ip):
                return 0
            
            rate_limit = self.rate_limits.get(endpoint, self.rate_limits['default'])
            endpoint_history = self.request_history[clean_ip][endpoint]
            
            # Clean old requests
            self._clean_old_requests(endpoint_history, rate_limit.window)
            
            return max(0, rate_limit.requests - len(endpoint_history))
    
    def _sanitize_ip(self, ip: str) -> str:
        """Sanitize IP address for safe logging and storage"""
        # Remove any non-IP characters for security
        import re
        # Allow IPv4 and IPv6 addresses
        clean_ip = re.sub(r'[^\d\.\:a-fA-F]', '', ip)[:45]  # Max IPv6 length
        return clean_ip if clean_ip else "unknown"
    
    def _is_ip_blocked(self, ip: str) -> bool:
        """Check if IP is currently blocked"""
        if ip not in self.blocked_ips:
            return False
        
        # Check if block has expired
        if time.time() > self.blocked_ips[ip]:
            del self.blocked_ips[ip]
            logger.info(f"IP block expired for {ip}")
            return False
        
        return True
    
    def _block_ip(self, ip: str, duration: int):
        """Block IP for specified duration in seconds"""
        self.blocked_ips[ip] = time.time() + duration
        logger.warning(f"IP {ip} blocked for {duration} seconds")
    
    def _clean_old_requests(self, request_history: deque, window: int):
        """Remove requests older than the window"""
        cutoff_time = time.time() - window
        
        while request_history and request_history[0] < cutoff_time:
            request_history.popleft()
    
    def _is_aggressive_behavior(self, ip: str, endpoint: str) -> bool:
        """
        Detect aggressive behavior patterns that warrant IP blocking
        
        Args:
            ip: Client IP address
            endpoint: API endpoint
            
        Returns:
            True if aggressive behavior detected
        """
        # Check if IP has exceeded rate limits on multiple endpoints recently
        endpoints_violated = 0
        
        for ep, history in self.request_history[ip].items():
            rate_limit = self.rate_limits.get(ep, self.rate_limits['default'])
            self._clean_old_requests(history, rate_limit.window)
            
            if len(history) >= rate_limit.requests:
                endpoints_violated += 1
        
        # Block if violating rate limits on 3+ endpoints
        return endpoints_violated >= 3
    
    def _start_cleanup_thread(self):
        """Start background thread for periodic cleanup"""
        def cleanup_worker():
            while True:
                try:
                    self._periodic_cleanup()
                    time.sleep(120)  # Run cleanup every 2 minutes
                except Exception as e:
                    logger.error(f"Rate limiter cleanup error: {e}")
                    time.sleep(60)
        
        cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
        cleanup_thread.start()
        logger.info("Rate limiter cleanup thread started")
    
    def _periodic_cleanup(self):
        """Periodic cleanup of old data"""
        current_time = time.time()
        
        with self._lock:
            # Clean up old request histories
            ips_to_remove = []
            
            for ip, endpoints in list(self.request_history.items()):
                endpoints_to_remove = []
                
                for endpoint, history in list(endpoints.items()):
                    rate_limit = self.rate_limits.get(endpoint, self.rate_limits['default'])
                    self._clean_old_requests(history, rate_limit.window)
                    
                    # Remove empty endpoint histories
                    if not history:
                        endpoints_to_remove.append(endpoint)
                
                # Remove empty endpoints
                for endpoint in endpoints_to_remove:
                    del endpoints[endpoint]
                
                # Remove IPs with no recent activity
                if not endpoints:
                    ips_to_remove.append(ip)
            
            # Remove empty IP records
            for ip in ips_to_remove:
                del self.request_history[ip]
            
            # Clean up expired IP blocks
            expired_blocks = [ip for ip, expiry in self.blocked_ips.items() if current_time > expiry]
            for ip in expired_blocks:
                del self.blocked_ips[ip]
                logger.info(f"Removed expired block for IP {ip}")
            
            if ips_to_remove or expired_blocks:
                logger.debug(f"Cleaned up {len(ips_to_remove)} IP records and {len(expired_blocks)} expired blocks")
    
    def get_stats(self) -> Dict:
        """Get rate limiter statistics"""
        with self._lock:
            total_ips = len(self.request_history)
            blocked_ips = len(self.blocked_ips)
            
            # Count total requests across all IPs and endpoints
            total_requests = 0
            for ip_data in self.request_history.values():
                for history in ip_data.values():
                    total_requests += len(history)
            
            return {
                'total_tracked_ips': total_ips,
                'blocked_ips': blocked_ips,
                'total_recent_requests': total_requests,
                'rate_limits': {k: f"{v.requests}/{v.window}s" for k, v in self.rate_limits.items()}
            }
    
    def reset_ip(self, ip: str):
        """Reset rate limiting data for specific IP (admin function)"""
        clean_ip = self._sanitize_ip(ip)
        
        with self._lock:
            if clean_ip in self.request_history:
                del self.request_history[clean_ip]
            
            if clean_ip in self.blocked_ips:
                del self.blocked_ips[clean_ip]
            
            logger.info(f"Reset rate limiting data for IP {clean_ip}")
    
    def update_rate_limit(self, endpoint: str, requests: int, window: int):
        """Update rate limit for specific endpoint (admin function)"""
        with self._lock:
            self.rate_limits[endpoint] = RateLimit(requests, window)
            logger.info(f"Updated rate limit for {endpoint}: {requests}/{window}s")


# Global rate limiter instance
rate_limiter = RateLimiter()