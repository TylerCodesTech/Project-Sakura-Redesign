import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, vector, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull().default("general"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

export const systemSettingsDefaults: Record<string, string> = {
  companyName: "Sakura",
  platformName: "Sakura Helpdesk",
  supportEmail: "",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#7c3aed",
  defaultTheme: "system",
  allowUserThemeOverride: "true",
  defaultTimezone: "pst",
  defaultLanguage: "en",
  dateFormat: "mdy",
  timeFormat: "12",
  emailNewTicketAssigned: "true",
  emailTicketUpdated: "true",
  emailSLAWarning: "true",
  emailWeeklyDigest: "false",
  inAppDesktopNotifications: "true",
  inAppSoundAlerts: "false",
  inAppNotificationBadge: "true",
  versionHistoryEnabled: "true",
  versionRetentionPolicy: "limit_by_count",
  versionRetentionCount: "50",
  versionRetentionDays: "365",
  autoArchiveEnabled: "true",
  autoArchiveAfterDays: "180",
  showLegacyVersionsInSearch: "true",
  // AI Configuration - Embeddings
  aiEmbeddingProvider: "openai",
  aiEmbeddingModel: "text-embedding-3-small",
  aiEmbeddingDimensions: "1536",
  aiOllamaBaseUrl: "http://localhost:11434",
  aiAutoVectorization: "true",
  aiEnableRag: "true",
  aiChunkSize: "1000",
  // AI Configuration - Chat
  aiChatProvider: "openai",
  aiChatModel: "gpt-4",
  aiChatTemperature: "0.7",
};

export type SystemSettingsKeys = keyof typeof systemSettingsDefaults;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  department: text("department").notNull().default("General"),
});

export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  authorId: varchar("author_id").notNull(),
  parentId: varchar("parent_id"),
});

export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id"), // Optional if it's a standalone file
  title: text("title").notNull(),
  content: text("content").notNull(),
  parentId: varchar("parent_id"), // For chapters/sub-pages or folders
  order: text("order").notNull().default("0"),
  type: text("type").notNull().default("page"), // 'page' or 'folder' or 'file'
  status: text("status").notNull().default("draft"), // draft, in_review, published
  reviewerId: varchar("reviewer_id"),
  authorId: varchar("author_id").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }), // OpenAI text-embedding-3-small
  embeddingUpdatedAt: text("embedding_updated_at"),
}, (table) => [
  index("pages_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
]);

export const documentActivity = pgTable("document_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  documentType: text("document_type").notNull(), // 'page', 'book', 'folder'
  action: text("action").notNull(), // 'created', 'updated', 'moved', 'deleted', 'viewed'
  userId: varchar("user_id").notNull(),
  details: text("details"), // JSON string for additional details
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: text("read").notNull().default("false"),
  link: text("link"),
  targetId: varchar("target_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const externalLinks = pgTable("external_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  category: text("category").notNull().default("Resources"),
  icon: text("icon"), // Store lucide icon name
  order: text("order").notNull().default("0"),
  departmentId: varchar("department_id"), // null = company-wide
  isCompanyWide: text("is_company_wide").notNull().default("true"), // "true" = visible to all
});

