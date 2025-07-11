#!/bin/bash

# Kill any existing Python AI service
pkill -f "python.*simple_ai" 2>/dev/null || true
sleep 2

# Start the Python AI service in the background
cd ai_assistant
nohup python3 simple_ai.py > service.log 2>&1 &
sleep 3

# Check if service is running
if curl -s http://localhost:8001/health > /dev/null; then
    echo "🚀 Python AI Service started successfully on port 8001"
else
    echo "❌ Failed to start Python AI Service"
    exit 1
fi