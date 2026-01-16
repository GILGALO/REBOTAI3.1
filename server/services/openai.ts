import OpenAI from "openai";

// Initialize client lazily to avoid crash on startup without keys
let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (openai) return openai;
  if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) return null;
  
  openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
  return openai;
}

export async function generateChatCompletion(messages: any[], options: any = {}) {
  const client = getOpenAIClient();
  // Graceful fallback if AI integration is not configured
  if (!client) {
    console.warn("[AI] OpenAI API Key missing, skipping AI analysis.");
    return { choices: [{ message: { content: JSON.stringify({ action: "BUY", confidence: 50, reasoning: "AI analysis skipped - using technical data only." }) } }] };
  }
  return await client.chat.completions.create({
    model: "gpt-4o", // Using a stable, existing model name
    messages,
    ...options,
  });
}
