#!/usr/bin/env python3
"""
Personal AI Assistant Entry Point
System: LangChain + Ollama + ChromaDB + Tools
"""

import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime

from agents.assistant_agent import AssistantAgent
from memory.chromadb_utils import ChromaDBManager
from tools.web_search import WebSearchTool
from tools.google_calendar import GoogleCalendarTool
from tools.email_reader import EmailReaderTool
# from tools.image_analyzer import ImageAnalyzerTool

app = FastAPI(title="Personal AI Assistant", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core components
memory_manager = ChromaDBManager()
assistant = AssistantAgent(memory_manager)

class UserInput(BaseModel):
    message: str
    user_id: int
    user_context: Dict[str, Any] = {}
    task_type: Optional[str] = None

class AssistantResponse(BaseModel):
    response: str
    confidence: float
    task_type: str
    memory_updated: bool
    tools_used: List[str] = []

@app.post("/chat", response_model=AssistantResponse)
async def chat_with_assistant(user_input: UserInput):
    """Main chat endpoint using LangChain orchestration"""
    try:
        # Process user input through LangChain agent
        result = await assistant.process_input(
            message=user_input.message,
            user_id=user_input.user_id,
            user_context=user_input.user_context
        )
        
        return AssistantResponse(
            response=result["response"],
            confidence=result["confidence"],
            task_type=result["task_type"],
            memory_updated=result["memory_updated"],
            tools_used=result["tools_used"]
        )
        
    except Exception as e:
        print(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "langchain": True,
            "ollama": assistant.check_ollama_status(),
            "chromadb": memory_manager.check_status(),
            "tools": {
                "web_search": WebSearchTool().check_status(),
                "calendar": GoogleCalendarTool().check_status(),
                "email": EmailReaderTool().check_status(),
                "image_analysis": False  # ImageAnalyzerTool().check_status()
            }
        }
    }

@app.get("/memory/{user_id}")
async def get_user_memory(user_id: int):
    """Get user's memory statistics"""
    try:
        stats = memory_manager.get_user_memory_stats(user_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting Personal AI Assistant")
    print("🧠 LangChain + Ollama + ChromaDB Architecture")
    print("🔧 Tools: Tavily, Google Calendar, Gmail, CLIP")
    
    # Create necessary directories
    os.makedirs("data/notes", exist_ok=True)
    os.makedirs("data/images", exist_ok=True)
    os.makedirs("data/logs", exist_ok=True)
    
    uvicorn.run(app, host="0.0.0.0", port=8001)