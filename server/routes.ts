import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Helper to get formatted time in EAT (UTC+3)
function formatEAT(date: Date): string {
  const eatDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
  return eatDate.getUTCHours().toString().padStart(2, '0') + ':' + 
         eatDate.getUTCMinutes().toString().padStart(2, '0') + ' EAT';
}

// Mock Signal Generation Logic aligned to M5
function generateMockSignal(pair: string, isManual: boolean = false) {
  const actions = ["BUY/CALL", "SELL/PUT"];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const basePrice = pair.includes("JPY") ? 145.00 : 1.0800;
  const entry = basePrice + (Math.random() * 0.05 - 0.025);
  
  const sl = action.startsWith("BUY") ? entry - 0.0050 : entry + 0.0050;
  const tp = action.startsWith("BUY") ? entry + 0.0100 : entry - 0.0100;

  // Align to M5 interval
  const now = new Date();
  const start = new Date(now);
  start.setUTCSeconds(0, 0);
  const minutes = start.getUTCMinutes();
  const alignedMinutes = Math.floor(minutes / 5) * 5;
  start.setUTCMinutes(alignedMinutes);
  
  const end = new Date(start);
  end.setUTCMinutes(start.getUTCMinutes() + 5);

  const strategies = ["RSI Divergence", "MACD Crossover", "Bollinger Band Breakout", "Support/Resistance Bounce"];
  const reasoning = `${strategies[Math.floor(Math.random() * strategies.length)]} detected on M5 timeframe.`;

  return {
    pair,
    action,
    entryPrice: entry.toFixed(4),
    stopLoss: sl.toFixed(4),
    takeProfit: tp.toFixed(4),
    confidence: Math.floor(Math.random() * (99 - 85) + 85), // Higher confidence for REPLIT AI feel
    session: getMarketSession() + " Session",
    reasoning: `⏰ Start Time: ${formatEAT(start)}\n🏁 End Time: ${formatEAT(end)}\n${reasoning}`,
    isManual,
    sentToTelegram: false,
  };
}

function getMarketSession(): "Asian" | "London" | "New York" | "Closed" {
  const hour = new Date().getUTCHours();
  if (hour >= 0 && hour < 8) return "Asian";
  if (hour >= 8 && hour < 16) return "London";
  if (hour >= 16 && hour < 24) return "New York";
  return "Closed";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === API ROUTES ===

  app.get(api.signals.list.path, async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const pair = typeof req.query.pair === 'string' ? req.query.pair : undefined;
    const signals = await storage.getSignals(limit, pair);
    res.json(signals);
  });

  app.post(api.signals.create.path, async (req, res) => {
    try {
      const input = api.signals.create.input.parse(req.body);
      const signal = await storage.createSignal(input);
      // TODO: Send to Telegram here if enabled
      res.status(201).json(signal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.signals.generate.path, async (req, res) => {
    try {
      const { pair } = req.body;
      const mockSignal = generateMockSignal(pair, true);
      const signal = await storage.createSignal(mockSignal);
      res.status(200).json(signal);
    } catch (err) {
      res.status(500).json({ message: "Failed to generate signal" });
    }
  });

  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(input);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.market.status.path, (req, res) => {
    const session = getMarketSession();
    res.json({ session, isOpen: session !== "Closed" });
  });

  // === BACKGROUND JOB (AUTO MODE) ===
  // Check every minute if we should generate a signal at the start of M5
  setInterval(async () => {
    try {
      const now = new Date();
      if (now.getUTCMinutes() % 5 !== 0) return; // Only trigger exactly at :00, :05, etc.

      const settings = await storage.getSettings();
      if (settings.isAutoMode && settings.activePairs && settings.activePairs.length > 0) {
        // High probability but not guaranteed to keep it realistic
        if (Math.random() > 0.3) { 
          const pair = settings.activePairs[Math.floor(Math.random() * settings.activePairs.length)];
          const mockSignal = generateMockSignal(pair, false);
          await storage.createSignal(mockSignal);
          console.log(`[Auto Mode] Generated signal for ${pair} at M5 boundary`);
        }
      }
    } catch (err) {
      console.error("[Auto Mode] Error:", err);
    }
  }, 60000); // Check every minute

  // Seed initial data if empty
  (async () => {
    try {
      const signals = await storage.getSignals(1);
      if (signals.length === 0) {
        console.log("Seeding initial signals...");
        const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"];
        for (const pair of pairs) {
           await storage.createSignal(generateMockSignal(pair, false));
        }
        console.log("Seeding complete.");
      }
    } catch (err) {
      console.error("Seeding failed:", err);
    }
  })();

  return httpServer;
}
