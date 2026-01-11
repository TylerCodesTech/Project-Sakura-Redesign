import { 
  type User, type InsertUser, 
  type Book, type InsertBook,
  type Page, type InsertPage,
  type Comment, type InsertComment,
  type Notification, type InsertNotification,
  type ExternalLink, type InsertExternalLink,
  type Department, type InsertDepartment,
  type News, type InsertNews,
  type Stat, type InsertStat,
  type SystemSetting, type InsertSystemSetting,
  type Helpdesk, type InsertHelpdesk,
  type SlaState, type InsertSlaState,
  type SlaPolicy, type InsertSlaPolicy,
  type DepartmentHierarchy, type InsertDepartmentHierarchy,
  type DepartmentManager, type InsertDepartmentManager,
  type EscalationRule, type InsertEscalationRule,
  type EscalationCondition, type InsertEscalationCondition,
  type InboundEmailConfig, type InsertInboundEmailConfig,
  type Ticket, type InsertTicket,
  type TicketComment, type InsertTicketComment,
  type HelpdeskWebhook, type InsertHelpdeskWebhook,
  type TicketFormField, type InsertTicketFormField,
  type Role, type InsertRole,
  type RolePermission, type InsertRolePermission,
  type UserRole, type InsertUserRole,
  type AuditLog, type InsertAuditLog,
  type DocumentActivity, type InsertDocumentActivity,
  type RoleWithUserCount, type RoleWithPermissions,
  AVAILABLE_PERMISSIONS,
  systemSettingsDefaults
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
  updateBook(id: string, update: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: string): Promise<void>;
  
  getPages(bookId: string): Promise<Page[]>;
  getPage(id: string): Promise<Page | undefined>;
  getPageByTitle(bookId: string, title: string): Promise<Page | undefined>;
  getStandalonePages(): Promise<Page[]>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, page: Partial<InsertPage>): Promise<Page>;
  deletePage(id: string): Promise<void>;

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
  
  // Watercooler
  getWatercoolerMessages(): Promise<Comment[]>;
  createWatercoolerMessage(message: InsertComment): Promise<Comment>;

  // System Settings
  getSystemSettings(): Promise<Record<string, string>>;
  getSystemSetting(key: string): Promise<string | undefined>;
  setSystemSetting(key: string, value: string, category?: string): Promise<SystemSetting>;
  setSystemSettings(settings: Record<string, string>): Promise<void>;

  // Helpdesk
  getHelpdesks(): Promise<Helpdesk[]>;
  getHelpdeskByDepartment(departmentId: string): Promise<Helpdesk | undefined>;
  createHelpdesk(helpdesk: InsertHelpdesk): Promise<Helpdesk>;
  updateHelpdesk(id: string, update: Partial<InsertHelpdesk>): Promise<Helpdesk>;
  deleteHelpdesk(id: string): Promise<void>;

  // SLA States
  getSlaStates(helpdeskId: string): Promise<SlaState[]>;
  createSlaState(state: InsertSlaState): Promise<SlaState>;
  updateSlaState(id: string, update: Partial<InsertSlaState>): Promise<SlaState>;
  deleteSlaState(id: string): Promise<void>;

  // SLA Policies
  getSlaPolicies(helpdeskId: string): Promise<SlaPolicy[]>;
  createSlaPolicy(policy: InsertSlaPolicy): Promise<SlaPolicy>;
  updateSlaPolicy(id: string, update: Partial<InsertSlaPolicy>): Promise<SlaPolicy>;
  deleteSlaPolicy(id: string): Promise<void>;

  // Department Hierarchy
  getDepartmentHierarchy(): Promise<DepartmentHierarchy[]>;
  getChildDepartments(parentId: string): Promise<DepartmentHierarchy[]>;
  createDepartmentHierarchy(hierarchy: InsertDepartmentHierarchy): Promise<DepartmentHierarchy>;
  deleteDepartmentHierarchy(id: string): Promise<void>;

  // Department Managers
  getDepartmentManagers(departmentId: string): Promise<DepartmentManager[]>;
  createDepartmentManager(manager: InsertDepartmentManager): Promise<DepartmentManager>;
  updateDepartmentManager(id: string, update: Partial<InsertDepartmentManager>): Promise<DepartmentManager>;
  deleteDepartmentManager(id: string): Promise<void>;

  // Escalation Rules
  getEscalationRules(helpdeskId: string): Promise<EscalationRule[]>;
  createEscalationRule(rule: InsertEscalationRule): Promise<EscalationRule>;
  updateEscalationRule(id: string, update: Partial<InsertEscalationRule>): Promise<EscalationRule>;
  deleteEscalationRule(id: string): Promise<void>;

  // Escalation Conditions
  getEscalationConditions(ruleId: string): Promise<EscalationCondition[]>;
  createEscalationCondition(condition: InsertEscalationCondition): Promise<EscalationCondition>;
  deleteEscalationCondition(id: string): Promise<void>;

  // Inbound Email Config
  getInboundEmailConfig(helpdeskId: string): Promise<InboundEmailConfig | undefined>;
  createInboundEmailConfig(config: InsertInboundEmailConfig): Promise<InboundEmailConfig>;
  updateInboundEmailConfig(id: string, update: Partial<InsertInboundEmailConfig>): Promise<InboundEmailConfig>;

  // Tickets
  getTickets(helpdeskId?: string): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, update: Partial<InsertTicket>): Promise<Ticket>;

  // Ticket Comments
  getTicketComments(ticketId: string): Promise<TicketComment[]>;
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;

  // Webhooks
  getWebhooks(helpdeskId: string): Promise<HelpdeskWebhook[]>;
  createWebhook(webhook: InsertHelpdeskWebhook): Promise<HelpdeskWebhook>;
  updateWebhook(id: string, update: Partial<InsertHelpdeskWebhook>): Promise<HelpdeskWebhook>;
  deleteWebhook(id: string): Promise<void>;

  // Ticket Form Fields
  getTicketFormFields(helpdeskId: string): Promise<TicketFormField[]>;
  createTicketFormField(field: InsertTicketFormField): Promise<TicketFormField>;
  updateTicketFormField(id: string, update: Partial<InsertTicketFormField>): Promise<TicketFormField>;
  deleteTicketFormField(id: string): Promise<void>;

  // Roles
  getRoles(): Promise<RoleWithUserCount[]>;
  getRole(id: string): Promise<Role | undefined>;
  getRoleWithPermissions(id: string): Promise<RoleWithPermissions | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, update: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: string): Promise<void>;

  // Role Permissions
  getRolePermissions(roleId: string): Promise<RolePermission[]>;
  setRolePermissions(roleId: string, permissions: string[]): Promise<RolePermission[]>;
  addRolePermission(permission: InsertRolePermission): Promise<RolePermission>;
  removeRolePermission(roleId: string, permission: string): Promise<void>;

  // User Roles
  getUserRoles(userId: string): Promise<UserRole[]>;
  getUsersWithRole(roleId: string): Promise<UserRole[]>;
  getUserRoleCount(roleId: string): Promise<number>;
  assignUserRole(assignment: InsertUserRole): Promise<UserRole>;
  removeUserRole(userId: string, roleId: string): Promise<void>;
  getUserPermissions(userId: string): Promise<string[]>;

  // Audit Logs
  getAuditLogs(limit?: number, offset?: number): Promise<AuditLog[]>;
  getAuditLogsByActor(actorId: string): Promise<AuditLog[]>;
  getAuditLogsByTarget(targetType: string, targetId: string): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogCount(): Promise<number>;

  // Document Activity
  getDocumentActivity(documentId: string): Promise<DocumentActivity[]>;
  createDocumentActivity(activity: InsertDocumentActivity): Promise<DocumentActivity>;
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
  private settings: Map<string, SystemSetting>;
  private helpdesks: Map<string, Helpdesk>;
  private slaStates: Map<string, SlaState>;
  private slaPolicies: Map<string, SlaPolicy>;
  private departmentHierarchy: Map<string, DepartmentHierarchy>;
  private departmentManagers: Map<string, DepartmentManager>;
  private escalationRules: Map<string, EscalationRule>;
  private escalationConditions: Map<string, EscalationCondition>;
  private inboundEmailConfigs: Map<string, InboundEmailConfig>;
  private tickets: Map<string, Ticket>;
  private ticketComments: Map<string, TicketComment>;
  private webhooks: Map<string, HelpdeskWebhook>;
  private ticketFormFields: Map<string, TicketFormField>;
  private roles: Map<string, Role>;
  private rolePermissions: Map<string, RolePermission>;
  private userRoles: Map<string, UserRole>;
  private auditLogs: Map<string, AuditLog>;
  private documentActivities: Map<string, DocumentActivity>;

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
    this.settings = new Map();
    this.helpdesks = new Map();
    this.slaStates = new Map();
    this.slaPolicies = new Map();
    this.departmentHierarchy = new Map();
    this.departmentManagers = new Map();
    this.escalationRules = new Map();
    this.escalationConditions = new Map();
    this.inboundEmailConfigs = new Map();
    this.tickets = new Map();
    this.ticketComments = new Map();
    this.webhooks = new Map();
    this.ticketFormFields = new Map();
    this.roles = new Map();
    this.rolePermissions = new Map();
    this.userRoles = new Map();
    this.auditLogs = new Map();
    this.documentActivities = new Map();

    // Initialize Super Admin role with all permissions
    const superAdminId = randomUUID();
    this.roles.set(superAdminId, {
      id: superAdminId,
      name: "Super Admin",
      description: "Full platform access with all permissions. This role cannot be modified or deleted.",
      color: "#dc2626",
      isSystem: "true",
      priority: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    // Add all permissions to Super Admin
    Object.keys(AVAILABLE_PERMISSIONS).forEach(permission => {
      const permId = randomUUID();
      this.rolePermissions.set(permId, {
        id: permId,
        roleId: superAdminId,
        permission,
        scopeType: null,
        scopeId: null,
        createdAt: new Date().toISOString(),
      });
    });

    // Initialize default system settings
    Object.entries(systemSettingsDefaults).forEach(([key, value]) => {
      const id = randomUUID();
      this.settings.set(key, {
        id,
        key,
        value,
        category: this.getSettingCategory(key),
        updatedAt: new Date().toISOString(),
      });
    });

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

  async updateBook(id: string, update: Partial<InsertBook>): Promise<Book> {
    const book = this.books.get(id);
    if (!book) throw new Error("Book not found");
    const updated = { ...book, ...update };
    this.books.set(id, updated);
    return updated;
  }

  async deleteBook(id: string): Promise<void> {
    for (const [pageId, page] of this.pages) {
      if (page.bookId === id) {
        this.pages.delete(pageId);
      }
    }
    this.books.delete(id);
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

  async deletePage(id: string): Promise<void> {
    for (const [commentId, comment] of this.comments) {
      if (comment.pageId === id) {
        this.comments.delete(commentId);
      }
    }
    this.pages.delete(id);
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
    const n: News = { 
      ...insertNews, 
      id, 
      category: insertNews.category ?? "General",
      createdAt: new Date().toISOString() 
    };
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

  async getWatercoolerMessages(): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(c => c.pageId === "watercooler")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async createWatercoolerMessage(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      pageId: "watercooler",
      createdAt: new Date().toISOString() 
    };
    this.comments.set(id, comment);
    return comment;
  }

  private getSettingCategory(key: string): string {
    if (key.startsWith('email') || key.startsWith('inApp')) return 'notifications';
    if (['companyName', 'logoUrl', 'faviconUrl', 'primaryColor', 'defaultTheme', 'allowUserThemeOverride'].includes(key)) return 'branding';
    if (['defaultTimezone', 'defaultLanguage', 'dateFormat', 'timeFormat'].includes(key)) return 'localization';
    return 'general';
  }

  async getSystemSettings(): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    this.settings.forEach((setting) => {
      result[setting.key] = setting.value;
    });
    return result;
  }

  async getSystemSetting(key: string): Promise<string | undefined> {
    return this.settings.get(key)?.value;
  }

  async setSystemSetting(key: string, value: string, category?: string): Promise<SystemSetting> {
    const existing = this.settings.get(key);
    const id = existing?.id || randomUUID();
    const setting: SystemSetting = {
      id,
      key,
      value,
      category: category || this.getSettingCategory(key),
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(key, setting);
    return setting;
  }

  async setSystemSettings(settings: Record<string, string>): Promise<void> {
    await Promise.all(
      Object.entries(settings).map(([key, value]) => this.setSystemSetting(key, value))
    );
  }

  // Helpdesk methods
  async getHelpdesks(): Promise<Helpdesk[]> {
    return Array.from(this.helpdesks.values());
  }

  async getHelpdeskByDepartment(departmentId: string): Promise<Helpdesk | undefined> {
    return Array.from(this.helpdesks.values()).find(h => h.departmentId === departmentId);
  }

  async createHelpdesk(insert: InsertHelpdesk): Promise<Helpdesk> {
    const id = randomUUID();
    const helpdesk: Helpdesk = {
      id,
      departmentId: insert.departmentId,
      name: insert.name,
      description: insert.description ?? null,
      enabled: insert.enabled ?? "true",
      publicAccess: insert.publicAccess ?? "false",
      createdAt: new Date().toISOString(),
    };
    this.helpdesks.set(id, helpdesk);
    
    // Create default SLA states for this helpdesk
    const defaultStates = [
      { name: "Open", color: "#3b82f6", order: 0, isDefault: "true", isFinal: "false" },
      { name: "In Progress", color: "#f59e0b", order: 1, isDefault: "false", isFinal: "false" },
      { name: "Pending", color: "#8b5cf6", order: 2, isDefault: "false", isFinal: "false" },
      { name: "Resolved", color: "#10b981", order: 3, isDefault: "false", isFinal: "true" },
      { name: "Closed", color: "#6b7280", order: 4, isDefault: "false", isFinal: "true" },
    ];
    for (const state of defaultStates) {
      await this.createSlaState({ ...state, helpdeskId: id });
    }
    
    return helpdesk;
  }

  async updateHelpdesk(id: string, update: Partial<InsertHelpdesk>): Promise<Helpdesk> {
    const existing = this.helpdesks.get(id);
    if (!existing) throw new Error("Helpdesk not found");
    const updated = { ...existing, ...update };
    this.helpdesks.set(id, updated);
    return updated;
  }

  async deleteHelpdesk(id: string): Promise<void> {
    this.helpdesks.delete(id);
  }

  // SLA State methods
  async getSlaStates(helpdeskId: string): Promise<SlaState[]> {
    return Array.from(this.slaStates.values())
      .filter(s => s.helpdeskId === helpdeskId)
      .sort((a, b) => a.order - b.order);
  }

  async createSlaState(insert: InsertSlaState): Promise<SlaState> {
    const id = randomUUID();
    const state: SlaState = {
      id,
      helpdeskId: insert.helpdeskId,
      name: insert.name,
      description: insert.description ?? null,
      color: insert.color ?? "#3b82f6",
      order: insert.order ?? 0,
      isFinal: insert.isFinal ?? "false",
      isDefault: insert.isDefault ?? "false",
      targetHours: insert.targetHours ?? null,
      createdAt: new Date().toISOString(),
    };
    this.slaStates.set(id, state);
    return state;
  }

  async updateSlaState(id: string, update: Partial<InsertSlaState>): Promise<SlaState> {
    const existing = this.slaStates.get(id);
    if (!existing) throw new Error("SLA State not found");
    const updated = { ...existing, ...update };
    this.slaStates.set(id, updated);
    return updated;
  }

  async deleteSlaState(id: string): Promise<void> {
    this.slaStates.delete(id);
  }

  // SLA Policy methods
  async getSlaPolicies(helpdeskId: string): Promise<SlaPolicy[]> {
    return Array.from(this.slaPolicies.values()).filter(p => p.helpdeskId === helpdeskId);
  }

  async createSlaPolicy(insert: InsertSlaPolicy): Promise<SlaPolicy> {
    const id = randomUUID();
    const policy: SlaPolicy = {
      id,
      helpdeskId: insert.helpdeskId,
      name: insert.name,
      description: insert.description ?? null,
      priority: insert.priority ?? "medium",
      firstResponseHours: insert.firstResponseHours ?? null,
      resolutionHours: insert.resolutionHours ?? null,
      enabled: insert.enabled ?? "true",
      createdAt: new Date().toISOString(),
    };
    this.slaPolicies.set(id, policy);
    return policy;
  }

  async updateSlaPolicy(id: string, update: Partial<InsertSlaPolicy>): Promise<SlaPolicy> {
    const existing = this.slaPolicies.get(id);
    if (!existing) throw new Error("SLA Policy not found");
    const updated = { ...existing, ...update };
    this.slaPolicies.set(id, updated);
    return updated;
  }

  async deleteSlaPolicy(id: string): Promise<void> {
    this.slaPolicies.delete(id);
  }

  // Department Hierarchy methods
  async getDepartmentHierarchy(): Promise<DepartmentHierarchy[]> {
    return Array.from(this.departmentHierarchy.values());
  }

  async getChildDepartments(parentId: string): Promise<DepartmentHierarchy[]> {
    return Array.from(this.departmentHierarchy.values()).filter(h => h.parentDepartmentId === parentId);
  }

  async createDepartmentHierarchy(insert: InsertDepartmentHierarchy): Promise<DepartmentHierarchy> {
    const id = randomUUID();
    const hierarchy: DepartmentHierarchy = {
      id,
      parentDepartmentId: insert.parentDepartmentId ?? null,
      childDepartmentId: insert.childDepartmentId,
      hierarchyType: insert.hierarchyType ?? "subdivision",
      createdAt: new Date().toISOString(),
    };
    this.departmentHierarchy.set(id, hierarchy);
    return hierarchy;
  }

  async deleteDepartmentHierarchy(id: string): Promise<void> {
    this.departmentHierarchy.delete(id);
  }

  // Department Manager methods
  async getDepartmentManagers(departmentId: string): Promise<DepartmentManager[]> {
    return Array.from(this.departmentManagers.values()).filter(m => m.departmentId === departmentId);
  }

  async createDepartmentManager(insert: InsertDepartmentManager): Promise<DepartmentManager> {
    const id = randomUUID();
    const manager: DepartmentManager = {
      id,
      departmentId: insert.departmentId,
      userId: insert.userId,
      role: insert.role ?? "manager",
      isPrimary: insert.isPrimary ?? "false",
      createdAt: new Date().toISOString(),
    };
    this.departmentManagers.set(id, manager);
    return manager;
  }

  async updateDepartmentManager(id: string, update: Partial<InsertDepartmentManager>): Promise<DepartmentManager> {
    const existing = this.departmentManagers.get(id);
    if (!existing) throw new Error("Department Manager not found");
    const updated = { ...existing, ...update };
    this.departmentManagers.set(id, updated);
    return updated;
  }

  async deleteDepartmentManager(id: string): Promise<void> {
    this.departmentManagers.delete(id);
  }

  // Escalation Rule methods
  async getEscalationRules(helpdeskId: string): Promise<EscalationRule[]> {
    return Array.from(this.escalationRules.values())
      .filter(r => r.helpdeskId === helpdeskId)
      .sort((a, b) => a.order - b.order);
  }

  async createEscalationRule(insert: InsertEscalationRule): Promise<EscalationRule> {
    const id = randomUUID();
    const rule: EscalationRule = {
      id,
      helpdeskId: insert.helpdeskId,
      name: insert.name,
      description: insert.description ?? null,
      triggerType: insert.triggerType ?? "time_based",
      triggerHours: insert.triggerHours ?? null,
      priority: insert.priority ?? null,
      ticketType: insert.ticketType ?? null,
      fromStateId: insert.fromStateId ?? null,
      targetDepartmentId: insert.targetDepartmentId ?? null,
      targetUserId: insert.targetUserId ?? null,
      notifyManagers: insert.notifyManagers ?? "true",
      enabled: insert.enabled ?? "true",
      order: insert.order ?? 0,
      createdAt: new Date().toISOString(),
    };
    this.escalationRules.set(id, rule);
    return rule;
  }

  async updateEscalationRule(id: string, update: Partial<InsertEscalationRule>): Promise<EscalationRule> {
    const existing = this.escalationRules.get(id);
    if (!existing) throw new Error("Escalation Rule not found");
    const updated = { ...existing, ...update };
    this.escalationRules.set(id, updated);
    return updated;
  }

  async deleteEscalationRule(id: string): Promise<void> {
    this.escalationRules.delete(id);
  }

  // Escalation Condition methods
  async getEscalationConditions(ruleId: string): Promise<EscalationCondition[]> {
    return Array.from(this.escalationConditions.values()).filter(c => c.ruleId === ruleId);
  }

  async createEscalationCondition(insert: InsertEscalationCondition): Promise<EscalationCondition> {
    const id = randomUUID();
    const condition: EscalationCondition = {
      id,
      ruleId: insert.ruleId,
      field: insert.field,
      operator: insert.operator,
      value: insert.value,
      logicOperator: insert.logicOperator ?? "and",
    };
    this.escalationConditions.set(id, condition);
    return condition;
  }

  async deleteEscalationCondition(id: string): Promise<void> {
    this.escalationConditions.delete(id);
  }

  // Inbound Email Config methods
  async getInboundEmailConfig(helpdeskId: string): Promise<InboundEmailConfig | undefined> {
    return Array.from(this.inboundEmailConfigs.values()).find(c => c.helpdeskId === helpdeskId);
  }

  async createInboundEmailConfig(insert: InsertInboundEmailConfig): Promise<InboundEmailConfig> {
    const id = randomUUID();
    const config: InboundEmailConfig = {
      id,
      helpdeskId: insert.helpdeskId,
      emailAddress: insert.emailAddress ?? null,
      provider: insert.provider ?? "custom",
      enabled: insert.enabled ?? "false",
      autoCreateTickets: insert.autoCreateTickets ?? "true",
      defaultPriority: insert.defaultPriority ?? "medium",
      createdAt: new Date().toISOString(),
    };
    this.inboundEmailConfigs.set(id, config);
    return config;
  }

  async updateInboundEmailConfig(id: string, update: Partial<InsertInboundEmailConfig>): Promise<InboundEmailConfig> {
    const existing = this.inboundEmailConfigs.get(id);
    if (!existing) throw new Error("Inbound Email Config not found");
    const updated = { ...existing, ...update };
    this.inboundEmailConfigs.set(id, updated);
    return updated;
  }

  // Ticket methods
  async getTickets(helpdeskId?: string): Promise<Ticket[]> {
    const all = Array.from(this.tickets.values());
    if (helpdeskId) {
      return all.filter(t => t.helpdeskId === helpdeskId);
    }
    return all;
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async createTicket(insert: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const ticket: Ticket = {
      id,
      helpdeskId: insert.helpdeskId,
      title: insert.title,
      description: insert.description ?? null,
      priority: insert.priority ?? "medium",
      stateId: insert.stateId ?? null,
      assignedTo: insert.assignedTo ?? null,
      createdBy: insert.createdBy,
      departmentId: insert.departmentId ?? null,
      ticketType: insert.ticketType ?? "request",
      source: insert.source ?? "web",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: string, update: Partial<InsertTicket>): Promise<Ticket> {
    const existing = this.tickets.get(id);
    if (!existing) throw new Error("Ticket not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.tickets.set(id, updated);
    return updated;
  }

  // Ticket Comment methods
  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    return Array.from(this.ticketComments.values())
      .filter(c => c.ticketId === ticketId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async createTicketComment(insert: InsertTicketComment): Promise<TicketComment> {
    const id = randomUUID();
    const comment: TicketComment = {
      id,
      ticketId: insert.ticketId,
      userId: insert.userId ?? null,
      content: insert.content,
      isInternal: insert.isInternal ?? "false",
      source: insert.source ?? "web",
      emailMessageId: insert.emailMessageId ?? null,
      createdAt: new Date().toISOString(),
    };
    this.ticketComments.set(id, comment);
    return comment;
  }

  // Webhook methods
  async getWebhooks(helpdeskId: string): Promise<HelpdeskWebhook[]> {
    return Array.from(this.webhooks.values()).filter(w => w.helpdeskId === helpdeskId);
  }

  async createWebhook(insert: InsertHelpdeskWebhook): Promise<HelpdeskWebhook> {
    const id = randomUUID();
    const webhook: HelpdeskWebhook = {
      id,
      helpdeskId: insert.helpdeskId,
      name: insert.name,
      url: insert.url,
      secret: insert.secret ?? null,
      events: insert.events ?? "ticket.created,ticket.updated",
      enabled: insert.enabled ?? "true",
      retryCount: insert.retryCount ?? 3,
      timeoutSeconds: insert.timeoutSeconds ?? 30,
      lastTriggeredAt: null,
      createdAt: new Date().toISOString(),
    };
    this.webhooks.set(id, webhook);
    return webhook;
  }

  async updateWebhook(id: string, update: Partial<InsertHelpdeskWebhook>): Promise<HelpdeskWebhook> {
    const existing = this.webhooks.get(id);
    if (!existing) throw new Error("Webhook not found");
    const updated = { ...existing, ...update };
    this.webhooks.set(id, updated);
    return updated;
  }

  async deleteWebhook(id: string): Promise<void> {
    this.webhooks.delete(id);
  }

  // Ticket Form Field methods
  async getTicketFormFields(helpdeskId: string): Promise<TicketFormField[]> {
    return Array.from(this.ticketFormFields.values())
      .filter(f => f.helpdeskId === helpdeskId)
      .sort((a, b) => a.order - b.order);
  }

  async createTicketFormField(insert: InsertTicketFormField): Promise<TicketFormField> {
    const id = randomUUID();
    const field: TicketFormField = {
      id,
      helpdeskId: insert.helpdeskId,
      name: insert.name,
      label: insert.label,
      fieldType: insert.fieldType ?? "text",
      placeholder: insert.placeholder ?? null,
      helpText: insert.helpText ?? null,
      required: insert.required ?? "false",
      options: insert.options ?? null,
      defaultValue: insert.defaultValue ?? null,
      order: insert.order ?? 0,
      enabled: insert.enabled ?? "true",
      showOnCreate: insert.showOnCreate ?? "true",
      showOnEdit: insert.showOnEdit ?? "true",
      createdAt: new Date().toISOString(),
    };
    this.ticketFormFields.set(id, field);
    return field;
  }

  async updateTicketFormField(id: string, update: Partial<InsertTicketFormField>): Promise<TicketFormField> {
    const existing = this.ticketFormFields.get(id);
    if (!existing) throw new Error("Ticket form field not found");
    const updated = { ...existing, ...update };
    this.ticketFormFields.set(id, updated);
    return updated;
  }

  async deleteTicketFormField(id: string): Promise<void> {
    this.ticketFormFields.delete(id);
  }

  // Role methods
  async getRoles(): Promise<RoleWithUserCount[]> {
    const rolesArray = Array.from(this.roles.values());
    return rolesArray.map(role => ({
      ...role,
      userCount: Array.from(this.userRoles.values()).filter(ur => ur.roleId === role.id).length
    })).sort((a, b) => b.priority - a.priority);
  }

  async getRole(id: string): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async getRoleWithPermissions(id: string): Promise<RoleWithPermissions | undefined> {
    const role = this.roles.get(id);
    if (!role) return undefined;
    const permissions = Array.from(this.rolePermissions.values()).filter(rp => rp.roleId === id);
    return { ...role, permissions };
  }

  async createRole(insert: InsertRole): Promise<Role> {
    const id = randomUUID();
    const role: Role = {
      id,
      name: insert.name,
      description: insert.description ?? null,
      color: insert.color ?? "#6366f1",
      isSystem: insert.isSystem ?? "false",
      priority: insert.priority ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: string, update: Partial<InsertRole>): Promise<Role> {
    const existing = this.roles.get(id);
    if (!existing) throw new Error("Role not found");
    if (existing.isSystem === "true") throw new Error("Cannot modify system roles");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.roles.set(id, updated);
    return updated;
  }

  async deleteRole(id: string): Promise<void> {
    const existing = this.roles.get(id);
    if (existing?.isSystem === "true") throw new Error("Cannot delete system roles");
    this.roles.delete(id);
    // Also delete associated permissions and user assignments
    Array.from(this.rolePermissions.values())
      .filter(rp => rp.roleId === id)
      .forEach(rp => this.rolePermissions.delete(rp.id));
    Array.from(this.userRoles.values())
      .filter(ur => ur.roleId === id)
      .forEach(ur => this.userRoles.delete(ur.id));
  }

  // Role Permission methods
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return Array.from(this.rolePermissions.values()).filter(rp => rp.roleId === roleId);
  }

  async setRolePermissions(roleId: string, permissions: string[]): Promise<RolePermission[]> {
    // Delete existing permissions for this role
    Array.from(this.rolePermissions.values())
      .filter(rp => rp.roleId === roleId)
      .forEach(rp => this.rolePermissions.delete(rp.id));
    
    // Add new permissions
    const newPermissions: RolePermission[] = [];
    for (const permission of permissions) {
      const id = randomUUID();
      const rp: RolePermission = {
        id,
        roleId,
        permission,
        scopeType: null,
        scopeId: null,
        createdAt: new Date().toISOString(),
      };
      this.rolePermissions.set(id, rp);
      newPermissions.push(rp);
    }
    return newPermissions;
  }

  async addRolePermission(insert: InsertRolePermission): Promise<RolePermission> {
    const id = randomUUID();
    const rp: RolePermission = {
      id,
      roleId: insert.roleId,
      permission: insert.permission,
      scopeType: insert.scopeType ?? null,
      scopeId: insert.scopeId ?? null,
      createdAt: new Date().toISOString(),
    };
    this.rolePermissions.set(id, rp);
    return rp;
  }

  async removeRolePermission(roleId: string, permission: string): Promise<void> {
    const toDelete = Array.from(this.rolePermissions.values())
      .find(rp => rp.roleId === roleId && rp.permission === permission);
    if (toDelete) {
      this.rolePermissions.delete(toDelete.id);
    }
  }

  // User Role methods
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return Array.from(this.userRoles.values()).filter(ur => ur.userId === userId);
  }

  async getUsersWithRole(roleId: string): Promise<UserRole[]> {
    return Array.from(this.userRoles.values()).filter(ur => ur.roleId === roleId);
  }

  async getUserRoleCount(roleId: string): Promise<number> {
    return Array.from(this.userRoles.values()).filter(ur => ur.roleId === roleId).length;
  }

  async assignUserRole(insert: InsertUserRole): Promise<UserRole> {
    // Check if already assigned
    const existing = Array.from(this.userRoles.values())
      .find(ur => ur.userId === insert.userId && ur.roleId === insert.roleId);
    if (existing) return existing;

    const id = randomUUID();
    const ur: UserRole = {
      id,
      userId: insert.userId,
      roleId: insert.roleId,
      assignedBy: insert.assignedBy ?? null,
      assignedAt: new Date().toISOString(),
    };
    this.userRoles.set(id, ur);
    return ur;
  }

  async removeUserRole(userId: string, roleId: string): Promise<void> {
    const toDelete = Array.from(this.userRoles.values())
      .find(ur => ur.userId === userId && ur.roleId === roleId);
    if (toDelete) {
      this.userRoles.delete(toDelete.id);
    }
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRolesList = await this.getUserRoles(userId);
    const permissions = new Set<string>();
    for (const ur of userRolesList) {
      const rolePerms = await this.getRolePermissions(ur.roleId);
      rolePerms.forEach(rp => permissions.add(rp.permission));
    }
    return Array.from(permissions);
  }

  // Audit Log methods
  async getAuditLogs(limit = 100, offset = 0): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(offset, offset + limit);
  }

  async getAuditLogsByActor(actorId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.actorId === actorId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getAuditLogsByTarget(targetType: string, targetId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.targetType === targetType && log.targetId === targetId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createAuditLog(insert: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = {
      id,
      actorId: insert.actorId ?? null,
      actorName: insert.actorName ?? null,
      actionType: insert.actionType,
      targetType: insert.targetType,
      targetId: insert.targetId ?? null,
      targetName: insert.targetName ?? null,
      description: insert.description,
      metadata: insert.metadata ?? null,
      ipAddress: insert.ipAddress ?? null,
      userAgent: insert.userAgent ?? null,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogCount(): Promise<number> {
    return this.auditLogs.size;
  }

  async getDocumentActivity(documentId: string): Promise<DocumentActivity[]> {
    return Array.from(this.documentActivities.values())
      .filter(activity => activity.documentId === documentId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createDocumentActivity(insert: InsertDocumentActivity): Promise<DocumentActivity> {
    const id = randomUUID();
    const activity: DocumentActivity = {
      id,
      documentId: insert.documentId,
      documentType: insert.documentType,
      action: insert.action,
      userId: insert.userId,
      details: insert.details ?? null,
      createdAt: new Date().toISOString(),
    };
    this.documentActivities.set(id, activity);
    return activity;
  }
}

import { DatabaseStorage } from "./dbStorage";

const useDatabase = !!process.env.DATABASE_URL;

export const storage: IStorage = useDatabase ? new DatabaseStorage() : new MemStorage();
