import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export class OllamaService {
  private modelName = 'llama3.2:3b';
  private isModelPulled = false;
  private isInterrupted = false;

  async ensureModelAvailable(): Promise<void> {
    if (this.isModelPulled) return;

    try {
      await execAsync('ollama serve > /dev/null 2>&1 &');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch {}

    try {
      const { stdout } = await execAsync('ollama list');
      if (stdout.includes(this.modelName)) {
        this.isModelPulled = true;
        return;
      }
    } catch {}

    console.log('Pulling Ollama model...');
    await execAsync(`ollama pull ${this.modelName}`);
    this.isModelPulled = true;
    console.log('Ollama model ready');
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    this.isInterrupted = false;

    const preference = this.extractExplicitPreference(prompt);
    if (preference) {
      await this.saveUserPreference('defaultUser', preference);
      return `Got it! "${preference.value}" is now saved as your favorite ${preference.type.replace("_", " ")}. 🎧`;
    }

    if (this.isInterrupted) return "Response interrupted by user.";
    await this.ensureModelAvailable();

    if (this.isModelPulled && !this.isInterrupted) {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt;

      const ollamaPayload = {
        model: this.modelName,
        prompt: fullPrompt,
        stream: false
      };

      try {
        const { stdout } = await execAsync(`curl -s -X POST http://localhost:11434/api/generate -d '${JSON.stringify(ollamaPayload).replace(/'/g, "\\'")}'`);
        const response = JSON.parse(stdout);
        if (response.response && response.response.length > 20 && !this.isInterrupted) {
          return response.response;
        }
      } catch (error) {
        console.log("Ollama error:", error);
      }
    }

    return this.getFallbackResponse(prompt, systemPrompt);
  }

  interrupt(): void {
    this.isInterrupted = true;
  }

  private extractExplicitPreference(message: string): { type: string; value: string } | null {
    const albumMatch = message.match(/(.+?) is (my )?(favorite|favourite) (music )?album( of all time)?/i);
    if (albumMatch) {
      return { type: "music_album", value: albumMatch[1].trim() };
    }

    const movieMatch = message.match(/(.+?) is (my )?(favorite|favourite) movie( of all time)?/i);
    if (movieMatch) {
      return { type: "movie", value: movieMatch[1].trim() };
    }

    return null;
  }

  private async saveUserPreference(userId: string, pref: { type: string; value: string }) {
    const prefsPath = path.resolve(__dirname, '../data/preferences.json');
    let prefs: Record<string, Record<string, string>> = {};

    try {
      prefs = JSON.parse(fs.readFileSync(prefsPath, 'utf-8'));
    } catch (e) {
      prefs = {};
    }

    prefs[userId] = prefs[userId] || {};
    prefs[userId][pref.type] = pref.value;

    fs.writeFileSync(prefsPath, JSON.stringify(prefs, null, 2));
  }

  private getFallbackResponse(prompt: string, systemPrompt?: string): string {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("what") && lowerPrompt.includes("favorite album")) {
      try {
        const prefsRaw = fs.readFileSync(path.resolve(__dirname, '../data/preferences.json'), 'utf-8');
        const prefs = JSON.parse(prefsRaw);
        const album = prefs['defaultUser']?.['music_album'];
        return album ? `Your favorite music album is "${album}". 🔥` : `I don't know your favorite album yet. Tell me!`;
      } catch {
        return `I can't find any saved favorite albums.`;
      }
    }

    if (lowerPrompt.includes("hello") || lowerPrompt.includes("hi")) {
      return 'Hello! I\'m your LOOM AI assistant. I can learn your preferences and help you based on what I know about you. Try saying something like "My favorite album is..."!';
    }

    return 'I\'m your LOOM AI assistant. I analyze your data to understand your interests. Tell me about your preferences or ask what I know about you!';
  }

  async generateInsights(learningData: any[], appType: string): Promise<string> {
    try {
      const notesData = learningData.filter(item => item.appType === 'notes');
      const calendarData = learningData.filter(item => item.appType === 'calendar');
      const searchData = learningData.filter(item => item.appType === 'search');
      const mediaData = learningData.filter(item => item.appType === 'gallery');

      let contextualInsights = "Based on your LOOM activities, I can see:\n";

      if (notesData.some(item => item.data.title?.toLowerCase().includes('comics'))) {
        contextualInsights += "• You're a comics enthusiast who stays organized with weekly lists\n";
      }

      if (calendarData.some(item => item.data.title?.toLowerCase().includes('gym'))) {
        contextualInsights += "• You maintain a regular gym routine\n";
      }

      if (calendarData.some(item => item.data.title?.toLowerCase().includes('work'))) {
        contextualInsights += "• You follow a structured work schedule\n";
      }

      if (searchData.length > 0) {
        contextualInsights += "• You're curious and frequently search online\n";
      }

      if (mediaData.length > 0) {
        contextualInsights += "• You manage and organize your media library\n";
      }

      contextualInsights += "\nI'm learning more about you as you use LOOM.";
      return contextualInsights;
    } catch (error) {
      console.error('AI insights generation error:', error);
      return "I'm analyzing your usage. Keep exploring LOOM so I can personalize even better!";
    }
  }
}

export const aiService = new OllamaService();