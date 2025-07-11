import { mistralService } from './mistralService';
import { performWebSearch } from './searchService';

/**
 * AI Squad - Multiple AI services for different specialized tasks
 * Each AI is optimized for specific use cases to provide the best results
 */

// AI Service Types
export enum AIServiceType {
  SEARCH_AI = 'search_ai',           // Web search and online research
  DATA_AI = 'data_ai',               // User data analysis and insights
  CHAT_AI = 'chat_ai',               // General conversation and assistance
  ANALYTICS_AI = 'analytics_ai',     // Pattern recognition and analytics
  CONTENT_AI = 'content_ai',         // Content creation and summarization
  INTERFACE_AI = 'interface_ai'      // UI/UX suggestions and improvements
}

interface AIResponse {
  response: string;
  confidence: number;
  serviceUsed: AIServiceType;
  metadata?: any;
}

export class AISquad {
  private services: Map<AIServiceType, any> = new Map();

  constructor() {
    // Initialize all AI services
    this.initializeServices();
  }

  private initializeServices() {
    // For now, we'll use Mistral as the base, but with specialized prompts
    // In the future, we can integrate different AI services per your specifications
    this.services.set(AIServiceType.SEARCH_AI, mistralService);
    this.services.set(AIServiceType.DATA_AI, mistralService);
    this.services.set(AIServiceType.CHAT_AI, mistralService);
    this.services.set(AIServiceType.ANALYTICS_AI, mistralService);
    this.services.set(AIServiceType.CONTENT_AI, mistralService);
    this.services.set(AIServiceType.INTERFACE_AI, mistralService);
  }

  /**
   * Route request to appropriate AI service based on task type
   */
  async routeRequest(
    message: string, 
    userContext: any, 
    taskType?: AIServiceType
  ): Promise<AIResponse> {
    // Auto-detect task type if not provided
    if (!taskType) {
      taskType = this.detectTaskType(message);
    }

    switch (taskType) {
      case AIServiceType.SEARCH_AI:
        return await this.handleSearchTask(message, userContext);
      
      case AIServiceType.DATA_AI:
        return await this.handleDataTask(message, userContext);
      
      case AIServiceType.ANALYTICS_AI:
        return await this.handleAnalyticsTask(message, userContext);
      
      case AIServiceType.CONTENT_AI:
        return await this.handleContentTask(message, userContext);
      
      case AIServiceType.INTERFACE_AI:
        return await this.handleInterfaceTask(message, userContext);
      
      case AIServiceType.CHAT_AI:
      default:
        return await this.handleChatTask(message, userContext);
    }
  }

  /**
   * Detect the type of task based on the message content
   */
  private detectTaskType(message: string): AIServiceType {
    const lowerMessage = message.toLowerCase();
    
    // Search-related keywords
    if (lowerMessage.includes('search') || lowerMessage.includes('find online') || 
        lowerMessage.includes('look up') || lowerMessage.includes('what happened') ||
        lowerMessage.includes('latest news') || lowerMessage.includes('current events')) {
      return AIServiceType.SEARCH_AI;
    }
    
    // Data analysis keywords
    if (lowerMessage.includes('analyze') || lowerMessage.includes('pattern') || 
        lowerMessage.includes('trend') || lowerMessage.includes('statistics') ||
        lowerMessage.includes('insights') || lowerMessage.includes('summary')) {
      return AIServiceType.ANALYTICS_AI;
    }
    
    // User data specific keywords
    if (lowerMessage.includes('my notes') || lowerMessage.includes('my data') || 
        lowerMessage.includes('my preferences') || lowerMessage.includes('my activities') ||
        lowerMessage.includes('what do i') || lowerMessage.includes('tell me about my')) {
      return AIServiceType.DATA_AI;
    }
    
    // Content creation keywords
    if (lowerMessage.includes('write') || lowerMessage.includes('create') || 
        lowerMessage.includes('generate') || lowerMessage.includes('compose') ||
        lowerMessage.includes('draft') || lowerMessage.includes('summarize')) {
      return AIServiceType.CONTENT_AI;
    }
    
    // Interface/UX keywords
    if (lowerMessage.includes('interface') || lowerMessage.includes('ui') || 
        lowerMessage.includes('design') || lowerMessage.includes('improve') ||
        lowerMessage.includes('suggestions') || lowerMessage.includes('better way')) {
      return AIServiceType.INTERFACE_AI;
    }
    
    // Default to chat AI
    return AIServiceType.CHAT_AI;
  }

