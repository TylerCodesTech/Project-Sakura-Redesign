import {
  type ReportDefinition, type InsertReportDefinition,
  type ReportField, type InsertReportField,
  type SavedReport, type InsertSavedReport,
  type ReportSchedule, type InsertReportSchedule,
  type ReportShare, type InsertReportShare,
  type ReportAuditLog, type InsertReportAuditLog,
  type DepartmentReportSettings, type InsertDepartmentReportSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export class ReportsStorage {
  private reportDefinitions: Map<string, ReportDefinition>;
  private reportFields: Map<string, ReportField>;
  private savedReports: Map<string, SavedReport>;
  private reportSchedules: Map<string, ReportSchedule>;
  private reportShares: Map<string, ReportShare>;
  private reportAuditLogs: Map<string, ReportAuditLog>;
  private departmentReportSettings: Map<string, DepartmentReportSettings>;

  constructor() {
    this.reportDefinitions = new Map();
    this.reportFields = new Map();
    this.savedReports = new Map();
    this.reportSchedules = new Map();
    this.reportShares = new Map();
    this.reportAuditLogs = new Map();
    this.departmentReportSettings = new Map();
  }

  // Report Definitions
  async getReportDefinitions(departmentId?: string): Promise<ReportDefinition[]> {
    const all = Array.from(this.reportDefinitions.values());
    if (departmentId) {
      return all.filter(r => r.departmentId === departmentId);
    }
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getReportDefinition(id: string): Promise<ReportDefinition | undefined> {
    return this.reportDefinitions.get(id);
  }

  async createReportDefinition(insert: InsertReportDefinition): Promise<ReportDefinition> {
    const id = randomUUID();
    const definition: ReportDefinition = {
      id,
      name: insert.name,
      description: insert.description ?? null,
      dataSource: insert.dataSource,
      filters: insert.filters ?? null,
      groupBy: insert.groupBy ?? null,
      aggregations: insert.aggregations ?? null,
      columns: insert.columns ?? null,
      sortBy: insert.sortBy ?? null,
      chartType: insert.chartType ?? null,
      chartConfig: insert.chartConfig ?? null,
      departmentId: insert.departmentId ?? null,
      createdBy: insert.createdBy,
      isPublic: insert.isPublic ?? "false",
      tags: insert.tags ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.reportDefinitions.set(id, definition);
    return definition;
  }

  async updateReportDefinition(id: string, update: Partial<InsertReportDefinition>): Promise<ReportDefinition> {
    const existing = this.reportDefinitions.get(id);
    if (!existing) throw new Error("Report definition not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.reportDefinitions.set(id, updated);
    return updated;
  }

  async deleteReportDefinition(id: string): Promise<void> {
    // Also delete related saved reports and schedules
    Array.from(this.savedReports.values())
      .filter(sr => sr.definitionId === id)
      .forEach(sr => this.savedReports.delete(sr.id));
    Array.from(this.reportSchedules.values())
      .filter(rs => rs.definitionId === id)
      .forEach(rs => this.reportSchedules.delete(rs.id));
    this.reportDefinitions.delete(id);
  }

  // Report Fields (metadata)
  async getReportFields(dataSource?: string): Promise<ReportField[]> {
    const all = Array.from(this.reportFields.values());
    if (dataSource) {
      return all.filter(f => f.dataSource === dataSource);
    }
    return all;
  }

  async createReportField(insert: InsertReportField): Promise<ReportField> {
    const id = randomUUID();
    const field: ReportField = {
      id,
      dataSource: insert.dataSource,
      fieldName: insert.fieldName,
      displayName: insert.displayName,
      fieldType: insert.fieldType ?? "string",
      description: insert.description ?? null,
      isFilterable: insert.isFilterable ?? "true",
      isGroupable: insert.isGroupable ?? "false",
      isAggregatable: insert.isAggregatable ?? "false",
      aggregationFunctions: insert.aggregationFunctions ?? null,
    };
    this.reportFields.set(id, field);
    return field;
  }

  async updateReportField(id: string, update: Partial<InsertReportField>): Promise<ReportField> {
    const existing = this.reportFields.get(id);
    if (!existing) throw new Error("Report field not found");
    const updated = { ...existing, ...update };
    this.reportFields.set(id, updated);
    return updated;
  }

  async deleteReportField(id: string): Promise<void> {
    this.reportFields.delete(id);
  }

  // Saved Reports
  async getSavedReports(departmentId?: string): Promise<SavedReport[]> {
    const all = Array.from(this.savedReports.values());
    if (departmentId) {
      return all.filter(r => r.departmentId === departmentId);
    }
    return all.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  }

  async getSavedReport(id: string): Promise<SavedReport | undefined> {
    return this.savedReports.get(id);
  }

  async createSavedReport(insert: InsertSavedReport): Promise<SavedReport> {
    const id = randomUUID();
    const report: SavedReport = {
      id,
      definitionId: insert.definitionId,
      name: insert.name,
      generatedBy: insert.generatedBy,
      data: insert.data,
      departmentId: insert.departmentId ?? null,
      generatedAt: new Date().toISOString(),
    };
    this.savedReports.set(id, report);
    return report;
  }

  async updateSavedReport(id: string, update: Partial<InsertSavedReport>): Promise<SavedReport> {
    const existing = this.savedReports.get(id);
    if (!existing) throw new Error("Saved report not found");
    const updated = { ...existing, ...update };
    this.savedReports.set(id, updated);
    return updated;
  }

  async deleteSavedReport(id: string): Promise<void> {
    // Also delete related shares
    Array.from(this.reportShares.values())
      .filter(rs => rs.reportId === id)
      .forEach(rs => this.reportShares.delete(rs.id));
    this.savedReports.delete(id);
  }

  // Report Schedules
  async getReportSchedules(definitionId?: string): Promise<ReportSchedule[]> {
    const all = Array.from(this.reportSchedules.values());
    if (definitionId) {
      return all.filter(s => s.definitionId === definitionId);
    }
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getReportSchedule(id: string): Promise<ReportSchedule | undefined> {
    return this.reportSchedules.get(id);
  }

  async getReportSchedulesByReport(definitionId: string): Promise<ReportSchedule[]> {
    return Array.from(this.reportSchedules.values())
      .filter(s => s.definitionId === definitionId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createReportSchedule(insert: InsertReportSchedule): Promise<ReportSchedule> {
    const id = randomUUID();
    const schedule: ReportSchedule = {
      id,
      definitionId: insert.definitionId,
      name: insert.name,
      frequency: insert.frequency,
      recipients: insert.recipients,
      enabled: insert.enabled ?? "true",
      lastRunAt: null,
      nextRunAt: insert.nextRunAt ?? null,
      createdBy: insert.createdBy,
      createdAt: new Date().toISOString(),
    };
    this.reportSchedules.set(id, schedule);
    return schedule;
  }

  async updateReportSchedule(id: string, update: Partial<InsertReportSchedule>): Promise<ReportSchedule> {
    const existing = this.reportSchedules.get(id);
    if (!existing) throw new Error("Report schedule not found");
    const updated = { ...existing, ...update };
    this.reportSchedules.set(id, updated);
    return updated;
  }

  async deleteReportSchedule(id: string): Promise<void> {
    this.reportSchedules.delete(id);
  }

  // Report Shares
  async getReportShares(reportId: string): Promise<ReportShare[]> {
    return Array.from(this.reportShares.values())
      .filter(s => s.reportId === reportId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createReportShare(insert: InsertReportShare): Promise<ReportShare> {
    const id = randomUUID();
    const share: ReportShare = {
      id,
      reportId: insert.reportId,
      sharedWith: insert.sharedWith,
      sharedBy: insert.sharedBy,
      accessLevel: insert.accessLevel ?? "view",
      createdAt: new Date().toISOString(),
    };
    this.reportShares.set(id, share);
    return share;
  }

  async deleteReportShare(id: string): Promise<void> {
    this.reportShares.delete(id);
  }

  // Report Audit Logs
  async getReportAuditLogs(departmentId?: string, limit = 100): Promise<ReportAuditLog[]> {
    let logs = Array.from(this.reportAuditLogs.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (departmentId) {
      logs = logs.filter(log => log.departmentId === departmentId);
    }

    return logs.slice(0, limit);
  }

  async createReportAuditLog(insert: InsertReportAuditLog): Promise<ReportAuditLog> {
    const id = randomUUID();
    const log: ReportAuditLog = {
      id,
      reportId: insert.reportId ?? null,
      actionType: insert.actionType,
      userId: insert.userId,
      userName: insert.userName ?? null,
      departmentId: insert.departmentId ?? null,
      details: insert.details ?? null,
      createdAt: new Date().toISOString(),
    };
    this.reportAuditLogs.set(id, log);
    return log;
  }

  // Department Report Settings
  async getDepartmentReportSettings(departmentId: string): Promise<DepartmentReportSettings | undefined> {
    return Array.from(this.departmentReportSettings.values())
      .find(s => s.departmentId === departmentId);
  }

  async createDepartmentReportSettings(insert: InsertDepartmentReportSettings): Promise<DepartmentReportSettings> {
    const id = randomUUID();
    const settings: DepartmentReportSettings = {
      id,
      departmentId: insert.departmentId,
      allowCustomReports: insert.allowCustomReports ?? "true",
      allowExport: insert.allowExport ?? "true",
      allowScheduling: insert.allowScheduling ?? "true",
      maxSavedReports: insert.maxSavedReports ?? 100,
      retentionDays: insert.retentionDays ?? 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.departmentReportSettings.set(id, settings);
    return settings;
  }

  async updateDepartmentReportSettings(departmentId: string, update: Partial<InsertDepartmentReportSettings>): Promise<DepartmentReportSettings> {
    const existing = Array.from(this.departmentReportSettings.values())
      .find(s => s.departmentId === departmentId);

    if (!existing) throw new Error("Department report settings not found");

    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.departmentReportSettings.set(existing.id, updated);
    return updated;
  }
}
