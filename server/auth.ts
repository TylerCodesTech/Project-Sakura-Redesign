import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, insertUserSchema, roles, userRoles, systemSettings, departments } from "@shared/schema";
import { db, pool } from "./db";
import { eq, count } from "drizzle-orm";
import { fromZodError } from "zod-validation-error";

type UserType = typeof users.$inferSelect;

declare global {
  namespace Express {
    interface User extends UserType { }
  }
}

const scryptAsync = promisify(scrypt);
const PostgresSessionStore = connectPg(session);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

import { storage } from "./storage";

export async function getUserCount() {
  return storage.getUserCount();
}

export function setupAuth(app: Express) {
  const store = pool ? new PostgresSessionStore({ pool, createTableIfMissing: true }) : undefined;
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "development-secret",
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (error) {
      done(error, null);
    }
  });

  app.get("/api/setup-status", async (_req, res) => {
    try {
      const userCount = await getUserCount();
      res.json({
        needsSetup: userCount === 0,
        userCount
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check setup status" });
    }
  });

  app.post("/api/setup", async (req, res, next) => {
    try {
      const userCount = await getUserCount();
      if (userCount > 0) {
        return res.status(400).json({ error: "Setup already completed" });
      }

      const { user: userData, company, department } = req.body;

      if (!userData?.username || !userData?.password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const hashedPassword = await hashPassword(userData.password);
      const newUser = await storage.createUser({
        username: userData.username,
        password: hashedPassword,
        department: department?.name || "General",
        displayName: userData.displayName || userData.username,
        email: userData.email || null,
      });

      const allRoles = await storage.getRoles();
      let superAdminRole = allRoles.find(r => r.name === "Super Admin");

      if (!superAdminRole) {
        const createdRole = await storage.createRole({
          name: "Super Admin",
          description: "Full system access with all permissions",
          color: "#dc2626",
          priority: 100,
          isSystem: "true",
        });
        superAdminRole = { ...createdRole, userCount: 0 };
      }

      await storage.assignUserRole({
        userId: newUser.id,
        roleId: superAdminRole.id,
        assignedBy: newUser.id,
      });

      if (company?.name) {
        await storage.setSystemSetting("companyName", company.name);
      }

      if (company?.primaryColor) {
        await storage.setSystemSetting("primaryColor", company.primaryColor);
      }

      if (department?.name) {
        const dept = await storage.createDepartment({
          name: department.name,
          description: department.description || "",
          color: "#7c3aed",
          headId: newUser.id
        });

        if (dept) {
          await storage.updateUser(newUser.id, { department: dept.name });
        }
      }

      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json({
          user: newUser,
          message: "Setup completed successfully"
        });
      });
    } catch (error: any) {
      console.error("Setup error:", error);
      res.status(500).json({ error: error.message || "Setup failed" });
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.toString() });
      }

      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const [user] = await db
        .insert(users)
        .values({
          ...result.data,
          password: await hashPassword(result.data.password),
        })
        .returning();

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
