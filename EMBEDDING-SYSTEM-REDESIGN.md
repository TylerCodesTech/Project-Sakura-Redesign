# Embedding and Text Generation System - Redesign Documentation

## Overview

This document describes the redesigned embedding and text generation system that powers semantic search and AI-assisted responses for documents and helpdesk tickets in Project Sakura.

## Key Improvements

### 1. **Automatic Embedding Generation** ✨
- Embeddings are now **automatically generated** when pages or tickets are created/updated
- No more manual API calls required - it happens in the background
- Uses a queue system to prevent timeouts and manage rate limits

### 2. **RAG (Retrieval Augmented Generation)** 🤖
- AI responses for tickets now use relevant documentation as context
- Finds similar documents and uses them to generate informed responses
- Returns sources used in the response for transparency

### 3. **Semantic Search** 🔍
- New API endpoint for searching documentation using natural language
- Returns results ranked by semantic similarity
- Works across all documentation content

### 4. **Background Processing** ⚡
- Queue-based system prevents request timeouts
- Automatic retry logic with exponential backoff
- Processes embeddings one at a time to avoid rate limits

### 5. **Better Error Handling** 🛡️
- Retry logic for transient failures (up to 3 attempts)
- Detailed logging for debugging
- Graceful degradation when AI is not configured

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Page/Ticket Create/Update                                   │
│         ↓                                                     │
│  Storage Layer (documents.storage.ts / helpdesk.storage.ts) │
│         ↓                                                     │
│  Embedding Queue (embedding-queue.ts)                        │
│         ↓                                                     │
│  Embedding Generation (embeddings.ts)                        │
│         ↓                                                     │
│  AI Provider (OpenAI / Ollama / Google)                      │
│         ↓                                                     │
│  PostgreSQL Vector Database (pgvector)                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### 1. Embedding Generation Flow
```
User creates/updates page or ticket
    ↓
Storage layer enqueues embedding job
    ↓
Queue processes job in background
    ↓
Text is cleaned and prepared
    ↓
Embedding generated via AI provider (with retry)
    ↓
Embedding saved to database with timestamp
    ↓
HNSW index updated for fast similarity search
```

#### 2. Semantic Search Flow
```
User submits natural language query
    ↓
Query text is embedded
    ↓
Vector similarity search using cosine distance
    ↓
Results filtered by similarity threshold
    ↓
Top N documents returned with similarity scores
```

#### 3. RAG Response Flow
```
User requests AI response for ticket
    ↓
Ticket embedding retrieved or generated
    ↓
Similar documents found via vector search
    ↓
Documents used as context for AI prompt
    ↓
AI generates response using context
    ↓
Response + source documents returned
```

---

## API Endpoints

### Embedding Management

#### 1. Reindex All Pages
```http
POST /api/embeddings/reindex-pages
```
Regenerates embeddings for all pages in the system.

**Response:**
```json
{
  "processed": 45,
  "errors": 2
}
```

#### 2. Reindex All Tickets
```http
POST /api/embeddings/reindex-tickets
```
Regenerates embeddings for all tickets in the system.

**Response:**
```json
{
  "processed": 120,
  "errors": 0
}
```

#### 3. Update Single Page Embedding
```http
POST /api/pages/:pageId/update-embedding
```
Manually trigger embedding generation for a specific page.

**Response:**
```json
{
  "success": true
}
```

#### 4. Queue Status
```http
GET /api/embeddings/queue-status
```
Get current status of the embedding queue.

**Response:**
```json
{
  "queueLength": 5,
  "processing": true
}
```

#### 5. Clear Queue
```http
POST /api/embeddings/queue-clear
```
Clear the embedding queue (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Queue cleared"
}
```

### Semantic Search

#### 6. Semantic Search
```http
POST /api/search/semantic
Content-Type: application/json

{
  "query": "How do I reset my password?",
  "limit": 10,
  "minSimilarity": 0.3
}
```
Search documentation using natural language.

**Response:**
```json
[
  {
    "id": "page-123",
    "title": "Password Reset Guide",
    "content": "To reset your password, navigate to...",
    "similarity": 0.89,
    "type": "page"
  },
  ...
]
```

### RAG (Retrieval Augmented Generation)

#### 7. Generate Ticket Response with RAG
```http
POST /api/tickets/:ticketId/generate-response
Content-Type: application/json

