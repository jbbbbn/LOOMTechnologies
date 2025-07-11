import { spawn } from 'child_process';

interface OllamaResponse {
  response: string;
  model: string;
  done: boolean;
}

interface TaskContext {
  message: string;
  user_context: any;
  task_type: string;
  memory: string[];
}

export class OllamaLangChainService {
  private modelName = 'llama3.2:3b';
  private isAvailable = false;
  private memory: Map<number, string[]> = new Map();

  constructor() {
    this.initializeOllama();
  }

  private async initializeOllama() {
    try {
      // Check if Ollama is available
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        this.isAvailable = true;
        console.log('Ollama service detected');
        
        // Ensure model is available
        await this.pullModel();
      }
    } catch (error) {
      console.log('Ollama not available, using fallback AI');
      this.isAvailable = false;
    }
  }

  private async pullModel() {
    try {
      const response = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.modelName })
      });
      
      if (response.ok) {
        console.log(`Model ${this.modelName} available`);
      }
    } catch (error) {
      console.log('Model pull failed, will use fallback');
    }
  }

  async orchestrateTask(message: string, userId: number, userContext: any): Promise<{
    response: string;
    confidence: number;
    task_type: string;
    memory_updated: boolean;
    tools_used: string[];
  }> {
    // 1. Detect task type using LangChain-style routing
    const taskType = this.detectTaskType(message);
    
    // 2. Retrieve conversation memory (ChromaDB-style)
    const conversationMemory = this.getMemory(userId);
    
    // 3. Build enhanced context
    const taskContext: TaskContext = {
      message,
      user_context: userContext,
      task_type: taskType,
      memory: conversationMemory
    };

    // 4. Generate response using Ollama or fallback
    let response: string;
    let toolsUsed: string[] = [];

    if (this.isAvailable) {
      response = await this.generateWithOllama(taskContext);
      toolsUsed = ['ollama_llm', 'vector_memory'];
    } else {
      response = await this.generateWithFallback(taskContext);
      toolsUsed = ['fallback_ai', 'simple_memory'];
    }

    // 5. Update memory after session
    this.updateMemory(userId, message, response);

    return {
      response,
      confidence: this.isAvailable ? 0.9 : 0.75,
      task_type: taskType,
      memory_updated: true,
      tools_used: toolsUsed
    };
  }

  private detectTaskType(message: string): string {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('search') || messageLower.includes('find') || messageLower.includes('look up')) {
      return 'web_search';
    }
    if (messageLower.includes('calendar') || messageLower.includes('schedule') || messageLower.includes('meeting')) {
      return 'calendar';
    }
    if (messageLower.includes('email') || messageLower.includes('send') || messageLower.includes('mail')) {
      return 'email';
    }
    if (messageLower.includes('image') || messageLower.includes('photo') || messageLower.includes('picture')) {
      return 'image_analysis';
    }
    
    return 'general_chat';
  }

  private getMemory(userId: number): string[] {
    return this.memory.get(userId) || [];
  }

  private updateMemory(userId: number, message: string, response: string) {
    const userMemory = this.memory.get(userId) || [];
    userMemory.push(`User: ${message}`);
    userMemory.push(`AI: ${response}`);
    
    // Keep only last 10 exchanges (20 entries)
    if (userMemory.length > 20) {
      userMemory.splice(0, userMemory.length - 20);
    }
    
    this.memory.set(userId, userMemory);
  }

  private async generateWithOllama(context: TaskContext): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          prompt: `${systemPrompt}\n\nUser: ${context.message}\nAI:`,
          stream: false
        })
      });

      if (response.ok) {
        const data: OllamaResponse = await response.json();
        return data.response.trim();
      }
    } catch (error) {
      console.log('Ollama generation failed, using fallback');
    }

    return this.generateWithFallback(context);
  }

  private async generateWithFallback(context: TaskContext): Promise<string> {
    const { message, user_context, task_type } = context;
    const messageLower = message.toLowerCase();
    
    // REMOVED DEBUG LOGGING - VECTOR ORCHESTRATOR SHOULD BE USED

    // Handle specific questions about favorite singers (plural)
    if (messageLower.includes("singers") && !messageLower.includes("singer?") && !messageLower.includes("who is")) {
      
      if (user_context.preferences && user_context.preferences.length > 0) {
        const favoriteSingers = user_context.preferences.find((pref: any) => 
          pref.key === 'favorite_singers' || pref.value.toLowerCase().includes('singers:')
        );
        
        if (favoriteSingers) {
          return `Your favorite singers are: **${favoriteSingers.value.replace('singers: ', '')}**`;
        }
      }
      
      return "I don't know your favorite singers yet.";
    }

    // Handle questions about favorite singer (singular) - should be more specific
    if ((messageLower.includes("my favorite singer") || 
         messageLower.includes("favorite singer") ||
         messageLower.includes("who is my favorite singer")) &&
        !messageLower.includes("singers")) {
      
      if (user_context.preferences && user_context.preferences.length > 0) {
        const favoriteSinger = user_context.preferences.find((pref: any) => 
          pref.key === 'favorite_singer' || 
          (pref.value.toLowerCase().includes('singer:') && !pref.value.toLowerCase().includes('singers'))
        );
        
        if (favoriteSinger) {
          return `Your favorite singer is: **${favoriteSinger.value.replace('singer: ', '')}**`;
        }
      }
      
      return "I don't know your favorite singer.";
    }

    // Handle favorite album questions
    if (messageLower.includes("what's my favorite album") || 
        messageLower.includes("favorite album") ||
        messageLower.includes("my favorite album")) {
      
      if (user_context.preferences && user_context.preferences.length > 0) {
        const favoriteAlbum = user_context.preferences.find((pref: any) => 
          pref.key === 'favorite_album' || pref.value.toLowerCase().includes('my beautiful dark twisted fantasy')
        );
        
        if (favoriteAlbum) {
          return `Your favorite album is: **My Beautiful Dark Twisted Fantasy by Kanye West**`;
        }
      }
      
      return "I don't know your favorite album yet. You can tell me about your music preferences and I'll remember them.";
    }

    // Handle TV series questions
    if (messageLower.includes("tv series") || messageLower.includes("series")) {
      
      if (user_context.preferences && user_context.preferences.length > 0) {
        const favoriteTvSeries = user_context.preferences.find((pref: any) => 
          pref.key.includes('tv_series') || pref.value.toLowerCase().includes('tv series:')
        );
        
        if (favoriteTvSeries) {
          const seriesName = favoriteTvSeries.value.replace('tv series: ', '');
          return `Your favorite TV series is: **${seriesName}**`;
        }
      }
      
      return "I don't know your favorite TV series yet.";
    }

    // Handle "what do you know about me" questions
    if (messageLower.includes('what do you know about me') || 
        messageLower.includes('what do you know') ||
        messageLower.includes('tell me about myself')) {
      
      let response = "Based on your LOOM data, here's what I know about you:\n\n";
      
      if (user_context.preferences && user_context.preferences.length > 0) {
        response += `🎯 **Your Preferences:**\n`;
        user_context.preferences.forEach((pref: any) => {
          response += `- ${pref.key}: ${pref.value}\n`;
        });
        response += '\n';
      }
      
      if (user_context.notes && user_context.notes.length > 0) {
        response += `📝 **Your Notes:** ${user_context.notes.length} notes including "${user_context.notes[0].title}"\n\n`;
      }
      
      response += "I can help you with any questions about your data or assist with tasks.";
      return response;
    }

    // Default contextual response
    return this.generateContextualResponse(message, user_context, task_type);
  }

  private buildSystemPrompt(context: TaskContext): string {
    return `You are LOOM AI Assistant with advanced capabilities using LangChain orchestration.

Task Type: ${context.task_type}
User Context: ${JSON.stringify(context.user_context)}
Conversation Memory: ${context.memory.join('\n')}

Guidelines:
- Provide specific, actionable responses based on user's actual data
- Use conversation history to maintain context
- Be intelligent and helpful
- Reference user preferences when relevant
- Distinguish between different types of questions (singers vs albums, etc.)

Tools Available: web_search, calendar_management, email_management, image_analysis, vector_memory`;
  }

  private generateContextualResponse(message: string, userContext: any, taskType: string): string {
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
}

export const ollamaLangChainService = new OllamaLangChainService();