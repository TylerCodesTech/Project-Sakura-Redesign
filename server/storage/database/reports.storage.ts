import { eq, desc, asc, sql, or } from "drizzle-orm";
import {
  reportDefinitions, reportFields, savedReports, reportSchedules, reportShares,
  reportAuditLogs, departmentReportSettings,
  type ReportDefinition, type InsertReportDefinition,
  type ReportField, type InsertReportField,
  type SavedReport, type InsertSavedReport,
  type ReportSchedule, type InsertReportSchedule,
  type ReportShare, type InsertReportShare,
  type ReportAuditLog, type InsertReportAuditLog,
  type DepartmentReportSettings, type InsertDepartmentReportSettings,
} from "@shared/schema";

export class DatabaseReportsStorage {
  constructor(private db: any) {}

  // Report Definitions
  async getReportDefinitions(departmentId?: string): Promise<ReportDefinition[]> {
    if (departmentId) {
      return this.db.select().from(reportDefinitions)
        .where(or(
          eq(reportDefinitions.departmentId, departmentId),
          sql`${reportDefinitions.departmentId} IS NULL`
        ))
        .orderBy(desc(reportDefinitions.createdAt));
    }
    return this.db.select().from(reportDefinitions).orderBy(desc(reportDefinitions.createdAt));
  }

  async getReportDefinition(id: string): Promise<ReportDefinition | undefined> {
    const [definition] = await this.db.select().from(reportDefinitions).where(eq(reportDefinitions.id, id));
    return definition;
  }

  async createReportDefinition(insert: InsertReportDefinition): Promise<ReportDefinition> {
    const [definition] = await this.db.insert(reportDefinitions).values(insert).returning();
    return definition;
  }

  async updateReportDefinition(id: string, update: Partial<InsertReportDefinition>): Promise<ReportDefinition> {
    const [definition] = await this.db.update(reportDefinitions)
      .set({ ...update, updatedAt: new Date().toISOString() })
      .where(eq(reportDefinitions.id, id))
      .returning();
    if (!definition) throw new Error("Report definition not found");
    return definition;
  }

  async deleteReportDefinition(id: string): Promise<void> {
    await this.db.delete(savedReports).where(eq(savedReports.definitionId, id));
    await this.db.delete(reportSchedules).where(eq(reportSchedules.definitionId, id));
    await this.db.delete(reportDefinitions).where(eq(reportDefinitions.id, id));
  }

  // Saved Reports
  async getSavedReports(departmentId?: string): Promise<SavedReport[]> {
    if (departmentId) {
      return this.db.select().from(savedReports)
        .where(eq(savedReports.departmentId, departmentId))
        .orderBy(desc(savedReports.generatedAt));
    }
    return this.db.select().from(savedReports).orderBy(desc(savedReports.generatedAt));
  }

  async getSavedReport(id: string): Promise<SavedReport | undefined> {
    const [report] = await this.db.select().from(savedReports).where(eq(savedReports.id, id));
    return report;
  }

  async createSavedReport(insert: InsertSavedReport): Promise<SavedReport> {
    const [report] = await this.db.insert(savedReports).values(insert).returning();
    return report;
  }

  async updateSavedReport(id: string, update: Partial<InsertSavedReport>): Promise<SavedReport> {
    const [report] = await this.db.update(savedReports)
      .set(update)
      .where(eq(savedReports.id, id))
      .returning();
    if (!report) throw new Error("Saved report not found");
    return report;
  }

  async deleteSavedReport(id: string): Promise<void> {
    await this.db.delete(savedReports).where(eq(savedReports.id, id));
  }

  // Report Schedules
  async getReportSchedules(definitionId?: string): Promise<ReportSchedule[]> {
    if (definitionId) {
      return this.db.select().from(reportSchedules)
        .where(eq(reportSchedules.definitionId, definitionId))
        .orderBy(desc(reportSchedules.createdAt));
    }
    return this.db.select().from(reportSchedules).orderBy(desc(reportSchedules.createdAt));
  }

  async getReportSchedule(id: string): Promise<ReportSchedule | undefined> {
    const [schedule] = await this.db.select().from(reportSchedules).where(eq(reportSchedules.id, id));
    return schedule;
  }

