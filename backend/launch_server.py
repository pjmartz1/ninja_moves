"""
Proper launcher for FastAPI server with fixed imports
"""

import sys
import os
from pathlib import Path

# Add both the backend directory and app directory to Python path
backend_dir = Path(__file__).parent
app_dir = backend_dir / "app"
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(app_dir))

# Change imports to absolute
import uvicorn

def start_server():
    print("Starting PDFTablePro Backend Server...")
    print("Environment validation:")
    print(f"- Backend dir: {backend_dir}")
    print(f"- App dir: {app_dir}")
    print(f"- Python path includes: {[str(backend_dir), str(app_dir)]}")
    
    # Start with absolute module path
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    start_server()