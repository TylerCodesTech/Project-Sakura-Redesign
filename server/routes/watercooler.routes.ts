import type { Express } from "express";
import { storage } from "../storage";
import { insertPostSchema, insertPostCommentSchema } from "@shared/schema";
import { handleAsync, notFound, badRequest, unauthorized, forbidden } from "../middleware/error-handler";

export function registerWatercoolerRoutes(app: Express) {
  // Get all posts (water cooler)
  app.get("/api/posts", handleAsync(async (req, res) => {
    const departmentId = req.query.departmentId as string | undefined;
    const postsList = await storage.getPosts(departmentId);
    const users = await storage.getUsers();
    const userMap = new Map(users.map(u => [u.id, u]));

    const postsWithAuthor = postsList.map(post => {
      const author = userMap.get(post.authorId);
      let hashtags: string[] = [];
      if (post.hashtags) {
        try {
          hashtags = JSON.parse(post.hashtags);
        } catch {
          hashtags = [];
        }
      }
      return {
        ...post,
        hashtags,
        author: author ? {
          id: author.id,
          name: author.username,
          department: author.department,
          avatar: author.avatar
        } : null
      };
    });
    res.json(postsWithAuthor);
  }));

  // Get single post by ID
  app.get("/api/posts/:id", handleAsync(async (req, res) => {
    const post = await storage.getPost(req.params.id);
    if (!post) {
      throw notFound("Post not found");
    }

    const author = await storage.getUser(post.authorId);
    res.json({
      ...post,
      author: author ? {
        id: author.id,
        name: author.username,
        department: author.department,
        avatar: author.avatar
      } : null
    });
  }));

  // Create new post
  app.post("/api/posts", handleAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    const result = insertPostSchema.safeParse({ ...req.body, authorId: req.user!.id });
    if (!result.success) {
      throw badRequest(result.error.message);
    }

    const post = await storage.createPost(result.data);
    const author = await storage.getUser(post.authorId);
    res.status(201).json({
      ...post,
      author: author ? {
        id: author.id,
        name: author.username,
        department: author.department,
        avatar: author.avatar
      } : null
    });
  }));

  // Update post
  app.patch("/api/posts/:id", handleAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    const post = await storage.getPost(req.params.id);
    if (!post) {
      throw notFound("Post not found");
    }

    if (post.authorId !== req.user!.id) {
      throw forbidden("Not authorized to edit this post");
    }

    const result = insertPostSchema.partial().safeParse(req.body);
    if (!result.success) {
      throw badRequest(result.error.message);
    }

    const updated = await storage.updatePost(req.params.id, result.data);
    const author = await storage.getUser(updated.authorId);
    res.json({
      ...updated,
      author: author ? {
        id: author.id,
        name: author.username,
        department: author.department
      } : null
    });
  }));

  // Delete post
  app.delete("/api/posts/:id", handleAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    const post = await storage.getPost(req.params.id);
    if (!post) {
      throw notFound("Post not found");
    }

    if (post.authorId !== req.user!.id) {
      throw forbidden("Not authorized to delete this post");
    }

    await storage.deletePost(req.params.id);
    res.sendStatus(204);
  }));

  // Like/unlike post
  app.post("/api/posts/:id/like", handleAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    const liked = await storage.likePost(req.params.id, req.user!.id);
    res.json({ liked });
  }));

  // Get post comments
  app.get("/api/posts/:postId/comments", handleAsync(async (req, res) => {
    const comments = await storage.getPostComments(req.params.postId);
    const users = await storage.getUsers();
    const userMap = new Map(users.map(u => [u.id, u]));

    const commentsWithAuthor = comments.map(comment => {
      const author = userMap.get(comment.authorId);
      return {
        ...comment,
        author: author ? {
          id: author.id,
          name: author.username,
          department: author.department,
          avatar: author.avatar
        } : null
      };
    });
    res.json(commentsWithAuthor);
  }));

  // Create post comment
  app.post("/api/posts/:postId/comments", handleAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      throw unauthorized("Authentication required");
    }

    const result = insertPostCommentSchema.safeParse({
      ...req.body,
      postId: req.params.postId,
      authorId: req.user!.id
    });
    if (!result.success) {
      throw badRequest(result.error.message);
    }

    const comment = await storage.createPostComment(result.data);
    const author = await storage.getUser(comment.authorId);
    res.status(201).json({
      ...comment,
      author: author ? {
        id: author.id,
        name: author.username,
        department: author.department,
        avatar: author.avatar
      } : null
    });
  }));
}