export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("General"),
  authorId: varchar("author_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const stats = pgTable("stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  change: text("change").notNull().default("0"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  headId: varchar("head_id"),
  color: text("color").notNull().default("#3b82f6"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
});

export const insertExternalLinkSchema = createInsertSchema(externalLinks).omit({
  id: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
});

export const insertStatSchema = createInsertSchema(stats).omit({
  id: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ExternalLink = typeof externalLinks.$inferSelect;
export type InsertExternalLink = z.infer<typeof insertExternalLinkSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Stat = typeof stats.$inferSelect;
export type InsertStat = z.infer<typeof insertStatSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  department: true,
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type DocumentActivity = typeof documentActivity.$inferSelect;
export const insertDocumentActivitySchema = createInsertSchema(documentActivity).omit({ id: true });
export type InsertDocumentActivity = z.infer<typeof insertDocumentActivitySchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Helpdesk configuration per department
export const helpdesks = pgTable("helpdesks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  departmentId: varchar("department_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  enabled: text("enabled").notNull().default("true"),
  publicAccess: text("public_access").notNull().default("false"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Custom SLA states per helpdesk
export const slaStates = pgTable("sla_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  helpdeskId: varchar("helpdesk_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#3b82f6"),
  order: integer("order").notNull().default(0),
  isFinal: text("is_final").notNull().default("false"),
  isDefault: text("is_default").notNull().default("false"),
  targetHours: integer("target_hours"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// SLA policies with targets
export const slaPolicies = pgTable("sla_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  helpdeskId: varchar("helpdesk_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"),
  firstResponseHours: integer("first_response_hours"),
  resolutionHours: integer("resolution_hours"),
  enabled: text("enabled").notNull().default("true"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Department hierarchy for complex organizational structures
export const departmentHierarchy = pgTable("department_hierarchy", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentDepartmentId: varchar("parent_department_id"),
  childDepartmentId: varchar("child_department_id").notNull(),
  hierarchyType: text("hierarchy_type").notNull().default("subdivision"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Manager assignments for departments
export const departmentManagers = pgTable("department_managers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  departmentId: varchar("department_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull().default("manager"),
  isPrimary: text("is_primary").notNull().default("false"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Escalation rules for ticket routing
export const escalationRules = pgTable("escalation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  helpdeskId: varchar("helpdesk_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  triggerType: text("trigger_type").notNull().default("time_based"),
  triggerHours: integer("trigger_hours"),
  priority: text("priority"),
  ticketType: text("ticket_type"),
  fromStateId: varchar("from_state_id"),
  targetDepartmentId: varchar("target_department_id"),
  targetUserId: varchar("target_user_id"),
  notifyManagers: text("notify_managers").notNull().default("true"),
  enabled: text("enabled").notNull().default("true"),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Escalation rule conditions for complex logic
export const escalationConditions = pgTable("escalation_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull(),
  field: text("field").notNull(),
  operator: text("operator").notNull(),
  value: text("value").notNull(),
  logicOperator: text("logic_operator").notNull().default("and"),
});

// Inbound email configuration per helpdesk
export const inboundEmailConfigs = pgTable("inbound_email_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  helpdeskId: varchar("helpdesk_id").notNull(),
  emailAddress: text("email_address"),
  provider: text("provider").notNull().default("custom"),
  enabled: text("enabled").notNull().default("false"),
  autoCreateTickets: text("auto_create_tickets").notNull().default("true"),
  defaultPriority: text("default_priority").notNull().default("medium"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Email thread tracking for ticket updates
export const emailThreads = pgTable("email_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull(),
  messageId: text("message_id").notNull(),
  inReplyTo: text("in_reply_to"),
  references: text("references"),
  subject: text("subject"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Tickets table for helpdesk
export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  helpdeskId: varchar("helpdesk_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"),
  stateId: varchar("state_id"),
  assignedTo: varchar("assigned_to"),
  createdBy: varchar("created_by").notNull(),
  departmentId: varchar("department_id"),
  ticketType: text("ticket_type").notNull().default("request"),
  source: text("source").notNull().default("web"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  embedding: vector("embedding", { dimensions: 1536 }), // OpenAI text-embedding-3-small
  embeddingUpdatedAt: text("embedding_updated_at"),
}, (table) => [
  index("tickets_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
]);

// Ticket comments/replies
export const ticketComments = pgTable("ticket_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull(),
  userId: varchar("user_id"),
  content: text("content").notNull(),
  isInternal: text("is_internal").notNull().default("false"),
  source: text("source").notNull().default("web"),
  emailMessageId: text("email_message_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Webhooks for helpdesk integrations
export const helpdeskWebhooks = pgTable("helpdesk_webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  helpdeskId: varchar("helpdesk_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  secret: text("secret"),
  events: text("events").notNull().default("ticket.created,ticket.updated"),
  enabled: text("enabled").notNull().default("true"),
  retryCount: integer("retry_count").notNull().default(3),
  timeoutSeconds: integer("timeout_seconds").notNull().default(30),
  lastTriggeredAt: text("last_triggered_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Ticket form categories - multiple forms per helpdesk (e.g., Hardware, Software, Network)
export const ticketFormCategories = pgTable("ticket_form_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  helpdeskId: varchar("helpdesk_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull().default("layers"),
  color: text("color").notNull().default("#3b82f6"),
  order: integer("order").notNull().default(0),
  enabled: text("enabled").notNull().default("true"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Custom ticket form fields per helpdesk
export const ticketFormFields = pgTable("ticket_form_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  helpdeskId: varchar("helpdesk_id").notNull(),
  formCategoryId: varchar("form_category_id"),
  name: text("name").notNull(),
  label: text("label").notNull(),
  fieldType: text("field_type").notNull().default("text"),
  placeholder: text("placeholder"),
  helpText: text("help_text"),
  required: text("required").notNull().default("false"),
  options: text("options"),
  defaultValue: text("default_value"),
  order: integer("order").notNull().default(0),
  enabled: text("enabled").notNull().default("true"),
  showOnCreate: text("show_on_create").notNull().default("true"),
  showOnEdit: text("show_on_edit").notNull().default("true"),
  category: text("category"),
  conditionalField: text("conditional_field"),
  conditionalValue: text("conditional_value"),
  minValue: text("min_value"),
  maxValue: text("max_value"),
  validationPattern: text("validation_pattern"),
  width: text("width").notNull().default("full"),
  internalOnly: text("internal_only").notNull().default("false"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas
export const insertHelpdeskSchema = createInsertSchema(helpdesks).omit({ id: true });
export const insertSlaStateSchema = createInsertSchema(slaStates).omit({ id: true });
export const insertSlaPolicySchema = createInsertSchema(slaPolicies).omit({ id: true });
export const insertDepartmentHierarchySchema = createInsertSchema(departmentHierarchy).omit({ id: true });
export const insertDepartmentManagerSchema = createInsertSchema(departmentManagers).omit({ id: true });
export const insertEscalationRuleSchema = createInsertSchema(escalationRules).omit({ id: true });
export const insertEscalationConditionSchema = createInsertSchema(escalationConditions).omit({ id: true });
export const insertInboundEmailConfigSchema = createInsertSchema(inboundEmailConfigs).omit({ id: true });
export const insertEmailThreadSchema = createInsertSchema(emailThreads).omit({ id: true });
export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true });
export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({ id: true });
export const insertHelpdeskWebhookSchema = createInsertSchema(helpdeskWebhooks).omit({ id: true });
export const insertTicketFormCategorySchema = createInsertSchema(ticketFormCategories).omit({ id: true });
export const insertTicketFormFieldSchema = createInsertSchema(ticketFormFields).omit({ id: true });

// Types
export type Helpdesk = typeof helpdesks.$inferSelect;
export type InsertHelpdesk = z.infer<typeof insertHelpdeskSchema>;
export type SlaState = typeof slaStates.$inferSelect;
export type InsertSlaState = z.infer<typeof insertSlaStateSchema>;
export type SlaPolicy = typeof slaPolicies.$inferSelect;
export type InsertSlaPolicy = z.infer<typeof insertSlaPolicySchema>;
export type DepartmentHierarchy = typeof departmentHierarchy.$inferSelect;
export type InsertDepartmentHierarchy = z.infer<typeof insertDepartmentHierarchySchema>;
export type DepartmentManager = typeof departmentManagers.$inferSelect;
export type InsertDepartmentManager = z.infer<typeof insertDepartmentManagerSchema>;
export type EscalationRule = typeof escalationRules.$inferSelect;
export type InsertEscalationRule = z.infer<typeof insertEscalationRuleSchema>;
export type EscalationCondition = typeof escalationConditions.$inferSelect;
export type InsertEscalationCondition = z.infer<typeof insertEscalationConditionSchema>;
export type InboundEmailConfig = typeof inboundEmailConfigs.$inferSelect;
export type InsertInboundEmailConfig = z.infer<typeof insertInboundEmailConfigSchema>;
export type EmailThread = typeof emailThreads.$inferSelect;
export type InsertEmailThread = z.infer<typeof insertEmailThreadSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;
export type HelpdeskWebhook = typeof helpdeskWebhooks.$inferSelect;
export type InsertHelpdeskWebhook = z.infer<typeof insertHelpdeskWebhookSchema>;
export type TicketFormCategory = typeof ticketFormCategories.$inferSelect;
export type InsertTicketFormCategory = z.infer<typeof insertTicketFormCategorySchema>;
export type TicketFormField = typeof ticketFormFields.$inferSelect;
export type InsertTicketFormField = z.infer<typeof insertTicketFormFieldSchema>;

// ============================================
// ROLE-BASED ACCESS CONTROL (RBAC) TABLES
// ============================================

// Permission categories for grouping
export const PERMISSION_CATEGORIES = {
  HELPDESK: "helpdesk",
  DOCUMENTATION: "documentation",
  USERS: "users",
  SETTINGS: "settings",
  DEPARTMENTS: "departments",
  REPORTS: "reports",
} as const;

// All available permissions in the system
export const AVAILABLE_PERMISSIONS = {
  // Helpdesk permissions
  "helpdesk.tickets.view": { category: "helpdesk", description: "View tickets" },
  "helpdesk.tickets.create": { category: "helpdesk", description: "Create tickets" },
  "helpdesk.tickets.edit": { category: "helpdesk", description: "Edit tickets" },
  "helpdesk.tickets.delete": { category: "helpdesk", description: "Delete tickets" },
  "helpdesk.tickets.assign": { category: "helpdesk", description: "Assign tickets to users" },
  "helpdesk.tickets.close": { category: "helpdesk", description: "Close/resolve tickets" },
  "helpdesk.settings.manage": { category: "helpdesk", description: "Manage helpdesk settings" },
  "helpdesk.sla.manage": { category: "helpdesk", description: "Manage SLA states and policies" },
  "helpdesk.webhooks.manage": { category: "helpdesk", description: "Manage webhooks" },
  
  // Documentation permissions
  "docs.books.view": { category: "documentation", description: "View books and pages" },
  "docs.books.create": { category: "documentation", description: "Create books" },
  "docs.books.edit": { category: "documentation", description: "Edit books" },
  "docs.books.delete": { category: "documentation", description: "Delete books" },
  "docs.pages.create": { category: "documentation", description: "Create pages" },
  "docs.pages.edit": { category: "documentation", description: "Edit pages" },
  "docs.pages.delete": { category: "documentation", description: "Delete pages" },
  "docs.pages.publish": { category: "documentation", description: "Publish pages" },
  
  // User management permissions
  "users.view": { category: "users", description: "View users" },
  "users.create": { category: "users", description: "Create users" },
  "users.edit": { category: "users", description: "Edit users" },
  "users.delete": { category: "users", description: "Delete users" },
  "users.roles.assign": { category: "users", description: "Assign roles to users" },
  
  // Settings permissions
  "settings.general.view": { category: "settings", description: "View general settings" },
  "settings.general.manage": { category: "settings", description: "Manage general settings" },
  "settings.branding.manage": { category: "settings", description: "Manage branding settings" },
  "settings.notifications.manage": { category: "settings", description: "Manage notification settings" },
  "settings.security.manage": { category: "settings", description: "Manage security settings" },
  "settings.audit.view": { category: "settings", description: "View audit logs" },
  
  // Department permissions
  "departments.view": { category: "departments", description: "View departments" },
  "departments.create": { category: "departments", description: "Create departments" },
  "departments.edit": { category: "departments", description: "Edit departments" },
  "departments.delete": { category: "departments", description: "Delete departments" },
  "departments.members.manage": { category: "departments", description: "Manage department members" },
  
  // Reports permissions
  "reports.view": { category: "reports", description: "View reports" },
  "reports.export": { category: "reports", description: "Export reports" },
  "reports.create": { category: "reports", description: "Create custom reports" },
  "reports.edit": { category: "reports", description: "Edit report definitions" },
  "reports.delete": { category: "reports", description: "Delete reports" },
  "reports.schedule": { category: "reports", description: "Schedule automated reports" },
  "reports.share": { category: "reports", description: "Share reports with other users" },
  "reports.settings.manage": { category: "reports", description: "Manage report settings" },
  "reports.audit.view": { category: "reports", description: "View report audit logs" },
  "reports.data.tickets": { category: "reports", description: "Access ticket data in reports" },
  "reports.data.users": { category: "reports", description: "Access user data in reports" },
  "reports.data.sla": { category: "reports", description: "Access SLA data in reports" },
  "reports.data.audit": { category: "reports", description: "Access audit log data in reports" },
} as const;

export type PermissionKey = keyof typeof AVAILABLE_PERMISSIONS;

// Roles table
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").notNull().default("#6366f1"),
  isSystem: text("is_system").notNull().default("false"),
  priority: integer("priority").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Role permissions - which permissions each role has
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").notNull(),
  permission: text("permission").notNull(),
  scopeType: text("scope_type"), // null = global, "department" = specific department
  scopeId: varchar("scope_id"), // department ID if scoped
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// User roles - which roles each user has
export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  roleId: varchar("role_id").notNull(),
  assignedBy: varchar("assigned_by"),
  assignedAt: text("assigned_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Audit logs for tracking all permission/role changes
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id"), // User who performed the action (null for system)
  actorName: text("actor_name"), // Cached name for display
  actionType: text("action_type").notNull(), // e.g., "role.created", "role.updated", "user.role_assigned"
  targetType: text("target_type").notNull(), // e.g., "role", "user", "permission"
  targetId: varchar("target_id"),
  targetName: text("target_name"), // Cached name for display
  description: text("description").notNull(), // Human-readable description
  metadata: text("metadata"), // JSON with before/after data
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas for RBAC
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true });
export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({ id: true });
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true });

// Types for RBAC
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Role with user count for display
export type RoleWithUserCount = Role & { userCount: number };

// Role with full permission list
export type RoleWithPermissions = Role & { permissions: RolePermission[] };

// ============================================
// VERSION HISTORY SYSTEM
// ============================================

// Page versions - stores historical snapshots of pages
export const pageVersions = pgTable("page_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull(),
  versionNumber: integer("version_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull(),
  authorId: varchar("author_id").notNull(),
  changeDescription: text("change_description"),
  isArchived: text("is_archived").notNull().default("false"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  embedding: vector("embedding", { dimensions: 1536 }), // OpenAI text-embedding-3-small
  embeddingUpdatedAt: text("embedding_updated_at"),
}, (table) => [
  index("page_versions_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
]);

// Book versions - stores historical snapshots of books
export const bookVersions = pgTable("book_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").notNull(),
  versionNumber: integer("version_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  authorId: varchar("author_id").notNull(),
  changeDescription: text("change_description"),
  isArchived: text("is_archived").notNull().default("false"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Version audit logs - tracks all version-related actions
export const versionAuditLogs = pgTable("version_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  documentType: text("document_type").notNull(), // 'page' or 'book'
  actionType: text("action_type").notNull(), // 'created', 'modified', 'reverted', 'deleted', 'archived', 'restored'
  fromVersion: integer("from_version"),
  toVersion: integer("to_version"),
  userId: varchar("user_id").notNull(),
  userName: text("user_name"),
  details: text("details"), // JSON string for additional metadata
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas for version history
export const insertPageVersionSchema = createInsertSchema(pageVersions).omit({ id: true });
export const insertBookVersionSchema = createInsertSchema(bookVersions).omit({ id: true });
export const insertVersionAuditLogSchema = createInsertSchema(versionAuditLogs).omit({ id: true });

// Types for version history
export type PageVersion = typeof pageVersions.$inferSelect;
export type InsertPageVersion = z.infer<typeof insertPageVersionSchema>;
export type BookVersion = typeof bookVersions.$inferSelect;
export type InsertBookVersion = z.infer<typeof insertBookVersionSchema>;
export type VersionAuditLog = typeof versionAuditLogs.$inferSelect;
export type InsertVersionAuditLog = z.infer<typeof insertVersionAuditLogSchema>;

// Version retention policy types
export type VersionRetentionPolicy = "all" | "limit_by_count" | "limit_by_time" | "auto_archive";

// Version history system settings defaults
export const versionSettingsDefaults: Record<string, string> = {
  versionHistoryEnabled: "true",
  versionRetentionPolicy: "limit_by_count",
  versionRetentionCount: "50",
  versionRetentionDays: "365",
  autoArchiveEnabled: "true",
  autoArchiveAfterDays: "180",
  showLegacyVersionsInSearch: "true",
};

// ============================================
// REPORTING SYSTEM
// ============================================

// Report types enum
export const REPORT_TYPES = {
  AUDIT: "audit",
  USER_ACCESS: "user_access",
  TICKET_SLA: "ticket_sla",
  TICKET_CLOSURES: "ticket_closures",
  CUSTOM: "custom",
} as const;

export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES];

// Available data sources for reports
export const REPORT_DATA_SOURCES = {
  TICKETS: "tickets",
  USERS: "users",
  AUDIT_LOGS: "audit_logs",
  SLA_STATES: "sla_states",
  SLA_POLICIES: "sla_policies",
  DEPARTMENTS: "departments",
  ROLES: "roles",
  PAGES: "pages",
  BOOKS: "books",
} as const;

export type ReportDataSource = typeof REPORT_DATA_SOURCES[keyof typeof REPORT_DATA_SOURCES];

// Report definitions - stores the report templates/configurations
export const reportDefinitions = pgTable("report_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // audit, user_access, ticket_sla, ticket_closures, custom
  departmentId: varchar("department_id"), // null = global, otherwise department-specific
  createdBy: varchar("created_by").notNull(),
  isTemplate: text("is_template").notNull().default("false"), // System templates vs user-created
  isPublic: text("is_public").notNull().default("false"), // Shared with all users in department
  configuration: text("configuration").notNull(), // JSON: fields, filters, sorting, grouping, visualization
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Report fields - available fields for each data source
export const reportFields = pgTable("report_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dataSource: text("data_source").notNull(), // Which table this field belongs to
  fieldName: text("field_name").notNull(), // The actual column/field name
  displayName: text("display_name").notNull(), // User-friendly name
  fieldType: text("field_type").notNull(), // text, number, date, boolean, select
  requiredPermission: text("required_permission"), // Permission needed to access this field
  isFilterable: text("is_filterable").notNull().default("true"),
  isSortable: text("is_sortable").notNull().default("true"),
  isGroupable: text("is_groupable").notNull().default("false"),
  filterOptions: text("filter_options"), // JSON: for select fields, the available options
  order: integer("order").notNull().default(0),
});

// Saved reports - generated report instances
export const savedReports = pgTable("saved_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  definitionId: varchar("definition_id").notNull(),
  name: text("name").notNull(),
  generatedBy: varchar("generated_by").notNull(),
  departmentId: varchar("department_id"),
  parameters: text("parameters"), // JSON: filters and parameters used when generating
  resultData: text("result_data"), // JSON: cached report data
  resultSummary: text("result_summary"), // JSON: summary stats
  rowCount: integer("row_count").notNull().default(0),
  generatedAt: text("generated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text("expires_at"), // When cached data should be refreshed
});

// Report schedules - automated report generation
export const reportSchedules = pgTable("report_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  definitionId: varchar("definition_id").notNull(),
  createdBy: varchar("created_by").notNull(),
  frequency: text("frequency").notNull(), // daily, weekly, monthly
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly
  timeOfDay: text("time_of_day").notNull().default("09:00"), // HH:MM format
  timezone: text("timezone").notNull().default("UTC"),
  recipients: text("recipients").notNull(), // JSON: array of user IDs or emails
  exportFormat: text("export_format").notNull().default("pdf"), // pdf, csv, excel
  isActive: text("is_active").notNull().default("true"),
  lastRunAt: text("last_run_at"),
  nextRunAt: text("next_run_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Report sharing - who can access which reports
export const reportShares = pgTable("report_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull(), // Either definition or saved report
  reportType: text("report_type").notNull(), // "definition" or "saved"
  sharedWith: varchar("shared_with").notNull(), // User ID or role ID
  shareType: text("share_type").notNull(), // "user" or "role"
  canEdit: text("can_edit").notNull().default("false"),
  sharedBy: varchar("shared_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Report audit logs - tracks all report activities
export const reportAuditLogs = pgTable("report_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  userName: text("user_name"),
  actionType: text("action_type").notNull(), // created, edited, deleted, generated, exported, scheduled, shared
  targetType: text("target_type").notNull(), // definition, saved_report, schedule
  targetId: varchar("target_id").notNull(),
  targetName: text("target_name"),
  departmentId: varchar("department_id"),
  details: text("details"), // JSON: additional context
  ipAddress: text("ip_address"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Department report settings - per-department configuration
export const departmentReportSettings = pgTable("department_report_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  departmentId: varchar("department_id").notNull().unique(),
  enabled: text("enabled").notNull().default("true"),
  allowCustomReports: text("allow_custom_reports").notNull().default("true"),
  allowScheduledReports: text("allow_scheduled_reports").notNull().default("true"),
  allowExport: text("allow_export").notNull().default("true"),
  defaultExportFormat: text("default_export_format").notNull().default("pdf"),
  retentionDays: integer("retention_days").notNull().default(90), // How long to keep saved reports
  maxScheduledReports: integer("max_scheduled_reports").notNull().default(10),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas for reports
export const insertReportDefinitionSchema = createInsertSchema(reportDefinitions).omit({ id: true });
export const insertReportFieldSchema = createInsertSchema(reportFields).omit({ id: true });
export const insertSavedReportSchema = createInsertSchema(savedReports).omit({ id: true });
export const insertReportScheduleSchema = createInsertSchema(reportSchedules).omit({ id: true });
export const insertReportShareSchema = createInsertSchema(reportShares).omit({ id: true });
export const insertReportAuditLogSchema = createInsertSchema(reportAuditLogs).omit({ id: true });
export const insertDepartmentReportSettingsSchema = createInsertSchema(departmentReportSettings).omit({ id: true });

// Types for reports
export type ReportDefinition = typeof reportDefinitions.$inferSelect;
export type InsertReportDefinition = z.infer<typeof insertReportDefinitionSchema>;
export type ReportField = typeof reportFields.$inferSelect;
export type InsertReportField = z.infer<typeof insertReportFieldSchema>;
export type SavedReport = typeof savedReports.$inferSelect;
export type InsertSavedReport = z.infer<typeof insertSavedReportSchema>;
export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type InsertReportSchedule = z.infer<typeof insertReportScheduleSchema>;
export type ReportShare = typeof reportShares.$inferSelect;
export type InsertReportShare = z.infer<typeof insertReportShareSchema>;
export type ReportAuditLog = typeof reportAuditLogs.$inferSelect;
export type InsertReportAuditLog = z.infer<typeof insertReportAuditLogSchema>;
export type DepartmentReportSettings = typeof departmentReportSettings.$inferSelect;
export type InsertDepartmentReportSettings = z.infer<typeof insertDepartmentReportSettingsSchema>;

// Report configuration type for the JSON field
export interface ReportConfiguration {
  dataSource: ReportDataSource;
  fields: Array<{
    fieldId: string;
    fieldName: string;
    displayName: string;
    visible: boolean;
    order: number;
  }>;
  filters: Array<{
    fieldName: string;
    operator: "equals" | "not_equals" | "contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "between" | "in" | "is_null" | "is_not_null";
    value: string | number | boolean | string[];
    value2?: string | number; // For "between" operator
  }>;
  sorting: Array<{
    fieldName: string;
    direction: "asc" | "desc";
  }>;
  grouping?: {
    fieldName: string;
    aggregations: Array<{
      fieldName: string;
      function: "count" | "sum" | "avg" | "min" | "max";
    }>;
  };
  visualization: {
    type: "table" | "bar_chart" | "line_chart" | "pie_chart" | "area_chart";
    options?: Record<string, unknown>;
  };
  dateRange?: {
    type: "last_7_days" | "last_30_days" | "last_90_days" | "this_month" | "last_month" | "this_year" | "custom";
    startDate?: string;
    endDate?: string;
  };
}
