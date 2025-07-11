import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { aiService } from "./aiService";
import { gpt4allService } from "./gpt4allService";
import { mistralService } from "./mistralService";
import { storage } from "./storage";
import { performWebSearch } from "./searchService";
import { insertNoteSchema, insertEventSchema, insertSearchSchema, insertEmailSchema, insertMessageSchema, insertMediaSchema, insertAILearningSchema, insertUserPreferencesSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
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
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, username } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        username: username || email.split('@')[0]
      });
      
      // Generate token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { id: user.id, email: user.email, username: user.username }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid registration data" });
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
      res.json({ 
        id: user.id, 
        email: user.email, 
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.put("/api/auth/profile", authenticateToken, async (req, res) => {
    try {
      const { username, firstName, lastName } = req.body;
      const userId = (req as any).user.userId;
      
      // Update user profile
      const updatedUser = await storage.updateUser(userId, {
        username,
        firstName,
        lastName
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ 
        id: updatedUser.id, 
        email: updatedUser.email, 
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Helper function to generate AI insights
  async function generateAIInsights(data: any, appType: string): Promise<string> {
    try {
      return await mistralService.generateInsights(data, appType);
    } catch (error) {
      console.error("AI insights error:", error);
      return "AI insights temporarily unavailable";
    }
  }

  // Helper function to generate recurring events
  function generateRecurringEvents(baseEvent: any): any[] {
    const events: any[] = [];
    const startDate = new Date(baseEvent.startTime);
    const endDate = new Date(baseEvent.endTime);
    const recurringEndDate = baseEvent.recurringEndDate ? new Date(baseEvent.recurringEndDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days default
    
    let currentDate = new Date(startDate);
    let iteration = 0;
    const maxIterations = 50; // Prevent infinite loops
    
    while (currentDate <= recurringEndDate && iteration < maxIterations) {
      if (baseEvent.recurringType === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (baseEvent.recurringType === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (baseEvent.recurringType === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      if (currentDate <= recurringEndDate) {
        const eventDuration = endDate.getTime() - startDate.getTime();
        const newEndTime = new Date(currentDate.getTime() + eventDuration);
        
        events.push({
          title: baseEvent.title,
          description: baseEvent.description,
          startTime: currentDate.toISOString(),
          endTime: newEndTime.toISOString(),
          location: baseEvent.location,
          category: baseEvent.category,
          isRecurring: false, // Don't make the generated events recurring
          reminder: baseEvent.reminder,
        });
      }
      
      iteration++;
    }
    
    return events;
  }

  // Helper function to generate reminder text
  function generateReminderText(event: any): string {
    const now = new Date();
    const eventStart = new Date(event.startTime);
    const timeDiff = eventStart.getTime() - now.getTime();
    const hoursUntil = Math.round(timeDiff / (1000 * 60 * 60));
    const minutesUntil = Math.round(timeDiff / (1000 * 60));
    
    if (timeDiff < 0) {
      return "Event has passed";
    } else if (minutesUntil <= 60) {
      return `Reminder: ${event.title} in ${minutesUntil} minutes`;
    } else if (hoursUntil <= 24) {
      return `Reminder: ${event.title} in ${hoursUntil} hours`;
    } else {
      const daysUntil = Math.round(hoursUntil / 24);
      return `Reminder: ${event.title} in ${daysUntil} days`;
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
      
      // Add reminder information to events
      const eventsWithReminders = events.map(event => ({
        ...event,
        reminderText: generateReminderText(event)
      }));
      
      res.json(eventsWithReminders);
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
      
      // Generate recurring events if specified
      if (validatedData.isRecurring && validatedData.recurringType) {
        const recurringEvents = generateRecurringEvents(validatedData);
        for (const recurringEvent of recurringEvents) {
          await storage.createEvent({
            ...recurringEvent,
            userId: (req as any).user.userId
          });
        }
      }
      
      await storage.createAILearning({
        userId: (req as any).user.userId,
        appType: "calendar",
        dataType: "event_created",
        data: { 
          title: event.title, 
          startTime: event.startTime, 
          endTime: event.endTime,
          category: event.category,
          isRecurring: event.isRecurring 
        }
      });
      
      res.json(event);
    } catch (error) {
      console.error("Event creation error:", error);
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  app.put("/api/events/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const event = await storage.updateEvent(id, updates);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      await storage.createAILearning({
        userId: (req as any).user.userId,
        appType: "calendar",
        dataType: "event_updated",
        data: { id, updates }
      });
      
      res.json(event);
    } catch (error) {
      console.error("Event update error:", error);
      res.status(400).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      
      if (!success) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Event deletion error:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Search API
  app.get("/api/searches", authenticateToken, async (req, res) => {
    try {
      const searches = await storage.getSearchesByUserId((req as any).user.userId);
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
        userId: (req as any).user.userId,
        query,
        results: searchResults
      });
      
      await storage.createAILearning({
        userId: (req as any).user.userId,
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
      const emails = await storage.getEmailsByUserId((req as any).user.userId);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  });

  app.post("/api/emails", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertEmailSchema.parse({
        ...req.body,
        userId: (req as any).user.userId
      });
      
      const email = await storage.createEmail(validatedData);
      
      // Try to send actual email if SendGrid is configured
      if (process.env.SENDGRID_API_KEY && validatedData.recipient.includes('@')) {
        try {
          const sgMail = require('@sendgrid/mail');
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          
          const msg = {
            to: validatedData.recipient,
            from: 'noreply@loom.com', // Use your verified sender
            subject: validatedData.subject,
            text: validatedData.content,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff6b35;">Message from LOOM</h2>
              <p>${validatedData.content.replace(/\n/g, '<br>')}</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">Sent via LOOM Consciousness Upload Platform</p>
            </div>`,
          };
          
          await sgMail.send(msg);
          console.log('Email sent successfully via SendGrid');
        } catch (sendError) {
          console.log('Email stored but not sent (SendGrid not configured):', sendError.message);
        }
      }
      
      await storage.createAILearning({
        userId: (req as any).user.userId,
        appType: "mail",
        dataType: "email_created",
        data: { subject: email.subject, recipient: email.recipient }
      });
      
      res.json(email);
    } catch (error) {
      res.status(400).json({ error: "Invalid email data" });
    }
  });

  app.delete("/api/emails/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmail(id);
      
      if (!success) {
        return res.status(404).json({ error: "Email not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Email deletion error:", error);
      res.status(500).json({ error: "Failed to delete email" });
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
      const media = await storage.getMediaByUserId((req as any).user.userId);
      res.json(media);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  app.post("/api/media", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertMediaSchema.parse({
        ...req.body,
        userId: (req as any).user.userId
      });
      
      const media = await storage.createMedia(validatedData);
      
      await storage.createAILearning({
        userId: (req as any).user.userId,
        appType: "gallery",
        dataType: "media_uploaded",
        data: { filename: media.filename, mimeType: media.mimeType }
      });
      
      res.json(media);
    } catch (error) {
      console.error("Media creation error:", error);
      res.status(400).json({ error: "Invalid media data" });
    }
  });

  app.put("/api/media/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const media = await storage.updateMedia(id, updates);
      
      if (!media) {
        return res.status(404).json({ error: "Media not found" });
      }
      
      await storage.createAILearning({
        userId: (req as any).user.userId,
        appType: "gallery",
        dataType: "media_updated",
        data: { id, updates }
      });
      
      res.json(media);
    } catch (error) {
      console.error("Media update error:", error);
      res.status(400).json({ error: "Failed to update media" });
    }
  });

  app.delete("/api/media/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMedia(id);
      
      if (!success) {
        return res.status(404).json({ error: "Media not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Media deletion error:", error);
      res.status(500).json({ error: "Failed to delete media" });
    }
  });

  // AI Insights API
  app.get("/api/ai/insights", authenticateToken, async (req, res) => {
    try {
      const learningData = await storage.getAILearningByUserId((req as any).user.userId);
      const insights = await generateAIInsights(learningData, "platform");
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.post("/api/ai/chat", authenticateToken, async (req, res) => {
    try {
      const { message } = req.body;
      const userId = (req as any).user.userId;
      
      // Get user's actual data for context
      const [notes, events, searches, emails, media, learningData, userPreferences] = await Promise.all([
        storage.getNotesByUserId(userId),
        storage.getEventsByUserId(userId),
        storage.getSearchesByUserId(userId),
        storage.getEmailsByUserId(userId),
        storage.getMediaByUserId(userId),
        storage.getAILearningByUserId(userId),
        storage.getUserPreferencesByUserId(userId)
      ]);

      // Create rich context about user
      const userContext = {
        notes: notes.map(n => ({ title: n.title, content: n.content.slice(0, 200) })),
        events: events.map(e => ({ title: e.title, description: e.description })),
        searches: searches.slice(-5).map(s => ({ query: s.query })),
        emails: emails.slice(-5).map(e => ({ subject: e.subject })),
        media: media.slice(-5).map(m => ({ filename: m.filename, description: m.description })),
        allMedia: media.map(m => ({ filename: m.filename, fileType: m.fileType })),
        activities: learningData.slice(-10).map(l => ({ type: l.dataType, app: l.appType })),
        preferences: userPreferences.map(p => ({ category: p.category, key: p.key, value: p.value }))
      };

      // Extract user preferences from the message
      await extractUserPreferences(message, userId);
      
      // Check if user is asking about gallery/media content
      const isAskingAboutGallery = message.toLowerCase().includes('gallery') || 
                                  message.toLowerCase().includes('image') || 
                                  message.toLowerCase().includes('photo') ||
                                  message.toLowerCase().includes('media') ||
                                  message.toLowerCase().includes('logo') ||
                                  message.toLowerCase().includes('loom') ||
                                  message.toLowerCase().includes('see') ||
                                  message.toLowerCase().includes('do you see');

      let galleryContext = '';
      if (isAskingAboutGallery) {
        const loomLogos = media.filter(m => 
          m.filename.toLowerCase().includes('loom') || 
          m.filename.toLowerCase().includes('logo')
        );
        
        galleryContext = `

GALLERY CONTEXT:
- Total media files: ${media.length}
- All media files: ${media.map(m => m.filename).join(', ')}
- LOOM logos found: ${loomLogos.length > 0 ? loomLogos.map(l => l.filename).join(', ') : 'None'}

IMPORTANT: If the user asks about their gallery, images, or specifically about "loom logo" or "logo":
- Answer directly about what files they have
- If they have LOOM logo files, say "Yes, I can see your LOOM logo files in your gallery"
- Be specific about filenames
- Reference their actual media files`;
      }

      const systemPrompt = `You are a personal AI assistant for the LOOM platform. You analyze the user's actual data to provide personalized responses. 

User's Data Context:
- Notes: ${JSON.stringify(userContext.notes)}
- Events: ${JSON.stringify(userContext.events)}  
- Recent Searches: ${JSON.stringify(userContext.searches)}
- Recent Emails: ${JSON.stringify(userContext.emails)}
- Media: ${JSON.stringify(userContext.media)}
- Activities: ${JSON.stringify(userContext.activities)}
- Preferences: ${JSON.stringify(userContext.preferences)}
${galleryContext}

Based on this real data, answer questions about the user's interests, habits, and preferences. Be specific and reference their actual content when relevant.

Focus on providing detailed, personalized responses using the user's actual data. Don't mention web search unless specifically requested. Use the user's real information to give helpful, accurate answers.`;
      
      // Check if the user is asking for web search (more selective)
      const needsWebSearch = message.toLowerCase().includes('search the web') || 
                           message.toLowerCase().includes('latest news') ||
                           message.toLowerCase().includes('current events') ||
                           message.toLowerCase().includes('what happened today') ||
                           message.toLowerCase().includes('recent information') ||
                           message.toLowerCase().includes('look up online');
      
      let response = await mistralService.generateResponse(message, systemPrompt);
      
      // Only add web search for specific requests that need current information
      if (needsWebSearch) {
        try {
          const searchResults = await performWebSearch(message);
          if (searchResults.results.length > 0) {
            const webInfo = searchResults.results.slice(0, 3).map(r => 
              `${r.title}: ${r.snippet}`
            ).join('\n');
            response += `\n\nHere's some additional information from the web:\n${webInfo}`;
          }
        } catch (error) {
          console.log('Web search failed, using local data only');
        }
      }
      
      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "AI chat failed" });
    }
  });

  app.post("/api/ai/interrupt", authenticateToken, async (req, res) => {
    try {
      mistralService.interrupt();
      res.json({ success: true, message: "Mistral AI processing interrupted" });
    } catch (error) {
      console.error("AI interrupt error:", error);
      res.status(500).json({ error: "Failed to interrupt AI" });
    }
  });

  // User Preferences routes
  app.get("/api/user-preferences", authenticateToken, async (req: any, res) => {
    try {
      const preferences = await storage.getUserPreferencesByUserId(req.user.userId);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user preferences" });
    }
  });

  app.post("/api/user-preferences", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertUserPreferencesSchema.parse(req.body);
      const preference = await storage.createUserPreference({
        ...validatedData,
        userId: req.user.userId
      });
      res.json(preference);
    } catch (error) {
      res.status(400).json({ error: "Invalid preference data" });
    }
  });

  app.put("/api/user-preferences/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUserPreferencesSchema.partial().parse(req.body);
      const preference = await storage.updateUserPreference(id, validatedData);
      if (!preference) {
        return res.status(404).json({ error: "Preference not found" });
      }
      res.json(preference);
    } catch (error) {
      res.status(400).json({ error: "Invalid preference data" });
    }
  });

  app.delete("/api/user-preferences/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUserPreference(id);
      if (!deleted) {
        return res.status(404).json({ error: "Preference not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete preference" });
    }
  });

  // Stats endpoint for dashboard widgets
  app.get("/api/stats", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const [notes, events, searches, emails, media] = await Promise.all([
        storage.getNotesByUserId(userId),
        storage.getEventsByUserId(userId),
        storage.getSearchesByUserId(userId),
        storage.getEmailsByUserId(userId),
        storage.getMediaByUserId(userId)
      ]);

      res.json({
        notes: notes.length,
        events: events.length,
        searches: searches.length,
        emails: emails.length,
        media: media.length,
        total: notes.length + events.length + searches.length + emails.length + media.length
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Mood tracking endpoints
  app.get("/api/mood", authenticateToken, async (req: any, res) => {
    try {
      // For now, return mock data since we don't have mood schema
      // In a real implementation, you'd add mood tracking to the database
      res.json([]);
    } catch (error) {
      console.error("Mood fetch error:", error);
      res.status(500).json({ error: "Failed to fetch mood data" });
    }
  });

  app.post("/api/mood", authenticateToken, async (req: any, res) => {
    try {
      const { mood, emoji } = req.body;
      // For now, return success since we don't have mood schema
      // In a real implementation, you'd save to database
      res.json({ success: true, mood, emoji });
    } catch (error) {
      console.error("Mood save error:", error);
      res.status(500).json({ error: "Failed to save mood" });
    }
  });

  app.get("/api/mood/stats", authenticateToken, async (req: any, res) => {
    try {
      // For now, return mock data
      res.json({ totalEntries: 0, averageMood: "neutral" });
    } catch (error) {
      console.error("Mood stats error:", error);
      res.status(500).json({ error: "Failed to fetch mood stats" });
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
                message: message,
                timestamp: new Date().toISOString()
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

  // Helper function to extract user preferences from chat messages
  async function extractUserPreferences(message: string, userId: number): Promise<void> {
    const lowerMessage = message.toLowerCase();
    
    // Define preference patterns
    const patterns = [
      { pattern: /i like (.*?)(?:\.|$|,)/, category: "interests", extract: (match: string) => match.replace(/i like /, '') },
      { pattern: /i love (.*?)(?:\.|$|,)/, category: "interests", extract: (match: string) => match.replace(/i love /, '') },
      { pattern: /i want to (.*?)(?:\.|$|,)/, category: "goals", extract: (match: string) => match.replace(/i want to /, '') },
      { pattern: /i need to (.*?)(?:\.|$|,)/, category: "goals", extract: (match: string) => match.replace(/i need to /, '') },
      { pattern: /i enjoy (.*?)(?:\.|$|,)/, category: "interests", extract: (match: string) => match.replace(/i enjoy /, '') },
      { pattern: /i prefer (.*?)(?:\.|$|,)/, category: "preferences", extract: (match: string) => match.replace(/i prefer /, '') },
      { pattern: /i hate (.*?)(?:\.|$|,)/, category: "dislikes", extract: (match: string) => match.replace(/i hate /, '') },
      { pattern: /i don't like (.*?)(?:\.|$|,)/, category: "dislikes", extract: (match: string) => match.replace(/i don't like /, '') }
    ];

    for (const { pattern, category, extract } of patterns) {
      const matches = lowerMessage.match(pattern);
      if (matches) {
        const value = extract(matches[0]).trim();
        if (value && value.length > 2) {
          try {
            // Check if preference already exists
            const existingPrefs = await storage.getUserPreferencesByUserId(userId);
            const exists = existingPrefs.some(p => p.category === category && p.value.toLowerCase() === value.toLowerCase());
            
            if (!exists) {
              await storage.createUserPreference({
                userId,
                category,
                key: value.replace(/\s+/g, '_').toLowerCase(),
                value,
                source: "chat",
                confidence: 8
              });
            }
          } catch (error) {
            console.error("Error saving user preference:", error);
          }
        }
      }
    }
  }

  return httpServer;
}