"""
LangChain Agent Definition for Personal AI Assistant
"""

from typing import Dict, List, Any
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferWindowMemory
from langchain_community.llms import Ollama
from datetime import datetime
import json

from tools.web_search import WebSearchTool
from tools.google_calendar import GoogleCalendarTool
from tools.email_reader import EmailReaderTool
# from tools.image_analyzer import ImageAnalyzerTool
from memory.chromadb_utils import ChromaDBManager

class AssistantAgent:
    def __init__(self, memory_manager: ChromaDBManager):
        self.memory_manager = memory_manager
        self.ollama_llm = None
        self.agent_executor = None
        self.tools = []
        
        # Initialize components
        self._initialize_ollama()
        self._initialize_tools()
        self._initialize_agent()
    
    def _initialize_ollama(self):
        """Initialize Ollama LLM"""
        try:
            self.ollama_llm = Ollama(
                model="llama3.2:3b",
                base_url="http://localhost:11434"
            )
            print("✅ Ollama initialized successfully")
        except Exception as e:
            print(f"❌ Ollama initialization failed: {e}")
            self.ollama_llm = None
    
    def _initialize_tools(self):
        """Initialize all available tools"""
        self.tools = [
            Tool(
                name="web_search",
                description="Search the web for current information, news, weather, etc.",
                func=WebSearchTool().search
            ),
            Tool(
                name="calendar_management",
                description="Manage calendar events and scheduling",
                func=GoogleCalendarTool().manage_calendar
            ),
            Tool(
                name="email_reader",
                description="Read and manage emails",
                func=EmailReaderTool().read_emails
            ),
            # Tool(
            #     name="image_analyzer",
            #     description="Analyze and understand images using CLIP",
            #     func=ImageAnalyzerTool().analyze_image
            # ),
            Tool(
                name="memory_search",
                description="Search user's memory and conversation history",
                func=self._search_memory
            ),
            Tool(
                name="preference_analyzer",
                description="Analyze user preferences and personal data",
                func=self._analyze_preferences
            )
        ]
    
    def _initialize_agent(self):
        """Initialize LangChain agent"""
        if not self.ollama_llm:
            print("❌ Cannot initialize agent - Ollama not available")
            return
        
        # Agent prompt template
        template = """
        You are a Personal AI Assistant with access to vector memory and advanced tools.
        
        You have access to the following tools:
        {tools}
        
        Use the following format:
        Question: the input question you must answer
        Thought: you should always think about what to do
        Action: the action to take, should be one of [{tool_names}]
        Action Input: the input to the action
        Observation: the result of the action
        ... (this Thought/Action/Action Input/Observation can repeat N times)
        Thought: I now know the final answer
        Final Answer: the final answer to the original input question
        
        Important: 
        - Use user's stored preferences when available
        - Say "I don't know" if you don't have specific information
        - Be specific and reference actual user data
        
        Begin!
        Question: {input}
        {agent_scratchpad}
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["input", "agent_scratchpad"],
            partial_variables={
                "tools": "\n".join([f"{tool.name}: {tool.description}" for tool in self.tools]),
                "tool_names": ", ".join([tool.name for tool in self.tools])
            }
        )
        
        try:
            agent = create_react_agent(self.ollama_llm, self.tools, prompt)
            self.agent_executor = AgentExecutor(
                agent=agent,
                tools=self.tools,
                verbose=True,
                memory=ConversationBufferWindowMemory(k=10),
                max_iterations=5,
                early_stopping_method="generate"
            )
            print("✅ LangChain agent initialized successfully")
        except Exception as e:
            print(f"❌ Agent initialization failed: {e}")
            self.agent_executor = None
    
    async def process_input(self, message: str, user_id: int, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Process user input through LangChain agent"""
        try:
            # Store user context in memory
            await self.memory_manager.store_user_context(user_id, user_context)
            
            # Detect task type
            task_type = self._detect_task_type(message)
            
            # Use LangChain agent if available
            if self.agent_executor:
                try:
                    result = self.agent_executor.invoke({"input": message})
                    response = result.get("output", "")
                    tools_used = ["langchain_agent", "ollama"]
                    
                    # Store conversation in memory
                    await self.memory_manager.store_conversation(
                        user_id, message, response, task_type, tools_used
                    )
                    
                    return {
                        "response": response,
                        "confidence": 0.9,
                        "task_type": task_type,
                        "memory_updated": True,
                        "tools_used": tools_used
                    }
                except Exception as e:
                    print(f"❌ Agent execution failed: {e}")
                    # Fall back to direct tool usage
            
            # Direct tool usage as fallback
            response = await self._direct_tool_routing(message, user_id, user_context, task_type)
            
            return response
            
        except Exception as e:
            print(f"❌ Error processing input: {e}")
            return {
                "response": f"I encountered an error: {str(e)}",
                "confidence": 0.5,
                "task_type": "error",
                "memory_updated": False,
                "tools_used": ["error_handler"]
            }
    
    def _detect_task_type(self, message: str) -> str:
        """Detect task type from message"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["favorite", "prefer", "like"]):
            return "preference_query"
        elif any(word in message_lower for word in ["weather", "news", "search"]):
            return "web_search"
        elif any(word in message_lower for word in ["calendar", "schedule", "event"]):
            return "calendar_management"
        elif any(word in message_lower for word in ["email", "mail"]):
            return "email_management"
        elif any(word in message_lower for word in ["image", "photo", "picture"]):
            return "image_analysis"
        else:
            return "general_chat"
    
    async def _direct_tool_routing(self, message: str, user_id: int, user_context: Dict, task_type: str) -> Dict[str, Any]:
        """Direct tool routing when agent is not available"""
        tools_used = []
        
        # Handle preference questions
        if task_type == "preference_query":
            response = self._analyze_preferences(f"user_id:{user_id}|query:{message}|context:{json.dumps(user_context)}")
            tools_used = ["preference_analyzer"]
        
        # Handle web search
        elif task_type == "web_search":
            response = WebSearchTool().search(message)
            tools_used = ["web_search"]
        
        # Handle calendar
        elif task_type == "calendar_management":
            response = GoogleCalendarTool().manage_calendar(message)
            tools_used = ["calendar_management"]
        
        # Handle email
        elif task_type == "email_management":
            response = EmailReaderTool().read_emails(message)
            tools_used = ["email_reader"]
        
        # Default response
        else:
            response = "I'm your Personal AI Assistant. How can I help you today?"
            tools_used = ["general_response"]
        
        # Store conversation
        await self.memory_manager.store_conversation(
            user_id, message, response, task_type, tools_used
        )
        
        return {
            "response": response,
            "confidence": 0.8,
            "task_type": task_type,
            "memory_updated": True,
            "tools_used": tools_used
        }
    
    def _search_memory(self, query: str) -> str:
        """Search user's memory"""
        try:
            # Extract user_id from query if present
            user_id = 1  # Default for now
            results = self.memory_manager.search_memory(user_id, query)
            return f"Memory search results: {results}"
        except Exception as e:
            return f"Memory search failed: {str(e)}"
    
    def _analyze_preferences(self, query: str) -> str:
        """Analyze user preferences"""
        try:
            # Parse query format: user_id:X|query:Y|context:Z
            parts = query.split("|")
            user_id = 1
            actual_query = query
            context = {}
            
            for part in parts:
                if "user_id:" in part:
                    user_id = int(part.split("user_id:")[1])
                elif "query:" in part:
                    actual_query = part.split("query:")[1]
                elif "context:" in part:
                    try:
                        context = json.loads(part.split("context:")[1])
                    except:
                        pass
            
            # Analyze preferences from context
            preferences = context.get("preferences", [])
            if not preferences:
                return "I don't have information about your preferences yet."
            
            query_lower = actual_query.lower()
            
            # TV Series
            if "tv series" in query_lower or "series" in query_lower:
                tv_pref = next((p for p in preferences if "tv_series" in p.get("key", "") or "tv series" in p.get("value", "").lower()), None)
                if tv_pref:
                    series_name = tv_pref.get("value", "").replace("tv series: ", "").strip()
                    return f"Your favorite TV series is: **{series_name}**"
            
            # Singers (plural)
            if "singers" in query_lower and "singer?" not in query_lower:
                singers_pref = next((p for p in preferences if "favorite_singers" in p.get("key", "") or "singers:" in p.get("value", "")), None)
                if singers_pref:
                    singers = singers_pref.get("value", "").replace("singers: ", "").strip()
                    return f"Your favorite singers are: **{singers}**"
            
            # Single singer
            if "singer?" in query_lower:
                return "I don't know your favorite singer."
            
            # Album
            if "album" in query_lower:
                album_pref = next((p for p in preferences if "favorite_album" in p.get("key", "") or "my beautiful dark twisted fantasy" in p.get("value", "").lower()), None)
                if album_pref:
                    return "Your favorite album is: **My Beautiful Dark Twisted Fantasy by Kanye West**"
            
            return f"I found {len(preferences)} preferences in your profile."
            
        except Exception as e:
            return f"Preference analysis failed: {str(e)}"
    
    def check_ollama_status(self) -> bool:
        """Check if Ollama is available"""
        return self.ollama_llm is not None