# Project Sakura

## Overview
Project Sakura is an AI-powered unified workplace platform designed to streamline helpdesk ticketing, document management, and team collaboration. It offers a modern user interface and incorporates AI assistance across its functionalities. The platform aims to enhance workplace efficiency by providing integrated solutions for support, documentation, and communication.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS v4 with CSS variables, shadcn/ui component library (New York style)
- **Rich Text Editor**: TipTap
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **API Design**: RESTful endpoints
- **Authentication**: Express-session with PostgreSQL store, Passport.js (local strategy), Scrypt-based hashing. Includes a first-time setup wizard for initial configuration.

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: Shared schema (`shared/schema.ts`) for type safety across frontend and backend.
- **Storage**: Drizzle ORM for PostgreSQL with an in-memory fallback for development.
- **Data Models**: Comprehensive models for Users, Books, Pages, Helpdesks, SLA management, Departments, Roles, Permissions, and Audit Logs.

### Core Features and Design Decisions
- **Version History System**: Git-style versioning for Pages and Books, including timeline, comparison, revert, archive/restore, and search functionalities. Configurable retention policies.
- **Modular Settings Architecture**: Organized settings sections (AI, Users, Roles, Departments, Helpdesk, Documentation, Links, General) with responsive navigation, breadcrumbs, and a settings context provider.
- **Documentation Settings**: Department-specific configuration for documentation, including version history controls and access management.
- **Custom Links System**: Department-based and company-wide custom links with favicon auto-fetch and visual indicators.
- **Helpdesk Settings**: Per-department configuration for helpdesks, including subdepartment management, a ticket form UI designer with advanced field configuration, SLA states and policies, and escalation rules.
- **Multi-Form Ticket Categories**: Support for multiple form categories per helpdesk (e.g., Hardware, Software, Network, Access). When multiple categories exist, users see a category selection screen with icons; when only one exists, it launches directly. Form fields support width settings (full, half, third) and internal-only visibility for staff fields.
- **Ticket Creation Wizard**: Step-by-step wizard flow for creating tickets with progress indicator. Users select helpdesk first, then choose issue type (if multiple categories), then fill custom form fields.
- **Drag-and-Drop Form Builder**: Admin form designer with side palette showing all available field types. Click to add or drag to reorder fields. Supports field duplication, editing, and deletion.
- **Ticket Sidebar Panel**: Quick view and inline editing of ticket details, comments, and status.
- **Reports System**: A comprehensive report builder accessible at `/reports` with department-specific configuration. Supports various report types (Audit, User Access, Ticket SLA, etc.), drag-and-drop interface, live preview, scheduling, and sharing capabilities.

## External Dependencies

### Database
- **PostgreSQL**: Primary database.
- **Drizzle Kit**: For database migrations.

### Key Frontend Libraries
- **TanStack React Query**: For data fetching and caching.
- **TipTap**: For rich text editing.
- **Lucide React**: For icons.
- **Class Variance Authority**: For UI component variants.

### Development Tools
- **Vite**: Build tool.
- **TypeScript**: Language.