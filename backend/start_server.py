"""
FastAPI Server Startup Script
Starts the PDF Table Extractor API server with P0 security measures
"""

import sys
import os
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

def start_server():
    """Start the FastAPI server"""
    try:
        import uvicorn
        from main import app
        
        print("Starting PDF Table Extractor API Server...")
        print("P0 Security measures active:")
        print("- Rate limiting enabled")
        print("- File validation active") 
        print("- Secure file handling enabled")
        print("- Path traversal protection active")
        print()
        print("Server will be available at: http://localhost:8000")
        print("API documentation at: http://localhost:8000/docs")
        print()
        
        # Start server
        uvicorn.run(
            "main:app",
            host="127.0.0.1",  # Localhost only for security
            port=8000,
            reload=True,  # Auto-reload during development
            log_level="info"
        )
        
    except ImportError as e:
        print(f"Error: Missing dependency - {e}")
        print("Please install required packages:")
        print("pip install fastapi uvicorn")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()