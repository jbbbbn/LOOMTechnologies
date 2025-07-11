import { 
  users, notes, events, searches, emails, messages, media, aiLearning,
  type User, type InsertUser, type Note, type InsertNote, type Event, type InsertEvent,
  type Search, type InsertSearch, type Email, type InsertEmail, type Message, type InsertMessage,
  type Media, type InsertMedia, type AILearning, type InsertAILearning
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Notes
  getNotesByUserId(userId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Events
  getEventsByUserId(userId: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Searches
  getSearchesByUserId(userId: number): Promise<Search[]>;
  createSearch(search: InsertSearch): Promise<Search>;
  
  // Emails
  getEmailsByUserId(userId: number): Promise<Email[]>;
  getEmail(id: number): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: number, email: Partial<InsertEmail>): Promise<Email | undefined>;
  deleteEmail(id: number): Promise<boolean>;
  
  // Messages
  getMessagesByRoomId(roomId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Media
  getMediaByUserId(userId: number): Promise<Media[]>;
  getMedia(id: number): Promise<Media | undefined>;
  createMedia(media: InsertMedia): Promise<Media>;
  updateMedia(id: number, media: Partial<InsertMedia>): Promise<Media | undefined>;
  deleteMedia(id: number): Promise<boolean>;
  
  // AI Learning
  getAILearningByUserId(userId: number): Promise<AILearning[]>;
  createAILearning(learning: InsertAILearning): Promise<AILearning>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private notes: Map<number, Note> = new Map();
  private events: Map<number, Event> = new Map();
  private searches: Map<number, Search> = new Map();
  private emails: Map<number, Email> = new Map();
  private messages: Map<number, Message> = new Map();
  private media: Map<number, Media> = new Map();
  private aiLearning: Map<number, AILearning> = new Map();
  
  private currentUserId = 1;
  private currentNoteId = 1;
  private currentEventId = 1;
  private currentSearchId = 1;
  private currentEmailId = 1;
  private currentMessageId = 1;
  private currentMediaId = 1;
  private currentAILearningId = 1;

  constructor() {
    // Create a default user
    this.createUser({
      username: "demo",
      email: "demo@loom.com",
      password: "password"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Notes
  async getNotesByUserId(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.userId === userId);
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const note: Note = { 
      ...insertNote, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      tags: insertNote.tags || null
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, updates: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote: Note = { 
      ...note, 
      ...updates, 
      updatedAt: new Date()
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Events
  async getEventsByUserId(userId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.userId === userId);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { 
      ...insertEvent, 
      id, 
      createdAt: new Date(),
      description: insertEvent.description || null,
      location: insertEvent.location || null
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent: Event = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Searches
  async getSearchesByUserId(userId: number): Promise<Search[]> {
    return Array.from(this.searches.values()).filter(search => search.userId === userId);
  }

  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = this.currentSearchId++;
    const search: Search = { 
      ...insertSearch, 
      id, 
      timestamp: new Date(),
      results: insertSearch.results || null
    };
    this.searches.set(id, search);
    return search;
  }

  // Emails
  async getEmailsByUserId(userId: number): Promise<Email[]> {
    return Array.from(this.emails.values()).filter(email => email.userId === userId);
  }

  async getEmail(id: number): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const id = this.currentEmailId++;
    const email: Email = { 
      ...insertEmail, 
      id, 
      createdAt: new Date(),
      sender: insertEmail.sender || null,
      recipient: insertEmail.recipient || null,
      isRead: insertEmail.isRead || null
    };
    this.emails.set(id, email);
    return email;
  }

  async updateEmail(id: number, updates: Partial<InsertEmail>): Promise<Email | undefined> {
    const email = this.emails.get(id);
    if (!email) return undefined;
    
    const updatedEmail: Email = { ...email, ...updates };
    this.emails.set(id, updatedEmail);
    return updatedEmail;
  }

  async deleteEmail(id: number): Promise<boolean> {
    return this.emails.delete(id);
  }

  // Messages
  async getMessagesByRoomId(roomId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => message.roomId === roomId);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  // Media
  async getMediaByUserId(userId: number): Promise<Media[]> {
    return Array.from(this.media.values()).filter(media => media.userId === userId);
  }

  async getMedia(id: number): Promise<Media | undefined> {
    return this.media.get(id);
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = this.currentMediaId++;
    const media: Media = { 
      ...insertMedia, 
      id, 
      createdAt: new Date(),
      description: insertMedia.description || null,
      tags: insertMedia.tags || null
    };
    this.media.set(id, media);
    return media;
  }

  async updateMedia(id: number, updates: Partial<InsertMedia>): Promise<Media | undefined> {
    const media = this.media.get(id);
    if (!media) return undefined;
    
    const updatedMedia: Media = { ...media, ...updates };
    this.media.set(id, updatedMedia);
    return updatedMedia;
  }

  async deleteMedia(id: number): Promise<boolean> {
    return this.media.delete(id);
  }

  // AI Learning
  async getAILearningByUserId(userId: number): Promise<AILearning[]> {
    return Array.from(this.aiLearning.values()).filter(learning => learning.userId === userId);
  }

  async createAILearning(insertAILearning: InsertAILearning): Promise<AILearning> {
    const id = this.currentAILearningId++;
    const learning: AILearning = { 
      ...insertAILearning, 
      id, 
      timestamp: new Date()
    };
    this.aiLearning.set(id, learning);
    return learning;
  }
}

export const storage = new MemStorage();
