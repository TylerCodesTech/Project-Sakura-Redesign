import { eq, count } from "drizzle-orm";
import { users, type User, type InsertUser } from "@shared/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export class DatabaseUserStorage {
  constructor(private db: NodePgDatabase) {}

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsersByDepartment(department: string): Promise<User[]> {
    return this.db.select().from(users).where(eq(users.department, department));
  }

  async getUsers(): Promise<User[]> {
    return this.db.select().from(users);
  }

  async getUserCount(): Promise<number> {
    const [result] = await this.db.select({ count: count() }).from(users);
    return result?.count ?? 0;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values({ ...insertUser, department: insertUser.department ?? "General" }).returning();
    return user;
  }

  async updateUser(id: string, update: Partial<InsertUser>): Promise<User> {
    const [user] = await this.db.update(users).set(update).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }
}
