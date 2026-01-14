import type { Express } from "express";
import { storage } from "../storage";
import { insertNewsSchema, insertStatSchema } from "@shared/schema";
import { handleAsync, notFound, badRequest } from "../middleware/error-handler";
import { validateRequest } from "../middleware/validation";

export function registerNewsRoutes(app: Express) {
  // Get all news
  app.get("/api/news", handleAsync(async (_req, res) => {
    const news = await storage.getNews();
    res.json(news);
  }));

  // Create news
  app.post(
    "/api/news",
    validateRequest(insertNewsSchema),
    handleAsync(async (req, res) => {
      const news = await storage.createNews(req.body);
      res.json(news);
    })
  );

  // Get all stats
  app.get("/api/stats", handleAsync(async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  }));

  // Update stat by key
  app.patch(
    "/api/stats/:key",
    validateRequest(insertStatSchema.partial()),
    handleAsync(async (req, res) => {
      const stat = await storage.updateStat(req.params.key, req.body);
      if (!stat) {
        throw notFound("Stat not found");
      }
      res.json(stat);
    })
  );
}
