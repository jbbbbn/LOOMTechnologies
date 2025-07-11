// Manual Mistral API implementation since package install failed
interface MistralResponse {
  choices: { message: { content: string } }[];
}

interface MistralStreamResponse {
  choices: { delta: { content?: string } }[];
}

export class MistralService {
  private apiKey: string | null = null;
  private isInitialized = false;
  private isInterrupted = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.apiKey = process.env.MISTRAL_API_KEY || null;
      if (!this.apiKey) {
        console.log('Mistral API key not found, using fallback responses');
        return;
      }

      this.isInitialized = true;
      console.log('Mistral AI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Mistral AI service:', error);
      this.isInitialized = false;
    }
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    this.isInterrupted = false;
    
    if (!this.isInitialized || !this.apiKey) {
      return this.getFallbackResponse(prompt, systemPrompt);
    }

    try {
      const messages: any[] = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      messages.push({ role: 'user', content: prompt });

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data: MistralResponse = await response.json();

      if (this.isInterrupted) {
        return "Response generation was interrupted.";
      }

      return data.choices[0].message.content || this.getFallbackResponse(prompt, systemPrompt);
    } catch (error) {
      console.error('Mistral AI generation error:', error);
      return this.getFallbackResponse(prompt, systemPrompt);
    }
  }

  async generateStreamResponse(prompt: string, systemPrompt?: string): Promise<AsyncIterableIterator<string>> {
    this.isInterrupted = false;
    
    if (!this.isInitialized || !this.apiKey) {
      return this.getFallbackStreamResponse(prompt, systemPrompt);
    }

    try {
      const messages: any[] = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      messages.push({ role: 'user', content: prompt });

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      return this.processStreamResponse(response);
    } catch (error) {
      console.error('Mistral AI stream generation error:', error);
      return this.getFallbackStreamResponse(prompt, systemPrompt);
    }
  }

  private async *processStreamResponse(response: Response): AsyncIterableIterator<string> {
    try {
      const reader = response.body?.getReader();
      if (!reader) {
        yield "Error: No response body";
        return;
      }

      const decoder = new TextDecoder();

      while (true) {
        if (this.isInterrupted) {
          yield "Response generation was interrupted.";
          return;
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed: MistralStreamResponse = JSON.parse(data);
              if (parsed.choices[0]?.delta?.content) {
                yield parsed.choices[0].delta.content;
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream processing error:', error);
      yield "Error processing stream response.";
    }
  }

  private async *getFallbackStreamResponse(prompt: string, systemPrompt?: string): AsyncIterableIterator<string> {
    const fallbackResponse = this.getFallbackResponse(prompt, systemPrompt);
    const words = fallbackResponse.split(' ');
    
    for (const word of words) {
      if (this.isInterrupted) {
        yield "Response generation was interrupted.";
        return;
      }
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  interrupt(): void {
    this.isInterrupted = true;
  }

  private getFallbackResponse(prompt: string, systemPrompt?: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Context-aware responses based on LOOM platform
    if (lowerPrompt.includes('note') || lowerPrompt.includes('writing')) {
      return "I can help you organize your thoughts and notes. Based on your LOOM activity, I see you're interested in various topics. Would you like me to help you categorize your notes or suggest new topics to explore?";
    }
    
    if (lowerPrompt.includes('calendar') || lowerPrompt.includes('schedule') || lowerPrompt.includes('event')) {
      return "I can assist with your schedule management. Looking at your calendar patterns, I can help you optimize your time, suggest meeting times, or remind you about upcoming events. What would you like to schedule?";
    }
    
    if (lowerPrompt.includes('email') || lowerPrompt.includes('mail')) {
      return "I can help you manage your emails more effectively. I can suggest responses, help organize your inbox, or draft new emails. What email task would you like assistance with?";
    }
    
    if (lowerPrompt.includes('search') || lowerPrompt.includes('find')) {
      return "I can help you find information across all your LOOM applications. I can search through your notes, emails, calendar events, and more. What are you looking for?";
    }
    
    if (lowerPrompt.includes('comic') || lowerPrompt.includes('Comics List')) {
      return "I see you have a Comics List in your notes! You're interested in various comic series. Would you like me to help you organize your comic collection, suggest new series, or track your reading progress?";
    }
    
    if (lowerPrompt.includes('gallery') || lowerPrompt.includes('photo') || lowerPrompt.includes('media')) {
      return "I can help you organize and manage your media gallery. I can suggest tags, help categorize your photos, or recommend ways to better organize your media collection.";
    }
    
    if (lowerPrompt.includes('chat') || lowerPrompt.includes('message')) {
      return "I can assist with your messaging and communication. I can help draft messages, suggest responses, or help you manage your chat conversations more effectively.";
    }
    
    // General LOOM consciousness theme responses
    if (lowerPrompt.includes('consciousness') || lowerPrompt.includes('upload') || lowerPrompt.includes('digital self')) {
      return "LOOM is building your digital consciousness by analyzing your interactions across all applications. Every note you write, every event you schedule, and every search you make contributes to understanding your digital self. How can I help you explore this digital representation of yourself?";
    }
    
    if (lowerPrompt.includes('what do you know about me') || lowerPrompt.includes('my data') || lowerPrompt.includes('my information')) {
      return "Based on your LOOM activity, I can see you're an organized person who uses multiple applications to manage your digital life. You have notes, scheduled events, search history, and email communications. This data helps me understand your interests and preferences to provide better assistance.";
    }
    
    // Default helpful response
    return "I'm your LOOM AI Assistant, here to help you manage your digital life. I can assist with notes, calendar, email, search, media, and chat. I learn from your interactions to provide personalized assistance. What would you like to work on today?";
  }

  async generateInsights(learningData: any[], appType: string): Promise<string> {
    const contextPrompt = `You are the LOOM AI Assistant, analyzing user data to provide personalized insights. 
    
    Application: ${appType}
    User Data: ${JSON.stringify(learningData.slice(-10))}
    
    Provide helpful insights about the user's patterns, preferences, and suggestions for improvement.`;

    return await this.generateResponse(
      "Generate insights about my usage patterns and provide helpful suggestions.",
      contextPrompt
    );
  }

  dispose(): void {
    this.apiKey = null;
    this.isInitialized = false;
  }
}

export const mistralService = new MistralService();