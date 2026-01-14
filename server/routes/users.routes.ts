import type { Express } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { handleAsync, notFound, badRequest, unauthorized } from "../middleware/error-handler";
import { validateRequest } from "../middleware/validation";

export function registerUserRoutes(app: Express) {
  // Get all users
  app.get("/api/users", handleAsync(async (_req, res) => {
    const allUsers = await storage.getUsers();
    res.json(allUsers.map(u => ({
      ...u,
      password: undefined,
    })));
  }));

  // Admin endpoint to create users (doesn't auto-login)
  app.post("/api/users", handleAsync(async (req, res) => {
    // Require authentication for admin user creation
    if (!req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    const { username, password, department } = req.body;

    if (!username || !password) {
      throw badRequest("Username and password are required");
    }

    if (password.length < 8) {
      throw badRequest("Password must be at least 8 characters");
    }

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      throw badRequest("Username already exists");
    }

    const { hashPassword } = await import("../auth");
    const hashedPassword = await hashPassword(password);

    const newUser = await storage.createUser({
      username,
      password: hashedPassword,
      department: department || "General",
    });

    // Return user without password - DON'T auto-login
    res.status(201).json({ ...newUser, password: undefined });
  }));

  // Get single user by ID
  app.get("/api/users/:id", handleAsync(async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      throw notFound("User not found");
    }
    res.json({ ...user, password: undefined });
  }));

  // Update user by ID
  app.patch("/api/users/:id", handleAsync(async (req, res) => {
    const { username, department, avatar, displayName, email, phone, bio } = req.body;
    const user = await storage.getUser(req.params.id);
    if (!user) {
      throw notFound("User not found");
    }
    const updateData: Record<string, any> = {};
    if (username !== undefined) updateData.username = username;
    if (department !== undefined) updateData.department = department;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;

    const updated = await storage.updateUser(req.params.id, updateData);
    res.json({ ...updated, password: undefined });
  }));

  // Update current user's profile
  app.patch("/api/profile", handleAsync(async (req, res) => {
    if (!req.user) {
      throw unauthorized("Unauthorized");
    }
    const { displayName, email, phone, bio, avatar } = req.body;
    const updateData: Record<string, any> = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updated = await storage.updateUser((req.user as any).id, updateData);
    res.json({ ...updated, password: undefined });
  }));

  // Reset user password
  app.post("/api/users/:id/reset-password", handleAsync(async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 8) {
      throw badRequest("Password must be at least 8 characters");
    }
    const user = await storage.getUser(req.params.id);
    if (!user) {
      throw notFound("User not found");
    }
    const { hashPassword } = await import("../auth");
    const hashedPassword = await hashPassword(password);
    await storage.updateUser(req.params.id, { password: hashedPassword });
    res.json({ success: true });
  }));
}
