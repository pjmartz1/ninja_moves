FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    poppler-utils \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONPATH="/app"
ENV PYTHONUNBUFFERED=1

# Expose port (Railway will set the PORT env var)
EXPOSE 8000

# Start command - Railway will inject $PORT
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}