import {
  type Book, type InsertBook,
  type Page, type InsertPage,
  type Comment, type InsertComment,
  type ExternalLink, type InsertExternalLink,
  type Department, type InsertDepartment,
  type News, type InsertNews,
  type Stat, type InsertStat,
  type Announcement, type InsertAnnouncement,
  type Post, type InsertPost,
  type PostLike,
  type PostComment, type InsertPostComment,
} from "@shared/schema";
import { randomUUID } from "crypto";

export class DocumentsStorage {
  private books: Map<string, Book>;
  private pages: Map<string, Page>;
  private comments: Map<string, Comment>;
  private externalLinks: Map<string, ExternalLink>;
  private departments: Map<string, Department>;
  private news: Map<string, News>;
  private stats: Map<string, Stat>;
  private announcements: Map<string, Announcement>;
  private posts: Map<string, Post>;
  private postLikes: Map<string, PostLike>;
  private postComments: Map<string, PostComment>;

  constructor() {
    this.books = new Map();
    this.pages = new Map();
    this.comments = new Map();
    this.externalLinks = new Map();
    this.departments = new Map();
    this.news = new Map();
    this.stats = new Map();
    this.announcements = new Map();
    this.posts = new Map();
    this.postLikes = new Map();
    this.postComments = new Map();

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
      this.departments.set(id, { ...d, id, headId: null, parentId: null });
    });
  }

  // Books
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
      description: insertBook.description ?? null,
      parentId: insertBook.parentId ?? null
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: string, update: Partial<InsertBook>): Promise<Book> {
    const book = this.books.get(id);
    if (!book) throw new Error("Book not found");
    const updated = { ...book, ...update };
    this.books.set(id, updated);
    return updated;
  }

  async deleteBook(id: string): Promise<void> {
    for (const [pageId, page] of Array.from(this.pages.entries())) {
      if (page.bookId === id) {
        this.pages.delete(pageId);
      }
    }
    this.books.delete(id);
  }

  // Pages
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
      embedding: null,
      embeddingUpdatedAt: null,
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

  async deletePage(id: string): Promise<void> {
    for (const [commentId, comment] of Array.from(this.comments.entries())) {
      if (comment.pageId === id) {
        this.comments.delete(commentId);
      }
    }
    this.pages.delete(id);
  }

  // Comments
  async getComments(pageId: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(c => c.pageId === pageId);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = { ...insertComment, id, createdAt: new Date().toISOString() };
    this.comments.set(id, comment);
    return comment;
  }

  // External Links
  async getExternalLinks(): Promise<ExternalLink[]> {
    return Array.from(this.externalLinks.values()).sort((a, b) => a.order.localeCompare(b.order));
  }

  async createExternalLink(insertLink: InsertExternalLink): Promise<ExternalLink> {
    const id = randomUUID();
    const link: ExternalLink = {
      id,
      title: insertLink.title,
      url: insertLink.url,
      description: insertLink.description ?? null,
      icon: insertLink.icon ?? null,
      category: insertLink.category ?? "Resources",
      order: insertLink.order ?? "0",
      departmentId: insertLink.departmentId ?? null,
      isCompanyWide: insertLink.isCompanyWide ?? "true"
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

  // Departments
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
      parentId: insertDept.parentId ?? null,
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

  // News
  async getNews(): Promise<News[]> {
    return Array.from(this.news.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const id = randomUUID();
    const n: News = {
      ...insertNews,
      id,
      category: insertNews.category ?? "General",
      createdAt: new Date().toISOString()
    };
    this.news.set(id, n);
    return n;
  }

  // Stats
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

  // Announcements
  async getAnnouncements(departmentId?: string): Promise<Announcement[]> {
    const all = Array.from(this.announcements.values());
    if (departmentId) return all.filter(a => a.departmentId === departmentId || !a.departmentId);
    return all;
  }

  async createAnnouncement(insert: InsertAnnouncement): Promise<Announcement> {
    const id = randomUUID();
    const announcement: Announcement = {
      id,
      title: insert.title,
      message: insert.message,
      type: insert.type ?? "info",
      link: insert.link ?? null,
      isActive: insert.isActive ?? true,
      departmentId: insert.departmentId ?? null,
      startDate: insert.startDate ?? null,
      endDate: insert.endDate ?? null,
      createdBy: insert.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async updateAnnouncement(id: string, update: Partial<InsertAnnouncement>): Promise<Announcement> {
    const existing = this.announcements.get(id);
    if (!existing) throw new Error("Announcement not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.announcements.set(id, updated);
    return updated;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    this.announcements.delete(id);
  }

  // Posts
  async getPosts(departmentId?: string): Promise<Post[]> {
    const all = Array.from(this.posts.values());
    if (departmentId) {
      return all.filter(p => p.departmentId === departmentId || p.visibility === 'public');
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insert: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      id,
      authorId: insert.authorId,
      content: insert.content,
      visibility: insert.visibility ?? 'public',
      departmentId: insert.departmentId ?? null,
      hashtags: insert.hashtags ?? null,
      imageUrl: insert.imageUrl ?? null,
      isPinned: insert.isPinned ?? false,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, update: Partial<InsertPost>): Promise<Post> {
    const existing = this.posts.get(id);
    if (!existing) throw new Error("Post not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.posts.set(id, updated);
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    for (const [likeId, like] of this.postLikes.entries()) {
      if (like.postId === id) this.postLikes.delete(likeId);
    }
    for (const [commentId, comment] of this.postComments.entries()) {
      if (comment.postId === id) this.postComments.delete(commentId);
    }
    this.posts.delete(id);
  }

  async likePost(postId: string, userId: string): Promise<boolean> {
    const existing = Array.from(this.postLikes.values()).find(
      l => l.postId === postId && l.userId === userId
    );
    const post = this.posts.get(postId);
    if (!post) throw new Error("Post not found");

    if (existing) {
      this.postLikes.delete(existing.id);
      this.posts.set(postId, { ...post, likesCount: Math.max(0, post.likesCount - 1) });
      return false;
    } else {
      const id = randomUUID();
      this.postLikes.set(id, {
        id,
        postId,
        userId,
        createdAt: new Date().toISOString(),
      });
      this.posts.set(postId, { ...post, likesCount: post.likesCount + 1 });
      return true;
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const existing = Array.from(this.postLikes.values()).find(
      l => l.postId === postId && l.userId === userId
    );
    if (existing) {
      this.postLikes.delete(existing.id);
      const post = this.posts.get(postId);
      if (post) {
        this.posts.set(postId, { ...post, likesCount: Math.max(0, post.likesCount - 1) });
      }
    }
  }

  async addPostComment(insert: InsertPostComment): Promise<PostComment> {
    const id = randomUUID();
    const comment: PostComment = {
      id,
      postId: insert.postId,
      authorId: insert.authorId,
      content: insert.content,
      createdAt: new Date().toISOString(),
    };
    this.postComments.set(id, comment);

    const post = this.posts.get(insert.postId);
    if (post) {
      this.posts.set(insert.postId, { ...post, commentsCount: post.commentsCount + 1 });
    }
    return comment;
  }

  async getPostComments(postId: string): Promise<PostComment[]> {
    return Array.from(this.postComments.values())
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
}
