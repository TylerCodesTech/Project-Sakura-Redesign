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
- **Helpdesk Two-Panel Layout**: Redesigned helpdesk page with a left sidebar for navigation and a main content area. The sidebar displays a Dashboard link at the top, followed by an expandable department hierarchy showing root departments and their sub-departments. Clicking a department filters tickets to that department (including child departments). The Dashboard view shows a grid of widgets including total tickets, open tickets, urgent/high priority, resolved today, recent tickets list, priority breakdown bar chart, and tickets by department summary. The main content area supports three display modes: List, Card, and Kanban board views.
- **Reports System**: A comprehensive report builder accessible at `/reports` with department-specific configuration. Supports various report types (Audit, User Access, Ticket SLA, etc.), drag-and-drop interface, live preview, scheduling, and sharing capabilities.
- **AI-Powered Document Matching**: Uses pgvector extension for vector embeddings with configurable providers (OpenAI, Ollama, Google). Generates embeddings for pages, page versions, and tickets to automatically suggest related knowledge base articles when viewing tickets. Includes HNSW indexes for fast cosine similarity search and admin endpoints for reindexing.
- **Multi-Provider AI Configuration**: The AI Configuration settings page allows administrators to select embedding and chat model providers. Supported providers include OpenAI (text-embedding-3-small/large), Ollama (nomic-embed-text, mxbai-embed-large, etc.), and Google AI (text-embedding-004). Configuration is stored in system settings and used by the embedding service at runtime.
- **AI Model Configurations**: Database-backed storage for multiple AI model configurations with support for saving multiple models but only one active per type (embedding vs chat). Includes API endpoints for CRUD operations and activation.
- **AI Indexing Statistics**: API endpoint `/api/ai/indexing-stats` provides real-time stats on documents indexed (pages and tickets), showing total, indexed, and pending counts.
- **AI Writing Assistant**: In the documentation editor, an AI-powered writing assistant helps users improve, expand, summarize, fix grammar, make professional, or simplify selected text. The AI Assistant button and sidebar panel are only visible when: (1) AI is configured in system settings, and (2) the user has the `ai.assistant.use` permission. The assistant uses the configured chat model (OpenAI, Ollama, or Google) from system settings.
- **AI Permissions**: New RBAC permissions for AI features: `ai.assistant.use` (use AI writing assistant in documents), `ai.chat.use` (use AI chat features), and `ai.settings.manage` (manage AI configuration settings).
- **Intranet Dashboard**: Corporate intranet social feed with 3-column layout featuring department channels (left), social feed with post composer (center), and online team members/trending topics/upcoming events (right). Header includes greeting, weather, time, and system status indicator with tooltip showing infrastructure health.
- **System Maintenance Announcements**: Administrators can create, edit, and manage system announcements (info, warning, success, error types) via the Maintenance section in Settings. Announcements can be company-wide or department-specific with optional date ranges. Active announcements are displayed in a dismissible banner on the Dashboard.
- **Trending Topics**: Search history tracking and trending topics API that aggregates popular searches within a user's department. Displays top searched terms in the Dashboard sidebar.
- **Online Team Members**: Shows users from the signed-in user's department in the Dashboard sidebar with online/away/busy status indicators.

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