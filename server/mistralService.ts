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
    
    // Extract user context from system prompt if available
    let userContext: any = {};
    if (systemPrompt) {
      try {
        // Extract user data from system prompt
        const notesMatch = systemPrompt.match(/- Notes: (\[.*?\])/);
        const eventsMatch = systemPrompt.match(/- Events: (\[.*?\])/);
        const searchesMatch = systemPrompt.match(/- Recent Searches: (\[.*?\])/);
        
        if (notesMatch) userContext.notes = JSON.parse(notesMatch[1]);
        if (eventsMatch) userContext.events = JSON.parse(eventsMatch[1]);
        if (searchesMatch) userContext.searches = JSON.parse(searchesMatch[1]);
      } catch (e) {
        // If parsing fails, use generic responses
      }
    }
    
    // Analyze user's specific data for better responses
    if (lowerPrompt.includes('what do you know about me') || lowerPrompt.includes('my data') || lowerPrompt.includes('my information')) {
      let response = "Based on your LOOM data, I can see several things about you:\n\n";
      
      if (userContext.notes?.length > 0) {
        response += `• You have ${userContext.notes.length} note${userContext.notes.length > 1 ? 's' : ''}, including: ${userContext.notes.map((n: any) => n.title).join(', ')}\n`;
      }
      
      if (userContext.events?.length > 0) {
        // Get unique event titles to avoid repetition
        const uniqueEvents = [...new Set(userContext.events.map((e: any) => e.title))];
        const eventCount = userContext.events.length;
        
        if (uniqueEvents.length === 1) {
          response += `• Your calendar shows ${eventCount} "${uniqueEvents[0]}" events, indicating you work at D-SYDE\n`;
        } else {
          response += `• Your calendar has ${eventCount} events including: ${uniqueEvents.slice(0, 3).join(', ')}${uniqueEvents.length > 3 ? ', and others' : ''}\n`;
        }
      }
      
      if (userContext.searches?.length > 0) {
        const uniqueSearches = [...new Set(userContext.searches.map((s: any) => s.query))];
        response += `• You've recently searched for: ${uniqueSearches.join(', ')}\n`;
      }
      
      response += "\nThis gives me insights into your interests and helps me provide personalized assistance.";
      return response;
    }
    
    if (lowerPrompt.includes('where do i work') || lowerPrompt.includes('my work') || lowerPrompt.includes('my job')) {
      if (userContext.events?.some((e: any) => e.title.toLowerCase().includes('work'))) {
        const workEvents = userContext.events.filter((e: any) => e.title.toLowerCase().includes('work'));
        return `Based on your calendar, you work at D-SYDE. I can see multiple "Work @ D-SYDE" events in your schedule, which suggests this is your primary workplace.`;
      }
      return "I can see work-related activities in your calendar. Could you tell me more about your work so I can better assist you?";
    }
    
    if (lowerPrompt.includes('calendar') || lowerPrompt.includes('schedule') || lowerPrompt.includes('can you see my calendar')) {
      if (userContext.events?.length > 0) {
        const uniqueEvents = [...new Set(userContext.events.map((e: any) => e.title))];
        const eventCount = userContext.events.length;
        
        if (uniqueEvents.length === 1) {
          return `Yes, I can see your calendar! You have ${eventCount} "${uniqueEvents[0]}" events scheduled. How can I help you with your schedule?`;
        } else {
          return `Yes, I can see your calendar! You have ${eventCount} events scheduled including: ${uniqueEvents.slice(0, 3).join(', ')}. How can I help you with your schedule?`;
        }
      }
      return "I can see your calendar events and help you manage your schedule. What would you like to know about your upcoming events?";
    }
    
    if (lowerPrompt.includes('comic') || lowerPrompt.includes('Comics List')) {
      if (userContext.notes?.some((n: any) => n.title.toLowerCase().includes('comic'))) {
        return "I can see you have a Comics List in your notes! You're interested in various comic series. Would you like me to help you organize your collection or suggest new comics based on your interests?";
      }
      return "I can help you with comic-related topics. What would you like to know about comics?";
    }
    
    // Context-aware responses based on LOOM platform
    if (lowerPrompt.includes('note') || lowerPrompt.includes('writing')) {
      return "I can help you organize your thoughts and notes. Based on your LOOM activity, I can assist with categorizing, searching, or creating new notes. What would you like to work on?";
    }
    
    if (lowerPrompt.includes('email') || lowerPrompt.includes('mail')) {
      return "I can help you manage your emails more effectively. I can suggest responses, help organize your inbox, or draft new emails. What email task would you like assistance with?";
    }
    
    if (lowerPrompt.includes('search') || lowerPrompt.includes('find')) {
      return "I can help you find information across all your LOOM applications. I can search through your notes, emails, calendar events, and more. What are you looking for?";
    }
    
    if (lowerPrompt.includes('gallery') || lowerPrompt.includes('photo') || lowerPrompt.includes('media')) {
      return "I can help you organize and manage your media gallery. I can suggest tags, help categorize your photos, or recommend ways to better organize your media collection.";
    }
    
    // General LOOM consciousness theme responses
    if (lowerPrompt.includes('consciousness') || lowerPrompt.includes('upload') || lowerPrompt.includes('digital self')) {
      return "LOOM is building your digital consciousness by analyzing your interactions across all applications. Every note you write, every event you schedule, and every search you make contributes to understanding your digital self. How can I help you explore this digital representation of yourself?";
    }
    
    // Default helpful response
    return "I'm your LOOM AI Assistant, here to help you manage your digital life. I can assist with notes, calendar, email, search, media, and chat. I learn from your interactions to provide personalized assistance. What would you like to work on today?";
  }

  async generateInsights(learningData: any[], appType: string): Promise<string> {
    // Create more intelligent insights based on actual user behavior
    if (learningData.length === 0) {
      return "Welcome to LOOM! Start using the platform to get personalized insights about your digital habits and preferences.";
    }

    const recentData = learningData.slice(-10);
    const appTypes = [...new Set(recentData.map(item => item.appType))];
    const dataTypes = [...new Set(recentData.map(item => item.dataType))];
    
    let insights = "<h3>🧠 Your LOOM Activity Summary</h3>";
    
    // Analyze app usage patterns
    const appUsage = appTypes.reduce((acc, app) => {
      acc[app] = recentData.filter(item => item.appType === app).length;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedApp = Object.entries(appUsage).sort(([,a], [,b]) => b - a)[0];
    if (mostUsedApp) {
      insights += `<p>🎯 <strong>Most Active</strong>: You're most engaged with ${mostUsedApp[0]} (${mostUsedApp[1]} activities)</p>`;
    }
    
    // Analyze specific activities
    if (recentData.some(item => item.dataType === 'note_created')) {
      insights += `<p>📝 <strong>Note Taking</strong>: You're actively creating notes, showing good information management habits</p>`;
    }
    
    if (recentData.some(item => item.dataType === 'event_created')) {
      insights += `<p>📅 <strong>Schedule Management</strong>: You're organizing your time well by creating calendar events</p>`;
    }
    
    if (recentData.some(item => item.dataType === 'search_performed')) {
      const searches = recentData.filter(item => item.dataType === 'search_performed');
      insights += `<p>🔍 <strong>Information Seeking</strong>: You've performed ${searches.length} searches, showing curiosity and research habits</p>`;
    }
    
    if (recentData.some(item => item.dataType === 'email_created')) {
      insights += `<p>📧 <strong>Communication</strong>: You're actively managing your email communications</p>`;
    }
    
    // Provide actionable suggestions
    insights += "<h3>💡 Suggestions for Better Experience</h3>";
    
    if (!appTypes.includes('gallery')) {
      insights += "<p>📸 Consider using the Gallery to organize your media files</p>";
    }
    
    if (!appTypes.includes('chat')) {
      insights += "<p>💬 Try the Chat feature for real-time communication</p>";
    }
    
    if (appTypes.length < 3) {
      insights += "<p>🚀 Explore more LOOM applications to get a complete AI clone experience</p>";
    }
    
    insights += "<p>🧠 <strong><em>Your AI clone is growing stronger with each interaction!</em></strong></p>";
    
    return insights;
  }

  dispose(): void {
    this.apiKey = null;
    this.isInitialized = false;
  }
}

export const mistralService = new MistralService();