"""
Comprehensive Performance Testing Strategy for PDFTablePro
Tests system capability to handle 100 concurrent users with detailed metrics and optimization recommendations.

This suite implements:
1. Incremental load testing (10→25→50→100 users)
2. Comprehensive performance metrics tracking
3. Bottleneck identification
4. Memory and resource monitoring
5. Rate limiting behavior validation
6. File cleanup verification under load
"""

import asyncio
import aiohttp
import time
import threading
import psutil
import statistics
import json
import os
import sys
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
from pathlib import Path
from datetime import datetime
import concurrent.futures
import tempfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class PerformanceMetrics:
    """Comprehensive performance metrics"""
    request_count: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    rate_limited_requests: int = 0
    avg_response_time: float = 0.0
    max_response_time: float = 0.0
    min_response_time: float = float('inf')
    p95_response_time: float = 0.0
    p99_response_time: float = 0.0
    requests_per_second: float = 0.0
    avg_cpu_usage: float = 0.0
    max_cpu_usage: float = 0.0
    avg_memory_usage: float = 0.0
    max_memory_usage: float = 0.0
    memory_growth: float = 0.0
    test_duration: float = 0.0
    errors: List[str] = None
    bottlenecks_identified: List[str] = None
    
    def __post_init__(self):
        if self.errors is None:
            self.errors = []
        if self.bottlenecks_identified is None:
            self.bottlenecks_identified = []

@dataclass
class TestConfiguration:
    """Test configuration parameters"""
    base_url: str = "http://localhost:8000"
    concurrent_users: int = 10
    requests_per_user: int = 10
    test_duration: int = 60  # seconds
    ramp_up_time: int = 10   # seconds to reach target concurrency
    endpoints_to_test: List[str] = None
    pdf_test_enabled: bool = True
    cleanup_verification: bool = True
    
    def __post_init__(self):
        if self.endpoints_to_test is None:
            self.endpoints_to_test = ["/health", "/", "/security/status"]

class SystemMonitor:
    """Monitor system resources during testing"""
    
    def __init__(self):
        self.monitoring = False
        self.cpu_samples = []
        self.memory_samples = []
        self.initial_memory = 0
        self.monitor_thread = None
        
    def start_monitoring(self):
        """Start system monitoring"""
        self.monitoring = True
        self.cpu_samples = []
        self.memory_samples = []
        self.initial_memory = psutil.virtual_memory().percent
        
        def monitor_resources():
            while self.monitoring:
                try:
                    cpu = psutil.cpu_percent(interval=0.1)
                    memory = psutil.virtual_memory().percent
                    self.cpu_samples.append(cpu)
                    self.memory_samples.append(memory)
                    time.sleep(0.5)
                except Exception as e:
                    logger.warning(f"Monitoring error: {e}")
                    break
        
        self.monitor_thread = threading.Thread(target=monitor_resources, daemon=True)
        self.monitor_thread.start()
        logger.info("System monitoring started")
    
    def stop_monitoring(self) -> Dict[str, float]:
        """Stop monitoring and return metrics"""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=2)
        
        if not self.cpu_samples or not self.memory_samples:
            return {
                "avg_cpu": 0, "max_cpu": 0,
                "avg_memory": 0, "max_memory": 0, "memory_growth": 0
            }
        
        return {
            "avg_cpu": statistics.mean(self.cpu_samples),
            "max_cpu": max(self.cpu_samples),
            "avg_memory": statistics.mean(self.memory_samples),
            "max_memory": max(self.memory_samples),
            "memory_growth": max(self.memory_samples) - self.initial_memory
        }

