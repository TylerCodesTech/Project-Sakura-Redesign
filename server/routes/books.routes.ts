import type { Express } from "express";
import { storage } from "../storage";
import {
  insertBookSchema,
  insertBookVersionSchema
} from "@shared/schema";
import { handleAsync, notFound, badRequest } from "../middleware/error-handler";
import { validateRequest } from "../middleware/validation";

export function registerBookRoutes(app: Express): void {
  // ============================================
  // BOOK CRUD OPERATIONS
  // ============================================

  // Get all books
  app.get(
    "/api/books",
    handleAsync(async (_req, res) => {
      const books = await storage.getBooks();
      res.json(books);
    })
  );

  // Create a new book
  app.post(
    "/api/books",
    validateRequest(insertBookSchema),
    handleAsync(async (req, res) => {
      const book = await storage.createBook(req.body);
      res.json(book);
    })
  );

  // Get a single book by ID
  app.get(
    "/api/books/:bookId",
    handleAsync(async (req, res) => {
      const book = await storage.getBook(req.params.bookId);
      if (!book) {
        throw notFound("Book not found");
      }
      res.json(book);
    })
  );

  // Get pages within a book
  app.get(
    "/api/books/:bookId/pages",
    handleAsync(async (req, res) => {
      const pages = await storage.getPages(req.params.bookId);
      res.json(pages);
    })
  );

  // Delete a book
  app.delete(
    "/api/books/:bookId",
    handleAsync(async (req, res) => {
      await storage.deleteBook(req.params.bookId);
      res.json({ success: true });
    })
  );

  // Update a book
  app.patch(
    "/api/books/:bookId",
    handleAsync(async (req, res) => {
      const existing = await storage.getBook(req.params.bookId);
      if (!existing) {
        throw notFound("Book not found");
      }

      const isMove = req.body.parentId !== undefined && req.body.parentId !== existing.parentId;
      const oldParentId = existing.parentId;

      const book = await storage.updateBook(req.params.bookId, req.body);

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
          documentId: book.id,
          documentType: 'book',
          action: 'moved',
          userId: 'current-user-id',
          details: JSON.stringify({ from: fromName, to: toName, fromId: oldParentId, toId: req.body.parentId }),
        });
      }

      res.json(book);
    })
  );

  // ============================================
  // BOOK VERSION HISTORY
  // ============================================

  // Get all versions of a book
  app.get(
    "/api/books/:id/versions",
    handleAsync(async (req, res) => {
      const versions = await storage.getBookVersions(req.params.id);
      res.json(versions);
    })
  );

  // Get a specific version of a book
  app.get(
    "/api/books/:id/versions/:versionNumber",
    handleAsync(async (req, res) => {
      const version = await storage.getBookVersion(
        req.params.id,
        parseInt(req.params.versionNumber)
      );
      if (!version) {
        throw notFound("Version not found");
      }
      res.json(version);
    })
  );

  // Create a new version of a book
  app.post(
    "/api/books/:id/versions",
    handleAsync(async (req, res) => {
      const book = await storage.getBook(req.params.id);
      if (!book) {
        throw notFound("Book not found");
      }

      const latestVersion = await storage.getLatestBookVersionNumber(req.params.id);
      const newVersionNumber = latestVersion + 1;

      const versionData = {
        bookId: req.params.id,
        versionNumber: newVersionNumber,
        title: book.title,
        description: book.description,
        authorId: req.body.authorId || book.authorId,
        changeDescription: req.body.changeDescription || null,
      };

      const result = insertBookVersionSchema.safeParse(versionData);
      if (!result.success) {
        throw badRequest(result.error.message);
      }

      const version = await storage.createBookVersion(result.data);

      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "book",
        actionType: "created",
        toVersion: newVersionNumber,
        userId: req.body.authorId || book.authorId,
        userName: req.body.userName,
        details: JSON.stringify({ title: book.title, changeDescription: req.body.changeDescription }),
      });

      res.json(version);
    })
  );

  // Revert a book to a previous version
  app.post(
    "/api/books/:id/revert/:versionNumber",
    handleAsync(async (req, res) => {
      const targetVersion = await storage.getBookVersion(
        req.params.id,
        parseInt(req.params.versionNumber)
      );
      if (!targetVersion) {
        throw notFound("Version not found");
      }

      const currentBook = await storage.getBook(req.params.id);
      if (!currentBook) {
        throw notFound("Book not found");
      }

      const latestVersion = await storage.getLatestBookVersionNumber(req.params.id);
      await storage.createBookVersion({
        bookId: req.params.id,
        versionNumber: latestVersion + 1,
        title: currentBook.title,
        description: currentBook.description,
        authorId: currentBook.authorId,
        changeDescription: `Auto-saved before reverting to version ${req.params.versionNumber}`,
      });

      const revertedBook = await storage.updateBook(req.params.id, {
        title: targetVersion.title,
        description: targetVersion.description,
      });

      await storage.createVersionAuditLog({
        documentId: req.params.id,
        documentType: "book",
        actionType: "reverted",
        fromVersion: latestVersion + 1,
        toVersion: parseInt(req.params.versionNumber),
        userId: req.body.userId || currentBook.authorId,
        userName: req.body.userName,
      });

      await storage.createDocumentActivity({
        documentId: req.params.id,
        documentType: "book",
        action: "reverted",
        userId: req.body.userId || currentBook.authorId,
        details: JSON.stringify({
          fromVersion: latestVersion + 1,
          toVersion: parseInt(req.params.versionNumber),
          userName: req.body.userName,
        }),
      });

      res.json(revertedBook);
    })
  );
}
