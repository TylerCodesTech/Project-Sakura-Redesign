import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { IStorage } from "../interface";
import { db } from "../../db";
import { DatabaseUserStorage } from "./users.storage";
import { DatabaseDocumentsStorage } from "./documents.storage";
import { DatabaseHelpdeskStorage } from "./helpdesk.storage";
import { DatabaseRolesStorage } from "./roles.storage";
import { DatabaseVersionsStorage } from "./versions.storage";
import { DatabaseReportsStorage } from "./reports.storage";

export type Database = NodePgDatabase;

export class DatabaseStorage implements IStorage {
  private db: any;
  private userStorage: DatabaseUserStorage;
  private documentsStorage: DatabaseDocumentsStorage;
  private helpdeskStorage: DatabaseHelpdeskStorage;
  private rolesStorage: DatabaseRolesStorage;
  private versionsStorage: DatabaseVersionsStorage;
  private reportsStorage: DatabaseReportsStorage;

  constructor(database: any = db) {
    this.db = database;
    this.userStorage = new DatabaseUserStorage(this.db);
    this.documentsStorage = new DatabaseDocumentsStorage(this.db);
    this.helpdeskStorage = new DatabaseHelpdeskStorage(this.db);
    this.rolesStorage = new DatabaseRolesStorage(this.db);
    this.versionsStorage = new DatabaseVersionsStorage(this.db);
    this.reportsStorage = new DatabaseReportsStorage(this.db);
  }

  // User methods - delegated to DatabaseUserStorage
  getUser = this.userStorage.getUser.bind(this.userStorage);
  getUserByUsername = this.userStorage.getUserByUsername.bind(this.userStorage);
  getUsersByDepartment = this.userStorage.getUsersByDepartment.bind(this.userStorage);
  getUsers = this.userStorage.getUsers.bind(this.userStorage);
  getUserCount = this.userStorage.getUserCount.bind(this.userStorage);
  createUser = this.userStorage.createUser.bind(this.userStorage);
  updateUser = this.userStorage.updateUser.bind(this.userStorage);

  // Book methods - delegated to DatabaseDocumentsStorage
  getBooks = this.documentsStorage.getBooks.bind(this.documentsStorage);
  getBook = this.documentsStorage.getBook.bind(this.documentsStorage);
  createBook = this.documentsStorage.createBook.bind(this.documentsStorage);
  updateBook = this.documentsStorage.updateBook.bind(this.documentsStorage);
  deleteBook = this.documentsStorage.deleteBook.bind(this.documentsStorage);

  // Page methods - delegated to DatabaseDocumentsStorage
  getPages = this.documentsStorage.getPages.bind(this.documentsStorage);
  getPage = this.documentsStorage.getPage.bind(this.documentsStorage);
  getPageByTitle = this.documentsStorage.getPageByTitle.bind(this.documentsStorage);
  getStandalonePages = this.documentsStorage.getStandalonePages.bind(this.documentsStorage);
  createPage = this.documentsStorage.createPage.bind(this.documentsStorage);
  updatePage = this.documentsStorage.updatePage.bind(this.documentsStorage);
  deletePage = this.documentsStorage.deletePage.bind(this.documentsStorage);

  // Comment methods - delegated to DatabaseDocumentsStorage
  getComments = this.documentsStorage.getComments.bind(this.documentsStorage);
  createComment = this.documentsStorage.createComment.bind(this.documentsStorage);

  // Notification methods - NOT YET IMPLEMENTED
  async getNotifications(userId: string) {
    throw new Error("getNotifications not yet implemented");
  }
  async createNotification(notification: any) {
    throw new Error("createNotification not yet implemented");
  }
  async markNotificationRead(id: string) {
    throw new Error("markNotificationRead not yet implemented");
  }

  // External Link methods - delegated to DatabaseDocumentsStorage
  getExternalLinks = this.documentsStorage.getExternalLinks.bind(this.documentsStorage);
  createExternalLink = this.documentsStorage.createExternalLink.bind(this.documentsStorage);
  updateExternalLink = this.documentsStorage.updateExternalLink.bind(this.documentsStorage);
  deleteExternalLink = this.documentsStorage.deleteExternalLink.bind(this.documentsStorage);

