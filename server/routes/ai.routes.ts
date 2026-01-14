import type { Express } from "express";
import { storage } from "../storage";
import { handleAsync, notFound, badRequest, unauthorized } from "../middleware/error-handler";

export function registerAIRoutes(app: Express) {
  // AI Status
  app.get("/api/ai/status", handleAsync(async (_req, res) => {
    const { isAIConfigured } = await import("../ai-chat");
    const status = await isAIConfigured();
    res.json(status);
  }));

  // AI Writing Assistant
  app.post("/api/ai/writing-assist", handleAsync(async (req, res) => {
    const { isAIConfigured, generateWritingAssistance } = await import("../ai-chat");

    const status = await isAIConfigured();
    if (!status.configured) {
      throw badRequest(status.reason || "AI is not configured");
    }

    const { prompt, context, action } = req.body;
    if (!prompt) {
      throw badRequest("Prompt is required");
    }

    const result = await generateWritingAssistance(prompt, context, action);
    res.json({ result });
  }));

  // AI Chat
  app.post("/api/ai/chat", handleAsync(async (req, res) => {
    const { isAIConfigured, generateAIResponse } = await import("../ai-chat");

    const status = await isAIConfigured();
    if (!status.configured) {
      throw badRequest(status.reason || "AI is not configured");
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      throw badRequest("Messages array is required");
    }

    const result = await generateAIResponse(messages);
    res.json({ result });
  }));

  // Get all AI model configurations
  app.get("/api/ai/models", handleAsync(async (req, res) => {
    const type = req.query.type as string | undefined;
    const configs = await storage.getAiModelConfigs(type);
    res.json(configs);
  }));

  // Get AI model configuration by ID
  app.get("/api/ai/models/:id", handleAsync(async (req, res) => {
    const config = await storage.getAiModelConfig(req.params.id);
    if (!config) {
      throw notFound("AI model config not found");
    }
    res.json(config);
  }));

  // Get active AI model configuration by type
  app.get("/api/ai/models/active/:type", handleAsync(async (req, res) => {
    const config = await storage.getActiveAiModelConfig(req.params.type);
    res.json(config || null);
  }));

  // Create AI model configuration
  app.post("/api/ai/models", handleAsync(async (req, res) => {
    const config = await storage.createAiModelConfig(req.body);
    res.json(config);
  }));

  // Update AI model configuration
  app.patch("/api/ai/models/:id", handleAsync(async (req, res) => {
    const config = await storage.updateAiModelConfig(req.params.id, req.body);
    res.json(config);
  }));

  // Delete AI model configuration
  app.delete("/api/ai/models/:id", handleAsync(async (req, res) => {
    await storage.deleteAiModelConfig(req.params.id);
    res.sendStatus(204);
  }));

  // Activate AI model configuration
  app.post("/api/ai/models/:id/activate", handleAsync(async (req, res) => {
    const config = await storage.getAiModelConfig(req.params.id);
    if (!config) {
      throw notFound("AI model config not found");
    }
    const updated = await storage.setActiveAiModelConfig(req.params.id, config.type);
    res.json(updated);
  }));

  // AI Indexing Statistics
  app.get("/api/ai/indexing-stats", handleAsync(async (_req, res) => {
    const pages = await storage.getPages("");
    const allPages: any[] = [];
    const books = await storage.getBooks();
    for (const book of books) {
      const bookPages = await storage.getPages(book.id);
      allPages.push(...bookPages);
    }
    const standalonePagesRaw = await storage.getStandalonePages();
    allPages.push(...standalonePagesRaw);

    const tickets = await storage.getTickets();

    const pagesWithEmbedding = allPages.filter(p => p.embedding).length;
    const pagesPending = allPages.length - pagesWithEmbedding;
    const ticketsWithEmbedding = tickets.filter(t => t.embedding).length;
    const ticketsPending = tickets.length - ticketsWithEmbedding;

    res.json({
      pages: {
        total: allPages.length,
        indexed: pagesWithEmbedding,
        pending: pagesPending,
      },
      tickets: {
        total: tickets.length,
        indexed: ticketsWithEmbedding,
        pending: ticketsPending,
      },
      totalIndexed: pagesWithEmbedding + ticketsWithEmbedding,
      totalPending: pagesPending + ticketsPending,
    });
  }));

  // Embedding management endpoints
  app.post("/api/embeddings/reindex-pages", handleAsync(async (_req, res) => {
    const { reindexAllPages } = await import("../embeddings");
    const result = await reindexAllPages();
    res.json(result);
  }));

  app.post("/api/embeddings/reindex-tickets", handleAsync(async (_req, res) => {
    const { reindexAllTickets } = await import("../embeddings");
    const result = await reindexAllTickets();
    res.json(result);
  }));

  app.post("/api/pages/:pageId/update-embedding", handleAsync(async (req, res) => {
    const { updatePageEmbedding } = await import("../embeddings");
    await updatePageEmbedding(req.params.pageId);
    res.json({ success: true });
  }));
}
