import type { Express } from "express";
import { storage } from "../storage";
import { handleAsync, notFound, badRequest, unauthorized } from "../middleware/error-handler";

export function registerAnnouncementRoutes(app: Express) {
  // Get all announcements
  app.get("/api/announcements", handleAsync(async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const announcements = await storage.getAnnouncements(departmentId);
    res.json(announcements);
  }));

  // Get active announcements
  app.get("/api/announcements/active", handleAsync(async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const announcements = await storage.getActiveAnnouncements(departmentId);
    res.json(announcements);
  }));

  // Get single announcement by ID
  app.get("/api/announcements/:id", handleAsync(async (req, res) => {
    const announcement = await storage.getAnnouncement(req.params.id);
    if (!announcement) {
      throw notFound("Announcement not found");
    }
    res.json(announcement);
  }));

  // Create new announcement
  app.post("/api/announcements", handleAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    const announcement = await storage.createAnnouncement({
      ...req.body,
      createdBy: req.user!.id,
    });
    res.status(201).json(announcement);
  }));

  // Update announcement
  app.patch("/api/announcements/:id", handleAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    const announcement = await storage.updateAnnouncement(req.params.id, req.body);
    res.json(announcement);
  }));

  // Delete announcement
  app.delete("/api/announcements/:id", handleAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    await storage.deleteAnnouncement(req.params.id);
    res.sendStatus(204);
  }));
}
