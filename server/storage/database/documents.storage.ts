import { eq, and, desc, asc, sql, or } from "drizzle-orm";
import {
  books, pages, comments, externalLinks, departments, news, stats,
  announcements, posts, postLikes, postComments,
  type Book, type InsertBook, type Page, type InsertPage,
  type Comment, type InsertComment, type ExternalLink, type InsertExternalLink,
  type Department, type InsertDepartment, type News, type InsertNews,
  type Stat, type InsertStat, type Announcement, type InsertAnnouncement,
  type Post, type InsertPost, type PostComment, type InsertPostComment,
} from "@shared/schema";

export class DatabaseDocumentsStorage {
  constructor(private db: any) {}

  // Books
  async getBooks(): Promise<Book[]> {
    return this.db.select().from(books);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await this.db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const [book] = await this.db.insert(books).values(insertBook).returning();
    return book;
  }

  async updateBook(id: string, update: Partial<InsertBook>): Promise<Book> {
    const [book] = await this.db.update(books).set(update).where(eq(books.id, id)).returning();
    if (!book) throw new Error("Book not found");
    return book;
  }

  async deleteBook(id: string): Promise<void> {
    await this.db.delete(pages).where(eq(pages.bookId, id));
    await this.db.delete(books).where(eq(books.id, id));
  }

  // Pages
  async getPages(bookId: string): Promise<Page[]> {
    return this.db.select().from(pages).where(eq(pages.bookId, bookId));
  }

