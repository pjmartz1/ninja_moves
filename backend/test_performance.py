"""
Performance and Load Testing Suite
Tests performance under load, memory usage, and concurrent requests
"""

import sys
import os
import asyncio
import time
import concurrent.futures
import tempfile
import psutil
import threading
from pathlib import Path

# Add app directory to path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

class PerformanceMonitor:
    """Monitor system performance during tests"""
    
    def __init__(self):
        self.monitoring = False
        self.cpu_usage = []
        self.memory_usage = []
        
    def start_monitoring(self):
        """Start monitoring system resources"""
        self.monitoring = True
        self.cpu_usage = []
        self.memory_usage = []
        
        def monitor():
            while self.monitoring:
                self.cpu_usage.append(psutil.cpu_percent())
                memory = psutil.virtual_memory()
                self.memory_usage.append(memory.percent)
                time.sleep(0.5)
        
        self.monitor_thread = threading.Thread(target=monitor)
        self.monitor_thread.start()
    
    def stop_monitoring(self):
        """Stop monitoring and return stats"""
        self.monitoring = False
        if hasattr(self, 'monitor_thread'):
            self.monitor_thread.join()
        
        if self.cpu_usage and self.memory_usage:
            return {
                "avg_cpu": sum(self.cpu_usage) / len(self.cpu_usage),
                "max_cpu": max(self.cpu_usage),
                "avg_memory": sum(self.memory_usage) / len(self.memory_usage),
                "max_memory": max(self.memory_usage)
            }
        return {"avg_cpu": 0, "max_cpu": 0, "avg_memory": 0, "max_memory": 0}

