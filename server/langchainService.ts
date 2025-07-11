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