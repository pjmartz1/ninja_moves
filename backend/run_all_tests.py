"""
Master Test Runner for PDFTablePro Backend
Runs all test suites and generates comprehensive reports
"""

import sys
import os
import asyncio
import time
import json
from pathlib import Path
from datetime import datetime

# Add app directory to path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

class TestRunner:
    """Master test runner with reporting"""
    
    def __init__(self):
        self.results = {
            "start_time": datetime.now().isoformat(),
            "test_suites": {},
            "summary": {},
            "environment": self._get_environment_info()
        }
    
    def _get_environment_info(self):
        """Get environment information"""
        import platform
        
        env_info = {
            "python_version": platform.python_version(),
            "platform": platform.platform(),
            "processor": platform.processor(),
            "architecture": platform.architecture()[0],
            "working_directory": str(Path.cwd())
        }
        
        # Check for required packages
        packages = ["fastapi", "pydantic", "python-magic-bin", "pandas"]
        env_info["packages"] = {}
        
        for package in packages:
            try:
                __import__(package.replace("-", "_"))
                env_info["packages"][package] = "✅ Available"
            except ImportError:
                env_info["packages"][package] = "❌ Missing"
        
        return env_info
    
    def run_test_suite(self, suite_name, test_module):
        """Run a test suite and record results"""
        print(f"\n{'='*60}")
        print(f"Running Test Suite: {suite_name}")
        print(f"{'='*60}")
        
        start_time = time.time()
        
        try:
            # Import and run the test module
            if hasattr(test_module, 'main'):
                if asyncio.iscoroutinefunction(test_module.main):
                    success = asyncio.run(test_module.main())
                else:
                    success = test_module.main()
            else:
                print(f"❌ Test module {suite_name} has no main() function")
                success = False
            
            end_time = time.time()
            duration = end_time - start_time
            
            self.results["test_suites"][suite_name] = {
                "success": success,
                "duration": duration,
                "status": "PASSED" if success else "FAILED"
            }
            
            print(f"\n{suite_name}: {'PASSED' if success else 'FAILED'} ({duration:.2f}s)")
            
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            
            self.results["test_suites"][suite_name] = {
                "success": False,
                "duration": duration,
                "status": "ERROR",
                "error": str(e)
            }
            
            print(f"\n{suite_name}: ERROR ({duration:.2f}s)")
            print(f"Error: {e}")
    
    def generate_report(self):
        """Generate comprehensive test report"""
        end_time = datetime.now()
        self.results["end_time"] = end_time.isoformat()
        
        total_duration = sum(suite["duration"] for suite in self.results["test_suites"].values())
        total_suites = len(self.results["test_suites"])
        passed_suites = sum(1 for suite in self.results["test_suites"].values() if suite["success"])
        
        self.results["summary"] = {
            "total_suites": total_suites,
            "passed_suites": passed_suites,
            "failed_suites": total_suites - passed_suites,
            "success_rate": (passed_suites / total_suites * 100) if total_suites > 0 else 0,
            "total_duration": total_duration
        }
        
        return self.results
    
    def print_summary(self):
        """Print test summary"""
        summary = self.results["summary"]
        
        print(f"\n{'='*60}")
        print("🎯 PDFTABLEPRO BACKEND TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Test Suites: {summary['total_suites']}")
        print(f"Passed: {summary['passed_suites']} ✅")
        print(f"Failed: {summary['failed_suites']} ❌")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        print(f"Total Duration: {summary['total_duration']:.2f}s")
        
        print(f"\n📊 DETAILED RESULTS:")
        for suite_name, result in self.results["test_suites"].items():
            status_emoji = "✅" if result["success"] else "❌"
            print(f"  {status_emoji} {suite_name}: {result['status']} ({result['duration']:.2f}s)")
            if "error" in result:
                print(f"    Error: {result['error']}")
        
        print(f"\n🖥️  ENVIRONMENT:")
        env = self.results["environment"]
        print(f"  Python: {env['python_version']}")
        print(f"  Platform: {env['platform']}")
        print(f"  Architecture: {env['architecture']}")
        
        print(f"\n📦 PACKAGE STATUS:")
        for package, status in env["packages"].items():
            print(f"  {package}: {status}")
        
        # Overall assessment
        if summary["success_rate"] == 100:
            print(f"\n🎉 ALL TESTS PASSED!")
            print("✅ Backend is ready for production deployment")
        elif summary["success_rate"] >= 80:
            print(f"\n⚠️  MOSTLY PASSING ({summary['success_rate']:.1f}%)")
            print("🔧 Review failed tests before deployment")
        else:
            print(f"\n❌ MULTIPLE FAILURES ({summary['success_rate']:.1f}%)")
            print("🚨 Backend needs significant fixes before deployment")

def main():
    """Run all test suites"""
    print("PDFTablePro - Comprehensive Backend Testing")
    print("Starting all test suites...")
    
    runner = TestRunner()
    
    # Define test suites in execution order
    test_suites = [
        ("Security Components", "test_security"),
        ("Supabase Authentication", "test_supabase_auth"),
        ("PDF Processing Engine", "test_pdf_processor"),
        ("API Integration", "test_integration"),
        ("Performance & Load", "test_performance")
    ]
    
    # Run each test suite
    for suite_name, module_name in test_suites:
        try:
            # Import the test module
            test_module = __import__(module_name)
            runner.run_test_suite(suite_name, test_module)
        except ImportError as e:
            print(f"❌ Could not import {module_name}: {e}")
            runner.results["test_suites"][suite_name] = {
                "success": False,
                "duration": 0,
                "status": "IMPORT_ERROR",
                "error": str(e)
            }
        except Exception as e:
            print(f"❌ Error running {suite_name}: {e}")
            runner.results["test_suites"][suite_name] = {
                "success": False,
                "duration": 0,
                "status": "EXECUTION_ERROR", 
                "error": str(e)
            }
    
    # Generate and save report
    results = runner.generate_report()
    
    # Save detailed JSON report
    report_file = Path(__file__).parent / "test_results.json"
    with open(report_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Print summary
    runner.print_summary()
    
    print(f"\n📄 Detailed report saved to: {report_file}")
    
    # Return success status
    return results["summary"]["success_rate"] >= 80

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)