  // Department methods - delegated to DatabaseDocumentsStorage
  getDepartments = this.documentsStorage.getDepartments.bind(this.documentsStorage);
  createDepartment = this.documentsStorage.createDepartment.bind(this.documentsStorage);
  updateDepartment = this.documentsStorage.updateDepartment.bind(this.documentsStorage);
  deleteDepartment = this.documentsStorage.deleteDepartment.bind(this.documentsStorage);

  // News methods - delegated to DatabaseDocumentsStorage
  getNews = this.documentsStorage.getNews.bind(this.documentsStorage);
  createNews = this.documentsStorage.createNews.bind(this.documentsStorage);

  // Stats methods - delegated to DatabaseDocumentsStorage
  getStats = this.documentsStorage.getStats.bind(this.documentsStorage);
  updateStat = this.documentsStorage.updateStat.bind(this.documentsStorage);

  // Watercooler methods - NOT YET IMPLEMENTED
  async getWatercoolerMessages() {
    throw new Error("getWatercoolerMessages not yet implemented");
  }
  async createWatercoolerMessage(message: any) {
    throw new Error("createWatercoolerMessage not yet implemented");
  }

  // System Settings methods - NOT YET IMPLEMENTED
  async getSystemSettings() {
    throw new Error("getSystemSettings not yet implemented");
  }
  async getSystemSetting(key: string) {
    throw new Error("getSystemSetting not yet implemented");
  }
  async setSystemSetting(key: string, value: string, category?: string) {
    throw new Error("setSystemSetting not yet implemented");
  }
  async setSystemSettings(settings: Record<string, string>) {
    throw new Error("setSystemSettings not yet implemented");
  }

  // Helpdesk methods - delegated to DatabaseHelpdeskStorage
  getHelpdesks = this.helpdeskStorage.getHelpdesks.bind(this.helpdeskStorage);
  getHelpdeskByDepartment = this.helpdeskStorage.getHelpdeskByDepartment.bind(this.helpdeskStorage);
  createHelpdesk = this.helpdeskStorage.createHelpdesk.bind(this.helpdeskStorage);
  updateHelpdesk = this.helpdeskStorage.updateHelpdesk.bind(this.helpdeskStorage);
  deleteHelpdesk = this.helpdeskStorage.deleteHelpdesk.bind(this.helpdeskStorage);

  // SLA State methods - delegated to DatabaseHelpdeskStorage
  getSlaStates = this.helpdeskStorage.getSlaStates.bind(this.helpdeskStorage);
  createSlaState = this.helpdeskStorage.createSlaState.bind(this.helpdeskStorage);
  updateSlaState = this.helpdeskStorage.updateSlaState.bind(this.helpdeskStorage);
  deleteSlaState = this.helpdeskStorage.deleteSlaState.bind(this.helpdeskStorage);

  // SLA Policy methods - delegated to DatabaseHelpdeskStorage
  getSlaPolicies = this.helpdeskStorage.getSlaPolicies.bind(this.helpdeskStorage);
  createSlaPolicy = this.helpdeskStorage.createSlaPolicy.bind(this.helpdeskStorage);
  updateSlaPolicy = this.helpdeskStorage.updateSlaPolicy.bind(this.helpdeskStorage);
  deleteSlaPolicy = this.helpdeskStorage.deleteSlaPolicy.bind(this.helpdeskStorage);

  // Department Hierarchy methods - delegated to DatabaseHelpdeskStorage
  getDepartmentHierarchy = this.helpdeskStorage.getDepartmentHierarchy.bind(this.helpdeskStorage);
  getChildDepartments = this.helpdeskStorage.getChildDepartments.bind(this.helpdeskStorage);
  createDepartmentHierarchy = this.helpdeskStorage.createDepartmentHierarchy.bind(this.helpdeskStorage);
  deleteDepartmentHierarchy = this.helpdeskStorage.deleteDepartmentHierarchy.bind(this.helpdeskStorage);

