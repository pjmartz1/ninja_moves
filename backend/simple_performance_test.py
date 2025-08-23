#!/usr/bin/env python3
"""
Simple Performance Test for PDFTablePro - No Unicode Characters
Tests 100 concurrent users as per requirements
"""
import asyncio
import aiohttp
import time
import psutil
import json
from datetime import datetime
import statistics

class SimplePerformanceTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.results = {}
        
    async def make_request(self, session, endpoint, method="GET", data=None):
        """Make a single HTTP request and measure performance"""
        start_time = time.time()
        try:
            if method == "GET":
                async with session.get(f"{self.base_url}{endpoint}") as response:
                    await response.text()
                    return {
                        'status': response.status,
                        'response_time': time.time() - start_time,
                        'success': response.status < 400,
                        'endpoint': endpoint
                    }
            elif method == "POST":
                async with session.post(f"{self.base_url}{endpoint}", data=data) as response:
                    await response.text()
                    return {
                        'status': response.status,
                        'response_time': time.time() - start_time,
                        'success': response.status < 400,
                        'endpoint': endpoint
                    }
        except Exception as e:
            return {
                'status': 0,
                'response_time': time.time() - start_time,
                'success': False,
                'endpoint': endpoint,
                'error': str(e)
            }
    
    async def test_concurrent_users(self, users, endpoint="/health", duration=30):
        """Test with concurrent users for specified duration"""
        print(f"Testing {users} concurrent users on {endpoint}")
        print(f"Duration: {duration} seconds")
        
        # Get initial system stats
        initial_cpu = psutil.cpu_percent(interval=1)
        initial_memory = psutil.virtual_memory().percent
        
        connector = aiohttp.TCPConnector(limit=users + 20)
        timeout = aiohttp.ClientTimeout(total=30)
        
        results = []
        start_test_time = time.time()
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            while time.time() - start_test_time < duration:
                # Create concurrent tasks
                tasks = []
                for _ in range(users):
                    tasks.append(self.make_request(session, endpoint))
                
                # Execute all tasks concurrently
                batch_start = time.time()
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Process results
                for result in batch_results:
                    if isinstance(result, dict):
                        results.append(result)
                
                # Small delay between batches
                await asyncio.sleep(0.1)
        
        # Get final system stats
        final_cpu = psutil.cpu_percent(interval=1)
        final_memory = psutil.virtual_memory().percent
        
        # Calculate metrics
        successful_requests = [r for r in results if r.get('success', False)]
        failed_requests = [r for r in results if not r.get('success', True)]
        
        response_times = [r['response_time'] for r in successful_requests]
        
        metrics = {
            'test_duration': time.time() - start_test_time,
            'concurrent_users': users,
            'endpoint': endpoint,
            'total_requests': len(results),
            'successful_requests': len(successful_requests),
            'failed_requests': len(failed_requests),
            'success_rate': len(successful_requests) / len(results) * 100 if results else 0,
            'avg_response_time': statistics.mean(response_times) if response_times else 0,
            'min_response_time': min(response_times) if response_times else 0,
            'max_response_time': max(response_times) if response_times else 0,
            'p95_response_time': statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else (max(response_times) if response_times else 0),
            'requests_per_second': len(results) / (time.time() - start_test_time),
            'system_stats': {
                'initial_cpu': initial_cpu,
                'final_cpu': final_cpu,
                'cpu_increase': final_cpu - initial_cpu,
                'initial_memory': initial_memory,
                'final_memory': final_memory,
                'memory_increase': final_memory - initial_memory
            }
        }
        
        return metrics
    
    def print_results(self, metrics):
        """Print performance test results"""
        print("\n" + "="*60)
        print(f"PERFORMANCE TEST RESULTS")
        print("="*60)
        print(f"Test Duration: {metrics['test_duration']:.2f}s")
        print(f"Concurrent Users: {metrics['concurrent_users']}")
        print(f"Endpoint: {metrics['endpoint']}")
        print(f"Total Requests: {metrics['total_requests']}")
        print(f"Successful Requests: {metrics['successful_requests']}")
        print(f"Failed Requests: {metrics['failed_requests']}")
        print(f"Success Rate: {metrics['success_rate']:.1f}%")
        print(f"Requests per Second: {metrics['requests_per_second']:.2f}")
        print("\nResponse Times:")
        print(f"  Average: {metrics['avg_response_time']*1000:.0f}ms")
        print(f"  Min: {metrics['min_response_time']*1000:.0f}ms")
        print(f"  Max: {metrics['max_response_time']*1000:.0f}ms")
        print(f"  P95: {metrics['p95_response_time']*1000:.0f}ms")
        print("\nSystem Resource Usage:")
        print(f"  CPU: {metrics['system_stats']['initial_cpu']:.1f}% -> {metrics['system_stats']['final_cpu']:.1f}% (change: {metrics['system_stats']['cpu_increase']:+.1f}%)")
        print(f"  Memory: {metrics['system_stats']['initial_memory']:.1f}% -> {metrics['system_stats']['final_memory']:.1f}% (change: {metrics['system_stats']['memory_increase']:+.1f}%)")
        
        # Performance assessment
        print("\nPERFORMANCE ASSESSMENT:")
        if metrics['success_rate'] >= 90:
            print("  SUCCESS RATE: EXCELLENT (>90%)")
        elif metrics['success_rate'] >= 70:
            print("  SUCCESS RATE: GOOD (70-90%)")
        else:
            print("  SUCCESS RATE: POOR (<70%)")
            
        if metrics['avg_response_time'] < 2:
            print("  RESPONSE TIME: EXCELLENT (<2s)")
        elif metrics['avg_response_time'] < 5:
            print("  RESPONSE TIME: GOOD (2-5s)")
        else:
            print("  RESPONSE TIME: POOR (>5s)")
            
        if metrics['system_stats']['cpu_increase'] < 20:
            print("  RESOURCE USAGE: EFFICIENT (CPU increase <20%)")
        elif metrics['system_stats']['cpu_increase'] < 50:
            print("  RESOURCE USAGE: MODERATE (CPU increase 20-50%)")
        else:
            print("  RESOURCE USAGE: HIGH (CPU increase >50%)")
            
    async def run_progressive_test(self):
        """Run progressive load test: 10 -> 25 -> 50 -> 100 users"""
        user_counts = [10, 25, 50, 100]
        all_results = []
        
        print("PROGRESSIVE LOAD TEST - PDFTablePro")
        print("Testing endpoint: /health")
        print("="*60)
        
        for users in user_counts:
            print(f"\nTesting {users} concurrent users...")
            metrics = await self.test_concurrent_users(users, "/health", duration=20)
            all_results.append(metrics)
            self.print_results(metrics)
            
            # Save results
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"performance_results_{users}users_{timestamp}.json"
            with open(filename, 'w') as f:
                json.dump(metrics, f, indent=2)
            print(f"Results saved to: {filename}")
            
            # Wait between tests
            if users < 100:
                print("\nWaiting 10 seconds before next test...")
                await asyncio.sleep(10)
        
        return all_results

async def main():
    """Main test execution"""
    tester = SimplePerformanceTester()
    
    print("PDFTablePro Performance Testing Suite")
    print("Testing target: 100 concurrent users")
    print("="*60)
    
    try:
        # First verify server is running
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:8000/health") as response:
                if response.status == 200:
                    print("Backend server is healthy - starting tests")
                else:
                    print(f"Backend server health check failed: {response.status}")
                    return
    
        # Run progressive tests
        results = await tester.run_progressive_test()
        
        print("\n" + "="*60)
        print("FINAL SUMMARY - 100 CONCURRENT USERS TARGET")
        print("="*60)
        
        final_result = results[-1]  # 100 users test
        if final_result['success_rate'] >= 70 and final_result['avg_response_time'] < 5:
            print("TARGET ACHIEVED: System can handle 100 concurrent users")
        else:
            print("TARGET NOT MET: System needs optimization for 100 users")
            
        print("All test results saved to individual JSON files")
        
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())