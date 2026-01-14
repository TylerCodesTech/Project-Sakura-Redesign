import { eq, and, desc, asc, count, isNull, or, gte, lte } from "drizzle-orm";
import {
  aiModelConfigs, searchHistory, notifications, systemSettings, comments,
  monitoredServices, serviceStatusHistory, serviceAlerts,
  type AiModelConfig, type InsertAiModelConfig,
  type SearchHistory, type InsertSearchHistory,
  type Notification, type InsertNotification,
  type SystemSetting,
  type Comment, type InsertComment,
  type MonitoredService, type InsertMonitoredService,
  type ServiceStatusHistory, type InsertServiceStatusHistory,
  type ServiceAlert, type InsertServiceAlert,
  systemSettingsDefaults
} from "@shared/schema";

export class DatabaseAIStorage {
  constructor(private db: any) {}

  // AI Model Configurations
  async getAiModelConfigs(type?: string): Promise<AiModelConfig[]> {
    if (type) {
      return this.db.select().from(aiModelConfigs).where(eq(aiModelConfigs.type, type)).orderBy(desc(aiModelConfigs.createdAt));
    }
    return this.db.select().from(aiModelConfigs).orderBy(desc(aiModelConfigs.createdAt));
  }

  async getAiModelConfig(id: string): Promise<AiModelConfig | undefined> {
    const [config] = await this.db.select().from(aiModelConfigs).where(eq(aiModelConfigs.id, id));
    return config;
  }

  async getActiveAiModelConfig(type: string): Promise<AiModelConfig | undefined> {
    const [config] = await this.db.select().from(aiModelConfigs)
      .where(and(eq(aiModelConfigs.type, type), eq(aiModelConfigs.isActive, "true")));
    return config;
  }

  async createAiModelConfig(insert: InsertAiModelConfig): Promise<AiModelConfig> {
    const [config] = await this.db.insert(aiModelConfigs).values(insert).returning();
    return config;
  }

  async updateAiModelConfig(id: string, update: Partial<InsertAiModelConfig>): Promise<AiModelConfig> {
    const [config] = await this.db.update(aiModelConfigs)
      .set({ ...update, updatedAt: new Date().toISOString() })
      .where(eq(aiModelConfigs.id, id))
      .returning();
    if (!config) throw new Error("AI Model Config not found");
    return config;
  }

  async deleteAiModelConfig(id: string): Promise<void> {
    await this.db.delete(aiModelConfigs).where(eq(aiModelConfigs.id, id));
  }

  async setActiveAiModelConfig(id: string, type: string): Promise<AiModelConfig> {
    await this.db.update(aiModelConfigs)
      .set({ isActive: "false", updatedAt: new Date().toISOString() })
      .where(eq(aiModelConfigs.type, type));
    const [config] = await this.db.update(aiModelConfigs)
      .set({ isActive: "true", updatedAt: new Date().toISOString() })
      .where(eq(aiModelConfigs.id, id))
      .returning();
    if (!config) throw new Error("AI Model Config not found");
    return config;
  }

  // Search History / Trending Topics
  async createSearchHistory(insert: InsertSearchHistory): Promise<SearchHistory> {
    const [history] = await this.db.insert(searchHistory).values(insert).returning();
    return history;
  }

  async getSearchHistory(departmentId?: string, limit?: number): Promise<SearchHistory[]> {
    const query = this.db.select().from(searchHistory);

    if (departmentId) {
      if (limit) {
        return query.where(eq(searchHistory.departmentId, departmentId)).orderBy(desc(searchHistory.createdAt)).limit(limit);
      }
      return query.where(eq(searchHistory.departmentId, departmentId)).orderBy(desc(searchHistory.createdAt));
    }

    if (limit) {
      return query.orderBy(desc(searchHistory.createdAt)).limit(limit);
    }
    return query.orderBy(desc(searchHistory.createdAt));
  }

  async getTrendingTopics(departmentId?: string, limit: number = 10): Promise<{ query: string; count: number }[]> {
    const baseQuery = this.db.select({
      query: searchHistory.query,
      count: count(),
    }).from(searchHistory);

    if (departmentId) {
      const results = await baseQuery
        .where(eq(searchHistory.departmentId, departmentId))
        .groupBy(searchHistory.query)
        .orderBy(desc(count()))
        .limit(limit);
      return results.map((r: { query: string; count: unknown }) => ({ query: r.query, count: Number(r.count) }));
    }

    const results = await baseQuery
      .groupBy(searchHistory.query)
      .orderBy(desc(count()))
      .limit(limit);
    return results.map((r: { query: string; count: unknown }) => ({ query: r.query, count: Number(r.count) }));
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await this.db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const [notification] = await this.db.update(notifications).set({ read: "true" }).where(eq(notifications.id, id)).returning();
    if (!notification) throw new Error("Notification not found");
    return notification;
  }

  // Watercooler Settings (using system settings)
  async getWatercoolerSettings(): Promise<Record<string, string>> {
    const settings = await this.getSystemSettings();
    const watercoolerSettings: Record<string, string> = {};

    Object.entries(settings).forEach(([key, value]) => {
      if (key.startsWith('watercooler')) {
        watercoolerSettings[key] = value;
      }
    });

    return watercoolerSettings;
  }

