import type { Express } from "express";
import type { Server } from "http";
import { registerExternalLinkRoutes } from "./external-links.routes";
import { registerUploadRoutes } from "./upload.routes";
import { registerUserRoutes } from "./users.routes";
import { registerDepartmentRoutes } from "./departments.routes";
import { registerNewsRoutes } from "./news.routes";
import { registerNotificationRoutes } from "./notifications.routes";
import { registerBookRoutes } from "./books.routes";
import { registerPageRoutes } from "./pages.routes";
import { registerVersionRoutes } from "./versions.routes";
import { registerSearchRoutes } from "./search.routes";
import { registerWatercoolerRoutes } from "./watercooler.routes";
import { registerSettingsRoutes } from "./settings.routes";
import { registerHelpdeskRoutes } from "./helpdesks.routes";
import { registerTicketRoutes } from "./tickets.routes";
import { registerAIRoutes } from "./ai.routes";
import { registerWebhookRoutes } from "./webhooks.routes";
import { registerFormRoutes } from "./forms.routes";
import { registerRolesRoutes } from "./roles.routes";
import { registerAuditRoutes } from "./audit.routes";
import { registerReportsRoutes } from "./reports.routes";
import { registerAnnouncementRoutes } from "./announcements.routes";
import { registerInfrastructureRoutes } from "./infrastructure.routes";

/**
 * Register all application routes
 * Routes are organized by domain for better maintainability
 */
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Core routes
  registerExternalLinkRoutes(app);
  registerUploadRoutes(app);

  // User management
  registerUserRoutes(app);
  registerDepartmentRoutes(app);

  // Communication
  registerNewsRoutes(app);
  registerNotificationRoutes(app);
  registerWatercoolerRoutes(app);
  registerAnnouncementRoutes(app);

  // Documentation
  registerBookRoutes(app);
  registerPageRoutes(app);
  registerVersionRoutes(app);
  registerSearchRoutes(app);

  // Helpdesk
  registerHelpdeskRoutes(app);
  registerTicketRoutes(app);
  registerFormRoutes(app);
  registerWebhookRoutes(app);

  // Administration
  registerSettingsRoutes(app);
  registerRolesRoutes(app);
  registerAuditRoutes(app);
  registerReportsRoutes(app);

  // Infrastructure
  registerInfrastructureRoutes(app);

  // AI features
  registerAIRoutes(app);

  return httpServer;
}
