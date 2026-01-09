import { LucideIcon } from "lucide-react";

export interface SettingsNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  children?: SettingsNavItem[];
  badge?: string;
}

export interface DepartmentHelpdeskConfig {
  id: string;
  departmentId: string;
  ticketEditorConfig: TicketEditorConfig;
  emailConfig: EmailConfig;
  webhooks: WebhookConfig[];
  interactionRules: InteractionRules;
}

export interface TicketEditorConfig {
  customFields: CustomField[];
  requiredFields: string[];
  enableRichText: boolean;
  enableAttachments: boolean;
  enableScreenshots: boolean;
  maxAttachmentSize: number;
  allowedCategories: string[];
  priorityOptions: string[];
  autoTagging: boolean;
}

export interface CustomField {
  id: string;
  name: string;
  type: "text" | "textarea" | "select" | "multiselect" | "checkbox" | "date" | "number";
  options?: string[];
  required: boolean;
  order: number;
}

export interface EmailConfig {
  enabled: boolean;
  fromAddress: string;
  fromName: string;
  replyToAddress: string;
  signatureHtml: string;
  templates: EmailTemplate[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  trigger: "ticket_created" | "ticket_updated" | "ticket_resolved" | "sla_warning" | "custom";
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  headers: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
  };
}

export interface InteractionRules {
  allowExternalSubmission: boolean;
  requireAuthentication: boolean;
  autoAssignToAgent: boolean;
  escalationEnabled: boolean;
  escalationTimeMinutes: number;
  escalationNotifyEmails: string[];
  businessHoursOnly: boolean;
  customBusinessHours?: {
    start: string;
    end: string;
    days: number[];
    timezone: string;
  };
}

export interface DocumentationConfig {
  id: string;
  departmentId: string;
  enabled: boolean;
  publicAccess: boolean;
  categories: DocCategory[];
  accessRoles: string[];
  searchEnabled: boolean;
  aiSuggestionsEnabled: boolean;
}

export interface DocCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
  parentId?: string;
}
