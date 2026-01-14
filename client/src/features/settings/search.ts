// Settings search index with all searchable terms and their navigation paths
export const settingsSearchIndex = [
  // General Settings - Company Information
  { 
    term: "company name", 
    section: "general-company", 
    category: "Company Information",
    description: "Set your company or organization name"
  },
  { 
    term: "platform name", 
    section: "general-company", 
    category: "Company Information",
    description: "Customize the platform display name"
  },
  { 
    term: "support email", 
    section: "general-company", 
    category: "Company Information",
    description: "Primary support contact email address"
  },
  { 
    term: "company timezone", 
    section: "general-company", 
    category: "Company Information",
    description: "Default company timezone"
  },
  
  // General Settings - Date & Time
  { 
    term: "timezone", 
    section: "general-datetime", 
    category: "Date & Time",
    description: "Configure default timezone settings"
  },
  { 
    term: "date format", 
    section: "general-datetime", 
    category: "Date & Time",
    description: "Set date display format (MDY, DMY, YMD)"
  },
  { 
    term: "time format", 
    section: "general-datetime", 
    category: "Date & Time",
    description: "Set time display format (12h, 24h)"
  },
  { 
    term: "week start", 
    section: "general-datetime", 
    category: "Date & Time",
    description: "Configure which day starts the week"
  },
  
  // General Settings - User Defaults
  { 
    term: "default theme", 
    section: "general-defaults", 
    category: "User Defaults",
    description: "Default theme for new users"
  },
  { 
    term: "landing page", 
    section: "general-defaults", 
    category: "User Defaults",
    description: "Default landing page for users"
  },
  { 
    term: "language", 
    section: "general-defaults", 
    category: "User Defaults",
    description: "Default language setting"
  },
  
  // Branding Settings
  { 
    term: "branding", 
    section: "branding-logo", 
    category: "Brand Identity",
    description: "Upload logos and customize brand colors"
  },
  { 
    term: "logo", 
    section: "branding-logo", 
    category: "Brand Identity",
    description: "Upload company logo for light and dark themes"
  },
  { 
    term: "favicon", 
    section: "branding-logo", 
    category: "Brand Identity",
    description: "Upload website favicon icon"
  },
  { 
    term: "colors", 
    section: "branding-colors", 
    category: "Brand Identity",
    description: "Set primary and secondary brand colors"
  },
  { 
    term: "primary color", 
    section: "branding-colors", 
    category: "Brand Colors",
    description: "Main brand color used throughout interface"
  },
  { 
    term: "accent color", 
    section: "branding-colors", 
    category: "Brand Colors",
    description: "Secondary accent color for highlights"
  },
  { 
    term: "custom css", 
    section: "branding-css", 
    category: "Advanced Styling",
    description: "Custom CSS for advanced styling overrides"
  },
  
  // Notification Settings
  { 
    term: "notifications", 
    section: "notifications-email", 
    category: "Communication",
    description: "Configure notification preferences"
  },
  { 
    term: "email notifications", 
    section: "notifications-email", 
    category: "Email Settings",
    description: "Email notification defaults and preferences"
  },
  { 
    term: "in-app notifications", 
    section: "notifications-inapp", 
    category: "In-App Settings",
    description: "Browser and desktop notification settings"
  },
  { 
    term: "desktop notifications", 
    section: "notifications-inapp", 
    category: "In-App Settings",
    description: "Browser desktop notification settings"
  },
  { 
    term: "sound alerts", 
    section: "notifications-inapp", 
    category: "In-App Settings",
    description: "Audio alert settings for notifications"
  },
  
  // AI Settings
  { 
    term: "ai", 
    section: "ai-embeddings", 
    category: "AI Configuration",
    description: "Configure AI models and providers"
  },
  { 
    term: "embedding", 
    section: "ai-embeddings", 
    category: "AI Embeddings",
    description: "Configure embedding models for search and RAG"
  },
  { 
    term: "openai", 
    section: "ai-embeddings", 
    category: "AI Providers",
    description: "Configure OpenAI API settings and models"
  },
  { 
    term: "ollama", 
    section: "ai-embeddings", 
    category: "AI Providers",
    description: "Configure local Ollama model settings"
  },
  { 
    term: "rag", 
    section: "ai-embeddings", 
    category: "AI Features",
    description: "Retrieval Augmented Generation settings"
  },
  { 
    term: "vectorization", 
    section: "ai-embeddings", 
    category: "AI Processing",
    description: "Auto-vectorization and chunk settings"
  },
  { 
    term: "chat models", 
    section: "ai-chat", 
    category: "AI Chat",
    description: "Configure chat AI models and parameters"
  },
  { 
    term: "gpt", 
    section: "ai-chat", 
    category: "AI Models",
    description: "Configure GPT model settings and parameters"
  },
  { 
    term: "claude", 
    section: "ai-chat", 
    category: "AI Models",
    description: "Configure Claude AI model settings"
  },
  { 
    term: "temperature", 
    section: "ai-chat", 
    category: "AI Parameters",
    description: "Adjust AI model temperature and creativity"
  },
  { 
    term: "tokens", 
    section: "ai-chat", 
    category: "AI Limits",
    description: "Set token limits and usage parameters"
  },
  { 
    term: "content safety", 
    section: "ai-safety", 
    category: "AI Safety",
    description: "Content filtering and safety settings"
  },
  { 
    term: "pii detection", 
    section: "ai-safety", 
    category: "AI Compliance",
    description: "Personally identifiable information detection"
  },
  
  // User Management
  { 
    term: "users", 
    section: "users-directory", 
    category: "User Management",
    description: "Manage user accounts and profiles"
  },
  { 
    term: "user directory", 
    section: "users-directory", 
    category: "User Management",
    description: "View and manage all user accounts"
  },
  { 
    term: "user creation", 
    section: "users-directory", 
    category: "User Management",
    description: "Create new user accounts manually or bulk import"
  },
  { 
    term: "invite", 
    section: "users-invitations", 
    category: "User Invitations",
    description: "Send invitations and manage user onboarding"
  },
  { 
    term: "invitations", 
    section: "users-invitations", 
    category: "User Invitations",
    description: "Manage pending and sent user invitations"
  },
  { 
    term: "authentication", 
    section: "users-auth", 
    category: "Security",
    description: "Configure login methods and security policies"
  },
  { 
    term: "password", 
    section: "users-auth", 
    category: "Security",
    description: "Set password requirements and policies"
  },
  { 
    term: "sso", 
    section: "users-auth", 
    category: "Security",
    description: "Configure single sign-on providers"
  },
  { 
    term: "saml", 
    section: "users-auth", 
    category: "SSO Integration",
    description: "SAML authentication configuration"
  },
  { 
    term: "oauth", 
    section: "users-auth", 
    category: "SSO Integration",
    description: "OAuth provider configuration"
  },
  
  // Roles & Permissions
  { 
    term: "roles", 
    section: "roles-management", 
    category: "Access Control",
    description: "Create and manage user roles"
  },
  { 
    term: "permissions", 
    section: "roles-permissions", 
    category: "Access Control",
    description: "Configure role-based permissions matrix"
  },
  { 
    term: "admin", 
    section: "roles-management", 
    category: "User Roles",
    description: "Manage administrator privileges"
  },
  { 
    term: "security policies", 
    section: "roles-security", 
    category: "Security",
    description: "Account security and audit policies"
  },
  { 
    term: "audit logging", 
    section: "roles-security", 
    category: "Security Audit",
    description: "Enable and configure audit logging"
  },
  { 
    term: "session timeout", 
    section: "roles-security", 
    category: "Session Security",
    description: "Configure session timeout duration"
  },
  
  // Departments
  { 
    term: "departments", 
    section: "departments-list", 
    category: "Organization",
    description: "Organize users into departments and teams"
  },
  { 
    term: "hierarchy", 
    section: "departments-hierarchy", 
    category: "Organization",
    description: "Set up organizational hierarchy structure"
  },
  { 
    term: "department settings", 
    section: "departments-settings", 
    category: "Department Config",
    description: "Configure department-specific settings"
  },
  
  // Helpdesk Settings
  { 
    term: "helpdesk", 
    section: "helpdesk-overview", 
    category: "Support System",
    description: "Configure helpdesk and support system"
  },
  { 
    term: "tickets", 
    section: "helpdesk-tickets", 
    category: "Support System",
    description: "Configure ticket creation and workflow"
  },
  { 
    term: "ticket types", 
    section: "helpdesk-tickets", 
    category: "Ticket Management",
    description: "Define ticket categories and types"
  },
  { 
    term: "custom fields", 
    section: "helpdesk-tickets", 
    category: "Ticket Customization",
    description: "Create custom fields for tickets"
  },
  { 
    term: "sla", 
    section: "helpdesk-sla", 
    category: "Service Level",
    description: "Set SLA policies and response times"
  },
  { 
    term: "sla policies", 
    section: "helpdesk-sla", 
    category: "Service Level",
    description: "Configure SLA targets and warnings"
  },
  { 
    term: "email integration", 
    section: "helpdesk-email", 
    category: "Email Settings",
    description: "Configure email integration for tickets"
  },
  { 
    term: "email templates", 
    section: "helpdesk-email", 
    category: "Email Templates",
    description: "Customize email notification templates"
  },
  { 
    term: "webhooks", 
    section: "helpdesk-webhooks", 
    category: "Integrations",
    description: "Set up webhook notifications for tickets"
  },
  { 
    term: "escalation", 
    section: "helpdesk-escalation", 
    category: "Ticket Routing",
    description: "Configure automatic ticket escalation rules"
  },
  { 
    term: "escalation rules", 
    section: "helpdesk-escalation", 
    category: "Ticket Routing",
    description: "Set up time-based and priority escalation"
  },
  
  // Documentation
  { 
    term: "documentation", 
    section: "docs-overview", 
    category: "Knowledge Base",
    description: "Manage documentation and knowledge base"
  },
  { 
    term: "books", 
    section: "docs-overview", 
    category: "Content Management",
    description: "Organize documentation into books and chapters"
  },
  { 
    term: "version control", 
    section: "docs-versioning", 
    category: "Content Management",
    description: "Configure document version history and retention"
  },
  { 
    term: "version history", 
    section: "docs-versioning", 
    category: "Version Control",
    description: "Manage document version history settings"
  },
  { 
    term: "access control", 
    section: "docs-access", 
    category: "Document Security",
    description: "Configure who can view and edit documents"
  },
  { 
    term: "document permissions", 
    section: "docs-access", 
    category: "Document Security",
    description: "Set document viewing and editing permissions"
  },
  
  // Reports
  { 
    term: "reports", 
    section: "reports-overview", 
    category: "Analytics",
    description: "Configure reports and analytics"
  },
  { 
    term: "analytics", 
    section: "reports-overview", 
    category: "Data Insights",
    description: "View analytics and performance metrics"
  },
  { 
    term: "report defaults", 
    section: "reports-defaults", 
    category: "Report Settings",
    description: "Configure default export and retention settings"
  },
  { 
    term: "export", 
    section: "reports-defaults", 
    category: "Data Export",
    description: "Configure report export formats and settings"
  },
  { 
    term: "scheduled reports", 
    section: "reports-scheduled", 
    category: "Automation",
    description: "Create and manage scheduled reports"
  },
  { 
    term: "report scheduling", 
    section: "reports-scheduled", 
    category: "Automation",
    description: "Configure automatic report generation"
  },
  
  // Integrations & Links
  { 
    term: "links", 
    section: "integrations-links", 
    category: "External Resources",
    description: "Manage external links and resources"
  },
  { 
    term: "external links", 
    section: "integrations-links", 
    category: "External Resources",
    description: "Configure external tools and resource links"
  },
  { 
    term: "integrations", 
    section: "integrations-links", 
    category: "Third-party Services",
    description: "Configure integrations with external services"
  },
  { 
    term: "api settings", 
    section: "integrations-api", 
    category: "API Configuration",
    description: "Manage API keys and rate limiting"
  },
  { 
    term: "api keys", 
    section: "integrations-api", 
    category: "API Security",
    description: "Manage API authentication keys"
  },
  { 
    term: "rate limiting", 
    section: "integrations-api", 
    category: "API Performance",
    description: "Configure API usage rate limits"
  },
  
  // Maintenance
  { 
    term: "announcements", 
    section: "maintenance-announcements", 
    category: "System Messages",
    description: "Create and manage system announcements"
  },
  { 
    term: "system announcements", 
    section: "maintenance-announcements", 
    category: "System Messages",
    description: "Manage platform-wide announcements"
  },
  { 
    term: "monitoring", 
    section: "maintenance-infrastructure", 
    category: "System Health",
    description: "Monitor system health and performance"
  },
  { 
    term: "infrastructure", 
    section: "maintenance-infrastructure", 
    category: "System Management",
    description: "Monitor services and infrastructure health"
  },
  { 
    term: "service monitoring", 
    section: "maintenance-infrastructure", 
    category: "System Health",
    description: "Configure service health monitoring"
  },
  { 
    term: "maintenance", 
    section: "maintenance-system", 
    category: "System Management",
    description: "Schedule maintenance windows and system updates"
  },
  { 
    term: "maintenance mode", 
    section: "maintenance-system", 
    category: "System Control",
    description: "Enable site-wide maintenance mode"
  },
  { 
    term: "backup", 
    section: "maintenance-system", 
    category: "Data Protection",
    description: "Configure system backups and recovery"
  },
  { 
    term: "database", 
    section: "maintenance-system", 
    category: "Data Management",
    description: "Database management and optimization"
  }
];

export const searchSettings = (query: string) => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Filter and score results
  const results = settingsSearchIndex
    .filter(item => 
      item.term.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery)
    )
    .map(item => ({
      ...item,
      // Calculate relevance score
      score: (
        (item.term.toLowerCase().startsWith(normalizedQuery) ? 100 : 0) +
        (item.term.toLowerCase().includes(normalizedQuery) ? 50 : 0) +
        (item.category.toLowerCase().includes(normalizedQuery) ? 25 : 0) +
        (item.description.toLowerCase().includes(normalizedQuery) ? 10 : 0)
      )
    }))
    .sort((a, b) => b.score - a.score) // Sort by relevance score
    .slice(0, 10); // Limit to 10 results
  
  return results;
};