import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  department: text("department").notNull().default("General"),
});

export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  authorId: varchar("author_id").notNull(),
});

export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id"), // Optional if it's a standalone file
  title: text("title").notNull(),
  content: text("content").notNull(),
  parentId: varchar("parent_id"), // For chapters/sub-pages or folders
  order: text("order").notNull().default("0"),
  type: text("type").notNull().default("page"), // 'page' or 'folder' or 'file'
  status: text("status").notNull().default("draft"), // draft, in_review, published
  reviewerId: varchar("reviewer_id"),
  authorId: varchar("author_id").notNull(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: text("read").notNull().default("false"),
  link: text("link"),
  targetId: varchar("target_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const externalLinks = pgTable("external_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  category: text("category").notNull().default("Resources"),
  icon: text("icon"), // Store lucide icon name
  order: text("order").notNull().default("0"),
});

export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("General"),
  authorId: varchar("author_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const stats = pgTable("stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  change: text("change").notNull().default("0"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  headId: varchar("head_id"),
  color: text("color").notNull().default("#3b82f6"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
});

export const insertExternalLinkSchema = createInsertSchema(externalLinks).omit({
  id: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
});

export const insertStatSchema = createInsertSchema(stats).omit({
  id: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ExternalLink = typeof externalLinks.$inferSelect;
export type InsertExternalLink = z.infer<typeof insertExternalLinkSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Stat = typeof stats.$inferSelect;
export type InsertStat = z.infer<typeof insertStatSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  department: true,
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
