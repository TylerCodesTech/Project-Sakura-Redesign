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

    // Get old value for audit logging
    const oldValue = await storage.getSystemSetting(req.params.key);

    const setting = await storage.setSystemSetting(req.params.key, value);

    // Log the change
    const actorId = (req as any).user?.id || null;
    await storage.logSettingChange(actorId, req.params.key, oldValue || null, value, 'global');

    res.json(setting);
  });

  // Department Settings Routes

  // Get all settings for a department
  app.get("/api/departments/:departmentId/settings", async (req, res) => {
    const settings = await storage.getDepartmentSettings(req.params.departmentId);
    res.json(settings);
  });

  // Update multiple department settings at once
  app.patch("/api/departments/:departmentId/settings", async (req, res) => {
    const settings = req.body;
    if (typeof settings !== 'object' || settings === null) {
      return res.status(400).json({ error: "Invalid settings object" });
    }

    // Log changes for each setting
    const actorId = (req as any).user?.id || null;
    const existingSettings = await storage.getDepartmentSettings(req.params.departmentId);

    await storage.setDepartmentSettings(req.params.departmentId, settings);

    // Audit log each change
    for (const [key, value] of Object.entries(settings)) {
      const oldValue = existingSettings[key] || null;
      if (oldValue !== value) {
        await storage.logSettingChange(
          actorId,
          key,
          oldValue,
          value as string,
          'department',
          req.params.departmentId
        );
      }
    }

    const updated = await storage.getDepartmentSettings(req.params.departmentId);
    res.json(updated);
  });

  // Update a single department setting
  app.patch("/api/departments/:departmentId/settings/:key", async (req, res) => {
    const { value } = req.body;
    if (typeof value !== 'string') {
      return res.status(400).json({ error: "Value must be a string" });
    }

    // Get old value for audit
    const oldValue = await storage.getDepartmentSetting(req.params.departmentId, req.params.key);

    const setting = await storage.setDepartmentSetting(req.params.departmentId, req.params.key, value);

    // Log the change
    const actorId = (req as any).user?.id || null;
    await storage.logSettingChange(
      actorId,
      req.params.key,
      oldValue || null,
      value,
      'department',
      req.params.departmentId
    );

    res.json(setting);
  });

  // User Preferences Routes

  // Get all preferences for the current user
  app.get("/api/users/me/preferences", async (req, res) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const preferences = await storage.getUserPreferences(userId);
    res.json(preferences);
  });

  // Update multiple user preferences at once
  app.patch("/api/users/me/preferences", async (req, res) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const preferences = req.body;
    if (typeof preferences !== 'object' || preferences === null) {
      return res.status(400).json({ error: "Invalid preferences object" });
    }

    // Log changes
    const existingPrefs = await storage.getUserPreferences(userId);

    await storage.setUserPreferences(userId, preferences);

    // Audit log each change
    for (const [key, value] of Object.entries(preferences)) {
      const oldValue = existingPrefs[key] || null;
      if (oldValue !== value) {
        await storage.logSettingChange(
          userId,
          key,
          oldValue,
          value as string,
          'user',
          userId
        );
      }
    }

    const updated = await storage.getUserPreferences(userId);
    res.json(updated);
  });

  // Update a single user preference
  app.patch("/api/users/me/preferences/:key", async (req, res) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { value } = req.body;
    if (typeof value !== 'string') {
      return res.status(400).json({ error: "Value must be a string" });
    }

    // Get old value for audit
    const oldValue = await storage.getUserPreference(userId, req.params.key);

    const preference = await storage.setUserPreference(userId, req.params.key, value);

    // Log the change
    await storage.logSettingChange(
      userId,
      req.params.key,
      oldValue || null,
      value,
      'user',
      userId
    );

    res.json(preference);
  });

  // Settings Audit Log

  // Get audit log with optional filters
  app.get("/api/settings/audit", async (req, res) => {
    const { actorId, scopeType, scopeId, limit, offset } = req.query;

    const filters: any = {};
    if (actorId) filters.actorId = actorId as string;
    if (scopeType) filters.scopeType = scopeType as 'global' | 'department' | 'user';
    if (scopeId) filters.scopeId = scopeId as string;
    if (limit) filters.limit = parseInt(limit as string, 10);
    if (offset) filters.offset = parseInt(offset as string, 10);

    const auditLog = await storage.getSettingsAuditLog(filters);
    res.json(auditLog);
  });
}
