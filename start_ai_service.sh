#!/bin/bash

# Start LOOM AI Orchestration Service
echo "🚀 Starting LOOM AI Orchestration Service..."

# Install Ollama if not already installed
if ! command -v ollama &> /dev/null; then
    echo "📦 Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Start Ollama service in background
echo "🦙 Starting Ollama service..."
ollama serve &

# Pull required models
echo "📥 Pulling AI models..."
ollama pull llama3.2:3b
ollama pull mistral:7b

# Start the Python AI service
echo "🧠 Starting LangChain AI service..."
cd python_ai_service
python main.py