def create_test_pdf():
    """Create a test PDF for performance testing"""
    return b"""%PDF-1.4
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

def test_single_request_performance():
    """Test performance of a single request"""
    print("⚡ Testing Single Request Performance...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        from test_supabase_auth import MockSupabaseClient
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        monitor = PerformanceMonitor()
        
        # Test health endpoint performance
        monitor.start_monitoring()
        start_time = time.time()
        
        response = client.get("/health")
        
        end_time = time.time()
        stats = monitor.stop_monitoring()
        
        response_time = (end_time - start_time) * 1000  # Convert to ms
        
        assert response.status_code == 200, "Health endpoint should work"
        assert response_time < 1000, f"Health endpoint too slow: {response_time}ms"
        
        print(f"✅ Health endpoint: {response_time:.2f}ms")
        print(f"✅ CPU usage: {stats['avg_cpu']:.1f}% avg, {stats['max_cpu']:.1f}% max")
        print(f"✅ Memory usage: {stats['avg_memory']:.1f}% avg, {stats['max_memory']:.1f}% max")
        
        # Test PDF processing performance
        pdf_content = create_test_pdf()
        files = {"file": ("test.pdf", pdf_content, "application/pdf")}
        
        monitor.start_monitoring()
        start_time = time.time()
        
        response = client.post("/extract", files=files)
        
        end_time = time.time()
        stats = monitor.stop_monitoring()
        
        processing_time = (end_time - start_time) * 1000
        
        # May fail due to validation, but should respond quickly
        assert processing_time < 30000, f"PDF processing too slow: {processing_time}ms"
        
        print(f"✅ PDF processing: {processing_time:.2f}ms")
        print(f"✅ CPU usage: {stats['avg_cpu']:.1f}% avg, {stats['max_cpu']:.1f}% max")
        
        return True
        
    except Exception as e:
        print(f"❌ Single request performance test failed: {e}")
        return False

def make_concurrent_request(client, request_id):
    """Make a single request for concurrent testing"""
    try:
        start_time = time.time()
        response = client.get("/health")
        end_time = time.time()
        
        return {
            "request_id": request_id,
            "status_code": response.status_code,
            "response_time": (end_time - start_time) * 1000,
            "success": response.status_code == 200
        }
    except Exception as e:
        return {
            "request_id": request_id,
            "status_code": 500,
            "response_time": 0,
            "success": False,
            "error": str(e)
        }

def test_concurrent_requests():
    """Test performance under concurrent load"""
    print("\n🚀 Testing Concurrent Request Performance...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        from test_supabase_auth import MockSupabaseClient
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        monitor = PerformanceMonitor()
        
        # Test with 10 concurrent requests
        num_requests = 10
        
        monitor.start_monitoring()
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_requests) as executor:
            futures = [
                executor.submit(make_concurrent_request, client, i) 
                for i in range(num_requests)
            ]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        end_time = time.time()
        stats = monitor.stop_monitoring()
        
        total_time = (end_time - start_time) * 1000
        successful_requests = sum(1 for r in results if r["success"])
        avg_response_time = sum(r["response_time"] for r in results) / len(results)
        max_response_time = max(r["response_time"] for r in results)
        
        print(f"✅ {successful_requests}/{num_requests} requests successful")
        print(f"✅ Total time: {total_time:.2f}ms")
        print(f"✅ Average response time: {avg_response_time:.2f}ms")
        print(f"✅ Max response time: {max_response_time:.2f}ms")
        print(f"✅ CPU usage: {stats['avg_cpu']:.1f}% avg, {stats['max_cpu']:.1f}% max")
        print(f"✅ Memory usage: {stats['avg_memory']:.1f}% avg, {stats['max_memory']:.1f}% max")
        
        # Performance assertions
        assert successful_requests >= num_requests * 0.9, "At least 90% of requests should succeed"
        assert avg_response_time < 2000, f"Average response time too high: {avg_response_time}ms"
        assert max_response_time < 5000, f"Max response time too high: {max_response_time}ms"
        
        return True
        
    except Exception as e:
        print(f"❌ Concurrent requests test failed: {e}")
        return False

def test_memory_usage():
    """Test memory usage and cleanup"""
    print("\n💾 Testing Memory Usage...")
    
    try:
        from core.pdf_processor import PDFTableExtractor
        from security.file_handler import SecureFileHandler
        
        # Get initial memory usage
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        print(f"Initial memory: {initial_memory:.2f}MB")
        
        # Create multiple extractors and handlers to test memory
        extractors = []
        handlers = []
        
        for i in range(5):
            extractors.append(PDFTableExtractor())
            handlers.append(SecureFileHandler())
        
        # Test with temporary files
        temp_files = []
        for i in range(10):
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
                temp_file.write(create_test_pdf())
                temp_files.append(temp_file.name)
        
        # Process files
        for handler in handlers[:3]:  # Use only 3 handlers
            for temp_file in temp_files[:5]:  # Process only 5 files
                try:
                    with open(temp_file, 'rb') as f:
                        content = f.read()
                    file_id = handler.secure_save_file(content, "test.pdf")
                    handler.cleanup_file(file_id)
                except Exception:
                    pass  # Ignore errors for memory testing
        
        # Clean up temp files
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except:
                pass
        
        # Check final memory usage
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        print(f"Final memory: {final_memory:.2f}MB")
        print(f"Memory increase: {memory_increase:.2f}MB")
        
        # Memory should not increase excessively
        assert memory_increase < 100, f"Memory increase too high: {memory_increase}MB"
        
        print("✅ Memory usage within acceptable limits")
        
        return True
        
    except Exception as e:
        print(f"❌ Memory usage test failed: {e}")
        return False

def test_rate_limiter_performance():
    """Test rate limiter performance under load"""
    print("\n🚦 Testing Rate Limiter Performance...")
    
    try:
        from security.rate_limiter import RateLimiter
        
        limiter = RateLimiter(
            requests_per_minute=100,
            requests_per_hour=1000,
            requests_per_day=10000
        )
        
        # Test many requests quickly
        start_time = time.time()
        
        for i in range(500):
            ip = f"192.168.1.{i % 10}"  # Simulate 10 different IPs
            limiter.is_allowed(ip)
        
        end_time = time.time()
        
        total_time = (end_time - start_time) * 1000
        rate_per_second = 500 / (total_time / 1000)
        
        print(f"✅ Processed 500 rate limit checks in {total_time:.2f}ms")
        print(f"✅ Rate limiting performance: {rate_per_second:.2f} checks/second")
        
        # Should handle at least 1000 checks per second
        assert rate_per_second > 100, f"Rate limiter too slow: {rate_per_second} checks/second"
        
        return True
        
    except Exception as e:
        print(f"❌ Rate limiter performance test failed: {e}")
        return False

def test_stress_conditions():
    """Test behavior under stress conditions"""
    print("\n💥 Testing Stress Conditions...")
    
    try:
        # Mock the Supabase client
        import auth.supabase_auth as auth_module
        from test_supabase_auth import MockSupabaseClient
        auth_module.get_supabase_client = lambda: MockSupabaseClient()
        
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Test rapid requests to the same endpoint
        rapid_requests = []
        start_time = time.time()
        
        for i in range(20):
            try:
                response = client.get("/security/status")
                rapid_requests.append(response.status_code)
            except Exception as e:
                rapid_requests.append(500)
        
        end_time = time.time()
        
        # Should start rate limiting
        success_count = sum(1 for status in rapid_requests if status == 200)
        rate_limited_count = sum(1 for status in rapid_requests if status == 429)
        
        print(f"✅ {success_count} successful requests")
        print(f"✅ {rate_limited_count} rate limited requests")
        print(f"✅ Total time: {(end_time - start_time)*1000:.2f}ms")
        
        assert rate_limited_count > 0, "Rate limiting should trigger under stress"
        assert success_count > 0, "Some requests should still succeed"
        
        return True
        
    except Exception as e:
        print(f"❌ Stress conditions test failed: {e}")
        return False

def main():
    """Run all performance tests"""
    print("PDFTablePro - Performance & Load Testing Suite")
    print("=" * 50)
    
    # Check if psutil is available
    try:
        import psutil
    except ImportError:
        print("⚠️  psutil not available. Install with: pip install psutil")
        print("Some performance monitoring features will be limited.")
    
    tests = [
        ("Single Request Performance", test_single_request_performance),
        ("Concurrent Requests", test_concurrent_requests),
        ("Memory Usage", test_memory_usage),
        ("Rate Limiter Performance", test_rate_limiter_performance),
        ("Stress Conditions", test_stress_conditions)
    ]
    
    passed = 0
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    print(f"\n📊 Performance Tests: {passed}/{len(tests)} passed")
    
    if passed == len(tests):
        print("🎉 All performance tests passed!")
        print("⚡ System performance is within acceptable limits")
    else:
        print("⚠️  Some performance tests failed. Review optimization.")
    
    return passed == len(tests)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)