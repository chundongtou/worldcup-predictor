@echo off
REM World Cup Prediction Engine - Startup Script
REM This script starts the FastAPI prediction server

cd /d "%~dp0"

echo Starting World Cup Prediction Engine...
echo API documentation: http://localhost:8000/docs
echo Health check: http://localhost:8000/health
echo.

REM Start the FastAPI server
python api.py

pause
