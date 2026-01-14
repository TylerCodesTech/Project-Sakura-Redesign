import type { Express } from "express";
import { storage } from "../storage";
import { insertTicketSchema, insertTicketCommentSchema } from "@shared/schema";

/**
 * Ticket CRUD and Management Routes
 *
 * Handles:
 * - Ticket creation, retrieval, and updates
 * - Ticket assignment and status changes
 * - Ticket comments
 * - Related document search (vector similarity)
 */
export function registerTicketRoutes(app: Express) {
  // ============== TICKETS ==============

  app.get("/api/tickets", async (req, res) => {
    const helpdeskId = req.query.helpdeskId as string | undefined;
    const tickets = await storage.getTickets(helpdeskId);
    res.json(tickets);
  });

  app.get("/api/tickets/:id", async (req, res) => {
    const ticket = await storage.getTicket(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  });

  app.post("/api/tickets", async (req, res) => {
    const result = insertTicketSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    const ticket = await storage.createTicket(result.data);
    res.json(ticket);
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    const result = insertTicketSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error });
    try {
      const ticket = await storage.updateTicket(req.params.id, result.data);
      res.json(ticket);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  // ============== TICKET COMMENTS ==============

  app.get("/api/tickets/:ticketId/comments", async (req, res) => {
    const comments = await storage.getTicketComments(req.params.ticketId);
    res.json(comments);
  });

  app.post("/api/tickets/:ticketId/comments", async (req, res) => {
    const result = insertTicketCommentSchema.safeParse({ ...req.body, ticketId: req.params.ticketId });
    if (!result.success) return res.status(400).json({ error: result.error });
    const comment = await storage.createTicketComment(result.data);
    res.json(comment);
  });

  // ============== RELATED DOCUMENTS ==============

  app.get("/api/tickets/:ticketId/related-documents", async (req, res) => {
    try {
      const { findRelatedDocumentsForTicket } = await import("../embeddings");
      const documents = await findRelatedDocumentsForTicket(req.params.ticketId);
      res.json(documents);
    } catch (error: any) {
      console.error("Error finding related documents:", error);
      if (error.message?.includes("OPENAI_API_KEY")) {
        res.json([]);
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
}
