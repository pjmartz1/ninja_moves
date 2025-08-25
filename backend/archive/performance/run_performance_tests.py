"""
Performance Test Runner for PDFTablePro
Provides easy interface to run different types of performance tests.
"""

import asyncio
import sys
import os
import subprocess
import importlib.util
from pathlib import Path

class PerformanceTestRunner:
    """Orchestrates performance testing"""
    
    def __init__(self):
        self.backend_dir = Path(__file__).parent
        self.base_url = "http://localhost:8000"
        
    def check_dependencies(self) -> bool:
        """Check if required dependencies are installed"""
        required_packages = ['aiohttp', 'psutil']
        missing = []
        
        for package in required_packages:
            try:
                __import__(package)
            except ImportError:
                missing.append(package)
        
        if missing:
            print(f"❌ Missing required packages: {', '.join(missing)}")
            print("Install with: pip install aiohttp psutil")
            return False
        
        return True
    
    def check_server_running(self) -> bool:
        """Check if backend server is accessible"""
        try:
            import requests
            response = requests.get(f"{self.base_url}/health", timeout=5)
            return response.status_code == 200
        except:
            try:
                # Alternative check with aiohttp
                import aiohttp
                import asyncio
                
                async def check():
                    async with aiohttp.ClientSession() as session:
                        try:
                            async with session.get(f"{self.base_url}/health", timeout=aiohttp.ClientTimeout(total=5)) as resp:
                                return resp.status == 200
                        except:
                            return False
                
                return asyncio.run(check())
            except:
                return False
    
    async def run_quick_test(self):
        """Run quick load test"""
        print("🚀 Running Quick Performance Test...")
        
        try:
            from quick_load_test import main as quick_main
            await quick_main()
            return True
        except Exception as e:
            print(f"❌ Quick test failed: {e}")
            return False
    
    async def run_comprehensive_test(self):
        """Run comprehensive performance test suite"""
        print("🔥 Running Comprehensive Performance Test Suite...")
        print("⚠️  This may take 10-15 minutes to complete")
        
        try:
            from performance_testing_comprehensive import main as comprehensive_main
            await comprehensive_main()
            return True
        except Exception as e:
            print(f"❌ Comprehensive test failed: {e}")
            return False
    
    async def run_existing_test(self):
        """Run existing performance test"""
        print("⚡ Running Existing Performance Test...")
        
        test_file = self.backend_dir / "test_performance.py"
        if test_file.exists():
            try:
                # Import and run the existing test
                spec = importlib.util.spec_from_file_location("test_performance", test_file)
                test_module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(test_module)
                
                if hasattr(test_module, 'main'):
                    result = test_module.main()
                    return result
                else:
                    print("❌ No main() function found in test_performance.py")
                    return False
            except Exception as e:
                print(f"❌ Existing test failed: {e}")
                return False
        else:
            print("❌ test_performance.py not found")
            return False
    
    def show_menu(self):
        """Display test options menu"""
        print("\n" + "=" * 50)
        print("PDFTablePro Performance Testing Suite")
        print("=" * 50)
        print("1. Quick Load Test (2-3 minutes)")
        print("2. Comprehensive Test Suite (10-15 minutes)")
        print("3. Run Existing Performance Test")
        print("4. Check System Requirements")
        print("5. View Performance Guide")
        print("0. Exit")
        print("-" * 50)
    
    def view_performance_guide(self):
        """Display performance optimization guide"""
        guide_file = self.backend_dir / "PERFORMANCE_OPTIMIZATION_GUIDE.md"
        if guide_file.exists():
            print("\n📖 Performance Optimization Guide:")
            print("-" * 40)
            
            # Read first few sections of the guide
            with open(guide_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                
            in_overview = False
            section_count = 0
            
            for line in lines:
                if line.startswith('## '):
                    section_count += 1
                    if section_count > 3:  # Show only first 3 sections in menu
                        break
                    print(line.rstrip())
                    in_overview = True
                elif line.startswith('### ') and in_overview:
                    print(line.rstrip())
                elif in_overview and line.strip():
                    print(line.rstrip())
                elif not line.strip():
                    print()
            
            print(f"\n📁 Full guide available at: {guide_file}")
        else:
            print("❌ Performance guide not found")
    
    def check_system_requirements(self):
        """Check system requirements and configuration"""
        print("\n🔍 System Requirements Check:")
        print("-" * 30)
        
        # Check Python version
        python_version = sys.version.split()[0]
        print(f"Python Version: {python_version}")
        if sys.version_info >= (3, 8):
            print("✅ Python version is compatible")
        else:
            print("❌ Python 3.8+ required")
        
        # Check dependencies
        print(f"\nDependency Check:")
        if self.check_dependencies():
            print("✅ All required packages installed")
        else:
            print("❌ Missing dependencies")
        
        # Check server
        print(f"\nServer Check ({self.base_url}):")
        if self.check_server_running():
            print("✅ Backend server is running and accessible")
        else:
            print("❌ Backend server not accessible")
            print("   Start server with: python backend/start_server.py")
        
        # Check system resources
        try:
            import psutil
            cpu_count = psutil.cpu_count()
            memory_gb = psutil.virtual_memory().total / (1024**3)
            print(f"\nSystem Resources:")
            print(f"   CPU Cores: {cpu_count}")
            print(f"   Total Memory: {memory_gb:.1f} GB")
            
            if cpu_count >= 4 and memory_gb >= 8:
                print("✅ System resources adequate for testing")
            else:
                print("⚠️  Limited system resources - tests may run slower")
        except ImportError:
            print("⚠️  Cannot check system resources (psutil not available)")
    
    async def main(self):
        """Main interactive menu"""
        while True:
            self.show_menu()
            
            try:
                choice = input("\nEnter your choice (0-5): ").strip()
                
                if choice == '0':
                    print("👋 Goodbye!")
                    break
                elif choice == '1':
                    if not self.check_dependencies() or not self.check_server_running():
                        print("❌ Prerequisites not met. Please resolve issues first.")
                        continue
                    await self.run_quick_test()
                elif choice == '2':
                    if not self.check_dependencies() or not self.check_server_running():
                        print("❌ Prerequisites not met. Please resolve issues first.")
                        continue
                    await self.run_comprehensive_test()
                elif choice == '3':
                    if not self.check_server_running():
                        print("❌ Server not running. Please start backend server first.")
                        continue
                    await self.run_existing_test()
                elif choice == '4':
                    self.check_system_requirements()
                elif choice == '5':
                    self.view_performance_guide()
                else:
                    print("❌ Invalid choice. Please select 0-5.")
                
                if choice in ['1', '2', '3']:
                    input("\nPress Enter to continue...")
                    
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")

def run_single_test(test_type: str):
    """Run a single test type directly"""
    runner = PerformanceTestRunner()
    
    if not runner.check_dependencies():
        sys.exit(1)
    
    if not runner.check_server_running():
        print("❌ Backend server not accessible at http://localhost:8000")
        print("Start server with: python backend/start_server.py")
        sys.exit(1)
    
    if test_type == "quick":
        asyncio.run(runner.run_quick_test())
    elif test_type == "comprehensive": 
        asyncio.run(runner.run_comprehensive_test())
    elif test_type == "existing":
        asyncio.run(runner.run_existing_test())
    else:
        print(f"❌ Unknown test type: {test_type}")
        print("Available types: quick, comprehensive, existing")
        sys.exit(1)

if __name__ == "__main__":
    # Check for command line arguments
    if len(sys.argv) > 1:
        test_type = sys.argv[1].lower()
        run_single_test(test_type)
    else:
        # Interactive mode
        runner = PerformanceTestRunner()
        try:
            asyncio.run(runner.main())
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
        except Exception as e:
            print(f"❌ Runner error: {e}")
            sys.exit(1)