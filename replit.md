# Project Sakura

## Overview

Project Sakura is a unified AI-powered workplace platform that combines helpdesk ticketing, document management, and collaboration features. The application provides a modern, polished interface for managing support tickets, creating and organizing documentation (books and pages), and includes AI-assisted features throughout the workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Rich Text Editing**: TipTap editor with extensions for text formatting, alignment, and placeholders
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints under `/api` prefix
- **Development**: Hot module replacement via Vite middleware in development mode

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all database table definitions
- **Validation**: Zod schemas generated from Drizzle schemas using drizzle-zod
- **Storage Abstraction**: Interface-based storage pattern (`IStorage`) allowing easy swap between in-memory and database implementations

### Data Models
- **Users**: Basic user authentication with username/password
- **Books**: Document collections with title, description, and author reference
- **Pages**: Flexible content pages that can be standalone or belong to books, with support for hierarchical organization (parent/child relationships) and ordering
- **Page Versions**: Complete version history for pages with version numbers, content snapshots, and change descriptions
- **Book Versions**: Complete version history for books with version numbers, metadata snapshots, and change descriptions
- **Version Audit Logs**: Comprehensive logging of all version-related actions (created, modified, reverted, deleted, archived, restored)
- **Helpdesks**: Per-department helpdesk configuration with settings for ticket management
- **SLA States**: Custom ticket states with colors, SLA tracking, and ordering
- **SLA Policies**: Response and resolution time targets per priority level
- **Escalation Rules**: Automatic ticket escalation based on time, priority, or state conditions
- **Webhooks**: External integrations for ticket event notifications
- **Ticket Form Fields**: Custom fields for ticket creation forms (text, dropdown, checkbox, etc.)
- **Inbound Email Config**: Email-to-ticket configuration per helpdesk
- **Department Hierarchy**: Parent-child relationships between departments for complex organizations
- **Roles**: Custom roles with name, description, color, and priority level; includes system-protected Super Admin role
- **Permissions**: Granular permission catalog with 36+ permissions across 6 categories (helpdesk, documentation, users, settings, departments, reports)
- **Role Permissions**: Many-to-many relationship between roles and permissions with optional scope (department-level permissions)
- **User Roles**: User-to-role assignments with assigned-by tracking
- **Audit Logs**: Comprehensive logging of all security-related changes including role/permission modifications

### Version History System
The application includes a comprehensive version history system for both Pages and Books:

**Features:**
- **Version Timeline**: Git-style sidebar widget showing all document versions with commit-like entries
- **Version Comparison**: Side-by-side comparison tool for viewing differences between versions (text, images, embedded media)
- **Revert Functionality**: Auto-saves current state before reverting to preserve history
- **Archive/Restore**: Archive old versions to reduce clutter, restore when needed
- **Version Search**: Global search includes legacy versions with visual indicators like "[Legacy Version – v2.3]" or "[Archived – Last Updated: DD/MM/YYYY]"

**Version Retention Settings (System Settings):**
- `versionRetentionPolicy`: "all", "limit_by_count", "limit_by_time", or "auto_archive"
- `versionMaxCount`: Maximum versions to keep (default: 50)
- `versionMaxAgeDays`: Maximum age in days before archiving (default: 365)
- `autoArchiveEnabled`: Enable automatic archiving of old versions

**API Endpoints:**
- `GET /api/pages/:id/versions` - Get all versions for a page
- `POST /api/pages/:id/versions` - Create a new version
- `POST /api/pages/:id/revert/:versionNumber` - Revert to a specific version
- `POST /api/pages/:id/versions/:versionId/archive` - Archive a version
- `POST /api/pages/:id/versions/:versionId/restore` - Restore an archived version
- `GET /api/pages/:id/compare/:v1/:v2` - Compare two versions
- `GET /api/versions/search?q=query` - Search across all versions
- Similar endpoints available for books under `/api/books/:id/versions`

### Key Design Decisions

1. **Shared Schema Pattern**: Database schema and types are defined in `shared/` directory, making them accessible to both frontend and backend, ensuring type safety across the stack.

2. **In-Memory Storage Fallback**: The `MemStorage` class provides a working implementation without database setup, useful for development and testing.

3. **Component-First UI**: Heavy use of pre-built shadcn/ui components ensures consistent design language and accessibility compliance.

