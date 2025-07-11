import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { aiService } from "./aiService";
import { storage } from "./storage";
import { insertNoteSchema, insertEventSchema, insertSearchSchema, insertEmailSchema, insertMessageSchema, insertMediaSchema, insertAILearningSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { performWebSearch } from "./searchService";
import type { Request, Response, NextFunction } from "express";

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Auth schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Auth middleware
function authenticateToken(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    (req as any).user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username: email.split('@')[0],
        email,
        password: hashedPassword,
      });
      
      // Generate token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { id: user.id, email: user.email, username: user.username }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid signup data" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Generate token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { id: user.id, email: user.email, username: user.username }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid login data" });
    }
  });
  
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser((req as any).user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ id: user.id, email: user.email, username: user.username });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Helper function to generate AI insights
  async function generateAIInsights(data: any, appType: string): Promise<string> {
    try {
      return await aiService.generateInsights(data, appType);
    } catch (error) {
      console.error("AI insights error:", error);
      return "AI insights temporarily unavailable";
    }
  }

  // Notes API
  app.get("/api/notes", authenticateToken, async (req, res) => {
    try {
      const notes = await storage.getNotesByUserId((req as any).user.userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse({
        ...req.body,
        userId: (req as any).user.userId
      });
      
      const note = await storage.createNote(validatedData);
      
      // Store AI learning data
      await storage.createAILearning({
        userId: (req as any).user.userId,
        appType: "notes",
        dataType: "note_created",
        data: { title: note.title, content: note.content, tags: note.tags }
      });
      
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.put("/api/notes/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const note = await storage.updateNote(id, updates);
      
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      await storage.createAILearning({
        userId: (req as any).user.userId,
        appType: "notes",
        dataType: "note_updated",
        data: { id, updates }
      });
      
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", authenticateToken, async (req, res) => {
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
  app.get("/api/events", authenticateToken, async (req, res) => {
    try {
      const events = await storage.getEventsByUserId((req as any).user.userId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse({
        ...req.body,
        userId: (req as any).user.userId
      });
      
      const event = await storage.createEvent(validatedData);
      
      await storage.createAILearning({
        userId: ((req as any).user.userId,
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
  app.get("/api/searches", authenticateToken, async (req, res) => {
    try {
      const searches = await storage.getSearchesByUserId(((req as any).user.userId);
      res.json(searches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch searches" });
    }
  });

  app.post("/api/search", authenticateToken, async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      
      // Perform real web search
      const searchResults = await performWebSearch(query);
      
      const search = await storage.createSearch({
        userId: ((req as any).user.userId,
        query,
        results: searchResults
      });
      
      await storage.createAILearning({
        userId: ((req as any).user.userId,
        appType: "search",
        dataType: "search_performed",
        data: { query, results: searchResults }
      });
      
      res.json(searchResults);
    } catch (error) {
      res.status(400).json({ error: "Search failed" });
    }
  });

  // Emails API
  app.get("/api/emails", authenticateToken, async (req, res) => {
    try {
      const emails = await storage.getEmailsByUserId(((req as any).user.userId);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  });

  app.post("/api/emails", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertEmailSchema.parse({
        ...req.body,
        userId: ((req as any).user.userId
      });
      
      const email = await storage.createEmail(validatedData);
      
      await storage.createAILearning({
        userId: ((req as any).user.userId,
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
  app.get("/api/messages/:roomId", authenticateToken, async (req, res) => {
    try {
      const { roomId } = req.params;
      const messages = await storage.getMessagesByRoomId(roomId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Media API
  app.get("/api/media", authenticateToken, async (req, res) => {
    try {
      const media = await storage.getMediaByUserId(((req as any).user.userId);
      res.json(media);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  app.post("/api/media", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertMediaSchema.parse({
        ...req.body,
        userId: ((req as any).user.userId
      });
      
      const media = await storage.createMedia(validatedData);
      
      await storage.createAILearning({
        userId: ((req as any).user.userId,
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
  app.get("/api/ai/insights", authenticateToken, async (req, res) => {
    try {
      const learningData = await storage.getAILearningByUserId(((req as any).user.userId);
      const insights = await generateAIInsights(learningData, "platform");
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.post("/api/ai/chat", authenticateToken, async (req, res) => {
    try {
      const { message } = req.body;
      const learningData = await storage.getAILearningByUserId(((req as any).user.userId);
      
      const systemPrompt = `You are a personal AI assistant for the LOOM platform. You have access to the user's data across all applications (Notes, Calendar, Search, Mail, Chat, Gallery). Use this context to provide helpful responses. Here's what you know about the user: ${JSON.stringify(learningData.slice(-10))}`;
      
      const response = await aiService.generateResponse(message, systemPrompt);
      
      res.json({ response });
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
          // Note: WebSocket doesn't have built-in authentication, so we'd need to implement token-based auth
          // For now, we'll use a default user ID, but in production this should be properly authenticated
          const message = await storage.createMessage({
            userId: 1, // This should be extracted from the authenticated user
            content,
            roomId
          });
          
          await storage.createAILearning({
            userId: 1, // This should be extracted from the authenticated user
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
