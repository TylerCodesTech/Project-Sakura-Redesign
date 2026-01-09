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

### Key Design Decisions

1. **Shared Schema Pattern**: Database schema and types are defined in `shared/` directory, making them accessible to both frontend and backend, ensuring type safety across the stack.

2. **In-Memory Storage Fallback**: The `MemStorage` class provides a working implementation without database setup, useful for development and testing.

3. **Component-First UI**: Heavy use of pre-built shadcn/ui components ensures consistent design language and accessibility compliance.

4. **Monorepo Structure**: Single repository with clear separation - `client/` for frontend, `server/` for backend, `shared/` for common code.

5. **Modular Settings Architecture**: The system settings are organized in `client/src/features/settings/` with:
   - **Scalable Sidebar Navigation**: Collapsible sections with sub-items, desktop sidebar + mobile sheet pattern
   - **Reusable Components**: SettingsSidebar, SettingsHeader, SettingsCard, SettingsSection, SettingsRow, DepartmentSelector
   - **Independent Section Modules**: Each settings section (AI, Users, Roles, Departments, Helpdesk, Documentation, Links, General) is a self-contained component
   - **Department-Specific Helpdesk**: Nested tabs for ticket editors, SLA policies, email templates, webhooks, and interaction rules per department
   - **Navigation System**: Centralized in `navigation.ts` with types in `types.ts` for easy extensibility

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