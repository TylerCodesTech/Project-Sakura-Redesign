import { 
  type User, type InsertUser, 
  type Book, type InsertBook,
  type Page, type InsertPage,
  type Comment, type InsertComment,
  type Notification, type InsertNotification,
  type ExternalLink, type InsertExternalLink
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByDepartment(department: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  getBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  
  getPages(bookId: string): Promise<Page[]>;
  getPage(id: string): Promise<Page | undefined>;
  getPageByTitle(bookId: string, title: string): Promise<Page | undefined>;
  getStandalonePages(): Promise<Page[]>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, page: Partial<InsertPage>): Promise<Page>;

  getComments(pageId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification>;

  getExternalLinks(): Promise<ExternalLink[]>;
  createExternalLink(link: InsertExternalLink): Promise<ExternalLink>;
  updateExternalLink(id: string, update: Partial<InsertExternalLink>): Promise<ExternalLink>;
  deleteExternalLink(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private books: Map<string, Book>;
  private pages: Map<string, Page>;
  private comments: Map<string, Comment>;
  private notifications: Map<string, Notification>;
  private externalLinks: Map<string, ExternalLink>;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.pages = new Map();
    this.comments = new Map();
    this.notifications = new Map();
    this.externalLinks = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsersByDepartment(department: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.department === department
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, department: insertUser.department ?? "General" };
    this.users.set(id, user);
    return user;
  }

  async getBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = randomUUID();
    const book: Book = { 
      ...insertBook, 
      id,
      description: insertBook.description ?? null 
    };
    this.books.set(id, book);
    return book;
  }

  async getPages(bookId?: string): Promise<Page[]> {
    if (bookId) {
      return Array.from(this.pages.values()).filter(p => p.bookId === bookId);
    }
    return Array.from(this.pages.values());
  }

  async getStandalonePages(): Promise<Page[]> {
    return Array.from(this.pages.values()).filter(p => !p.bookId);
  }

  async getPage(id: string): Promise<Page | undefined> {
    return this.pages.get(id);
  }

  async getPageByTitle(bookId: string, title: string): Promise<Page | undefined> {
    return Array.from(this.pages.values()).find(
      p => p.bookId === bookId && p.title.toLowerCase() === title.toLowerCase()
    );
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const id = randomUUID();
    const page: Page = { 
      ...insertPage, 
      id,
      bookId: insertPage.bookId ?? null,
      type: insertPage.type ?? "page",
      parentId: insertPage.parentId ?? null,
      order: insertPage.order ?? "0",
      status: insertPage.status ?? "draft",
      reviewerId: insertPage.reviewerId ?? null,
    };
    this.pages.set(id, page);
    return page;
  }

  async updatePage(id: string, update: Partial<InsertPage>): Promise<Page> {
    const existing = this.pages.get(id);
    if (!existing) throw new Error("Page not found");
    const updated = { ...existing, ...update };
    this.pages.set(id, updated);
    return updated;
  }

  async getComments(pageId: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(c => c.pageId === pageId);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = { ...insertComment, id, createdAt: new Date().toISOString() };
    this.comments.set(id, comment);
    return comment;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getActiveReviewNotification(userId: string, pageId: string): Promise<Notification | undefined> {
    return Array.from(this.notifications.values()).find(
      n => n.userId === userId && n.targetId === pageId && n.title === "New Page for Review" && n.read === "false"
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { 
      id,
      userId: insertNotification.userId,
      title: insertNotification.title,
      message: insertNotification.message,
      read: "false",
      link: insertNotification.link ?? null,
      targetId: insertNotification.targetId ?? null,
      createdAt: new Date().toISOString()
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const existing = this.notifications.get(id);
    if (!existing) throw new Error("Notification not found");
    const updated = { ...existing, read: "true" };
    this.notifications.set(id, updated);
    return updated;
  }

  async getExternalLinks(): Promise<ExternalLink[]> {
    return Array.from(this.externalLinks.values()).sort((a, b) => a.order.localeCompare(b.order));
  }

  async createExternalLink(insertLink: InsertExternalLink): Promise<ExternalLink> {
    const id = randomUUID();
    const link: ExternalLink = { 
      ...insertLink, 
      id,
      description: insertLink.description ?? null,
      icon: insertLink.icon ?? null,
      category: insertLink.category ?? "Resources",
      order: insertLink.order ?? "0"
    };
    this.externalLinks.set(id, link);
    return link;
  }

  async deleteExternalLink(id: string): Promise<void> {
    this.externalLinks.delete(id);
  }

  async updateExternalLink(id: string, update: Partial<InsertExternalLink>): Promise<ExternalLink> {
    const existing = this.externalLinks.get(id);
    if (!existing) throw new Error("External link not found");
    const updated = { ...existing, ...update };
    this.externalLinks.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
