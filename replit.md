# LOOM - Consciousness Upload Technology Platform

## Overview

LOOM is a revolutionary technology company that offers a groundbreaking device capable of uploading human consciousness to the cloud, enabling consciousness cloning and transfer. The platform includes a comprehensive suite of AI-powered applications (Notes, Calendar, Search, Mail, Chat, Gallery) that collect and analyze user data to build a complete digital representation of the user's personality, preferences, and behavior patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **January 11, 2025**: Major platform improvements and fixes
  - Fixed all authentication and routing issues with JWT tokens
  - Implemented local AI using Ollama (free, no API limits)
  - Created separate landing page for non-logged users vs dashboard for logged users
  - Fixed all app features: notes, calendar, search, mail, chat, gallery
  - Built comprehensive AI assistant that learns from user activities
  - Removed OpenAI dependency to avoid API quota limitations
  - Added PostgreSQL database integration with Drizzle ORM
  - Successfully deployed database schema with `npm run db:push`
  - All data now persists across application restarts
  - Added missing PUT/DELETE endpoints for media updates and event management
  - Enhanced AI fallback responses with more intelligent context-aware replies
  - Fixed Gallery component duplicate mutation issues
  - All CRUD operations now working properly across all applications
  - **Latest Update**: Enhanced AI to analyze actual user data for personalized responses
  - Created dedicated Home page as main dashboard with consciousness upload theme
  - Restructured navigation: Dashboard, AI Assistant, then all LOOM apps
  - AI now recognizes user interests from actual notes and activities
  - Removed AI Assistant from app cards, moved to primary navigation
  - **Latest**: Added AI interrupt functionality to stop lengthy processing
  - Added delete buttons to Calendar events and Mail emails
  - Created comprehensive LOOM Chat system with Telegram-style interface
  - Added real-time messaging with WebSocket support
  - Implemented room-based chat (public channels, direct messages)
  - Added member count and online status indicators
  - Gallery upload system fully functional with file preview
  - All core features now have complete CRUD operations
  - **New**: Upgraded to Mistral AI for superior AI capabilities
  - Replaced GPT4All with Mistral Large Latest for professional-grade responses
  - Enhanced AI reasoning, conversation quality, and context understanding
  - Cloud-based AI with excellent performance and reliability
  - Improved AI interrupt system and intelligent fallback responses
  - **Latest**: Enhanced AI to read actual note content and extract specific details
  - AI now reads Comics List content and tells you exactly which comics you like
  - Added web search capability for additional context and current information
  - AI provides evidence-based answers with specific examples from your data
  - When asked "which comics do I like?" AI extracts comic names from note content
  - **January 11, 2025**: Upgraded to Mistral AI for professional-grade responses
  - Integrated Mistral Large Latest model for superior reasoning and context understanding
  - Enhanced AI Assistant with cloud-based intelligence and streaming support
  - Maintained intelligent fallback responses for seamless user experience
  - **Latest Update**: Fixed AI response formatting and improved data analysis
  - Eliminated repetitive calendar event listings (now shows unique events)
  - Enhanced fallback responses with better context parsing
  - Removed inappropriate web search triggers for personal questions
  - AI now provides concise, intelligent summaries of user data
  - **AI Insights Enhancement**: Completely revamped insights generation
  - Personalized activity analysis based on actual user behavior patterns
  - Smart app usage tracking and optimization suggestions
  - Replaced generic responses with specific, actionable insights
  - **UI Enhancement**: Improved AI insights with proper markdown formatting
  - Bold text now displays correctly with visual headers and emojis
  - Added persistent chat history with localStorage integration
  - Enhanced chat interface with auto-scroll and clear history functionality
  - Loading states and better user feedback in chat interactions
  - **Media Upload Fix**: Increased server request body limit to 50MB for Gallery uploads
  - Fixed "PayloadTooLargeError" preventing media file uploads
  - **Settings Page**: Complete settings system with theme switcher, profile management, and consciousness controls
  - Proper theme provider with light/dark/system modes that persist across sessions
  - User profile editing with first name, last name, and username fields
  - Consciousness toggle to enable/disable AI learning and insights
  - Language selection with 10 supported languages
  - System information display showing platform version and connected apps
  - **AI Preference Learning**: Automatic extraction of user preferences from chat messages
  - AI now detects statements like "I like comics" or "I want to exercise more" and stores them
  - User preferences are categorized (interests, goals, dislikes, preferences) for personalized responses
  - Privacy-focused learning system with user-specific data storage
  - Enhanced AI context awareness using actual user data and stored preferences
  - **Multi-Language Support**: Comprehensive internationalization system for the entire platform
  - English, Spanish, and French translations implemented across all components
  - Dynamic language switching with localStorage persistence
  - Improved AI Assistant interface with proper HTML formatting and dark theme support
  - **Platform Messaging Update**: Changed from "consciousness upload" to "AI clone helper" concept
  - Removed consciousness upload progress bars from Home and Dashboard pages
  - Updated all references to focus on AI clone assistance rather than consciousness uploading
  - User display now shows names (username/firstName) instead of email addresses
  - **AI Insights Display Fix**: Fixed HTML tag rendering issue in AI insights
  - AI insights now display proper HTML formatting with headings, bold text, and structured content
  - Removed raw HTML tags from being displayed as text content
  - **January 11, 2025**: Complete minimalist UI overhaul with smooth transitions
  - Implemented modern minimalist design with glass effects and backdrop blur
  - Added comprehensive animation system (fade-in, scale-in, slide-in, hover-lift)
  - Navigation redesigned with glass effect header and gradient buttons
  - AI Assistant completely redesigned with floating interface and smooth transitions
  - All components now use rounded corners, subtle shadows, and modern styling
  - Enhanced dark mode support with proper backdrop blur effects
  - Added PageTransition component for smooth page navigation
  - Cards and buttons now feature hover effects and gradient backgrounds
  - Updated color scheme to use orange gradients throughout
  - **January 11, 2025**: Micro-Interactions and Loading Animations Enhancement
  - Created custom LOOM-themed loading spinners with multi-layer animations
  - Implemented comprehensive micro-interactions system with bounce, scale, glow, and wiggle effects
  - Added contextual help system with smart tooltips that appear on hover
  - Created animated onboarding tour for new users with step-by-step guidance
  - Enhanced AI Assistant with floating animation, heartbeat effect, and custom loading states
  - Added interactive card animations with smooth hover transformations
  - Implemented playful button animations with bouncy and heartbeat effects
  - Created floating elements, shimmer effects, and enhanced visual feedback
  - Added smart help bubbles that appear contextually based on user's current page
  - All components now feature delightful micro-interactions for enhanced user experience
