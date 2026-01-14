import type { Express } from "express";
import { storage } from "../storage";
import {
  insertPageSchema,
  insertCommentSchema,
  insertPageVersionSchema
} from "@shared/schema";
import { handleAsync, notFound, badRequest } from "../middleware/error-handler";
import { validateRequest } from "../middleware/validation";

export function registerPageRoutes(app: Express): void {
  // ============================================
  // PAGE CRUD OPERATIONS
  // ============================================

  // Get all standalone pages
  app.get(
    "/api/pages",
    handleAsync(async (_req, res) => {
      const pages = await storage.getStandalonePages();
      res.json(pages);
    })
  );

  // Create a new page
  app.post(
    "/api/pages",
    validateRequest(insertPageSchema),
    handleAsync(async (req, res) => {
      // Auto-assign reviewer if status is in_review
      const pageData = req.body;
      if (pageData.status === "in_review") {
        const author = await storage.getUser(pageData.authorId);
        if (author) {
          const deptMembers = await storage.getUsersByDepartment(author.department);
          const candidates = deptMembers.filter(m => m.id !== author.id);
          if (candidates.length > 0) {
            pageData.reviewerId = candidates[Math.floor(Math.random() * candidates.length)].id;
          }
        }
      }

      const page = await storage.createPage(pageData);

      // Create notification for reviewer
      if (page.reviewerId) {
        await storage.createNotification({
          userId: page.reviewerId,
          title: "New Page for Review",
          message: `"${page.title}" has been submitted for your review.`,
          link: `/documents?pageId=${page.id}`,
          targetId: page.id,
        });
      }

      res.json(page);
    })
  );

  // Get a single page by ID
  app.get(
    "/api/pages/:id",
    handleAsync(async (req, res) => {
      const page = await storage.getPage(req.params.id);
      if (!page) {
        throw notFound("Page not found");
      }
      res.json(page);
    })
  );

  // Delete a page
  app.delete(
    "/api/pages/:id",
    handleAsync(async (req, res) => {
      await storage.deletePage(req.params.id);
      res.json({ success: true });
    })
  );

  // Update a page
  app.patch(
    "/api/pages/:id",
    handleAsync(async (req, res) => {
      const existing = await storage.getPage(req.params.id);
      if (!existing) {
        throw notFound("Page not found");
      }

      // Check if this is a move operation (parentId is being changed)
      const isMove = req.body.parentId !== undefined && req.body.parentId !== existing.parentId;
      const oldParentId = existing.parentId;

      // Handle transition to review
      if (req.body.status === "in_review" && existing.status === "draft") {
        const author = await storage.getUser(existing.authorId);
        if (author) {
          const deptMembers = await storage.getUsersByDepartment(author.department);
          const candidates = deptMembers.filter(m => m.id !== author.id);
          if (candidates.length > 0) {
            req.body.reviewerId = candidates[Math.floor(Math.random() * candidates.length)].id;
          }
        }
      }

      const page = await storage.updatePage(req.params.id, req.body);

      // Log move activity
      if (isMove) {
        let fromName = 'Root';
        let toName = 'Root';

        if (oldParentId) {
          const oldParent = await storage.getPage(oldParentId);
          if (oldParent) fromName = oldParent.title;
        }

        if (req.body.parentId) {
          const newParent = await storage.getPage(req.body.parentId);
          if (newParent) toName = newParent.title;
        }

        await storage.createDocumentActivity({
          documentId: page.id,
          documentType: page.type,
          action: 'moved',
          userId: 'current-user-id',
          details: JSON.stringify({ from: fromName, to: toName, fromId: oldParentId, toId: req.body.parentId }),
        });
      }

      // Create notification for status changes
      if (req.body.status === "in_review" && page.reviewerId) {
        await storage.createNotification({
          userId: page.reviewerId,
          title: "New Page for Review",
          message: `"${page.title}" has been submitted for your review.`,
          link: `/documents?pageId=${page.id}`,
          targetId: page.id,
        });
      } else if (req.body.status === "published") {
        // Resolve review notification if it exists
        const reviewNotif = await (storage as any).getActiveReviewNotification(page.reviewerId, page.id);
        if (reviewNotif) {
          await storage.markNotificationRead(reviewNotif.id);
        }

        await storage.createNotification({
          userId: page.authorId,
          title: "Page Published",
          message: `Your page "${page.title}" has been published.`,
          link: `/documents?pageId=${page.id}`,
          targetId: page.id,
        });
      }

      res.json(page);
    })
  );

  // ============================================
  // PAGE COMMENTS
  // ============================================

  // Get comments for a page
  app.get(
    "/api/pages/:id/comments",
    handleAsync(async (req, res) => {
      const comments = await storage.getComments(req.params.id);
      res.json(comments);
    })
  );

  // Create a comment on a page
  app.post(
    "/api/pages/:id/comments",
    handleAsync(async (req, res) => {
      const result = insertCommentSchema.safeParse({ ...req.body, pageId: req.params.id });
      if (!result.success) {
        throw badRequest(result.error.message);
      }
      const comment = await storage.createComment(result.data);

      // Create notification for page author
      const page = await storage.getPage(result.data.pageId);
      if (page && page.authorId !== result.data.userId) {
        await storage.createNotification({
          userId: page.authorId,
          title: "New Comment",
          message: `Someone commented on your page "${page.title}".`,
        });
      }

      res.json(comment);
    })
  );

  // ============================================
  // PAGE SEARCH
  // ============================================

  // Search for pages by title within a book
  app.get(
    "/api/pages/search",
    handleAsync(async (req, res) => {
      const { bookId, title } = req.query;
      if (typeof bookId !== 'string' || typeof title !== 'string') {
        throw badRequest("Invalid query params");
      }
      const page = await storage.getPageByTitle(bookId, title);
      res.json(page || null);
    })
  );

  // ============================================
  // PAGE VERSION HISTORY
  // ============================================

  // Get all versions of a page
  app.get(
    "/api/pages/:id/versions",
    handleAsync(async (req, res) => {
      const versions = await storage.getPageVersions(req.params.id);
      res.json(versions);
    })
  );

  // Get a specific version of a page
  app.get(
    "/api/pages/:id/versions/:versionNumber",
    handleAsync(async (req, res) => {
      const version = await storage.getPageVersion(
        req.params.id,
        parseInt(req.params.versionNumber)
      );
      if (!version) {
        throw notFound("Version not found");
      }
      res.json(version);
    })
  );

  // Create a new version of a page
  app.post(
    "/api/pages/:id/versions",
    handleAsync(async (req, res) => {
      const page = await storage.getPage(req.params.id);
      if (!page) {
        throw notFound("Page not found");
      }

      const latestVersion = await storage.getLatestPageVersionNumber(req.params.id);
      const newVersionNumber = latestVersion + 1;

      const versionData = {
        pageId: req.params.id,
        versionNumber: newVersionNumber,
        title: page.title,
        content: page.content,
        status: page.status,
        authorId: req.body.authorId || page.authorId,
        changeDescription: req.body.changeDescription || null,
      };

      const result = insertPageVersionSchema.safeParse(versionData);
      if (!result.success) {
        throw badRequest(result.error.message);
      }

      const version = await storage.createPageVersion(result.data);

      // Log the version creation
      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "page",
        actionType: "created",
        toVersion: newVersionNumber,
        userId: req.body.authorId || page.authorId,
        userName: req.body.userName,
        details: JSON.stringify({ title: page.title, changeDescription: req.body.changeDescription }),
      });

      res.json(version);
    })
  );

  // Revert a page to a previous version
  app.post(
    "/api/pages/:id/revert/:versionNumber",
    handleAsync(async (req, res) => {
      const targetVersion = await storage.getPageVersion(
        req.params.id,
        parseInt(req.params.versionNumber)
      );
      if (!targetVersion) {
        throw notFound("Version not found");
      }

      const currentPage = await storage.getPage(req.params.id);
      if (!currentPage) {
        throw notFound("Page not found");
      }

      // Save current state as a new version before reverting
      const latestVersion = await storage.getLatestPageVersionNumber(req.params.id);
      await storage.createPageVersion({
        pageId: req.params.id,
        versionNumber: latestVersion + 1,
        title: currentPage.title,
        content: currentPage.content,
        status: currentPage.status,
        authorId: currentPage.authorId,
        changeDescription: `Auto-saved before reverting to version ${req.params.versionNumber}`,
      });

      // Revert the page to the target version
      const revertedPage = await storage.updatePage(req.params.id, {
        title: targetVersion.title,
        content: targetVersion.content,
      });

      // Log the reversion
      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "page",
        actionType: "reverted",
        fromVersion: latestVersion + 1,
        toVersion: parseInt(req.params.versionNumber),
        userId: req.body.userId || currentPage.authorId,
        userName: req.body.userName,
        details: JSON.stringify({ revertedToTitle: targetVersion.title }),
      });

      // Create activity feed notification
      await storage.createDocumentActivity({
        documentId: req.params.id,
        documentType: "page",
        action: "reverted",
        userId: req.body.userId || currentPage.authorId,
        details: JSON.stringify({
          fromVersion: latestVersion + 1,
          toVersion: parseInt(req.params.versionNumber),
          userName: req.body.userName,
        }),
      });

      // Notify page author if different from reverter
      if (req.body.userId && req.body.userId !== currentPage.authorId) {
        await storage.createNotification({
          userId: currentPage.authorId,
          title: "Page Reverted",
          message: `"${revertedPage.title}" was reverted to version ${req.params.versionNumber} by ${req.body.userName || 'a user'}.`,
          link: `/documents?pageId=${req.params.id}`,
          targetId: req.params.id,
        });
      }

      res.json(revertedPage);
    })
  );

  // Delete a page version
  app.delete(
    "/api/pages/:id/versions/:versionId",
    handleAsync(async (req, res) => {
      await storage.deletePageVersion(req.params.versionId);

      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "page",
        actionType: "deleted",
        userId: req.body.userId || "system",
        details: JSON.stringify({ deletedVersionId: req.params.versionId }),
      });

      res.json({ success: true });
    })
  );

  // Archive a page version
  app.post(
    "/api/pages/:id/versions/:versionId/archive",
    handleAsync(async (req, res) => {
      const version = await storage.archivePageVersion(req.params.versionId);

      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "page",
        actionType: "archived",
        toVersion: version.versionNumber,
        userId: req.body.userId || "system",
      });

      res.json(version);
    })
  );

  // Restore an archived page version
  app.post(
    "/api/pages/:id/versions/:versionId/restore",
    handleAsync(async (req, res) => {
      const version = await storage.restorePageVersion(req.params.versionId);

      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "page",
        actionType: "restored",
        toVersion: version.versionNumber,
        userId: req.body.userId || "system",
      });

      res.json(version);
    })
  );
}
