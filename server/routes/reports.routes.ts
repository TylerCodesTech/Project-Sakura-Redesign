import type { Express } from "express";
import { storage } from "../storage";

/**
 * Reports Routes
 * Handles report definitions, execution, scheduling, and results
 */
export function registerReportsRoutes(app: Express): void {
  // ============================================
  // REPORT DEFINITIONS
  // ============================================

  // Get all report definitions (optionally filtered by department)
  app.get("/api/report-definitions", async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const definitions = await storage.getReportDefinitions(departmentId);
    res.json(definitions);
  });

  // Get a specific report definition
  app.get("/api/report-definitions/:id", async (req, res) => {
    const definition = await storage.getReportDefinition(req.params.id);
    if (!definition) {
      return res.status(404).json({ error: "Report definition not found" });
    }
    res.json(definition);
  });

  // Create a new report definition
  app.post("/api/report-definitions", async (req, res) => {
    try {
      const definition = await storage.createReportDefinition(req.body);
      await storage.createReportAuditLog({
        userId: "current-user-id",
        userName: "Current User",
        actionType: "created",
        targetType: "definition",
        targetId: definition.id,
        targetName: definition.name,
        departmentId: definition.departmentId ?? undefined,
        details: JSON.stringify({ type: definition.type }),
      });
      res.status(201).json(definition);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update a report definition
  app.patch("/api/report-definitions/:id", async (req, res) => {
    try {
      const definition = await storage.updateReportDefinition(req.params.id, req.body);
      await storage.createReportAuditLog({
        userId: "current-user-id",
        userName: "Current User",
        actionType: "edited",
        targetType: "definition",
        targetId: definition.id,
        targetName: definition.name,
        departmentId: definition.departmentId ?? undefined,
      });
      res.json(definition);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a report definition
  app.delete("/api/report-definitions/:id", async (req, res) => {
    try {
      const definition = await storage.getReportDefinition(req.params.id);
      await storage.deleteReportDefinition(req.params.id);
      if (definition) {
        await storage.createReportAuditLog({
          userId: "current-user-id",
          userName: "Current User",
          actionType: "deleted",
          targetType: "definition",
          targetId: req.params.id,
          targetName: definition.name,
          departmentId: definition.departmentId ?? undefined,
        });
      }
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // SAVED REPORTS (Report Results)
  // ============================================

  // Get all saved reports (optionally filtered by department)
  app.get("/api/reports/saved", async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const reports = await storage.getSavedReports(departmentId);
    res.json(reports);
  });

  // Get a specific saved report
  app.get("/api/reports/saved/:id", async (req, res) => {
    const report = await storage.getSavedReport(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "Saved report not found" });
    }
    res.json(report);
  });

  // Create a saved report (execute and save results)
  app.post("/api/reports/saved", async (req, res) => {
    try {
      const report = await storage.createSavedReport(req.body);
      await storage.createReportAuditLog({
        userId: "current-user-id",
        userName: "Current User",
        actionType: "generated",
        targetType: "saved_report",
        targetId: report.id,
        targetName: report.name,
        departmentId: report.departmentId ?? undefined,
        details: JSON.stringify({ rowCount: report.rowCount }),
      });
      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a saved report
  app.delete("/api/reports/saved/:id", async (req, res) => {
    try {
      await storage.deleteSavedReport(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // REPORT SCHEDULES
  // ============================================

  // Get all report schedules (optionally filtered by definition)
  app.get("/api/reports/schedules", async (req, res) => {
    const definitionId = req.query.definitionId as string | undefined;
    const schedules = await storage.getReportSchedules(definitionId);
    res.json(schedules);
  });

  // Get a specific report schedule
  app.get("/api/reports/schedules/:id", async (req, res) => {
    const schedule = await storage.getReportSchedule(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: "Report schedule not found" });
    }
    res.json(schedule);
  });

  // Create a new report schedule
  app.post("/api/reports/schedules", async (req, res) => {
    try {
      const schedule = await storage.createReportSchedule(req.body);
      await storage.createReportAuditLog({
        userId: "current-user-id",
        userName: "Current User",
        actionType: "scheduled",
        targetType: "schedule",
        targetId: schedule.id,
        targetName: `${schedule.frequency} schedule`,
        details: JSON.stringify({ frequency: schedule.frequency }),
      });
      res.status(201).json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update a report schedule
  app.patch("/api/reports/schedules/:id", async (req, res) => {
    try {
      const schedule = await storage.updateReportSchedule(req.params.id, req.body);
      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a report schedule
  app.delete("/api/reports/schedules/:id", async (req, res) => {
    try {
      await storage.deleteReportSchedule(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // REPORT SHARES
  // ============================================

  // Get all shares for a report
  app.get("/api/reports/:reportId/shares", async (req, res) => {
    const shares = await storage.getReportShares(req.params.reportId);
    res.json(shares);
  });

  // Create a new report share
  app.post("/api/reports/:reportId/shares", async (req, res) => {
    try {
      const share = await storage.createReportShare({
        ...req.body,
        reportId: req.params.reportId,
      });
      await storage.createReportAuditLog({
        userId: "current-user-id",
        userName: "Current User",
        actionType: "shared",
        targetType: req.body.reportType,
        targetId: req.params.reportId,
        details: JSON.stringify({ sharedWith: share.sharedWith, shareType: share.shareType }),
      });
      res.status(201).json(share);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a report share
  app.delete("/api/reports/shares/:id", async (req, res) => {
    try {
      await storage.deleteReportShare(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // REPORT AUDIT LOGS
  // ============================================

  // Get report audit logs (optionally filtered by department)
  app.get("/api/reports/audit-logs", async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await storage.getReportAuditLogs(departmentId, limit);
    res.json(logs);
  });

  // ============================================
  // REPORT FIELDS (Metadata)
  // ============================================

  // Get available report fields (optionally filtered by data source)
  app.get("/api/reports/fields", async (req, res) => {
    const dataSource = req.query.dataSource as string | undefined;
    const fields = await storage.getReportFields(dataSource);
    res.json(fields);
  });

  // Create a new report field definition
  app.post("/api/reports/fields", async (req, res) => {
    try {
      const field = await storage.createReportField(req.body);
      res.status(201).json(field);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update a report field definition
  app.patch("/api/reports/fields/:id", async (req, res) => {
    try {
      const field = await storage.updateReportField(req.params.id, req.body);
      res.json(field);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a report field definition
  app.delete("/api/reports/fields/:id", async (req, res) => {
    try {
      await storage.deleteReportField(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // DEPARTMENT REPORT SETTINGS
  // ============================================

  // Get report settings for a department
  app.get("/api/reports/department-settings/:departmentId", async (req, res) => {
    const settings = await storage.getDepartmentReportSettings(req.params.departmentId);
    if (!settings) {
      return res.json({
        departmentId: req.params.departmentId,
        enabled: "true",
        allowCustomReports: "true",
        allowScheduledReports: "true",
        allowExport: "true",
        defaultExportFormat: "pdf",
        retentionDays: 90,
        maxScheduledReports: 10,
      });
    }
    res.json(settings);
  });

  // Create or update report settings for a department
  app.post("/api/reports/department-settings/:departmentId", async (req, res) => {
    try {
      const existing = await storage.getDepartmentReportSettings(req.params.departmentId);
      if (existing) {
        const settings = await storage.updateDepartmentReportSettings(req.params.departmentId, req.body);
        res.json(settings);
      } else {
        const settings = await storage.createDepartmentReportSettings({
          ...req.body,
          departmentId: req.params.departmentId,
        });
        res.status(201).json(settings);
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
}
