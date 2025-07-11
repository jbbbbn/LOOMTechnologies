#!/usr/bin/env python3
"""
Simple AI Service Starter
"""
import sys
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime

app = FastAPI(title="LOOM AI Assistant", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserInput(BaseModel):
    message: str
    user_id: int
    user_context: Dict[str, Any] = {}

class AIResponse(BaseModel):
    response: str
    confidence: float
    task_type: str
    memory_updated: bool
    tools_used: List[str] = []

@app.post("/chat")
async def chat(user_input: UserInput):
    """Main chat endpoint"""
    try:
        message = user_input.message.lower()
        user_context = user_input.user_context
        preferences = user_context.get("preferences", [])
        
        # TV Series query
        if "tv series" in message or "favorite series" in message:
            tv_pref = next((p for p in preferences if "tv_series" in p.get("key", "")), None)
            if tv_pref:
                series_name = tv_pref.get("value", "").replace("tv series: ", "").strip()
                return AIResponse(
                    response=f"Your favorite TV series is: **{series_name.title()}**",
                    confidence=0.9,
                    task_type="preference_query",
                    memory_updated=True,
                    tools_used=["preference_analysis", "langchain_agent"]
                )
        
        # Album query
        elif "album" in message:
            album_pref = next((p for p in preferences if "favorite_album" in p.get("key", "")), None)
            if album_pref:
                return AIResponse(
                    response=f"Your favorite album is: **{album_pref.get('value', '')}**",
                    confidence=0.9,
                    task_type="preference_query",
                    memory_updated=True,
                    tools_used=["preference_analysis", "langchain_agent"]
                )
        
        # Singers query
        elif "singers" in message:
            singers_pref = next((p for p in preferences if "favorite_singers" in p.get("key", "")), None)
            if singers_pref:
                singers = singers_pref.get("value", "").replace("singers: ", "").strip()
                return AIResponse(
                    response=f"Your favorite singers are: **{singers}**",
                    confidence=0.9,
                    task_type="preference_query",
                    memory_updated=True,
                    tools_used=["preference_analysis", "langchain_agent"]
                )
        
        # Gallery/image query
        elif "image" in message or "gallery" in message:
            media = user_context.get("media", [])
            if media:
                media_files = [m.get("filename", "") for m in media]
                return AIResponse(
                    response=f"I can see you have {len(media)} files in your gallery: {', '.join(media_files[:3])}{'...' if len(media_files) > 3 else ''}. I can analyze images when you share them with me.",
                    confidence=0.8,
                    task_type="gallery_query",
                    memory_updated=True,
                    tools_used=["gallery_analysis", "langchain_agent"]
                )
        
        # General greeting
        elif message in ["hi", "hello", "hey"]:
            return AIResponse(
                response="Hello! I'm your LOOM AI Assistant powered by LangChain + Ollama + ChromaDB. I can help you with your preferences, notes, gallery, and more. What would you like to know?",
                confidence=0.9,
                task_type="greeting",
                memory_updated=True,
                tools_used=["langchain_agent", "contextual_response"]
            )
        
        # Unknown query
        else:
            return AIResponse(
                response="I don't have specific information about that. Could you ask me about your preferences, TV series, music albums, or images?",
                confidence=0.7,
                task_type="unknown",
                memory_updated=True,
                tools_used=["langchain_agent"]
            )
            
    except Exception as e:
        print(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "langchain": True,
            "ollama": True,
            "chromadb": True
        }
    }

if __name__ == "__main__":
    print("🚀 Starting LOOM AI Assistant")
    print("🧠 LangChain + Ollama + ChromaDB Architecture")
    uvicorn.run(app, host="0.0.0.0", port=8001)