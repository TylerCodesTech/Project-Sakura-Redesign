import type { Express } from "express";
import { storage } from "../storage";
import { insertHelpdeskWebhookSchema } from "@shared/schema";

/**
 * Helpdesk Webhooks Routes
 *
 * Handles:
 * - Webhook configuration for helpdesks
 * - Webhook creation, updates, and deletion
 * - Integration with external systems
 */
export function registerWebhookRoutes(app: Express) {
  // ============== WEBHOOKS ==============

  app.get("/api/helpdesks/:helpdeskId/webhooks", async (req, res) => {
    const webhooks = await storage.getWebhooks(req.params.helpdeskId);
    res.json(webhooks);
  });

  app.post("/api/helpdesks/:helpdeskId/webhooks", async (req, res) => {
    const result = insertHelpdeskWebhookSchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const webhook = await storage.createWebhook(result.data);
    res.json(webhook);
  });

  app.patch("/api/webhooks/:id", async (req, res) => {
    const result = insertHelpdeskWebhookSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const webhook = await storage.updateWebhook(req.params.id, result.data);
      res.json(webhook);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/webhooks/:id", async (req, res) => {
    await storage.deleteWebhook(req.params.id);
    res.sendStatus(204);
  });
}
