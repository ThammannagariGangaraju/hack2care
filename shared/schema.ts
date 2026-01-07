import { pgTable, text, varchar, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Emergency logging schema
export const emergencies = pgTable("emergencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  emergencyType: text("emergency_type").notNull(),
  isConscious: text("is_conscious"),
  isBreathing: text("is_breathing"),
  hasHeavyBleeding: text("has_heavy_bleeding"),
});

export const insertEmergencySchema = createInsertSchema(emergencies).omit({
  id: true,
  timestamp: true,
});

export type InsertEmergency = z.infer<typeof insertEmergencySchema>;
export type Emergency = typeof emergencies.$inferSelect;

// Decision tree answers type
export interface DecisionAnswers {
  isConscious: boolean | null;
  isBreathing: boolean | null;
  hasHeavyBleeding: boolean | null;
}

// First aid response type
export interface FirstAidResponse {
  instructions: string[];
  showCPR: boolean;
  priority: 'critical' | 'urgent' | 'moderate';
}

// Location type
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// Nearby place type
export interface NearbyPlace {
  name: string;
  address: string;
  distance: string;
  latitude: number;
  longitude: number;
  type: 'hospital' | 'pharmacy';
}