  /**
   * Handle search-oriented tasks with web research
   */
  private async handleSearchTask(message: string, userContext: any): Promise<AIResponse> {
    const systemPrompt = `You are LOOM's Search AI, specialized in web research and online information gathering.

Your expertise:
- Web search and current information
- Fact-checking and verification
- Real-time data and news
- Combining online research with user context

User Context: ${JSON.stringify(userContext)}

Focus on providing accurate, up-to-date information from online sources. Always verify information and provide sources when possible.`;

    try {
      // First, get web search results
      const searchResults = await performWebSearch(message);
      
      // Then, analyze with AI
      const aiResponse = await this.services.get(AIServiceType.SEARCH_AI).generateResponse(
        message + "\n\nWeb search results: " + JSON.stringify(searchResults.results.slice(0, 3)),
        systemPrompt
      );
      
      return {
        response: aiResponse,
        confidence: 0.9,
        serviceUsed: AIServiceType.SEARCH_AI,
        metadata: { searchResults: searchResults.results.slice(0, 3) }
      };
    } catch (error) {
      console.error('Search AI error:', error);
      return await this.handleChatTask(message, userContext);
    }
  }

  /**
   * Handle user data analysis and personal insights
   */
  private async handleDataTask(message: string, userContext: any): Promise<AIResponse> {
    const systemPrompt = `You are LOOM's Data AI, specialized in analyzing user's personal data and providing insights.

Your expertise:
- Personal data analysis
- Pattern recognition in user behavior
- Preference extraction
- Activity insights
- Personalized recommendations

User's Complete Data:
- Notes: ${JSON.stringify(userContext.notes || [])}
- Events: ${JSON.stringify(userContext.events || [])}
- Searches: ${JSON.stringify(userContext.searches || [])}
- Emails: ${JSON.stringify(userContext.emails || [])}
- Media: ${JSON.stringify(userContext.media || [])}
- Activities: ${JSON.stringify(userContext.activities || [])}
- Preferences: ${JSON.stringify(userContext.preferences || [])}

CRITICAL: Always reference specific data from the user's actual content. Quote exact text when relevant.`;

    const response = await this.services.get(AIServiceType.DATA_AI).generateResponse(message, systemPrompt);
    
    return {
      response,
      confidence: 0.95,
      serviceUsed: AIServiceType.DATA_AI,
      metadata: { dataAnalyzed: true }
    };
  }

  /**
   * Handle analytics and pattern recognition
   */
  private async handleAnalyticsTask(message: string, userContext: any): Promise<AIResponse> {
    const systemPrompt = `You are LOOM's Analytics AI, specialized in pattern recognition and statistical analysis.

Your expertise:
- Trend analysis
- Statistical insights
- Behavioral patterns
- Performance metrics
- Predictive analysis

User Context: ${JSON.stringify(userContext)}

Focus on finding patterns, trends, and providing actionable insights based on data analysis.`;

    const response = await this.services.get(AIServiceType.ANALYTICS_AI).generateResponse(message, systemPrompt);
    
    return {
      response,
      confidence: 0.85,
      serviceUsed: AIServiceType.ANALYTICS_AI,
      metadata: { analyticsPerformed: true }
    };
  }

  /**
   * Handle content creation and summarization
   */
  private async handleContentTask(message: string, userContext: any): Promise<AIResponse> {
    const systemPrompt = `You are LOOM's Content AI, specialized in creating, editing, and summarizing content.

Your expertise:
- Content creation
- Writing assistance
- Summarization
- Editing and proofreading
- Content optimization

User Context: ${JSON.stringify(userContext)}

Focus on creating high-quality, relevant content that matches the user's style and preferences.`;

    const response = await this.services.get(AIServiceType.CONTENT_AI).generateResponse(message, systemPrompt);
    
    return {
      response,
      confidence: 0.9,
      serviceUsed: AIServiceType.CONTENT_AI,
      metadata: { contentCreated: true }
    };
  }

  /**
   * Handle interface and UX suggestions
   */
  private async handleInterfaceTask(message: string, userContext: any): Promise<AIResponse> {
    const systemPrompt = `You are LOOM's Interface AI, specialized in user experience and interface optimization.

Your expertise:
- UI/UX improvements
- Workflow optimization
- Interface suggestions
- Accessibility improvements
- User experience analysis

User Context: ${JSON.stringify(userContext)}

Focus on providing practical suggestions for improving user interface and experience.`;

    const response = await this.services.get(AIServiceType.INTERFACE_AI).generateResponse(message, systemPrompt);
    
    return {
      response,
      confidence: 0.8,
      serviceUsed: AIServiceType.INTERFACE_AI,
      metadata: { interfaceSuggestion: true }
    };
  }

