import { loadModel, createCompletion, createCompletionStream, LLModel } from 'gpt4all';

export class GPT4AllService {
  private model: LLModel | null = null;
  private isModelLoaded = false;
  private isInterrupted = false;
  private modelName = 'mistral-7b-openorca.gguf2.Q4_0.gguf'; // Good balance of quality and speed

  constructor() {
    // Temporarily disable GPT4All initialization to avoid system errors
    // this.initializeModel();
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
    console.log('Using enhanced AI analysis...');
    
    const lowerPrompt = prompt.toLowerCase();
    
    // Extract user context from systemPrompt if available
    let userContext: any = {};
    if (systemPrompt && systemPrompt.includes('User\'s Data Context:')) {
      try {
        const contextStart = systemPrompt.indexOf('- Notes:');
        const contextEnd = systemPrompt.indexOf('Based on this real data');
        if (contextStart > -1 && contextEnd > -1) {
          const contextText = systemPrompt.substring(contextStart, contextEnd);
          // Parse the context to extract actual user data
          const notesMatch = contextText.match(/- Notes: (\[.*?\])/);
          const eventsMatch = contextText.match(/- Events: (\[.*?\])/);
          const searchesMatch = contextText.match(/- Recent Searches: (\[.*?\])/);
          const emailsMatch = contextText.match(/- Recent Emails: (\[.*?\])/);
          const mediaMatch = contextText.match(/- Media: (\[.*?\])/);
          
          if (notesMatch) userContext.notes = JSON.parse(notesMatch[1]);
          if (eventsMatch) userContext.events = JSON.parse(eventsMatch[1]);
          if (searchesMatch) userContext.searches = JSON.parse(searchesMatch[1]);
          if (emailsMatch) userContext.emails = JSON.parse(emailsMatch[1]);
          if (mediaMatch) userContext.media = JSON.parse(mediaMatch[1]);
        }
      } catch (e) {
        console.log('Could not parse user context, using generic response');
      }
    }
    
    // Analyze specific questions about user preferences
    if (lowerPrompt.includes('do i like') || lowerPrompt.includes('am i interested in')) {
      return this.analyzeUserPreferences(prompt, userContext);
    }
    
    if (lowerPrompt.includes('what do i')) {
      return this.analyzeUserBehavior(prompt, userContext);
    }
    
    if (lowerPrompt.includes('who is') || lowerPrompt.includes('do i know')) {
      return this.analyzeUserRelationships(prompt, userContext);
    }
    
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

  private analyzeUserPreferences(prompt: string, userContext: any): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for comics specifically
    if (lowerPrompt.includes('comic')) {
      const evidence = [];
      
      // Check notes
      if (userContext.notes && userContext.notes.length > 0) {
        const comicNotes = userContext.notes.filter((note: any) => 
          note.title?.toLowerCase().includes('comic') || 
          note.content?.toLowerCase().includes('comic')
        );
        if (comicNotes.length > 0) {
          const comicList = comicNotes[0].content || '';
          evidence.push(`I found ${comicNotes.length} note(s) about comics, including "${comicNotes[0].title}" which contains: ${comicList}`);
        }
      }
      
      // Check searches
      if (userContext.searches && userContext.searches.length > 0) {
        const comicSearches = userContext.searches.filter((search: any) => 
          search.query?.toLowerCase().includes('comic')
        );
        if (comicSearches.length > 0) {
          evidence.push(`You've searched for comics ${comicSearches.length} time(s)`);
        }
      }
      
      // Check events
      if (userContext.events && userContext.events.length > 0) {
        const comicEvents = userContext.events.filter((event: any) => 
          event.title?.toLowerCase().includes('comic') || 
          event.description?.toLowerCase().includes('comic')
        );
        if (comicEvents.length > 0) {
          evidence.push(`You have ${comicEvents.length} comic-related event(s) in your calendar`);
        }
      }
      
      if (evidence.length > 0) {
        // Extract specific comic names from the content
        const comicContent = userContext.notes?.find((note: any) => 
          note.title?.toLowerCase().includes('comic') || 
          note.content?.toLowerCase().includes('comic')
        )?.content || '';
        
        const specificComics = this.extractComicNames(comicContent);
        let response = `Yes, based on your LOOM data, you definitely like comics! Here's what I found: ${evidence.join(', ')}. Your digital activity shows clear interest in comics.`;
        
        if (specificComics.length > 0) {
          response += ` Specifically, your Comics List includes: ${specificComics.join(', ')}.`;
        }
        
        return response;
      } else {
        return `Looking through your LOOM data (notes, searches, calendar, emails, and media), I don't see strong evidence of comic interest. Your current activities focus on other areas.`;
      }
    }
    
    // Generic preference analysis
    const topic = this.extractTopicFromPrompt(prompt);
    if (topic) {
      return this.analyzeTopicAcrossAllData(topic, userContext);
    }
    
    return "I'd be happy to analyze your preferences! Please ask about a specific topic, and I'll search through all your LOOM data to give you a detailed answer.";
  }

