import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * eBooks table - stores generated ebooks metadata
 */
export const ebooks = mysqlTable("ebooks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  theme: text("theme").notNull(),
  languages: text("languages"), // comma-separated language codes
  author: varchar("author", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["processing", "completed", "failed"]).default("processing").notNull(),
  epubUrl: text("epubUrl"),
  pdfUrl: text("pdfUrl"),
  coverUrl: text("coverUrl"),
  content: text("content"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ebook = typeof ebooks.$inferSelect;
export type InsertEbook = typeof ebooks.$inferInsert;

/**
 * Publishing guides table - stores monetization guides for each platform
 */
export const publishingGuides = mysqlTable("publishingGuides", {
  id: int("id").autoincrement().primaryKey(),
  ebookId: int("ebookId").notNull(),
  platform: mysqlEnum("platform", ["amazon_kdp", "hotmart", "eduzz", "monetizze"]).notNull(),
  completed: int("completed").default(0).notNull(), // boolean as tinyint
  checklist: text("checklist"), // JSON string of checklist items
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PublishingGuide = typeof publishingGuides.$inferSelect;
export type InsertPublishingGuide = typeof publishingGuides.$inferInsert;

/**
 * Schedules table - stores automatic ebook generation schedules
 */
export const schedules = mysqlTable("schedules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly"]).notNull(),
  totalEbooks: int("totalEbooks").notNull(),
  generatedCount: int("generatedCount").default(0).notNull(),
  themeMode: mysqlEnum("themeMode", ["custom_list", "single_theme", "trending"]).notNull(),
  themes: text("themes"), // JSON array of themes for custom_list mode
  singleTheme: text("singleTheme"), // Single theme for single_theme mode
  author: varchar("author", { length: 255 }).notNull(),
  scheduledTime: varchar("scheduledTime", { length: 5 }), // HH:MM format (e.g., "08:00")
  active: int("active").default(1).notNull(), // boolean as tinyint
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

/**
 * Ebook metadata table - stores SEO-optimized metadata for publishing
 */
export const ebookMetadata = mysqlTable("ebookMetadata", {
  id: int("id").autoincrement().primaryKey(),
  ebookId: int("ebookId").notNull(),
  optimizedTitle: varchar("optimizedTitle", { length: 255 }),
  shortDescription: text("shortDescription"),
  longDescription: text("longDescription"),
  keywords: text("keywords"), // JSON array of keywords
  categories: text("categories"), // JSON array of categories
  suggestedPrice: varchar("suggestedPrice", { length: 50 }),
  targetAudience: text("targetAudience"),
  platformRecommendations: text("platformRecommendations"), // JSON array of platform recommendations
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EbookMetadata = typeof ebookMetadata.$inferSelect;
export type InsertEbookMetadata = typeof ebookMetadata.$inferInsert;

/**
 * Publications table - tracks where each ebook has been published
 */
export const publications = mysqlTable("publications", {
  id: int("id").autoincrement().primaryKey(),
  ebookId: int("ebookId").notNull(),
  platform: mysqlEnum("platform", ["amazon_kdp", "hotmart", "eduzz", "monetizze"]).notNull(),
  published: int("published").default(1).notNull(), // boolean as tinyint
  publicationUrl: text("publicationUrl"),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  notes: text("notes"),
  // Financial data per platform
  trafficCost: varchar("trafficCost", { length: 20 }).default("0"),
  otherCosts: varchar("otherCosts", { length: 20 }).default("0"),
  revenue: varchar("revenue", { length: 20 }).default("0"),
  salesCount: int("salesCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Publication = typeof publications.$inferSelect;
export type InsertPublication = typeof publications.$inferInsert;

/**
 * Financial metrics table - tracks costs and revenue per ebook
 */
export const financialMetrics = mysqlTable("financialMetrics", {
  id: int("id").autoincrement().primaryKey(),
  ebookId: int("ebookId").notNull(),
  trafficCost: varchar("trafficCost", { length: 20 }).default("0"), // decimal as string
  otherCosts: varchar("otherCosts", { length: 20 }).default("0"),
  revenue: varchar("revenue", { length: 20 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialMetric = typeof financialMetrics.$inferSelect;
export type InsertFinancialMetric = typeof financialMetrics.$inferInsert;