class LoadTester:
    """Advanced load testing framework"""
    
    def __init__(self, config: TestConfiguration):
        self.config = config
        self.monitor = SystemMonitor()
        self.results = []
        self.session = None
        
    async def create_session(self):
        """Create aiohttp session with appropriate settings"""
        timeout = aiohttp.ClientTimeout(total=60, connect=10)
        connector = aiohttp.TCPConnector(
            limit=self.config.concurrent_users * 2,
            limit_per_host=self.config.concurrent_users,
            keepalive_timeout=30
        )
        self.session = aiohttp.ClientSession(
            timeout=timeout,
            connector=connector,
            headers={"User-Agent": "PDFTablePro-LoadTester/1.0"}
        )
        
    async def close_session(self):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()
            
    async def make_request(self, endpoint: str, user_id: int, request_id: int) -> Dict[str, Any]:
        """Make a single HTTP request and measure performance"""
        start_time = time.time()
        
        try:
            url = f"{self.config.base_url}{endpoint}"
            async with self.session.get(url) as response:
                content = await response.text()
                end_time = time.time()
                
                return {
                    "user_id": user_id,
                    "request_id": request_id,
                    "endpoint": endpoint,
                    "status_code": response.status,
                    "response_time": (end_time - start_time) * 1000,  # ms
                    "success": 200 <= response.status < 300,
                    "rate_limited": response.status == 429,
                    "content_length": len(content),
                    "timestamp": start_time
                }
                
        except asyncio.TimeoutError:
            return {
                "user_id": user_id, "request_id": request_id, "endpoint": endpoint,
                "status_code": 408, "response_time": 60000, "success": False,
                "rate_limited": False, "content_length": 0, "timestamp": start_time,
                "error": "Request timeout"
            }
        except Exception as e:
            return {
                "user_id": user_id, "request_id": request_id, "endpoint": endpoint,
                "status_code": 500, "response_time": (time.time() - start_time) * 1000,
                "success": False, "rate_limited": False, "content_length": 0,
                "timestamp": start_time, "error": str(e)
            }
    
    async def make_pdf_request(self, user_id: int, request_id: int) -> Dict[str, Any]:
        """Make a PDF extraction request"""
        start_time = time.time()
        
        # Create test PDF content
        pdf_content = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 100 700 Td (Test Table Data) Tj ET
