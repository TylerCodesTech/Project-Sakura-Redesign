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
  type DepartmentSetting, type InsertDepartmentSetting,
  type UserPreference, type InsertUserPreference,
  type SettingsAudit, type InsertSettingsAudit,
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
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByDepartment(department: string): Promise<User[]>;
  getUsers(): Promise<User[]>;
  getUserCount(): Promise<number>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, update: Partial<InsertUser>): Promise<User>;

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

  // Department Settings
  getDepartmentSettings(departmentId: string): Promise<Record<string, string>>;
  getDepartmentSetting(departmentId: string, key: string): Promise<string | undefined>;
  setDepartmentSetting(departmentId: string, key: string, value: string, category?: string): Promise<DepartmentSetting>;
  setDepartmentSettings(departmentId: string, settings: Record<string, string>): Promise<void>;

  // User Preferences
  getUserPreferences(userId: string): Promise<Record<string, string>>;
  getUserPreference(userId: string, key: string): Promise<string | undefined>;
  setUserPreference(userId: string, key: string, value: string): Promise<UserPreference>;
  setUserPreferences(userId: string, preferences: Record<string, string>): Promise<void>;

  // Settings Audit
  logSettingChange(actorId: string | null, settingKey: string, oldValue: string | null, newValue: string, scopeType: 'global' | 'department' | 'user', scopeId?: string): Promise<SettingsAudit>;
  getSettingsAuditLog(filters?: {
    actorId?: string;
    scopeType?: 'global' | 'department' | 'user';
    scopeId?: string;
    limit?: number;
    offset?: number;
  }): Promise<SettingsAudit[]>;

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
  getTicketFormCategories(helpdeskId: string): Promise<TicketFormCategory[]>;
  getTicketFormCategory(id: string): Promise<TicketFormCategory | undefined>;
  createTicketFormCategory(category: InsertTicketFormCategory): Promise<TicketFormCategory>;
  updateTicketFormCategory(id: string, update: Partial<InsertTicketFormCategory>): Promise<TicketFormCategory>;
  deleteTicketFormCategory(id: string): Promise<void>;

  getTicketFormFields(helpdeskId: string): Promise<TicketFormField[]>;
  getTicketFormFieldsByCategory(categoryId: string): Promise<TicketFormField[]>;
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

  // Version History - Pages
  getPageVersions(pageId: string): Promise<PageVersion[]>;
  getPageVersion(pageId: string, versionNumber: number): Promise<PageVersion | undefined>;
  getLatestPageVersionNumber(pageId: string): Promise<number>;
  createPageVersion(version: InsertPageVersion): Promise<PageVersion>;
  deletePageVersion(id: string): Promise<void>;
  archivePageVersion(id: string): Promise<PageVersion>;
  restorePageVersion(id: string): Promise<PageVersion>;

  // Version History - Books
  getBookVersions(bookId: string): Promise<BookVersion[]>;
  getBookVersion(bookId: string, versionNumber: number): Promise<BookVersion | undefined>;
  getLatestBookVersionNumber(bookId: string): Promise<number>;
  createBookVersion(version: InsertBookVersion): Promise<BookVersion>;
  deleteBookVersion(id: string): Promise<void>;
  archiveBookVersion(id: string): Promise<BookVersion>;
  restoreBookVersion(id: string): Promise<BookVersion>;

  // Version Audit Logs
  getVersionAuditLogs(documentId: string, documentType: string): Promise<VersionAuditLog[]>;
  getAllVersionAuditLogs(limit?: number, offset?: number): Promise<VersionAuditLog[]>;
  createVersionAuditLog(log: InsertVersionAuditLog): Promise<VersionAuditLog>;

  // Search versions
  searchVersions(query: string): Promise<{ pageVersions: PageVersion[], bookVersions: BookVersion[] }>;

  // Report Definitions
  getReportDefinitions(departmentId?: string): Promise<ReportDefinition[]>;
  getReportDefinition(id: string): Promise<ReportDefinition | undefined>;
  createReportDefinition(definition: InsertReportDefinition): Promise<ReportDefinition>;
  updateReportDefinition(id: string, update: Partial<InsertReportDefinition>): Promise<ReportDefinition>;
  deleteReportDefinition(id: string): Promise<void>;

  // Saved Reports
  getSavedReports(departmentId?: string): Promise<SavedReport[]>;
  getSavedReport(id: string): Promise<SavedReport | undefined>;
  createSavedReport(report: InsertSavedReport): Promise<SavedReport>;
  deleteSavedReport(id: string): Promise<void>;

  // Report Schedules
  getReportSchedules(definitionId?: string): Promise<ReportSchedule[]>;
  getReportSchedule(id: string): Promise<ReportSchedule | undefined>;
  createReportSchedule(schedule: InsertReportSchedule): Promise<ReportSchedule>;
  updateReportSchedule(id: string, update: Partial<InsertReportSchedule>): Promise<ReportSchedule>;
  deleteReportSchedule(id: string): Promise<void>;

  // Report Shares
  getReportShares(reportId: string): Promise<ReportShare[]>;
  createReportShare(share: InsertReportShare): Promise<ReportShare>;
  deleteReportShare(id: string): Promise<void>;

  // Report Audit Logs
  getReportAuditLogs(departmentId?: string, limit?: number): Promise<ReportAuditLog[]>;
  createReportAuditLog(log: InsertReportAuditLog): Promise<ReportAuditLog>;

  // Department Report Settings
  getDepartmentReportSettings(departmentId: string): Promise<DepartmentReportSettings | undefined>;
  createDepartmentReportSettings(settings: InsertDepartmentReportSettings): Promise<DepartmentReportSettings>;
  updateDepartmentReportSettings(departmentId: string, update: Partial<InsertDepartmentReportSettings>): Promise<DepartmentReportSettings>;

  // Report Fields (metadata)
  getReportFields(dataSource?: string): Promise<ReportField[]>;
  createReportField(field: InsertReportField): Promise<ReportField>;
  updateReportField(id: string, update: Partial<InsertReportField>): Promise<ReportField>;
  deleteReportField(id: string): Promise<void>;

  // AI Model Configurations
  getAiModelConfigs(type?: string): Promise<AiModelConfig[]>;
  getAiModelConfig(id: string): Promise<AiModelConfig | undefined>;
  getActiveAiModelConfig(type: string): Promise<AiModelConfig | undefined>;
  createAiModelConfig(config: InsertAiModelConfig): Promise<AiModelConfig>;
  updateAiModelConfig(id: string, update: Partial<InsertAiModelConfig>): Promise<AiModelConfig>;
  deleteAiModelConfig(id: string): Promise<void>;
  setActiveAiModelConfig(id: string, type: string): Promise<AiModelConfig>;

  // Announcements
  getAnnouncements(departmentId?: string): Promise<Announcement[]>;
  getActiveAnnouncements(departmentId?: string): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, update: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;

  // Search History / Trending Topics
  createSearchHistory(search: InsertSearchHistory): Promise<SearchHistory>;
  getTrendingTopics(departmentId?: string, limit?: number): Promise<{ query: string; count: number }[]>;

  // Intranet Posts
  getPosts(departmentId?: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(insert: InsertPost): Promise<Post>;
  updatePost(id: string, update: Partial<InsertPost>): Promise<Post>;
  deletePost(id: string): Promise<void>;
  likePost(postId: string, userId: string): Promise<boolean>;
  isPostLiked(postId: string, userId: string): Promise<boolean>;
  getPostComments(postId: string): Promise<PostComment[]>;
  createPostComment(insert: InsertPostComment): Promise<PostComment>;

  // Infrastructure Monitoring
  getMonitoredServices(): Promise<MonitoredService[]>;
  getMonitoredServiceById(id: string): Promise<MonitoredService | undefined>;
  createMonitoredService(service: InsertMonitoredService): Promise<MonitoredService>;
  updateMonitoredService(id: string, update: Partial<InsertMonitoredService>): Promise<MonitoredService>;
  deleteMonitoredService(id: string): Promise<void>;
  getServiceStatusHistory(serviceId: string): Promise<ServiceStatusHistory[]>;
  createServiceStatusHistory(history: InsertServiceStatusHistory): Promise<ServiceStatusHistory>;
  getServiceAlerts(): Promise<ServiceAlert[]>;
  acknowledgeServiceAlert(id: string, userId: string): Promise<ServiceAlert>;
}
