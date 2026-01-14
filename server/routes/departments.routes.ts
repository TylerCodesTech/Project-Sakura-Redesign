import type { Express } from "express";
import { storage } from "../storage";
import { insertDepartmentSchema } from "@shared/schema";
import { handleAsync, notFound, badRequest } from "../middleware/error-handler";
import { validateRequest } from "../middleware/validation";

export function registerDepartmentRoutes(app: Express) {
  // Get all departments
  app.get("/api/departments", handleAsync(async (_req, res) => {
    const departments = await storage.getDepartments();
    res.json(departments);
  }));

  // Create new department
  app.post(
    "/api/departments",
    validateRequest(insertDepartmentSchema),
    handleAsync(async (req, res) => {
      const department = await storage.createDepartment(req.body);
      res.json(department);
    })
  );

  // Update department
  app.patch(
    "/api/departments/:id",
    validateRequest(insertDepartmentSchema.partial()),
    handleAsync(async (req, res) => {
      const department = await storage.updateDepartment(req.params.id, req.body);
      if (!department) {
        throw notFound("Department not found");
      }
      res.json(department);
    })
  );

  // Delete department
  app.delete("/api/departments/:id", handleAsync(async (req, res) => {
    const departmentId = req.params.id;

    // Get the department to find its name
    const departments = await storage.getDepartments();
    const department = departments.find(d => d.id === departmentId);

    if (!department) {
      throw notFound("Department not found");
    }

    // Check users by department name (users store department name, not ID)
    const users = await storage.getUsers();
    const usersInDepartment = users.filter(u => u.department === department.name);

    if (usersInDepartment.length > 0) {
      throw badRequest(
        `Cannot delete department. There are ${usersInDepartment.length} user(s) assigned to this department. Please reassign them first.`
      );
    }

    await storage.deleteDepartment(departmentId);
    res.sendStatus(204);
  }));
}
