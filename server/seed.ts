import { db } from "./db";
import { departments, stats, news, systemSettings, systemSettingsDefaults, roles, rolePermissions, AVAILABLE_PERMISSIONS } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    const existingDepts = await db.select().from(departments);
    if (existingDepts.length === 0) {
      console.log("[seed] Initializing default departments...");
      const defaultDepts = [
        { name: "Product Engineering", description: "Core product development and engineering team.", color: "#3b82f6" },
        { name: "Customer Success", description: "Ensuring customer satisfaction and support.", color: "#10b981" },
        { name: "Marketing", description: "Brand awareness and growth.", color: "#f59e0b" },
        { name: "Human Resources", description: "People operations and recruitment.", color: "#ef4444" },
      ];
      await db.insert(departments).values(defaultDepts);
    }

    const existingStats = await db.select().from(stats);
    if (existingStats.length === 0) {
      console.log("[seed] Initializing default stats...");
      const defaultStats = [
        { key: "active_tickets", value: "12", change: "+2" },
        { key: "internal_docs", value: "48", change: "+5" },
        { key: "team_members", value: "24", change: "+1" },
      ];
      await db.insert(stats).values(defaultStats);
    }

    const existingNews = await db.select().from(news);
    if (existingNews.length === 0) {
      console.log("[seed] Initializing default news...");
      const defaultNews = [
        { title: "Q1 Strategy Meeting", content: "Meeting details...", category: "Corporate", authorId: "system" },
        { title: "New AI Features Released", content: "Check out the new engine!", category: "Product", authorId: "system" },
      ];
      await db.insert(news).values(defaultNews);
    }

    const existingSettings = await db.select().from(systemSettings);
    if (existingSettings.length === 0) {
      console.log("[seed] Initializing default system settings...");
      const settingsToInsert = Object.entries(systemSettingsDefaults).map(([key, value]) => ({
        key,
        value,
        category: getSettingCategory(key),
      }));
      await db.insert(systemSettings).values(settingsToInsert);
    }

    // Seed Super Admin role
    const existingRoles = await db.select().from(roles);
    const superAdminExists = existingRoles.some(r => r.name === "Super Admin" && r.isSystem === "true");
    if (!superAdminExists) {
      console.log("[seed] Creating Super Admin role...");
      const [superAdmin] = await db.insert(roles).values({
        name: "Super Admin",
        description: "Full platform access with all permissions. This role cannot be modified or deleted.",
        color: "#dc2626",
        isSystem: "true",
        priority: 100,
      }).returning();

      // Add all permissions to Super Admin
      const allPermissions = Object.keys(AVAILABLE_PERMISSIONS);
      const permissionInserts = allPermissions.map(permission => ({
        roleId: superAdmin.id,
        permission,
        scopeType: null,
        scopeId: null,
      }));
      await db.insert(rolePermissions).values(permissionInserts);
      console.log(`[seed] Super Admin role created with ${allPermissions.length} permissions.`);
    }

    console.log("[seed] Database initialization complete.");
  } catch (error) {
    console.error("[seed] Error initializing database:", error);
  }
}

function getSettingCategory(key: string): string {
  if (key.startsWith('email') || key.startsWith('inApp')) return 'notifications';
  if (['companyName', 'logoUrl', 'faviconUrl', 'primaryColor', 'defaultTheme', 'allowUserThemeOverride'].includes(key)) return 'branding';
  if (['defaultTimezone', 'defaultLanguage', 'dateFormat', 'timeFormat'].includes(key)) return 'localization';
  return 'general';
}
