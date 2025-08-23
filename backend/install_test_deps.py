"""
Install Additional Testing Dependencies for PDFTablePro Backend
Ensures all testing tools are available for comprehensive testing
"""

import subprocess
import sys

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def main():
    """Install all testing dependencies"""
    print("PDFTablePro - Installing Testing Dependencies")
    print("=" * 50)
    
    # Core testing packages
    test_packages = [
        "httpx",           # For FastAPI test client
        "pytest-cov",     # Coverage reporting
        "pytest-mock",    # Mocking support
        "requests",       # For HTTP testing
        "python-dotenv",  # Environment variables
        "python-jose[cryptography]",  # JWT handling for Supabase
        "supabase",       # Supabase client
    ]
    
    success_count = 0
    for package in test_packages:
        if install_package(package):
            success_count += 1
    
    print(f"\n📊 Installation Results: {success_count}/{len(test_packages)} packages installed")
    
    if success_count == len(test_packages):
        print("🎉 All testing dependencies installed successfully!")
        print("You can now run the comprehensive test suite.")
    else:
        print("⚠️  Some packages failed to install. Check error messages above.")
    
    return success_count == len(test_packages)

if __name__ == "__main__":
    main()