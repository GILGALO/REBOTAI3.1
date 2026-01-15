import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function generateChatCompletion(messages: any[], options: any = {}) {
  return await openai.chat.completions.create({
    model: "gpt-5", // Latest and most capable model for professional analysis
    messages,
    ...options,
  });
}
