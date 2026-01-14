import type { Express } from "express";
import { storage } from "../storage";
import { systemSettingsDefaults } from "@shared/schema";

/**
 * System Settings Routes
 * Handles system configuration and settings management
 */
export function registerSettingsRoutes(app: Express): void {
  // Get all system settings
  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getSystemSettings();
    res.json(settings);
  });

  // Get a specific system setting by key
  app.get("/api/settings/:key", async (req, res) => {
    const value = await storage.getSystemSetting(req.params.key);
    if (value === undefined) {
      const defaultValue = systemSettingsDefaults[req.params.key as keyof typeof systemSettingsDefaults];
      if (defaultValue !== undefined) {
        return res.json({ key: req.params.key, value: defaultValue });
      }
      return res.status(404).json({ error: "Setting not found" });
    }
    res.json({ key: req.params.key, value });
  });

  // Update multiple system settings at once
  app.patch("/api/settings", async (req, res) => {
    const settings = req.body;
    if (typeof settings !== 'object' || settings === null) {
      return res.status(400).json({ error: "Invalid settings object" });
    }
    await storage.setSystemSettings(settings);
    const updated = await storage.getSystemSettings();
    res.json(updated);
  });

  // Update a single system setting by key
  app.patch("/api/settings/:key", async (req, res) => {
    const { value } = req.body;
    if (typeof value !== 'string') {
      return res.status(400).json({ error: "Value must be a string" });
    }
    const setting = await storage.setSystemSetting(req.params.key, value);
    res.json(setting);
  });
}
