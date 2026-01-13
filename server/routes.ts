import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema, insertPageSchema, insertCommentSchema, insertNotificationSchema, insertExternalLinkSchema, insertDepartmentSchema, insertNewsSchema, insertStatSchema, systemSettingsDefaults, insertHelpdeskSchema, insertSlaStateSchema, insertSlaPolicySchema, insertDepartmentHierarchySchema, insertDepartmentManagerSchema, insertEscalationRuleSchema, insertEscalationConditionSchema, insertInboundEmailConfigSchema, insertTicketSchema, insertTicketCommentSchema, insertHelpdeskWebhookSchema, insertTicketFormCategorySchema, insertTicketFormFieldSchema, insertRoleSchema, insertUserRoleSchema, insertAuditLogSchema, AVAILABLE_PERMISSIONS, PERMISSION_CATEGORIES, insertPageVersionSchema, insertBookVersionSchema, insertVersionAuditLogSchema, insertPostSchema, insertPostCommentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/svg+xml", "image/webp", "image/x-icon"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/external-links", async (_req, res) => {
    const links = await storage.getExternalLinks();
    res.json(links);
  });

  app.get("/api/proxy-favicon", async (req, res) => {
    const { url } = req.query;
    if (typeof url !== 'string') return res.status(400).send("URL required");
    try {
      const domain = new URL(url).hostname;
      res.redirect(`https://icon.horse/icon/${domain}`);
    } catch (e) {
      res.status(400).send("Invalid URL");
    }
  });

  app.post("/api/external-links", async (req, res) => {
    const result = insertExternalLinkSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const link = await storage.createExternalLink(result.data);
    res.json(link);
  });

  app.delete("/api/external-links/:id", async (req, res) => {
    await storage.deleteExternalLink(req.params.id);
    res.sendStatus(204);
  });

  app.patch("/api/external-links/reorder", async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.sendStatus(400);
    
    try {
      await Promise.all(
        ids.map((id: string, index: number) => 
          storage.updateExternalLink(id, { order: index.toString() })
        )
      );
      res.sendStatus(204);
    } catch (error) {
      console.error("Reorder error:", error);
      res.sendStatus(500);
    }
  });

  app.patch("/api/external-links/:id", async (req, res) => {
    const result = insertExternalLinkSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    try {
      const link = await storage.updateExternalLink(req.params.id, result.data);
      res.json(link);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  // Users
  app.get("/api/users", async (_req, res) => {
    const allUsers = await storage.getUsers();
    res.json(allUsers.map(u => ({
      ...u,
      password: undefined,
    })));
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ ...user, password: undefined });
  });

  app.patch("/api/users/:id", async (req, res) => {
    const { username, department } = req.body;
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const updated = await storage.updateUser(req.params.id, { username, department });
    res.json({ ...updated, password: undefined });
  });

  app.post("/api/users/:id/reset-password", async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { hashPassword } = await import("./auth");
    const hashedPassword = await hashPassword(password);
    await storage.updateUser(req.params.id, { password: hashedPassword });
    res.json({ success: true });
  });

  // Departments
  app.get("/api/departments", async (_req, res) => {
    const departments = await storage.getDepartments();
    res.json(departments);
  });

  app.post("/api/departments", async (req, res) => {
    const result = insertDepartmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const department = await storage.createDepartment(result.data);
    res.json(department);
  });

  app.patch("/api/departments/:id", async (req, res) => {
    const result = insertDepartmentSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    try {
      const department = await storage.updateDepartment(req.params.id, result.data);
      res.json(department);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    const departmentId = req.params.id;
    
    // Get the department to find its name
    const departments = await storage.getDepartments();
    const department = departments.find(d => d.id === departmentId);
    
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    
    // Check users by department name (users store department name, not ID)
    const users = await storage.getUsers();
    const usersInDepartment = users.filter(u => u.department === department.name);
    
    if (usersInDepartment.length > 0) {
      return res.status(400).json({ 
        error: `Cannot delete department. There are ${usersInDepartment.length} user(s) assigned to this department. Please reassign them first.`,
        userCount: usersInDepartment.length
      });
    }
    
    await storage.deleteDepartment(departmentId);
    res.sendStatus(204);
  });

  // News
  app.get("/api/news", async (_req, res) => {
    const news = await storage.getNews();
    res.json(news);
  });

  app.post("/api/news", async (req, res) => {
    const result = insertNewsSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const news = await storage.createNews(result.data);
    res.json(news);
  });

  // Stats
  app.get("/api/stats", async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.patch("/api/stats/:key", async (req, res) => {
    const result = insertStatSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const stat = await storage.updateStat(req.params.key, result.data);
      res.json(stat);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  });

  app.get("/api/notifications/:userId", async (req, res) => {
    const notifications = await storage.getNotifications(req.params.userId);
    res.json(notifications);
  });

  app.post("/api/notifications", async (req, res) => {
    const result = insertNotificationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const notification = await storage.createNotification(result.data);
    res.json(notification);
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      res.json(notification);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.get("/api/books", async (_req, res) => {
    const books = await storage.getBooks();
    res.json(books);
  });

  app.post("/api/books", async (req, res) => {
    const result = insertBookSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    try {
      const book = await storage.createBook(result.data);
      res.json(book);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/books/:bookId", async (req, res) => {
    const book = await storage.getBook(req.params.bookId);
    if (!book) return res.status(404).send("Book not found");
    res.json(book);
  });

  app.get("/api/books/:bookId/pages", async (req, res) => {
    const pages = await storage.getPages(req.params.bookId);
    res.json(pages);
  });

  app.delete("/api/books/:bookId", async (req, res) => {
    try {
      await storage.deleteBook(req.params.bookId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/books/:bookId", async (req, res) => {
    try {
      const existing = await storage.getBook(req.params.bookId);
      if (!existing) return res.status(404).send("Book not found");

      const isMove = req.body.parentId !== undefined && req.body.parentId !== existing.parentId;
      const oldParentId = existing.parentId;

      const book = await storage.updateBook(req.params.bookId, req.body);

      if (isMove) {
        let fromName = 'Root';
        let toName = 'Root';
        
        if (oldParentId) {
          const oldParent = await storage.getPage(oldParentId);
          if (oldParent) fromName = oldParent.title;
        }
        
        if (req.body.parentId) {
          const newParent = await storage.getPage(req.body.parentId);
          if (newParent) toName = newParent.title;
        }
        
        await storage.createDocumentActivity({
          documentId: book.id,
          documentType: 'book',
          action: 'moved',
          userId: 'current-user-id',
          details: JSON.stringify({ from: fromName, to: toName, fromId: oldParentId, toId: req.body.parentId }),
        });
      }

      res.json(book);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pages", async (req, res) => {
    const pages = await storage.getStandalonePages();
    res.json(pages);
  });

  app.post("/api/pages", async (req, res) => {
    const result = insertPageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    // Auto-assign reviewer if status is in_review
    const pageData = result.data;
    if (pageData.status === "in_review") {
      const author = await storage.getUser(pageData.authorId);
      if (author) {
        const deptMembers = await storage.getUsersByDepartment(author.department);
        const candidates = deptMembers.filter(m => m.id !== author.id);
        if (candidates.length > 0) {
          pageData.reviewerId = candidates[Math.floor(Math.random() * candidates.length)].id;
        }
      }
    }
    
    const page = await storage.createPage(pageData);
    
    // Create notification for reviewer
    if (page.reviewerId) {
      await storage.createNotification({
        userId: page.reviewerId,
        title: "New Page for Review",
        message: `"${page.title}" has been submitted for your review.`,
        link: `/documents?pageId=${page.id}`,
        targetId: page.id,
      });
    }
    
    res.json(page);
  });

  app.get("/api/pages/:id", async (req, res) => {
    const page = await storage.getPage(req.params.id);
    if (!page) return res.status(404).send("Page not found");
    res.json(page);
  });

  app.delete("/api/pages/:id", async (req, res) => {
    try {
      await storage.deletePage(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/pages/:id", async (req, res) => {
    try {
      const existing = await storage.getPage(req.params.id);
      if (!existing) return res.status(404).send("Page not found");

      // Check if this is a move operation (parentId is being changed)
      const isMove = req.body.parentId !== undefined && req.body.parentId !== existing.parentId;
      const oldParentId = existing.parentId;

      // Handle transition to review
      if (req.body.status === "in_review" && existing.status === "draft") {
        const author = await storage.getUser(existing.authorId);
        if (author) {
          const deptMembers = await storage.getUsersByDepartment(author.department);
          const candidates = deptMembers.filter(m => m.id !== author.id);
          if (candidates.length > 0) {
            req.body.reviewerId = candidates[Math.floor(Math.random() * candidates.length)].id;
          }
        }
      }

      const page = await storage.updatePage(req.params.id, req.body);

      // Log move activity
      if (isMove) {
        let fromName = 'Root';
        let toName = 'Root';
        
        if (oldParentId) {
          const oldParent = await storage.getPage(oldParentId);
          if (oldParent) fromName = oldParent.title;
        }
        
        if (req.body.parentId) {
          const newParent = await storage.getPage(req.body.parentId);
          if (newParent) toName = newParent.title;
        }
        
        await storage.createDocumentActivity({
          documentId: page.id,
          documentType: page.type,
          action: 'moved',
          userId: 'current-user-id',
          details: JSON.stringify({ from: fromName, to: toName, fromId: oldParentId, toId: req.body.parentId }),
        });
      }

      // Create notification for status changes
      if (req.body.status === "in_review" && page.reviewerId) {
        await storage.createNotification({
          userId: page.reviewerId,
          title: "New Page for Review",
          message: `"${page.title}" has been submitted for your review.`,
          link: `/documents?pageId=${page.id}`,
          targetId: page.id,
        });
      } else if (req.body.status === "published") {
        // Resolve review notification if it exists
        const reviewNotif = await (storage as any).getActiveReviewNotification(page.reviewerId, page.id);
        if (reviewNotif) {
          await storage.markNotificationRead(reviewNotif.id);
        }

        await storage.createNotification({
          userId: page.authorId,
          title: "Page Published",
          message: `Your page "${page.title}" has been published.`,
          link: `/documents?pageId=${page.id}`,
          targetId: page.id,
        });
      }

      res.json(page);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.get("/api/pages/:id/comments", async (req, res) => {
    const comments = await storage.getComments(req.params.id);
    res.json(comments);
  });

  app.post("/api/pages/:id/comments", async (req, res) => {
    const result = insertCommentSchema.safeParse({ ...req.body, pageId: req.params.id });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const comment = await storage.createComment(result.data);

    // Create notification for page author
    const page = await storage.getPage(result.data.pageId);
    if (page && page.authorId !== result.data.userId) {
      await storage.createNotification({
        userId: page.authorId,
        title: "New Comment",
        message: `Someone commented on your page "${page.title}".`,
      });
    }

    res.json(comment);
  });

  app.get("/api/pages/search", async (req, res) => {
    const { bookId, title } = req.query;
    if (typeof bookId !== 'string' || typeof title !== 'string') {
      return res.status(400).send("Invalid query params");
    }
    const page = await storage.getPageByTitle(bookId, title);
    res.json(page || null);
  });

  // ============================================
  // VERSION HISTORY ROUTES
  // ============================================

  // Page versions
  app.get("/api/pages/:id/versions", async (req, res) => {
    const versions = await storage.getPageVersions(req.params.id);
    res.json(versions);
  });

  app.get("/api/pages/:id/versions/:versionNumber", async (req, res) => {
    const version = await storage.getPageVersion(req.params.id, parseInt(req.params.versionNumber));
    if (!version) return res.status(404).json({ error: "Version not found" });
    res.json(version);
  });

  app.post("/api/pages/:id/versions", async (req, res) => {
    try {
      const page = await storage.getPage(req.params.id);
      if (!page) return res.status(404).json({ error: "Page not found" });
      
      const latestVersion = await storage.getLatestPageVersionNumber(req.params.id);
      const newVersionNumber = latestVersion + 1;
      
      const versionData = {
        pageId: req.params.id,
        versionNumber: newVersionNumber,
        title: page.title,
        content: page.content,
        status: page.status,
        authorId: req.body.authorId || page.authorId,
        changeDescription: req.body.changeDescription || null,
      };
      
      const result = insertPageVersionSchema.safeParse(versionData);
      if (!result.success) return res.status(400).json({ error: result.error });
      
      const version = await storage.createPageVersion(result.data);
      
      // Log the version creation
      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "page",
        actionType: "created",
        toVersion: newVersionNumber,
        userId: req.body.authorId || page.authorId,
        userName: req.body.userName,
        details: JSON.stringify({ title: page.title, changeDescription: req.body.changeDescription }),
      });
      
      res.json(version);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pages/:id/revert/:versionNumber", async (req, res) => {
    try {
      const targetVersion = await storage.getPageVersion(req.params.id, parseInt(req.params.versionNumber));
      if (!targetVersion) return res.status(404).json({ error: "Version not found" });
      
      const currentPage = await storage.getPage(req.params.id);
      if (!currentPage) return res.status(404).json({ error: "Page not found" });
      
      // Save current state as a new version before reverting
      const latestVersion = await storage.getLatestPageVersionNumber(req.params.id);
      await storage.createPageVersion({
        pageId: req.params.id,
        versionNumber: latestVersion + 1,
        title: currentPage.title,
        content: currentPage.content,
        status: currentPage.status,
        authorId: currentPage.authorId,
        changeDescription: `Auto-saved before reverting to version ${req.params.versionNumber}`,
      });
      
      // Revert the page to the target version
      const revertedPage = await storage.updatePage(req.params.id, {
        title: targetVersion.title,
        content: targetVersion.content,
      });
      
      // Log the reversion
      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "page",
        actionType: "reverted",
        fromVersion: latestVersion + 1,
        toVersion: parseInt(req.params.versionNumber),
        userId: req.body.userId || currentPage.authorId,
        userName: req.body.userName,
        details: JSON.stringify({ revertedToTitle: targetVersion.title }),
      });
      
      // Create activity feed notification
      await storage.createDocumentActivity({
        documentId: req.params.id,
        documentType: "page",
        action: "reverted",
        userId: req.body.userId || currentPage.authorId,
        details: JSON.stringify({
          fromVersion: latestVersion + 1,
          toVersion: parseInt(req.params.versionNumber),
          userName: req.body.userName,
        }),
      });
      
      // Notify page author if different from reverter
      if (req.body.userId && req.body.userId !== currentPage.authorId) {
        await storage.createNotification({
          userId: currentPage.authorId,
          title: "Page Reverted",
          message: `"${revertedPage.title}" was reverted to version ${req.params.versionNumber} by ${req.body.userName || 'a user'}.`,
          link: `/documents?pageId=${req.params.id}`,
          targetId: req.params.id,
        });
      }
      
      res.json(revertedPage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/pages/:id/versions/:versionId", async (req, res) => {
    try {
      await storage.deletePageVersion(req.params.versionId);
      
      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "page",
        actionType: "deleted",
        userId: req.body.userId || "system",
        details: JSON.stringify({ deletedVersionId: req.params.versionId }),
      });
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pages/:id/versions/:versionId/archive", async (req, res) => {
    try {
      const version = await storage.archivePageVersion(req.params.versionId);
      
      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "page",
        actionType: "archived",
        toVersion: version.versionNumber,
        userId: req.body.userId || "system",
      });
      
      res.json(version);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pages/:id/versions/:versionId/restore", async (req, res) => {
    try {
      const version = await storage.restorePageVersion(req.params.versionId);
      
      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "page",
        actionType: "restored",
        toVersion: version.versionNumber,
        userId: req.body.userId || "system",
      });
      
      res.json(version);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Book versions
  app.get("/api/books/:id/versions", async (req, res) => {
    const versions = await storage.getBookVersions(req.params.id);
    res.json(versions);
  });

  app.get("/api/books/:id/versions/:versionNumber", async (req, res) => {
    const version = await storage.getBookVersion(req.params.id, parseInt(req.params.versionNumber));
    if (!version) return res.status(404).json({ error: "Version not found" });
    res.json(version);
  });

  app.post("/api/books/:id/versions", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) return res.status(404).json({ error: "Book not found" });
      
      const latestVersion = await storage.getLatestBookVersionNumber(req.params.id);
      const newVersionNumber = latestVersion + 1;
      
      const versionData = {
        bookId: req.params.id,
        versionNumber: newVersionNumber,
        title: book.title,
        description: book.description,
        authorId: req.body.authorId || book.authorId,
        changeDescription: req.body.changeDescription || null,
      };
      
      const result = insertBookVersionSchema.safeParse(versionData);
      if (!result.success) return res.status(400).json({ error: result.error });
      
      const version = await storage.createBookVersion(result.data);
      
      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "book",
        actionType: "created",
        toVersion: newVersionNumber,
        userId: req.body.authorId || book.authorId,
        userName: req.body.userName,
        details: JSON.stringify({ title: book.title, changeDescription: req.body.changeDescription }),
      });
      
      res.json(version);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/books/:id/revert/:versionNumber", async (req, res) => {
    try {
      const targetVersion = await storage.getBookVersion(req.params.id, parseInt(req.params.versionNumber));
      if (!targetVersion) return res.status(404).json({ error: "Version not found" });
      
      const currentBook = await storage.getBook(req.params.id);
      if (!currentBook) return res.status(404).json({ error: "Book not found" });
      
      const latestVersion = await storage.getLatestBookVersionNumber(req.params.id);
      await storage.createBookVersion({
        bookId: req.params.id,
        versionNumber: latestVersion + 1,
        title: currentBook.title,
        description: currentBook.description,
        authorId: currentBook.authorId,
        changeDescription: `Auto-saved before reverting to version ${req.params.versionNumber}`,
      });
      
      const revertedBook = await storage.updateBook(req.params.id, {
        title: targetVersion.title,
        description: targetVersion.description,
      });
      
      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "book",
        actionType: "reverted",
        fromVersion: latestVersion + 1,
        toVersion: parseInt(req.params.versionNumber),
        userId: req.body.userId || currentBook.authorId,
        userName: req.body.userName,
      });
      
      await storage.createDocumentActivity({
        documentId: req.params.id,
        documentType: "book",
        action: "reverted",
        userId: req.body.userId || currentBook.authorId,
        details: JSON.stringify({
          fromVersion: latestVersion + 1,
          toVersion: parseInt(req.params.versionNumber),
          userName: req.body.userName,
        }),
      });
      
      res.json(revertedBook);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Version audit logs
  app.get("/api/version-audit-logs", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const logs = await storage.getAllVersionAuditLogs(limit, offset);
    res.json(logs);
  });

  app.get("/api/version-audit-logs/:documentType/:documentId", async (req, res) => {
    const logs = await storage.getVersionAuditLogs(req.params.documentId, req.params.documentType);
    res.json(logs);
  });

  // Version search
  app.get("/api/versions/search", async (req, res) => {
    const query = req.query.q;
    if (typeof query !== "string") return res.status(400).json({ error: "Query required" });
    
    const results = await storage.searchVersions(query);
    
    // Format results with legacy version indicators
    const formattedPageVersions = results.pageVersions.map(v => ({
      ...v,
      displayLabel: v.isArchived === "true" 
        ? `[Archived – Last Updated: ${new Date(v.createdAt).toLocaleDateString()}]`
        : `[Legacy Version – v${v.versionNumber}]`,
    }));
    
    const formattedBookVersions = results.bookVersions.map(v => ({
      ...v,
      displayLabel: v.isArchived === "true"
        ? `[Archived – Last Updated: ${new Date(v.createdAt).toLocaleDateString()}]`
        : `[Legacy Version – v${v.versionNumber}]`,
    }));
    
    res.json({ pageVersions: formattedPageVersions, bookVersions: formattedBookVersions });
  });

  // Compare versions
  app.get("/api/pages/:id/compare/:v1/:v2", async (req, res) => {
    try {
      const version1 = await storage.getPageVersion(req.params.id, parseInt(req.params.v1));
      const version2 = await storage.getPageVersion(req.params.id, parseInt(req.params.v2));
      
      if (!version1 || !version2) {
        return res.status(404).json({ error: "One or both versions not found" });
      }
      
      res.json({
        version1,
        version2,
        comparison: {
          titleChanged: version1.title !== version2.title,
          contentChanged: version1.content !== version2.content,
          statusChanged: version1.status !== version2.status,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/search", async (req, res) => {
    const query = req.query.q;
    const includeVersions = req.query.includeVersions === "true";
    if (typeof query !== "string") return res.status(400).send("Query required");
    
    const books = await storage.getBooks();
    const pages = await storage.getStandalonePages();
    const departments = await storage.getDepartments();
    
    const results: Array<{
      type: string;
      id: string;
      title: string;
      link: string;
      displayLabel?: string;
      isLegacy?: boolean;
      versionNumber?: number;
    }> = [
      ...books.filter(b => b.title.toLowerCase().includes(query.toLowerCase()))
        .map(b => ({ type: 'book', id: b.id, title: b.title, link: `/documents/book/${b.id}` })),
      ...pages.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
        .map(p => ({ type: 'page', id: p.id, title: p.title, link: `/documents/edit/${p.id}` })),
      ...departments.filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
        .map(d => ({ type: 'department', id: d.id, title: d.name, link: `/system-settings` }))
    ];
    
    // Include legacy versions in search if requested or by default
    if (includeVersions !== false) {
      try {
        const versionResults = await storage.searchVersions(query);
        
        // Add page versions with legacy indicators
        versionResults.pageVersions.forEach(v => {
          const isArchived = v.isArchived === "true";
          const displayLabel = isArchived 
            ? `[Archived – Last Updated: ${new Date(v.createdAt).toLocaleDateString('en-GB')}]`
            : `[Legacy Version – v${v.versionNumber}]`;
          
          results.push({
            type: 'page_version',
            id: v.id,
            title: v.title,
            link: `/documents/edit/${v.pageId}?version=${v.versionNumber}`,
            displayLabel,
            isLegacy: true,
            versionNumber: v.versionNumber,
          });
        });
        
        // Add book versions with legacy indicators
        versionResults.bookVersions.forEach(v => {
          const isArchived = v.isArchived === "true";
          const displayLabel = isArchived 
            ? `[Archived – Last Updated: ${new Date(v.createdAt).toLocaleDateString('en-GB')}]`
            : `[Legacy Version – v${v.versionNumber}]`;
          
          results.push({
            type: 'book_version',
            id: v.id,
            title: v.title,
            link: `/documents/book/${v.bookId}?version=${v.versionNumber}`,
            displayLabel,
            isLegacy: true,
            versionNumber: v.versionNumber,
          });
        });
      } catch (e) {
        // Version search failed, continue with regular results
        console.error("Version search error:", e);
      }
    }
    
    res.json(results);
  });

  // Watercooler
  app.get("/api/watercooler", async (_req, res) => {
    const messages = await storage.getWatercoolerMessages();
    res.json(messages);
  });

  app.post("/api/watercooler", async (req, res) => {
    const result = insertCommentSchema.safeParse({ ...req.body, pageId: "watercooler" });
    if (!result.success) return res.status(400).json({ error: result.error });
    const message = await storage.createWatercoolerMessage(result.data);
    res.json(message);
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path.replace(/^\//, ""));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("File not found");
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  });

  // System Settings
  app.get("/api/system-settings", async (_req, res) => {
    const settings = await storage.getSystemSettings();
    res.json(settings);
  });

  app.get("/api/system-settings/:key", async (req, res) => {
    const value = await storage.getSystemSetting(req.params.key);
    if (value === undefined) {
      const defaultValue = systemSettingsDefaults[req.params.key as keyof typeof systemSettingsDefaults];
      if (defaultValue !== undefined) {
        return res.json({ key: req.params.key, value: defaultValue });
      }
      return res.status(404).json({ error: "Setting not found" });
    }
    res.json({ key: req.params.key, value });
  });

  app.patch("/api/system-settings", async (req, res) => {
    const settings = req.body;
    if (typeof settings !== 'object' || settings === null) {
      return res.status(400).json({ error: "Invalid settings object" });
    }
    await storage.setSystemSettings(settings);
    const updated = await storage.getSystemSettings();
    res.json(updated);
  });

  app.patch("/api/system-settings/:key", async (req, res) => {
    const { value } = req.body;
    if (typeof value !== 'string') {
      return res.status(400).json({ error: "Value must be a string" });
    }
    const setting = await storage.setSystemSetting(req.params.key, value);
    res.json(setting);
  });

  // ============== HELPDESK ROUTES ==============

  // Helpdesks
  app.get("/api/helpdesks", async (_req, res) => {
    const helpdesks = await storage.getHelpdesks();
    res.json(helpdesks);
  });

  app.get("/api/helpdesks/by-department/:departmentId", async (req, res) => {
    const helpdesk = await storage.getHelpdeskByDepartment(req.params.departmentId);
    res.json(helpdesk || null);
  });

  app.post("/api/helpdesks", async (req, res) => {
    const result = insertHelpdeskSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    
    const existing = await storage.getHelpdeskByDepartment(result.data.departmentId);
    if (existing) {
      return res.json(existing);
    }
    
    const helpdesk = await storage.createHelpdesk(result.data);
    res.json(helpdesk);
  });

  app.patch("/api/helpdesks/:id", async (req, res) => {
    const result = insertHelpdeskSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const helpdesk = await storage.updateHelpdesk(req.params.id, result.data);
      res.json(helpdesk);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/helpdesks/:id", async (req, res) => {
    await storage.deleteHelpdesk(req.params.id);
    res.sendStatus(204);
  });

  // SLA States
  app.get("/api/helpdesks/:helpdeskId/sla-states", async (req, res) => {
    const states = await storage.getSlaStates(req.params.helpdeskId);
    res.json(states);
  });

  app.post("/api/helpdesks/:helpdeskId/sla-states", async (req, res) => {
    const result = insertSlaStateSchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const state = await storage.createSlaState(result.data);
    res.json(state);
  });

  app.patch("/api/sla-states/:id", async (req, res) => {
    const result = insertSlaStateSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const state = await storage.updateSlaState(req.params.id, result.data);
      res.json(state);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/sla-states/:id", async (req, res) => {
    await storage.deleteSlaState(req.params.id);
    res.sendStatus(204);
  });

  app.patch("/api/helpdesks/:helpdeskId/sla-states/reorder", async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.sendStatus(400);
    try {
      await Promise.all(
        ids.map((id: string, index: number) => storage.updateSlaState(id, { order: index }))
      );
      res.sendStatus(204);
    } catch (error) {
      res.sendStatus(500);
    }
  });

  // SLA Policies
  app.get("/api/helpdesks/:helpdeskId/sla-policies", async (req, res) => {
    const policies = await storage.getSlaPolicies(req.params.helpdeskId);
    res.json(policies);
  });

  app.post("/api/helpdesks/:helpdeskId/sla-policies", async (req, res) => {
    const result = insertSlaPolicySchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const policy = await storage.createSlaPolicy(result.data);
    res.json(policy);
  });

  app.patch("/api/sla-policies/:id", async (req, res) => {
    const result = insertSlaPolicySchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const policy = await storage.updateSlaPolicy(req.params.id, result.data);
      res.json(policy);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/sla-policies/:id", async (req, res) => {
    await storage.deleteSlaPolicy(req.params.id);
    res.sendStatus(204);
  });

  // Department Hierarchy
  app.get("/api/department-hierarchy", async (_req, res) => {
    const hierarchy = await storage.getDepartmentHierarchy();
    res.json(hierarchy);
  });

  app.get("/api/department-hierarchy/children/:parentId", async (req, res) => {
    const children = await storage.getChildDepartments(req.params.parentId);
    res.json(children);
  });

  app.post("/api/department-hierarchy", async (req, res) => {
    const result = insertDepartmentHierarchySchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const hierarchy = await storage.createDepartmentHierarchy(result.data);
    res.json(hierarchy);
  });

  app.delete("/api/department-hierarchy/:id", async (req, res) => {
    await storage.deleteDepartmentHierarchy(req.params.id);
    res.sendStatus(204);
  });

  // Department Managers
  app.get("/api/departments/:departmentId/managers", async (req, res) => {
    const managers = await storage.getDepartmentManagers(req.params.departmentId);
    res.json(managers);
  });

  app.post("/api/departments/:departmentId/managers", async (req, res) => {
    const result = insertDepartmentManagerSchema.safeParse({ ...req.body, departmentId: req.params.departmentId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const manager = await storage.createDepartmentManager(result.data);
    res.json(manager);
  });

  app.patch("/api/department-managers/:id", async (req, res) => {
    const result = insertDepartmentManagerSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const manager = await storage.updateDepartmentManager(req.params.id, result.data);
      res.json(manager);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/department-managers/:id", async (req, res) => {
    await storage.deleteDepartmentManager(req.params.id);
    res.sendStatus(204);
  });

  // Escalation Rules
  app.get("/api/helpdesks/:helpdeskId/escalation-rules", async (req, res) => {
    const rules = await storage.getEscalationRules(req.params.helpdeskId);
    res.json(rules);
  });

  app.post("/api/helpdesks/:helpdeskId/escalation-rules", async (req, res) => {
    const result = insertEscalationRuleSchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const rule = await storage.createEscalationRule(result.data);
    res.json(rule);
  });

  app.patch("/api/escalation-rules/:id", async (req, res) => {
    const result = insertEscalationRuleSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const rule = await storage.updateEscalationRule(req.params.id, result.data);
      res.json(rule);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/escalation-rules/:id", async (req, res) => {
    await storage.deleteEscalationRule(req.params.id);
    res.sendStatus(204);
  });

  // Escalation Conditions
  app.get("/api/escalation-rules/:ruleId/conditions", async (req, res) => {
    const conditions = await storage.getEscalationConditions(req.params.ruleId);
    res.json(conditions);
  });

  app.post("/api/escalation-rules/:ruleId/conditions", async (req, res) => {
    const result = insertEscalationConditionSchema.safeParse({ ...req.body, ruleId: req.params.ruleId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const condition = await storage.createEscalationCondition(result.data);
    res.json(condition);
  });

  app.delete("/api/escalation-conditions/:id", async (req, res) => {
    await storage.deleteEscalationCondition(req.params.id);
    res.sendStatus(204);
  });

  // Inbound Email Config
  app.get("/api/helpdesks/:helpdeskId/email-config", async (req, res) => {
    const config = await storage.getInboundEmailConfig(req.params.helpdeskId);
    res.json(config || null);
  });

  app.post("/api/helpdesks/:helpdeskId/email-config", async (req, res) => {
    const result = insertInboundEmailConfigSchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const config = await storage.createInboundEmailConfig(result.data);
    res.json(config);
  });

  app.patch("/api/email-config/:id", async (req, res) => {
    const result = insertInboundEmailConfigSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const config = await storage.updateInboundEmailConfig(req.params.id, result.data);
      res.json(config);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  // Tickets
  app.get("/api/tickets", async (req, res) => {
    const helpdeskId = req.query.helpdeskId as string | undefined;
    const tickets = await storage.getTickets(helpdeskId);
    res.json(tickets);
  });

  app.get("/api/tickets/:id", async (req, res) => {
    const ticket = await storage.getTicket(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  });

  app.post("/api/tickets", async (req, res) => {
    const result = insertTicketSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const ticket = await storage.createTicket(result.data);
    res.json(ticket);
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    const result = insertTicketSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const ticket = await storage.updateTicket(req.params.id, result.data);
      res.json(ticket);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  // Ticket Comments
  app.get("/api/tickets/:ticketId/comments", async (req, res) => {
    const comments = await storage.getTicketComments(req.params.ticketId);
    res.json(comments);
  });

  app.post("/api/tickets/:ticketId/comments", async (req, res) => {
    const result = insertTicketCommentSchema.safeParse({ ...req.body, ticketId: req.params.ticketId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const comment = await storage.createTicketComment(result.data);
    res.json(comment);
  });

  // Related documents for tickets (vector similarity search)
  app.get("/api/tickets/:ticketId/related-documents", async (req, res) => {
    try {
      const { findRelatedDocumentsForTicket } = await import("./embeddings");
      const documents = await findRelatedDocumentsForTicket(req.params.ticketId);
      res.json(documents);
    } catch (error: any) {
      console.error("Error finding related documents:", error);
      if (error.message?.includes("OPENAI_API_KEY")) {
        res.json([]);
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Embedding management endpoints
  app.post("/api/embeddings/reindex-pages", async (req, res) => {
    try {
      const { reindexAllPages } = await import("./embeddings");
      const result = await reindexAllPages();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/embeddings/reindex-tickets", async (req, res) => {
    try {
      const { reindexAllTickets } = await import("./embeddings");
      const result = await reindexAllTickets();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pages/:pageId/update-embedding", async (req, res) => {
    try {
      const { updatePageEmbedding } = await import("./embeddings");
      await updatePageEmbedding(req.params.pageId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Chat endpoints
  app.get("/api/ai/status", async (req, res) => {
    try {
      const { isAIConfigured } = await import("./ai-chat");
      const status = await isAIConfigured();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/writing-assist", async (req, res) => {
    try {
      const { isAIConfigured, generateWritingAssistance } = await import("./ai-chat");
      
      const status = await isAIConfigured();
      if (!status.configured) {
        return res.status(400).json({ error: status.reason || "AI is not configured" });
      }
      
      const { prompt, context, action } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const result = await generateWritingAssistance(prompt, context, action);
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { isAIConfigured, generateAIResponse } = await import("./ai-chat");
      
      const status = await isAIConfigured();
      if (!status.configured) {
        return res.status(400).json({ error: status.reason || "AI is not configured" });
      }
      
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }
      
      const result = await generateAIResponse(messages);
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Model Configurations
  app.get("/api/ai/models", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const configs = await storage.getAiModelConfigs(type);
      res.json(configs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai/models/:id", async (req, res) => {
    try {
      const config = await storage.getAiModelConfig(req.params.id);
      if (!config) return res.status(404).json({ error: "AI model config not found" });
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai/models/active/:type", async (req, res) => {
    try {
      const config = await storage.getActiveAiModelConfig(req.params.type);
      res.json(config || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/models", async (req, res) => {
    try {
      const config = await storage.createAiModelConfig(req.body);
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/ai/models/:id", async (req, res) => {
    try {
      const config = await storage.updateAiModelConfig(req.params.id, req.body);
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/ai/models/:id", async (req, res) => {
    try {
      await storage.deleteAiModelConfig(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/models/:id/activate", async (req, res) => {
    try {
      const config = await storage.getAiModelConfig(req.params.id);
      if (!config) return res.status(404).json({ error: "AI model config not found" });
      const updated = await storage.setActiveAiModelConfig(req.params.id, config.type);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Indexing Statistics
  app.get("/api/ai/indexing-stats", async (req, res) => {
    try {
      const pages = await storage.getPages("");
      const allPages: any[] = [];
      const books = await storage.getBooks();
      for (const book of books) {
        const bookPages = await storage.getPages(book.id);
        allPages.push(...bookPages);
      }
      const standalonePagesRaw = await storage.getStandalonePages();
      allPages.push(...standalonePagesRaw);
      
      const tickets = await storage.getTickets();
      
      const pagesWithEmbedding = allPages.filter(p => p.embedding).length;
      const pagesPending = allPages.length - pagesWithEmbedding;
      const ticketsWithEmbedding = tickets.filter(t => t.embedding).length;
      const ticketsPending = tickets.length - ticketsWithEmbedding;
      
      res.json({
        pages: {
          total: allPages.length,
          indexed: pagesWithEmbedding,
          pending: pagesPending,
        },
        tickets: {
          total: tickets.length,
          indexed: ticketsWithEmbedding,
          pending: ticketsPending,
        },
        totalIndexed: pagesWithEmbedding + ticketsWithEmbedding,
        totalPending: pagesPending + ticketsPending,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Webhooks
  app.get("/api/helpdesks/:helpdeskId/webhooks", async (req, res) => {
    const webhooks = await storage.getWebhooks(req.params.helpdeskId);
    res.json(webhooks);
  });

  app.post("/api/helpdesks/:helpdeskId/webhooks", async (req, res) => {
    const result = insertHelpdeskWebhookSchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const webhook = await storage.createWebhook(result.data);
    res.json(webhook);
  });

  app.patch("/api/webhooks/:id", async (req, res) => {
    const result = insertHelpdeskWebhookSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const webhook = await storage.updateWebhook(req.params.id, result.data);
      res.json(webhook);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/webhooks/:id", async (req, res) => {
    await storage.deleteWebhook(req.params.id);
    res.sendStatus(204);
  });

  // Ticket Form Categories
  app.get("/api/helpdesks/:helpdeskId/form-categories", async (req, res) => {
    const categories = await storage.getTicketFormCategories(req.params.helpdeskId);
    res.json(categories);
  });

  app.get("/api/form-categories/:id", async (req, res) => {
    const category = await storage.getTicketFormCategory(req.params.id);
    if (!category) return res.status(404).json({ error: "Form category not found" });
    res.json(category);
  });

  app.post("/api/helpdesks/:helpdeskId/form-categories", async (req, res) => {
    const result = insertTicketFormCategorySchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const category = await storage.createTicketFormCategory(result.data);
    res.json(category);
  });

  app.patch("/api/form-categories/:id", async (req, res) => {
    const result = insertTicketFormCategorySchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const category = await storage.updateTicketFormCategory(req.params.id, result.data);
      res.json(category);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/form-categories/:id", async (req, res) => {
    await storage.deleteTicketFormCategory(req.params.id);
    res.sendStatus(204);
  });

  // Get form fields for a specific category
  app.get("/api/form-categories/:categoryId/fields", async (req, res) => {
    const fields = await storage.getTicketFormFieldsByCategory(req.params.categoryId);
    res.json(fields);
  });

  // Ticket Form Fields
  app.get("/api/helpdesks/:helpdeskId/form-fields", async (req, res) => {
    const fields = await storage.getTicketFormFields(req.params.helpdeskId);
    res.json(fields);
  });

  app.post("/api/helpdesks/:helpdeskId/form-fields", async (req, res) => {
    const result = insertTicketFormFieldSchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const field = await storage.createTicketFormField(result.data);
    res.json(field);
  });

  app.patch("/api/form-fields/:id", async (req, res) => {
    const result = insertTicketFormFieldSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const field = await storage.updateTicketFormField(req.params.id, result.data);
      res.json(field);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/form-fields/:id", async (req, res) => {
    await storage.deleteTicketFormField(req.params.id);
    res.sendStatus(204);
  });

  // ============================================
  // ROLE-BASED ACCESS CONTROL (RBAC) ROUTES
  // ============================================

  // Get available permissions catalog
  app.get("/api/permissions", async (_req, res) => {
    const permissions = Object.entries(AVAILABLE_PERMISSIONS).map(([key, value]) => ({
      key,
      ...value,
    }));
    const categories = Object.values(PERMISSION_CATEGORIES);
    res.json({ permissions, categories });
  });

  // Roles
  app.get("/api/roles", async (_req, res) => {
    const roles = await storage.getRoles();
    res.json(roles);
  });

  app.get("/api/roles/:id", async (req, res) => {
    const role = await storage.getRoleWithPermissions(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  });

  app.post("/api/roles", async (req, res) => {
    const result = insertRoleSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const role = await storage.createRole(result.data);
      
      // Log the creation
      await storage.createAuditLog({
        actorId: req.body.actorId || null,
        actorName: req.body.actorName || "System",
        actionType: "role.created",
        targetType: "role",
        targetId: role.id,
        targetName: role.name,
        description: `Created role "${role.name}"`,
        metadata: JSON.stringify({ role }),
      });
      
      res.json(role);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/roles/:id", async (req, res) => {
    const result = insertRoleSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const existingRole = await storage.getRole(req.params.id);
      const userCount = await storage.getUserRoleCount(req.params.id);
      const role = await storage.updateRole(req.params.id, result.data);
      
      // Log the update
      await storage.createAuditLog({
        actorId: req.body.actorId || null,
        actorName: req.body.actorName || "System",
        actionType: "role.updated",
        targetType: "role",
        targetId: role.id,
        targetName: role.name,
        description: `Updated role "${role.name}" (affects ${userCount} user${userCount !== 1 ? 's' : ''})`,
        metadata: JSON.stringify({ before: existingRole, after: role, affectedUsers: userCount }),
      });
      
      res.json(role);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const role = await storage.getRole(req.params.id);
      if (!role) return res.status(404).json({ error: "Role not found" });
      
      const userCount = await storage.getUserRoleCount(req.params.id);
      await storage.deleteRole(req.params.id);
      
      // Log the deletion
      await storage.createAuditLog({
        actorId: req.body.actorId || null,
        actorName: req.body.actorName || "System",
        actionType: "role.deleted",
        targetType: "role",
        targetId: role.id,
        targetName: role.name,
        description: `Deleted role "${role.name}" (affected ${userCount} user${userCount !== 1 ? 's' : ''})`,
        metadata: JSON.stringify({ role, affectedUsers: userCount }),
      });
      
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Role Permissions
  app.get("/api/roles/:roleId/permissions", async (req, res) => {
    const permissions = await storage.getRolePermissions(req.params.roleId);
    res.json(permissions);
  });

  app.put("/api/roles/:roleId/permissions", async (req, res) => {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) return res.status(400).json({ error: "permissions must be an array" });
    
    try {
      const role = await storage.getRole(req.params.roleId);
      if (!role) return res.status(404).json({ error: "Role not found" });
      if (role.isSystem === "true") return res.status(400).json({ error: "Cannot modify system role permissions" });
      
      const oldPermissions = await storage.getRolePermissions(req.params.roleId);
      const newPermissions = await storage.setRolePermissions(req.params.roleId, permissions);
      const userCount = await storage.getUserRoleCount(req.params.roleId);
      
      // Log the permission change
      await storage.createAuditLog({
        actorId: req.body.actorId || null,
        actorName: req.body.actorName || "System",
        actionType: "role.permissions_updated",
        targetType: "role",
        targetId: role.id,
        targetName: role.name,
        description: `Updated permissions for role "${role.name}" (affects ${userCount} user${userCount !== 1 ? 's' : ''})`,
        metadata: JSON.stringify({ 
          before: oldPermissions.map(p => p.permission), 
          after: permissions,
          affectedUsers: userCount 
        }),
      });
      
      res.json(newPermissions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // User Roles
  app.get("/api/users/:userId/roles", async (req, res) => {
    const userRoles = await storage.getUserRoles(req.params.userId);
    res.json(userRoles);
  });

  app.get("/api/users/:userId/permissions", async (req, res) => {
    const permissions = await storage.getUserPermissions(req.params.userId);
    res.json(permissions);
  });

  app.post("/api/users/:userId/roles", async (req, res) => {
    const { roleId, assignedBy, assignedByName } = req.body;
    if (!roleId) return res.status(400).json({ error: "roleId is required" });
    
    try {
      const role = await storage.getRole(roleId);
      if (!role) return res.status(404).json({ error: "Role not found" });
      
      const user = await storage.getUser(req.params.userId);
      const userRole = await storage.assignUserRole({
        userId: req.params.userId,
        roleId,
        assignedBy,
      });
      
      // Log the assignment
      await storage.createAuditLog({
        actorId: assignedBy || null,
        actorName: assignedByName || "System",
        actionType: "user.role_assigned",
        targetType: "user",
        targetId: req.params.userId,
        targetName: user?.username || "Unknown User",
        description: `Assigned role "${role.name}" to user "${user?.username || req.params.userId}"`,
        metadata: JSON.stringify({ roleId, roleName: role.name, userId: req.params.userId }),
      });
      
      res.json(userRole);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/users/:userId/roles/:roleId", async (req, res) => {
    try {
      const role = await storage.getRole(req.params.roleId);
      const user = await storage.getUser(req.params.userId);
      
      await storage.removeUserRole(req.params.userId, req.params.roleId);
      
      // Log the removal
      await storage.createAuditLog({
        actorId: req.body.actorId || null,
        actorName: req.body.actorName || "System",
        actionType: "user.role_removed",
        targetType: "user",
        targetId: req.params.userId,
        targetName: user?.username || "Unknown User",
        description: `Removed role "${role?.name || req.params.roleId}" from user "${user?.username || req.params.userId}"`,
        metadata: JSON.stringify({ roleId: req.params.roleId, roleName: role?.name, userId: req.params.userId }),
      });
      
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get users assigned to a role
  app.get("/api/roles/:roleId/users", async (req, res) => {
    const userRoles = await storage.getUsersWithRole(req.params.roleId);
    res.json(userRoles);
  });

  // Audit Logs
  app.get("/api/audit-logs", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const logs = await storage.getAuditLogs(limit, offset);
    const total = await storage.getAuditLogCount();
    res.json({ logs, total, limit, offset });
  });

  app.get("/api/audit-logs/actor/:actorId", async (req, res) => {
    const logs = await storage.getAuditLogsByActor(req.params.actorId);
    res.json(logs);
  });

  app.get("/api/audit-logs/target/:targetType/:targetId", async (req, res) => {
    const logs = await storage.getAuditLogsByTarget(req.params.targetType, req.params.targetId);
    res.json(logs);
  });

  // ============================================
  // REPORTS API
  // ============================================

  // Report Definitions
  app.get("/api/reports/definitions", async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const definitions = await storage.getReportDefinitions(departmentId);
    res.json(definitions);
  });

  app.get("/api/reports/definitions/:id", async (req, res) => {
    const definition = await storage.getReportDefinition(req.params.id);
    if (!definition) {
      return res.status(404).json({ error: "Report definition not found" });
    }
    res.json(definition);
  });

  app.post("/api/reports/definitions", async (req, res) => {
    try {
      const definition = await storage.createReportDefinition(req.body);
      await storage.createReportAuditLog({
        userId: "current-user-id",
        userName: "Current User",
        actionType: "created",
        targetType: "definition",
        targetId: definition.id,
        targetName: definition.name,
        departmentId: definition.departmentId ?? undefined,
        details: JSON.stringify({ type: definition.type }),
      });
      res.status(201).json(definition);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/reports/definitions/:id", async (req, res) => {
    try {
      const definition = await storage.updateReportDefinition(req.params.id, req.body);
      await storage.createReportAuditLog({
        userId: "current-user-id",
        userName: "Current User",
        actionType: "edited",
        targetType: "definition",
        targetId: definition.id,
        targetName: definition.name,
        departmentId: definition.departmentId ?? undefined,
      });
      res.json(definition);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/reports/definitions/:id", async (req, res) => {
    try {
      const definition = await storage.getReportDefinition(req.params.id);
      await storage.deleteReportDefinition(req.params.id);
      if (definition) {
        await storage.createReportAuditLog({
          userId: "current-user-id",
          userName: "Current User",
          actionType: "deleted",
          targetType: "definition",
          targetId: req.params.id,
          targetName: definition.name,
          departmentId: definition.departmentId ?? undefined,
        });
      }
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Saved Reports
  app.get("/api/reports/saved", async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const reports = await storage.getSavedReports(departmentId);
    res.json(reports);
  });

  app.get("/api/reports/saved/:id", async (req, res) => {
    const report = await storage.getSavedReport(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "Saved report not found" });
    }
    res.json(report);
  });

  app.post("/api/reports/saved", async (req, res) => {
    try {
      const report = await storage.createSavedReport(req.body);
      await storage.createReportAuditLog({
        userId: "current-user-id",
        userName: "Current User",
        actionType: "generated",
        targetType: "saved_report",
        targetId: report.id,
        targetName: report.name,
        departmentId: report.departmentId ?? undefined,
        details: JSON.stringify({ rowCount: report.rowCount }),
      });
      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/reports/saved/:id", async (req, res) => {
    try {
      await storage.deleteSavedReport(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Report Schedules
  app.get("/api/reports/schedules", async (req, res) => {
    const definitionId = req.query.definitionId as string | undefined;
    const schedules = await storage.getReportSchedules(definitionId);
    res.json(schedules);
  });

  app.get("/api/reports/schedules/:id", async (req, res) => {
    const schedule = await storage.getReportSchedule(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: "Report schedule not found" });
    }
    res.json(schedule);
  });

  app.post("/api/reports/schedules", async (req, res) => {
    try {
      const schedule = await storage.createReportSchedule(req.body);
      await storage.createReportAuditLog({
        userId: "current-user-id",
        userName: "Current User",
        actionType: "scheduled",
        targetType: "schedule",
        targetId: schedule.id,
        targetName: `${schedule.frequency} schedule`,
        details: JSON.stringify({ frequency: schedule.frequency }),
      });
      res.status(201).json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/reports/schedules/:id", async (req, res) => {
    try {
      const schedule = await storage.updateReportSchedule(req.params.id, req.body);
      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/reports/schedules/:id", async (req, res) => {
    try {
      await storage.deleteReportSchedule(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Report Shares
  app.get("/api/reports/:reportId/shares", async (req, res) => {
    const shares = await storage.getReportShares(req.params.reportId);
    res.json(shares);
  });

  app.post("/api/reports/:reportId/shares", async (req, res) => {
    try {
      const share = await storage.createReportShare({
        ...req.body,
        reportId: req.params.reportId,
      });
      await storage.createReportAuditLog({
        userId: "current-user-id",
        userName: "Current User",
        actionType: "shared",
        targetType: req.body.reportType,
        targetId: req.params.reportId,
        details: JSON.stringify({ sharedWith: share.sharedWith, shareType: share.shareType }),
      });
      res.status(201).json(share);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/reports/shares/:id", async (req, res) => {
    try {
      await storage.deleteReportShare(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Report Audit Logs
  app.get("/api/reports/audit-logs", async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await storage.getReportAuditLogs(departmentId, limit);
    res.json(logs);
  });

  // Department Report Settings
  app.get("/api/departments/:departmentId/report-settings", async (req, res) => {
    const settings = await storage.getDepartmentReportSettings(req.params.departmentId);
    if (!settings) {
      return res.json({
        departmentId: req.params.departmentId,
        enabled: "true",
        allowCustomReports: "true",
        allowScheduledReports: "true",
        allowExport: "true",
        defaultExportFormat: "pdf",
        retentionDays: 90,
        maxScheduledReports: 10,
      });
    }
    res.json(settings);
  });

  app.post("/api/departments/:departmentId/report-settings", async (req, res) => {
    try {
      const existing = await storage.getDepartmentReportSettings(req.params.departmentId);
      if (existing) {
        const settings = await storage.updateDepartmentReportSettings(req.params.departmentId, req.body);
        res.json(settings);
      } else {
        const settings = await storage.createDepartmentReportSettings({
          ...req.body,
          departmentId: req.params.departmentId,
        });
        res.status(201).json(settings);
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Report Fields (metadata for available fields)
  app.get("/api/reports/fields", async (req, res) => {
    const dataSource = req.query.dataSource as string | undefined;
    const fields = await storage.getReportFields(dataSource);
    res.json(fields);
  });

  app.post("/api/reports/fields", async (req, res) => {
    try {
      const field = await storage.createReportField(req.body);
      res.status(201).json(field);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/reports/fields/:id", async (req, res) => {
    try {
      const field = await storage.updateReportField(req.params.id, req.body);
      res.json(field);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/reports/fields/:id", async (req, res) => {
    try {
      await storage.deleteReportField(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Announcements API
  app.get("/api/announcements", async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const announcements = await storage.getAnnouncements(departmentId);
    res.json(announcements);
  });

  app.get("/api/announcements/active", async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const announcements = await storage.getActiveAnnouncements(departmentId);
    res.json(announcements);
  });

  app.get("/api/announcements/:id", async (req, res) => {
    const announcement = await storage.getAnnouncement(req.params.id);
    if (!announcement) return res.status(404).json({ error: "Announcement not found" });
    res.json(announcement);
  });

  app.post("/api/announcements", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const announcement = await storage.createAnnouncement({
        ...req.body,
        createdBy: req.user!.id,
      });
      res.status(201).json(announcement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/announcements/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const announcement = await storage.updateAnnouncement(req.params.id, req.body);
      res.json(announcement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/announcements/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      await storage.deleteAnnouncement(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Users by department (for Online Team Members)
  app.get("/api/users/department/:department", async (req, res) => {
    const users = await storage.getUsersByDepartment(req.params.department);
    res.json(users.map(u => ({ id: u.id, username: u.username, department: u.department })));
  });

  // Search tracking and trending topics
  app.post("/api/search-history", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const history = await storage.createSearchHistory({
        ...req.body,
        userId: req.user!.id,
        departmentId: req.user!.department,
      });
      res.status(201).json(history);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/trending-topics", async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const topics = await storage.getTrendingTopics(departmentId, limit);
    res.json(topics);
  });

  // Intranet Posts API
  app.get("/api/posts", async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const postsList = await storage.getPosts(departmentId);
    const users = await storage.getUsers();
    const userMap = new Map(users.map(u => [u.id, u]));
    
    const postsWithAuthor = postsList.map(post => {
      const author = userMap.get(post.authorId);
      let hashtags: string[] = [];
      if (post.hashtags) {
        try {
          hashtags = JSON.parse(post.hashtags);
        } catch {
          hashtags = [];
        }
      }
      return {
        ...post,
        hashtags,
        author: author ? {
          id: author.id,
          name: author.username,
          department: author.department
        } : null
      };
    });
    res.json(postsWithAuthor);
  });

  app.get("/api/posts/:id", async (req, res) => {
    const post = await storage.getPost(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    
    const author = await storage.getUser(post.authorId);
    res.json({
      ...post,
      author: author ? {
        id: author.id,
        name: author.username,
        department: author.department
      } : null
    });
  });

  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const result = insertPostSchema.safeParse({ ...req.body, authorId: req.user!.id });
    if (!result.success) return res.status(400).json({ error: result.error });
    
    try {
      const post = await storage.createPost(result.data);
      const author = await storage.getUser(post.authorId);
      res.status(201).json({
        ...post,
        author: author ? {
          id: author.id,
          name: author.username,
          department: author.department
        } : null
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const post = await storage.getPost(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== req.user!.id) return res.status(403).json({ error: "Not authorized" });
    
    const result = insertPostSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    
    try {
      const updated = await storage.updatePost(req.params.id, result.data);
      const author = await storage.getUser(updated.authorId);
      res.json({
        ...updated,
        author: author ? {
          id: author.id,
          name: author.username,
          department: author.department
        } : null
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const post = await storage.getPost(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== req.user!.id) return res.status(403).json({ error: "Not authorized" });
    
    try {
      await storage.deletePost(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/posts/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const liked = await storage.likePost(req.params.id, req.user!.id);
      res.json({ liked });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/posts/:id/comments", async (req, res) => {
    const comments = await storage.getPostComments(req.params.id);
    const users = await storage.getUsers();
    const userMap = new Map(users.map(u => [u.id, u]));
    
    const commentsWithAuthor = comments.map(comment => {
      const author = userMap.get(comment.authorId);
      return {
        ...comment,
        author: author ? {
          id: author.id,
          name: author.username,
          department: author.department
        } : null
      };
    });
    res.json(commentsWithAuthor);
  });

  app.post("/api/posts/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const result = insertPostCommentSchema.safeParse({
      ...req.body,
      postId: req.params.id,
      authorId: req.user!.id
    });
    if (!result.success) return res.status(400).json({ error: result.error });
    
    try {
      const comment = await storage.createPostComment(result.data);
      const author = await storage.getUser(comment.authorId);
      res.status(201).json({
        ...comment,
        author: author ? {
          id: author.id,
          name: author.username,
          department: author.department
        } : null
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}
