import { randomUUID } from "crypto";
import { type User, type InsertUser } from "@shared/schema";

/**
 * UserStorage handles all user-related storage operations in memory.
 * This class manages the users Map and provides methods for CRUD operations.
 */
export class UserStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsersByDepartment(department: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.department === department
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      department: insertUser.department ?? "General",
      avatar: null,
      displayName: null,
      email: null,
      phone: null,
      bio: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, update: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...update };
    this.users.set(id, updated);
    return updated;
  }
}
