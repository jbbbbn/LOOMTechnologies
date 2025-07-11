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
      await execAsync('pkill -f ollama || true');
      await execAsync('ollama serve > /dev/null 2>&1 &');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for service to start
      
      // Check if model is available
      const { stdout } = await execAsync('ollama list');
      if (stdout.includes(this.modelName)) {
        this.isModelPulled = true;
        return;
      }
      
      // Pull model if not available
      console.log('Pulling Ollama model...');
      await execAsync(`ollama pull ${this.modelName}`);
      this.isModelPulled = true;
      console.log('Ollama model ready');
    } catch (error) {
      console.error('Error setting up Ollama:', error);
      throw new Error('Failed to setup local AI model');
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
      
      const { stdout } = await execAsync(`curl -s -X POST http://localhost:11434/api/generate -d '${JSON.stringify(ollamaPayload)}'`);
      const response = JSON.parse(stdout);
      
      return response.response || 'I apologize, but I encountered an error processing your request. Please try again.';
    } catch (error) {
      console.error('Ollama generation error:', error);
      return 'I apologize, but I encountered an error processing your request. Please try again.';
    }
  }

  async generateInsights(learningData: any[], appType: string): Promise<string> {
    const systemPrompt = `You are a personal AI assistant for the LOOM platform. Analyze the user's data and provide helpful insights. Be concise and actionable.`;
    
    const dataContext = learningData.slice(-10).map(item => `${item.appType}: ${item.dataType} - ${JSON.stringify(item.data)}`).join('\n');
    
    const prompt = `Based on this user activity data from ${appType}:\n${dataContext}\n\nProvide 3 short, actionable insights about their usage patterns and suggestions for improvement.`;
    
    return await this.generateResponse(prompt, systemPrompt);
  }
}

export const aiService = new OllamaService();