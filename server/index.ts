import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { NotebookState, StudyItem } from '../src/types';
import {
  readState,
  saveState,
  approveItemById,
  discardItemById,
  updateItemById,
  mergeItemsById,
  ingestTextDocument,
} from './notebookService';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/notebook', (_req, res) => {
  res.json(readState());
});

app.get('/api/backup', (_req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="living-study-guide-backup.json"');
  res.json(readState());
});

app.post(['/api/notebook', '/api/restore'], (req, res) => {
  const state = req.body as NotebookState;
  if (!state || !Array.isArray(state.items)) {
    return res.status(400).json({ error: 'Invalid notebook state payload' });
  }
  saveState(state);
  res.json({ success: true, count: state.items.length });
});

app.post('/api/items/:id/approve', (req, res) => {
  const item = approveItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true, item });
});

app.post('/api/items/:id/discard', (req, res) => {
  const item = discardItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true, item });
});

app.put('/api/items/:id', (req, res) => {
  const item = updateItemById(req.params.id, req.body as Partial<StudyItem>);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true, item });
});

app.post('/api/items/merge', (req, res) => {
  const { itemIds, mergedTitle, mergedInterpretation } = req.body as {
    itemIds: string[];
    mergedTitle?: string;
    mergedInterpretation?: string;
  };
  const result = mergeItemsById(itemIds, mergedTitle, mergedInterpretation);
  if (result.error) {
    return res.status(result.status || 400).json({ error: result.error });
  }
  res.json({ success: true, mergedItem: result.mergedItem });
});

app.post('/api/upload', (req, res) => {
  const { rawText } = req.body;
  if (!rawText || !String(rawText).trim()) {
    return res.status(400).json({ error: 'Source text is required' });
  }
  const data = ingestTextDocument(req.body);
  res.json({ success: true, ...data });
});

app.post('/api/auth/unlock', (req, res) => {
  const { passcode } = req.body;
  const state = readState();
  if (state.passcode === passcode) {
    return res.json({ success: true, token: 'session_auth_ok' });
  }
  res.status(401).json({ error: 'Incorrect passcode' });
});

// Serve frontend static build if dist exists
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Living Study Guide API] running at http://localhost:${PORT}`);
});
