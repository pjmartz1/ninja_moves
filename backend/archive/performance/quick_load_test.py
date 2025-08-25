"""
Quick Load Testing Script for PDFTablePro
Simplified version for rapid performance validation during development.
"""

import asyncio
import aiohttp
import time
import statistics
import sys
from typing import List, Dict, Any

class QuickLoadTest:
    """Simple load test for development validation"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.results = []
    
    async def make_request(self, session: aiohttp.ClientSession, endpoint: str, user_id: int) -> Dict[str, Any]:
        """Make a single request and measure response time"""
        start_time = time.time()
        
        try:
            async with session.get(f"{self.base_url}{endpoint}") as response:
                content = await response.text()
                end_time = time.time()
                
                return {
                    "user_id": user_id,
                    "endpoint": endpoint,
                    "status_code": response.status,
                    "response_time": (end_time - start_time) * 1000,  # ms
                    "success": 200 <= response.status < 300,
                    "rate_limited": response.status == 429
                }
        except Exception as e:
            return {
                "user_id": user_id,
                "endpoint": endpoint,
                "status_code": 500,
                "response_time": (time.time() - start_time) * 1000,
                "success": False,
                "rate_limited": False,
                "error": str(e)
            }
    
    async def run_quick_test(self, users: int = 20, endpoint: str = "/health") -> Dict[str, Any]:
        """Run a quick load test"""
        print(f"🚀 Quick Load Test: {users} concurrent requests to {endpoint}")
        
        async with aiohttp.ClientSession() as session:
            start_time = time.time()
            
            # Create tasks for concurrent requests
            tasks = []
            for user_id in range(users):
                task = self.make_request(session, endpoint, user_id)
                tasks.append(task)
            
            # Execute all requests concurrently
            results = await asyncio.gather(*tasks)
            end_time = time.time()
            
            # Calculate metrics
            response_times = [r["response_time"] for r in results]
            successful = [r for r in results if r["success"]]
            rate_limited = [r for r in results if r["rate_limited"]]
            errors = [r for r in results if "error" in r]
            
            total_time = (end_time - start_time) * 1000  # ms
            
            metrics = {
                "total_requests": len(results),
                "successful_requests": len(successful),
                "rate_limited_requests": len(rate_limited),
                "failed_requests": len(results) - len(successful),
                "total_time": total_time,
                "avg_response_time": statistics.mean(response_times) if response_times else 0,
                "min_response_time": min(response_times) if response_times else 0,
                "max_response_time": max(response_times) if response_times else 0,
                "requests_per_second": len(results) / (total_time / 1000) if total_time > 0 else 0,
                "success_rate": len(successful) / len(results) * 100 if results else 0,
                "rate_limit_rate": len(rate_limited) / len(results) * 100 if results else 0
            }
            
            if errors:
                metrics["errors"] = [r.get("error", "Unknown") for r in errors[:5]]  # First 5 errors
            
            return metrics
    
    def print_results(self, metrics: Dict[str, Any]):
        """Print formatted test results"""
        print(f"\n📊 Results:")
        print(f"   Total Requests: {metrics['total_requests']}")
        print(f"   Successful: {metrics['successful_requests']} ({metrics['success_rate']:.1f}%)")
        print(f"   Rate Limited: {metrics['rate_limited_requests']} ({metrics['rate_limit_rate']:.1f}%)")
        print(f"   Failed: {metrics['failed_requests']}")
        print(f"   Total Time: {metrics['total_time']:.2f}ms")
        print(f"   Avg Response: {metrics['avg_response_time']:.2f}ms")
        print(f"   Min Response: {metrics['min_response_time']:.2f}ms") 
        print(f"   Max Response: {metrics['max_response_time']:.2f}ms")
        print(f"   Throughput: {metrics['requests_per_second']:.2f} req/s")
        
        # Performance assessment
        if metrics['success_rate'] >= 90:
            print("   ✅ Success rate: Good")
        elif metrics['success_rate'] >= 70:
            print("   ⚠️  Success rate: Moderate")
        else:
            print("   ❌ Success rate: Poor")
        
        if metrics['avg_response_time'] <= 1000:
            print("   ✅ Response time: Good")
        elif metrics['avg_response_time'] <= 3000:
            print("   ⚠️  Response time: Moderate")
        else:
            print("   ❌ Response time: Poor")
        
        if 'errors' in metrics:
            print(f"   ❌ Errors detected: {metrics['errors']}")

async def main():
    """Run quick performance tests"""
    tester = QuickLoadTest()
    
    # Test different scenarios
    scenarios = [
        {"users": 10, "endpoint": "/health", "name": "Health Check (10 users)"},
        {"users": 25, "endpoint": "/health", "name": "Health Check (25 users)"},
        {"users": 50, "endpoint": "/", "name": "Root Endpoint (50 users)"},
        {"users": 20, "endpoint": "/security/status", "name": "Security Status (20 users)"}
    ]
    
    all_results = {}
    
    for scenario in scenarios:
        print(f"\n{'-' * 50}")
        print(f"Testing: {scenario['name']}")
        
        try:
            metrics = await tester.run_quick_test(
                users=scenario['users'],
                endpoint=scenario['endpoint']
            )
            
            tester.print_results(metrics)
            all_results[scenario['name']] = metrics
            
            # Small delay between tests
            await asyncio.sleep(2)
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
    
    # Summary
    print(f"\n{'=' * 50}")
    print("📈 QUICK TEST SUMMARY")
    print(f"{'=' * 50}")
    
    for name, metrics in all_results.items():
        print(f"{name:30} | {metrics['success_rate']:5.1f}% success | {metrics['avg_response_time']:6.0f}ms avg")
    
    # Overall assessment
    avg_success_rate = sum(m['success_rate'] for m in all_results.values()) / len(all_results) if all_results else 0
    avg_response_time = sum(m['avg_response_time'] for m in all_results.values()) / len(all_results) if all_results else 0
    
    print(f"\nOverall Performance:")
    print(f"   Average Success Rate: {avg_success_rate:.1f}%")
    print(f"   Average Response Time: {avg_response_time:.0f}ms")
    
    if avg_success_rate >= 90 and avg_response_time <= 2000:
        print("   🎉 System performance is good!")
    elif avg_success_rate >= 70 and avg_response_time <= 5000:
        print("   ⚠️  System performance is acceptable but could be improved")
    else:
        print("   ❌ System performance needs optimization")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)