  async getPage(id: string): Promise<Page | undefined> {
    const [page] = await this.db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async getPageByTitle(bookId: string, title: string): Promise<Page | undefined> {
    const [page] = await this.db.select().from(pages).where(and(eq(pages.bookId, bookId), eq(pages.title, title)));
    return page;
  }

  async getStandalonePages(): Promise<Page[]> {
    const result = await this.db.select().from(pages);
    return result.filter((p: Page) => !p.bookId);
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const [page] = await this.db.insert(pages).values(insertPage).returning();

    // Automatically generate embedding in the background using queue
    if (page.type === 'page') {
      const { embeddingQueue } = await import("../../embedding-queue");
      embeddingQueue.enqueue('page', page.id);
    }

    return page;
  }

  async updatePage(id: string, update: Partial<InsertPage>): Promise<Page> {
    const [page] = await this.db.update(pages).set(update).where(eq(pages.id, id)).returning();
    if (!page) throw new Error("Page not found");

    // Regenerate embedding if content changed using queue
    if ((update.title !== undefined || update.content !== undefined) && page.type === 'page') {
      const { embeddingQueue } = await import("../../embedding-queue");
      embeddingQueue.enqueue('page', page.id);
    }

    return page;
  }

  async deletePage(id: string): Promise<void> {
    await this.db.delete(comments).where(eq(comments.pageId, id));
    await this.db.delete(pages).where(eq(pages.id, id));
  }

  // Comments
  async getComments(pageId: string): Promise<Comment[]> {
    return this.db.select().from(comments).where(eq(comments.pageId, pageId));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await this.db.insert(comments).values(insertComment).returning();
    return comment;
  }

  // External Links
  async getExternalLinks(): Promise<ExternalLink[]> {
    return this.db.select().from(externalLinks).orderBy(asc(externalLinks.order));
  }

  async createExternalLink(insertLink: InsertExternalLink): Promise<ExternalLink> {
    const [link] = await this.db.insert(externalLinks).values(insertLink).returning();
    return link;
  }

  async updateExternalLink(id: string, update: Partial<InsertExternalLink>): Promise<ExternalLink> {
    const [link] = await this.db.update(externalLinks).set(update).where(eq(externalLinks.id, id)).returning();
    if (!link) throw new Error("External link not found");
    return link;
  }

  async deleteExternalLink(id: string): Promise<void> {
    await this.db.delete(externalLinks).where(eq(externalLinks.id, id));
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return this.db.select().from(departments);
  }

  async createDepartment(insertDept: InsertDepartment): Promise<Department> {
    const [dept] = await this.db.insert(departments).values(insertDept).returning();
    return dept;
  }

  async updateDepartment(id: string, update: Partial<InsertDepartment>): Promise<Department> {
    const [dept] = await this.db.update(departments).set(update).where(eq(departments.id, id)).returning();
    if (!dept) throw new Error("Department not found");
    return dept;
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.db.delete(departments).where(eq(departments.id, id));
  }

  // News
  async getNews(): Promise<News[]> {
    return this.db.select().from(news).orderBy(desc(news.createdAt));
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const [n] = await this.db.insert(news).values(insertNews).returning();
    return n;
  }

  // Stats
  async getStats(): Promise<Stat[]> {
    return this.db.select().from(stats);
  }

  async updateStat(key: string, update: Partial<InsertStat>): Promise<Stat> {
    const [stat] = await this.db.update(stats).set({ ...update, updatedAt: new Date().toISOString() }).where(eq(stats.key, key)).returning();
    if (!stat) throw new Error("Stat not found");
    return stat;
  }

  // Announcements
  async getAnnouncements(departmentId?: string): Promise<Announcement[]> {
    if (departmentId) {
      return this.db.select().from(announcements)
        .where(or(eq(announcements.departmentId, departmentId), sql`${announcements.departmentId} IS NULL`))
        .orderBy(desc(announcements.createdAt));
    }
    return this.db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(insert: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await this.db.insert(announcements).values(insert).returning();
    return announcement;
  }

  async updateAnnouncement(id: string, update: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [announcement] = await this.db.update(announcements)
      .set({ ...update, updatedAt: new Date().toISOString() })
      .where(eq(announcements.id, id))
      .returning();
    if (!announcement) throw new Error("Announcement not found");
    return announcement;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await this.db.delete(announcements).where(eq(announcements.id, id));
  }

  // Posts
  async getPosts(departmentId?: string): Promise<Post[]> {
    if (departmentId) {
      return this.db.select().from(posts)
        .where(or(eq(posts.departmentId, departmentId), eq(posts.visibility, 'public')))
        .orderBy(desc(posts.isPinned), desc(posts.createdAt));
    }
    return this.db.select().from(posts).orderBy(desc(posts.isPinned), desc(posts.createdAt));
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await this.db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(insert: InsertPost): Promise<Post> {
    const [post] = await this.db.insert(posts).values(insert).returning();
    return post;
  }

  async updatePost(id: string, update: Partial<InsertPost>): Promise<Post> {
    const [post] = await this.db.update(posts)
      .set({ ...update, updatedAt: new Date().toISOString() })
      .where(eq(posts.id, id))
      .returning();
    if (!post) throw new Error("Post not found");
    return post;
  }

  async deletePost(id: string): Promise<void> {
    await this.db.delete(postLikes).where(eq(postLikes.postId, id));
    await this.db.delete(postComments).where(eq(postComments.postId, id));
    await this.db.delete(posts).where(eq(posts.id, id));
  }

  async likePost(postId: string, userId: string): Promise<boolean> {
    const [existing] = await this.db.select().from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

    if (existing) {
      await this.db.delete(postLikes).where(eq(postLikes.id, existing.id));
      await this.db.update(posts)
        .set({ likesCount: sql`GREATEST(0, ${posts.likesCount} - 1)` })
        .where(eq(posts.id, postId));
      return false;
    } else {
      await this.db.insert(postLikes).values({ postId, userId });
      await this.db.update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, postId));
      return true;
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const [existing] = await this.db.select().from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

    if (existing) {
      await this.db.delete(postLikes).where(eq(postLikes.id, existing.id));
      await this.db.update(posts)
        .set({ likesCount: sql`GREATEST(0, ${posts.likesCount} - 1)` })
        .where(eq(posts.id, postId));
    }
  }

  async addPostComment(insert: InsertPostComment): Promise<PostComment> {
    const [comment] = await this.db.insert(postComments).values(insert).returning();
    await this.db.update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, insert.postId));
    return comment;
  }

  async getPostComments(postId: string): Promise<PostComment[]> {
    return this.db.select().from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(asc(postComments.createdAt));
  }
}