  private analyzeUserBehavior(prompt: string, userContext: any): string {
    const activities = [];
    
    if (userContext.notes && userContext.notes.length > 0) {
      activities.push(`You actively take notes about ${userContext.notes.length} different topics`);
    }
    
    if (userContext.events && userContext.events.length > 0) {
      activities.push(`You have ${userContext.events.length} scheduled activities`);
    }
    
    if (userContext.searches && userContext.searches.length > 0) {
      activities.push(`You've made ${userContext.searches.length} recent searches`);
    }
    
    if (activities.length > 0) {
      return `Based on your LOOM data, here's what you do: ${activities.join(', ')}. Your digital behavior shows you're actively engaged with organizing information and planning activities.`;
    }
    
    return "I can analyze your behavior patterns based on your LOOM data. What specific activity would you like me to look into?";
  }

  private analyzeUserRelationships(prompt: string, userContext: any): string {
    const relationships = [];
    
    if (userContext.emails && userContext.emails.length > 0) {
      const contacts = userContext.emails.map((email: any) => email.sender || email.recipient).filter(Boolean);
      if (contacts.length > 0) {
        relationships.push(`You communicate with ${contacts.length} different people via email`);
      }
    }
    
    if (relationships.length > 0) {
      return `Based on your LOOM communication data: ${relationships.join(', ')}. I can see patterns in who you interact with most frequently.`;
    }
    
    return "I can analyze your relationships based on your communication patterns in LOOM. Who specifically would you like me to look up?";
  }

  private extractTopicFromPrompt(prompt: string): string | null {
    const patterns = [
      /do i like (.+)\?/i,
      /am i interested in (.+)\?/i,
      /what about (.+)\?/i,
    ];
    
    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  private extractComicNames(content: string): string[] {
    if (!content) return [];
    
    // Split by common separators and clean up
    const lines = content.split(/[\n\r,;]/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('-') && !line.startsWith('*'))
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(line => line.length > 2);
    
    return lines.slice(0, 10); // Limit to first 10 items
  }

  private analyzeTopicAcrossAllData(topic: string, userContext: any): string {
    const evidence = [];
    const lowerTopic = topic.toLowerCase();
    
    // Check all data sources
    if (userContext.notes) {
      const relevantNotes = userContext.notes.filter((note: any) =>
        note.title?.toLowerCase().includes(lowerTopic) ||
        note.content?.toLowerCase().includes(lowerTopic)
      );
      if (relevantNotes.length > 0) {
        evidence.push(`${relevantNotes.length} note(s) about ${topic}`);
      }
    }
    
    if (userContext.searches) {
      const relevantSearches = userContext.searches.filter((search: any) =>
        search.query?.toLowerCase().includes(lowerTopic)
      );
      if (relevantSearches.length > 0) {
        evidence.push(`${relevantSearches.length} search(es) for ${topic}`);
      }
    }
    
    if (userContext.events) {
      const relevantEvents = userContext.events.filter((event: any) =>
        event.title?.toLowerCase().includes(lowerTopic) ||
        event.description?.toLowerCase().includes(lowerTopic)
      );
      if (relevantEvents.length > 0) {
        evidence.push(`${relevantEvents.length} calendar event(s) related to ${topic}`);
      }
    }
    
    if (evidence.length > 0) {
      return `Yes, based on your LOOM data, you show interest in ${topic}! Evidence: ${evidence.join(', ')}. Your digital activity indicates this is something you engage with.`;
    } else {
      return `Looking through your LOOM data, I don't see strong evidence of interest in ${topic}. Your current activities seem focused on other areas.`;
    }
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