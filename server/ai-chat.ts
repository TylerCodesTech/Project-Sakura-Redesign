import OpenAI from "openai";
import { db } from "./db";
import { systemSettings } from "@shared/schema";

interface AIConfig {
  chatProvider: string;
  chatModel: string;
  chatTemperature: number;
  ollamaBaseUrl: string;
}

async function getAIConfig(): Promise<AIConfig> {
  const settings = await db.select().from(systemSettings);
  const settingsMap = new Map(settings.map(s => [s.key, s.value]));
  
  return {
    chatProvider: settingsMap.get("aiChatProvider") || "openai",
    chatModel: settingsMap.get("aiChatModel") || "gpt-4",
    chatTemperature: parseFloat(settingsMap.get("aiChatTemperature") || "0.7"),
    ollamaBaseUrl: settingsMap.get("aiOllamaBaseUrl") || "http://localhost:11434",
  };
}

export async function isAIConfigured(): Promise<{ configured: boolean; provider: string | null; reason?: string }> {
  const config = await getAIConfig();
  
  switch (config.chatProvider) {
    case "openai":
      if (!process.env.OPENAI_API_KEY) {
        return { configured: false, provider: "openai", reason: "OPENAI_API_KEY not set" };
      }
      return { configured: true, provider: "openai" };
    case "ollama":
      return { configured: true, provider: "ollama" };
    case "google":
      if (!process.env.GOOGLE_API_KEY) {
        return { configured: false, provider: "google", reason: "GOOGLE_API_KEY not set" };
      }
      return { configured: true, provider: "google" };
    default:
      return { configured: false, provider: null, reason: "Unknown provider" };
  }
}

async function chatWithOpenAI(messages: { role: string; content: string }[], model: string, temperature: number): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: model,
    messages: messages as any,
    temperature: temperature,
  });
  
  return response.choices[0]?.message?.content || "";
}

async function chatWithOllama(messages: { role: string; content: string }[], model: string, baseUrl: string, temperature: number): Promise<string> {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: false,
      options: {
        temperature: temperature,
      },
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama chat failed: ${error}`);
  }
  
  const data = await response.json();
  return data.message?.content || "";
}

async function chatWithGoogle(messages: { role: string; content: string }[], model: string, temperature: number): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }
  
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: temperature,
        },
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google AI chat failed: ${error}`);
  }
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function generateAIResponse(messages: ChatMessage[]): Promise<string> {
  const config = await getAIConfig();
  
  switch (config.chatProvider) {
    case "openai":
      return chatWithOpenAI(messages, config.chatModel, config.chatTemperature);
    case "ollama":
      return chatWithOllama(messages, config.chatModel, config.ollamaBaseUrl, config.chatTemperature);
    case "google":
      return chatWithGoogle(messages, config.chatModel, config.chatTemperature);
    default:
      throw new Error(`Unknown chat provider: ${config.chatProvider}`);
  }
}

export async function generateWritingAssistance(
  prompt: string,
  context?: string,
  action?: "improve" | "expand" | "summarize" | "fix_grammar" | "make_professional" | "simplify"
): Promise<string> {
  const systemPrompts: Record<string, string> = {
    improve: "You are a writing assistant. Improve the following text to make it clearer, more engaging, and better structured. Maintain the original meaning and tone.",
    expand: "You are a writing assistant. Expand on the following text, adding more detail, examples, and depth while maintaining the original voice and purpose.",
    summarize: "You are a writing assistant. Summarize the following text concisely while capturing all key points.",
    fix_grammar: "You are a writing assistant. Fix any grammar, spelling, and punctuation errors in the following text. Only correct errors, do not change the style or content.",
    make_professional: "You are a writing assistant. Rewrite the following text to be more professional and formal, suitable for business communication.",
    simplify: "You are a writing assistant. Simplify the following text to make it easier to understand. Use shorter sentences and simpler words.",
  };

  const systemPrompt = systemPrompts[action || "improve"] || systemPrompts.improve;
  
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  if (context) {
    messages.push({ role: "user", content: `Context: ${context}` });
  }

  messages.push({ role: "user", content: prompt });

  return generateAIResponse(messages);
}