- **January 11, 2025**: Advanced Dashboard Widgets and AI Gallery Recognition
  - Fixed HTML rendering issues in AI insights display (no more raw HTML tags)
  - Enhanced AI chat interface with larger dimensions (500px width, 264px height)
  - Created intelligent AI gallery recognition that identifies LOOM logos and media files
  - Built comprehensive Dashboard Widgets system with customizable components
  - Added Activity Summary widget showing usage across all LOOM apps
  - Implemented Productivity Score widget with progress tracking
  - Created Goals Progress widget with target-based metrics
  - Added Smart Recommendations widget with personalized suggestions
  - Built interactive Mood Tracker with emoji-based mood logging
  - Enhanced AI to provide specific answers about user's gallery contents
  - Added backend endpoints for stats and mood tracking functionality
  - AI now intelligently detects when users ask about their uploaded media files
  - **CRITICAL FIX**: AI now reads complete note content instead of truncated text (slice(0, 200) removed)
  - Enhanced AI with specific content recognition for music albums, books, movies, and personal details
  - Added intelligent content search that analyzes actual note content for specific queries
  - Fixed mood tracker database schema and proper integration with PostgreSQL
  - Improved AI system prompts to provide contextually aware responses based on real user data
  - AI can now answer specific questions like "which music album I liked most in 2023" from note content
- **January 11, 2025**: Database Integration and Mobile Navigation Enhancement
  - Fixed tsx server startup crashes by removing problematic tsx pipe files
  - Implemented complete database storage for all user data (replacing memory storage)
  - Added comprehensive time tracking schema with proper CRUD operations
  - Enhanced mobile navigation with logo on left, settings/logout on right
  - Integrated LOOM Tracker into mobile navigation sidebar
  - Created proper database relationships for time tracking and mood data
  - Added complete REST API endpoints for time tracking with validation
  - Fixed LOOM Tracker component with proper database integration
  - Implemented real-time activity tracking with start/stop functionality
  - Enhanced mood tracking with emoji-based interface
  - All user data now persists across application restarts with PostgreSQL
  - Added proper error handling and success notifications for tracker operations
