import {
  type AiModelConfig, type InsertAiModelConfig,
  type SearchHistory, type InsertSearchHistory,
  type Notification, type InsertNotification,
  type SystemSetting, type InsertSystemSetting,
  type MonitoredService, type InsertMonitoredService,
  type ServiceStatusHistory, type InsertServiceStatusHistory,
  type ServiceAlert,
  systemSettingsDefaults
} from "@shared/schema";
import { randomUUID } from "crypto";

export class AIStorage {
  // Private Maps
  private aiModelConfigs: Map<string, AiModelConfig>;
  private searchHistory: SearchHistory[];
  private notifications: Map<string, Notification>;
  private settings: Map<string, SystemSetting>;
  private monitoredServices: Map<string, MonitoredService>;
  private serviceStatusHistory: Map<string, ServiceStatusHistory>;
  private serviceAlerts: Map<string, ServiceAlert>;

  constructor() {
    this.aiModelConfigs = new Map();
    this.searchHistory = [];
    this.notifications = new Map();
    this.settings = new Map();
    this.monitoredServices = new Map();
    this.serviceStatusHistory = new Map();
    this.serviceAlerts = new Map();

    // Initialize default system settings
    Object.entries(systemSettingsDefaults).forEach(([key, value]) => {
      const id = randomUUID();
      this.settings.set(key, {
        id,
        key,
        value,
        category: this.getSettingCategory(key),
        updatedAt: new Date().toISOString(),
      });
    });
  }

  // Helper method for getting setting category
  private getSettingCategory(key: string): string {
    if (key.startsWith('email') || key.startsWith('inApp')) return 'notifications';
    if (['companyName', 'logoUrl', 'faviconUrl', 'primaryColor', 'defaultTheme', 'allowUserThemeOverride'].includes(key)) return 'branding';
    if (['defaultTimezone', 'defaultLanguage', 'dateFormat', 'timeFormat'].includes(key)) return 'localization';
    return 'general';
  }

  // AI Model Configurations
  async getAiModelConfigs(type?: string): Promise<AiModelConfig[]> {
    const all = Array.from(this.aiModelConfigs.values());
    if (type) return all.filter(c => c.type === type);
    return all;
  }

  async getAiModelConfig(id: string): Promise<AiModelConfig | undefined> {
    return this.aiModelConfigs.get(id);
  }

