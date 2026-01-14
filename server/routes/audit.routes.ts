import type { Express } from "express";
import { storage } from "../storage";

/**
 * Audit Log Routes
 * Handles activity tracking and history logs
 */
export function registerAuditRoutes(app: Express): void {
  // Get audit logs with pagination
  app.get("/api/audit-logs", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const logs = await storage.getAuditLogs(limit, offset);
    const total = await storage.getAuditLogCount();
    res.json({ logs, total, limit, offset });
  });

  // Get audit logs for a specific actor (user)
  app.get("/api/audit-logs/actor/:actorId", async (req, res) => {
    const logs = await storage.getAuditLogsByActor(req.params.actorId);
    res.json(logs);
  });

  // Get audit logs for a specific target (resource)
  app.get("/api/audit-logs/target/:targetType/:targetId", async (req, res) => {
    const logs = await storage.getAuditLogsByTarget(req.params.targetType, req.params.targetId);
    res.json(logs);
  });
}
