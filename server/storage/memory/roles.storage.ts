import {
  type Role, type InsertRole,
  type RolePermission, type InsertRolePermission,
  type UserRole, type InsertUserRole,
  type AuditLog, type InsertAuditLog,
  type DocumentActivity, type InsertDocumentActivity,
  type RoleWithUserCount, type RoleWithPermissions,
  AVAILABLE_PERMISSIONS
} from "@shared/schema";
import { randomUUID } from "crypto";

export class RolesStorage {
  private roles: Map<string, Role>;
  private rolePermissions: Map<string, RolePermission>;
  private userRoles: Map<string, UserRole>;
  private auditLogs: Map<string, AuditLog>;
  private documentActivities: Map<string, DocumentActivity>;

  constructor() {
    this.roles = new Map();
    this.rolePermissions = new Map();
    this.userRoles = new Map();
    this.auditLogs = new Map();
    this.documentActivities = new Map();

    // Initialize Super Admin role with all permissions
    const superAdminId = randomUUID();
    this.roles.set(superAdminId, {
      id: superAdminId,
      name: "Super Admin",
      description: "Full platform access with all permissions. This role cannot be modified or deleted.",
      color: "#dc2626",
      isSystem: "true",
      priority: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    // Add all permissions to Super Admin
    Object.keys(AVAILABLE_PERMISSIONS).forEach(permission => {
      const permId = randomUUID();
      this.rolePermissions.set(permId, {
        id: permId,
        roleId: superAdminId,
        permission,
        scopeType: null,
        scopeId: null,
        createdAt: new Date().toISOString(),
      });
    });
  }

  // Role methods
  async getRoles(): Promise<RoleWithUserCount[]> {
    const rolesArray = Array.from(this.roles.values());
    return rolesArray.map(role => ({
      ...role,
      userCount: Array.from(this.userRoles.values()).filter(ur => ur.roleId === role.id).length
    })).sort((a, b) => b.priority - a.priority);
  }

  async getRole(id: string): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async getRoleWithPermissions(id: string): Promise<RoleWithPermissions | undefined> {
    const role = this.roles.get(id);
    if (!role) return undefined;
    const permissions = Array.from(this.rolePermissions.values()).filter(rp => rp.roleId === id);
    return { ...role, permissions };
  }

  async createRole(insert: InsertRole): Promise<Role> {
    const id = randomUUID();
    const role: Role = {
      id,
      name: insert.name,
      description: insert.description ?? null,
      color: insert.color ?? "#6366f1",
      isSystem: insert.isSystem ?? "false",
      priority: insert.priority ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: string, update: Partial<InsertRole>): Promise<Role> {
    const existing = this.roles.get(id);
    if (!existing) throw new Error("Role not found");
    if (existing.isSystem === "true") throw new Error("Cannot modify system roles");
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.roles.set(id, updated);
    return updated;
  }

  async deleteRole(id: string): Promise<void> {
    const existing = this.roles.get(id);
    if (existing?.isSystem === "true") throw new Error("Cannot delete system roles");
    this.roles.delete(id);
    // Also delete associated permissions and user assignments
    Array.from(this.rolePermissions.values())
      .filter(rp => rp.roleId === id)
      .forEach(rp => this.rolePermissions.delete(rp.id));
    Array.from(this.userRoles.values())
      .filter(ur => ur.roleId === id)
      .forEach(ur => this.userRoles.delete(ur.id));
  }

  // Role Permission methods
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return Array.from(this.rolePermissions.values()).filter(rp => rp.roleId === roleId);
  }

  async createRolePermission(insert: InsertRolePermission): Promise<RolePermission> {
    const id = randomUUID();
    const rp: RolePermission = {
      id,
      roleId: insert.roleId,
      permission: insert.permission,
      scopeType: insert.scopeType ?? null,
      scopeId: insert.scopeId ?? null,
      createdAt: new Date().toISOString(),
    };
    this.rolePermissions.set(id, rp);
    return rp;
  }

  async updateRolePermission(id: string, update: Partial<InsertRolePermission>): Promise<RolePermission> {
    const existing = this.rolePermissions.get(id);
    if (!existing) throw new Error("Role permission not found");
    const updated = { ...existing, ...update };
    this.rolePermissions.set(id, updated);
    return updated;
  }

  async deleteRolePermission(roleId: string, permission: string): Promise<void> {
    const toDelete = Array.from(this.rolePermissions.values())
      .find(rp => rp.roleId === roleId && rp.permission === permission);
    if (toDelete) {
      this.rolePermissions.delete(toDelete.id);
    }
  }

  // User Role methods
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return Array.from(this.userRoles.values()).filter(ur => ur.userId === userId);
  }

  async assignRoleToUser(insert: InsertUserRole): Promise<UserRole> {
    // Check if already assigned
    const existing = Array.from(this.userRoles.values())
      .find(ur => ur.userId === insert.userId && ur.roleId === insert.roleId);
    if (existing) return existing;

    const id = randomUUID();
    const ur: UserRole = {
      id,
      userId: insert.userId,
      roleId: insert.roleId,
      assignedBy: insert.assignedBy ?? null,
      assignedAt: new Date().toISOString(),
    };
    this.userRoles.set(id, ur);
    return ur;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const toDelete = Array.from(this.userRoles.values())
      .find(ur => ur.userId === userId && ur.roleId === roleId);
    if (toDelete) {
      this.userRoles.delete(toDelete.id);
    }
  }

  async bulkAssignRoles(assignments: InsertUserRole[]): Promise<UserRole[]> {
    const results: UserRole[] = [];
    for (const assignment of assignments) {
      const result = await this.assignRoleToUser(assignment);
      results.push(result);
    }
    return results;
  }

  async bulkRemoveRoles(removals: { userId: string; roleId: string }[]): Promise<void> {
    for (const { userId, roleId } of removals) {
      await this.removeRoleFromUser(userId, roleId);
    }
  }

  async getUsersByRole(roleId: string): Promise<UserRole[]> {
    return Array.from(this.userRoles.values()).filter(ur => ur.roleId === roleId);
  }

  // Audit Log methods
  async getAuditLogs(limit = 100, offset = 0): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(offset, offset + limit);
  }

  async createAuditLog(insert: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = {
      id,
      actorId: insert.actorId ?? null,
      actorName: insert.actorName ?? null,
      actionType: insert.actionType,
      targetType: insert.targetType,
      targetId: insert.targetId ?? null,
      targetName: insert.targetName ?? null,
      description: insert.description,
      metadata: insert.metadata ?? null,
      ipAddress: insert.ipAddress ?? null,
      userAgent: insert.userAgent ?? null,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogsByUser(actorId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.actorId === actorId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getAuditLogsByEntity(targetType: string, targetId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.targetType === targetType && log.targetId === targetId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getAuditLogsByAction(actionType: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.actionType === actionType)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // Document Activity methods
  async getDocumentActivity(documentId: string): Promise<DocumentActivity[]> {
    return Array.from(this.documentActivities.values())
      .filter(activity => activity.documentId === documentId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createDocumentActivity(insert: InsertDocumentActivity): Promise<DocumentActivity> {
    const id = randomUUID();
    const activity: DocumentActivity = {
      id,
      documentId: insert.documentId,
      documentType: insert.documentType,
      action: insert.action,
      userId: insert.userId,
      details: insert.details ?? null,
      createdAt: new Date().toISOString(),
    };
    this.documentActivities.set(id, activity);
    return activity;
  }

  // Helper methods for role-related operations with user counts
  async getRolesWithUserCount(): Promise<RoleWithUserCount[]> {
    return this.getRoles();
  }
}
