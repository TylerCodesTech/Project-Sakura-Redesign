import { 
  type User, type InsertUser, 
  type Book, type InsertBook,
  type Page, type InsertPage,
  type Comment, type InsertComment,
  type Notification, type InsertNotification,
  type ExternalLink, type InsertExternalLink,
  type Department, type InsertDepartment,
  type News, type InsertNews,
  type Stat, type InsertStat
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

  getDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, update: Partial<InsertDepartment>): Promise<Department>;
  deleteDepartment(id: string): Promise<void>;

  getNews(): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;

  getStats(): Promise<Stat[]>;
  updateStat(key: string, update: Partial<InsertStat>): Promise<Stat>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private books: Map<string, Book>;
  private pages: Map<string, Page>;
  private comments: Map<string, Comment>;
  private notifications: Map<string, Notification>;
  private externalLinks: Map<string, ExternalLink>;
  private departments: Map<string, Department>;
  private news: Map<string, News>;
  private stats: Map<string, Stat>;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.pages = new Map();
    this.comments = new Map();
    this.notifications = new Map();
    this.externalLinks = new Map();
    this.departments = new Map();
    this.news = new Map();
    this.stats = new Map();

    // Add initial stats
    const initialStats = [
      { key: "active_tickets", value: "12", change: "+2" },
      { key: "internal_docs", value: "48", change: "+5" },
      { key: "team_members", value: "24", change: "+1" },
    ];
    initialStats.forEach(s => {
      const id = randomUUID();
      this.stats.set(s.key, { ...s, id, updatedAt: new Date().toISOString() });
    });

    // Add initial news
    const initialNews = [
      { title: "Q1 Strategy Meeting", content: "Meeting details...", category: "Corporate", authorId: "system" },
      { title: "New AI Features Released", content: "Check out the new engine!", category: "Product", authorId: "system" },
    ];
    initialNews.forEach(n => {
      const id = randomUUID();
      this.news.set(id, { ...n, id, createdAt: new Date().toISOString() });
    });

    // Add some default departments
    const defaultDepts = [
      { name: "Product Engineering", description: "Core product development and engineering team.", color: "#3b82f6" },
      { name: "Customer Success", description: "Ensuring customer satisfaction and support.", color: "#10b981" },
      { name: "Marketing", description: "Brand awareness and growth.", color: "#f59e0b" },
      { name: "Human Resources", description: "People operations and recruitment.", color: "#ef4444" },
    ];
    defaultDepts.forEach(d => {
      const id = randomUUID();
      this.departments.set(id, { ...d, id, headId: null });
    });
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

  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async createDepartment(insertDept: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const dept: Department = { 
      ...insertDept, 
      id, 
      description: insertDept.description ?? null, 
      headId: insertDept.headId ?? null,
      color: insertDept.color || "#3b82f6"
    };
    this.departments.set(id, dept);
    return dept;
  }

  async updateDepartment(id: string, update: Partial<InsertDepartment>): Promise<Department> {
    const existing = this.departments.get(id);
    if (!existing) throw new Error("Department not found");
    const updated = { 
      ...existing, 
      ...update,
      color: update.color ?? existing.color 
    };
    this.departments.set(id, updated);
    return updated;
  }

  async deleteDepartment(id: string): Promise<void> {
    this.departments.delete(id);
  }

  async getNews(): Promise<News[]> {
    return Array.from(this.news.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const id = randomUUID();
    const n: News = { ...insertNews, id, createdAt: new Date().toISOString() };
    this.news.set(id, n);
    return n;
  }

  async getStats(): Promise<Stat[]> {
    return Array.from(this.stats.values());
  }

  async updateStat(key: string, update: Partial<InsertStat>): Promise<Stat> {
    const existing = Array.from(this.stats.values()).find(s => s.key === key);
    if (!existing) throw new Error("Stat not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.stats.set(key, updated);
    return updated;
  }
}

export const storage = new MemStorage();