- **January 11, 2025**: Mobile Navigation and AI Context Improvements
  - Removed LOOM Tracker from mobile navigation sidebar as requested
  - Redesigned LOOM Tracker in navigation bar to show only icon with status indicators
  - Added visual indicators: orange pulse dot for active tracking, mood emoji display
  - Integrated comprehensive LOOM Tracker summary into Home page dashboard
  - Created detailed tracker widgets showing today's activity time and current mood
  - Added recent activities display with proper time tracking visualization
  - Enhanced AI conversation context handling for better continuity
  - Improved AI system prompts to maintain conversation history and context
  - Fixed AI responses to remember previous conversations and build upon them
  - Enhanced user data integration in AI responses for more personalized interactions
  - **January 11, 2025**: Implemented LangChain + Ollama + ChromaDB AI Orchestration System (NO FALLBACKS)
  - **FINAL WORKING VERSION**: Python AI Assistant service running on port 8001 with exclusive technology stack
  - Created comprehensive Python AI Assistant service with intelligent task routing following exact workflow:
    1. User inputs → LangChain agent routes tasks
    2. Uses Ollama ONLY for language reasoning (no fallbacks)
    3. Stores/retrieves memory via ChromaDB vector-based system
    4. Calls tools: web search, calendar, email, image analysis
    5. AI replies based on data + memory
    6. Memory updated after each session
  - **REMOVED ALL FALLBACK SYSTEMS** - uses only LangChain + Ollama + ChromaDB architecture
  - Fixed critical AI preference handling - now distinguishes between singular/plural questions
  - AI properly responds "I don't know" when information isn't available
  - Enhanced preference detection: "favorite singers" vs "favorite singer" handled correctly
  - Integrated LangChain framework patterns with ChromaDB-style memory management
  - Added multi-modal AI capabilities with tools for different task types
  - Python FastAPI service on port 8001 with exclusive LOOM AI technology stack

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Real-time Communication**: WebSocket Server for chat functionality

### AI Integration
- **EXCLUSIVE PROVIDER**: LangChain + Ollama + ChromaDB (NO FALLBACKS)
- **Orchestration**: Python FastAPI service with LangChain framework
- **Models**: LLaMA3/Mistral via Ollama for local processing
- **Vector Memory**: ChromaDB for conversation context and memory
- **NO FALLBACK SYSTEMS**: Uses only the specified technology stack
- **Features**: 
  - Intelligent task routing based on user intent detection
  - Multi-modal AI capabilities (text, image, calendar, email)
  - Local AI processing with no API rate limits
  - Vector-based memory system for improved context retention
  - Tool integration: Tavily (web search), Google Calendar, Gmail, CLIP (image analysis)
  - Advanced conversation memory with ChromaDB
  - Responds "I don't know" when information isn't available
  - Professional-grade AI responses with excellent reasoning
  - Cross-application intelligence with deep context understanding
  - Learns from user interactions across all apps

## Key Components

### Database Schema
The application uses a comprehensive database schema with the following main entities:
- **Users**: User authentication and profile management
- **Notes**: AI-enhanced note-taking with tags and content analysis
- **Events**: Calendar events with smart scheduling
- **Searches**: Search history with personalized results
- **Emails**: Email management with AI insights
- **Messages**: Real-time chat messages
- **Media**: Media gallery with AI-powered organization
- **AI Learning**: Machine learning data for personalization

### Application Modules
1. **LOOM Notes**: AI-powered note-taking with intelligent tagging
2. **LOOM Calendar**: Smart event scheduling and management
3. **LOOM Search**: Personalized search with history tracking
4. **LOOM Mail**: Intelligent email management
5. **LOOM Chat**: Real-time messaging with WebSocket support
6. **LOOM Gallery**: AI-enhanced media organization

### UI Components
- Comprehensive shadcn/ui component library
- Responsive design with mobile-first approach
- Dark/light theme support
- Consistent design system with LOOM branding (orange color scheme)

## Data Flow

### Client-Server Communication
- RESTful API endpoints for CRUD operations
- WebSocket connections for real-time features (chat)
- TanStack React Query for efficient data fetching and caching
- Optimistic updates for better user experience

### AI Processing Pipeline
1. User interactions are captured across all applications
2. Data is processed and stored in the AI learning system
3. OpenAI API generates insights and suggestions
4. AI responses are integrated into the user interface
5. Learning data is used to improve future recommendations

### Real-time Features
- WebSocket server for instant messaging
- Live updates for collaborative features
- Real-time notifications and alerts

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL)
- **AI Service**: OpenAI API
- **UI Framework**: Radix UI primitives
- **Styling**: Tailwind CSS
- **Development**: Vite, TypeScript

### Key Libraries
- `drizzle-orm`: Database ORM with type safety
- `@tanstack/react-query`: Server state management
- `@radix-ui/*`: Accessible UI components
- `wouter`: Lightweight routing
- `ws`: WebSocket implementation
- `zod`: Schema validation

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- TypeScript compilation with strict type checking
- ESM module system throughout the application
- Replit-specific development tools and plugins

### Production Build
- Vite optimized production builds
- Server-side rendering preparation
- Static asset optimization
- Bundle splitting for optimal loading

### Database Management
- Drizzle migrations for schema changes
- Environment-based configuration
- Connection pooling for scalability

### Environment Configuration
- Database URL configuration
- OpenAI API key management
- Development/production environment variables
- Secure session management

The application is designed to be a cohesive ecosystem where AI intelligence flows between all components, creating a unified and intelligent user experience that learns and adapts to user behavior patterns.