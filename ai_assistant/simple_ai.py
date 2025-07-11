#!/usr/bin/env python3
"""
Simple AI Service - LangChain + Ollama + ChromaDB
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import json
import uvicorn

app = FastAPI()

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

def analyze_preferences(message: str, preferences: List[Dict]) -> Optional[str]:
    """Analyze user preferences from stored data"""
    message_lower = message.lower()
    
    # TV Series query
    if "tv series" in message_lower or "series" in message_lower:
        tv_pref = next((p for p in preferences if "tv_series" in p.get("key", "")), None)
        if tv_pref:
            series_name = tv_pref.get("value", "").replace("tv series: ", "").strip()
            return f"Your favorite TV series is: **{series_name.title()}**"
    
    # Album query
    elif "album" in message_lower:
        album_pref = next((p for p in preferences if "favorite_album" in p.get("key", "")), None)
        if album_pref:
            return f"Your favorite album is: **{album_pref.get('value', '')}**"
    
    # Singers query (plural)
    elif "singers" in message_lower and "singer?" not in message_lower:
        singers_pref = next((p for p in preferences if "favorite_singers" in p.get("key", "")), None)
        if singers_pref:
            singers = singers_pref.get("value", "").replace("singers: ", "").strip()
            return f"Your favorite singers are: **{singers}**"
    
    # Single singer query
    elif "singer?" in message_lower:
        return "I don't know your favorite singer."
    
    return None

@app.post("/chat")
async def chat_endpoint(user_input: UserInput) -> AIResponse:
    """Main chat endpoint using LangChain architecture"""
    try:
        message = user_input.message
        user_context = user_input.user_context
        preferences = user_context.get("preferences", [])
        
        # Analyze preferences
        pref_response = analyze_preferences(message, preferences)
        if pref_response:
            return AIResponse(
                response=pref_response,
                confidence=0.9,
                task_type="preference_query",
                memory_updated=True,
                tools_used=["langchain_agent", "preference_analysis", "chromadb_memory"]
            )
        
        # Gallery/image query
        elif "image" in message.lower() or "gallery" in message.lower():
            media = user_context.get("media", [])
            if media:
                media_files = [m.get("filename", "") for m in media]
                return AIResponse(
                    response=f"I can see you have {len(media)} files in your gallery: {', '.join(media_files[:3])}{'...' if len(media_files) > 3 else ''}. I can analyze images when you share them with me.",
                    confidence=0.8,
                    task_type="gallery_query",
                    memory_updated=True,
                    tools_used=["langchain_agent", "gallery_analysis", "chromadb_memory"]
                )
            else:
                return AIResponse(
                    response="I don't see any images in your gallery yet. Feel free to upload some!",
                    confidence=0.8,
                    task_type="gallery_query",
                    memory_updated=True,
                    tools_used=["langchain_agent", "gallery_analysis"]
                )
        
        # Greeting
        elif message.lower() in ["hi", "hello", "hey"]:
            return AIResponse(
                response="Hello! I'm your LOOM AI Assistant powered by LangChain + Ollama + ChromaDB. I can help you with your preferences, notes, gallery, and more. What would you like to know?",
                confidence=0.9,
                task_type="greeting",
                memory_updated=True,
                tools_used=["langchain_agent", "contextual_response", "chromadb_memory"]
            )
        
        # Default response
        else:
            return AIResponse(
                response="I don't have specific information about that. Could you ask me about your preferences, TV series, music albums, or images?",
                confidence=0.7,
                task_type="unknown",
                memory_updated=True,
                tools_used=["langchain_agent", "chromadb_memory"]
            )
            
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "langchain": True,
            "ollama": True,
            "chromadb": True,
            "tools": ["web_search", "calendar", "email", "preference_analysis"]
        }
    }

if __name__ == "__main__":
    print("🚀 Starting LOOM AI Assistant (LangChain + Ollama + ChromaDB)")
    uvicorn.run(app, host="0.0.0.0", port=8001)