{
  "prompt": "Provide a solution for this issue"
}
```
Generate an AI response for a ticket using relevant documentation as context.

**Response:**
```json
{
  "response": "Based on the documentation, here's how to resolve this issue...",
  "sources": [
    {
      "id": "page-123",
      "title": "Troubleshooting Guide",
      "similarity": 0.87
    }
  ]
}
```

#### 8. Get Related Documents for Ticket
```http
GET /api/tickets/:ticketId/related-documents
```
Find documentation related to a ticket.

**Response:**
```json
[
  {
    "id": "page-456",
    "title": "Network Configuration",
    "content": "To configure network settings...",
    "type": "page",
    "similarity": 0.82
  }
]
```

### AI Status and Configuration

#### 9. AI Status
```http
GET /api/ai/status
```
Check if AI is configured and ready.

**Response:**
```json
{
  "configured": true,
  "provider": "openai"
}
```

#### 10. Indexing Statistics
```http
GET /api/ai/indexing-stats
```
Get statistics about embedding coverage.

**Response:**
```json
{
  "pages": {
    "total": 50,
    "indexed": 48,
    "pending": 2
  },
  "tickets": {
    "total": 100,
    "indexed": 100,
    "pending": 0
  },
  "totalIndexed": 148,
  "totalPending": 2
}
```

---

## Configuration

### System Settings

All configuration is stored in the `systemSettings` table:

| Setting | Description | Default |
|---------|-------------|---------|
| `aiEmbeddingProvider` | Provider for embeddings | `"openai"` |
| `aiEmbeddingModel` | Model to use | `"text-embedding-3-small"` |
| `aiEmbeddingDimensions` | Vector dimensions | `"1536"` |
| `aiOllamaBaseUrl` | Ollama service URL | `"http://localhost:11434"` |
| `aiAutoVectorization` | Auto-generate embeddings | `"true"` |
| `aiEnableRag` | Enable RAG features | `"true"` |
| `aiChatProvider` | Provider for chat | `"openai"` |
| `aiChatModel` | Chat model | `"gpt-4"` |
| `aiChatTemperature` | Creativity level | `"0.7"` |

### Environment Variables

Required environment variables based on provider:

**OpenAI:**
```bash
OPENAI_API_KEY=sk-...
```

**Google:**
```bash
GOOGLE_API_KEY=...
```

**Ollama:**
No API key needed - runs locally

---

## Database Schema

### Embedding Fields

Three tables store embeddings:

#### 1. Pages
```typescript
{
  embedding: vector(1536),
  embeddingUpdatedAt: timestamp
}
```

#### 2. Page Versions
```typescript
{
  embedding: vector(1536),
  embeddingUpdatedAt: timestamp
}
```

#### 3. Tickets
```typescript
{
  embedding: vector(1536),
  embeddingUpdatedAt: timestamp
}
```

### Vector Indexes

All tables use HNSW (Hierarchical Navigable Small World) indexes for fast cosine similarity search:

```sql
CREATE INDEX pages_embedding_idx ON pages
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX page_versions_embedding_idx ON page_versions
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX tickets_embedding_idx ON tickets
USING hnsw (embedding vector_cosine_ops);
```

---

## Usage Examples

### Frontend Integration

#### 1. Semantic Search in Documentation
```typescript
async function searchDocs(query: string) {
  const response = await fetch('/api/search/semantic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      limit: 10,
      minSimilarity: 0.3
    })
  });

  const results = await response.json();
  return results;
}

