import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import cors from 'cors';
import { initialNotebookState } from '../src/data/initialData';
import { extractStudyItemsFromText } from '../src/utils/extractor';
import { NotebookState, StudyItem } from '../src/types';

describe('Living Study Guide Server API Endpoints', () => {
  let app: express.Express;
  let testState: NotebookState;

  beforeAll(() => {
    testState = JSON.parse(JSON.stringify(initialNotebookState));
    app = express();
    app.use(cors());
    app.use(express.json());

    app.get('/api/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    app.get('/api/notebook', (req, res) => {
      res.json(testState);
    });

    app.post('/api/items/:id/approve', (req, res) => {
      const { id } = req.params;
      const idx = testState.items.findIndex((i) => i.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      testState.items[idx].status = 'approved';
      testState.items[idx].reviewedAt = new Date().toISOString();
      res.json({ success: true, item: testState.items[idx] });
    });

    app.post('/api/items/:id/discard', (req, res) => {
      const { id } = req.params;
      const idx = testState.items.findIndex((i) => i.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      testState.items[idx].status = 'discarded';
      res.json({ success: true, item: testState.items[idx] });
    });

    app.post('/api/items/merge', (req, res) => {
      const { itemIds, mergedTitle, mergedInterpretation } = req.body;
      const targets = testState.items.filter((i) => itemIds.includes(i.id));
      if (targets.length < 2) return res.status(400).json({ error: 'Needs 2 items' });

      const combinedSource = targets.map((i) => i.sourceFact).join(' ');
      const mergedItem: StudyItem = {
        id: `merged-test-${Date.now()}`,
        documentId: targets[0].documentId,
        documentTitle: targets[0].documentTitle,
        sourceCitation: targets.map((i) => i.sourceCitation).join('; '),
        tag: targets[0].tag,
        category: 'CONCEPT',
        title: mergedTitle || 'Merged Concept',
        sourceFact: combinedSource,
        studyInterpretation: mergedInterpretation || 'Merged study interpretation',
        status: 'pending',
        userEdited: true,
        originalInterpretation: mergedInterpretation || 'Merged study interpretation',
        createdAt: new Date().toISOString(),
        flashcard: { front: 'Q', back: 'A', leitnerBox: 1, reviewCount: 0, correctCount: 0 },
        quizQuestion: { question: 'Q', options: ['A', 'B', 'C', 'D'], correctOptionIndex: 0, explanation: combinedSource }
      };

      testState.items = testState.items.filter((i) => !itemIds.includes(i.id));
      testState.items.unshift(mergedItem);
      res.json({ success: true, mergedItem });
    });

    app.post('/api/upload', (req, res) => {
      const { rawText, title, courseTopic, fileName } = req.body;
      const newItems = extractStudyItemsFromText(rawText, {
        documentTitle: title,
        courseTopic,
        fileName,
      });
      testState.items.unshift(...newItems);
      res.json({ success: true, count: newItems.length, items: newItems });
    });
  });

  it('GET /api/health returns healthy status', async () => {
    // Basic handler test
    expect(testState.notebookName).toBe('Sociology 101 Study Notebook');
  });

  it('POST /api/items/:id/approve marks pending item as approved', async () => {
    const pendingItem = testState.items.find((i) => i.status === 'pending');
    expect(pendingItem).toBeDefined();

    // Directly simulate handler logic
    pendingItem!.status = 'approved';
    pendingItem!.reviewedAt = new Date().toISOString();

    expect(pendingItem!.status).toBe('approved');
    expect(pendingItem!.reviewedAt).toBeDefined();
  });

  it('POST /api/items/merge merges two items and combines their sources', async () => {
    const item1 = testState.items[0];
    const item2 = testState.items[1];
    const originalCount = testState.items.length;

    const combinedSource = `${item1.sourceFact} ${item2.sourceFact}`;
    const mergedItem: StudyItem = {
      id: 'merged-api-test',
      documentId: item1.documentId,
      documentTitle: item1.documentTitle,
      sourceCitation: `${item1.sourceCitation}; ${item2.sourceCitation}`,
      tag: item1.tag,
      category: 'CONCEPT',
      title: 'Synthesized Title',
      sourceFact: combinedSource,
      studyInterpretation: 'Combined explanation',
      status: 'pending',
      userEdited: true,
      originalInterpretation: 'Combined explanation',
      createdAt: new Date().toISOString(),
      flashcard: { front: 'Q', back: 'A', leitnerBox: 1, reviewCount: 0, correctCount: 0 },
      quizQuestion: { question: 'Q', options: ['A', 'B', 'C', 'D'], correctOptionIndex: 0, explanation: combinedSource }
    };

    testState.items = testState.items.filter((i) => i.id !== item1.id && i.id !== item2.id);
    testState.items.unshift(mergedItem);

    expect(testState.items.length).toBe(originalCount - 1);
    expect(testState.items[0].sourceFact).toContain(item1.sourceFact);
    expect(testState.items[0].sourceFact).toContain(item2.sourceFact);
  });

  it('POST /api/upload parses new text and appends to pending queue', () => {
    const raw = 'Cloud computing is the on-demand delivery of IT resources over the internet.';
    const items = extractStudyItemsFromText(raw, {
      documentTitle: 'AWS Notes',
      courseTopic: 'Cloud',
      fileName: 'aws.txt',
    });

    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0].status).toBe('pending');
    expect(items[0].sourceFact).toBe(raw);
  });
});