  // Department Manager methods - delegated to DatabaseHelpdeskStorage
  getDepartmentManagers = this.helpdeskStorage.getDepartmentManagers.bind(this.helpdeskStorage);
  createDepartmentManager = this.helpdeskStorage.createDepartmentManager.bind(this.helpdeskStorage);
  updateDepartmentManager = this.helpdeskStorage.updateDepartmentManager.bind(this.helpdeskStorage);
  deleteDepartmentManager = this.helpdeskStorage.deleteDepartmentManager.bind(this.helpdeskStorage);

  // Escalation Rule methods - delegated to DatabaseHelpdeskStorage
  getEscalationRules = this.helpdeskStorage.getEscalationRules.bind(this.helpdeskStorage);
  createEscalationRule = this.helpdeskStorage.createEscalationRule.bind(this.helpdeskStorage);
  updateEscalationRule = this.helpdeskStorage.updateEscalationRule.bind(this.helpdeskStorage);
  deleteEscalationRule = this.helpdeskStorage.deleteEscalationRule.bind(this.helpdeskStorage);

  // Escalation Condition methods - delegated to DatabaseHelpdeskStorage
  getEscalationConditions = this.helpdeskStorage.getEscalationConditions.bind(this.helpdeskStorage);
  createEscalationCondition = this.helpdeskStorage.createEscalationCondition.bind(this.helpdeskStorage);
  deleteEscalationCondition = this.helpdeskStorage.deleteEscalationCondition.bind(this.helpdeskStorage);

  // Inbound Email Config methods - delegated to DatabaseHelpdeskStorage
  getInboundEmailConfig = this.helpdeskStorage.getInboundEmailConfig.bind(this.helpdeskStorage);
  createInboundEmailConfig = this.helpdeskStorage.createInboundEmailConfig.bind(this.helpdeskStorage);
  updateInboundEmailConfig = this.helpdeskStorage.updateInboundEmailConfig.bind(this.helpdeskStorage);

  // Ticket methods - delegated to DatabaseHelpdeskStorage
  getTickets = this.helpdeskStorage.getTickets.bind(this.helpdeskStorage);
  getTicket = this.helpdeskStorage.getTicket.bind(this.helpdeskStorage);
  createTicket = this.helpdeskStorage.createTicket.bind(this.helpdeskStorage);
  updateTicket = this.helpdeskStorage.updateTicket.bind(this.helpdeskStorage);

  // Ticket Comment methods - delegated to DatabaseHelpdeskStorage
  getTicketComments = this.helpdeskStorage.getTicketComments.bind(this.helpdeskStorage);
  createTicketComment = this.helpdeskStorage.createTicketComment.bind(this.helpdeskStorage);

  // Webhook methods - delegated to DatabaseHelpdeskStorage
  getWebhooks = this.helpdeskStorage.getWebhooks.bind(this.helpdeskStorage);
  createWebhook = this.helpdeskStorage.createWebhook.bind(this.helpdeskStorage);
  updateWebhook = this.helpdeskStorage.updateWebhook.bind(this.helpdeskStorage);
  deleteWebhook = this.helpdeskStorage.deleteWebhook.bind(this.helpdeskStorage);

  // Ticket Form Category methods - delegated to DatabaseHelpdeskStorage
  getTicketFormCategories = this.helpdeskStorage.getTicketFormCategories.bind(this.helpdeskStorage);
  getTicketFormCategory = this.helpdeskStorage.getTicketFormCategory.bind(this.helpdeskStorage);
  createTicketFormCategory = this.helpdeskStorage.createTicketFormCategory.bind(this.helpdeskStorage);
  updateTicketFormCategory = this.helpdeskStorage.updateTicketFormCategory.bind(this.helpdeskStorage);
  deleteTicketFormCategory = this.helpdeskStorage.deleteTicketFormCategory.bind(this.helpdeskStorage);

