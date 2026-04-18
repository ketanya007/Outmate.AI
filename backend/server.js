require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Orchestrator = require('./agents/Orchestrator');
const { randomBytes } = require('crypto');
const uuidv4 = () => randomBytes(16).toString('hex');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory SSE client registry
const sseClients = new Map();

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'GTM Intelligence Engine' });
});

// ─── SSE Stream Endpoint ──────────────────────────────────────────────────────
// Frontend connects here to receive real-time agent updates
app.get('/api/stream/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send heartbeat immediately
  res.write(`data: ${JSON.stringify({ event: 'connected', data: { sessionId } })}\n\n`);

  sseClients.set(sessionId, res);

  req.on('close', () => {
    sseClients.delete(sessionId);
    console.log(`[SSE] Client disconnected: ${sessionId}`);
  });
});

// ─── Query Submission Endpoint ────────────────────────────────────────────────
app.post('/api/query', async (req, res) => {
  const { query, sessionId } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!sessionId || !sseClients.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid or missing sessionId. Connect to /api/stream/:sessionId first.' });
  }

  const emit = ({ event, data }) => {
    const client = sseClients.get(sessionId);
    if (client) {
      client.write(`data: ${JSON.stringify({ event, data })}\n\n`);
    }
  };

  // Acknowledge the request immediately
  res.json({ message: 'Query received. Streaming agent updates via SSE.', sessionId });

  // Run orchestration asynchronously (non-blocking)
  Orchestrator(query, emit)
    .then(() => {
      const client = sseClients.get(sessionId);
      if (client) client.end();
      sseClients.delete(sessionId);
    })
    .catch((err) => {
      console.error('[Server] Orchestrator failed:', err.message);
      const client = sseClients.get(sessionId);
      if (client) {
        client.write(`data: ${JSON.stringify({ event: 'error', data: { message: err.message } })}\n\n`);
        client.end();
      }
      sseClients.delete(sessionId);
    });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 GTM Intelligence Engine running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Stream: http://localhost:${PORT}/api/stream/:sessionId`);
  });
}

module.exports = app;