  async updateWatercoolerSettings(settings: Record<string, string>): Promise<void> {
    await Promise.all(
      Object.entries(settings).map(([key, value]) => this.setSystemSetting(key, value))
    );
  }

  // System Settings
  private getSettingCategory(key: string): string {
    if (key.startsWith('email') || key.startsWith('inApp')) return 'notifications';
    if (['companyName', 'logoUrl', 'faviconUrl', 'primaryColor', 'defaultTheme', 'allowUserThemeOverride'].includes(key)) return 'branding';
    if (['defaultTimezone', 'defaultLanguage', 'dateFormat', 'timeFormat'].includes(key)) return 'localization';
    if (key.startsWith('watercooler')) return 'watercooler';
    return 'general';
  }

  async getSystemSettings(): Promise<Record<string, string>> {
    const result: Record<string, string> = { ...systemSettingsDefaults };
    const dbSettings = await this.db.select().from(systemSettings);
    dbSettings.forEach((setting: SystemSetting) => {
      result[setting.key] = setting.value;
    });
    return result;
  }

  async getSystemSetting(key: string): Promise<string | undefined> {
    const [setting] = await this.db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting?.value ?? systemSettingsDefaults[key as keyof typeof systemSettingsDefaults];
  }

  async createSystemSetting(key: string, value: string, category?: string): Promise<SystemSetting> {
    const [setting] = await this.db.insert(systemSettings).values({
      key,
      value,
      category: category || this.getSettingCategory(key),
    }).returning();
    return setting;
  }

  async updateSystemSettings(settings: Record<string, string>): Promise<void> {
    await Promise.all(
      Object.entries(settings).map(([key, value]) => this.setSystemSetting(key, value))
    );
  }

  private async setSystemSetting(key: string, value: string, category?: string): Promise<SystemSetting> {
    const existing = await this.db.select().from(systemSettings).where(eq(systemSettings.key, key));
    if (existing.length > 0) {
      const [updated] = await this.db.update(systemSettings)
        .set({ value, updatedAt: new Date().toISOString() })
        .where(eq(systemSettings.key, key))
        .returning();
      return updated;
    }
    const [setting] = await this.db.insert(systemSettings).values({
      key,
      value,
      category: category || this.getSettingCategory(key),
    }).returning();
    return setting;
  }

  // Infrastructure Monitoring
  async getMonitoredServices(): Promise<MonitoredService[]> {
    return this.db.select().from(monitoredServices).orderBy(asc(monitoredServices.name));
  }

  async getMonitoredService(id: string): Promise<MonitoredService | undefined> {
    const [service] = await this.db.select().from(monitoredServices).where(eq(monitoredServices.id, id));
    return service;
  }

  async createMonitoredService(insert: InsertMonitoredService): Promise<MonitoredService> {
    const [service] = await this.db.insert(monitoredServices).values(insert).returning();
    return service;
  }

  async updateMonitoredService(id: string, update: Partial<InsertMonitoredService>): Promise<MonitoredService> {
    const [service] = await this.db.update(monitoredServices)
      .set({ ...update, updatedAt: new Date().toISOString() })
      .where(eq(monitoredServices.id, id))
      .returning();
    if (!service) throw new Error("Monitored service not found");
    return service;
  }

  async deleteMonitoredService(id: string): Promise<void> {
    await this.db.delete(serviceStatusHistory).where(eq(serviceStatusHistory.serviceId, id));
    await this.db.delete(serviceAlerts).where(eq(serviceAlerts.serviceId, id));
    await this.db.delete(monitoredServices).where(eq(monitoredServices.id, id));
  }

  async getServiceStatusHistory(serviceId: string, limit: number = 100): Promise<ServiceStatusHistory[]> {
    return this.db.select().from(serviceStatusHistory)
      .where(eq(serviceStatusHistory.serviceId, serviceId))
      .orderBy(desc(serviceStatusHistory.checkedAt))
      .limit(limit);
  }

  async createServiceStatusHistory(insert: InsertServiceStatusHistory): Promise<ServiceStatusHistory> {
    const [history] = await this.db.insert(serviceStatusHistory).values(insert).returning();
    return history;
  }

  async getServiceAlerts(acknowledged?: boolean): Promise<ServiceAlert[]> {
    if (acknowledged !== undefined) {
      const ackValue = acknowledged ? "true" : "false";
      return this.db.select().from(serviceAlerts)
        .where(eq(serviceAlerts.acknowledged, ackValue))
        .orderBy(desc(serviceAlerts.createdAt));
    }
    return this.db.select().from(serviceAlerts).orderBy(desc(serviceAlerts.createdAt));
  }

  async createServiceAlert(insert: InsertServiceAlert): Promise<ServiceAlert> {
    const [alert] = await this.db.insert(serviceAlerts).values(insert).returning();
    return alert;
  }

  async acknowledgeServiceAlert(id: string, userId: string): Promise<ServiceAlert> {
    const [alert] = await this.db.update(serviceAlerts)
      .set({
        acknowledged: "true",
        acknowledgedBy: userId,
        acknowledgedAt: new Date().toISOString()
      })
      .where(eq(serviceAlerts.id, id))
      .returning();
    if (!alert) throw new Error("Service alert not found");
    return alert;
  }
}
