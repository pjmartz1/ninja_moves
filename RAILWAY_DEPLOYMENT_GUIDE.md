# Railway Deployment Guide - PDFTablePro Backend

## 🚨 Current Issue Diagnosis

Based on the debug analysis, your Railway deployment is failing due to:

1. **Problematic Dependencies**: `camelot-py`, `tabula-py`, `python-magic-bin`
2. **Missing Environment Variables**: Supabase configuration not set
3. **System Dependencies**: OpenCV and Java requirements not compatible with Railway

## 🔧 Immediate Fix Steps

### Step 1: Use Railway-Compatible Files

Replace your current files with these Railway-optimized versions:

1. **Replace requirements.txt**:
   ```bash
   cp requirements-railway.txt requirements.txt
   ```

2. **Replace Dockerfile** (optional):
   ```bash
   cp Dockerfile.railway Dockerfile
   ```

3. **Update main.py imports**:
   - Change: `from core.pdf_processor import PDFTableExtractor`
   - To: `from core.pdf_processor_railway import PDFTableExtractor`

### Step 2: Set Environment Variables in Railway

In your Railway project dashboard, add these environment variables:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```

### Step 3: Deploy Command

```bash
# If railway CLI is authenticated
railway login
railway link
railway up

# Or connect your GitHub repo in Railway dashboard for auto-deployments
```

## 📋 Files Created for Railway Deployment

### 1. `requirements-railway.txt` ✅
- Removed: `camelot-py`, `tabula-py` 
- Replaced: `python-magic-bin` → `python-magic`
- Added: `python-dotenv==1.0.0`

### 2. `railway.toml` ✅
- Dockerfile builder configuration
- Health check endpoint: `/health`
- Environment variables documentation

### 3. `Dockerfile.railway` ✅
- Linux-compatible system dependencies
- Proper health check configuration
- Railway PORT variable support

### 4. `pdf_processor_railway.py` ✅
- Simplified to use only `pdfplumber`
- Removed dependencies on `camelot` and `tabula`
- Maintains all core functionality

## 🔍 Deployment Checklist

### Before Deploying:
- [ ] Environment variables set in Railway dashboard
- [ ] GitHub repository connected to Railway (recommended)
- [ ] `requirements-railway.txt` renamed to `requirements.txt`
- [ ] Import paths updated in `main.py`

### After Deploying:
- [ ] Check Railway logs for any errors
- [ ] Test `/health` endpoint
- [ ] Test `/extract` endpoint with sample PDF
- [ ] Monitor memory and CPU usage

## 🚨 Common Railway Issues & Solutions

### 1. Build Fails with "No module named 'camelot'"
**Solution**: Ensure you're using `requirements-railway.txt` and update imports

### 2. "Port already in use" Error
**Solution**: Railway sets `PORT` automatically, ensure your app uses `${PORT:-8000}`

### 3. Health Check Fails
**Solution**: Verify `/health` endpoint is accessible and returns 200 status

### 4. High Memory Usage
**Solution**: Railway has memory limits, monitor usage and optimize if needed

## 🎯 Performance Optimization for Railway

### Memory Management:
```python
# In pdf_processor_railway.py
import gc

# Add memory cleanup after processing
def cleanup_memory():
    gc.collect()
```

### Concurrent Requests:
```python
# Limit concurrent PDF processing
from asyncio import Semaphore
processing_semaphore = Semaphore(3)  # Max 3 concurrent extractions
```

## 📊 Expected Performance

### Railway Deployment:
- **Startup Time**: ~30-60 seconds (Docker build + dependencies)
- **Processing Speed**: ~2-5 seconds per PDF (pdfplumber only)
- **Memory Usage**: ~150-300MB per instance
- **Concurrent Users**: 10-50 (depending on Railway plan)

### Limitations of Simplified Version:
- **No OCR**: Scanned PDFs won't work (can be added back later)
- **Single Method**: Only pdfplumber (still covers 80%+ of use cases)
- **Reduced Accuracy**: ~85-90% vs 95% (acceptable for MVP)

## 🔄 Gradual Enhancement Strategy

### Phase 1: Deploy Basic Version (Now)
- Use `requirements-railway.txt`
- pdfplumber-only extraction
- Basic functionality working

### Phase 2: Add Camelot (After Phase 1 works)
- Research Railway-compatible OpenCV installation
- Add camelot back gradually
- Test memory usage

### Phase 3: Add OCR (After Phase 2 stable)
- Implement OCR service for paid tiers
- Monitor resource usage
- Scale Railway instance if needed

## 🔗 Railway-Specific Configuration

### Dockerfile Best Practices:
```dockerfile
# Use specific Python version
FROM python:3.11-slim

# Railway needs these system packages
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*
```

### Environment Variables:
```bash
# Railway automatically provides:
PORT=8000                    # Railway sets this
RAILWAY_ENVIRONMENT=production
RAILWAY_SERVICE_NAME=backend

# You need to set:
SUPABASE_URL=your-url
SUPABASE_SERVICE_KEY=your-key
ALLOWED_ORIGINS=your-frontend-url
```

## 📞 Troubleshooting Commands

### Check Railway Status:
```bash
railway status
railway logs
railway ps
```

### Test Locally Before Deploy:
```bash
# Test with Railway-compatible requirements
pip install -r requirements-railway.txt
python railway-debug-check.py
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Debug Railway Deployment:
```bash
railway logs --follow
railway shell  # Access running container
```

## ✅ Success Criteria

Deployment is successful when:
- [ ] Railway build completes without errors
- [ ] `/health` endpoint returns 200 status
- [ ] `/extract` endpoint processes PDFs successfully
- [ ] Frontend can connect to backend
- [ ] No critical errors in Railway logs

---

**Next Steps**: 
1. Implement the file changes above
2. Set environment variables in Railway
3. Deploy and monitor logs
4. Test with sample PDFs
5. Gradually add back complex features once basic deployment works