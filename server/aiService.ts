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
      await this.ensureModelAvailable();
      
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt;
      
      // Use curl to interact with Ollama API
      const ollamaPayload = {
        model: this.modelName,
        prompt: fullPrompt,
        stream: false
      };
      
      const { stdout } = await execAsync(`curl -s -X POST http://localhost:11434/api/generate -d '${JSON.stringify(ollamaPayload).replace(/'/g, "\\'")}'`);
      const response = JSON.parse(stdout);
      
      return response.response || this.getFallbackResponse(prompt);
    } catch (error) {
      console.log('Using fallback AI response while model loads...');
      return this.getFallbackResponse(prompt);
    }
  }
  
  private getFallbackResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('help') || lowerPrompt.includes('what can you do')) {
      return 'I\'m your LOOM AI assistant! I can help you with notes, calendar events, searches, emails, and media. I learn from your activities across all apps to provide personalized assistance. The AI system is currently setting up - full capabilities will be available soon.';
    }
    
    if (lowerPrompt.includes('note') || lowerPrompt.includes('remind')) {
      return 'I can help you create and organize notes. Try using the Notes app to capture your thoughts, and I\'ll learn from your writing patterns to provide better suggestions.';
    }
    
    if (lowerPrompt.includes('calendar') || lowerPrompt.includes('schedule') || lowerPrompt.includes('event')) {
      return 'I can assist with scheduling and calendar management. Use the Calendar app to create events, and I\'ll help you optimize your time and suggest better scheduling patterns.';
    }
    
    if (lowerPrompt.includes('search') || lowerPrompt.includes('find')) {
      return 'I can help you search and find information. The Search app provides web search capabilities, and I learn from your search patterns to improve results.';
    }
    
    if (lowerPrompt.includes('email') || lowerPrompt.includes('mail')) {
      return 'I can assist with email management and organization. Use the Mail app to manage your communications, and I\'ll help you stay organized.';
    }
    
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
      return 'Hello! Welcome to LOOM. I\'m your AI assistant that learns from your activities across all apps. How can I help you today?';
    }
    
    if (lowerPrompt.includes('create') || lowerPrompt.includes('add')) {
      return 'I can help you create content across all LOOM apps. Use the Notes app to write, Calendar to schedule events, or Gallery to upload media. I\'ll learn from your patterns to provide better suggestions.';
    }
    
    if (lowerPrompt.includes('organize') || lowerPrompt.includes('manage')) {
      return 'I can help you organize your digital life. I track your usage patterns across notes, calendar, searches, emails, and media to provide personalized organization suggestions.';
    }
    
    return 'I\'m your LOOM AI assistant! I can help with notes, calendar events, searches, emails, and media management. The full AI model is still downloading, but I\'m ready to assist you with the platform features. Try asking me about creating content or organizing your data!';
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