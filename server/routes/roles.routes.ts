import type { Express } from "express";
import { storage } from "../storage";
import { insertRoleSchema, AVAILABLE_PERMISSIONS, PERMISSION_CATEGORIES } from "@shared/schema";

/**
 * RBAC (Role-Based Access Control) Routes
 * Handles roles, permissions, and user role assignments
 */
export function registerRolesRoutes(app: Express): void {
  // ============================================
  // PERMISSIONS
  // ============================================

  // Get available permissions catalog
  app.get("/api/permissions", async (_req, res) => {
    const permissions = Object.entries(AVAILABLE_PERMISSIONS).map(([key, value]) => ({
      key,
      ...value,
    }));
    const categories = Object.values(PERMISSION_CATEGORIES);
    res.json({ permissions, categories });
  });

  // ============================================
  // ROLES
  // ============================================

  // Get all roles
  app.get("/api/roles", async (_req, res) => {
    const roles = await storage.getRoles();
    res.json(roles);
  });

  // Get a specific role with its permissions
  app.get("/api/roles/:id", async (req, res) => {
    const role = await storage.getRoleWithPermissions(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  });

  // Create a new role
  app.post("/api/roles", async (req, res) => {
    const result = insertRoleSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const role = await storage.createRole(result.data);

      // Log the creation
      await storage.createAuditLog({
        actorId: req.body.actorId || null,
        actorName: req.body.actorName || "System",
        actionType: "role.created",
        targetType: "role",
        targetId: role.id,
        targetName: role.name,
        description: `Created role "${role.name}"`,
        metadata: JSON.stringify({ role }),
      });

      res.json(role);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update a role
  app.patch("/api/roles/:id", async (req, res) => {
    const result = insertRoleSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const existingRole = await storage.getRole(req.params.id);
      const userCount = await storage.getUserRoleCount(req.params.id);
      const role = await storage.updateRole(req.params.id, result.data);

      // Log the update
      await storage.createAuditLog({
        actorId: req.body.actorId || null,
        actorName: req.body.actorName || "System",
        actionType: "role.updated",
        targetType: "role",
        targetId: role.id,
        targetName: role.name,
        description: `Updated role "${role.name}" (affects ${userCount} user${userCount !== 1 ? 's' : ''})`,
        metadata: JSON.stringify({ before: existingRole, after: role, affectedUsers: userCount }),
      });

      res.json(role);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a role
  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const role = await storage.getRole(req.params.id);
      if (!role) return res.status(404).json({ error: "Role not found" });

      const userCount = await storage.getUserRoleCount(req.params.id);
      await storage.deleteRole(req.params.id);

      // Log the deletion
      await storage.createAuditLog({
        actorId: req.body.actorId || null,
        actorName: req.body.actorName || "System",
        actionType: "role.deleted",
        targetType: "role",
        targetId: role.id,
        targetName: role.name,
        description: `Deleted role "${role.name}" (affected ${userCount} user${userCount !== 1 ? 's' : ''})`,
        metadata: JSON.stringify({ role, affectedUsers: userCount }),
      });

      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // ROLE PERMISSIONS
  // ============================================

  // Get permissions for a role
  app.get("/api/roles/:roleId/permissions", async (req, res) => {
    const permissions = await storage.getRolePermissions(req.params.roleId);
    res.json(permissions);
  });

  // Set permissions for a role
  app.put("/api/roles/:roleId/permissions", async (req, res) => {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) return res.status(400).json({ error: "permissions must be an array" });

    try {
      const role = await storage.getRole(req.params.roleId);
      if (!role) return res.status(404).json({ error: "Role not found" });
      if (role.isSystem === "true") return res.status(400).json({ error: "Cannot modify system role permissions" });

      const oldPermissions = await storage.getRolePermissions(req.params.roleId);
      const newPermissions = await storage.setRolePermissions(req.params.roleId, permissions);
      const userCount = await storage.getUserRoleCount(req.params.roleId);

      // Log the permission change
      await storage.createAuditLog({
        actorId: req.body.actorId || null,
        actorName: req.body.actorName || "System",
        actionType: "role.permissions_updated",
        targetType: "role",
        targetId: role.id,
        targetName: role.name,
        description: `Updated permissions for role "${role.name}" (affects ${userCount} user${userCount !== 1 ? 's' : ''})`,
        metadata: JSON.stringify({
          before: oldPermissions.map(p => p.permission),
          after: permissions,
          affectedUsers: userCount
        }),
      });

      res.json(newPermissions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get users assigned to a role
  app.get("/api/roles/:roleId/users", async (req, res) => {
    const userRoles = await storage.getUsersWithRole(req.params.roleId);
    res.json(userRoles);
  });

  // ============================================
  // USER ROLES
  // ============================================

  // Get roles for a user
  app.get("/api/user-roles/:userId", async (req, res) => {
    const userRoles = await storage.getUserRoles(req.params.userId);
    res.json(userRoles);
  });

  // Get permissions for a user (aggregated from all roles)
  app.get("/api/user-roles/:userId/permissions", async (req, res) => {
    const permissions = await storage.getUserPermissions(req.params.userId);
    res.json(permissions);
  });

  // Assign a role to a user
  app.post("/api/user-roles/:userId", async (req, res) => {
    const { roleId, assignedBy, assignedByName } = req.body;
    if (!roleId) return res.status(400).json({ error: "roleId is required" });

    try {
      const role = await storage.getRole(roleId);
      if (!role) return res.status(404).json({ error: "Role not found" });

      const user = await storage.getUser(req.params.userId);
      const userRole = await storage.assignUserRole({
        userId: req.params.userId,
        roleId,
        assignedBy,
      });

      // Log the assignment
      await storage.createAuditLog({
        actorId: assignedBy || null,
        actorName: assignedByName || "System",
        actionType: "user.role_assigned",
        targetType: "user",
        targetId: req.params.userId,
        targetName: user?.username || "Unknown User",
        description: `Assigned role "${role.name}" to user "${user?.username || req.params.userId}"`,
        metadata: JSON.stringify({ roleId, roleName: role.name, userId: req.params.userId }),
      });

      res.json(userRole);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Remove a role from a user
  app.delete("/api/user-roles/:userId/:roleId", async (req, res) => {
    try {
      const role = await storage.getRole(req.params.roleId);
      const user = await storage.getUser(req.params.userId);

      await storage.removeUserRole(req.params.userId, req.params.roleId);

      // Log the removal
      await storage.createAuditLog({
        actorId: req.body.actorId || null,
        actorName: req.body.actorName || "System",
        actionType: "user.role_removed",
        targetType: "user",
        targetId: req.params.userId,
        targetName: user?.username || "Unknown User",
        description: `Removed role "${role?.name || req.params.roleId}" from user "${user?.username || req.params.userId}"`,
        metadata: JSON.stringify({ roleId: req.params.roleId, roleName: role?.name, userId: req.params.userId }),
      });

      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
}