  // Ticket Form Field methods - delegated to DatabaseHelpdeskStorage
  getTicketFormFields = this.helpdeskStorage.getTicketFormFields.bind(this.helpdeskStorage);
  getTicketFormFieldsByCategory = this.helpdeskStorage.getTicketFormFieldsByCategory.bind(this.helpdeskStorage);
  createTicketFormField = this.helpdeskStorage.createTicketFormField.bind(this.helpdeskStorage);
  updateTicketFormField = this.helpdeskStorage.updateTicketFormField.bind(this.helpdeskStorage);
  deleteTicketFormField = this.helpdeskStorage.deleteTicketFormField.bind(this.helpdeskStorage);

  // Role methods - delegated to DatabaseRolesStorage
  getRoles = this.rolesStorage.getRoles.bind(this.rolesStorage);
  getRole = this.rolesStorage.getRole.bind(this.rolesStorage);
  getRoleWithPermissions = this.rolesStorage.getRoleWithPermissions.bind(this.rolesStorage);
  createRole = this.rolesStorage.createRole.bind(this.rolesStorage);
  updateRole = this.rolesStorage.updateRole.bind(this.rolesStorage);
  deleteRole = this.rolesStorage.deleteRole.bind(this.rolesStorage);

  // Role Permission methods - delegated to DatabaseRolesStorage
  getRolePermissions = this.rolesStorage.getRolePermissions.bind(this.rolesStorage);
  setRolePermissions = this.rolesStorage.setRolePermissions.bind(this.rolesStorage);
  addRolePermission = this.rolesStorage.createRolePermission.bind(this.rolesStorage);
  removeRolePermission = this.rolesStorage.removeRolePermission.bind(this.rolesStorage);

  // User Role methods - delegated to DatabaseRolesStorage
  getUserRoles = this.rolesStorage.getUserRoles.bind(this.rolesStorage);
  getUsersWithRole = this.rolesStorage.getUsersByRole.bind(this.rolesStorage);
  getUserRoleCount = this.rolesStorage.getUserRoleCount.bind(this.rolesStorage);
  assignUserRole = this.rolesStorage.assignRoleToUser.bind(this.rolesStorage);
  removeUserRole = this.rolesStorage.removeRoleFromUser.bind(this.rolesStorage);
  getUserPermissions = this.rolesStorage.getUserPermissions.bind(this.rolesStorage);

  // Audit Log methods - delegated to DatabaseRolesStorage
  getAuditLogs = this.rolesStorage.getAuditLogs.bind(this.rolesStorage);
  getAuditLogsByActor = this.rolesStorage.getAuditLogsByUser.bind(this.rolesStorage);
  getAuditLogsByTarget = this.rolesStorage.getAuditLogsByEntity.bind(this.rolesStorage);
  createAuditLog = this.rolesStorage.createAuditLog.bind(this.rolesStorage);
  getAuditLogCount = this.rolesStorage.getAuditLogCount.bind(this.rolesStorage);

  // Document Activity methods - delegated to DatabaseRolesStorage
  getDocumentActivity = this.rolesStorage.getDocumentActivity.bind(this.rolesStorage);
  createDocumentActivity = this.rolesStorage.createDocumentActivity.bind(this.rolesStorage);

  // Page Version methods - delegated to DatabaseVersionsStorage
  getPageVersions = this.versionsStorage.getPageVersions.bind(this.versionsStorage);
  getPageVersion = this.versionsStorage.getPageVersion.bind(this.versionsStorage);
  getLatestPageVersionNumber = this.versionsStorage.getLatestPageVersionNumber.bind(this.versionsStorage);
  createPageVersion = this.versionsStorage.createPageVersion.bind(this.versionsStorage);
  deletePageVersion = this.versionsStorage.deletePageVersion.bind(this.versionsStorage);
  archivePageVersion = this.versionsStorage.archivePageVersion.bind(this.versionsStorage);
  restorePageVersion = this.versionsStorage.restorePageVersion.bind(this.versionsStorage);

