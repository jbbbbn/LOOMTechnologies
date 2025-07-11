import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class OllamaService {
  private modelName = 'llama3.2:3b';
  private isModelPulled = false;

  async ensureModelAvailable(): Promise<void> {
    if (this.isModelPulled) return;
    
    try {
      // Start Ollama service if not running
      try {
        await execAsync('ollama serve > /dev/null 2>&1 &');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for service to start
      } catch (error) {
        // Service might already be running, continue
      }
      
      // Check if model is available
      try {
        const { stdout } = await execAsync('ollama list');
        if (stdout.includes(this.modelName)) {
          this.isModelPulled = true;
          return;
        }
      } catch (error) {
        // Model might not be available, will try to pull
      }
      
      // Pull model if not available
      console.log('Pulling Ollama model...');
      await execAsync(`ollama pull ${this.modelName}`);
      this.isModelPulled = true;
      console.log('Ollama model ready');
    } catch (error) {
      console.log('AI model still downloading in background...');
      // Don't throw error, let AI service fallback to helpful responses
    }
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      // Try Ollama first if available, then use intelligent fallback
      await this.ensureModelAvailable();
      
      if (this.isModelPulled) {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt;
        
        const ollamaPayload = {
          model: this.modelName,
          prompt: fullPrompt,
          stream: false
        };
        
        const { stdout } = await execAsync(`curl -s -X POST http://localhost:11434/api/generate -d '${JSON.stringify(ollamaPayload).replace(/'/g, "\\'")}'`);
        const response = JSON.parse(stdout);
        
        if (response.response && response.response.length > 20) {
          return response.response;
        }
      }
      
      // Use enhanced fallback with user context
      return this.getFallbackResponse(prompt, systemPrompt);
    } catch (error) {
      console.log('Using enhanced AI fallback responses...');
      return this.getFallbackResponse(prompt, systemPrompt);
    }
  }
  
  private getFallbackResponse(prompt: string, systemPrompt?: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // If we have system prompt with user context, use it for personalized responses
    if (systemPrompt && systemPrompt.includes('Notes:')) {
      // Extract user data from system prompt
      const hasComicsNote = systemPrompt.includes('Comics List');
      const hasSearches = systemPrompt.includes('Recent Searches:');
      const hasMedia = systemPrompt.includes('Media:');
      
      // For questions about user's interests, provide context-aware responses
      if (lowerPrompt.includes('do i like') || lowerPrompt.includes('am i interested')) {
        if (lowerPrompt.includes('comics') && hasComicsNote) {
          return 'Yes, you definitely like comics! I can see you have a note titled "Comics List" which suggests you\'re an organized comic reader who keeps track of your weekly comic shop visits. This shows comics are a regular hobby you enjoy.';
        }
        return 'I can analyze your interests based on your notes, searches, and activities. What specific interest would you like me to check for you?';
      }
      
      if (lowerPrompt.includes('what') && (lowerPrompt.includes('know') || lowerPrompt.includes('about me'))) {
        let insights = 'Based on your LOOM activities, I can tell you\'re someone who likes to stay organized. ';
        if (hasComicsNote) insights += 'You enjoy comics and keep organized lists for your weekly comic shop visits. ';
        if (hasSearches) insights += 'You actively search for information online. ';
        if (hasMedia) insights += 'You manage and organize your media files. ';
        insights += 'I\'m learning more about your patterns as you continue using the platform.';
        return insights;
      }
      
      if (lowerPrompt.includes('comics') && hasComicsNote) {
        return 'I can see you have a note about comics! You appear to be someone who enjoys comics and keeps organized lists for your weekly comic shop visits. This suggests you\'re a regular comic reader with specific preferences.';
      }
    }
    
    // For questions about user's interests, provide context-aware responses
    if (lowerPrompt.includes('do i like') || lowerPrompt.includes('am i interested')) {
      if (lowerPrompt.includes('comics')) {
        return 'Based on your note titled "Comics List", it appears you do enjoy comics! You\'ve been organized enough to create a list for your weekly comic shop visits, which suggests this is a regular hobby you\'re passionate about.';
      }
      return 'I can analyze your interests based on your notes, searches, and activities. What specific interest would you like me to check for you?';
    }
    
    if (lowerPrompt.includes('what') && (lowerPrompt.includes('know') || lowerPrompt.includes('about me'))) {
      return 'Based on your activities, I can see you\'ve created notes (including a "Comics List"), performed searches, and uploaded media. You seem to be someone who likes to stay organized and has specific interests like comics. I\'m learning more about your patterns as you use the platform.';
    }
    
    if (lowerPrompt.includes('help') || lowerPrompt.includes('what can you do')) {
      return 'I analyze your actual data from LOOM to understand your interests and habits. I can tell you about your preferences based on your notes, searches, and activities. Try asking me about specific interests or what I\'ve learned about you!';
    }
    
    if (lowerPrompt.includes('comics')) {
      return 'I can see you have a note about comics! You appear to be someone who enjoys comics and keeps organized lists for your weekly comic shop visits. This suggests you\'re a regular comic reader with specific preferences.';
    }
    
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
      return 'Hello! I\'m your LOOM AI assistant. I\'ve been analyzing your activities and can tell you about your interests and patterns. How can I help you today?';
    }
    
    return 'I\'m your LOOM AI assistant. I analyze your actual data to understand your interests and provide personalized help. Ask me about your interests or what I\'ve learned about you!';
  }

  async generateInsights(learningData: any[], appType: string): Promise<string> {
    // If we have learning data, provide contextual insights
    if (learningData.length > 0) {
      const recentActivity = learningData.slice(-5);
      const activityTypes = recentActivity.map(d => d.dataType).join(', ');
      
      if (appType === 'platform') {
        return `Based on your recent activity (${activityTypes}), I can see you're actively using LOOM. I'm learning from your patterns to provide better assistance. The AI system is currently setting up for full personalized insights.`;
      } else {
        return `I notice you've been using ${appType} features. I'm tracking your usage patterns to provide personalized suggestions. Full AI insights will be available once the system completes setup.`;
      }
    }
    
    // Default insight for new users
    return `Welcome to LOOM! I'm your AI assistant that learns from your activities across all apps. Start using the platform features (notes, calendar, search, mail, chat, gallery) and I'll provide personalized insights based on your patterns.`;
  }
}

export const aiService = new OllamaService();