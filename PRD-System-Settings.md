# Product Requirements Document: System Settings Page

## Executive Summary

This PRD outlines the requirements for a comprehensive **System Settings** page that consolidates all configurable aspects of Project Sakura into a unified, user-friendly interface. The settings system will support both **global (company-wide)** settings and **department-specific** settings, with intelligent scoping based on user permissions and organizational context.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Goals & Objectives](#goals--objectives)
3. [User Personas](#user-personas)
4. [Feature Requirements](#feature-requirements)
5. [Settings Taxonomy](#settings-taxonomy)
6. [UI/UX Design Specifications](#uiux-design-specifications)
7. [Technical Architecture](#technical-architecture)
8. [Success Metrics](#success-metrics)
9. [Future Considerations](#future-considerations)

---

## Current State Analysis

### Existing Settings Infrastructure

Project Sakura currently has:

1. **System Settings Table**: Key-value store for global settings with 60+ configuration keys
2. **Navigation Structure**: Hierarchical settings navigation with 11 top-level sections
3. **Partial Implementation**: Some settings pages exist (General, AI, Helpdesk, etc.)
4. **Department Context**: Some features support department-scoped configuration

### Pain Points

1. **Incomplete Implementation**: Not all navigation items have corresponding settings pages
2. **Scattered Configuration**: Settings are distributed across multiple sections without clear hierarchy
3. **Mixed Scoping**: No clear visual distinction between global vs department-specific settings
4. **Limited Discoverability**: Users may not know what settings are available or where to find them
5. **Permission Complexity**: RBAC system exists but not fully integrated with settings UI

---

## Goals & Objectives

### Primary Goals

1. **Unified Experience**: Create a single, intuitive settings page that consolidates all configuration
2. **Smart Scoping**: Automatically show relevant settings based on user role and selected department
3. **Clear Categorization**: Organize settings logically with visual hierarchy
4. **Permission-Aware**: Respect RBAC permissions and only show configurable settings
5. **Department Flexibility**: Support both global and department-specific configuration where appropriate

### Success Criteria

- All features in the platform have associated settings
- 100% of settings are categorized as global or department-specific
- Settings page loads in <500ms
- Users can find any setting in <10 seconds
- Zero permission bypass vulnerabilities

---

## User Personas

### 1. Super Admin
- **Needs**: Full control over all system settings, both global and department-specific
- **Access**: All settings sections, all departments
- **Goals**: Configure platform-wide defaults, manage security, oversee all departments

### 2. Department Head
- **Needs**: Configure settings specific to their department(s)
- **Access**: Department-scoped settings for assigned departments
- **Goals**: Customize helpdesk workflows, SLA policies, documentation access for their team

### 3. System Manager
- **Needs**: Manage technical infrastructure and integrations
- **Access**: AI configuration, webhooks, monitoring, API settings
- **Goals**: Ensure system reliability, configure integrations, monitor performance

### 4. HR Administrator
- **Needs**: Manage user accounts, roles, and organizational structure
- **Access**: User directory, roles, departments, audit logs
- **Goals**: Onboard users, assign permissions, maintain org structure

### 5. Report Analyst
- **Needs**: Create and schedule reports, manage data access
- **Access**: Report builder, scheduled reports, data source permissions
- **Goals**: Generate insights, automate reporting, share data with stakeholders

---

## Feature Requirements

### FR-1: Settings Navigation & Layout

#### FR-1.1: Sidebar Navigation
- **Description**: Left sidebar with hierarchical navigation structure
- **Requirements**:
  - Display all 11 main sections with icons and labels
  - Support expandable/collapsible child sections
  - Show badge indicators 
  - Highlight active section
  - Persist navigation state across sessions
  - Responsive design (collapse to hamburger menu on mobile)

#### FR-1.2: Department Selector
- **Description**: Global department context selector for scoped settings
- **Requirements**:
  - Dropdown to select department context
  - "Global Settings" option for platform-wide configuration
  - Show only departments user has permission to manage
  - Persist selection across navigation within settings
  - Display department color and hierarchy
  - Quick switch between departments

#### FR-1.3: Settings Header
- **Description**: Top section with breadcrumbs and actions
- **Requirements**:
  - Display current section and subsection
  - Show last saved timestamp
  - Quick search for settings
  - Help/documentation link for current section
  - Reset to defaults button (with confirmation)

### FR-2: Global Settings

All global settings affect the entire platform and require appropriate permissions.

#### FR-2.1: Profile Settings
**Scope**: User-specific (personal)
- Username, display name, email
- Avatar upload
- Bio and contact information
- Password change
- Two-factor authentication settings
- Personal notification preferences
- Theme preference (light/dark/auto)
- Timezone, language, date/time format

#### FR-2.2: General Settings
**Scope**: Global (Super Admin only)
- **Company Information**:
  - Company name
  - Platform name
  - Support email address
  - Company timezone
  - Default language
- **Date & Time Formats**:
  - Date format (MDY, DMY, YMD)
  - Time format (12h, 24h)
  - Week start day
- **User Defaults**:
  - Default theme for new users
  - Allow user theme overrides
  - Default landing page

#### FR-2.3: Branding Settings
**Scope**: Global (Super Admin only)
- Logo URL (light mode)
- Logo URL (dark mode)
- Favicon URL
- Primary brand color (with color picker)
- Secondary accent color
- Custom CSS (advanced)
- Login page customization
- Email template branding

#### FR-2.4: Notification Settings
**Scope**: Global defaults + User overrides
- **Email Notifications**:
  - New ticket assigned
  - Ticket updated
  - SLA warning
  - Weekly digest
  - New document published
  - @mentions in posts/comments
  - Event reminders
- **In-App Notifications**:
  - Desktop notifications (browser)
  - Sound alerts
  - Notification badge
  - Real-time vs batched
- **Notification Channels**:
  - Email
  - SMS (if configured)
  - Slack integration (future)
  - Microsoft Teams integration (future)

### FR-3: AI Configuration Settings

**Scope**: Global (AI settings manager permission required)

#### FR-3.1: Embedding Models
- **Provider Selection**: OpenAI, Ollama, Google (future)
- **Model Configuration**:
  - Model name (e.g., text-embedding-3-small)
  - Dimensions (768, 1536, 3072)
  - API key (masked input)
  - Base URL (for self-hosted)
- **Vectorization Settings**:
  - Auto-vectorization enabled
  - RAG enabled
  - Chunk size (for document splitting)
  - Chunk overlap
  - Batch size
- **Cost Management**:
  - Monthly token budget
  - Alert threshold
  - Usage dashboard

#### FR-3.2: Chat Models
- **Provider Selection**: OpenAI, Ollama, Google (future)
- **Model Configuration**:
  - Model name (e.g., gpt-4, claude-3)
  - Temperature (0.0 - 2.0 slider)
  - Max tokens
  - Top-p sampling
  - Frequency penalty
  - Presence penalty
- **AI Assistant Settings**:
  - Enable in document editor
  - Enable in ticket responses
  - Enable chatbot
  - System prompt customization
  - Tone settings (professional, casual, technical)

#### FR-3.3: AI Safety & Compliance
- **Content Filtering**:
  - Enable content safety filters
  - Blocked topics
  - PII detection and redaction
- **Audit**:
  - Log all AI interactions
  - Retention period for AI logs
  - Export AI usage reports

### FR-4: User Management Settings

**Scope**: Global (Users permission required)

#### FR-4.1: User Directory
- **User List**:
  - Search and filter users
  - Bulk actions (export, delete, assign roles)
  - User status (active, suspended, archived)
  - Last login timestamp
  - Department assignment
- **User Creation**:
  - Manual user creation form
  - Bulk import from CSV
  - Send invitation email
  - Set initial password or require password reset
- **User Profile Fields**:
  - Define custom fields (text, dropdown, checkbox)
  - Required vs optional fields
  - Visibility settings (public, internal, private)

#### FR-4.2: Invitation Management
- **Invitation Settings**:
  - Email template for invitations
  - Invitation expiry duration (1-30 days)
  - Auto-assign role on signup
  - Require email verification
- **Invitation List**:
  - View pending invitations
  - Resend invitation
  - Revoke invitation
  - Invitation link (copyable)

#### FR-4.3: Authentication Settings
- **Login Options**:
  - Username/password
  - Email/password
  - SSO providers (Google, Microsoft, Okta)
  - SAML configuration
  - OAuth configuration
- **Security Policies**:
  - Require strong passwords
  - Password minimum length
  - Password complexity rules
  - Password expiry (days)
  - Session timeout (minutes)
  - Max concurrent sessions
  - IP whitelist/blacklist

### FR-5: Roles & Permissions Settings

**Scope**: Global (Roles permission required)

#### FR-5.1: System Roles
- **Role Management**:
  - Create/edit/delete roles
  - Assign role color
  - Set role priority (for conflict resolution)
  - System roles (cannot delete: Super Admin)
- **Permission Assignment**:
  - Visual permission matrix
  - Group by category (helpdesk, docs, users, etc.)
  - Global vs scoped permissions
  - Quick presets (Viewer, Editor, Admin)
- **Role Templates**:
  - Save custom role templates
  - Import/export roles
  - Clone existing role

#### FR-5.2: Security Policies
- **Access Control**:
  - Default role for new users
  - Require role for specific features
  - Department-based auto-assignment
- **Audit & Compliance**:
  - Enable audit logging
  - Log retention period (30-365 days)
  - Sensitive action alerts
  - Failed login attempt threshold
  - Account lockout duration

### FR-6: Department Settings

**Scope**: Global + Department-specific

#### FR-6.1: Department Management (Global)
- **Department List**:
  - Hierarchical tree view
  - Drag-and-drop to reorganize
  - Department color coding
  - Member count
- **Department Creation**:
  - Department name and description
  - Parent department (optional)
  - Department head assignment
  - Department color
  - Department managers (primary/secondary)
- **Department Hierarchy**:
  - Define hierarchy types (subdivision, satellite, etc.)
  - Inheritance settings (inherit parent settings)
  - Cross-department permissions

#### FR-6.2: Department-Specific Settings
Settings that apply only to a selected department:
- Helpdesk configuration
- Documentation access policies
- Report access
- Custom workflows
- Department-specific external links
- Department announcements

### FR-7: Helpdesk Settings

**Scope**: Department-specific (Helpdesk settings permission required)

#### FR-7.1: Helpdesk Overview
- **Enable/Disable**:
  - Toggle helpdesk for this department
  - Helpdesk name and description
  - Public access (allow external users)
- **General Settings**:
  - Ticket ID prefix (e.g., DEPT-001)
  - Ticket numbering format
  - Default priority
  - Default assignee (unassigned, round-robin, specific user)

#### FR-7.2: Ticket Settings
- **Ticket Creation Form**:
  - Form builder with drag-and-drop
  - Custom fields (text, dropdown, multiselect, date, number)
  - Field validation rules
  - Conditional fields
  - Field categories/sections
  - Required fields
- **Ticket Types**:
  - Define ticket categories (Hardware, Software, Network, etc.)
  - Category icons and colors
  - Category-specific fields
- **Ticket Workflow**:
  - Enable/disable comments
  - Internal notes (staff only)
  - Attachments allowed (max size, allowed types)
  - Screenshots enabled
  - Rich text editor vs plain text

#### FR-7.3: SLA Policies
- **SLA States**:
  - Define custom states (New, In Progress, Resolved, etc.)
  - State colors and order
  - Mark states as final (closing states)
  - Set default state
  - Target hours per state
- **SLA Policies**:
  - Create policies by priority (urgent, high, medium, low)
  - First response time target (hours)
  - Resolution time target (hours)
  - Business hours vs 24/7
  - SLA warning threshold (%)
  - Breach notifications

#### FR-7.4: Email Integration
- **Inbound Email**:
  - Email address for ticket creation
  - Provider (custom, Mailgun, SendGrid)
  - Auto-create tickets from email
  - Default priority for email tickets
  - Reply-to address
- **Email Templates**:
  - Template for ticket created
  - Template for ticket updated
  - Template for ticket resolved
  - Template for SLA warning
  - Custom templates
  - Template variables (ticket ID, title, priority, etc.)
  - HTML editor with preview

#### FR-7.5: Webhooks
- **Webhook Management**:
  - Create/edit/delete webhooks
  - Webhook URL
  - Secret key (for verification)
  - Events to trigger (ticket.created, ticket.updated, etc.)
  - Custom headers
  - Retry policy (max retries, delay)
  - Timeout (seconds)
  - Test webhook button
- **Webhook Logs**:
  - Recent webhook deliveries
  - Status (success, failed)
  - Response time
  - Response body
  - Retry attempts

#### FR-7.6: Escalation Rules
- **Rule Creation**:
  - Rule name and description
  - Trigger type (time-based, priority-based, state-based)
  - Conditions (priority = urgent AND state = new)
  - Actions (assign to user, escalate to department, notify managers)
  - Rule priority/order
  - Enable/disable rule
- **Business Hours**:
  - Define business hours
  - Timezone
  - Holidays calendar
  - Pause SLA during non-business hours

### FR-8: Documentation Settings

**Scope**: Department-specific (Documentation permission required)

#### FR-8.1: Documentation Overview
- **Enable/Disable**:
  - Toggle documentation for this department
  - Public access (allow external users)
- **General Settings**:
  - Default visibility (public, department, private)
  - Allow user-created books
  - Require approval for publishing
  - Search indexing enabled

#### FR-8.2: Version History
- **Version Control**:
  - Enable version history
  - Retention policy (all, limit by count, limit by time, auto-archive)
  - Retention count (# of versions to keep)
  - Retention days (# of days to keep)
  - Auto-archive after X days
  - Show archived versions in search
- **Version Comparison**:
  - Enable side-by-side comparison
  - Highlight changes
  - Show author and timestamp

#### FR-8.3: Access Control
- **Permissions**:
  - Who can view documents (all users, department only, specific roles)
  - Who can create books (all users, specific roles)
  - Who can edit pages (authors only, editors, all users)
  - Who can publish (require reviewer approval)
- **Reviewer Assignment**:
  - Auto-assign reviewers by department
  - Reviewer role requirements
  - Notification on review request

### FR-9: Reports Settings

**Scope**: Department-specific (Reports settings permission required)

#### FR-9.1: Reports Overview
- **Enable/Disable**:
  - Toggle reports for this department
  - Allow custom reports (vs templates only)
  - Allow scheduled reports
  - Allow report export
- **Data Access**:
  - Which data sources can be queried (tickets, users, SLA, audit logs)
  - Row-level security (filter by department)
  - PII restrictions

#### FR-9.2: Report Defaults
- **Export Settings**:
  - Default export format (PDF, CSV, Excel)
  - PDF page size (A4, Letter)
  - Include logo in exports
  - Include timestamp
- **Retention**:
  - Saved report retention (days)
  - Auto-delete old reports
  - Max scheduled reports per user

#### FR-9.3: Scheduled Reports
- **Scheduling**:
  - Max scheduled reports for department
  - Allowed frequencies (daily, weekly, monthly)
  - Allowed days/times
  - Email delivery limits
- **Performance**:
  - Query timeout (seconds)
  - Max rows per report
  - Cache duration (minutes)

### FR-10: Integrations & Custom Links

**Scope**: Global + Department-specific

#### FR-10.1: External Links
- **Link Management**:
  - Add/edit/delete external links
  - Link title and URL
  - Description
  - Icon (Lucide icon name or uploaded image)
  - Category grouping
  - Order/sorting
  - Visibility (company-wide or department-specific)
- **Link Categories**:
  - Resources, Tools, Documentation, etc.
  - Custom categories

#### FR-10.2: API Settings (Future)
- API key management
- Rate limiting
- Webhook endpoints
- OAuth client credentials
- API usage dashboard

### FR-11: Maintenance & Infrastructure

**Scope**: Global (Infrastructure permission required)

#### FR-11.1: Announcements
- **Announcement Management**:
  - Create/edit/delete announcements
  - Title and message
  - Type (info, warning, success, error)
  - Link (optional CTA)
  - Active/inactive toggle
  - Department-specific or company-wide
  - Start date and end date (optional scheduling)
- **Display Settings**:
  - Banner position (top, bottom)
  - Dismissible by users
  - Auto-dismiss after X seconds
  - Show on login page

#### FR-11.2: Infrastructure Monitoring
- **Service Monitoring**:
  - Add/edit/delete monitored services
  - Service name and description
  - Endpoint URL
  - Service type (API, database, website)
  - Check interval (seconds)
  - Expected status code
  - Latency threshold (ms)
  - Timeout (seconds)
  - Enable/disable monitoring
- **Health Checks**:
  - Last check timestamp
  - Current status (operational, degraded, down)
  - Current latency
  - Consecutive failures
  - Uptime percentage (24h, 7d, 30d)

#### FR-11.3: Service Alerts
- **Alert Configuration**:
  - Alert on service down
  - Alert on high latency
  - Alert recipients (emails, roles)
  - Alert cooldown period (minutes)
- **Alert History**:
  - View recent alerts
  - Alert type and severity
  - Acknowledgment status
  - Time to resolution
  - Alert notes

#### FR-11.4: System Maintenance
- **Maintenance Mode**:
  - Enable maintenance mode (site-wide downtime)
  - Maintenance message
  - Scheduled maintenance window
  - Allow admin access during maintenance
- **Database Management**:
  - View database size
  - Run database vacuum/optimize
  - Export database backup
  - Import database backup
- **Logs & Debugging**:
  - View application logs
  - Log level (debug, info, warn, error)
  - Log retention (days)
  - Download logs

---

## Settings Taxonomy

### Global Settings (Platform-Wide)

These settings affect the entire system and typically require Super Admin or specific high-level permissions.

| Setting Category | Sub-Category | Permission Required | Description |
|------------------|--------------|---------------------|-------------|
| **General** | Company Info | settings.general.manage | Company name, support email, timezone |
| | Date/Time Formats | settings.general.manage | Date format, time format, week start |
| | User Defaults | settings.general.manage | Default theme, landing page |
| **Branding** | Logo & Favicon | settings.branding.manage | Logo URLs, favicon |
| | Colors | settings.branding.manage | Primary color, accent color |
| | Custom CSS | settings.branding.manage | Advanced styling overrides |
| **Notifications** | Email Defaults | settings.notifications.manage | Global email notification defaults |
| | In-App Defaults | settings.notifications.manage | Global in-app notification defaults |
| **AI Configuration** | Embedding Models | ai.settings.manage | Provider, model, dimensions |
| | Chat Models | ai.settings.manage | Provider, model, temperature |
| | Safety & Compliance | ai.settings.manage | Content filters, PII detection |
| **Users** | User Directory | users.view, users.create | User list, create users |
| | Invitations | users.create | Invite users, invitation settings |
| | Authentication | settings.security.manage | Login options, SSO, SAML |
| **Roles** | System Roles | N/A (view all roles) | Create/edit roles |
| | Permissions | N/A (assign permissions) | Permission matrix |
| | Security Policies | settings.security.manage | Audit logging, password policies |
| **Departments** | Department List | departments.view | View all departments |
| | Create/Edit Dept | departments.create, departments.edit | Manage department structure |
| **Integrations** | External Links (Global) | settings.general.manage | Company-wide external links |
| | API Settings | settings.general.manage | API keys, rate limiting |
| **Maintenance** | Announcements | settings.general.manage | Create/manage announcements |
| | Infrastructure | settings.general.manage | Monitor services, alerts |
| | System Maintenance | settings.general.manage | Maintenance mode, database |

### Department-Specific Settings

These settings are scoped to individual departments and can have different values per department.

| Setting Category | Sub-Category | Permission Required | Description |
|------------------|--------------|---------------------|-------------|
| **Helpdesk** | Overview | helpdesk.settings.manage | Enable/disable, general config |
| | Ticket Settings | helpdesk.settings.manage | Custom fields, ticket types |
| | SLA Policies | helpdesk.sla.manage | States, policies, targets |
| | Email Templates | helpdesk.settings.manage | Inbound email, templates |
| | Webhooks | helpdesk.webhooks.manage | Webhook endpoints, events |
| | Escalation Rules | helpdesk.settings.manage | Auto-routing, escalation |
| **Documentation** | Overview | docs.settings.manage | Enable/disable, visibility |
| | Version History | docs.settings.manage | Retention policy, archiving |
| | Access Control | docs.settings.manage | Who can view/edit/publish |
| **Reports** | Overview | reports.settings.manage | Enable/disable, data access |
| | Defaults | reports.settings.manage | Export format, retention |
| | Scheduled Reports | reports.settings.manage | Max schedules, frequencies |
| **Integrations** | External Links (Dept) | departments.edit | Department-specific links |

### Personal Settings (User-Level)

These settings are specific to each user and override global defaults where applicable.

| Setting Category | Sub-Category | Permission Required | Description |
|------------------|--------------|---------------------|-------------|
| **Profile** | Basic Info | N/A (own profile) | Username, display name, avatar |
| | Security | N/A (own profile) | Password, 2FA |
| | Preferences | N/A (own profile) | Theme, timezone, language |
| | Notifications | N/A (own profile) | Personal notification overrides |

---

## UI/UX Design Specifications

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ [< Back]  System Settings              [Department Selector ▾] │
├──────────────┬──────────────────────────────────────────────────┤
│              │  ┌─────────────────────────────────────────────┐ │
│  Navigation  │  │  Section Header                             │ │
│  Sidebar     │  │  Breadcrumbs > Current Section              │ │
│              │  │  Last saved: 2 minutes ago       [Search] │ │
│              │  └─────────────────────────────────────────────┘ │
│  • Profile   │                                                  │
│  • General   │  ┌─────────────────────────────────────────────┐ │
│    • Brand   │  │  Settings Content Area                      │ │
│    • Notify  │  │                                             │ │
│  • AI        │  │  Settings cards with form controls          │ │
│  • Users     │  │  Organized by sub-sections                  │ │
│  • Roles     │  │                                             │ │
│  • Depts     │  │  [Save Changes]  [Reset to Defaults]       │ │
│  • Helpdesk  │  └─────────────────────────────────────────────┘ │
│  • Docs      │                                                  │
│  • Reports   │                                                  │
│  • Links     │                                                  │
│  • Maint     │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

### Design System

#### Colors
- **Primary Action**: Primary brand color (configurable)
- **Destructive Actions**: Red (#EF4444)
- **Success States**: Green (#10B981)
- **Warning States**: Amber (#F59E0B)
- **Info States**: Blue (#3B82F6)

#### Typography
- **Section Headers**: 2xl font, bold
- **Subsection Headers**: xl font, semibold
- **Setting Labels**: sm font, medium
- **Help Text**: xs font, normal, muted

#### Spacing
- **Section Padding**: 6 units (24px)
- **Card Padding**: 4 units (16px)
- **Form Field Spacing**: 4 units (16px)
- **Sidebar Width**: 256px

#### Components

##### Settings Card
```jsx
<SettingsCard
  title="Company Information"
  description="Basic information about your organization"
  icon={Building}
  badge="Required"
>
  <SettingsRow label="Company Name" helpText="Displayed in header">
    <Input value={companyName} onChange={...} />
  </SettingsRow>
  <SettingsRow label="Support Email">
    <Input type="email" value={supportEmail} onChange={...} />
  </SettingsRow>
</SettingsCard>
```

##### Settings Row
- Label on left (30% width)
- Input on right (70% width)
- Optional help text below input
- Optional info icon with tooltip

##### Department Selector
```jsx
<DepartmentSelector
  value={selectedDepartment}
  onChange={setSelectedDepartment}
  departments={departments}
  showGlobalOption={hasGlobalPermission}
  hierarchical={true}
/>
```

##### Permission Matrix
```jsx
<PermissionMatrix
  role={currentRole}
  permissions={allPermissions}
  onChange={handlePermissionChange}
  groupByCategory={true}
  showScope={true}
/>
```

### Visual Indicators

#### Scope Badges
- **Global**: Blue badge with globe icon
- **Department**: Color-coded badge with department color
- **Personal**: Gray badge with user icon

#### Save State Indicators
- **Unsaved Changes**: Orange dot next to section name
- **Saving**: Spinner icon
- **Saved**: Green checkmark (fades after 2s)
- **Error**: Red X with error message

#### Permission-Based Visibility
- **No Permission**: Section grayed out with lock icon
- **Read-Only**: Fields disabled with "View only" badge
- **Editable**: Normal state

### Responsive Design

#### Desktop (>1024px)
- Sidebar always visible
- Content area 2-column grid for form fields
- Department selector in header

#### Tablet (768-1024px)
- Collapsible sidebar (hamburger menu)
- Content area single column
- Department selector in header

#### Mobile (<768px)
- Full-width layout
- Sticky header with hamburger menu
- Bottom sheet for department selection
- Accordion-style sections

---

## Technical Architecture

### Frontend Architecture

#### Component Structure
```
SystemSettings/
├── index.tsx                     # Main settings page
├── components/
│   ├── SettingsSidebar.tsx       # Navigation sidebar
│   ├── SettingsHeader.tsx        # Header with breadcrumbs
│   ├── DepartmentSelector.tsx    # Department context selector
│   ├── SettingsCard.tsx          # Card container
│   ├── SettingsRow.tsx           # Form row layout
│   └── PermissionMatrix.tsx      # Permission grid
├── sections/
│   ├── ProfileSettings.tsx
│   ├── GeneralSettings.tsx
│   ├── BrandingSettings.tsx
│   ├── NotificationSettings.tsx
│   ├── AISettings.tsx
│   ├── UsersSettings.tsx
│   ├── RolesSettings.tsx
│   ├── DepartmentsSettings.tsx
│   ├── HelpdeskSettings.tsx
│   ├── DocumentationSettings.tsx
│   ├── ReportsSettings.tsx
│   ├── LinksSettings.tsx
│   └── MaintenanceSettings.tsx
├── hooks/
│   ├── useSettings.ts            # Global settings hook
│   ├── useDepartmentSettings.ts  # Department-scoped settings
│   └── usePermissions.ts         # Permission checking
└── types.ts                      # TypeScript types
```

#### State Management

**React Query** for server state:
```typescript
// Global settings
const { data: settings, mutate: updateSettings } = useQuery({
  queryKey: ['/api/settings'],
});

// Department-specific settings
const { data: deptSettings } = useQuery({
  queryKey: ['/api/departments', deptId, 'settings'],
  enabled: !!deptId,
});

// Optimistic updates for better UX
const updateMutation = useMutation({
  mutationFn: (data) => apiRequest('PATCH', '/api/settings', data),
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['/api/settings']);
    const previous = queryClient.getQueryData(['/api/settings']);
    queryClient.setQueryData(['/api/settings'], (old) => ({ ...old, ...newData }));
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['/api/settings'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['/api/settings']);
  },
});
```

**Context API** for UI state:
```typescript
const SettingsContext = createContext({
  selectedDepartment: null,
  setSelectedDepartment: () => {},
  unsavedChanges: false,
  setUnsavedChanges: () => {},
});
```

### Backend Architecture

#### API Endpoints

##### Settings Routes
```typescript
// Global settings
GET    /api/settings                    # Get all settings
PATCH  /api/settings                    # Update settings (bulk)
GET    /api/settings/:key               # Get single setting
PATCH  /api/settings/:key               # Update single setting
DELETE /api/settings/:key               # Reset to default

// Department settings
GET    /api/departments/:id/settings    # Get department settings
PATCH  /api/departments/:id/settings    # Update department settings

// User preferences
GET    /api/users/me/preferences        # Get user preferences
PATCH  /api/users/me/preferences        # Update user preferences
```

##### Validation
```typescript
// Zod schema for settings validation
const generalSettingsSchema = z.object({
  companyName: z.string().min(1).max(100),
  platformName: z.string().min(1).max(100),
  supportEmail: z.string().email(),
  defaultTimezone: z.string(),
  defaultLanguage: z.enum(['en', 'es', 'fr', 'de']),
  dateFormat: z.enum(['mdy', 'dmy', 'ymd']),
  timeFormat: z.enum(['12', '24']),
});

// Middleware for permission checking
async function requirePermission(permission: string) {
  return async (req, res, next) => {
    const hasPermission = await checkUserPermission(req.user.id, permission);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

#### Database Schema

**No Schema Changes Required**: The existing `system_settings` table supports all global settings via key-value pairs.

**New Tables for Department Settings**:
```sql
-- Department-specific settings
CREATE TABLE department_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(department_id, key)
);

-- User preferences (overrides)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, key)
);

-- Settings change audit
CREATE TABLE settings_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  setting_key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  scope_type TEXT NOT NULL, -- 'global', 'department', 'user'
  scope_id UUID, -- department_id or user_id
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Performance Considerations

#### Caching Strategy
- **Client-side**: React Query with 5-minute stale time
- **Server-side**: Redis cache for frequently accessed settings
- **Invalidation**: Invalidate cache on settings update

#### Lazy Loading
- Load section components dynamically (code splitting)
- Load department list only when department selector is opened
- Paginate user lists, role lists, audit logs

#### Optimistic Updates
- Update UI immediately on change
- Revert on error
- Show saving indicator during network request

---

## Success Metrics

### Quantitative Metrics

1. **Adoption & Usage**
   - % of admins who access settings page (target: 80% within first month)
   - Average time spent in settings (target: <5 minutes per session)
   - Settings updates per week (track engagement)

2. **Performance**
   - Settings page load time (target: <500ms)
   - Settings save time (target: <200ms)
   - Search result latency (target: <100ms)

3. **Discoverability**
   - Time to find a specific setting (target: <10 seconds)
   - % of users using search vs navigation (baseline)
   - Support tickets related to "can't find setting" (target: <5 per month)

4. **Errors & Issues**
   - Permission errors per month (target: <10)
   - Failed save attempts (target: <1%)
   - Settings conflicts (global vs dept) (target: 0)

### Qualitative Metrics

1. **User Satisfaction**
   - NPS score for settings experience (target: >40)
   - User feedback surveys
   - Task completion rate (can users complete configuration tasks?)

2. **Admin Efficiency**
   - Time to onboard new department (before/after comparison)
   - Time to configure helpdesk (before/after comparison)
   - Reduction in "how do I configure X" questions

3. **System Health**
   - Reduction in misconfiguration issues
   - Increase in proper permission scoping
   - Compliance with security policies

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Build settings page layout and navigation
- Implement department selector
- Create reusable setting components (SettingsCard, SettingsRow)
- Set up permission checking hooks
- Implement unsaved changes warning

### Phase 2: Core Global Settings (Weeks 3-4)
- Profile Settings
- General Settings
- Branding Settings
- Notification Settings (global defaults)

### Phase 3: User & Access Management (Weeks 5-6)
- User Directory
- Invitation Management
- Roles & Permissions
- Security Policies
- Department Management

### Phase 4: AI Configuration (Week 7)
- Embedding model configuration
- Chat model configuration
- AI safety settings
- Usage dashboard

### Phase 5: Department-Scoped Features (Weeks 8-10)
- Helpdesk settings (all subsections)
- Documentation settings
- Reports settings
- Department-specific external links

### Phase 6: Infrastructure & Maintenance (Week 11)
- Announcements management
- Infrastructure monitoring
- Service alerts
- System maintenance tools

### Phase 7: Polish & Optimization (Week 12)
- Search functionality
- Keyboard shortcuts
- Mobile responsive improvements
- Performance optimization
- Accessibility audit (WCAG 2.1 AA)
- Documentation and help tooltips

---

## Future Considerations

### Advanced Features (Post-MVP)

1. **Settings Templates**
   - Save department configuration as template
   - Apply template to new departments
   - Share templates across organizations (marketplace)

2. **Settings Versioning**
   - Track history of settings changes
   - Roll back to previous configuration
   - Diff view for settings comparison

3. **Bulk Operations**
   - Apply settings to multiple departments
   - Import/export settings as JSON
   - Settings migration wizard

4. **Advanced Permissions**
   - Delegated administration (department-level admins)
   - Approval workflows for sensitive changes
   - Time-based permissions (temporary access)

5. **Smart Recommendations**
   - AI-powered settings suggestions
   - Best practice alerts
   - Configuration optimization tips

6. **Integration Hub**
   - Pre-built integrations with popular tools (Slack, Teams, Jira)
   - API marketplace for third-party integrations
   - Webhook event catalog

7. **Multi-Tenancy**
   - Support for multiple organizations in one instance
   - Tenant-level isolation
   - Cross-tenant reporting (for MSPs)

8. **Compliance & Governance**
   - Compliance dashboard (SOC 2, GDPR, HIPAA)
   - Policy enforcement (e.g., require 2FA for all users)
   - Automated compliance reporting

---

## Appendix A: Settings Reference

### Complete Settings List

#### Global Settings (60+ keys)

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| companyName | string | "Sakura" | Company name displayed in header |
| platformName | string | "Sakura Helpdesk" | Platform/product name |
| supportEmail | string | "" | Support contact email |
| logoUrl | string | "" | URL to company logo (light mode) |
| faviconUrl | string | "" | URL to favicon |
| primaryColor | string | "#7c3aed" | Primary brand color (hex) |
| defaultTheme | enum | "system" | Default theme (light, dark, system) |
| allowUserThemeOverride | boolean | "true" | Allow users to override theme |
| defaultTimezone | string | "pst" | Default timezone |
| defaultLanguage | string | "en" | Default language |
| dateFormat | enum | "mdy" | Date format (mdy, dmy, ymd) |
| timeFormat | enum | "12" | Time format (12, 24) |
| emailNewTicketAssigned | boolean | "true" | Email on new ticket assigned |
| emailTicketUpdated | boolean | "true" | Email on ticket update |
| emailSLAWarning | boolean | "true" | Email on SLA warning |
| emailWeeklyDigest | boolean | "false" | Weekly digest email |
| inAppDesktopNotifications | boolean | "true" | Browser notifications |
| inAppSoundAlerts | boolean | "false" | Sound alerts |
| inAppNotificationBadge | boolean | "true" | Notification badge |
| versionHistoryEnabled | boolean | "true" | Enable version history |
| versionRetentionPolicy | enum | "limit_by_count" | Version retention policy |
| versionRetentionCount | number | "50" | Max versions to keep |
| versionRetentionDays | number | "365" | Days to keep versions |
| autoArchiveEnabled | boolean | "true" | Auto-archive old versions |
| autoArchiveAfterDays | number | "180" | Days before auto-archive |
| showLegacyVersionsInSearch | boolean | "true" | Include archived in search |
| aiEmbeddingProvider | enum | "openai" | Embedding provider |
| aiEmbeddingModel | string | "text-embedding-3-small" | Embedding model |
| aiEmbeddingDimensions | number | "1536" | Embedding dimensions |
| aiOllamaBaseUrl | string | "http://localhost:11434" | Ollama base URL |
| aiAutoVectorization | boolean | "true" | Auto-vectorize content |
| aiEnableRag | boolean | "true" | Enable RAG |
| aiChunkSize | number | "1000" | Chunk size for RAG |
| aiChatProvider | enum | "openai" | Chat provider |
| aiChatModel | string | "gpt-4" | Chat model |
| aiChatTemperature | number | "0.7" | Chat temperature |

#### Department Settings (New)

| Key | Type | Scope | Description |
|-----|------|-------|-------------|
| helpdeskEnabled | boolean | Department | Enable helpdesk |
| helpdeskPublicAccess | boolean | Department | Allow external submissions |
| docsEnabled | boolean | Department | Enable documentation |
| docsPublicAccess | boolean | Department | Public documentation access |
| reportsEnabled | boolean | Department | Enable reports |
| customLinksEnabled | boolean | Department | Allow custom links |

#### User Preferences (New)

| Key | Type | Description |
|-----|------|-------------|
| theme | enum | User theme preference |
| timezone | string | User timezone |
| language | string | User language |
| notificationEmail | boolean | Email notifications |
| notificationDesktop | boolean | Desktop notifications |
| notificationSound | boolean | Sound alerts |

---

## Appendix B: Permission Matrix

### Permission-to-Settings Mapping

| Permission | Settings Access |
|------------|----------------|
| `settings.general.manage` | General, Company Info, Date/Time |
| `settings.branding.manage` | Branding, Logo, Colors |
| `settings.notifications.manage` | Notification defaults |
| `settings.security.manage` | Authentication, Security Policies |
| `ai.settings.manage` | AI Configuration (all) |
| `users.view` | View user directory |
| `users.create` | Create users, send invitations |
| `users.edit` | Edit user profiles |
| `users.delete` | Delete/suspend users |
| `users.roles.assign` | Assign roles to users |
| `departments.view` | View department list |
| `departments.create` | Create departments |
| `departments.edit` | Edit department info, settings |
| `departments.delete` | Delete departments |
| `helpdesk.settings.manage` | Helpdesk settings for department |
| `helpdesk.sla.manage` | SLA states and policies |
| `helpdesk.webhooks.manage` | Webhook configuration |
| `docs.settings.manage` | Documentation settings |
| `reports.settings.manage` | Report settings |

---

## Appendix C: UI Mockups

### Settings Page - Desktop View
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard        System Settings      [Department Selector ▾]  🔍 │
├──────────────────┬──────────────────────────────────────────────────────────┤
│                  │ Settings > General > Company Information                  │
│ [🔍 Search]      │ Last saved: 2 minutes ago                                │
│                  │                                                            │
│ 👤 My Profile    │ ╔══════════════════════════════════════════════════════╗ │
│ ⚙️  General       │ ║ 🏢 Company Information                               ║ │
│   • Branding     │ ║ Basic information about your organization            ║ │
│   • Notificat... │ ╠══════════════════════════════════════════════════════╣ │
│ 🤖 AI Config     │ ║ Company Name    [Sakura                          ]  ║ │
│ 👥 Users         │ ║                 Displayed in header and emails        ║ │
│   • Directory    │ ║                                                        ║ │
│   • Invites      │ ║ Support Email   [support@sakura.com              ]  ║ │
│ 🛡️  Roles         │ ║                 Users will contact this for help      ║ │
│ 🏢 Departments   │ ║                                                        ║ │
│ 🎫 Helpdesk      │ ║ Timezone        [Pacific Standard Time       ▾]    ║ │
│ 📄 Docs          │ ║                                                        ║ │
│ 📊 Reports       │ ║                                           [Save Changes] ║ │
│ 🔗 Links         │ ╚══════════════════════════════════════════════════════╝ │
│ 🔧 Maintenance   │                                                            │
│                  │ ╔══════════════════════════════════════════════════════╗ │
│                  │ ║ 🌍 Localization                                      ║ │
│                  │ ║ Regional settings and formats                        ║ │
│                  │ ╠══════════════════════════════════════════════════════╣ │
│                  │ ║ Default Language [English                     ▾]   ║ │
│                  │ ║ Date Format      [MM/DD/YYYY (US)             ▾]   ║ │
│                  │ ║ Time Format      [12-hour (AM/PM)             ▾]   ║ │
│                  │ ╚══════════════════════════════════════════════════════╝ │
└──────────────────┴──────────────────────────────────────────────────────────┘
```

### Department Selector - Expanded
```
┌─────────────────────────────────────────┐
│ Select Department                    × │
├─────────────────────────────────────────┤
│ 🌍 Global Settings (Company-wide)      │
├─────────────────────────────────────────┤
│ Departments:                            │
│                                         │
│ 🟣 Product Engineering          [★]   │
│   ├─ Frontend Team                     │
│   ├─ Backend Team                      │
│   └─ QA Team                           │
│                                         │
│ 🔵 Customer Success             [★]   │
│   ├─ Support                           │
│   └─ Onboarding                        │
│                                         │
│ 🟢 Marketing                    [★]   │
│                                         │
│ 🟡 Human Resources                     │
│                                         │
│ 🔴 Finance                             │
└─────────────────────────────────────────┘
```

### Permission Matrix - Roles Section
```
┌─────────────────────────────────────────────────────────────────────┐
│ Permissions for "Support Agent" Role                                │
├─────────────────────────────────────────────────────────────────────┤
│ Helpdesk Permissions                                  [All] [None]  │
│ ┌─────────────────────────────────────┬───────────┬───────────────┐ │
│ │ Permission                          │ Global    │ Dept Scoped   │ │
│ ├─────────────────────────────────────┼───────────┼───────────────┤ │
│ │ View tickets                        │ [✓]       │ [✓]          │ │
│ │ Create tickets                      │ [✓]       │ [ ]          │ │
│ │ Edit tickets                        │ [ ]       │ [✓]          │ │
│ │ Delete tickets                      │ [ ]       │ [ ]          │ │
│ │ Assign tickets                      │ [ ]       │ [✓]          │ │
│ │ Close tickets                       │ [ ]       │ [✓]          │ │
│ │ Manage helpdesk settings            │ [ ]       │ [ ]          │ │
│ └─────────────────────────────────────┴───────────┴───────────────┘ │
│                                                                       │
│ Documentation Permissions                             [All] [None]  │
│ ┌─────────────────────────────────────┬───────────┬───────────────┐ │
│ │ View books and pages                │ [✓]       │ [✓]          │ │
│ │ Create books                        │ [ ]       │ [ ]          │ │
│ │ Edit pages                          │ [ ]       │ [ ]          │ │
│ └─────────────────────────────────────┴───────────┴───────────────┘ │
│                                                                       │
│                                   [Cancel]  [Save Role Permissions]  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Appendix D: Security Considerations

### Permission Enforcement

1. **Frontend**: Hide UI elements user cannot access (UX)
2. **Backend**: Always validate permissions on API routes (security)
3. **Audit**: Log all permission changes and sensitive operations

### Data Protection

1. **Encryption**:
   - Encrypt API keys and secrets at rest
   - Use HTTPS for all communications
   - Mask sensitive fields in UI (e.g., API keys show as `sk-****`)

2. **Access Control**:
   - Scope settings queries to user's accessible departments
   - Prevent horizontal privilege escalation (user A changing user B's settings)
   - Require re-authentication for sensitive changes (password, 2FA)

3. **Audit Trail**:
   - Log all settings changes to `settings_audit` table
   - Include actor, timestamp, before/after values
   - Retain audit logs for compliance (1+ year)

### Rate Limiting

- Settings updates: 60 requests per minute per user
- Search: 120 requests per minute per user
- Bulk operations: 10 requests per minute per user

### Input Validation

- Sanitize all user inputs
- Validate against Zod schemas
- Check max length constraints
- Reject malicious patterns (XSS, SQL injection)

---

## Appendix E: Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**:
   - All interactive elements focusable via Tab
   - Keyboard shortcuts for common actions (Cmd+S to save)
   - Skip navigation link
   - Focus trapping in modals

2. **Screen Reader Support**:
   - ARIA labels on all form controls
   - ARIA live regions for status updates
   - Semantic HTML (nav, main, section, etc.)
   - Alt text for icons

3. **Visual**:
   - Minimum contrast ratio 4.5:1 for text
   - No information conveyed by color alone
   - Resizable text up to 200%
   - Focus indicators on all interactive elements

4. **Forms**:
   - Clear labels for all inputs
   - Error messages associated with fields
   - Required field indicators
   - Helpful placeholder text

---

## Document Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-13 | AI Assistant | Initial PRD creation |

---

**End of Document**
