import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import OpenAI from "openai";
import { storage } from "./storage";
import { insertNoteSchema, insertEventSchema, insertSearchSchema, insertEmailSchema, insertMessageSchema, insertMediaSchema, insertAILearningSchema } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "sk-test-key"
});

// Default user ID for demo
const DEFAULT_USER_ID = 1;

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to generate AI insights
  async function generateAIInsights(data: any, appType: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a personal AI assistant for the LOOM platform. Analyze the ${appType} data and provide helpful insights, suggestions, or connections. Be concise and actionable.`
          },
          {
            role: "user",
            content: `Analyze this ${appType} data: ${JSON.stringify(data)}`
          }
        ],
        max_tokens: 200
      });
      
      return response.choices[0].message.content || "No insights available";
    } catch (error) {
      console.error("AI insights error:", error);
      return "AI insights temporarily unavailable";
    }
  }

  // Notes API
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotesByUserId(DEFAULT_USER_ID);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      
      const note = await storage.createNote(validatedData);
      
      // Store AI learning data
      await storage.createAILearning({
        userId: DEFAULT_USER_ID,
        appType: "notes",
        dataType: "note_created",
        data: { title: note.title, content: note.content, tags: note.tags }
      });
      
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const note = await storage.updateNote(id, updates);
      
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      await storage.createAILearning({
        userId: DEFAULT_USER_ID,
        appType: "notes",
        dataType: "note_updated",
        data: { id, updates }
      });
      
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNote(id);
      
      if (!success) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Events API
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEventsByUserId(DEFAULT_USER_ID);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      
      const event = await storage.createEvent(validatedData);
      
      await storage.createAILearning({
        userId: DEFAULT_USER_ID,
        appType: "calendar",
        dataType: "event_created",
        data: { title: event.title, startTime: event.startTime, endTime: event.endTime }
      });
      
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  // Search API
  app.get("/api/searches", async (req, res) => {
    try {
      const searches = await storage.getSearchesByUserId(DEFAULT_USER_ID);
      res.json(searches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch searches" });
    }
  });

  app.post("/api/search", async (req, res) => {
    try {
      const { query } = req.body;
      
      // Simulate search results (in real app, this would query external APIs)
      const mockResults = [
        { title: `Result for "${query}"`, url: `https://example.com/search?q=${encodeURIComponent(query)}`, snippet: `Information about ${query}` },
        { title: `Advanced ${query} guide`, url: `https://example.com/guide/${query}`, snippet: `Learn more about ${query}` }
      ];
      
      const search = await storage.createSearch({
        userId: DEFAULT_USER_ID,
        query,
        results: mockResults
      });
      
      await storage.createAILearning({
        userId: DEFAULT_USER_ID,
        appType: "search",
        dataType: "search_performed",
        data: { query, resultsCount: mockResults.length }
      });
      
      res.json(search);
    } catch (error) {
      res.status(400).json({ error: "Search failed" });
    }
  });

  // Emails API
  app.get("/api/emails", async (req, res) => {
    try {
      const emails = await storage.getEmailsByUserId(DEFAULT_USER_ID);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  });

  app.post("/api/emails", async (req, res) => {
    try {
      const validatedData = insertEmailSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      
      const email = await storage.createEmail(validatedData);
      
      await storage.createAILearning({
        userId: DEFAULT_USER_ID,
        appType: "mail",
        dataType: "email_created",
        data: { subject: email.subject, recipient: email.recipient }
      });
      
      res.json(email);
    } catch (error) {
      res.status(400).json({ error: "Invalid email data" });
    }
  });

  // Messages API
  app.get("/api/messages/:roomId", async (req, res) => {
    try {
      const { roomId } = req.params;
      const messages = await storage.getMessagesByRoomId(roomId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Media API
  app.get("/api/media", async (req, res) => {
    try {
      const media = await storage.getMediaByUserId(DEFAULT_USER_ID);
      res.json(media);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  app.post("/api/media", async (req, res) => {
    try {
      const validatedData = insertMediaSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      
      const media = await storage.createMedia(validatedData);
      
      await storage.createAILearning({
        userId: DEFAULT_USER_ID,
        appType: "gallery",
        dataType: "media_uploaded",
        data: { filename: media.filename, mimeType: media.mimeType }
      });
      
      res.json(media);
    } catch (error) {
      res.status(400).json({ error: "Invalid media data" });
    }
  });

  // AI Insights API
  app.get("/api/ai/insights", async (req, res) => {
    try {
      const learningData = await storage.getAILearningByUserId(DEFAULT_USER_ID);
      const insights = await generateAIInsights(learningData, "platform");
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const learningData = await storage.getAILearningByUserId(DEFAULT_USER_ID);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a personal AI assistant for the LOOM platform. You have access to the user's data across all applications (Notes, Calendar, Search, Mail, Chat, Gallery). Use this context to provide helpful responses. Here's what you know about the user: ${JSON.stringify(learningData.slice(-10))}`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500
      });
      
      res.json({ response: response.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: "AI chat failed" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('message', async (data) => {
      try {
        const { type, content, roomId } = JSON.parse(data.toString());
        
        if (type === 'chat_message') {
          const message = await storage.createMessage({
            userId: DEFAULT_USER_ID,
            content,
            roomId
          });
          
          await storage.createAILearning({
            userId: DEFAULT_USER_ID,
            appType: "chat",
            dataType: "message_sent",
            data: { content, roomId }
          });
          
          // Broadcast to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                message
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
