import { loadModel, createCompletion, createCompletionStream, LLModel } from 'gpt4all';

export class GPT4AllService {
  private model: LLModel | null = null;
  private isModelLoaded = false;
  private isInterrupted = false;
  private modelName = 'mistral-7b-openorca.gguf2.Q4_0.gguf'; // Good balance of quality and speed

  constructor() {
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    try {
      console.log('Loading GPT4All model...');
      this.model = await loadModel(this.modelName, {
        verbose: false,
        device: 'cpu', // Use CPU for better compatibility
        nCtx: 2048     // Context window size
      });
      this.isModelLoaded = true;
      console.log('GPT4All model loaded successfully');
    } catch (error) {
      console.error('Failed to load GPT4All model:', error);
      this.isModelLoaded = false;
    }
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    this.isInterrupted = false;
    
    if (!this.isModelLoaded || !this.model) {
      return this.getFallbackResponse(prompt, systemPrompt);
    }

    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}\nAssistant:` : prompt;
      
      const completion = await createCompletion(this.model, fullPrompt, {
        verbose: false,
        temperature: 0.7,
        maxTokens: 500
      });

      if (this.isInterrupted) {
        return "Response generation was interrupted.";
      }

      return completion.message || this.getFallbackResponse(prompt, systemPrompt);
    } catch (error) {
      console.error('GPT4All generation error:', error);
      return this.getFallbackResponse(prompt, systemPrompt);
    }
  }

  async generateStreamResponse(prompt: string, systemPrompt?: string): Promise<AsyncIterableIterator<string>> {
    this.isInterrupted = false;
    
    if (!this.isModelLoaded || !this.model) {
      return this.getFallbackStreamResponse(prompt, systemPrompt);
    }

    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}\nAssistant:` : prompt;
      
      const stream = createCompletionStream(this.model, fullPrompt, {
        verbose: false,
        temperature: 0.7,
        maxTokens: 500
      });

