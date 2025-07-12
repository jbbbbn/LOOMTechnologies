interface AIResponse {
  response: string;
  confidence: number;
  task_type: string;
  memory_updated: boolean;
  tools_used: string[];
}

export class LangChainOrchestrator {
  private serviceUrl: string;

  constructor(serviceUrl: string = 'http://192.168.8.163:11434') {
    this.serviceUrl = serviceUrl;
  }

  async orchestrateTask(
    message: string,
    userId: number,
    userContext: Record<string, any>,
    taskType?: string
  ): Promise<AIResponse> {
    const prompt = this.buildPrompt(message, userContext);

    try {
      const response = await fetch(`${this.serviceUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openhermes:2.5',
          prompt,
          stream: false
        })
      });

      const data = await response.json();

      return {
        response: data.response.trim(),
        confidence: 0.9,
        task_type: taskType || 'general_chat',
        memory_updated: true,
        tools_used: ['ollama-openhermes']
      };
    } catch (error) {
      console.error('Ollama orchestration error:', error);
      return {
        response: "⚠️ Non riesco a contattare il modello LOOM AI in locale.",
        confidence: 0.0,
        task_type: taskType || 'error',
        memory_updated: false,
        tools_used: []
      };
    }
  }

  private buildPrompt(message: string, userContext: Record<string, any>): string {
    let context = 'Sei LOOM AI, un assistente personale intelligente.';

    if (userContext.preferences && userContext.preferences.length > 0) {
      const prefs = userContext.preferences.map((p: any) => `${p.key}: ${p.value}`).join('\n');
      context += `\nConosci le preferenze dell'utente:\n${prefs}`;
    }

    if (userContext.notes && userContext.notes.length > 0) {
      const notes = userContext.notes.slice(0, 3).map((n: any) => `• ${n.title}`).join('\n');
      context += `\nHai accesso a queste note:\n${notes}`;
    }

    if (userContext.media && userContext.media.length > 0) {
      context += `\nL'utente ha ${userContext.media.length} file multimediali.`;
    }

    context += `\n\nMessaggio utente: "${message}"\nRispondi nel modo più utile e contestuale possibile.`;

    return context;
  }

  async getMemoryStats(userId: number): Promise<null> {
    // Placeholder: non c’è memoria interna in Ollama
    return null;
  }

  get serviceAvailable(): boolean {
    return true; // sempre true se Ollama è attivo
  }

  async reconnect(): Promise<void> {
    // no-op per Ollama standalone
  }
}

export const langchainOrchestrator = new LangChainOrchestrator();