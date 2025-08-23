@echo off
echo PDFTablePro Backend Testing Helper
echo ===================================

echo.
echo Setting up Python environment...
cd /d "%~dp0"

echo.
echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

echo.
echo Installing test dependencies...
python install_test_deps.py
if %errorlevel% neq 0 (
    echo WARNING: Some dependencies failed to install
)

echo.
echo Setting up test environment...
if not exist .env (
    echo Creating .env from template...
    copy .env.test .env
    echo.
    echo IMPORTANT: Please edit .env file with your Supabase credentials
    echo Press any key when ready to continue...
    pause >nul
)

echo.
echo Running comprehensive test suite...
python run_all_tests.py

echo.
echo Test run completed. Check test_results.json for detailed results.
echo.
pause