  async getReportSchedulesByReport(definitionId: string): Promise<ReportSchedule[]> {
    return this.db.select().from(reportSchedules)
      .where(eq(reportSchedules.definitionId, definitionId))
      .orderBy(desc(reportSchedules.createdAt));
  }

  async createReportSchedule(insert: InsertReportSchedule): Promise<ReportSchedule> {
    const [schedule] = await this.db.insert(reportSchedules).values(insert).returning();
    return schedule;
  }

  async updateReportSchedule(id: string, update: Partial<InsertReportSchedule>): Promise<ReportSchedule> {
    const [schedule] = await this.db.update(reportSchedules)
      .set(update)
      .where(eq(reportSchedules.id, id))
      .returning();
    if (!schedule) throw new Error("Report schedule not found");
    return schedule;
  }

  async deleteReportSchedule(id: string): Promise<void> {
    await this.db.delete(reportSchedules).where(eq(reportSchedules.id, id));
  }

  // Report Shares
  async getReportShares(reportId: string): Promise<ReportShare[]> {
    return this.db.select().from(reportShares).where(eq(reportShares.reportId, reportId));
  }

  async createReportShare(insert: InsertReportShare): Promise<ReportShare> {
    const [share] = await this.db.insert(reportShares).values(insert).returning();
    return share;
  }

  async deleteReportShare(id: string): Promise<void> {
    await this.db.delete(reportShares).where(eq(reportShares.id, id));
  }

  // Report Audit Logs
  async getReportAuditLogs(departmentId?: string, limit = 100): Promise<ReportAuditLog[]> {
    if (departmentId) {
      return this.db.select().from(reportAuditLogs)
        .where(eq(reportAuditLogs.departmentId, departmentId))
        .orderBy(desc(reportAuditLogs.createdAt))
        .limit(limit);
    }
    return this.db.select().from(reportAuditLogs).orderBy(desc(reportAuditLogs.createdAt)).limit(limit);
  }

  async createReportAuditLog(insert: InsertReportAuditLog): Promise<ReportAuditLog> {
    const [log] = await this.db.insert(reportAuditLogs).values(insert).returning();
    return log;
  }

  // Department Report Settings
  async getDepartmentReportSettings(departmentId: string): Promise<DepartmentReportSettings | undefined> {
    const [settings] = await this.db.select().from(departmentReportSettings)
      .where(eq(departmentReportSettings.departmentId, departmentId));
    return settings;
  }

  async createDepartmentReportSettings(insert: InsertDepartmentReportSettings): Promise<DepartmentReportSettings> {
    const [settings] = await this.db.insert(departmentReportSettings).values(insert).returning();
    return settings;
  }

  async updateDepartmentReportSettings(departmentId: string, update: Partial<InsertDepartmentReportSettings>): Promise<DepartmentReportSettings> {
    const [settings] = await this.db.update(departmentReportSettings)
      .set({ ...update, updatedAt: new Date().toISOString() })
      .where(eq(departmentReportSettings.departmentId, departmentId))
      .returning();
    if (!settings) throw new Error("Department report settings not found");
    return settings;
  }

  // Report Fields (metadata)
  async getReportFields(dataSource?: string): Promise<ReportField[]> {
    if (dataSource) {
      return this.db.select().from(reportFields)
        .where(eq(reportFields.dataSource, dataSource))
        .orderBy(asc(reportFields.order));
    }
    return this.db.select().from(reportFields).orderBy(asc(reportFields.order));
  }

  async createReportField(insert: InsertReportField): Promise<ReportField> {
    const [field] = await this.db.insert(reportFields).values(insert).returning();
    return field;
  }

  async updateReportField(id: string, update: Partial<InsertReportField>): Promise<ReportField> {
    const [field] = await this.db.update(reportFields)
      .set(update)
      .where(eq(reportFields.id, id))
      .returning();
    if (!field) throw new Error("Report field not found");
    return field;
  }

  async deleteReportField(id: string): Promise<void> {
    await this.db.delete(reportFields).where(eq(reportFields.id, id));
  }
}
