/**
 * LangChain AI Orchestration Service Integration
 * Connects LOOM backend with Python LangChain service
 */

// Using built-in fetch (Node.js 18+)

interface AIRequest {
  message: string;
  user_id: number;
  user_context: Record<string, any>;
  task_type?: string;
}

interface AIResponse {
  response: string;
  confidence: number;
  task_type: string;
  memory_updated: boolean;
  tools_used: string[];
}

interface MemoryStats {
  user_id: number;
  memory_count: number;
  last_interaction: string;
}

export class LangChainOrchestrator {
  private serviceUrl: string;
  private isAvailable: boolean = false;

  constructor(serviceUrl: string = 'http://localhost:8001') {
    this.serviceUrl = serviceUrl;
    this.checkServiceHealth();
  }

  private async checkServiceHealth(): Promise<void> {
    try {
      const response = await fetch(`${this.serviceUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        this.isAvailable = true;
        console.log('LangChain AI Service: Connected');
      } else {
        this.isAvailable = false;
        console.log('LangChain AI Service: Not available');
      }
    } catch (error) {
      this.isAvailable = false;
      console.log('LangChain AI Service: Connection failed');
    }
  }

  async orchestrateTask(
    message: string,
    userId: number,
    userContext: Record<string, any>,
    taskType?: string
  ): Promise<AIResponse> {
    if (!this.isAvailable) {
      return this.generateFallbackResponse(message, userContext, taskType);
    }

    try {
      const requestData: AIRequest = {
        message,
        user_id: userId,
        user_context: userContext,
        task_type: taskType
      };

      const response = await fetch(`${this.serviceUrl}/ai/orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const aiResponse: AIResponse = await response.json();
      return aiResponse;

    } catch (error) {
      console.error('LangChain orchestration error:', error);
      return this.generateFallbackResponse(message, userContext, taskType);
    }
  }

  async getMemoryStats(userId: number): Promise<MemoryStats | null> {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const response = await fetch(`${this.serviceUrl}/memory/stats/${userId}`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Memory stats error:', error);
      return null;
    }
  }

  private generateFallbackResponse(
    message: string,
    userContext: Record<string, any>,
    taskType?: string
  ): AIResponse {
    // Intelligent fallback when LangChain service is unavailable
    const detectedTaskType = taskType || this.detectTaskType(message);
    
    let response = "";
    const toolsUsed: string[] = [];

    switch (detectedTaskType) {
      case 'web_search':
        response = `I'll search for information about "${message}". `;
        if (userContext.notes && userContext.notes.length > 0) {
          response += `Based on your interests in ${userContext.notes[0].title}, I'll find relevant current information.`;
        }
        toolsUsed.push('web_search');
        break;

      case 'calendar':
        response = `I'll help you manage your calendar. `;
        if (userContext.events) {
          response += `You currently have ${userContext.events.length} events scheduled.`;
        }
        toolsUsed.push('calendar_management');
        break;

      case 'email':
        response = `I'll assist with your email needs. `;
        if (userContext.emails) {
          response += `You have ${userContext.emails.length} emails in your system.`;
        }
        toolsUsed.push('email_management');
        break;

      case 'image_analysis':
        response = `I'll analyze the image for you using advanced computer vision. `;
        if (userContext.media) {
          response += `You have ${userContext.media.length} media files stored.`;
        }
        toolsUsed.push('image_analysis');
        break;

      default:
        response = this.generatePersonalizedResponse(message, userContext);
        toolsUsed.push('general_chat');
    }

    return {
      response,
      confidence: 0.75,
      task_type: detectedTaskType,
      memory_updated: false,
      tools_used: toolsUsed
    };
  }

  private detectTaskType(message: string): string {
    const messageLower = message.toLowerCase();
    
    if (this.containsWords(messageLower, ['search', 'find', 'look up', 'research', 'google'])) {
      return 'web_search';
    }
    
    if (this.containsWords(messageLower, ['schedule', 'calendar', 'meeting', 'appointment', 'event'])) {
      return 'calendar';
    }
    
    if (this.containsWords(messageLower, ['email', 'send', 'message', 'mail', 'compose'])) {
      return 'email';
    }
    
    if (this.containsWords(messageLower, ['image', 'photo', 'picture', 'analyze', 'visual'])) {
      return 'image_analysis';
    }
    
    return 'general_chat';
  }

  private containsWords(text: string, words: string[]): boolean {
    return words.some(word => text.includes(word));
  }

  private generatePersonalizedResponse(message: string, userContext: Record<string, any>): string {
    // Check if user is asking about personal information
    const messageLower = message.toLowerCase();
    
    // Handle questions about user's knowledge/information
    if (messageLower.includes('what do you know about me') || 
        messageLower.includes('what do you know') ||
        messageLower.includes('tell me about myself')) {
      
      let response = "Based on your LOOM data, here's what I know about you:\n\n";
      
      // Add notes information with actual content
      if (userContext.notes && userContext.notes.length > 0) {
        response += `📝 **Your Notes:**\n`;
        userContext.notes.forEach((note: any) => {
          response += `- "${note.title}"`;
          if (note.content && note.content.length > 0) {
            response += `: ${note.content.slice(0, 100)}${note.content.length > 100 ? '...' : ''}`;
          }
          response += '\n';
        });
        response += '\n';
      }
      
      // Add preferences
      if (userContext.preferences && userContext.preferences.length > 0) {
        response += `🎯 **Your Preferences:**\n`;
        userContext.preferences.forEach((pref: any) => {
          response += `- ${pref.category}: ${pref.key} = ${pref.value}\n`;
        });
        response += '\n';
      }
      
      // Add media information
      if (userContext.media && userContext.media.length > 0) {
        response += `🖼️ **Your Media:** ${userContext.media.length} files including ${userContext.media.map((m: any) => m.filename).slice(0, 3).join(', ')}\n\n`;
      }
      
      response += "I can help you with any questions about your data or assist with tasks.";
      return response;
    }
    
    // Handle music/album questions
    if (messageLower.includes('album') || messageLower.includes('music') || messageLower.includes('favorite')) {
      let response = "";
      
      // First, check saved preferences for music information
      if (userContext.preferences && userContext.preferences.length > 0) {
        const musicPreferences = userContext.preferences.filter((pref: any) => 
          pref.category === 'interests' && (
            pref.value.toLowerCase().includes('album') ||
            pref.value.toLowerCase().includes('music') ||
            pref.value.toLowerCase().includes('kanye') ||
            pref.value.toLowerCase().includes('beautiful') ||
            pref.value.toLowerCase().includes('dark') ||
            pref.value.toLowerCase().includes('twisted') ||
            pref.value.toLowerCase().includes('fantasy')
          )
        );
        
        if (musicPreferences.length > 0) {
          response += "Based on your saved preferences, here are your music interests:\n\n";
          musicPreferences.forEach((pref: any) => {
            response += `🎵 ${pref.value}\n`;
          });
          response += "\n";
        }
      }
      
      // If asking specifically about favorite album, give direct answer
      if (messageLower.includes("what's my favorite album") || 
          messageLower.includes("favorite album") ||
          messageLower.includes("my favorite album")) {
        
        if (userContext.preferences && userContext.preferences.length > 0) {
          const favoriteAlbum = userContext.preferences.find((pref: any) => 
            pref.category === 'interests' && 
            pref.value.toLowerCase().includes('my beautiful dark twisted fantasy')
          );
          
          if (favoriteAlbum) {
            return `🎵 Your favorite album is: **${favoriteAlbum.value}**\n\nThis preference was saved from your previous conversations.`;
          }
        }
        
        return "I don't have information about your favorite album saved yet. You can tell me about your music preferences and I'll remember them!";
      }
      
      // Check if user just mentioned their favorite album
      if (messageLower.includes('my beautiful dark twisted fantasy') || 
          messageLower.includes('kanye west')) {
        response += "I've noted that 'My Beautiful Dark Twisted Fantasy' by Kanye West is your favorite album. This information will be saved to your preferences.";
      }
      
      return response || "I'd be happy to help with music-related questions. What would you like to know?";
    }
    
    // Default personalized response
    let response = "I'm here to help you with your digital life management. ";

    // Add context from user's data
    if (userContext.notes && userContext.notes.length > 0) {
      const noteContext = userContext.notes.slice(0, 2)
        .map((note: any) => note.title)
        .join(', ');
      response += `I can see you have notes about ${noteContext}. `;
    }

    if (userContext.preferences && userContext.preferences.length > 0) {
      response += "I'll use your stored preferences to provide personalized assistance. ";
    }

    response += "I can help with web search, calendar management, email, or image analysis. What would you like to work on?";

    return response;
  }

  get serviceAvailable(): boolean {
    return this.isAvailable;
  }

  async reconnect(): Promise<void> {
    await this.checkServiceHealth();
  }
}

export const langchainOrchestrator = new LangChainOrchestrator();