// Usage
const results = await searchDocs("How do I configure email settings?");
```

#### 2. Get AI-Powered Ticket Response
```typescript
async function generateTicketResponse(ticketId: string, prompt?: string) {
  const response = await fetch(`/api/tickets/${ticketId}/generate-response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  const { response: aiResponse, sources } = await response.json();
  return { aiResponse, sources };
}

// Usage
const { aiResponse, sources } = await generateTicketResponse('ticket-123');
console.log('AI Response:', aiResponse);
console.log('Based on documents:', sources);
```

#### 3. Show Related Documentation for Tickets
```typescript
async function getRelatedDocs(ticketId: string) {
  const response = await fetch(`/api/tickets/${ticketId}/related-documents`);
  const docs = await response.json();
  return docs;
}

// Usage
const relatedDocs = await getRelatedDocs('ticket-123');
// Display in UI as suggested reading
```

#### 4. Monitor Embedding Queue
```typescript
async function getQueueStatus() {
  const response = await fetch('/api/embeddings/queue-status');
  const status = await response.json();
  return status;
}

// Usage
const { queueLength, processing } = await getQueueStatus();
if (queueLength > 0) {
  console.log(`${queueLength} items pending embedding generation`);
}
```

---

## How It Works Under the Hood

### 1. Text Preprocessing
Before generating embeddings, text is cleaned:
- HTML tags removed
- Whitespace normalized
- Truncated to 8000 characters
- Empty content rejected

### 2. Embedding Generation
- Text is sent to configured AI provider
- Returns 1536-dimensional vector (default)
- Retry logic handles transient failures
- Exponential backoff between retries

### 3. Vector Storage
- Embeddings stored as PostgreSQL `vector` type
- HNSW index enables fast approximate nearest neighbor search
- Timestamp tracks when embedding was generated

### 4. Similarity Search
- Cosine distance used to measure similarity
- Distance converted to similarity: `similarity = 1 - distance`
- Results filtered by minimum similarity threshold
- Top N results returned, sorted by similarity

### 5. Queue Processing
- Jobs processed sequentially to avoid rate limits
- 1 second delay between jobs
- Automatic retry up to 3 times
- Failed jobs logged with details

---

## Best Practices

### For Developers

1. **Always check AI configuration** before using AI features
2. **Monitor queue status** during bulk operations
3. **Set appropriate similarity thresholds** (0.3 is good default, 0.25 for tickets)
4. **Include error handling** for API calls
5. **Log embedding generation** for debugging

### For Administrators

1. **Choose the right provider** based on your needs:
   - OpenAI: Best quality, requires API key
   - Ollama: Local, private, no API key needed
   - Google: Alternative to OpenAI

2. **Monitor indexing stats** regularly:
   ```bash
   curl http://localhost:5000/api/ai/indexing-stats
   ```

3. **Reindex when needed**:
   - After provider changes
   - After model changes
   - After bulk imports

4. **Configure rate limits** appropriately for your provider

5. **Set up monitoring** for:
   - Queue length
   - Failed embeddings
   - API errors

---

## Troubleshooting

### Issue: Embeddings not generating

**Check:**
1. AI provider is configured: `GET /api/ai/status`
2. API key is set in environment
3. Queue is processing: `GET /api/embeddings/queue-status`
4. Check server logs for errors

**Solution:**
```bash
# Check status
curl http://localhost:5000/api/ai/status

# Manually trigger reindex
curl -X POST http://localhost:5000/api/embeddings/reindex-pages
```

### Issue: Search returns no results

**Check:**
1. Content has embeddings: `GET /api/ai/indexing-stats`
2. Similarity threshold not too high
3. Query is meaningful text

**Solution:**
- Lower `minSimilarity` threshold
- Ensure content is indexed
- Try different query phrasing

### Issue: Queue is stuck

**Check:**
1. Queue status: `GET /api/embeddings/queue-status`
2. Server logs for errors
3. AI provider connectivity

**Solution:**
```bash
# Clear queue and retry
curl -X POST http://localhost:5000/api/embeddings/queue-clear
curl -X POST http://localhost:5000/api/embeddings/reindex-pages
```

### Issue: Rate limit errors

**Symptoms:**
- Many failed embedding attempts
- "429 Too Many Requests" errors

**Solution:**
- Increase delay in `embedding-queue.ts` (line 8)
- Use Ollama for unlimited local processing
- Batch operations during off-peak hours

---

## Performance Considerations

### Embedding Generation
- OpenAI: ~100ms per embedding
- Ollama: ~50-200ms (depends on hardware)
- Google: ~80-150ms per embedding

### Search Performance
- HNSW index provides O(log n) search time
- Typical search: < 50ms for 10,000 documents
- Scales well to 100,000+ documents

### Queue Throughput
- Default: 60 embeddings/minute (1 second delay)
- Configurable in `embedding-queue.ts`
- Adjust based on API rate limits

---

## Migration Guide

### Existing Installations

If you have existing pages/tickets without embeddings:

1. **Check current state:**
   ```bash
   curl http://localhost:5000/api/ai/indexing-stats
   ```

2. **Reindex all content:**
   ```bash
   # Reindex pages
   curl -X POST http://localhost:5000/api/embeddings/reindex-pages

   # Reindex tickets
   curl -X POST http://localhost:5000/api/embeddings/reindex-tickets
   ```

3. **Monitor progress:**
   ```bash
   # Check queue
   curl http://localhost:5000/api/embeddings/queue-status

   # Check indexing progress
   watch -n 5 'curl -s http://localhost:5000/api/ai/indexing-stats'
   ```

---

## Future Enhancements

Potential improvements for future versions:

1. **Persistent Queue** - Store queue in database for crash recovery
2. **Parallel Processing** - Process multiple embeddings concurrently
3. **Hybrid Search** - Combine semantic and keyword search
4. **Chunking** - Split large documents into smaller chunks
5. **Multi-language Support** - Use multilingual embedding models
6. **Caching** - Cache frequently searched embeddings
7. **Analytics** - Track search patterns and quality
8. **A/B Testing** - Test different similarity thresholds

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for detailed errors
3. Ensure AI provider is properly configured
4. Verify network connectivity to AI services

---

## License

Part of Project Sakura - Internal Documentation System
