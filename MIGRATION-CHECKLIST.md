# Migration Checklist - Embedding System Redesign

Use this checklist to deploy and verify the redesigned embedding system.

## Pre-Deployment

- [ ] Review changes in [REDESIGN-SUMMARY.md](./REDESIGN-SUMMARY.md)
- [ ] Read full documentation in [EMBEDDING-SYSTEM-REDESIGN.md](./EMBEDDING-SYSTEM-REDESIGN.md)
- [ ] Ensure you have an AI provider API key set

## Environment Setup

### Option 1: OpenAI (Recommended)
- [ ] Set `OPENAI_API_KEY` environment variable
- [ ] Verify: `echo $OPENAI_API_KEY`

### Option 2: Google Gemini
- [ ] Set `GOOGLE_API_KEY` environment variable
- [ ] Update system settings to use Google provider

### Option 3: Ollama (Local)
- [ ] Install Ollama: https://ollama.ai
- [ ] Pull a model: `ollama pull llama2`
- [ ] Verify it's running: `curl http://localhost:11434`
- [ ] Update system settings to use Ollama provider

## Deployment

- [ ] Pull/merge the code changes
- [ ] Install dependencies: `npm install` (if any new packages)
- [ ] Build the project: `npm run build`
- [ ] Restart the server: `npm start`

## Verification

### 1. Check AI Status
```bash
curl http://localhost:5000/api/ai/status
```
Expected response:
```json
{
  "configured": true,
  "provider": "openai"  // or "google" or "ollama"
}
```
- [ ] AI is configured ✓

### 2. Check Indexing Statistics
```bash
curl http://localhost:5000/api/ai/indexing-stats
```
Expected response:
```json
{
  "pages": { "total": X, "indexed": Y, "pending": Z },
  "tickets": { "total": X, "indexed": Y, "pending": Z },
  "totalIndexed": N,
  "totalPending": M
}
```
- [ ] Statistics endpoint working ✓

### 3. Check Queue Status
```bash
curl http://localhost:5000/api/embeddings/queue-status
```
Expected response:
```json
{
  "queueLength": 0,
  "processing": false
}
```
- [ ] Queue is operational ✓

## Initial Indexing

If you have existing pages/tickets without embeddings:

### Reindex Pages
```bash
curl -X POST http://localhost:5000/api/embeddings/reindex-pages
```
- [ ] Reindex started for pages ✓

### Reindex Tickets
```bash
curl -X POST http://localhost:5000/api/embeddings/reindex-tickets
```
- [ ] Reindex started for tickets ✓

### Monitor Progress
```bash
# Watch queue status
watch -n 2 'curl -s http://localhost:5000/api/embeddings/queue-status'

# Watch indexing stats
watch -n 5 'curl -s http://localhost:5000/api/ai/indexing-stats'
```
- [ ] All items processed (pending = 0) ✓

## Feature Testing

### Test 1: Automatic Embedding on New Page
1. Create a new page via UI or API
2. Wait 1-2 seconds
3. Check queue status - should see it was processed
4. Check indexing stats - indexed count should increase

- [ ] New pages automatically get embeddings ✓

### Test 2: Automatic Embedding on New Ticket
1. Create a new ticket via UI or API
2. Wait 1-2 seconds
3. Check queue status - should see it was processed
4. Check indexing stats - indexed count should increase

- [ ] New tickets automatically get embeddings ✓

### Test 3: Semantic Search
```bash
curl -X POST http://localhost:5000/api/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I configure my settings?",
    "limit": 5,
    "minSimilarity": 0.3
  }'
```
Expected: Array of relevant documents with similarity scores

- [ ] Semantic search returns relevant results ✓

### Test 4: RAG Ticket Response
```bash
curl -X POST http://localhost:5000/api/tickets/TICKET_ID/generate-response \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "How can I solve this issue?"
  }'
```
Expected: AI response with sources from documentation

