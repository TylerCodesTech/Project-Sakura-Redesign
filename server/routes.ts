import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema, insertPageSchema, insertCommentSchema, insertNotificationSchema, insertExternalLinkSchema, insertDepartmentSchema, insertNewsSchema, insertStatSchema, systemSettingsDefaults, insertHelpdeskSchema, insertSlaStateSchema, insertSlaPolicySchema, insertDepartmentHierarchySchema, insertDepartmentManagerSchema, insertEscalationRuleSchema, insertEscalationConditionSchema, insertInboundEmailConfigSchema, insertTicketSchema, insertTicketCommentSchema } from "@shared/schema";
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

  app.get("/api/search", async (req, res) => {
    const query = req.query.q;
    if (typeof query !== "string") return res.status(400).send("Query required");
    
    const books = await storage.getBooks();
    const pages = await storage.getStandalonePages();
    const departments = await storage.getDepartments();
    
    const results = [
      ...books.filter(b => b.title.toLowerCase().includes(query.toLowerCase()))
        .map(b => ({ type: 'book', id: b.id, title: b.title, link: `/documents/book/${b.id}` })),
      ...pages.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
        .map(p => ({ type: 'page', id: p.id, title: p.title, link: `/documents/edit/${p.id}` })),
      ...departments.filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
        .map(d => ({ type: 'department', id: d.id, title: d.name, link: `/system-settings` }))
    ];
    
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

  return httpServer;
}