endstream endobj
xref 0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000237 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref 330
%%EOF"""
        
        try:
            url = f"{self.config.base_url}/extract"
            data = aiohttp.FormData()
            data.add_field('file', pdf_content, 
                          filename=f'test_{user_id}_{request_id}.pdf',
                          content_type='application/pdf')
            data.add_field('export_format', 'csv')
            
            async with self.session.post(url, data=data) as response:
                content = await response.text()
                end_time = time.time()
                
                return {
                    "user_id": user_id, "request_id": request_id, "endpoint": "/extract",
                    "status_code": response.status, "response_time": (end_time - start_time) * 1000,
                    "success": 200 <= response.status < 300, "rate_limited": response.status == 429,
                    "content_length": len(content), "timestamp": start_time
                }
                
        except Exception as e:
            return {
                "user_id": user_id, "request_id": request_id, "endpoint": "/extract",
                "status_code": 500, "response_time": (time.time() - start_time) * 1000,
                "success": False, "rate_limited": False, "content_length": 0,
                "timestamp": start_time, "error": str(e)
            }
    
    async def simulate_user(self, user_id: int, delay_start: float = 0) -> List[Dict[str, Any]]:
        """Simulate a single user making requests"""
        # Stagger user start times for ramp-up
        if delay_start > 0:
            await asyncio.sleep(delay_start)
        
        user_results = []
        endpoints_cycle = self.config.endpoints_to_test.copy()
        
        for request_id in range(self.config.requests_per_user):
            # Alternate between different endpoints
            endpoint = endpoints_cycle[request_id % len(endpoints_cycle)]
            
            # Mix in PDF requests if enabled
            if self.config.pdf_test_enabled and request_id % 5 == 0 and request_id > 0:
                result = await self.make_pdf_request(user_id, request_id)
            else:
                result = await self.make_request(endpoint, user_id, request_id)
            
            user_results.append(result)
            
            # Small delay between requests from same user
            await asyncio.sleep(0.1)
        
        return user_results
    
    async def run_load_test(self) -> PerformanceMetrics:
        """Run comprehensive load test"""
        logger.info(f"Starting load test: {self.config.concurrent_users} users, "
                   f"{self.config.requests_per_user} requests each")
        
        await self.create_session()
        self.monitor.start_monitoring()
        
        start_time = time.time()
        
        # Calculate ramp-up delays
        ramp_delay = self.config.ramp_up_time / self.config.concurrent_users
        
        try:
            # Launch all users with staggered start times
            tasks = []
            for user_id in range(self.config.concurrent_users):
                delay = user_id * ramp_delay
                task = asyncio.create_task(self.simulate_user(user_id, delay))
                tasks.append(task)
            
            # Wait for all users to complete
            user_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Flatten results
            all_results = []
            for user_result in user_results:
                if isinstance(user_result, list):
                    all_results.extend(user_result)
                else:
                    logger.error(f"User simulation error: {user_result}")
            
            self.results = all_results
            
        except Exception as e:
            logger.error(f"Load test error: {e}")
        finally:
            end_time = time.time()
            system_metrics = self.monitor.stop_monitoring()
            await self.close_session()
        
        # Calculate performance metrics
        return self.calculate_metrics(all_results, system_metrics, end_time - start_time)
    
    def calculate_metrics(self, results: List[Dict], system_metrics: Dict, duration: float) -> PerformanceMetrics:
        """Calculate comprehensive performance metrics"""
        if not results:
            return PerformanceMetrics(test_duration=duration)
        
        response_times = [r["response_time"] for r in results if "response_time" in r]
        successful = [r for r in results if r.get("success", False)]
        rate_limited = [r for r in results if r.get("rate_limited", False)]
        errors = [r for r in results if r.get("error")]
        
        metrics = PerformanceMetrics(
            request_count=len(results),
            successful_requests=len(successful),
            failed_requests=len(results) - len(successful),
            rate_limited_requests=len(rate_limited),
            test_duration=duration,
            requests_per_second=len(results) / duration if duration > 0 else 0,
            **system_metrics
        )
        
        if response_times:
            metrics.avg_response_time = statistics.mean(response_times)
            metrics.max_response_time = max(response_times)
            metrics.min_response_time = min(response_times)
            
            sorted_times = sorted(response_times)
            metrics.p95_response_time = sorted_times[int(0.95 * len(sorted_times))]
            metrics.p99_response_time = sorted_times[int(0.99 * len(sorted_times))]
        
        # Collect errors
        metrics.errors = [r.get("error", "Unknown error") for r in errors]
        
        # Identify bottlenecks
        metrics.bottlenecks_identified = self.identify_bottlenecks(metrics, results)
        
        return metrics
    
    def identify_bottlenecks(self, metrics: PerformanceMetrics, results: List[Dict]) -> List[str]:
        """Identify performance bottlenecks"""
        bottlenecks = []
        
        # High response times
        if metrics.avg_response_time > 2000:
            bottlenecks.append(f"High average response time: {metrics.avg_response_time:.2f}ms")
        
        if metrics.p95_response_time > 5000:
            bottlenecks.append(f"High P95 response time: {metrics.p95_response_time:.2f}ms")
        
        # High failure rate
        failure_rate = metrics.failed_requests / metrics.request_count * 100
        if failure_rate > 5:
            bottlenecks.append(f"High failure rate: {failure_rate:.1f}%")
        
        # High CPU usage
        if metrics.avg_cpu_usage > 80:
            bottlenecks.append(f"High CPU usage: {metrics.avg_cpu_usage:.1f}%")
        
        # High memory usage
        if metrics.avg_memory_usage > 85:
            bottlenecks.append(f"High memory usage: {metrics.avg_memory_usage:.1f}%")
        
        # Memory growth
        if metrics.memory_growth > 10:
            bottlenecks.append(f"Significant memory growth: {metrics.memory_growth:.1f}%")
        
        # Low throughput
        if metrics.requests_per_second < 10 and self.config.concurrent_users >= 10:
            bottlenecks.append(f"Low throughput: {metrics.requests_per_second:.1f} req/s")
        
        # Rate limiting issues
        rate_limit_rate = metrics.rate_limited_requests / metrics.request_count * 100
        if rate_limit_rate > 30:  # More than 30% rate limited might indicate too aggressive limits
            bottlenecks.append(f"Excessive rate limiting: {rate_limit_rate:.1f}%")
        
        # Analyze endpoint-specific issues
        endpoint_stats = {}
        for result in results:
            endpoint = result.get("endpoint", "unknown")
            if endpoint not in endpoint_stats:
                endpoint_stats[endpoint] = {"count": 0, "errors": 0, "total_time": 0}
            
            endpoint_stats[endpoint]["count"] += 1
            if not result.get("success", False):
                endpoint_stats[endpoint]["errors"] += 1
            endpoint_stats[endpoint]["total_time"] += result.get("response_time", 0)
        
        for endpoint, stats in endpoint_stats.items():
            error_rate = stats["errors"] / stats["count"] * 100
            avg_time = stats["total_time"] / stats["count"]
            
            if error_rate > 10:
                bottlenecks.append(f"High error rate on {endpoint}: {error_rate:.1f}%")
            if avg_time > 3000:
                bottlenecks.append(f"Slow response on {endpoint}: {avg_time:.2f}ms")
        
        return bottlenecks

class FileCleanupVerifier:
    """Verify file cleanup works correctly under load"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.created_files = []
        
    async def verify_cleanup_under_load(self, concurrent_uploads: int = 20) -> Dict[str, Any]:
        """Test file cleanup with multiple concurrent uploads"""
        logger.info(f"Testing file cleanup with {concurrent_uploads} concurrent uploads")
        
        async with aiohttp.ClientSession() as session:
            # Create multiple file uploads
            upload_tasks = []
            for i in range(concurrent_uploads):
                task = self.upload_test_file(session, i)
                upload_tasks.append(task)
            
            # Wait for all uploads
            upload_results = await asyncio.gather(*upload_tasks, return_exceptions=True)
            
            # Extract file IDs from successful uploads
            file_ids = []
            for result in upload_results:
                if isinstance(result, dict) and result.get("success") and "file_id" in result:
                    file_ids.append(result["file_id"])
            
            # Wait a bit for potential cleanup
            await asyncio.sleep(5)
            
            # Test cleanup endpoint for each file
            cleanup_results = []
            for file_id in file_ids:
                try:
                    cleanup_result = await self.test_cleanup(session, file_id)
                    cleanup_results.append(cleanup_result)
                except Exception as e:
                    cleanup_results.append({"success": False, "error": str(e)})
            
            successful_cleanups = sum(1 for r in cleanup_results if r.get("success", False))
            
            return {
                "total_uploads": concurrent_uploads,
                "successful_uploads": len(file_ids),
                "cleanup_tests": len(cleanup_results),
                "successful_cleanups": successful_cleanups,
                "cleanup_success_rate": successful_cleanups / len(cleanup_results) * 100 if cleanup_results else 0
            }
    
    async def upload_test_file(self, session: aiohttp.ClientSession, file_id: int) -> Dict[str, Any]:
        """Upload a test file"""
        pdf_content = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj
