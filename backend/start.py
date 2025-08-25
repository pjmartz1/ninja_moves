#!/usr/bin/env python3
"""
Railway Deployment Entry Point
Simple start script for Railway deployment
"""

import os
import sys

# Add the app directory to Python path
app_dir = os.path.join(os.path.dirname(__file__), "app")
sys.path.insert(0, app_dir)

if __name__ == "__main__":
    import uvicorn
    from main import app
    
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)