import OpenAI from "openai";
import { db } from "./db";
import { pages, pageVersions, tickets, systemSettings } from "@shared/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { cosineDistance } from "drizzle-orm";

interface AIConfig {
  embeddingProvider: string;
  embeddingModel: string;
  embeddingDimensions: number;
  ollamaBaseUrl: string;
}

async function getAIConfig(): Promise<AIConfig> {
  const settings = await db.select().from(systemSettings);
  const settingsMap = new Map(settings.map(s => [s.key, s.value]));
  
  return {
    embeddingProvider: settingsMap.get("aiEmbeddingProvider") || "openai",
    embeddingModel: settingsMap.get("aiEmbeddingModel") || "text-embedding-3-small",
    embeddingDimensions: parseInt(settingsMap.get("aiEmbeddingDimensions") || "1536"),
    ollamaBaseUrl: settingsMap.get("aiOllamaBaseUrl") || "http://localhost:11434",
  };
}

async function generateOpenAIEmbedding(text: string, model: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.embeddings.create({
    model: model,
    input: text,
  });
  
  return response.data[0].embedding;
}

async function generateOllamaEmbedding(text: string, model: string, baseUrl: string): Promise<number[]> {
  const response = await fetch(`${baseUrl}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model,
      prompt: text,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama embedding failed: ${error}`);
  }
  
  const data = await response.json();
  return data.embedding;
}

async function generateGoogleEmbedding(text: string, model: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${model}`,
        content: {
          parts: [{ text: text }]
        }
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google embedding failed: ${error}`);
  }
  
  const data = await response.json();
  return data.embedding.values;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const config = await getAIConfig();
  
  const cleanText = text.replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);

  if (!cleanText) {
    throw new Error("No text content to embed");
  }

  switch (config.embeddingProvider) {
    case "openai":
      return generateOpenAIEmbedding(cleanText, config.embeddingModel);
    case "ollama":
      return generateOllamaEmbedding(cleanText, config.embeddingModel, config.ollamaBaseUrl);
    case "google":
      return generateGoogleEmbedding(cleanText, config.embeddingModel);
    default:
      throw new Error(`Unknown embedding provider: ${config.embeddingProvider}`);
  }
}

export async function updatePageEmbedding(pageId: string): Promise<void> {
  const [page] = await db.select().from(pages).where(eq(pages.id, pageId));
  if (!page) return;

  const textToEmbed = `${page.title}\n\n${page.content}`;
  const embedding = await generateEmbedding(textToEmbed);

  await db.update(pages)
    .set({ 
      embedding: embedding,
      embeddingUpdatedAt: new Date().toISOString()
    })
    .where(eq(pages.id, pageId));
}

export async function updatePageVersionEmbedding(versionId: string): Promise<void> {
  const [version] = await db.select().from(pageVersions).where(eq(pageVersions.id, versionId));
  if (!version) return;

  const textToEmbed = `${version.title}\n\n${version.content}`;
  const embedding = await generateEmbedding(textToEmbed);

  await db.update(pageVersions)
    .set({ 
      embedding: embedding,
      embeddingUpdatedAt: new Date().toISOString()
    })
    .where(eq(pageVersions.id, versionId));
}

export async function updateTicketEmbedding(ticketId: string): Promise<void> {
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId));
  if (!ticket) return;

  const textToEmbed = `${ticket.title}\n\n${ticket.description || ''}`;
  const embedding = await generateEmbedding(textToEmbed);

  await db.update(tickets)
    .set({ 
      embedding: embedding,
      embeddingUpdatedAt: new Date().toISOString()
    })
    .where(eq(tickets.id, ticketId));
}

export interface SimilarDocument {
  id: string;
  title: string;
  content: string;
  type: 'page' | 'pageVersion';
  bookId?: string | null;
  versionNumber?: number;
  pageId?: string;
  similarity: number;
  status: string;
}

export async function findSimilarDocuments(
  queryEmbedding: number[], 
  limit: number = 5,
  minSimilarity: number = 0.3
): Promise<SimilarDocument[]> {
  const pagesResults = await db
    .select({
      id: pages.id,
      title: pages.title,
      content: pages.content,
      bookId: pages.bookId,
      status: pages.status,
      distance: cosineDistance(pages.embedding, queryEmbedding),
    })
    .from(pages)
    .where(and(
      isNotNull(pages.embedding),
      eq(pages.type, 'page')
    ))
    .orderBy(cosineDistance(pages.embedding, queryEmbedding))
    .limit(limit * 2);

  const versionsResults = await db
    .select({
      id: pageVersions.id,
      title: pageVersions.title,
      content: pageVersions.content,
      pageId: pageVersions.pageId,
      versionNumber: pageVersions.versionNumber,
      status: pageVersions.status,
      distance: cosineDistance(pageVersions.embedding, queryEmbedding),
    })
    .from(pageVersions)
    .where(and(
      isNotNull(pageVersions.embedding),
      eq(pageVersions.isArchived, 'false')
    ))
    .orderBy(cosineDistance(pageVersions.embedding, queryEmbedding))
    .limit(limit);

  const combined: SimilarDocument[] = [];

  for (const page of pagesResults) {
    const similarity = 1 - (page.distance as number);
    if (similarity >= minSimilarity) {
      combined.push({
        id: page.id,
        title: page.title,
        content: page.content.slice(0, 500),
        type: 'page',
        bookId: page.bookId,
        status: page.status,
        similarity,
      });
    }
  }

  for (const version of versionsResults) {
    const similarity = 1 - (version.distance as number);
    if (similarity >= minSimilarity) {
      combined.push({
        id: version.id,
        title: `${version.title} (v${version.versionNumber})`,
        content: version.content.slice(0, 500),
        type: 'pageVersion',
        pageId: version.pageId,
        versionNumber: version.versionNumber,
        status: version.status,
        similarity,
      });
    }
  }

  combined.sort((a, b) => b.similarity - a.similarity);

  return combined.slice(0, limit);
}

export async function findRelatedDocumentsForTicket(ticketId: string): Promise<SimilarDocument[]> {
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId));
  if (!ticket) return [];

  let queryEmbedding: number[];
  
  if (ticket.embedding) {
    queryEmbedding = ticket.embedding as number[];
  } else {
    const textToEmbed = `${ticket.title}\n\n${ticket.description || ''}`;
    queryEmbedding = await generateEmbedding(textToEmbed);
    
    await db.update(tickets)
      .set({ 
        embedding: queryEmbedding,
        embeddingUpdatedAt: new Date().toISOString()
      })
      .where(eq(tickets.id, ticketId));
  }

  return findSimilarDocuments(queryEmbedding, 5, 0.25);
}

export async function reindexAllPages(): Promise<{ processed: number; errors: number }> {
  const allPages = await db.select({ id: pages.id }).from(pages).where(eq(pages.type, 'page'));
  
  let processed = 0;
  let errors = 0;

  for (const page of allPages) {
    try {
      await updatePageEmbedding(page.id);
      processed++;
    } catch (error) {
      console.error(`Failed to embed page ${page.id}:`, error);
      errors++;
    }
  }

  return { processed, errors };
}

export async function reindexAllTickets(): Promise<{ processed: number; errors: number }> {
  const allTickets = await db.select({ id: tickets.id }).from(tickets);
  
  let processed = 0;
  let errors = 0;

  for (const ticket of allTickets) {
    try {
      await updateTicketEmbedding(ticket.id);
      processed++;
    } catch (error) {
      console.error(`Failed to embed ticket ${ticket.id}:`, error);
      errors++;
    }
  }

  return { processed, errors };
}