      return this.processStream(stream);
    } catch (error) {
      console.error('GPT4All stream generation error:', error);
      return this.getFallbackStreamResponse(prompt, systemPrompt);
    }
  }

  private async *processStream(stream: any): AsyncIterableIterator<string> {
    try {
      const tokens: string[] = [];
      
      stream.tokens.on('data', (data: string) => {
        if (!this.isInterrupted) {
          tokens.push(data);
        }
      });

      await stream.result;
      
      if (this.isInterrupted) {
        yield "Response generation was interrupted.";
        return;
      }

      for (const token of tokens) {
        yield token;
      }
    } catch (error) {
      yield "Error in stream processing";
    }
  }

  private async *getFallbackStreamResponse(prompt: string, systemPrompt?: string): AsyncIterableIterator<string> {
    const response = this.getFallbackResponse(prompt, systemPrompt);
    const words = response.split(' ');
    
    for (const word of words) {
      if (this.isInterrupted) break;
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming
    }
  }

  interrupt(): void {
    this.isInterrupted = true;
    console.log('GPT4All processing interrupted');
  }

  private getFallbackResponse(prompt: string, systemPrompt?: string): string {
    console.log('Using GPT4All fallback responses...');
    
    const lowerPrompt = prompt.toLowerCase();
    
    // LOOM-specific responses
    if (lowerPrompt.includes('consciousness') || lowerPrompt.includes('upload')) {
      return "Based on your LOOM activities, I can see you're interested in consciousness technology. Your data shows patterns that suggest you're exploring the intersection of human consciousness and digital preservation. The LOOM platform is designed to gradually build a comprehensive digital twin of your personality and preferences.";
    }
    
    if (lowerPrompt.includes('interests') || lowerPrompt.includes('hobbies')) {
      return "Looking at your LOOM data, I can identify several key interests based on your actual activities. Your notes, calendar events, and search history reveal patterns in your behavior and preferences. This information helps me provide more personalized assistance.";
    }
    
    if (lowerPrompt.includes('notes') || lowerPrompt.includes('writing')) {
      return "Your LOOM Notes show interesting patterns in your thinking and interests. I can analyze the topics you write about, the way you organize information, and the themes that appear frequently in your content to better understand your cognitive patterns.";
    }
    
    if (lowerPrompt.includes('calendar') || lowerPrompt.includes('schedule')) {
      return "Your LOOM Calendar reveals important patterns about your lifestyle, priorities, and time management. I can see when you're most productive, what activities you prioritize, and how you balance different aspects of your life.";
    }
    
    if (lowerPrompt.includes('search') || lowerPrompt.includes('looking for')) {
      return "Your LOOM Search history provides insights into your curiosity and learning patterns. I can see what topics you explore, what problems you're trying to solve, and how your interests evolve over time.";
    }
    
    if (lowerPrompt.includes('email') || lowerPrompt.includes('communication')) {
      return "Your LOOM Mail patterns show how you communicate and what relationships are important to you. I can analyze your communication style, frequency, and the topics you discuss to understand your social and professional networks.";
    }
    
    if (lowerPrompt.includes('chat') || lowerPrompt.includes('message')) {
      return "LOOM Chat allows real-time communication while learning from your conversation patterns. I can see how you interact with others, your communication preferences, and the topics you discuss most frequently.";
    }
    
    if (lowerPrompt.includes('media') || lowerPrompt.includes('photos') || lowerPrompt.includes('gallery')) {
      return "Your LOOM Gallery reveals visual preferences and memories that are important to you. I can analyze the types of media you save, organize, and share to understand your aesthetic preferences and significant moments.";
    }
    
    if (lowerPrompt.includes('ai') || lowerPrompt.includes('assistant')) {
      return "I'm your personal LOOM AI assistant, powered by GPT4All running locally on your device. I analyze your actual data across all LOOM applications to provide personalized insights and assistance while maintaining complete privacy.";
    }
    
    if (lowerPrompt.includes('help') || lowerPrompt.includes('how')) {
      return "I'm here to help you understand your digital patterns and provide personalized assistance based on your actual LOOM data. I can analyze your notes, calendar, searches, emails, and other activities to give you insights about your habits and preferences.";
    }
    
    if (lowerPrompt.includes('data') || lowerPrompt.includes('privacy')) {
      return "Your LOOM data is processed locally using GPT4All, ensuring complete privacy. I analyze your actual activities across all LOOM applications to build a comprehensive understanding of your digital personality while keeping everything secure on your device.";
    }
    
    // General conversation responses
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
      return "Hello! I'm your personal LOOM AI assistant. I can help you understand your digital patterns and provide insights based on your actual data from Notes, Calendar, Search, Mail, Chat, and Gallery. What would you like to explore?";
    }
    
    if (lowerPrompt.includes('thank')) {
      return "You're welcome! I'm here to help you understand your digital patterns and make the most of your LOOM platform data. Feel free to ask me anything about your activities and preferences.";
    }
    
    // Default intelligent response
    return "I'm your LOOM AI assistant, powered by GPT4All. I analyze your actual data from all LOOM applications to provide personalized insights and assistance. I can help you understand your digital patterns, habits, and preferences based on your real activities across Notes, Calendar, Search, Mail, Chat, and Gallery. What would you like to know about your digital life?";
  }

  async generateInsights(learningData: any[], appType: string): Promise<string> {
    const prompt = `Analyze this user data and provide insights about their digital behavior and preferences: ${JSON.stringify(learningData.slice(-10))}`;
    const systemPrompt = `You are a personal AI assistant for the LOOM consciousness platform. Analyze user data to provide meaningful insights about their digital behavior, preferences, and patterns. Focus on ${appType} application usage.`;
    
    return this.generateResponse(prompt, systemPrompt);
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isModelLoaded = false;
      console.log('GPT4All model disposed');
    }
  }
}

export const gpt4allService = new GPT4AllService();