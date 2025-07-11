# Personal AI Assistant

A sophisticated AI assistant powered by LangChain + Ollama + ChromaDB architecture.

## System Architecture

**Main Technologies:**
- **Language Model**: Ollama (LLaMA3 / Mistral)
- **Orchestration**: LangChain
- **Vector Memory**: ChromaDB
- **Web Search**: Tavily API
- **Calendar/Email**: Google APIs
- **Image Understanding**: CLIP

## Directory Structure

```
ai_assistant/
├── main.py                     # Entry point
├── agents/
│   └── assistant_agent.py      # LangChain agent definition
├── memory/
│   └── chromadb_utils.py       # ChromaDB vector memory functions
├── tools/
│   ├── web_search.py           # Tavily web search tool
│   ├── google_calendar.py      # Calendar integration
│   ├── email_reader.py         # Gmail API integration
│   └── image_analyzer.py       # CLIP image analysis
├── data/
│   ├── notes/                  # User notes storage
│   ├── images/                 # User images storage
│   └── logs/                   # Conversation logs
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## Workflow

1. **User Input** → Text, image, or voice input
2. **LangChain Agent** routes tasks based on content:
   - Uses Ollama for language reasoning
   - Stores/retrieves memory via ChromaDB
   - Calls appropriate tools
3. **Tool Execution**:
   - Web search (Tavily)
   - Image analysis (CLIP)
   - Gmail integration
   - Calendar management
4. **AI Response** based on data + memory
5. **Memory Update** after each session

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export TAVILY_API_KEY="your_tavily_key"
export GOOGLE_CREDENTIALS_PATH="path/to/credentials.json"

# Start the service
python main.py
```

## API Endpoints

- `POST /chat` - Main chat interface
- `GET /health` - Health check
- `GET /memory/{user_id}` - User memory stats

## Features

- **Intelligent Task Routing**: LangChain agent automatically determines the best tool for each request
- **Vector Memory**: ChromaDB stores conversation context and retrieves relevant memories
- **Multi-Modal**: Handles text, images, and various data types
- **Tool Integration**: Web search, calendar, email, image analysis
- **Persistent Memory**: Conversations and context saved across sessions
- **Preference Learning**: Learns and remembers user preferences

## Tool Capabilities

### Web Search (Tavily)
- Current news and information
- Weather updates
- Research queries
- Real-time data

### Google Calendar
- List upcoming events
- Create new events
- Check availability
- Calendar summaries

### Gmail Integration
- Read unread emails
- Search email content
- Get email summaries
- Important email filtering

### Image Analysis (CLIP)
- Describe image content
- Identify objects and scenes
- Analyze image quality
- Compare images

### Vector Memory (ChromaDB)
- Store conversation history
- Retrieve relevant context
- Learn user preferences
- Maintain long-term memory

## Configuration

The system requires:
- Ollama running locally (port 11434)
- Tavily API key for web search
- Google OAuth credentials for Calendar/Gmail
- ChromaDB for vector storage

## Error Handling

The system includes comprehensive error handling:
- Graceful degradation when services are unavailable
- Fallback responses for failed operations
- Detailed logging for debugging
- Status checks for all components

## Security

- OAuth 2.0 for Google services
- API key management via environment variables
- Local data storage with ChromaDB
- No sensitive data logged