- [ ] RAG generates contextual responses ✓

### Test 5: Related Documents
```bash
curl http://localhost:5000/api/tickets/TICKET_ID/related-documents
```
Expected: Array of related documents

- [ ] Related documents endpoint works ✓

## Performance Checks

### Check Server Logs
Look for:
- [ ] No repeated errors ✓
- [ ] Successful embedding generation logs ✓
- [ ] No rate limit errors ✓
- [ ] Queue processing logs ✓

### Monitor Queue Under Load
1. Create multiple pages/tickets quickly
2. Watch queue process them: `curl http://localhost:5000/api/embeddings/queue-status`
3. Verify all get processed

- [ ] Queue handles multiple items correctly ✓

## Frontend Integration (If Applicable)

If you have a frontend that needs updating:

### Add Semantic Search UI
- [ ] Add search input component
- [ ] Call `/api/search/semantic` endpoint
- [ ] Display results with similarity scores

### Add RAG to Ticket View
- [ ] Add "Get AI Help" button to ticket detail page
- [ ] Call `/api/tickets/:id/generate-response`
- [ ] Display AI response and source documents

### Show Related Documentation
- [ ] Add "Related Docs" section to ticket view
- [ ] Call `/api/tickets/:id/related-documents`
- [ ] Display as links to documentation

## Troubleshooting

If something doesn't work:

### Issue: AI Status shows not configured
- [ ] Check environment variables are set
- [ ] Restart server after setting env vars
- [ ] Verify API key is valid

### Issue: Embeddings not generating
- [ ] Check server logs for errors
- [ ] Verify AI provider is accessible
- [ ] Check queue status for errors
- [ ] Try manual endpoint: `/api/pages/:id/update-embedding`

### Issue: Search returns no results
- [ ] Verify content is indexed: `/api/ai/indexing-stats`
- [ ] Lower similarity threshold (try 0.2)
- [ ] Check query is meaningful text
- [ ] Verify embeddings exist in database

### Issue: Queue is stuck
- [ ] Check server logs
- [ ] Clear queue: `curl -X POST http://localhost:5000/api/embeddings/queue-clear`
- [ ] Restart server
- [ ] Run reindex again

## Post-Deployment

- [ ] Monitor server logs for 24 hours
- [ ] Check queue regularly: `curl http://localhost:5000/api/embeddings/queue-status`
- [ ] Verify search quality with real queries
- [ ] Gather user feedback on AI responses
- [ ] Monitor API rate limits and costs

## Optimization (Optional)

After running for a while, consider:

- [ ] Adjust queue processing delay in `server/embedding-queue.ts` (line 8)
- [ ] Tune similarity thresholds based on results quality
- [ ] Add monitoring/alerting for queue length
- [ ] Set up periodic reindexing (if content changes outside system)
- [ ] Consider caching frequently searched queries

## Success Criteria

The migration is successful when:

- [x] AI status shows configured
- [x] All existing content is indexed (pending = 0)
- [x] New pages/tickets automatically get embeddings
- [x] Semantic search returns relevant results
- [x] RAG generates helpful responses with sources
- [x] Queue processes items without errors
- [x] No performance degradation
- [x] Server logs show no critical errors

---

## Need Help?

Refer to:
1. [REDESIGN-SUMMARY.md](./REDESIGN-SUMMARY.md) - Quick overview
2. [EMBEDDING-SYSTEM-REDESIGN.md](./EMBEDDING-SYSTEM-REDESIGN.md) - Full documentation
3. Server logs - Check for specific errors
4. API responses - Look for error messages

---

## Rollback Plan (If Needed)

If something goes critically wrong:

1. The old system is still there - just restart the server
2. The new code is backward compatible
3. Existing embeddings are preserved
4. You can disable auto-embedding by setting `aiAutoVectorization = "false"` in system settings

The redesign adds features but doesn't break existing functionality!
