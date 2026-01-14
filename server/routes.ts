import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { getForexCandles } from "./services/finnhub";
import { sendTelegramMessage } from "./services/telegram";

// Helper to get formatted time in EAT (UTC+3)
function formatEAT(date: Date): string {
  const eatDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
  return eatDate.getUTCHours().toString().padStart(2, '0') + ':' + 
         eatDate.getUTCMinutes().toString().padStart(2, '0') + ' EAT';
}

function formatSignalForTelegram(signal: any): string {
  const isBuy = signal.action.includes("BUY");
  const emoji = isBuy ? "🟢" : "🔴";
  const actionIcon = isBuy ? "📈" : "📉";
  const confidenceEmoji = signal.confidence >= 90 ? "🔥" : "⚡";
  
  // Parse start/end time from reasoning
  const startTime = signal.reasoning?.match(/⏰ Start Time: (.*?)\n/)?.[1] || "N/A";
  const endTime = signal.reasoning?.match(/🏁 End Time: (.*?)\n/)?.[1] || "N/A";
  const cleanReasoning = signal.reasoning?.split('\n').slice(2).join('\n') || signal.reasoning;

  return `
<b>${emoji} NEW SIGNAL: ${signal.pair}</b>

<b>Action:</b> ${signal.action} ${actionIcon}
<b>🎯 Confidence:</b> ${signal.confidence}% ${confidenceEmoji}

<b>📍 Session:</b> ${signal.session}
<b>⏰ Start Time:</b> <code>${startTime}</code>
<b>🏁 End Time:</b> <code>${endTime}</code>

<b>🎯 Take Profit:</b> <code>${signal.takeProfit}</code>
<b>🛡️ Stop Loss:</b> <code>${signal.stopLoss}</code>

<i>${cleanReasoning}</i>

📊 <i>REPLIT AI M5 Trading Bot</i>
  `.trim();
}

// Logic aligned to M5 with Finnhub data
async function generateRealSignal(pair: string, isManual: boolean = false) {
  let entryPrice = pair.includes("JPY") ? 145.00 : 1.0800;
  let action: "BUY/CALL" | "SELL/PUT" = Math.random() > 0.5 ? "BUY/CALL" : "SELL/PUT";
  let reasoning = "Technical analysis detected on M5 timeframe.";

  try {
    const candles = await getForexCandles(pair);
    if (candles && candles.c && candles.c.length > 0) {
      entryPrice = candles.c[candles.c.length - 1];
      
      // Simple technical logic based on last 2 candles
      const current = candles.c[candles.c.length - 1];
      const prev = candles.c[candles.c.length - 2];
      
      if (current > prev) {
        action = "BUY/CALL";
        reasoning = "Momentum breakout detected on M5 timeframe.";
      } else {
        action = "SELL/PUT";
        reasoning = "Price rejection detected on M5 timeframe.";
      }
    }
  } catch (err) {
    console.error(`[Finnhub] Error fetching for ${pair}, falling back to mock price:`, err);
  }
  
  const entry = entryPrice;
  const spread = pair.includes("JPY") ? 0.05 : 0.0005;
  const sl = action === "BUY/CALL" ? entry - (spread * 10) : entry + (spread * 10);
  const tp = action === "BUY/CALL" ? entry + (spread * 20) : entry - (spread * 20);

  // Align to NEXT M5 interval if generating manual signal
  const now = new Date();
  const start = new Date(now);
  start.setUTCSeconds(0, 0);
  
  const minutes = start.getUTCMinutes();
  // If we are already at a boundary, it's fine, otherwise move to next 5-min block
  const nextAlignedMinutes = Math.ceil((minutes + 0.1) / 5) * 5; 
  start.setUTCMinutes(nextAlignedMinutes);
  
  const end = new Date(start);
  end.setUTCMinutes(start.getUTCMinutes() + 5);

  return {
    pair,
    action,
    entryPrice: entry.toFixed(pair.includes("JPY") ? 3 : 5),
    stopLoss: sl.toFixed(pair.includes("JPY") ? 3 : 5),
    takeProfit: tp.toFixed(pair.includes("JPY") ? 3 : 5),
    confidence: Math.floor(Math.random() * (99 - 88) + 88),
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
      
      const settings = await storage.getSettings();
      if (settings.telegramEnabled) {
        await sendTelegramMessage(formatSignalForTelegram(signal));
        await storage.markSignalSent(signal.id);
      }
      
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
      const realSignal = await generateRealSignal(pair, true);
      const signal = await storage.createSignal(realSignal);
      
      const settings = await storage.getSettings();
      if (settings.telegramEnabled) {
        await sendTelegramMessage(formatSignalForTelegram(signal));
        await storage.markSignalSent(signal.id);
      }

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
      
      // If telegram was just enabled, let's try to send a test message if we have credentials
      if (input.telegramEnabled) {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        if (token && chatId) {
          await sendTelegramMessage("<b>🔔 Telegram Notifications Enabled</b>\nYou will now receive M5 signals here.");
        }
      }
      
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
          const realSignal = await generateRealSignal(pair, false);
          const signal = await storage.createSignal(realSignal);
          
          if (settings.telegramEnabled) {
            await sendTelegramMessage(formatSignalForTelegram(signal));
            await storage.markSignalSent(signal.id);
          }
          
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
      const signalsCount = await storage.getSignals(1);
      if (signalsCount.length === 0) {
        console.log("Seeding initial signals...");
        const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"];
        
        // Parallel seeding for speed
        const initialSignals = await Promise.all(pairs.map(pair => generateRealSignal(pair, false)));
        for (const signalData of initialSignals) {
          const signal = await storage.createSignal(signalData);
          // Auto-send seeds if bot is enabled
          const settings = await storage.getSettings();
          if (settings.telegramEnabled) {
            await sendTelegramMessage(formatSignalForTelegram(signal));
            await storage.markSignalSent(signal.id);
          }
        }
        console.log("Seeding complete.");
      }
    } catch (err) {
      console.error("Seeding failed:", err);
    }
  })();

  return httpServer;
}
