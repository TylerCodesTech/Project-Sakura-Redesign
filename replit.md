# Project Sakura

## Overview

Project Sakura is a unified AI-powered workplace platform that combines helpdesk ticketing, document management, and collaboration features. The application provides a modern, polished interface for managing support tickets, creating and organizing documentation with rich text editing, and facilitating team collaboration through comments and notifications.

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
- **Users**: Basic user authentication with username, password, and department
- **Books**: Document collections with title, description, and author reference
- **Pages**: Flexible content pages that can be standalone or belong to books, with support for hierarchical organization (parent/child relationships), ordering, status workflow (draft/in_review/published), and type designation (page/folder/file)
- **Comments**: Page-level comments for collaboration with user and timestamp tracking
- **Notifications**: User notifications with read status, links, and target references

### Key Design Decisions

1. **Shared Schema Pattern**: Database schema and types are defined in `shared/` directory, making them accessible to both frontend and backend, ensuring type safety across the stack.

2. **In-Memory Storage Fallback**: The `MemStorage` class provides a working implementation without database setup, useful for development and testing.

3. **Component-First UI**: Heavy use of pre-built shadcn/ui components ensures consistent design language and accessibility compliance.

4. **Monorepo Structure**: Single repository with clear separation - `client/` for frontend, `server/` for backend, `shared/` for common code.

5. **Document Workflow Support**: Pages include status tracking and reviewer assignment for content approval workflows.

## External Dependencies

- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Fonts**: Google Fonts (Inter for body text, Plus Jakarta Sans for display text)
- **Replit Integration**: Custom Vite plugins for development banners, cartographer, and runtime error overlays