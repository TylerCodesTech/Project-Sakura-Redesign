import { eq, and, desc, sql, or, ilike } from "drizzle-orm";
import {
  pageVersions, bookVersions, versionAuditLogs,
  type PageVersion, type InsertPageVersion,
  type BookVersion, type InsertBookVersion,
  type VersionAuditLog, type InsertVersionAuditLog,
} from "@shared/schema";

export class DatabaseVersionsStorage {
  constructor(private db: any) {}

  // Page Versions
  async getPageVersions(pageId: string): Promise<PageVersion[]> {
    return this.db.select().from(pageVersions)
      .where(eq(pageVersions.pageId, pageId))
      .orderBy(desc(pageVersions.versionNumber));
  }

  async getPageVersion(pageId: string, versionNumber: number): Promise<PageVersion | undefined> {
    const [version] = await this.db.select().from(pageVersions)
      .where(and(eq(pageVersions.pageId, pageId), eq(pageVersions.versionNumber, versionNumber)));
    return version;
  }

  async getPageVersionByVersion(id: string): Promise<PageVersion | undefined> {
    const [version] = await this.db.select().from(pageVersions)
      .where(eq(pageVersions.id, id));
    return version;
  }

  async getLatestPageVersionNumber(pageId: string): Promise<number> {
    const [result] = await this.db.select({ maxVersion: sql<number>`COALESCE(MAX(${pageVersions.versionNumber}), 0)` })
      .from(pageVersions)
      .where(eq(pageVersions.pageId, pageId));
    return result?.maxVersion ?? 0;
  }

  async createPageVersion(insert: InsertPageVersion): Promise<PageVersion> {
    const [version] = await this.db.insert(pageVersions).values(insert).returning();
    return version;
  }

  async deletePageVersion(id: string): Promise<void> {
    await this.db.delete(pageVersions).where(eq(pageVersions.id, id));
  }

  async archivePageVersion(id: string): Promise<PageVersion> {
    const [version] = await this.db.update(pageVersions)
      .set({ isArchived: "true" })
      .where(eq(pageVersions.id, id))
      .returning();
    if (!version) throw new Error("Page version not found");
    return version;
  }

  async restorePageVersion(id: string): Promise<PageVersion> {
    const [version] = await this.db.update(pageVersions)
      .set({ isArchived: "false" })
      .where(eq(pageVersions.id, id))
      .returning();
    if (!version) throw new Error("Page version not found");
    return version;
  }

  async comparePageVersions(pageId: string, versionNumber1: number, versionNumber2: number): Promise<{
    version1: PageVersion | undefined;
    version2: PageVersion | undefined;
  }> {
    const version1 = await this.getPageVersion(pageId, versionNumber1);
    const version2 = await this.getPageVersion(pageId, versionNumber2);
    return { version1, version2 };
  }

  // Book Versions
  async getBookVersions(bookId: string): Promise<BookVersion[]> {
    return this.db.select().from(bookVersions)
      .where(eq(bookVersions.bookId, bookId))
      .orderBy(desc(bookVersions.versionNumber));
  }

  async getBookVersion(bookId: string, versionNumber: number): Promise<BookVersion | undefined> {
    const [version] = await this.db.select().from(bookVersions)
      .where(and(eq(bookVersions.bookId, bookId), eq(bookVersions.versionNumber, versionNumber)));
    return version;
  }

  async getBookVersionByVersion(id: string): Promise<BookVersion | undefined> {
    const [version] = await this.db.select().from(bookVersions)
      .where(eq(bookVersions.id, id));
    return version;
  }

  async getLatestBookVersionNumber(bookId: string): Promise<number> {
    const [result] = await this.db.select({ maxVersion: sql<number>`COALESCE(MAX(${bookVersions.versionNumber}), 0)` })
      .from(bookVersions)
      .where(eq(bookVersions.bookId, bookId));
    return result?.maxVersion ?? 0;
  }

  async createBookVersion(insert: InsertBookVersion): Promise<BookVersion> {
    const [version] = await this.db.insert(bookVersions).values(insert).returning();
    return version;
  }

  async deleteBookVersion(id: string): Promise<void> {
    await this.db.delete(bookVersions).where(eq(bookVersions.id, id));
  }

  async archiveBookVersion(id: string): Promise<BookVersion> {
    const [version] = await this.db.update(bookVersions)
      .set({ isArchived: "true" })
      .where(eq(bookVersions.id, id))
      .returning();
    if (!version) throw new Error("Book version not found");
    return version;
  }

  async restoreBookVersion(id: string): Promise<BookVersion> {
    const [version] = await this.db.update(bookVersions)
      .set({ isArchived: "false" })
      .where(eq(bookVersions.id, id))
      .returning();
    if (!version) throw new Error("Book version not found");
    return version;
  }

  async compareBookVersions(bookId: string, versionNumber1: number, versionNumber2: number): Promise<{
    version1: BookVersion | undefined;
    version2: BookVersion | undefined;
  }> {
    const version1 = await this.getBookVersion(bookId, versionNumber1);
    const version2 = await this.getBookVersion(bookId, versionNumber2);
    return { version1, version2 };
  }

  // Version Audit Logs
  async getVersionAuditLogs(documentId: string, documentType: string): Promise<VersionAuditLog[]> {
    return this.db.select().from(versionAuditLogs)
      .where(and(
        eq(versionAuditLogs.documentId, documentId),
        eq(versionAuditLogs.documentType, documentType)
      ))
      .orderBy(desc(versionAuditLogs.createdAt));
  }

  async getPageVersionAuditLogs(pageId: string): Promise<VersionAuditLog[]> {
    return this.getVersionAuditLogs(pageId, "page");
  }

  async getAllVersionAuditLogs(limit = 100, offset = 0): Promise<VersionAuditLog[]> {
    return this.db.select().from(versionAuditLogs)
      .orderBy(desc(versionAuditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async createVersionAuditLog(insert: InsertVersionAuditLog): Promise<VersionAuditLog> {
    const [log] = await this.db.insert(versionAuditLogs).values(insert).returning();
    return log;
  }

  // Search Versions
  async searchVersions(query: string): Promise<{ pageVersions: PageVersion[], bookVersions: BookVersion[] }> {
    const searchPattern = `%${query}%`;
    const matchingPageVersions = await this.db.select().from(pageVersions)
      .where(or(
        ilike(pageVersions.title, searchPattern),
        ilike(pageVersions.content, searchPattern)
      ));
    const matchingBookVersions = await this.db.select().from(bookVersions)
      .where(or(
        ilike(bookVersions.title, searchPattern),
        ilike(bookVersions.description, searchPattern)
      ));
    return { pageVersions: matchingPageVersions, bookVersions: matchingBookVersions };
  }
}
