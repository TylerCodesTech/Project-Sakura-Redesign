import { db } from "./db";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";
import {
  users, books, pages, comments, notifications, externalLinks, departments, news, stats, systemSettings,
  helpdesks, slaStates, slaPolicies, departmentHierarchy, departmentManagers, escalationRules, 
  escalationConditions, inboundEmailConfigs, tickets, ticketComments, helpdeskWebhooks, ticketFormFields,
  roles, rolePermissions, userRoles, auditLogs,
  type User, type InsertUser, type Book, type InsertBook, type Page, type InsertPage,
  type Comment, type InsertComment, type Notification, type InsertNotification,
  type ExternalLink, type InsertExternalLink, type Department, type InsertDepartment,
  type News, type InsertNews, type Stat, type InsertStat, type SystemSetting,
  type Helpdesk, type InsertHelpdesk, type SlaState, type InsertSlaState,
  type SlaPolicy, type InsertSlaPolicy, type DepartmentHierarchy, type InsertDepartmentHierarchy,
  type DepartmentManager, type InsertDepartmentManager, type EscalationRule, type InsertEscalationRule,
  type EscalationCondition, type InsertEscalationCondition, type InboundEmailConfig, type InsertInboundEmailConfig,
  type Ticket, type InsertTicket, type TicketComment, type InsertTicketComment,
  type HelpdeskWebhook, type InsertHelpdeskWebhook, type TicketFormField, type InsertTicketFormField,
  type Role, type InsertRole, type RolePermission, type InsertRolePermission,
  type UserRole, type InsertUserRole, type AuditLog, type InsertAuditLog,
  type RoleWithUserCount, type RoleWithPermissions,
  systemSettingsDefaults
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsersByDepartment(department: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.department, department));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({ ...insertUser, department: insertUser.department ?? "General" }).returning();
    return user;
  }

  async getBooks(): Promise<Book[]> {
    return db.select().from(books);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const [book] = await db.insert(books).values(insertBook).returning();
    return book;
  }

  async deleteBook(id: string): Promise<void> {
    await db.delete(pages).where(eq(pages.bookId, id));
    await db.delete(books).where(eq(books.id, id));
  }

  async getPages(bookId: string): Promise<Page[]> {
    return db.select().from(pages).where(eq(pages.bookId, bookId));
  }

  async getPage(id: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async getPageByTitle(bookId: string, title: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(and(eq(pages.bookId, bookId), eq(pages.title, title)));
    return page;
  }

  async getStandalonePages(): Promise<Page[]> {
    const result = await db.select().from(pages);
    return result.filter(p => !p.bookId);
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const [page] = await db.insert(pages).values(insertPage).returning();
    return page;
  }

  async updatePage(id: string, update: Partial<InsertPage>): Promise<Page> {
    const [page] = await db.update(pages).set(update).where(eq(pages.id, id)).returning();
    if (!page) throw new Error("Page not found");
    return page;
  }

  async deletePage(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.pageId, id));
    await db.delete(pages).where(eq(pages.id, id));
  }

  async getComments(pageId: string): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.pageId, pageId));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const [notification] = await db.update(notifications).set({ read: "true" }).where(eq(notifications.id, id)).returning();
    if (!notification) throw new Error("Notification not found");
    return notification;
  }

  async getExternalLinks(): Promise<ExternalLink[]> {
    return db.select().from(externalLinks).orderBy(asc(externalLinks.order));
  }

  async createExternalLink(insertLink: InsertExternalLink): Promise<ExternalLink> {
    const [link] = await db.insert(externalLinks).values(insertLink).returning();
    return link;
  }

  async deleteExternalLink(id: string): Promise<void> {
    await db.delete(externalLinks).where(eq(externalLinks.id, id));
  }

  async updateExternalLink(id: string, update: Partial<InsertExternalLink>): Promise<ExternalLink> {
    const [link] = await db.update(externalLinks).set(update).where(eq(externalLinks.id, id)).returning();
    if (!link) throw new Error("External link not found");
    return link;
  }

  async getDepartments(): Promise<Department[]> {
    return db.select().from(departments);
  }

  async createDepartment(insertDept: InsertDepartment): Promise<Department> {
    const [dept] = await db.insert(departments).values(insertDept).returning();
    return dept;
  }

  async updateDepartment(id: string, update: Partial<InsertDepartment>): Promise<Department> {
    const [dept] = await db.update(departments).set(update).where(eq(departments.id, id)).returning();
    if (!dept) throw new Error("Department not found");
    return dept;
  }

  async deleteDepartment(id: string): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  async getNews(): Promise<News[]> {
    return db.select().from(news).orderBy(desc(news.createdAt));
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const [n] = await db.insert(news).values(insertNews).returning();
    return n;
  }

  async getStats(): Promise<Stat[]> {
    return db.select().from(stats);
  }

  async updateStat(key: string, update: Partial<InsertStat>): Promise<Stat> {
    const [stat] = await db.update(stats).set({ ...update, updatedAt: new Date().toISOString() }).where(eq(stats.key, key)).returning();
    if (!stat) throw new Error("Stat not found");
    return stat;
  }

  async getWatercoolerMessages(): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.pageId, "watercooler")).orderBy(asc(comments.createdAt));
  }

  async createWatercoolerMessage(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values({ ...insertComment, pageId: "watercooler" }).returning();
    return comment;
  }

  private getSettingCategory(key: string): string {
    if (key.startsWith('email') || key.startsWith('inApp')) return 'notifications';
    if (['companyName', 'logoUrl', 'faviconUrl', 'primaryColor', 'defaultTheme', 'allowUserThemeOverride'].includes(key)) return 'branding';
    if (['defaultTimezone', 'defaultLanguage', 'dateFormat', 'timeFormat'].includes(key)) return 'localization';
    return 'general';
  }

  async getSystemSettings(): Promise<Record<string, string>> {
    const result: Record<string, string> = { ...systemSettingsDefaults };
    const dbSettings = await db.select().from(systemSettings);
    dbSettings.forEach((setting) => {
      result[setting.key] = setting.value;
    });
    return result;
  }

  async getSystemSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting?.value ?? systemSettingsDefaults[key as keyof typeof systemSettingsDefaults];
  }

  async setSystemSetting(key: string, value: string, category?: string): Promise<SystemSetting> {
    const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    if (existing.length > 0) {
      const [updated] = await db.update(systemSettings)
        .set({ value, updatedAt: new Date().toISOString() })
        .where(eq(systemSettings.key, key))
        .returning();
      return updated;
    }
    const [setting] = await db.insert(systemSettings).values({
      key,
      value,
      category: category || this.getSettingCategory(key),
    }).returning();
    return setting;
  }

  async setSystemSettings(settings: Record<string, string>): Promise<void> {
    await Promise.all(
      Object.entries(settings).map(([key, value]) => this.setSystemSetting(key, value))
    );
  }

  // Helpdesk methods
  async getHelpdesks(): Promise<Helpdesk[]> {
    return db.select().from(helpdesks);
  }

  async getHelpdeskByDepartment(departmentId: string): Promise<Helpdesk | undefined> {
    const [helpdesk] = await db.select().from(helpdesks).where(eq(helpdesks.departmentId, departmentId));
    return helpdesk;
  }

  async createHelpdesk(insert: InsertHelpdesk): Promise<Helpdesk> {
    const [helpdesk] = await db.insert(helpdesks).values(insert).returning();
    
    const defaultStates = [
      { name: "Open", color: "#3b82f6", order: 0, isDefault: "true", isFinal: "false" },
      { name: "In Progress", color: "#f59e0b", order: 1, isDefault: "false", isFinal: "false" },
      { name: "Pending", color: "#8b5cf6", order: 2, isDefault: "false", isFinal: "false" },
      { name: "Resolved", color: "#10b981", order: 3, isDefault: "false", isFinal: "true" },
      { name: "Closed", color: "#6b7280", order: 4, isDefault: "false", isFinal: "true" },
    ];
    for (const state of defaultStates) {
      await this.createSlaState({ ...state, helpdeskId: helpdesk.id });
    }
    
    return helpdesk;
  }

  async updateHelpdesk(id: string, update: Partial<InsertHelpdesk>): Promise<Helpdesk> {
    const [helpdesk] = await db.update(helpdesks).set(update).where(eq(helpdesks.id, id)).returning();
    if (!helpdesk) throw new Error("Helpdesk not found");
    return helpdesk;
  }

  async deleteHelpdesk(id: string): Promise<void> {
    await db.delete(helpdesks).where(eq(helpdesks.id, id));
  }

  // SLA State methods
  async getSlaStates(helpdeskId: string): Promise<SlaState[]> {
    return db.select().from(slaStates).where(eq(slaStates.helpdeskId, helpdeskId)).orderBy(asc(slaStates.order));
  }

  async createSlaState(insert: InsertSlaState): Promise<SlaState> {
    const [state] = await db.insert(slaStates).values(insert).returning();
    return state;
  }

  async updateSlaState(id: string, update: Partial<InsertSlaState>): Promise<SlaState> {
    const [state] = await db.update(slaStates).set(update).where(eq(slaStates.id, id)).returning();
    if (!state) throw new Error("SLA State not found");
    return state;
  }

  async deleteSlaState(id: string): Promise<void> {
    await db.delete(slaStates).where(eq(slaStates.id, id));
  }

  // SLA Policy methods
  async getSlaPolicies(helpdeskId: string): Promise<SlaPolicy[]> {
    return db.select().from(slaPolicies).where(eq(slaPolicies.helpdeskId, helpdeskId));
  }

  async createSlaPolicy(insert: InsertSlaPolicy): Promise<SlaPolicy> {
    const [policy] = await db.insert(slaPolicies).values(insert).returning();
    return policy;
  }

  async updateSlaPolicy(id: string, update: Partial<InsertSlaPolicy>): Promise<SlaPolicy> {
    const [policy] = await db.update(slaPolicies).set(update).where(eq(slaPolicies.id, id)).returning();
    if (!policy) throw new Error("SLA Policy not found");
    return policy;
  }

  async deleteSlaPolicy(id: string): Promise<void> {
    await db.delete(slaPolicies).where(eq(slaPolicies.id, id));
  }

  // Department Hierarchy methods
  async getDepartmentHierarchy(): Promise<DepartmentHierarchy[]> {
    return db.select().from(departmentHierarchy);
  }

  async getChildDepartments(parentId: string): Promise<DepartmentHierarchy[]> {
    return db.select().from(departmentHierarchy).where(eq(departmentHierarchy.parentDepartmentId, parentId));
  }

  async createDepartmentHierarchy(insert: InsertDepartmentHierarchy): Promise<DepartmentHierarchy> {
    const [hierarchy] = await db.insert(departmentHierarchy).values(insert).returning();
    return hierarchy;
  }

  async deleteDepartmentHierarchy(id: string): Promise<void> {
    await db.delete(departmentHierarchy).where(eq(departmentHierarchy.id, id));
  }

  // Department Manager methods
  async getDepartmentManagers(departmentId: string): Promise<DepartmentManager[]> {
    return db.select().from(departmentManagers).where(eq(departmentManagers.departmentId, departmentId));
  }

  async createDepartmentManager(insert: InsertDepartmentManager): Promise<DepartmentManager> {
    const [manager] = await db.insert(departmentManagers).values(insert).returning();
    return manager;
  }

  async updateDepartmentManager(id: string, update: Partial<InsertDepartmentManager>): Promise<DepartmentManager> {
    const [manager] = await db.update(departmentManagers).set(update).where(eq(departmentManagers.id, id)).returning();
    if (!manager) throw new Error("Department Manager not found");
    return manager;
  }

  async deleteDepartmentManager(id: string): Promise<void> {
    await db.delete(departmentManagers).where(eq(departmentManagers.id, id));
  }

  // Escalation Rule methods
  async getEscalationRules(helpdeskId: string): Promise<EscalationRule[]> {
    return db.select().from(escalationRules).where(eq(escalationRules.helpdeskId, helpdeskId)).orderBy(asc(escalationRules.order));
  }

  async createEscalationRule(insert: InsertEscalationRule): Promise<EscalationRule> {
    const [rule] = await db.insert(escalationRules).values(insert).returning();
    return rule;
  }

  async updateEscalationRule(id: string, update: Partial<InsertEscalationRule>): Promise<EscalationRule> {
    const [rule] = await db.update(escalationRules).set(update).where(eq(escalationRules.id, id)).returning();
    if (!rule) throw new Error("Escalation Rule not found");
    return rule;
  }

  async deleteEscalationRule(id: string): Promise<void> {
    await db.delete(escalationRules).where(eq(escalationRules.id, id));
  }

  // Escalation Condition methods
  async getEscalationConditions(ruleId: string): Promise<EscalationCondition[]> {
    return db.select().from(escalationConditions).where(eq(escalationConditions.ruleId, ruleId));
  }

  async createEscalationCondition(insert: InsertEscalationCondition): Promise<EscalationCondition> {
    const [condition] = await db.insert(escalationConditions).values(insert).returning();
    return condition;
  }

  async deleteEscalationCondition(id: string): Promise<void> {
    await db.delete(escalationConditions).where(eq(escalationConditions.id, id));
  }

  // Inbound Email Config methods
  async getInboundEmailConfig(helpdeskId: string): Promise<InboundEmailConfig | undefined> {
    const [config] = await db.select().from(inboundEmailConfigs).where(eq(inboundEmailConfigs.helpdeskId, helpdeskId));
    return config;
  }

  async createInboundEmailConfig(insert: InsertInboundEmailConfig): Promise<InboundEmailConfig> {
    const [config] = await db.insert(inboundEmailConfigs).values(insert).returning();
    return config;
  }

  async updateInboundEmailConfig(id: string, update: Partial<InsertInboundEmailConfig>): Promise<InboundEmailConfig> {
    const [config] = await db.update(inboundEmailConfigs).set(update).where(eq(inboundEmailConfigs.id, id)).returning();
    if (!config) throw new Error("Inbound Email Config not found");
    return config;
  }

  // Ticket methods
  async getTickets(helpdeskId?: string): Promise<Ticket[]> {
    if (helpdeskId) {
      return db.select().from(tickets).where(eq(tickets.helpdeskId, helpdeskId));
    }
    return db.select().from(tickets);
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async createTicket(insert: InsertTicket): Promise<Ticket> {
    const [ticket] = await db.insert(tickets).values(insert).returning();
    return ticket;
  }

  async updateTicket(id: string, update: Partial<InsertTicket>): Promise<Ticket> {
    const [ticket] = await db.update(tickets).set({ ...update, updatedAt: new Date().toISOString() }).where(eq(tickets.id, id)).returning();
    if (!ticket) throw new Error("Ticket not found");
    return ticket;
  }

  // Ticket Comment methods
  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    return db.select().from(ticketComments).where(eq(ticketComments.ticketId, ticketId)).orderBy(asc(ticketComments.createdAt));
  }

  async createTicketComment(insert: InsertTicketComment): Promise<TicketComment> {
    const [comment] = await db.insert(ticketComments).values(insert).returning();
    return comment;
  }

  // Webhook methods
  async getWebhooks(helpdeskId: string): Promise<HelpdeskWebhook[]> {
    return db.select().from(helpdeskWebhooks).where(eq(helpdeskWebhooks.helpdeskId, helpdeskId));
  }

  async createWebhook(insert: InsertHelpdeskWebhook): Promise<HelpdeskWebhook> {
    const [webhook] = await db.insert(helpdeskWebhooks).values(insert).returning();
    return webhook;
  }

  async updateWebhook(id: string, update: Partial<InsertHelpdeskWebhook>): Promise<HelpdeskWebhook> {
    const [webhook] = await db.update(helpdeskWebhooks).set(update).where(eq(helpdeskWebhooks.id, id)).returning();
    if (!webhook) throw new Error("Webhook not found");
    return webhook;
  }

  async deleteWebhook(id: string): Promise<void> {
    await db.delete(helpdeskWebhooks).where(eq(helpdeskWebhooks.id, id));
  }

  // Ticket Form Field methods
  async getTicketFormFields(helpdeskId: string): Promise<TicketFormField[]> {
    return db.select().from(ticketFormFields).where(eq(ticketFormFields.helpdeskId, helpdeskId)).orderBy(asc(ticketFormFields.order));
  }

  async createTicketFormField(insert: InsertTicketFormField): Promise<TicketFormField> {
    const [field] = await db.insert(ticketFormFields).values(insert).returning();
    return field;
  }

  async updateTicketFormField(id: string, update: Partial<InsertTicketFormField>): Promise<TicketFormField> {
    const [field] = await db.update(ticketFormFields).set(update).where(eq(ticketFormFields.id, id)).returning();
    if (!field) throw new Error("Ticket form field not found");
    return field;
  }

  async deleteTicketFormField(id: string): Promise<void> {
    await db.delete(ticketFormFields).where(eq(ticketFormFields.id, id));
  }

  // Role methods
  async getRoles(): Promise<RoleWithUserCount[]> {
    const allRoles = await db.select().from(roles).orderBy(desc(roles.priority));
    const rolesWithCounts: RoleWithUserCount[] = [];
    for (const role of allRoles) {
      const [countResult] = await db.select({ count: count() }).from(userRoles).where(eq(userRoles.roleId, role.id));
      rolesWithCounts.push({ ...role, userCount: countResult?.count ?? 0 });
    }
    return rolesWithCounts;
  }

  async getRole(id: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRoleWithPermissions(id: string): Promise<RoleWithPermissions | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    if (!role) return undefined;
    const permissions = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, id));
    return { ...role, permissions };
  }

  async createRole(insert: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values(insert).returning();
    return role;
  }

  async updateRole(id: string, update: Partial<InsertRole>): Promise<Role> {
    const [existing] = await db.select().from(roles).where(eq(roles.id, id));
    if (!existing) throw new Error("Role not found");
    if (existing.isSystem === "true") throw new Error("Cannot modify system roles");
    const [role] = await db.update(roles).set({ ...update, updatedAt: new Date().toISOString() }).where(eq(roles.id, id)).returning();
    return role;
  }

  async deleteRole(id: string): Promise<void> {
    const [existing] = await db.select().from(roles).where(eq(roles.id, id));
    if (existing?.isSystem === "true") throw new Error("Cannot delete system roles");
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    await db.delete(userRoles).where(eq(userRoles.roleId, id));
    await db.delete(roles).where(eq(roles.id, id));
  }

  // Role Permission methods
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  }

  async setRolePermissions(roleId: string, permissions: string[]): Promise<RolePermission[]> {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    if (permissions.length === 0) return [];
    const newPermissions = permissions.map(permission => ({
      roleId,
      permission,
      scopeType: null,
      scopeId: null,
    }));
    return db.insert(rolePermissions).values(newPermissions).returning();
  }

  async addRolePermission(insert: InsertRolePermission): Promise<RolePermission> {
    const [permission] = await db.insert(rolePermissions).values(insert).returning();
    return permission;
  }

  async removeRolePermission(roleId: string, permission: string): Promise<void> {
    await db.delete(rolePermissions).where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permission, permission)));
  }

  // User Role methods
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return db.select().from(userRoles).where(eq(userRoles.userId, userId));
  }

  async getUsersWithRole(roleId: string): Promise<UserRole[]> {
    return db.select().from(userRoles).where(eq(userRoles.roleId, roleId));
  }

  async getUserRoleCount(roleId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(userRoles).where(eq(userRoles.roleId, roleId));
    return result?.count ?? 0;
  }

  async assignUserRole(insert: InsertUserRole): Promise<UserRole> {
    const existing = await db.select().from(userRoles).where(and(eq(userRoles.userId, insert.userId), eq(userRoles.roleId, insert.roleId)));
    if (existing.length > 0) return existing[0];
    const [userRole] = await db.insert(userRoles).values(insert).returning();
    return userRole;
  }

  async removeUserRole(userId: string, roleId: string): Promise<void> {
    await db.delete(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
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
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
  }

  async getAuditLogsByActor(actorId: string): Promise<AuditLog[]> {
    return db.select().from(auditLogs).where(eq(auditLogs.actorId, actorId)).orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByTarget(targetType: string, targetId: string): Promise<AuditLog[]> {
    return db.select().from(auditLogs).where(and(eq(auditLogs.targetType, targetType), eq(auditLogs.targetId, targetId))).orderBy(desc(auditLogs.createdAt));
  }

  async createAuditLog(insert: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(insert).returning();
    return log;
  }

  async getAuditLogCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(auditLogs);
    return result?.count ?? 0;
  }
}