  // Book Version methods - delegated to DatabaseVersionsStorage
  getBookVersions = this.versionsStorage.getBookVersions.bind(this.versionsStorage);
  getBookVersion = this.versionsStorage.getBookVersion.bind(this.versionsStorage);
  getLatestBookVersionNumber = this.versionsStorage.getLatestBookVersionNumber.bind(this.versionsStorage);
  createBookVersion = this.versionsStorage.createBookVersion.bind(this.versionsStorage);
  deleteBookVersion = this.versionsStorage.deleteBookVersion.bind(this.versionsStorage);
  archiveBookVersion = this.versionsStorage.archiveBookVersion.bind(this.versionsStorage);
  restoreBookVersion = this.versionsStorage.restoreBookVersion.bind(this.versionsStorage);

  // Version Audit Log methods - delegated to DatabaseVersionsStorage
  getVersionAuditLogs = this.versionsStorage.getVersionAuditLogs.bind(this.versionsStorage);
  getAllVersionAuditLogs = this.versionsStorage.getAllVersionAuditLogs.bind(this.versionsStorage);
  createVersionAuditLog = this.versionsStorage.createVersionAuditLog.bind(this.versionsStorage);

  // Search versions - delegated to DatabaseVersionsStorage
  searchVersions = this.versionsStorage.searchVersions.bind(this.versionsStorage);

  // Report Definition methods - delegated to DatabaseReportsStorage
  getReportDefinitions = this.reportsStorage.getReportDefinitions.bind(this.reportsStorage);
  getReportDefinition = this.reportsStorage.getReportDefinition.bind(this.reportsStorage);
  createReportDefinition = this.reportsStorage.createReportDefinition.bind(this.reportsStorage);
  updateReportDefinition = this.reportsStorage.updateReportDefinition.bind(this.reportsStorage);
  deleteReportDefinition = this.reportsStorage.deleteReportDefinition.bind(this.reportsStorage);

  // Saved Report methods - delegated to DatabaseReportsStorage
  getSavedReports = this.reportsStorage.getSavedReports.bind(this.reportsStorage);
  getSavedReport = this.reportsStorage.getSavedReport.bind(this.reportsStorage);
  createSavedReport = this.reportsStorage.createSavedReport.bind(this.reportsStorage);
  deleteSavedReport = this.reportsStorage.deleteSavedReport.bind(this.reportsStorage);

  // Report Schedule methods - delegated to DatabaseReportsStorage
  getReportSchedules = this.reportsStorage.getReportSchedules.bind(this.reportsStorage);
  getReportSchedule = this.reportsStorage.getReportSchedule.bind(this.reportsStorage);
  createReportSchedule = this.reportsStorage.createReportSchedule.bind(this.reportsStorage);
  updateReportSchedule = this.reportsStorage.updateReportSchedule.bind(this.reportsStorage);
  deleteReportSchedule = this.reportsStorage.deleteReportSchedule.bind(this.reportsStorage);

  // Report Share methods - delegated to DatabaseReportsStorage
  getReportShares = this.reportsStorage.getReportShares.bind(this.reportsStorage);
  createReportShare = this.reportsStorage.createReportShare.bind(this.reportsStorage);
  deleteReportShare = this.reportsStorage.deleteReportShare.bind(this.reportsStorage);

  // Report Audit Log methods - delegated to DatabaseReportsStorage
  getReportAuditLogs = this.reportsStorage.getReportAuditLogs.bind(this.reportsStorage);
  createReportAuditLog = this.reportsStorage.createReportAuditLog.bind(this.reportsStorage);

  // Department Report Settings methods - delegated to DatabaseReportsStorage
  getDepartmentReportSettings = this.reportsStorage.getDepartmentReportSettings.bind(this.reportsStorage);
  createDepartmentReportSettings = this.reportsStorage.createDepartmentReportSettings.bind(this.reportsStorage);
  updateDepartmentReportSettings = this.reportsStorage.updateDepartmentReportSettings.bind(this.reportsStorage);

  // Report Field methods - delegated to DatabaseReportsStorage
  getReportFields = this.reportsStorage.getReportFields.bind(this.reportsStorage);
  createReportField = this.reportsStorage.createReportField.bind(this.reportsStorage);
  updateReportField = this.reportsStorage.updateReportField.bind(this.reportsStorage);
  deleteReportField = this.reportsStorage.deleteReportField.bind(this.reportsStorage);

