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
  - **New**: Upgraded to GPT4All for superior AI capabilities
  - Replaced Ollama with GPT4All Mistral 7B model for better responses
  - Enhanced AI reasoning, conversation quality, and context understanding
  - Maintained complete privacy with local processing
  - Improved AI interrupt system and fallback responses

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
- **Provider**: GPT4All (local AI, completely free)
- **Model**: Mistral 7B OpenOrca (high-quality, efficient)
- **Features**: 
  - AI-powered insights generation
  - Chat assistance with interrupt capability
  - Content analysis and suggestions
  - Cross-application intelligence
  - Learns from user interactions across all apps
  - Provides intelligent fallback responses during setup
  - Completely private - runs locally without internet
  - Better reasoning and conversation quality than previous AI

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