xref 0 4
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000109 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref 178
%%EOF"""
        
        try:
            data = aiohttp.FormData()
            data.add_field('file', pdf_content, 
                          filename=f'cleanup_test_{file_id}.pdf',
                          content_type='application/pdf')
            data.add_field('export_format', 'csv')
            
            async with session.post(f"{self.base_url}/extract", data=data) as response:
                result = await response.json()
                if response.status == 200:
                    return {"success": True, "file_id": result.get("file_id")}
                else:
                    return {"success": False, "status": response.status}
                    
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def test_cleanup(self, session: aiohttp.ClientSession, file_id: str) -> Dict[str, Any]:
        """Test cleanup for a specific file"""
        try:
            async with session.delete(f"{self.base_url}/cleanup/{file_id}") as response:
                result = await response.json()
                return {"success": response.status == 200, "result": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

class PerformanceTestSuite:
    """Main performance testing suite with incremental approach"""
    
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.test_levels = [10, 25, 50, 100]  # User counts for incremental testing
        self.results = {}
        
    async def run_incremental_tests(self) -> Dict[str, PerformanceMetrics]:
        """Run incremental load tests with detailed analysis"""
        print("🚀 PDFTablePro Comprehensive Performance Testing Suite")
        print("=" * 60)
        
        all_results = {}
        
        for user_count in self.test_levels:
            print(f"\n📊 Testing with {user_count} concurrent users...")
            
            config = TestConfiguration(
                base_url=self.base_url,
                concurrent_users=user_count,
                requests_per_user=10,
                ramp_up_time=min(user_count // 2, 30),  # Scale ramp-up time
                pdf_test_enabled=True
            )
            
            tester = LoadTester(config)
            
            try:
                metrics = await tester.run_load_test()
                all_results[f"{user_count}_users"] = metrics
                
                # Print results
                self.print_test_results(user_count, metrics)
                
                # Check if system is degrading significantly
                if self.should_stop_testing(metrics):
                    print(f"⚠️  Stopping tests at {user_count} users due to performance degradation")
                    break
                    
                # Wait between tests
                if user_count < max(self.test_levels):
                    print("⏳ Waiting 30 seconds before next test...")
                    await asyncio.sleep(30)
                    
            except Exception as e:
                logger.error(f"Test failed for {user_count} users: {e}")
                all_results[f"{user_count}_users"] = PerformanceMetrics(errors=[str(e)])
        
        return all_results
    
    def should_stop_testing(self, metrics: PerformanceMetrics) -> bool:
        """Determine if testing should stop due to performance issues"""
        # Stop if failure rate is too high
        if metrics.request_count > 0:
            failure_rate = metrics.failed_requests / metrics.request_count
            if failure_rate > 0.5:  # 50% failure rate
                return True
        
        # Stop if response times are too high
        if metrics.avg_response_time > 10000:  # 10 seconds
            return True
        
        # Stop if system resources are maxed
        if metrics.avg_cpu_usage > 95 or metrics.avg_memory_usage > 95:
            return True
        
        return False
    
    def print_test_results(self, user_count: int, metrics: PerformanceMetrics):
        """Print formatted test results"""
        success_rate = (metrics.successful_requests / metrics.request_count * 100) if metrics.request_count > 0 else 0
        
        print(f"\n📈 Results for {user_count} users:")
        print(f"   Total Requests: {metrics.request_count}")
        print(f"   Success Rate: {success_rate:.1f}%")
        print(f"   Rate Limited: {metrics.rate_limited_requests}")
        print(f"   Avg Response Time: {metrics.avg_response_time:.2f}ms")
        print(f"   P95 Response Time: {metrics.p95_response_time:.2f}ms")
        print(f"   P99 Response Time: {metrics.p99_response_time:.2f}ms")
        print(f"   Throughput: {metrics.requests_per_second:.2f} req/s")
        print(f"   CPU Usage: {metrics.avg_cpu_usage:.1f}% avg, {metrics.max_cpu_usage:.1f}% max")
        print(f"   Memory Usage: {metrics.avg_memory_usage:.1f}% avg, {metrics.max_memory_usage:.1f}% max")
        print(f"   Memory Growth: {metrics.memory_growth:.1f}%")
        
        if metrics.bottlenecks_identified:
            print("   ⚠️  Bottlenecks Identified:")
            for bottleneck in metrics.bottlenecks_identified:
                print(f"      • {bottleneck}")
        else:
            print("   ✅ No significant bottlenecks identified")
        
        if metrics.errors:
            print(f"   ❌ Errors ({len(metrics.errors)}):")
            for error in set(metrics.errors[:5]):  # Show unique errors, max 5
                print(f"      • {error}")
    
    async def test_file_cleanup(self) -> Dict[str, Any]:
        """Test file cleanup under load"""
        print("\n🧹 Testing File Cleanup Under Load...")
        
        cleaner = FileCleanupVerifier(self.base_url)
        cleanup_results = await cleaner.verify_cleanup_under_load(concurrent_uploads=20)
        
        print(f"   Total Uploads: {cleanup_results['total_uploads']}")
        print(f"   Successful Uploads: {cleanup_results['successful_uploads']}")
        print(f"   Cleanup Success Rate: {cleanup_results['cleanup_success_rate']:.1f}%")
        
        return cleanup_results
    
    def generate_optimization_recommendations(self, all_results: Dict[str, PerformanceMetrics]) -> List[str]:
        """Generate optimization recommendations based on test results"""
        recommendations = []
        
        # Analyze performance trends across user levels
        user_counts = [10, 25, 50, 100]
        response_times = []
        throughputs = []
        cpu_usage = []
        
        for count in user_counts:
            key = f"{count}_users"
            if key in all_results:
                metrics = all_results[key]
                response_times.append(metrics.avg_response_time)
                throughputs.append(metrics.requests_per_second)
                cpu_usage.append(metrics.avg_cpu_usage)
        
        # Analyze response time scaling
        if len(response_times) >= 2:
            if response_times[-1] > response_times[0] * 3:
                recommendations.append("Response times scale poorly with load. Consider:")
                recommendations.append("  • Implement connection pooling")
                recommendations.append("  • Add response caching for static endpoints")
                recommendations.append("  • Optimize database queries if applicable")
        
        # Analyze throughput scaling
        if len(throughputs) >= 2:
            expected_throughput = throughputs[0] * (user_counts[-1] / user_counts[0])
            actual_throughput = throughputs[-1]
            if actual_throughput < expected_throughput * 0.5:
                recommendations.append("Throughput doesn't scale linearly. Consider:")
                recommendations.append("  • Increase worker processes/threads")
                recommendations.append("  • Implement async processing for heavy operations")
                recommendations.append("  • Add load balancing")
        
        # CPU utilization analysis
        if any(cpu > 80 for cpu in cpu_usage):
            recommendations.append("High CPU usage detected. Consider:")
            recommendations.append("  • Profile CPU-intensive operations")
            recommendations.append("  • Optimize PDF processing algorithms")
            recommendations.append("  • Add CPU-based autoscaling")
        
        # Rate limiting analysis
        high_rate_limiting = False
        for metrics in all_results.values():
            if metrics.request_count > 0:
                rate_limit_rate = metrics.rate_limited_requests / metrics.request_count
                if rate_limit_rate > 0.3:
                    high_rate_limiting = True
                    break
        
        if high_rate_limiting:
            recommendations.append("Excessive rate limiting detected. Consider:")
            recommendations.append("  • Adjust rate limits for higher concurrency")
            recommendations.append("  • Implement user-based rate limiting instead of IP-based")
            recommendations.append("  • Add rate limit exemptions for authenticated users")
        
        # Memory analysis
        high_memory_growth = any(
            metrics.memory_growth > 5 for metrics in all_results.values()
        )
        if high_memory_growth:
            recommendations.append("Memory growth detected. Consider:")
            recommendations.append("  • Implement more aggressive garbage collection")
            recommendations.append("  • Fix memory leaks in PDF processing")
            recommendations.append("  • Add memory limits for long-running processes")
        
        # General scalability recommendations
        max_successful_users = 0
        for count in user_counts:
            key = f"{count}_users"
            if key in all_results:
                metrics = all_results[key]
                if metrics.request_count > 0:
                    success_rate = metrics.successful_requests / metrics.request_count
                    if success_rate > 0.9:  # 90% success rate
                        max_successful_users = count
        
        if max_successful_users < 100:
            recommendations.append(f"System handles up to {max_successful_users} concurrent users reliably.")
            recommendations.append("To support 100+ users, implement:")
            recommendations.append("  • Horizontal scaling with multiple server instances")
            recommendations.append("  • Redis-based rate limiting for distributed systems")
            recommendations.append("  • CDN for static content")
            recommendations.append("  • Database optimization and connection pooling")
        
        if not recommendations:
            recommendations.append("🎉 System performs well under all test loads!")
            recommendations.append("Consider these enhancements for production:")
            recommendations.append("  • Implement monitoring and alerting")
            recommendations.append("  • Add performance metrics collection")
            recommendations.append("  • Set up automated load testing in CI/CD")
        
        return recommendations
    
    def save_results_to_file(self, all_results: Dict[str, PerformanceMetrics], 
                           cleanup_results: Dict[str, Any], 
                           recommendations: List[str]):
        """Save comprehensive results to JSON file"""
        output_file = f"performance_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # Convert metrics to dict for JSON serialization
        json_results = {}
        for key, metrics in all_results.items():
            json_results[key] = asdict(metrics)
        
        full_results = {
            "test_timestamp": datetime.now().isoformat(),
            "load_test_results": json_results,
            "cleanup_test_results": cleanup_results,
            "optimization_recommendations": recommendations,
            "test_configuration": {
                "base_url": self.base_url,
                "user_levels_tested": self.test_levels,
                "system_info": {
                    "cpu_count": psutil.cpu_count(),
                    "memory_total": psutil.virtual_memory().total / 1024 / 1024 / 1024,  # GB
                    "platform": sys.platform
                }
            }
        }
        
        with open(output_file, 'w') as f:
            json.dump(full_results, f, indent=2, default=str)
        
        print(f"\n💾 Detailed results saved to: {output_file}")
        return output_file

async def main():
    """Run comprehensive performance testing suite"""
    suite = PerformanceTestSuite()
    
    # Run incremental load tests
    load_test_results = await suite.run_incremental_tests()
    
    # Test file cleanup
    cleanup_results = await suite.test_file_cleanup()
    
    # Generate recommendations
    recommendations = suite.generate_optimization_recommendations(load_test_results)
    
    # Print final summary
    print("\n" + "="*60)
    print("🎯 PERFORMANCE TEST SUMMARY")
    print("="*60)
    
    for user_level in suite.test_levels:
        key = f"{user_level}_users"
        if key in load_test_results:
            metrics = load_test_results[key]
            success_rate = (metrics.successful_requests / metrics.request_count * 100) if metrics.request_count > 0 else 0
            print(f"{user_level:3d} users: {success_rate:5.1f}% success, "
                  f"{metrics.avg_response_time:6.0f}ms avg, "
                  f"{metrics.requests_per_second:5.1f} req/s")
    
    print(f"\n🧹 File Cleanup: {cleanup_results.get('cleanup_success_rate', 0):.1f}% success rate")
    
    print("\n🔧 OPTIMIZATION RECOMMENDATIONS:")
    for rec in recommendations:
        if rec.startswith("  "):
            print(f"   {rec}")
        else:
            print(f" • {rec}")
    
    # Save results
    results_file = suite.save_results_to_file(load_test_results, cleanup_results, recommendations)
    
    print(f"\n✅ Performance testing completed! Results saved to {results_file}")

if __name__ == "__main__":
    # Check dependencies
    try:
        import aiohttp
        import psutil
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Install with: pip install aiohttp psutil")
        sys.exit(1)
    
    # Run the test suite
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  Testing interrupted by user")
    except Exception as e:
        logger.error(f"Testing failed: {e}")
        sys.exit(1)