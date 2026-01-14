import type { Express } from "express";
import { storage } from "../storage";
import {
  insertTicketFormCategorySchema,
  insertTicketFormFieldSchema,
} from "@shared/schema";

/**
 * Ticket Form Categories and Fields Routes
 *
 * Handles:
 * - Ticket form categories (grouping of form fields)
 * - Ticket form fields (custom fields for tickets)
 * - Field organization and categorization
 */
export function registerFormRoutes(app: Express) {
  // ============== TICKET FORM CATEGORIES ==============

  app.get("/api/helpdesks/:helpdeskId/form-categories", async (req, res) => {
    const categories = await storage.getTicketFormCategories(req.params.helpdeskId);
    res.json(categories);
  });

  app.get("/api/form-categories/:id", async (req, res) => {
    const category = await storage.getTicketFormCategory(req.params.id);
    if (!category) return res.status(404).json({ error: "Form category not found" });
    res.json(category);
  });

  app.post("/api/helpdesks/:helpdeskId/form-categories", async (req, res) => {
    const result = insertTicketFormCategorySchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const category = await storage.createTicketFormCategory(result.data);
    res.json(category);
  });

  app.patch("/api/form-categories/:id", async (req, res) => {
    const result = insertTicketFormCategorySchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const category = await storage.updateTicketFormCategory(req.params.id, result.data);
      res.json(category);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/form-categories/:id", async (req, res) => {
    await storage.deleteTicketFormCategory(req.params.id);
    res.sendStatus(204);
  });

  // Get form fields for a specific category
  app.get("/api/form-categories/:categoryId/fields", async (req, res) => {
    const fields = await storage.getTicketFormFieldsByCategory(req.params.categoryId);
    res.json(fields);
  });

  // ============== TICKET FORM FIELDS ==============

  app.get("/api/helpdesks/:helpdeskId/form-fields", async (req, res) => {
    const fields = await storage.getTicketFormFields(req.params.helpdeskId);
    res.json(fields);
  });

  app.post("/api/helpdesks/:helpdeskId/form-fields", async (req, res) => {
    const result = insertTicketFormFieldSchema.safeParse({ ...req.body, helpdeskId: req.params.helpdeskId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const field = await storage.createTicketFormField(result.data);
    res.json(field);
  });

  app.patch("/api/form-fields/:id", async (req, res) => {
    const result = insertTicketFormFieldSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const field = await storage.updateTicketFormField(req.params.id, result.data);
      res.json(field);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete("/api/form-fields/:id", async (req, res) => {
    await storage.deleteTicketFormField(req.params.id);
    res.sendStatus(204);
  });
}
