import { 
  users, notes, events, searches, emails, messages, media, aiLearning, userPreferences, moods, timeTracking,
  type User, type InsertUser, type Note, type InsertNote, type Event, type InsertEvent,
  type Search, type InsertSearch, type Email, type InsertEmail, type Message, type InsertMessage,
  type Media, type InsertMedia, type AILearning, type InsertAILearning, type UserPreferences, type InsertUserPreferences,
  type Mood, type InsertMood, type TimeTracking, type InsertTimeTracking
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
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
  
  // User Preferences
  getUserPreferencesByUserId(userId: number): Promise<UserPreferences[]>;
  createUserPreference(preference: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreference(id: number, preference: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
  deleteUserPreference(id: number): Promise<boolean>;
  
  // Moods
  getMoodsByUserId(userId: number): Promise<Mood[]>;
  createMood(mood: InsertMood): Promise<Mood>;
  
  // Time Tracking
  getTimeTrackingByUserId(userId: number): Promise<TimeTracking[]>;
  createTimeTracking(timeTracking: InsertTimeTracking): Promise<TimeTracking>;
  updateTimeTracking(id: number, timeTracking: Partial<InsertTimeTracking>): Promise<TimeTracking | undefined>;
  deleteTimeTracking(id: number): Promise<boolean>;
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
  private userPreferences: Map<number, UserPreferences> = new Map();
  private moods: Map<number, Mood> = new Map();
  private timeTracking: Map<number, TimeTracking> = new Map();
  
  private currentUserId = 1;
  private currentNoteId = 1;
  private currentEventId = 1;
  private currentSearchId = 1;
  private currentEmailId = 1;
  private currentMessageId = 1;
  private currentMediaId = 1;
  private currentAILearningId = 1;
  private currentUserPreferencesId = 1;
  private currentMoodId = 1;
  private currentTimeTrackingId = 1;

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
      createdAt: new Date(),
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
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
      location: insertEvent.location || null,
      isRecurring: insertEvent.isRecurring || null,
      recurringType: insertEvent.recurringType || null,
      recurringEndDate: insertEvent.recurringEndDate || null,
      recurringDays: insertEvent.recurringDays || null,
      status: insertEvent.status || null,
      reminder: insertEvent.reminder || null,
      category: insertEvent.category || null
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
      isRead: insertEmail.isRead || null,
      isDraft: insertEmail.isDraft || null,
      isStarred: insertEmail.isStarred || null,
      folder: insertEmail.folder || null,
      attachments: insertEmail.attachments || null
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

  // User Preferences
  async getUserPreferencesByUserId(userId: number): Promise<UserPreferences[]> {
    return Array.from(this.userPreferences.values()).filter(pref => pref.userId === userId);
  }

  async createUserPreference(insertPreference: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.currentUserPreferencesId++;
    const preference: UserPreferences = { 
      ...insertPreference, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date(),
      confidence: insertPreference.confidence || null
    };
    this.userPreferences.set(id, preference);
    return preference;
  }

  async updateUserPreference(id: number, updates: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const preference = this.userPreferences.get(id);
    if (!preference) return undefined;
    
    const updatedPreference: UserPreferences = { 
      ...preference, 
      ...updates, 
      updatedAt: new Date()
    };
    this.userPreferences.set(id, updatedPreference);
    return updatedPreference;
  }

  async deleteUserPreference(id: number): Promise<boolean> {
    return this.userPreferences.delete(id);
  }

  async getMoodsByUserId(userId: number): Promise<Mood[]> {
    return Array.from(this.moods.values()).filter(mood => mood.userId === userId);
  }

  async createMood(insertMood: InsertMood): Promise<Mood> {
    const id = this.currentMoodId++;
    const mood: Mood = { 
      id, 
      ...insertMood,
      note: insertMood.note || null,
      createdAt: new Date()
    };
    this.moods.set(id, mood);
    return mood;
  }

  async getTimeTrackingByUserId(userId: number): Promise<TimeTracking[]> {
    return Array.from(this.timeTracking.values()).filter(t => t.userId === userId);
  }

  async createTimeTracking(insertTimeTracking: InsertTimeTracking): Promise<TimeTracking> {
    const id = this.currentTimeTrackingId++;
    const timeTracking: TimeTracking = { 
      id, 
      ...insertTimeTracking,
      startTime: insertTimeTracking.startTime || null,
      endTime: insertTimeTracking.endTime || null,
      icon: insertTimeTracking.icon || null,
      notes: insertTimeTracking.notes || null,
      createdAt: new Date()
    };
    this.timeTracking.set(id, timeTracking);
    return timeTracking;
  }

  async updateTimeTracking(id: number, updates: Partial<InsertTimeTracking>): Promise<TimeTracking | undefined> {
    const timeTracking = this.timeTracking.get(id);
    if (!timeTracking) return undefined;
    
    const updatedTimeTracking: TimeTracking = { ...timeTracking, ...updates };
    this.timeTracking.set(id, updatedTimeTracking);
    return updatedTimeTracking;
  }

  async deleteTimeTracking(id: number): Promise<boolean> {
    return this.timeTracking.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getNotesByUserId(userId: number): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.userId, userId));
  }

  async getNote(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note || undefined;
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db
      .insert(notes)
      .values(insertNote)
      .returning();
    return note;
  }

  async updateNote(id: number, updates: Partial<InsertNote>): Promise<Note | undefined> {
    const [note] = await db
      .update(notes)
      .set(updates)
      .where(eq(notes.id, id))
      .returning();
    return note || undefined;
  }

  async deleteNote(id: number): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getEventsByUserId(userId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.userId, userId));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getSearchesByUserId(userId: number): Promise<Search[]> {
    return await db.select().from(searches).where(eq(searches.userId, userId));
  }

  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const [search] = await db
      .insert(searches)
      .values(insertSearch)
      .returning();
    return search;
  }

  async getEmailsByUserId(userId: number): Promise<Email[]> {
    return await db.select().from(emails).where(eq(emails.userId, userId));
  }

  async getEmail(id: number): Promise<Email | undefined> {
    const [email] = await db.select().from(emails).where(eq(emails.id, id));
    return email || undefined;
  }

  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const [email] = await db
      .insert(emails)
      .values(insertEmail)
      .returning();
    return email;
  }

  async updateEmail(id: number, updates: Partial<InsertEmail>): Promise<Email | undefined> {
    const [email] = await db
      .update(emails)
      .set(updates)
      .where(eq(emails.id, id))
      .returning();
    return email || undefined;
  }

  async deleteEmail(id: number): Promise<boolean> {
    const result = await db.delete(emails).where(eq(emails.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMessagesByRoomId(roomId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.roomId, roomId));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMediaByUserId(userId: number): Promise<Media[]> {
    return await db.select().from(media).where(eq(media.userId, userId));
  }

  async getMedia(id: number): Promise<Media | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    return mediaItem || undefined;
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const [mediaItem] = await db
      .insert(media)
      .values(insertMedia)
      .returning();
    return mediaItem;
  }

  async updateMedia(id: number, updates: Partial<InsertMedia>): Promise<Media | undefined> {
    const [mediaItem] = await db
      .update(media)
      .set(updates)
      .where(eq(media.id, id))
      .returning();
    return mediaItem || undefined;
  }

  async deleteMedia(id: number): Promise<boolean> {
    const result = await db.delete(media).where(eq(media.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAILearningByUserId(userId: number): Promise<AILearning[]> {
    return await db.select().from(aiLearning).where(eq(aiLearning.userId, userId));
  }

  async createAILearning(insertAILearning: InsertAILearning): Promise<AILearning> {
    const [learning] = await db
      .insert(aiLearning)
      .values(insertAILearning)
      .returning();
    return learning;
  }

  // User Preferences
  async getUserPreferencesByUserId(userId: number): Promise<UserPreferences[]> {
    return await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
  }

  async createUserPreference(insertPreference: InsertUserPreferences): Promise<UserPreferences> {
    const [preference] = await db
      .insert(userPreferences)
      .values(insertPreference)
      .returning();
    return preference;
  }

  async updateUserPreference(id: number, updates: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const [preference] = await db
      .update(userPreferences)
      .set(updates)
      .where(eq(userPreferences.id, id))
      .returning();
    return preference || undefined;
  }

  async deleteUserPreference(id: number): Promise<boolean> {
    const result = await db.delete(userPreferences).where(eq(userPreferences.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMoodsByUserId(userId: number): Promise<Mood[]> {
    return await db.select().from(moods).where(eq(moods.userId, userId));
  }

  async createMood(insertMood: InsertMood): Promise<Mood> {
    const [mood] = await db.insert(moods).values(insertMood).returning();
    return mood;
  }

  async getTimeTrackingByUserId(userId: number): Promise<TimeTracking[]> {
    return await db.select().from(timeTracking).where(eq(timeTracking.userId, userId));
  }

  async createTimeTracking(insertTimeTracking: InsertTimeTracking): Promise<TimeTracking> {
    const [timeTrackingRecord] = await db
      .insert(timeTracking)
      .values(insertTimeTracking)
      .returning();
    return timeTrackingRecord;
  }

  async updateTimeTracking(id: number, updates: Partial<InsertTimeTracking>): Promise<TimeTracking | undefined> {
    const [timeTrackingRecord] = await db
      .update(timeTracking)
      .set(updates)
      .where(eq(timeTracking.id, id))
      .returning();
    return timeTrackingRecord || undefined;
  }

  async deleteTimeTracking(id: number): Promise<boolean> {
    const result = await db
      .delete(timeTracking)
      .where(eq(timeTracking.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
