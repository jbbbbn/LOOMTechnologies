"""
ChromaDB Vector Memory Management
"""

import chromadb
from chromadb.config import Settings
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

class ChromaDBManager:
    def __init__(self, persist_directory: str = "data/chromadb"):
        self.client = None
        self.collection = None
        self.persist_directory = persist_directory
        self._initialize_chromadb()
    
    def _initialize_chromadb(self):
        """Initialize ChromaDB client and collection"""
        try:
            self.client = chromadb.PersistentClient(path=self.persist_directory)
            self.collection = self.client.get_or_create_collection(
                name="user_memory",
                metadata={"description": "User conversation and context memory"}
            )
            print("✅ ChromaDB initialized successfully")
        except Exception as e:
            print(f"❌ ChromaDB initialization failed: {e}")
            self.client = None
            self.collection = None
    
    async def store_conversation(self, user_id: int, message: str, response: str, 
                               task_type: str, tools_used: List[str]):
        """Store conversation in vector memory"""
        try:
            if not self.collection:
                return
            
            doc_id = f"user_{user_id}_{datetime.now().timestamp()}"
            conversation_text = f"User: {message}\nAssistant: {response}"
            
            metadata = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "task_type": task_type,
                "tools_used": json.dumps(tools_used),
                "message": message,
                "response": response
            }
            
            self.collection.add(
                documents=[conversation_text],
                metadatas=[metadata],
                ids=[doc_id]
            )
            
            print(f"✅ Conversation stored for user {user_id}")
            
        except Exception as e:
            print(f"❌ Failed to store conversation: {e}")
    
    async def store_user_context(self, user_id: int, context: Dict[str, Any]):
        """Store user context in vector memory"""
        try:
            if not self.collection:
                return
            
            doc_id = f"context_{user_id}_{datetime.now().timestamp()}"
            context_text = json.dumps(context, indent=2)
            
            metadata = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "type": "user_context",
                "preferences_count": len(context.get("preferences", [])),
                "notes_count": len(context.get("notes", [])),
                "events_count": len(context.get("events", []))
            }
            
            self.collection.add(
                documents=[context_text],
                metadatas=[metadata],
                ids=[doc_id]
            )
            
        except Exception as e:
            print(f"❌ Failed to store user context: {e}")
    
    def search_memory(self, user_id: int, query: str, n_results: int = 5) -> List[Dict]:
        """Search user's memory using vector similarity"""
        try:
            if not self.collection:
                return []
            
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where={"user_id": user_id}
            )
            
            if not results["documents"]:
                return []
            
            # Format results
            formatted_results = []
            for i, doc in enumerate(results["documents"][0]):
                metadata = results["metadatas"][0][i] if results["metadatas"] else {}
                formatted_results.append({
                    "content": doc,
                    "metadata": metadata,
                    "distance": results["distances"][0][i] if results["distances"] else 0.0
                })
            
            return formatted_results
            
        except Exception as e:
            print(f"❌ Memory search failed: {e}")
            return []
    
    def get_user_memory_stats(self, user_id: int) -> Dict[str, Any]:
        """Get user's memory statistics"""
        try:
            if not self.collection:
                return {"user_id": user_id, "total_memories": 0, "status": "ChromaDB not available"}
            
            # Get all user's memories
            results = self.collection.get(
                where={"user_id": user_id}
            )
            
            total_memories = len(results["documents"]) if results["documents"] else 0
            
            # Count by type
            conversations = 0
            contexts = 0
            
            if results["metadatas"]:
                for metadata in results["metadatas"]:
                    if metadata.get("type") == "user_context":
                        contexts += 1
                    else:
                        conversations += 1
            
            return {
                "user_id": user_id,
                "total_memories": total_memories,
                "conversations": conversations,
                "contexts": contexts,
                "last_updated": datetime.now().isoformat(),
                "status": "active"
            }
            
        except Exception as e:
            return {"user_id": user_id, "error": str(e), "status": "error"}
    
    def check_status(self) -> bool:
        """Check if ChromaDB is available"""
        return self.client is not None and self.collection is not None
    
    def get_recent_conversations(self, user_id: int, limit: int = 10) -> List[Dict]:
        """Get user's recent conversations"""
        try:
            if not self.collection:
                return []
            
            results = self.collection.get(
                where={"user_id": user_id},
                limit=limit
            )
            
            if not results["documents"]:
                return []
            
            conversations = []
            for i, doc in enumerate(results["documents"]):
                metadata = results["metadatas"][i] if results["metadatas"] else {}
                if metadata.get("type") != "user_context":  # Skip context entries
                    conversations.append({
                        "message": metadata.get("message", ""),
                        "response": metadata.get("response", ""),
                        "timestamp": metadata.get("timestamp", ""),
                        "task_type": metadata.get("task_type", ""),
                        "tools_used": json.loads(metadata.get("tools_used", "[]"))
                    })
            
            # Sort by timestamp (newest first)
            conversations.sort(key=lambda x: x["timestamp"], reverse=True)
            return conversations[:limit]
            
        except Exception as e:
            print(f"❌ Failed to get recent conversations: {e}")
            return []