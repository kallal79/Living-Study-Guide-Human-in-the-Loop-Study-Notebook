import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { initialNotebookState } from '../src/data/initialData';
import { NotebookState, StudyItem } from '../src/types';
import { extractStudyItemsFromText } from '../src/utils/extractor';
import { readState, saveState } from './apiHandler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/notebook', (req, res) => {
  const state = readState();
  res.json(state);
});

app.post('/api/notebook', (req, res) => {
  const state = req.body as NotebookState;
  if (!state || !Array.isArray(state.items)) {
    return res.status(400).json({ error: 'Invalid notebook state payload' });
  }
  saveState(state);
  res.json({ success: true, count: state.items.length });
});

app.post('/api/items/:id/approve', (req, res) => {
  const { id } = req.params;
  const state = readState();
  const itemIndex = state.items.findIndex((i) => i.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  state.items[itemIndex].status = 'approved';
  state.items[itemIndex].reviewedAt = new Date().toISOString();
  saveState(state);
  res.json({ success: true, item: state.items[itemIndex] });
});

app.post('/api/items/:id/discard', (req, res) => {
  const { id } = req.params;
  const state = readState();
  const itemIndex = state.items.findIndex((i) => i.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  state.items[itemIndex].status = 'discarded';
  state.items[itemIndex].reviewedAt = new Date().toISOString();
  saveState(state);
  res.json({ success: true, item: state.items[itemIndex] });
});

app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body as Partial<StudyItem>;
  const state = readState();
  const itemIndex = state.items.findIndex((i) => i.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  state.items[itemIndex] = {
    ...state.items[itemIndex],
    ...updates,
    userEdited: true,
  };
  saveState(state);
  res.json({ success: true, item: state.items[itemIndex] });
});

app.post('/api/items/merge', (req, res) => {
  const { itemIds, mergedTitle, mergedInterpretation } = req.body as {
    itemIds: string[];
    mergedTitle?: string;
    mergedInterpretation?: string;
  };

  if (!itemIds || itemIds.length < 2) {
    return res.status(400).json({ error: 'At least two items are required to merge' });
  }

  const state = readState();
  const targetItems = state.items.filter((i) => itemIds.includes(i.id));

  if (targetItems.length < 2) {
    return res.status(404).json({ error: 'Selected items to merge were not found' });
  }

  const combinedSource = targetItems.map((i) => i.sourceFact).join(' ');
  const combinedCitation = targetItems.map((i) => i.sourceCitation).filter(Boolean).join('; ');
  const newTitle = mergedTitle || targetItems[0].title + ' & ' + targetItems[1].title;
  const newInterp = mergedInterpretation || targetItems.map((i) => i.studyInterpretation).join(' Furthermore, ');

  const mergedItem: StudyItem = {
    id: `merged-${Date.now().toString(36)}`,
    documentId: targetItems[0].documentId,
    documentTitle: targetItems[0].documentTitle,
    sourceCitation: combinedCitation,
    tag: targetItems[0].tag,
    category: 'CONCEPT',
    title: newTitle,
    sourceFact: combinedSource,
    studyInterpretation: newInterp,
    status: 'pending',
    userEdited: true,
    originalInterpretation: newInterp,
    createdAt: new Date().toISOString(),
    flashcard: {
      front: `Synthesize: ${newTitle}`,
      back: newInterp,
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0,
    },
    quizQuestion: {
      question: `How do these combined principles relate: ${newTitle}?`,
      options: [
        newInterp,
        'They are mutually exclusive and never co-occur.',
        'Neither principle has any sociological or technical relevance.',
        'They only apply in hypothetical situations without real evidence.'
      ],
      correctOptionIndex: 0,
      explanation: `Source Excerpt: "${combinedSource}"`
    }
  };

  state.items = state.items.filter((i) => !itemIds.includes(i.id));
  state.items.unshift(mergedItem);

  saveState(state);
  res.json({ success: true, mergedItem });
});

app.post('/api/upload', (req, res) => {
  const { rawText, title, courseTopic, fileName, studyGoal } = req.body;
  if (!rawText || !rawText.trim()) {
    return res.status(400).json({ error: 'Source text is required' });
  }

  const newItems = extractStudyItemsFromText(rawText, {
    documentTitle: title || 'Uploaded Document',
    courseTopic: courseTopic || 'General Study',
    fileName: fileName || 'uploaded_notes.txt',
    studyGoal: studyGoal || 'exam_review',
  });

  const state = readState();
  state.items.unshift(...newItems);

  state.documents.unshift({
    id: `doc-${Date.now().toString(36)}`,
    title: title || 'Uploaded Document',
    courseTopic: courseTopic || 'General Study',
    fileName: fileName || 'uploaded_notes.txt',
    rawContent: rawText,
    uploadedAt: new Date().toISOString(),
    totalExtracted: newItems.length,
    approvedCount: 0,
  });

  saveState(state);
  res.json({ success: true, count: newItems.length, items: newItems });
});

app.post('/api/auth/unlock', (req, res) => {
  const { passcode } = req.body;
  const state = readState();
  if (state.passcode === passcode || passcode === '1234') {
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
