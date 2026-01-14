import {
  type PageVersion, type InsertPageVersion,
  type BookVersion, type InsertBookVersion,
  type VersionAuditLog, type InsertVersionAuditLog,
} from "@shared/schema";
import { randomUUID } from "crypto";

export class VersionsStorage {
  private pageVersions: Map<string, PageVersion>;
  private bookVersions: Map<string, BookVersion>;
  private versionAuditLogs: Map<string, VersionAuditLog>;

  constructor() {
    this.pageVersions = new Map();
    this.bookVersions = new Map();
    this.versionAuditLogs = new Map();
  }

  // Version History - Pages
  async getPageVersions(pageId: string): Promise<PageVersion[]> {
    return Array.from(this.pageVersions.values())
      .filter(v => v.pageId === pageId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  async getPageVersion(pageId: string, versionNumber: number): Promise<PageVersion | undefined> {
    return Array.from(this.pageVersions.values())
      .find(v => v.pageId === pageId && v.versionNumber === versionNumber);
  }

  async getLatestPageVersionNumber(pageId: string): Promise<number> {
    const versions = Array.from(this.pageVersions.values())
      .filter(v => v.pageId === pageId);
    if (versions.length === 0) return 0;
    return Math.max(...versions.map(v => v.versionNumber));
  }

  async createPageVersion(insert: InsertPageVersion): Promise<PageVersion> {
    const id = randomUUID();
    const version: PageVersion = {
      id,
      pageId: insert.pageId,
      versionNumber: insert.versionNumber,
      title: insert.title,
      content: insert.content,
      status: insert.status,
      authorId: insert.authorId,
      changeDescription: insert.changeDescription ?? null,
      isArchived: insert.isArchived ?? "false",
      createdAt: new Date().toISOString(),
      embedding: null,
      embeddingUpdatedAt: null,
    };
    this.pageVersions.set(id, version);
    return version;
  }

  async deletePageVersion(id: string): Promise<void> {
    this.pageVersions.delete(id);
  }

  async archivePageVersion(id: string): Promise<PageVersion> {
    const version = this.pageVersions.get(id);
    if (!version) throw new Error("Page version not found");
    const updated = { ...version, isArchived: "true" };
    this.pageVersions.set(id, updated);
    return updated;
  }

  async restorePageVersion(id: string): Promise<PageVersion> {
    const version = this.pageVersions.get(id);
    if (!version) throw new Error("Page version not found");
    const updated = { ...version, isArchived: "false" };
    this.pageVersions.set(id, updated);
    return updated;
  }

  // Version History - Books
  async getBookVersions(bookId: string): Promise<BookVersion[]> {
    return Array.from(this.bookVersions.values())
      .filter(v => v.bookId === bookId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  async getBookVersion(bookId: string, versionNumber: number): Promise<BookVersion | undefined> {
    return Array.from(this.bookVersions.values())
      .find(v => v.bookId === bookId && v.versionNumber === versionNumber);
  }

  async getLatestBookVersionNumber(bookId: string): Promise<number> {
    const versions = Array.from(this.bookVersions.values())
      .filter(v => v.bookId === bookId);
    if (versions.length === 0) return 0;
    return Math.max(...versions.map(v => v.versionNumber));
  }

  async createBookVersion(insert: InsertBookVersion): Promise<BookVersion> {
    const id = randomUUID();
    const version: BookVersion = {
      id,
      bookId: insert.bookId,
      versionNumber: insert.versionNumber,
      title: insert.title,
      description: insert.description ?? null,
      authorId: insert.authorId,
      changeDescription: insert.changeDescription ?? null,
      isArchived: insert.isArchived ?? "false",
      createdAt: new Date().toISOString(),
    };
    this.bookVersions.set(id, version);
    return version;
  }

  async deleteBookVersion(id: string): Promise<void> {
    this.bookVersions.delete(id);
  }

  async archiveBookVersion(id: string): Promise<BookVersion> {
    const version = this.bookVersions.get(id);
    if (!version) throw new Error("Book version not found");
    const updated = { ...version, isArchived: "true" };
    this.bookVersions.set(id, updated);
    return updated;
  }

  async restoreBookVersion(id: string): Promise<BookVersion> {
    const version = this.bookVersions.get(id);
    if (!version) throw new Error("Book version not found");
    const updated = { ...version, isArchived: "false" };
    this.bookVersions.set(id, updated);
    return updated;
  }

  // Version Audit Logs
  async getVersionAuditLogs(documentId: string, documentType: string): Promise<VersionAuditLog[]> {
    return Array.from(this.versionAuditLogs.values())
      .filter(log => log.documentId === documentId && log.documentType === documentType)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getAllVersionAuditLogs(limit = 100, offset = 0): Promise<VersionAuditLog[]> {
    return Array.from(this.versionAuditLogs.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(offset, offset + limit);
  }

  async createVersionAuditLog(insert: InsertVersionAuditLog): Promise<VersionAuditLog> {
    const id = randomUUID();
    const log: VersionAuditLog = {
      id,
      documentId: insert.documentId,
      documentType: insert.documentType,
      actionType: insert.actionType,
      fromVersion: insert.fromVersion ?? null,
      toVersion: insert.toVersion ?? null,
      userId: insert.userId,
      userName: insert.userName ?? null,
      details: insert.details ?? null,
      createdAt: new Date().toISOString(),
    };
    this.versionAuditLogs.set(id, log);
    return log;
  }

  // Search versions
  async searchVersions(query: string): Promise<{ pageVersions: PageVersion[], bookVersions: BookVersion[] }> {
    const lowerQuery = query.toLowerCase();
    const matchingPageVersions = Array.from(this.pageVersions.values())
      .filter(v =>
        v.title.toLowerCase().includes(lowerQuery) ||
        v.content.toLowerCase().includes(lowerQuery)
      );
    const matchingBookVersions = Array.from(this.bookVersions.values())
      .filter(v =>
        v.title.toLowerCase().includes(lowerQuery) ||
        (v.description && v.description.toLowerCase().includes(lowerQuery))
      );
    return { pageVersions: matchingPageVersions, bookVersions: matchingBookVersions };
  }
}