4. **Monorepo Structure**: Single repository with clear separation - `client/` for frontend, `server/` for backend, `shared/` for common code.

5. **Modular Settings Architecture**: The system settings are organized in `client/src/features/settings/` with:
   - **Responsive Sidebar Navigation**: Collapsible sections with animated transitions, desktop sidebar + mobile sheet pattern
   - **Breadcrumb Navigation**: Full path display (Home > Category > Page) for spatial awareness
   - **Settings Context Provider**: Centralized state management in `context/SettingsContext.tsx` for department selection and navigation
   - **Reusable Components**: SettingsSidebar, SettingsHeader, SettingsCard, SettingsSection, SettingsRow, DepartmentSelector
   - **Independent Section Modules**: Each settings section (AI, Users, Roles, Departments, Helpdesk, Documentation, Links, General) is a self-contained component
   - **Department-Specific Configuration**: Dropdown selector for context switching with visual indicators and dynamic filtering
   - **Visual Refinements**: Elevated card layouts, smooth Framer Motion transitions, hover states, and modern aesthetics
   - **Navigation System**: Centralized in `navigation.ts` with types in `types.ts` for easy extensibility

6. **Documentation Settings Section** (`client/src/features/settings/sections/DocumentationSettings.tsx`):
   - **Department-Specific Settings**: Each department has its own documentation configuration
   - **Version History Settings**: Comprehensive controls for version retention, auto-archiving, and search behavior
   - **Access Control**: Role-based access configuration for documentation per department
   - **Sub-sections**: Overview, Version History, Access Control (removed unused Categories section)
   - **Real-time Save**: Version history settings save directly to system_settings via API

7. **Reports System** (`client/src/features/settings/sections/ReportsSettings.tsx` and `client/src/features/reports/`):
   - **Standalone Report Builder**: Accessible at `/reports` route from the app launcher with violet icon color
   - **Department-Specific Reporting**: Each department has independent report configuration and permissions
   - **Report Types**: Audit, User Access, Ticket SLA, Monthly Closures, and Custom reports
   - **Report Builder**: Drag-and-drop interface with field selection, filtering, sorting, grouping, and visualization options
   - **Live Preview**: Real-time data preview tab showing first 25 records from selected data source with auto-refresh
   - **Data Sources**: tickets, users, audit_logs, sla_states, sla_policies, departments, roles, pages, books
   - **Scheduling**: Automated report generation with daily, weekly, monthly frequencies
   - **Sharing**: Share reports with users, roles, or departments with view/edit permissions
   - **Audit Logging**: All report actions (create, edit, delete, generate, share, schedule) are logged
   - **Settings Sub-sections**: Overview, Report Builder, Scheduled Reports, Sharing & Access
   - **Report Definition Schema**: Uses `configuration` (JSON), `isTemplate`, `isPublic` fields

### Reports Database Schema
- **report_definitions**: Store report configuration templates
- **report_fields**: Define available fields per data source with type, filterability, sortability, aggregations
- **saved_reports**: Generated report instances with result data
- **report_schedules**: Automated scheduling configuration
- **report_shares**: Sharing permissions per report
- **report_audit_logs**: Activity logging for compliance
- **department_report_settings**: Per-department report configuration

### Reports API Endpoints
- `GET/POST /api/reports/definitions` - Manage report templates
- `GET/POST /api/reports/saved` - Access generated reports
- `GET/POST /api/reports/schedules` - Manage schedules
- `GET/POST /api/reports/:reportId/shares` - Manage sharing
- `GET /api/reports/audit-logs` - View report activity
- `GET/POST /api/departments/:id/report-settings` - Department-specific settings
- `GET/POST /api/reports/fields` - Available fields metadata

## External Dependencies

### Database
- **PostgreSQL**: Primary database, configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migration and schema push tooling (`db:push` script)

### Third-Party Services
- No external API integrations are currently configured, though the dependency list includes:
  - OpenAI SDK (available but not implemented)
  - Google Generative AI SDK (available but not implemented)
  - Stripe SDK (available but not implemented)
  - Nodemailer (available but not implemented)

### Key Frontend Libraries
- TanStack React Query for data fetching
- TipTap for rich text editing
- Lucide React for icons
- Class Variance Authority for component variants

### Development Tools
- Vite with React plugin
- TypeScript with strict mode
- Replit-specific plugins for error overlay and dev tooling