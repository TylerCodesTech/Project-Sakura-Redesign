import type { Express } from "express";
import { storage } from "../storage";
import { insertNotificationSchema } from "@shared/schema";
import { handleAsync, notFound, badRequest } from "../middleware/error-handler";
import { validateRequest } from "../middleware/validation";

export function registerNotificationRoutes(app: Express) {
  // Get notifications for a user
  app.get("/api/notifications/:userId", handleAsync(async (req, res) => {
    const notifications = await storage.getNotifications(req.params.userId);
    res.json(notifications);
  }));

  // Create notification
  app.post(
    "/api/notifications",
    validateRequest(insertNotificationSchema),
    handleAsync(async (req, res) => {
      const notification = await storage.createNotification(req.body);
      res.json(notification);
    })
  );

  // Mark notification as read
  app.patch("/api/notifications/:id/read", handleAsync(async (req, res) => {
    const notification = await storage.markNotificationRead(req.params.id);
    if (!notification) {
      throw notFound("Notification not found");
    }
    res.json(notification);
  }));
}
