import { type User, type InsertUser, type Emergency, type InsertEmergency } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createEmergency(emergency: InsertEmergency): Promise<Emergency>;
  getEmergencies(): Promise<Emergency[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private emergencies: Map<string, Emergency>;

  constructor() {
    this.users = new Map();
    this.emergencies = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createEmergency(insertEmergency: InsertEmergency): Promise<Emergency> {
    const id = randomUUID();
    const emergency: Emergency = {
      ...insertEmergency,
      id,
      timestamp: new Date(),
    };
    this.emergencies.set(id, emergency);
    console.log('Emergency logged:', emergency);
    return emergency;
  }

  async getEmergencies(): Promise<Emergency[]> {
    return Array.from(this.emergencies.values());
  }
}

export const storage = new MemStorage();
