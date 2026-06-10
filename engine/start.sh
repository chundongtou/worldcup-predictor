#!/bin/bash
# World Cup Prediction Engine - Startup Script
# This script starts the FastAPI prediction server

cd "$(dirname "$0")"

echo "Starting World Cup Prediction Engine..."
echo "API documentation: http://localhost:8000/docs"
echo "Health check: http://localhost:8000/health"
echo ""

# Start the FastAPI server
python api.py
