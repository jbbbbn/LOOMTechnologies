export class MistralService {
  private apiKey: string | null = null;
  private isInterrupted = false;

  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY || null;
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    this.isInterrupted = false;
    
    if (!this.apiKey) {
      return this.getFallbackResponse(prompt, systemPrompt);
    }

    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      
      messages.push({ role: "user", content: prompt });

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (this.isInterrupted) {
        return "Response generation was interrupted.";
      }

      return data.choices?.[0]?.message?.content || this.getFallbackResponse(prompt, systemPrompt);
    } catch (error) {
      console.error('Mistral API error:', error);
      return this.getFallbackResponse(prompt, systemPrompt);
    }
  }

  async generateStreamResponse(prompt: string, systemPrompt?: string): Promise<AsyncIterableIterator<string>> {
    this.isInterrupted = false;
    
    if (!this.apiKey) {
      return this.getFallbackStreamResponse(prompt, systemPrompt);
    }

    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      
      messages.push({ role: "user", content: prompt });

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      return this.processStream(response);
    } catch (error) {
      console.error('Mistral stream error:', error);
      return this.getFallbackStreamResponse(prompt, systemPrompt);
    }
  }

  private async *processStream(response: Response): AsyncIterableIterator<string> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      return;
    }

    try {
      while (!this.isInterrupted) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async *getFallbackStreamResponse(prompt: string, systemPrompt?: string): AsyncIterableIterator<string> {
    const response = this.getFallbackResponse(prompt, systemPrompt);
    const words = response.split(' ');
    
    for (const word of words) {
      if (this.isInterrupted) break;
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  interrupt(): void {
    this.isInterrupted = true;
  }

  private getFallbackResponse(prompt: string, systemPrompt?: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('note') || lowerPrompt.includes('writing')) {
      return "I can help you organize your thoughts and create structured notes. What would you like to focus on?";
    }
    
    if (lowerPrompt.includes('calendar') || lowerPrompt.includes('schedule')) {
      return "I can help you manage your schedule and plan events. What would you like to schedule?";
    }
    
    if (lowerPrompt.includes('search') || lowerPrompt.includes('find')) {
      return "I can help you search for information. What are you looking for?";
    }
    
    if (lowerPrompt.includes('email') || lowerPrompt.includes('mail')) {
      return "I can help you manage your emails and communications. What do you need assistance with?";
    }
    
    if (lowerPrompt.includes('gallery') || lowerPrompt.includes('photo') || lowerPrompt.includes('image')) {
      return "I can help you organize your media and photos. What would you like to do?";
    }
    
    if (systemPrompt && systemPrompt.includes('LOOM')) {
      return "I'm your LOOM AI assistant. I can help you with notes, calendar, search, email, chat, and gallery management. What would you like to do today?";
    }
    
    return "I'm here to help you with your LOOM platform activities. What can I assist you with today?";
  }

  async generateInsights(learningData: any[], appType: string): Promise<string> {
    if (!learningData || learningData.length === 0) {
      return "No data available for insights generation.";
    }

    const prompt = `Based on the following user activity data, provide insights and recommendations for the ${appType} application: ${JSON.stringify(learningData.slice(-10))}`;
    
    return await this.generateResponse(prompt, "You are an AI assistant analyzing user behavior patterns. Provide helpful insights and actionable recommendations.");
  }
}

export const mistralService = new MistralService();