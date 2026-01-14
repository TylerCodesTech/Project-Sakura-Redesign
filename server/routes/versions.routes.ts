import type { Express } from "express";
import { storage } from "../storage";
import { handleAsync, notFound, badRequest } from "../middleware/error-handler";

export function registerVersionRoutes(app: Express): void {
  // ============================================
  // VERSION AUDIT LOGS
  // ============================================

  // Get all version audit logs with pagination
  app.get(
    "/api/version-audit-logs",
    handleAsync(async (req, res) => {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const logs = await storage.getAllVersionAuditLogs(limit, offset);
      res.json(logs);
    })
  );

  // Get version audit logs for a specific document
  app.get(
    "/api/version-audit-logs/:documentType/:documentId",
    handleAsync(async (req, res) => {
      const logs = await storage.getVersionAuditLogs(
        req.params.documentId,
        req.params.documentType
      );
      res.json(logs);
    })
  );

  // ============================================
  // VERSION SEARCH & COMPARISON
  // ============================================

  // Search across all versions (pages and books)
  app.get(
    "/api/versions/search",
    handleAsync(async (req, res) => {
      const query = req.query.q;
      if (typeof query !== "string") {
        throw badRequest("Query required");
      }

      const results = await storage.searchVersions(query);

      // Format results with legacy version indicators
      const formattedPageVersions = results.pageVersions.map(v => ({
        ...v,
        displayLabel: v.isArchived === "true"
          ? `[Archived – Last Updated: ${new Date(v.createdAt).toLocaleDateString()}]`
          : `[Legacy Version – v${v.versionNumber}]`,
      }));

      const formattedBookVersions = results.bookVersions.map(v => ({
        ...v,
        displayLabel: v.isArchived === "true"
          ? `[Archived – Last Updated: ${new Date(v.createdAt).toLocaleDateString()}]`
          : `[Legacy Version – v${v.versionNumber}]`,
      }));

      res.json({ pageVersions: formattedPageVersions, bookVersions: formattedBookVersions });
    })
  );

  // Compare two versions of a page
  app.get(
    "/api/pages/:id/compare/:v1/:v2",
    handleAsync(async (req, res) => {
      const version1 = await storage.getPageVersion(req.params.id, parseInt(req.params.v1));
      const version2 = await storage.getPageVersion(req.params.id, parseInt(req.params.v2));

      if (!version1 || !version2) {
        throw notFound("One or both versions not found");
      }

      res.json({
        version1,
        version2,
        comparison: {
          titleChanged: version1.title !== version2.title,
          contentChanged: version1.content !== version2.content,
          statusChanged: version1.status !== version2.status,
        },
      });
    })
  );
}