  /**
   * Handle general chat and conversation
   */
  private async handleChatTask(message: string, userContext: any): Promise<AIResponse> {
    const systemPrompt = `You are LOOM's Chat AI, specialized in general conversation and assistance.

Your expertise:
- Natural conversation and maintaining context from previous messages
- General assistance with personal data awareness
- Question answering using specific user information
- Friendly interaction with memory of past conversations
- Task coordination

CRITICAL: MAINTAIN CONVERSATION CONTINUITY. Remember what you've told the user before and build upon previous responses.

User's Personal Data:
- Notes: ${userContext.notes?.map((note: any) => `"${note.title}": ${note.content?.substring(0, 200)}`).join(', ') || 'None'}
- Stored Preferences: ${userContext.preferences?.map((p: any) => `${p.key}: ${p.value}`).join(', ') || 'None'}
- Recent Searches: ${userContext.searches?.map((s: any) => s.query).join(', ') || 'None'}
- Activities: ${userContext.activities?.map((a: any) => a.activity).join(', ') || 'None'}
- Current Mood: ${userContext.mood?.mood || 'Unknown'}
- Media Files: ${userContext.media?.length || 0} files

When answering questions:
1. Check if this is a follow-up question that needs context from previous conversation
2. Use specific information from their personal data when relevant
3. Remember what you've told them before and be consistent
4. If asked about preferences (music, books, etc.), check their notes and stored preferences

Focus on providing helpful, personalized responses using their actual data.`;

    try {
      const response = await this.services.get(AIServiceType.CHAT_AI).generateResponse(message, systemPrompt);
      
      return {
        response,
        confidence: 0.8,
        serviceUsed: AIServiceType.CHAT_AI,
        metadata: { chatResponse: true }
      };
    } catch (error) {
      console.error('Chat AI error:', error);
      
      // Enhanced fallback response with user context
      const fallbackResponse = this.generateContextualFallback(message, userContext);
      
      return {
        response: fallbackResponse,
        confidence: 0.6,
        serviceUsed: AIServiceType.CHAT_AI,
        metadata: { fallbackUsed: true }
      };
    }
  }

  /**
   * Generate contextual fallback response based on user data
   */
  private generateContextualFallback(message: string, userContext: any): string {
    const lowerMessage = message.toLowerCase();
    
    // Check if asking about music/albums
    if (lowerMessage.includes('music') || lowerMessage.includes('album') || lowerMessage.includes('favorite')) {
      // Look for music preferences in user preferences
      const musicPrefs = userContext.preferences?.filter((p: any) => 
        p.category === 'interests' && (p.value.toLowerCase().includes('music') || p.value.toLowerCase().includes('album') || p.value.toLowerCase().includes('beautiful') || p.value.toLowerCase().includes('twisted') || p.value.toLowerCase().includes('fantasy'))
      );
      
      if (musicPrefs && musicPrefs.length > 0) {
        return `Based on our previous conversations, I know you mentioned "${musicPrefs[0].value}" as one of your preferences. Is there something specific about music you'd like to discuss?`;
      }
      
      // Check if they have the specific album preference
      const albumPref = userContext.preferences?.find((p: any) => 
        p.key === 'favorite_album' || p.value.toLowerCase().includes('beautiful dark twisted fantasy')
      );
      
      if (albumPref) {
        return `I remember you told me that "${albumPref.value}" is your favorite album of all time! What would you like to know about it or discuss?`;
      }
    }
    
    // Check if asking about comics
    if (lowerMessage.includes('comic')) {
      if (userContext.notes?.some((n: any) => n.title?.toLowerCase().includes('comic') || n.content?.toLowerCase().includes('comic'))) {
        return `I can see you have notes about comics. From your Comics List, you seem to have quite a collection. What would you like to know about them?`;
      }
    }
    
    // Generic fallback with user context
    if (userContext.notes?.length > 0) {
      return `I can help you with your LOOM data. I see you have ${userContext.notes.length} notes, ${userContext.events?.length || 0} events, and ${userContext.searches?.length || 0} searches. What would you like to know about your data?`;
    }
    
    return `I'm your LOOM AI Assistant. I can help you with your notes, calendar, emails, and other data. What would you like to work on today?`;
  }

  /**
   * Get AI service status and capabilities
   */
  getServiceStatus(): Record<AIServiceType, { available: boolean, capabilities: string[] }> {
    return {
      [AIServiceType.SEARCH_AI]: {
        available: true,
        capabilities: ['Web search', 'Real-time information', 'Fact checking']
      },
      [AIServiceType.DATA_AI]: {
        available: true,
        capabilities: ['Personal data analysis', 'Pattern recognition', 'Insights generation']
      },
      [AIServiceType.CHAT_AI]: {
        available: true,
        capabilities: ['General conversation', 'Question answering', 'Task assistance']
      },
      [AIServiceType.ANALYTICS_AI]: {
        available: true,
        capabilities: ['Trend analysis', 'Statistical insights', 'Performance metrics']
      },
      [AIServiceType.CONTENT_AI]: {
        available: true,
        capabilities: ['Content creation', 'Summarization', 'Writing assistance']
      },
      [AIServiceType.INTERFACE_AI]: {
        available: true,
        capabilities: ['UI/UX suggestions', 'Workflow optimization', 'Interface improvements']
      }
    };
  }
}

// Export singleton instance
export const aiSquad = new AISquad();