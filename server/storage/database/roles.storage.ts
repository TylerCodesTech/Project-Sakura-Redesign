import type { Database } from "@db/index";
import { eq, and, desc, count } from "drizzle-orm";
import {
  roles, rolePermissions, userRoles, auditLogs, documentActivity,
  type Role, type InsertRole, type RolePermission, type InsertRolePermission,
  type UserRole, type InsertUserRole, type AuditLog, type InsertAuditLog,
  type DocumentActivity, type InsertDocumentActivity,
  type RoleWithUserCount, type RoleWithPermissions
} from "@shared/schema";

export class DatabaseRolesStorage {
  constructor(private db: Database) {}

  // Role methods
  async getRoles(): Promise<RoleWithUserCount[]> {
    const allRoles = await this.db.select().from(roles).orderBy(desc(roles.priority));
    const rolesWithCounts: RoleWithUserCount[] = [];
    for (const role of allRoles) {
      const [countResult] = await this.db.select({ count: count() }).from(userRoles).where(eq(userRoles.roleId, role.id));
      rolesWithCounts.push({ ...role, userCount: countResult?.count ?? 0 });
    }
    return rolesWithCounts;
  }

  async getRole(id: string): Promise<Role | undefined> {
    const [role] = await this.db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRoleWithPermissions(id: string): Promise<RoleWithPermissions | undefined> {
    const [role] = await this.db.select().from(roles).where(eq(roles.id, id));
    if (!role) return undefined;
    const permissions = await this.db.select().from(rolePermissions).where(eq(rolePermissions.roleId, id));
    return { ...role, permissions };
  }

  async createRole(insert: InsertRole): Promise<Role> {
    const [role] = await this.db.insert(roles).values(insert).returning();
    return role;
  }

  async updateRole(id: string, update: Partial<InsertRole>): Promise<Role> {
    const [existing] = await this.db.select().from(roles).where(eq(roles.id, id));
    if (!existing) throw new Error("Role not found");
    if (existing.isSystem === "true") throw new Error("Cannot modify system roles");
    const [role] = await this.db.update(roles).set({ ...update, updatedAt: new Date().toISOString() }).where(eq(roles.id, id)).returning();
    return role;
  }

  async deleteRole(id: string): Promise<void> {
    const [existing] = await this.db.select().from(roles).where(eq(roles.id, id));
    if (existing?.isSystem === "true") throw new Error("Cannot delete system roles");
    await this.db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    await this.db.delete(userRoles).where(eq(userRoles.roleId, id));
    await this.db.delete(roles).where(eq(roles.id, id));
  }

  async getRolesWithUserCount(): Promise<RoleWithUserCount[]> {
    return this.getRoles();
  }

  // Role Permission methods
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return this.db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  }

  async setRolePermissions(roleId: string, permissions: string[]): Promise<RolePermission[]> {
    await this.db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    if (permissions.length === 0) return [];
    const newPermissions = permissions.map(permission => ({
      roleId,
      permission,
      scopeType: null,
      scopeId: null,
    }));
    return this.db.insert(rolePermissions).values(newPermissions).returning();
  }

  async createRolePermission(insert: InsertRolePermission): Promise<RolePermission> {
    const [permission] = await this.db.insert(rolePermissions).values(insert).returning();
    return permission;
  }

  async updateRolePermission(id: string, update: Partial<InsertRolePermission>): Promise<RolePermission> {
    const [permission] = await this.db.update(rolePermissions)
      .set(update)
      .where(eq(rolePermissions.id, id))
      .returning();
    if (!permission) throw new Error("Role permission not found");
    return permission;
  }

  async deleteRolePermission(id: string): Promise<void> {
    await this.db.delete(rolePermissions).where(eq(rolePermissions.id, id));
  }

  async removeRolePermission(roleId: string, permission: string): Promise<void> {
    await this.db.delete(rolePermissions).where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permission, permission)));
  }

  // User Role methods
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.db.select().from(userRoles).where(eq(userRoles.userId, userId));
  }

  async assignRoleToUser(insert: InsertUserRole): Promise<UserRole> {
    const existing = await this.db.select().from(userRoles).where(and(eq(userRoles.userId, insert.userId), eq(userRoles.roleId, insert.roleId)));
    if (existing.length > 0) return existing[0];
    const [userRole] = await this.db.insert(userRoles).values(insert).returning();
    return userRole;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.db.delete(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
  }

  async bulkAssignRoles(userId: string, roleIds: string[]): Promise<UserRole[]> {
    const results: UserRole[] = [];
    for (const roleId of roleIds) {
      const result = await this.assignRoleToUser({ userId, roleId });
      results.push(result);
    }
    return results;
  }

  async bulkRemoveRoles(userId: string, roleIds: string[]): Promise<void> {
    for (const roleId of roleIds) {
      await this.removeRoleFromUser(userId, roleId);
    }
  }

  async getUsersByRole(roleId: string): Promise<UserRole[]> {
    return this.db.select().from(userRoles).where(eq(userRoles.roleId, roleId));
  }

  async getUserRoleCount(roleId: string): Promise<number> {
    const [result] = await this.db.select({ count: count() }).from(userRoles).where(eq(userRoles.roleId, roleId));
    return result?.count ?? 0;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRolesList = await this.getUserRoles(userId);
    const permissions = new Set<string>();
    for (const ur of userRolesList) {
      const rolePerms = await this.getRolePermissions(ur.roleId);
      rolePerms.forEach(rp => permissions.add(rp.permission));
    }
    return Array.from(permissions);
  }

  // Audit Log methods
  async getAuditLogs(limit = 100, offset = 0): Promise<AuditLog[]> {
    return this.db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
  }

  async createAuditLog(insert: InsertAuditLog): Promise<AuditLog> {
    const [log] = await this.db.insert(auditLogs).values(insert).returning();
    return log;
  }

  async getAuditLogsByUser(actorId: string): Promise<AuditLog[]> {
    return this.db.select().from(auditLogs).where(eq(auditLogs.actorId, actorId)).orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByEntity(targetType: string, targetId: string): Promise<AuditLog[]> {
    return this.db.select().from(auditLogs).where(and(eq(auditLogs.targetType, targetType), eq(auditLogs.targetId, targetId))).orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByAction(action: string): Promise<AuditLog[]> {
    return this.db.select().from(auditLogs).where(eq(auditLogs.action, action)).orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogCount(): Promise<number> {
    const [result] = await this.db.select({ count: count() }).from(auditLogs);
    return result?.count ?? 0;
  }

  // Document Activity methods
  async getDocumentActivity(documentId: string): Promise<DocumentActivity[]> {
    return this.db.select().from(documentActivity).where(eq(documentActivity.documentId, documentId)).orderBy(desc(documentActivity.createdAt));
  }

  async createDocumentActivity(insert: InsertDocumentActivity): Promise<DocumentActivity> {
    const [activity] = await this.db.insert(documentActivity).values(insert).returning();
    return activity;
  }
}
