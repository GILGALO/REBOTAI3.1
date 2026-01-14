import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const signals = pgTable("signals", {
  id: serial("id").primaryKey(),
  pair: text("pair").notNull(), // e.g., "EUR/USD"
  action: text("action").notNull(), // "BUY" or "SELL"
  entryPrice: text("entry_price").notNull(), // Using text for precise decimal representation
  stopLoss: text("stop_loss").notNull(),
  takeProfit: text("take_profit").notNull(),
  confidence: integer("confidence").notNull(), // 0-100
  session: text("session").notNull(), // "Asian", "London", "New York"
  reasoning: text("reasoning"), // Brief explanation of the signal
  timestamp: timestamp("timestamp").defaultNow(),
  isManual: boolean("is_manual").default(false),
  sentToTelegram: boolean("sent_to_telegram").default(false),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  isAutoMode: boolean("is_auto_mode").default(false),
  telegramEnabled: boolean("telegram_enabled").default(false),
  activePairs: jsonb("active_pairs").$type<string[]>().default([
    "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD"
  ]),
  telegramChatId: text("telegram_chat_id"), // Optional: allow setting via UI
  // Note: Bot Token usually goes in ENV, but can be here for user ease if strictly requested
});

// === SCHEMAS ===

export const insertSignalSchema = createInsertSchema(signals).omit({ 
  id: true, 
  timestamp: true 
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ 
  id: true 
});

// === TYPES ===

export type Signal = typeof signals.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// === API CONTRACT TYPES ===

export type CreateSignalRequest = InsertSignal;
export type UpdateSettingsRequest = Partial<InsertSettings>;

export interface GenerateSignalRequest {
  pair: string;
  manual?: boolean;
}

export interface MarketStatusResponse {
  session: "Asian" | "London" | "New York" | "Closed";
  isOpen: boolean;
}