  async createAiModelConfig(insert: InsertAiModelConfig): Promise<AiModelConfig> {
    const id = randomUUID();
    const config: AiModelConfig = {
      id,
      dimensions: insert.dimensions ?? null,
      description: insert.description ?? null,
      maxTokens: insert.maxTokens ?? null,
      temperature: insert.temperature ?? null,
      apiKeyEnvVar: insert.apiKeyEnvVar ?? null,
      baseUrl: insert.baseUrl ?? null,
      name: insert.name,
      type: insert.type,
      provider: insert.provider,
      model: insert.model,
      isActive: insert.isActive ?? "false",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.aiModelConfigs.set(id, config);
    return config;
  }

  async updateAiModelConfig(id: string, update: Partial<InsertAiModelConfig>): Promise<AiModelConfig> {
    const existing = this.aiModelConfigs.get(id);
    if (!existing) throw new Error("AI Model Config not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.aiModelConfigs.set(id, updated);
    return updated;
  }

  async deleteAiModelConfig(id: string): Promise<void> {
    this.aiModelConfigs.delete(id);
  }

  async getActiveAiModelConfig(type: string): Promise<AiModelConfig | undefined> {
    return Array.from(this.aiModelConfigs.values()).find(c => c.type === type && c.isActive === "true");
  }

  async setActiveAiModelConfig(id: string, type: string): Promise<AiModelConfig> {
    for (const [configId, config] of this.aiModelConfigs.entries()) {
      if (config.type === type) {
        this.aiModelConfigs.set(configId, { ...config, isActive: configId === id ? "true" : "false", updatedAt: new Date().toISOString() });
      }
    }
    const config = this.aiModelConfigs.get(id);
    if (!config) throw new Error("AI Model Config not found");
    return config;
  }

  // Search History
  async getSearchHistory(): Promise<SearchHistory[]> {
    return this.searchHistory;
  }

  async createSearchHistory(insert: InsertSearchHistory): Promise<SearchHistory> {
    const history: SearchHistory = {
      id: randomUUID(),
      query: insert.query,
      userId: insert.userId,
      departmentId: insert.departmentId ?? null,
      resultCount: insert.resultCount ?? null,
      createdAt: new Date().toISOString(),
    };
    this.searchHistory.push(history);
    return history;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      id,
      userId: insertNotification.userId,
      title: insertNotification.title,
      message: insertNotification.message,
      read: "false",
      link: insertNotification.link ?? null,
      targetId: insertNotification.targetId ?? null,
      createdAt: new Date().toISOString()
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const existing = this.notifications.get(id);
    if (!existing) throw new Error("Notification not found");
    const updated = { ...existing, read: "true" };
    this.notifications.set(id, updated);
    return updated;
  }

  // Watercooler Settings (placeholder - uses system settings)
  async getWatercoolerSettings(): Promise<Record<string, string>> {
    const settings: Record<string, string> = {};
    // Get watercooler-specific settings from system settings
    this.settings.forEach((setting) => {
      if (setting.key.startsWith('watercooler')) {
        settings[setting.key] = setting.value;
      }
    });
    return settings;
  }

  async updateWatercoolerSettings(settings: Record<string, string>): Promise<void> {
    await Promise.all(
      Object.entries(settings).map(([key, value]) => this.setSystemSetting(key, value))
    );
  }

  // System Settings
  async getSystemSettings(): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    this.settings.forEach((setting) => {
      result[setting.key] = setting.value;
    });
    return result;
  }

  async updateSystemSettings(settings: Record<string, string>): Promise<void> {
    await Promise.all(
      Object.entries(settings).map(([key, value]) => this.setSystemSetting(key, value))
    );
  }

  async createSystemSetting(key: string, value: string, category?: string): Promise<SystemSetting> {
    return this.setSystemSetting(key, value, category);
  }

  async getSystemSetting(key: string): Promise<string | undefined> {
    return this.settings.get(key)?.value;
  }

  private async setSystemSetting(key: string, value: string, category?: string): Promise<SystemSetting> {
    const existing = this.settings.get(key);
    const id = existing?.id || randomUUID();
    const setting: SystemSetting = {
      id,
      key,
      value,
      category: category || this.getSettingCategory(key),
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(key, setting);
    return setting;
  }

  // Infrastructure Monitoring
  async getMonitoredServices(): Promise<MonitoredService[]> {
    return Array.from(this.monitoredServices.values());
  }

  async getMonitoredService(id: string): Promise<MonitoredService | undefined> {
    return this.monitoredServices.get(id);
  }

  async createMonitoredService(insert: InsertMonitoredService): Promise<MonitoredService> {
    const id = randomUUID();
    const service: MonitoredService = {
      id,
      name: insert.name,
      serviceType: insert.serviceType ?? "api",
      endpoint: insert.endpoint,
      checkInterval: insert.checkInterval ?? 60,
      latencyThreshold: insert.latencyThreshold ?? 1000,
      timeout: insert.timeout ?? 30000,
      enabled: insert.enabled ?? "true",
      expectedStatusCode: insert.expectedStatusCode ?? 200,
      alertOnDown: insert.alertOnDown ?? "true",
      alertOnLatency: insert.alertOnLatency ?? "true",
      lastStatus: "unknown",
      lastCheckedAt: null,
      lastLatency: null,
      consecutiveFailures: 0,
      description: insert.description ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.monitoredServices.set(id, service);
    return service;
  }

  async updateMonitoredService(id: string, update: Partial<InsertMonitoredService>): Promise<MonitoredService> {
    const existing = this.monitoredServices.get(id);
    if (!existing) throw new Error("Monitored service not found");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.monitoredServices.set(id, updated);
    return updated;
  }

  async deleteMonitoredService(id: string): Promise<void> {
    this.monitoredServices.delete(id);
  }

  async getServiceStatusHistory(serviceId: string): Promise<ServiceStatusHistory[]> {
    return Array.from(this.serviceStatusHistory.values()).filter(h => h.serviceId === serviceId);
  }

  async createServiceStatusHistory(insert: InsertServiceStatusHistory): Promise<ServiceStatusHistory> {
    const id = randomUUID();
    const history: ServiceStatusHistory = {
      id,
      serviceId: insert.serviceId,
      status: insert.status,
      latency: insert.latency ?? null,
      statusCode: insert.statusCode ?? null,
      errorMessage: insert.errorMessage ?? null,
      checkedAt: new Date().toISOString(),
    };
    this.serviceStatusHistory.set(id, history);
    return history;
  }

  async getServiceAlerts(): Promise<ServiceAlert[]> {
    return Array.from(this.serviceAlerts.values());
  }

  async createServiceAlert(insert: Omit<ServiceAlert, 'id' | 'createdAt'>): Promise<ServiceAlert> {
    const id = randomUUID();
    const alert: ServiceAlert = {
      id,
      serviceId: insert.serviceId,
      alertType: insert.alertType,
      message: insert.message,
      severity: insert.severity,
      acknowledgedBy: insert.acknowledgedBy ?? null,
      acknowledgedAt: insert.acknowledgedAt ?? null,
      createdAt: new Date().toISOString(),
    };
    this.serviceAlerts.set(id, alert);
    return alert;
  }
}
