import type { Express } from "express";
import { storage } from "../storage";
import { insertExternalLinkSchema } from "@shared/schema";
import { handleAsync, badRequest, notFound } from "../middleware/error-handler";
import { validateRequest } from "../middleware/validation";

export function registerExternalLinkRoutes(app: Express) {
  // Get all external links
  app.get("/api/external-links", handleAsync(async (_req, res) => {
    const links = await storage.getExternalLinks();
    res.json(links);
  }));

  // Proxy favicon requests
  app.get("/api/proxy-favicon", handleAsync(async (req, res) => {
    const { url } = req.query;
    if (typeof url !== 'string') {
      throw badRequest("URL required");
    }

    try {
      const domain = new URL(url).hostname;
      res.redirect(`https://icon.horse/icon/${domain}`);
    } catch (e) {
      throw badRequest("Invalid URL");
    }
  }));

  // Create external link
  app.post(
    "/api/external-links",
    validateRequest(insertExternalLinkSchema),
    handleAsync(async (req, res) => {
      const link = await storage.createExternalLink(req.body);
      res.json(link);
    })
  );

  // Delete external link
  app.delete("/api/external-links/:id", handleAsync(async (req, res) => {
    await storage.deleteExternalLink(req.params.id);
    res.sendStatus(204);
  }));

  // Reorder external links
  app.patch("/api/external-links/reorder", handleAsync(async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      throw badRequest("IDs array required");
    }

    await Promise.all(
      ids.map((id: string, index: number) =>
        storage.updateExternalLink(id, { order: index.toString() })
      )
    );
    res.sendStatus(204);
  }));

  // Update external link
  app.patch(
    "/api/external-links/:id",
    validateRequest(insertExternalLinkSchema.partial()),
    handleAsync(async (req, res) => {
      const link = await storage.updateExternalLink(req.params.id, req.body);
      if (!link) {
        throw notFound("External link not found");
      }
      res.json(link);
    })
  );
}
