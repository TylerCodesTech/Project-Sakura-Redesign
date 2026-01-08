import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema, insertPageSchema, insertCommentSchema, insertNotificationSchema, insertExternalLinkSchema, insertDepartmentSchema } from "@shared/schema";

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
    await storage.deleteDepartment(req.params.id);
    res.sendStatus(204);
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
    const book = await storage.createBook(result.data);
    res.json(book);
  });

  app.get("/api/books/:bookId/pages", async (req, res) => {
    const pages = await storage.getPages(req.params.bookId);
    res.json(pages);
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

  app.patch("/api/pages/:id", async (req, res) => {
    try {
      const existing = await storage.getPage(req.params.id);
      if (!existing) return res.status(404).send("Page not found");

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

  return httpServer;
}
