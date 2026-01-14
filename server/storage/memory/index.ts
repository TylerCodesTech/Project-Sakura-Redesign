import { IStorage } from '../interface';
import { UserStorage } from './users.storage';
import { DocumentsStorage } from './documents.storage';
import { HelpdeskStorage } from './helpdesk.storage';
import { RolesStorage } from './roles.storage';
import { VersionsStorage } from './versions.storage';
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
  type SystemSetting,
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
  type TicketFormCategory, type InsertTicketFormCategory,
  type TicketFormField, type InsertTicketFormField,
  type Role, type InsertRole,
  type RolePermission, type InsertRolePermission,
  type UserRole, type InsertUserRole,
  type AuditLog, type InsertAuditLog,
  type DocumentActivity, type InsertDocumentActivity,
  type RoleWithUserCount, type RoleWithPermissions,
  type PageVersion, type InsertPageVersion,
  type BookVersion, type InsertBookVersion,
  type VersionAuditLog, type InsertVersionAuditLog,
  type ReportDefinition, type InsertReportDefinition,
  type ReportField, type InsertReportField,
  type SavedReport, type InsertSavedReport,
  type ReportSchedule, type InsertReportSchedule,
  type ReportShare, type InsertReportShare,
  type ReportAuditLog, type InsertReportAuditLog,
  type DepartmentReportSettings, type InsertDepartmentReportSettings,
  type AiModelConfig, type InsertAiModelConfig,
  type Announcement, type InsertAnnouncement,
  type SearchHistory, type InsertSearchHistory,
  type Post, type InsertPost,
  type PostComment, type InsertPostComment,
  type MonitoredService, type InsertMonitoredService,
  type ServiceStatusHistory, type InsertServiceStatusHistory,
  type ServiceAlert,
} from '@shared/schema';
import { randomUUID } from 'crypto';

/**
 * MemStorage is the main in-memory storage implementation that composes
 * all storage modules together and implements the IStorage interface.
 */
export class MemStorage implements IStorage {
  private userStorage = new UserStorage();
  private documentsStorage = new DocumentsStorage();
  private helpdeskStorage = new HelpdeskStorage();
  private rolesStorage = new RolesStorage();
  private versionsStorage = new VersionsStorage();

  // Additional storage for features not yet modularized
  private notifications: Map<string, Notification>;
  private watercoolerMessages: Map<string, Comment>;
  private systemSettings: Map<string, SystemSetting>;
  private reportDefinitions: Map<string, ReportDefinition>;
  private reportFields: Map<string, ReportField>;
  private savedReports: Map<string, SavedReport>;
  private reportSchedules: Map<string, ReportSchedule>;
  private reportShares: Map<string, ReportShare>;
  private reportAuditLogs: Map<string, ReportAuditLog>;
  private departmentReportSettings: Map<string, DepartmentReportSettings>;
  private aiModelConfigs: Map<string, AiModelConfig>;
  private searchHistory: Map<string, SearchHistory>;
  private monitoredServices: Map<string, MonitoredService>;
  private serviceStatusHistory: Map<string, ServiceStatusHistory>;
  private serviceAlerts: Map<string, ServiceAlert>;

  constructor() {
    this.notifications = new Map();
    this.watercoolerMessages = new Map();
    this.systemSettings = new Map();
    this.reportDefinitions = new Map();
    this.reportFields = new Map();
    this.savedReports = new Map();
    this.reportSchedules = new Map();
    this.reportShares = new Map();
    this.reportAuditLogs = new Map();
    this.departmentReportSettings = new Map();
    this.aiModelConfigs = new Map();
    this.searchHistory = new Map();
    this.monitoredServices = new Map();
    this.serviceStatusHistory = new Map();
    this.serviceAlerts = new Map();
  }

  // ==================== User Methods ====================
  getUser = this.userStorage.getUser.bind(this.userStorage);
  getUserByUsername = this.userStorage.getUserByUsername.bind(this.userStorage);
  getUsersByDepartment = this.userStorage.getUsersByDepartment.bind(this.userStorage);
  getUsers = this.userStorage.getUsers.bind(this.userStorage);
  getUserCount = this.userStorage.getUserCount.bind(this.userStorage);
  createUser = this.userStorage.createUser.bind(this.userStorage);
  updateUser = this.userStorage.updateUser.bind(this.userStorage);

