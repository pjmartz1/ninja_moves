#!/usr/bin/env python3
"""
Railway Deployment Debug Script
Run this to check for common deployment issues
"""

import sys
import importlib.util
import subprocess
import os

def check_python_version():
    print(f"Python version: {sys.version}")
    return sys.version_info >= (3, 8)

def check_dependencies():
    """Check if all dependencies can be imported"""
    requirements = [
        'fastapi',
        'uvicorn',
        'pypdf',
        'pdfplumber', 
        'pandas',
        'openpyxl',
        'pydantic',
        'supabase',
        'slowapi',
        'python_dotenv'
    ]
    
    failed_imports = []
    
    for package in requirements:
        try:
            __import__(package)
            print(f"OK: {package}")
        except ImportError as e:
            print(f"FAILED: {package} - {e}")
            failed_imports.append(package)
    
    return failed_imports

def check_problematic_dependencies():
    """Check dependencies that commonly cause Railway issues"""
    problematic = {
        'camelot': 'Requires OpenCV and system dependencies',
        'tabula': 'Requires Java Runtime Environment', 
        'magic': 'Platform-specific binary dependencies'
    }
    
    print("\nChecking problematic dependencies:")
    for package, issue in problematic.items():
        try:
            __import__(package)
            print(f"WARNING: {package} - Present ({issue})")
        except ImportError:
            print(f"OK: {package} - Not imported")

def check_environment():
    """Check environment variables"""
    required_env = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    
    print("\nEnvironment variables:")
    for env_var in required_env:
        value = os.environ.get(env_var)
        if value:
            print(f"OK: {env_var} - Set (length: {len(value)})")
        else:
            print(f"MISSING: {env_var} - Not set")

def check_system_dependencies():
    """Check system dependencies"""
    system_deps = ['poppler-utils', 'libgl1-mesa-glx']
    
    print("\nSystem dependencies (may not be available on Railway):")
    for dep in system_deps:
        print(f"REQUIRED: {dep} - Required for PDF processing")

if __name__ == "__main__":
    print("Railway Deployment Debug Check")
    print("=" * 40)
    
    print("\n1. Python Version Check:")
    if not check_python_version():
        print("ERROR: Python version too old")
    else:
        print("OK: Python version acceptable")
    
    print("\n2. Dependency Import Check:")
    failed = check_dependencies()
    
    check_problematic_dependencies()
    
    check_environment()
    
    check_system_dependencies()
    
    print("\n" + "=" * 40)
    print("DEPLOYMENT RECOMMENDATIONS:")
    print("=" * 40)
    
    if failed:
        print("ERROR: Failed imports detected - check requirements.txt")
    
    print("""
Common Railway Fixes:
1. Remove problematic dependencies: camelot-py, tabula-py
2. Use python-magic instead of python-magic-bin for Linux
3. Ensure all environment variables are set in Railway
4. Check Railway build logs for specific error messages
5. Consider using Railway's Python buildpack explicitly

To fix immediately:
- Create a simpler requirements.txt without camelot-py and tabula-py
- Focus on pdfplumber-only extraction for initial deployment
- Add problematic features back one by one after basic deployment works
    """)