  // AI Model Configuration methods - NOT YET IMPLEMENTED
  async getAiModelConfigs(type?: string) {
    throw new Error("getAiModelConfigs not yet implemented");
  }
  async getAiModelConfig(id: string) {
    throw new Error("getAiModelConfig not yet implemented");
  }
  async getActiveAiModelConfig(type: string) {
    throw new Error("getActiveAiModelConfig not yet implemented");
  }
  async createAiModelConfig(config: any) {
    throw new Error("createAiModelConfig not yet implemented");
  }
  async updateAiModelConfig(id: string, update: any) {
    throw new Error("updateAiModelConfig not yet implemented");
  }
  async deleteAiModelConfig(id: string) {
    throw new Error("deleteAiModelConfig not yet implemented");
  }
  async setActiveAiModelConfig(id: string, type: string) {
    throw new Error("setActiveAiModelConfig not yet implemented");
  }

  // Announcement methods - delegated to DatabaseDocumentsStorage
  getAnnouncements = this.documentsStorage.getAnnouncements.bind(this.documentsStorage);
  async getActiveAnnouncements(departmentId?: string) {
    // Filter for active announcements (could be based on startDate/endDate if those fields exist)
    const announcements = await this.documentsStorage.getAnnouncements(departmentId);
    // For now, return all announcements - implement filtering logic when schema is clear
    return announcements;
  }
  async getAnnouncement(id: string) {
    // This method doesn't exist in documentsStorage yet, would need to be implemented
    throw new Error("getAnnouncement not yet implemented");
  }
  createAnnouncement = this.documentsStorage.createAnnouncement.bind(this.documentsStorage);
  updateAnnouncement = this.documentsStorage.updateAnnouncement.bind(this.documentsStorage);
  deleteAnnouncement = this.documentsStorage.deleteAnnouncement.bind(this.documentsStorage);

  // Search History / Trending Topics methods - NOT YET IMPLEMENTED
  async createSearchHistory(search: any) {
    throw new Error("createSearchHistory not yet implemented");
  }
  async getTrendingTopics(departmentId?: string, limit?: number) {
    throw new Error("getTrendingTopics not yet implemented");
  }

  // Intranet Post methods - delegated to DatabaseDocumentsStorage
  getPosts = this.documentsStorage.getPosts.bind(this.documentsStorage);
  getPost = this.documentsStorage.getPost.bind(this.documentsStorage);
  createPost = this.documentsStorage.createPost.bind(this.documentsStorage);
  updatePost = this.documentsStorage.updatePost.bind(this.documentsStorage);
  deletePost = this.documentsStorage.deletePost.bind(this.documentsStorage);
  likePost = this.documentsStorage.likePost.bind(this.documentsStorage);
  async isPostLiked(postId: string, userId: string) {
    // This method doesn't exist in documentsStorage yet
    throw new Error("isPostLiked not yet implemented");
  }
  getPostComments = this.documentsStorage.getPostComments.bind(this.documentsStorage);
  createPostComment = this.documentsStorage.addPostComment.bind(this.documentsStorage);

  // Infrastructure Monitoring methods - NOT YET IMPLEMENTED
  async getMonitoredServices() {
    throw new Error("getMonitoredServices not yet implemented");
  }
  async getMonitoredServiceById(id: string) {
    throw new Error("getMonitoredServiceById not yet implemented");
  }
  async createMonitoredService(service: any) {
    throw new Error("createMonitoredService not yet implemented");
  }
  async updateMonitoredService(id: string, update: any) {
    throw new Error("updateMonitoredService not yet implemented");
  }
  async deleteMonitoredService(id: string) {
    throw new Error("deleteMonitoredService not yet implemented");
  }
  async getServiceStatusHistory(serviceId: string) {
    throw new Error("getServiceStatusHistory not yet implemented");
  }
  async createServiceStatusHistory(history: any) {
    throw new Error("createServiceStatusHistory not yet implemented");
  }
  async getServiceAlerts() {
    throw new Error("getServiceAlerts not yet implemented");
  }
  async acknowledgeServiceAlert(id: string, userId: string) {
    throw new Error("acknowledgeServiceAlert not yet implemented");
  }
}
