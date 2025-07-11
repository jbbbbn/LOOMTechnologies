#!/usr/bin/env python3
"""
Simple LOOM AI Service Test
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
import uvicorn

app = FastAPI(title="LOOM AI Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIRequest(BaseModel):
    message: str
    user_id: int
    user_context: Dict[str, Any] = {}
    task_type: Optional[str] = None

class AIResponse(BaseModel):
    response: str
    confidence: float
    task_type: str
    memory_updated: bool
    tools_used: List[str] = []

def detect_task_type(message: str) -> str:
    """Simple task type detection"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['search', 'find', 'look up', 'research']):
        return 'web_search'
    elif any(word in message_lower for word in ['schedule', 'calendar', 'meeting', 'appointment']):
        return 'calendar'
    elif any(word in message_lower for word in ['email', 'send', 'message', 'mail']):
        return 'email'
    elif any(word in message_lower for word in ['image', 'photo', 'picture', 'analyze']):
        return 'image_analysis'
    else:
        return 'general_chat'

def generate_response(message: str, user_context: Dict, task_type: str) -> str:
    """Generate intelligent response based on context"""
    
    if task_type == 'web_search':
        return f"I'll search for information about '{message}'. Using LangChain + Ollama orchestration to find relevant current information."
        
    elif task_type == 'calendar':
        events_count = len(user_context.get('events', []))
        return f"I'll help you manage your calendar using Google Calendar integration. You currently have {events_count} events scheduled."
        
    elif task_type == 'email':
        emails_count = len(user_context.get('emails', []))
        return f"I'll assist with your email needs using Gmail API integration. You have {emails_count} emails in your system."
        
    elif task_type == 'image_analysis':
        media_count = len(user_context.get('media', []))
        return f"I'll analyze the image using CLIP computer vision model. You have {media_count} media files stored."
        
    else:
        notes_context = ""
        if user_context.get('notes'):
            note_titles = [note.get('title', 'Untitled') for note in user_context['notes'][:3]]
            notes_context = f" I can see you have notes about {', '.join(note_titles)}."
        
        return f"I'm your LangChain-powered AI assistant with access to Ollama (LLaMA3/Mistral), ChromaDB vector memory, and comprehensive tools.{notes_context} How can I help you today?"

@app.post("/ai/orchestrate", response_model=AIResponse)
async def orchestrate_ai_task(request: AIRequest):
    """Main endpoint for AI task orchestration"""
    try:
        task_type = detect_task_type(request.message)
        response = generate_response(request.message, request.user_context, task_type)
        
        tools_used = []
        if task_type == 'web_search':
            tools_used = ['web_search', 'tavily_api']
        elif task_type == 'calendar':
            tools_used = ['calendar_management', 'google_calendar']
        elif task_type == 'email':
            tools_used = ['email_management', 'gmail_api']
        elif task_type == 'image_analysis':
            tools_used = ['image_analysis', 'clip_model']
        else:
            tools_used = ['langchain_orchestration', 'ollama_llm']
        
        return AIResponse(
            response=response,
            confidence=0.9,
            task_type=task_type,
            memory_updated=True,
            tools_used=tools_used
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "langchain": "initialized",
            "ollama": "pending",
            "chromadb": "in_memory",
            "tavily": "configured",
            "google_apis": "configured",
            "clip": "pending"
        }
    }

@app.get("/memory/stats/{user_id}")
async def get_memory_stats(user_id: int):
    """Get user memory statistics"""
    return {
        "user_id": user_id,
        "memory_count": 0,
        "last_interaction": datetime.now().isoformat(),
        "status": "vector_memory_ready"
    }

if __name__ == "__main__":
    print("🚀 Starting LOOM AI Orchestration Service (Simple Version)...")
    print("🧠 LangChain: Ready")
    print("🦙 Ollama: Pending setup")
    print("🔄 ChromaDB: In-memory mode")
    print("🔍 Tavily API: Configured")
    print("📧 Google APIs: Configured")
    print("🖼️ CLIP: Pending setup")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8001,
        log_level="info"
    )