  // ==================== Book Methods ====================
  getBooks = this.documentsStorage.getBooks.bind(this.documentsStorage);
  getBook = this.documentsStorage.getBook.bind(this.documentsStorage);
  createBook = this.documentsStorage.createBook.bind(this.documentsStorage);
  updateBook = this.documentsStorage.updateBook.bind(this.documentsStorage);
  deleteBook = this.documentsStorage.deleteBook.bind(this.documentsStorage);

  // ==================== Page Methods ====================
  getPages = this.documentsStorage.getPages.bind(this.documentsStorage);
  getPage = this.documentsStorage.getPage.bind(this.documentsStorage);
  getPageByTitle = this.documentsStorage.getPageByTitle.bind(this.documentsStorage);
  getStandalonePages = this.documentsStorage.getStandalonePages.bind(this.documentsStorage);
  createPage = this.documentsStorage.createPage.bind(this.documentsStorage);
  updatePage = this.documentsStorage.updatePage.bind(this.documentsStorage);
  deletePage = this.documentsStorage.deletePage.bind(this.documentsStorage);

  // ==================== Comment Methods ====================
  getComments = this.documentsStorage.getComments.bind(this.documentsStorage);
  createComment = this.documentsStorage.createComment.bind(this.documentsStorage);

  // ==================== Notification Methods ====================
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createNotification(insert: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      id,
      userId: insert.userId,
      type: insert.type,
      title: insert.title,
      message: insert.message,
      link: insert.link ?? null,
      isRead: insert.isRead ?? "false",
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) throw new Error("Notification not found");
    const updated = { ...notification, isRead: "true" };
    this.notifications.set(id, updated);
    return updated;
  }

  // ==================== External Link Methods ====================
  getExternalLinks = this.documentsStorage.getExternalLinks.bind(this.documentsStorage);
  createExternalLink = this.documentsStorage.createExternalLink.bind(this.documentsStorage);
  updateExternalLink = this.documentsStorage.updateExternalLink.bind(this.documentsStorage);
  deleteExternalLink = this.documentsStorage.deleteExternalLink.bind(this.documentsStorage);

  // ==================== Department Methods ====================
  getDepartments = this.documentsStorage.getDepartments.bind(this.documentsStorage);
  createDepartment = this.documentsStorage.createDepartment.bind(this.documentsStorage);
  updateDepartment = this.documentsStorage.updateDepartment.bind(this.documentsStorage);
  deleteDepartment = this.documentsStorage.deleteDepartment.bind(this.documentsStorage);

  // ==================== News Methods ====================
  getNews = this.documentsStorage.getNews.bind(this.documentsStorage);
  createNews = this.documentsStorage.createNews.bind(this.documentsStorage);

  // ==================== Stats Methods ====================
  getStats = this.documentsStorage.getStats.bind(this.documentsStorage);
  updateStat = this.documentsStorage.updateStat.bind(this.documentsStorage);

  // ==================== Watercooler Methods ====================
  async getWatercoolerMessages(): Promise<Comment[]> {
    return Array.from(this.watercoolerMessages.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createWatercoolerMessage(insert: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const message: Comment = {
      ...insert,
      id,
      createdAt: new Date().toISOString(),
    };
    this.watercoolerMessages.set(id, message);
    return message;
  }

  // ==================== System Settings Methods ====================
  async getSystemSettings(): Promise<Record<string, string>> {
    const settings: Record<string, string> = {};
    Array.from(this.systemSettings.values()).forEach(s => {
      settings[s.key] = s.value;
    });
    return settings;
  }

  async getSystemSetting(key: string): Promise<string | undefined> {
    const setting = this.systemSettings.get(key);
    return setting?.value;
  }

  async setSystemSetting(key: string, value: string, category?: string): Promise<SystemSetting> {
    const existing = this.systemSettings.get(key);
    const setting: SystemSetting = {
      key,
      value,
      category: category ?? existing?.category ?? "general",
      updatedAt: new Date().toISOString(),
    };
    this.systemSettings.set(key, setting);
    return setting;
  }

  async setSystemSettings(settings: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.setSystemSetting(key, value);
    }
  }

  // ==================== Helpdesk Methods ====================
  getHelpdesks = this.helpdeskStorage.getHelpdesks.bind(this.helpdeskStorage);
  getHelpdeskByDepartment = this.helpdeskStorage.getHelpdeskByDepartment.bind(this.helpdeskStorage);
  createHelpdesk = this.helpdeskStorage.createHelpdesk.bind(this.helpdeskStorage);
  updateHelpdesk = this.helpdeskStorage.updateHelpdesk.bind(this.helpdeskStorage);
  deleteHelpdesk = this.helpdeskStorage.deleteHelpdesk.bind(this.helpdeskStorage);

  // ==================== SLA State Methods ====================
  getSlaStates = this.helpdeskStorage.getSlaStates.bind(this.helpdeskStorage);
  createSlaState = this.helpdeskStorage.createSlaState.bind(this.helpdeskStorage);
  updateSlaState = this.helpdeskStorage.updateSlaState.bind(this.helpdeskStorage);
  deleteSlaState = this.helpdeskStorage.deleteSlaState.bind(this.helpdeskStorage);

  // ==================== SLA Policy Methods ====================
  getSlaPolicies = this.helpdeskStorage.getSlaPolicies.bind(this.helpdeskStorage);
  createSlaPolicy = this.helpdeskStorage.createSlaPolicy.bind(this.helpdeskStorage);
  updateSlaPolicy = this.helpdeskStorage.updateSlaPolicy.bind(this.helpdeskStorage);
  deleteSlaPolicy = this.helpdeskStorage.deleteSlaPolicy.bind(this.helpdeskStorage);

  // ==================== Department Hierarchy Methods ====================
  getDepartmentHierarchy = this.helpdeskStorage.getDepartmentHierarchy.bind(this.helpdeskStorage);
  getChildDepartments = this.helpdeskStorage.getChildDepartments.bind(this.helpdeskStorage);
  createDepartmentHierarchy = this.helpdeskStorage.createDepartmentHierarchy.bind(this.helpdeskStorage);
  deleteDepartmentHierarchy = this.helpdeskStorage.deleteDepartmentHierarchy.bind(this.helpdeskStorage);

  // ==================== Department Manager Methods ====================
  getDepartmentManagers = this.helpdeskStorage.getDepartmentManagers.bind(this.helpdeskStorage);
  createDepartmentManager = this.helpdeskStorage.createDepartmentManager.bind(this.helpdeskStorage);
  updateDepartmentManager = this.helpdeskStorage.updateDepartmentManager.bind(this.helpdeskStorage);
  deleteDepartmentManager = this.helpdeskStorage.deleteDepartmentManager.bind(this.helpdeskStorage);

  // ==================== Escalation Rule Methods ====================
  getEscalationRules = this.helpdeskStorage.getEscalationRules.bind(this.helpdeskStorage);
  createEscalationRule = this.helpdeskStorage.createEscalationRule.bind(this.helpdeskStorage);
  updateEscalationRule = this.helpdeskStorage.updateEscalationRule.bind(this.helpdeskStorage);
  deleteEscalationRule = this.helpdeskStorage.deleteEscalationRule.bind(this.helpdeskStorage);

  // ==================== Escalation Condition Methods ====================
  getEscalationConditions = this.helpdeskStorage.getEscalationConditions.bind(this.helpdeskStorage);
  createEscalationCondition = this.helpdeskStorage.createEscalationCondition.bind(this.helpdeskStorage);
  deleteEscalationCondition = this.helpdeskStorage.deleteEscalationCondition.bind(this.helpdeskStorage);

  // ==================== Inbound Email Config Methods ====================
  getInboundEmailConfig = this.helpdeskStorage.getInboundEmailConfig.bind(this.helpdeskStorage);
  createInboundEmailConfig = this.helpdeskStorage.createInboundEmailConfig.bind(this.helpdeskStorage);
  updateInboundEmailConfig(id: string, update: Partial<InsertInboundEmailConfig>): Promise<InboundEmailConfig> {
    // Note: HelpdeskStorage doesn't have this method, so we need to implement it
    throw new Error("Method not implemented in HelpdeskStorage");
  }

  // ==================== Ticket Methods ====================
  getTickets = this.helpdeskStorage.getTickets.bind(this.helpdeskStorage);
  getTicket = this.helpdeskStorage.getTicket.bind(this.helpdeskStorage);
  createTicket = this.helpdeskStorage.createTicket.bind(this.helpdeskStorage);
  updateTicket = this.helpdeskStorage.updateTicket.bind(this.helpdeskStorage);

  // ==================== Ticket Comment Methods ====================
  getTicketComments = this.helpdeskStorage.getTicketComments.bind(this.helpdeskStorage);
  createTicketComment = this.helpdeskStorage.createTicketComment.bind(this.helpdeskStorage);

  // ==================== Webhook Methods ====================
  getWebhooks = this.helpdeskStorage.getWebhooks.bind(this.helpdeskStorage);
  createWebhook = this.helpdeskStorage.createWebhook.bind(this.helpdeskStorage);
  updateWebhook = this.helpdeskStorage.updateWebhook.bind(this.helpdeskStorage);
  deleteWebhook = this.helpdeskStorage.deleteWebhook.bind(this.helpdeskStorage);

  // ==================== Ticket Form Methods ====================
  getTicketFormCategories = this.helpdeskStorage.getTicketFormCategories.bind(this.helpdeskStorage);
  getTicketFormCategory = this.helpdeskStorage.getTicketFormCategory.bind(this.helpdeskStorage);
  createTicketFormCategory = this.helpdeskStorage.createTicketFormCategory.bind(this.helpdeskStorage);
  updateTicketFormCategory = this.helpdeskStorage.updateTicketFormCategory.bind(this.helpdeskStorage);
  deleteTicketFormCategory = this.helpdeskStorage.deleteTicketFormCategory.bind(this.helpdeskStorage);

  getTicketFormFields = this.helpdeskStorage.getTicketFormFields.bind(this.helpdeskStorage);
  getTicketFormFieldsByCategory = this.helpdeskStorage.getTicketFormFieldsByCategory.bind(this.helpdeskStorage);
  createTicketFormField = this.helpdeskStorage.createTicketFormField.bind(this.helpdeskStorage);
  updateTicketFormField = this.helpdeskStorage.updateTicketFormField.bind(this.helpdeskStorage);
  deleteTicketFormField = this.helpdeskStorage.deleteTicketFormField.bind(this.helpdeskStorage);

  // ==================== Role Methods ====================
  getRoles = this.rolesStorage.getRoles.bind(this.rolesStorage);
  getRole = this.rolesStorage.getRole.bind(this.rolesStorage);
  getRoleWithPermissions = this.rolesStorage.getRoleWithPermissions.bind(this.rolesStorage);
  createRole = this.rolesStorage.createRole.bind(this.rolesStorage);
  updateRole = this.rolesStorage.updateRole.bind(this.rolesStorage);
  deleteRole = this.rolesStorage.deleteRole.bind(this.rolesStorage);

  // ==================== Role Permission Methods ====================
  getRolePermissions = this.rolesStorage.getRolePermissions.bind(this.rolesStorage);

  async setRolePermissions(roleId: string, permissions: string[]): Promise<RolePermission[]> {
    // Remove all existing permissions for this role
    const existing = await this.rolesStorage.getRolePermissions(roleId);
    for (const perm of existing) {
      await this.rolesStorage.deleteRolePermission(roleId, perm.permission);
    }
    // Add new permissions
    const newPermissions: RolePermission[] = [];
    for (const permission of permissions) {
      const rp = await this.rolesStorage.createRolePermission({ roleId, permission });
      newPermissions.push(rp);
    }
    return newPermissions;
  }

  addRolePermission = this.rolesStorage.createRolePermission.bind(this.rolesStorage);
  removeRolePermission = this.rolesStorage.deleteRolePermission.bind(this.rolesStorage);

  // ==================== User Role Methods ====================
  getUserRoles = this.rolesStorage.getUserRoles.bind(this.rolesStorage);
  getUsersWithRole = this.rolesStorage.getUsersByRole.bind(this.rolesStorage);

  async getUserRoleCount(roleId: string): Promise<number> {
    const userRoles = await this.rolesStorage.getUsersByRole(roleId);
    return userRoles.length;
  }

  assignUserRole = this.rolesStorage.assignRoleToUser.bind(this.rolesStorage);
  removeUserRole = this.rolesStorage.removeRoleFromUser.bind(this.rolesStorage);

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.rolesStorage.getUserRoles(userId);
    const permissions = new Set<string>();
    for (const ur of userRoles) {
      const rolePerms = await this.rolesStorage.getRolePermissions(ur.roleId);
      rolePerms.forEach(rp => permissions.add(rp.permission));
    }
    return Array.from(permissions);
  }

  // ==================== Audit Log Methods ====================
  getAuditLogs = this.rolesStorage.getAuditLogs.bind(this.rolesStorage);
  getAuditLogsByActor = this.rolesStorage.getAuditLogsByUser.bind(this.rolesStorage);
  getAuditLogsByTarget = this.rolesStorage.getAuditLogsByEntity.bind(this.rolesStorage);
  createAuditLog = this.rolesStorage.createAuditLog.bind(this.rolesStorage);

  async getAuditLogCount(): Promise<number> {
    const logs = await this.rolesStorage.getAuditLogs(Number.MAX_SAFE_INTEGER, 0);
    return logs.length;
  }

  // ==================== Document Activity Methods ====================
  getDocumentActivity = this.rolesStorage.getDocumentActivity.bind(this.rolesStorage);
  createDocumentActivity = this.rolesStorage.createDocumentActivity.bind(this.rolesStorage);

  // ==================== Version History - Page Methods ====================
  getPageVersions = this.versionsStorage.getPageVersions.bind(this.versionsStorage);
  getPageVersion = this.versionsStorage.getPageVersion.bind(this.versionsStorage);
  getLatestPageVersionNumber = this.versionsStorage.getLatestPageVersionNumber.bind(this.versionsStorage);
  createPageVersion = this.versionsStorage.createPageVersion.bind(this.versionsStorage);
  deletePageVersion = this.versionsStorage.deletePageVersion.bind(this.versionsStorage);
  archivePageVersion = this.versionsStorage.archivePageVersion.bind(this.versionsStorage);
  restorePageVersion = this.versionsStorage.restorePageVersion.bind(this.versionsStorage);

  // ==================== Version History - Book Methods ====================
  getBookVersions = this.versionsStorage.getBookVersions.bind(this.versionsStorage);
  getBookVersion = this.versionsStorage.getBookVersion.bind(this.versionsStorage);
  getLatestBookVersionNumber = this.versionsStorage.getLatestBookVersionNumber.bind(this.versionsStorage);
  createBookVersion = this.versionsStorage.createBookVersion.bind(this.versionsStorage);
  deleteBookVersion = this.versionsStorage.deleteBookVersion.bind(this.versionsStorage);
  archiveBookVersion = this.versionsStorage.archiveBookVersion.bind(this.versionsStorage);
  restoreBookVersion = this.versionsStorage.restoreBookVersion.bind(this.versionsStorage);

  // ==================== Version Audit Log Methods ====================
  getVersionAuditLogs = this.versionsStorage.getVersionAuditLogs.bind(this.versionsStorage);
  getAllVersionAuditLogs = this.versionsStorage.getAllVersionAuditLogs.bind(this.versionsStorage);
  createVersionAuditLog = this.versionsStorage.createVersionAuditLog.bind(this.versionsStorage);

  // ==================== Search Versions Methods ====================
  searchVersions = this.versionsStorage.searchVersions.bind(this.versionsStorage);

  // ==================== Report Definition Methods ====================
  async getReportDefinitions(departmentId?: string): Promise<ReportDefinition[]> {
    const all = Array.from(this.reportDefinitions.values());
    if (departmentId) {
      return all.filter(r => r.departmentId === departmentId || !r.departmentId);
    }
    return all;
  }

  async getReportDefinition(id: string): Promise<ReportDefinition | undefined> {
    return this.reportDefinitions.get(id);
  }

  async createReportDefinition(insert: InsertReportDefinition): Promise<ReportDefinition> {
    const id = randomUUID();
    const definition: ReportDefinition = {
      id,
      name: insert.name,
      description: insert.description ?? null,
      dataSource: insert.dataSource,
      reportType: insert.reportType ?? "table",
      configuration: insert.configuration ?? null,
      departmentId: insert.departmentId ?? null,
      createdBy: insert.createdBy,
      isPublic: insert.isPublic ?? "false",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.reportDefinitions.set(id, definition);
    return definition;
  }

  async updateReportDefinition(id: string, update: Partial<InsertReportDefinition>): Promise<ReportDefinition> {
    const existing = this.reportDefinitions.get(id);
    if (!existing) throw new Error("Report definition not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.reportDefinitions.set(id, updated);
    return updated;
  }

  async deleteReportDefinition(id: string): Promise<void> {
    this.reportDefinitions.delete(id);
  }

  // ==================== Saved Report Methods ====================
  async getSavedReports(departmentId?: string): Promise<SavedReport[]> {
    const all = Array.from(this.savedReports.values());
    if (departmentId) {
      return all.filter(r => r.departmentId === departmentId);
    }
    return all;
  }

  async getSavedReport(id: string): Promise<SavedReport | undefined> {
    return this.savedReports.get(id);
  }

  async createSavedReport(insert: InsertSavedReport): Promise<SavedReport> {
    const id = randomUUID();
    const report: SavedReport = {
      id,
      definitionId: insert.definitionId,
      name: insert.name,
      filters: insert.filters ?? null,
      generatedData: insert.generatedData ?? null,
      departmentId: insert.departmentId ?? null,
      createdBy: insert.createdBy,
      createdAt: new Date().toISOString(),
    };
    this.savedReports.set(id, report);
    return report;
  }

  async deleteSavedReport(id: string): Promise<void> {
    this.savedReports.delete(id);
  }

  // ==================== Report Schedule Methods ====================
  async getReportSchedules(definitionId?: string): Promise<ReportSchedule[]> {
    const all = Array.from(this.reportSchedules.values());
    if (definitionId) {
      return all.filter(s => s.definitionId === definitionId);
    }
    return all;
  }

  async getReportSchedule(id: string): Promise<ReportSchedule | undefined> {
    return this.reportSchedules.get(id);
  }

  async createReportSchedule(insert: InsertReportSchedule): Promise<ReportSchedule> {
    const id = randomUUID();
    const schedule: ReportSchedule = {
      id,
      definitionId: insert.definitionId,
      frequency: insert.frequency,
      recipients: insert.recipients,
      enabled: insert.enabled ?? "true",
      lastRun: null,
      nextRun: insert.nextRun ?? null,
      createdBy: insert.createdBy,
      createdAt: new Date().toISOString(),
    };
    this.reportSchedules.set(id, schedule);
    return schedule;
  }

  async updateReportSchedule(id: string, update: Partial<InsertReportSchedule>): Promise<ReportSchedule> {
    const existing = this.reportSchedules.get(id);
    if (!existing) throw new Error("Report schedule not found");
    const updated = { ...existing, ...update };
    this.reportSchedules.set(id, updated);
    return updated;
  }

  async deleteReportSchedule(id: string): Promise<void> {
    this.reportSchedules.delete(id);
  }

  // ==================== Report Share Methods ====================
  async getReportShares(reportId: string): Promise<ReportShare[]> {
    return Array.from(this.reportShares.values()).filter(s => s.reportId === reportId);
  }

  async createReportShare(insert: InsertReportShare): Promise<ReportShare> {
    const id = randomUUID();
    const share: ReportShare = {
      id,
      reportId: insert.reportId,
      sharedWith: insert.sharedWith,
      sharedBy: insert.sharedBy,
      permission: insert.permission ?? "view",
      createdAt: new Date().toISOString(),
    };
    this.reportShares.set(id, share);
    return share;
  }

  async deleteReportShare(id: string): Promise<void> {
    this.reportShares.delete(id);
  }

  // ==================== Report Audit Log Methods ====================
  async getReportAuditLogs(departmentId?: string, limit = 100): Promise<ReportAuditLog[]> {
    let logs = Array.from(this.reportAuditLogs.values());
    if (departmentId) {
      logs = logs.filter(l => l.departmentId === departmentId);
    }
    return logs
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async createReportAuditLog(insert: InsertReportAuditLog): Promise<ReportAuditLog> {
    const id = randomUUID();
    const log: ReportAuditLog = {
      id,
      reportId: insert.reportId ?? null,
      userId: insert.userId,
      action: insert.action,
      details: insert.details ?? null,
      departmentId: insert.departmentId ?? null,
      createdAt: new Date().toISOString(),
    };
    this.reportAuditLogs.set(id, log);
    return log;
  }

  // ==================== Department Report Settings Methods ====================
  async getDepartmentReportSettings(departmentId: string): Promise<DepartmentReportSettings | undefined> {
    return this.departmentReportSettings.get(departmentId);
  }

  async createDepartmentReportSettings(insert: InsertDepartmentReportSettings): Promise<DepartmentReportSettings> {
    const settings: DepartmentReportSettings = {
      departmentId: insert.departmentId,
      enableReporting: insert.enableReporting ?? "true",
      allowCustomReports: insert.allowCustomReports ?? "true",
      defaultDataSource: insert.defaultDataSource ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.departmentReportSettings.set(insert.departmentId, settings);
    return settings;
  }

  async updateDepartmentReportSettings(departmentId: string, update: Partial<InsertDepartmentReportSettings>): Promise<DepartmentReportSettings> {
    const existing = this.departmentReportSettings.get(departmentId);
    if (!existing) throw new Error("Department report settings not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.departmentReportSettings.set(departmentId, updated);
    return updated;
  }

  // ==================== Report Field Methods ====================
  async getReportFields(dataSource?: string): Promise<ReportField[]> {
    const all = Array.from(this.reportFields.values());
    if (dataSource) {
      return all.filter(f => f.dataSource === dataSource);
    }
    return all;
  }

  async createReportField(insert: InsertReportField): Promise<ReportField> {
    const id = randomUUID();
    const field: ReportField = {
      id,
      dataSource: insert.dataSource,
      fieldName: insert.fieldName,
      fieldLabel: insert.fieldLabel,
      fieldType: insert.fieldType,
      isFilterable: insert.isFilterable ?? "true",
      isSortable: insert.isSortable ?? "true",
      isGroupable: insert.isGroupable ?? "false",
    };
    this.reportFields.set(id, field);
    return field;
  }

  async updateReportField(id: string, update: Partial<InsertReportField>): Promise<ReportField> {
    const existing = this.reportFields.get(id);
    if (!existing) throw new Error("Report field not found");
    const updated = { ...existing, ...update };
    this.reportFields.set(id, updated);
    return updated;
  }

  async deleteReportField(id: string): Promise<void> {
    this.reportFields.delete(id);
  }

  // ==================== AI Model Config Methods ====================
  async getAiModelConfigs(type?: string): Promise<AiModelConfig[]> {
    const all = Array.from(this.aiModelConfigs.values());
    if (type) {
      return all.filter(c => c.type === type);
    }
    return all;
  }

  async getAiModelConfig(id: string): Promise<AiModelConfig | undefined> {
    return this.aiModelConfigs.get(id);
  }

  async getActiveAiModelConfig(type: string): Promise<AiModelConfig | undefined> {
    return Array.from(this.aiModelConfigs.values()).find(
      c => c.type === type && c.isActive === "true"
    );
  }

  async createAiModelConfig(insert: InsertAiModelConfig): Promise<AiModelConfig> {
    const id = randomUUID();
    const config: AiModelConfig = {
      id,
      name: insert.name,
      type: insert.type,
      provider: insert.provider,
      model: insert.model,
      apiKey: insert.apiKey ?? null,
      endpoint: insert.endpoint ?? null,
      temperature: insert.temperature ?? null,
      maxTokens: insert.maxTokens ?? null,
      isActive: insert.isActive ?? "false",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.aiModelConfigs.set(id, config);
    return config;
  }

  async updateAiModelConfig(id: string, update: Partial<InsertAiModelConfig>): Promise<AiModelConfig> {
    const existing = this.aiModelConfigs.get(id);
    if (!existing) throw new Error("AI model config not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.aiModelConfigs.set(id, updated);
    return updated;
  }

  async deleteAiModelConfig(id: string): Promise<void> {
    this.aiModelConfigs.delete(id);
  }

  async setActiveAiModelConfig(id: string, type: string): Promise<AiModelConfig> {
    // Deactivate all configs of this type
    const configsOfType = await this.getAiModelConfigs(type);
    for (const config of configsOfType) {
      if (config.isActive === "true") {
        await this.updateAiModelConfig(config.id, { isActive: "false" });
      }
    }
    // Activate the target config
    return this.updateAiModelConfig(id, { isActive: "true" });
  }

  // ==================== Announcement Methods ====================
  getAnnouncements = this.documentsStorage.getAnnouncements.bind(this.documentsStorage);

  async getActiveAnnouncements(departmentId?: string): Promise<Announcement[]> {
    const announcements = await this.documentsStorage.getAnnouncements(departmentId);
    const now = new Date().toISOString();
    return announcements.filter(a => {
      if (!a.isActive) return false;
      if (a.startDate && a.startDate > now) return false;
      if (a.endDate && a.endDate < now) return false;
      return true;
    });
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const all = await this.documentsStorage.getAnnouncements();
    return all.find(a => a.id === id);
  }

  createAnnouncement = this.documentsStorage.createAnnouncement.bind(this.documentsStorage);
  updateAnnouncement = this.documentsStorage.updateAnnouncement.bind(this.documentsStorage);
  deleteAnnouncement = this.documentsStorage.deleteAnnouncement.bind(this.documentsStorage);

  // ==================== Search History / Trending Topics Methods ====================
  async createSearchHistory(insert: InsertSearchHistory): Promise<SearchHistory> {
    const id = randomUUID();
    const search: SearchHistory = {
      id,
      userId: insert.userId ?? null,
      query: insert.query,
      departmentId: insert.departmentId ?? null,
      resultCount: insert.resultCount ?? 0,
      createdAt: new Date().toISOString(),
    };
    this.searchHistory.set(id, search);
    return search;
  }

  async getTrendingTopics(departmentId?: string, limit = 10): Promise<{ query: string; count: number }[]> {
    let searches = Array.from(this.searchHistory.values());
    if (departmentId) {
      searches = searches.filter(s => s.departmentId === departmentId);
    }

    // Group by query and count
    const queryCounts = new Map<string, number>();
    searches.forEach(s => {
      const count = queryCounts.get(s.query) || 0;
      queryCounts.set(s.query, count + 1);
    });

    // Convert to array and sort by count
    return Array.from(queryCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // ==================== Intranet Post Methods ====================
  getPosts = this.documentsStorage.getPosts.bind(this.documentsStorage);
  getPost = this.documentsStorage.getPost.bind(this.documentsStorage);
  createPost = this.documentsStorage.createPost.bind(this.documentsStorage);
  updatePost = this.documentsStorage.updatePost.bind(this.documentsStorage);
  deletePost = this.documentsStorage.deletePost.bind(this.documentsStorage);
  likePost = this.documentsStorage.likePost.bind(this.documentsStorage);

  async isPostLiked(postId: string, userId: string): Promise<boolean> {
    // This would require DocumentsStorage to track likes, which it does internally
    // For now, we'll implement a simple check
    return false; // TODO: Implement proper like tracking
  }

  getPostComments = this.documentsStorage.getPostComments.bind(this.documentsStorage);
  createPostComment = this.documentsStorage.addPostComment.bind(this.documentsStorage);

  // ==================== Infrastructure Monitoring Methods ====================
  async getMonitoredServices(): Promise<MonitoredService[]> {
    return Array.from(this.monitoredServices.values());
  }

  async getMonitoredServiceById(id: string): Promise<MonitoredService | undefined> {
    return this.monitoredServices.get(id);
  }

  async createMonitoredService(insert: InsertMonitoredService): Promise<MonitoredService> {
    const id = randomUUID();
    const service: MonitoredService = {
      id,
      name: insert.name,
      type: insert.type,
      url: insert.url ?? null,
      status: insert.status ?? "unknown",
      description: insert.description ?? null,
      checkInterval: insert.checkInterval ?? 300,
      enabled: insert.enabled ?? "true",
      lastChecked: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.monitoredServices.set(id, service);
    return service;
  }

  async updateMonitoredService(id: string, update: Partial<InsertMonitoredService>): Promise<MonitoredService> {
    const existing = this.monitoredServices.get(id);
    if (!existing) throw new Error("Monitored service not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.monitoredServices.set(id, updated);
    return updated;
  }

  async deleteMonitoredService(id: string): Promise<void> {
    this.monitoredServices.delete(id);
  }

  async getServiceStatusHistory(serviceId: string): Promise<ServiceStatusHistory[]> {
    return Array.from(this.serviceStatusHistory.values())
      .filter(h => h.serviceId === serviceId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async createServiceStatusHistory(insert: InsertServiceStatusHistory): Promise<ServiceStatusHistory> {
    const id = randomUUID();
    const history: ServiceStatusHistory = {
      id,
      serviceId: insert.serviceId,
      status: insert.status,
      responseTime: insert.responseTime ?? null,
      errorMessage: insert.errorMessage ?? null,
      timestamp: new Date().toISOString(),
    };
    this.serviceStatusHistory.set(id, history);
    return history;
  }

  async getServiceAlerts(): Promise<ServiceAlert[]> {
    return Array.from(this.serviceAlerts.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async acknowledgeServiceAlert(id: string, userId: string): Promise<ServiceAlert> {
    const alert = this.serviceAlerts.get(id);
    if (!alert) throw new Error("Service alert not found");
    const updated: ServiceAlert = {
      ...alert,
      isAcknowledged: "true",
      acknowledgedBy: userId,
      acknowledgedAt: new Date().toISOString(),
    };
    this.serviceAlerts.set(id, updated);
    return updated;
  }
}
