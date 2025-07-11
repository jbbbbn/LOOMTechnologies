import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time", { mode: 'string' }).notNull(),
  endTime: timestamp("end_time", { mode: 'string' }).notNull(),
  location: text("location"),
  isRecurring: boolean("is_recurring").default(false),
  recurringType: text("recurring_type"), // 'daily', 'weekly', 'monthly'
  recurringDays: text("recurring_days").array(), // ['monday', 'tuesday', etc.]
  recurringEndDate: timestamp("recurring_end_date", { mode: 'string' }),
  category: text("category"), // 'gym', 'work', 'school', 'diet', 'personal'
  reminder: integer("reminder"), // minutes before event
  status: text("status").default("pending"), // 'pending', 'completed', 'skipped', 'postponed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  query: text("query").notNull(),
  results: jsonb("results"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  sender: text("sender"),
  recipient: text("recipient"),
  isRead: boolean("is_read").default(false),
  isDraft: boolean("is_draft").default(false),
  isStarred: boolean("is_starred").default(false),
  folder: text("folder").default('inbox'), // 'inbox', 'sent', 'drafts', 'trash', 'archive'
  attachments: jsonb("attachments"), // array of attachment objects
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  roomId: text("room_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiLearning = pgTable("ai_learning", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  appType: text("app_type").notNull(), // 'notes', 'calendar', 'search', 'mail', 'chat', 'gallery'
  dataType: text("data_type").notNull(),
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(), // 'interests', 'goals', 'personality', 'habits'
  key: text("key").notNull(), // 'likes_comics', 'wants_exercise', 'morning_person'
  value: text("value").notNull(),
  confidence: integer("confidence").default(1), // 1-10 confidence level
  source: text("source").notNull(), // 'chat', 'notes', 'behavior'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const moods = pgTable("moods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mood: text("mood").notNull(), // 'Excellent', 'Happy', 'Neutral', 'Sad', 'Angry'
  emoji: text("emoji").notNull(), // '😍', '😊', '😐', '😞', '😡'
  note: text("note"), // optional note about the mood
  createdAt: timestamp("created_at").defaultNow(),
});

export const timeTracking = pgTable("time_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activity: text("activity").notNull(), // 'TV', 'Exercise', 'Work', 'Study', 'Reading', etc.
  duration: integer("duration").notNull(), // duration in minutes
  startTime: text("start_time"), // ISO string format
  endTime: text("end_time"), // ISO string format
  date: text("date").notNull(), // YYYY-MM-DD format
  icon: text("icon"), // icon name for the activity
  notes: text("notes"), // optional notes about the activity
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertSearchSchema = createInsertSchema(searches).omit({ id: true, timestamp: true });
export const insertEmailSchema = createInsertSchema(emails).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true });
export const insertMediaSchema = createInsertSchema(media).omit({ id: true, createdAt: true });
export const insertAILearningSchema = createInsertSchema(aiLearning).omit({ id: true, timestamp: true });
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMoodSchema = createInsertSchema(moods).omit({ id: true, createdAt: true });
export const insertTimeTrackingSchema = createInsertSchema(timeTracking).omit({ id: true, createdAt: true });

// Types
// Relations
export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
  events: many(events),
  searches: many(searches),
  emails: many(emails),
  media: many(media),
  aiLearning: many(aiLearning),
  userPreferences: many(userPreferences),
  moods: many(moods),
  timeTracking: many(timeTracking),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
}));

export const searchesRelations = relations(searches, ({ one }) => ({
  user: one(users, {
    fields: [searches.userId],
    references: [users.id],
  }),
}));

export const emailsRelations = relations(emails, ({ one }) => ({
  user: one(users, {
    fields: [emails.userId],
    references: [users.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  user: one(users, {
    fields: [media.userId],
    references: [users.id],
  }),
}));

export const aiLearningRelations = relations(aiLearning, ({ one }) => ({
  user: one(users, {
    fields: [aiLearning.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const moodsRelations = relations(moods, ({ one }) => ({
  user: one(users, {
    fields: [moods.userId],
    references: [users.id],
  }),
}));

export const timeTrackingRelations = relations(timeTracking, ({ one }) => ({
  user: one(users, {
    fields: [timeTracking.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Search = typeof searches.$inferSelect;
export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type AILearning = typeof aiLearning.$inferSelect;
export type InsertAILearning = z.infer<typeof insertAILearningSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type Mood = typeof moods.$inferSelect;
export type InsertMood = z.infer<typeof insertMoodSchema>;
export type TimeTracking = typeof timeTracking.$inferSelect;
export type InsertTimeTracking = z.infer<typeof insertTimeTrackingSchema>;
