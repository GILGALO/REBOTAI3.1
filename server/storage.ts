import { db } from "./db";
import { signals, settings, type Signal, type InsertSignal, type Settings, type InsertSettings } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Signals
  getSignals(limit?: number, pair?: string): Promise<Signal[]>;
  createSignal(signal: InsertSignal): Promise<Signal>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<InsertSettings>): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  async getSignals(limit: number = 50, pair?: string): Promise<Signal[]> {
    let query = db.select().from(signals).orderBy(desc(signals.timestamp)).limit(limit);
    if (pair) {
      query = query.where(eq(signals.pair, pair)) as any;
    }
    return await query;
  }

  async createSignal(signal: InsertSignal): Promise<Signal> {
    const [newSignal] = await db.insert(signals).values(signal).returning();
    return newSignal;
  }

  async getSettings(): Promise<Settings> {
    const [existingSettings] = await db.select().from(settings).limit(1);
    if (existingSettings) return existingSettings;

    // Create default settings if none exist
    const [newSettings] = await db.insert(settings).values({
      isAutoMode: false,
      telegramEnabled: false,
      activePairs: ["EUR/USD", "GBP/USD", "USD/JPY"],
    }).returning();
    return newSettings;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    const current = await this.getSettings();
    const [updated] = await db.update(settings)
      .set(updates)
      .where(eq(settings.id, current.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
