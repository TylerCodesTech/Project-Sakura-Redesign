import type { Express } from "express";
import { storage } from "../storage";
import { handleAsync, badRequest } from "../middleware/error-handler";

export function registerSearchRoutes(app: Express): void {
  // ============================================
  // GLOBAL SEARCH
  // ============================================

  // Search across books, pages, departments, and optionally versions
  app.get(
    "/api/search",
    handleAsync(async (req, res) => {
      const query = req.query.q;
      const includeVersions = req.query.includeVersions === "true";
      if (typeof query !== "string") {
        throw badRequest("Query required");
      }

      const books = await storage.getBooks();
      const pages = await storage.getStandalonePages();
      const departments = await storage.getDepartments();

      const results: Array<{
        type: string;
        id: string;
        title: string;
        link: string;
        displayLabel?: string;
        isLegacy?: boolean;
        versionNumber?: number;
      }> = [
        ...books.filter(b => b.title.toLowerCase().includes(query.toLowerCase()))
          .map(b => ({ type: 'book', id: b.id, title: b.title, link: `/documents/book/${b.id}` })),
        ...pages.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
          .map(p => ({ type: 'page', id: p.id, title: p.title, link: `/documents/edit/${p.id}` })),
        ...departments.filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
          .map(d => ({ type: 'department', id: d.id, title: d.name, link: `/system-settings` }))
      ];

      // Include legacy versions in search if requested or by default
      if (includeVersions !== false) {
        try {
          const versionResults = await storage.searchVersions(query);

          // Add page versions with legacy indicators
          versionResults.pageVersions.forEach(v => {
            const isArchived = v.isArchived === "true";
            const displayLabel = isArchived
              ? `[Archived – Last Updated: ${new Date(v.createdAt).toLocaleDateString('en-GB')}]`
              : `[Legacy Version – v${v.versionNumber}]`;

            results.push({
              type: 'page_version',
              id: v.id,
              title: v.title,
              link: `/documents/edit/${v.pageId}?version=${v.versionNumber}`,
              displayLabel,
              isLegacy: true,
              versionNumber: v.versionNumber,
            });
          });

          // Add book versions with legacy indicators
          versionResults.bookVersions.forEach(v => {
            const isArchived = v.isArchived === "true";
            const displayLabel = isArchived
              ? `[Archived – Last Updated: ${new Date(v.createdAt).toLocaleDateString('en-GB')}]`
              : `[Legacy Version – v${v.versionNumber}]`;

            results.push({
              type: 'book_version',
              id: v.id,
              title: v.title,
              link: `/documents/book/${v.bookId}?version=${v.versionNumber}`,
              displayLabel,
              isLegacy: true,
              versionNumber: v.versionNumber,
            });
          });
        } catch (e) {
          // Version search failed, continue with regular results
          console.error("Version search error:", e);
        }
      }

      res.json(results);
    })
  );

  // ============================================
  // EMBEDDINGS MANAGEMENT
  // ============================================

  // Reindex all pages embeddings
  app.post(
    "/api/embeddings/reindex-pages",
    handleAsync(async (_req, res) => {
      const { reindexAllPages } = await import("../embeddings");
      const result = await reindexAllPages();
      res.json(result);
    })
  );

  // Reindex all tickets embeddings
  app.post(
    "/api/embeddings/reindex-tickets",
    handleAsync(async (_req, res) => {
      const { reindexAllTickets } = await import("../embeddings");
      const result = await reindexAllTickets();
      res.json(result);
    })
  );

  // Update embedding for a specific page
  app.post(
    "/api/pages/:pageId/update-embedding",
    handleAsync(async (req, res) => {
      const { updatePageEmbedding } = await import("../embeddings");
      await updatePageEmbedding(req.params.pageId);
      res.json({ success: true });
    })
  );
}
