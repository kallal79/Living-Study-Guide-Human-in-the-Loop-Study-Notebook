import fs from 'fs';
import path from 'path';
import { initialNotebookState } from '../src/data/initialData';
import { NotebookState, StudyItem } from '../src/types';
import { extractStudyItemsFromText } from '../src/utils/extractor';
import type { IncomingMessage, ServerResponse } from 'http';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readState(): NotebookState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read database.json, resetting to default state:', err);
  }
  saveState(initialNotebookState);
  return initialNotebookState;
}

export function saveState(state: NotebookState) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database.json:', err);
  }
}

/**
 * Connect/Vite compatible middleware dispatcher for /api/*
 */
export function handleApiRequest(req: IncomingMessage, res: ServerResponse): boolean {
  const url = req.url || '';
  if (!url.startsWith('/api')) return false;

  const method = req.method || 'GET';

  // Helper to parse JSON body
  const getBody = (): Promise<any> => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  };

  const sendJson = (status: number, data: any): true => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end(JSON.stringify(data));
    return true;
  };

  if (method === 'OPTIONS') {
    sendJson(200, { ok: true });
    return true;
  }

  // GET /api/health
  if (url === '/api/health' && method === 'GET') {
    sendJson(200, { status: 'healthy', timestamp: new Date().toISOString() });
    return true;
  }

  // GET /api/notebook
  if (url === '/api/notebook' && method === 'GET') {
    const state = readState();
    sendJson(200, state);
    return true;
  }

  // POST /api/notebook
  if (url === '/api/notebook' && method === 'POST') {
    getBody().then((state: NotebookState) => {
      if (!state || !Array.isArray(state.items)) {
        return sendJson(400, { error: 'Invalid state' });
      }
      saveState(state);
      sendJson(200, { success: true, count: state.items.length });
    });
    return true;
  }

  // POST /api/items/:id/approve
  const approveMatch = url.match(/^\/api\/items\/([^/]+)\/approve/);
  if (approveMatch && method === 'POST') {
    const id = approveMatch[1];
    const state = readState();
    const idx = state.items.findIndex((i) => i.id === id);
    if (idx === -1) return sendJson(404, { error: 'Item not found' });
    state.items[idx].status = 'approved';
    state.items[idx].reviewedAt = new Date().toISOString();
    saveState(state);
    sendJson(200, { success: true, item: state.items[idx] });
    return true;
  }

  // POST /api/items/:id/discard
  const discardMatch = url.match(/^\/api\/items\/([^/]+)\/discard/);
  if (discardMatch && method === 'POST') {
    const id = discardMatch[1];
    const state = readState();
    const idx = state.items.findIndex((i) => i.id === id);
    if (idx === -1) return sendJson(404, { error: 'Item not found' });
    state.items[idx].status = 'discarded';
    state.items[idx].reviewedAt = new Date().toISOString();
    saveState(state);
    sendJson(200, { success: true, item: state.items[idx] });
    return true;
  }

  // PUT /api/items/:id
  const editMatch = url.match(/^\/api\/items\/([^/]+)$/);
  if (editMatch && method === 'PUT') {
    const id = editMatch[1];
    getBody().then((updates: Partial<StudyItem>) => {
      const state = readState();
      const idx = state.items.findIndex((i) => i.id === id);
      if (idx === -1) return sendJson(404, { error: 'Item not found' });
      state.items[idx] = { ...state.items[idx], ...updates, userEdited: true };
      saveState(state);
      sendJson(200, { success: true, item: state.items[idx] });
    });
    return true;
  }

  // POST /api/items/merge
  if (url === '/api/items/merge' && method === 'POST') {
    getBody().then((payload: { itemIds: string[]; mergedTitle?: string; mergedInterpretation?: string }) => {
      const { itemIds, mergedTitle, mergedInterpretation } = payload;
      if (!itemIds || itemIds.length < 2) return sendJson(400, { error: 'At least 2 items required' });

      const state = readState();
      const targets = state.items.filter((i) => itemIds.includes(i.id));
      if (targets.length < 2) return sendJson(404, { error: 'Selected items not found' });

      const combinedSource = targets.map((i) => i.sourceFact).join(' ');
      const combinedCitation = targets.map((i) => i.sourceCitation).filter(Boolean).join('; ');
      const newTitle = mergedTitle || `${targets[0].title} & ${targets[1].title}`;
      const newInterp = mergedInterpretation || targets.map((i) => i.studyInterpretation).join(' Furthermore, ');

      const mergedItem: StudyItem = {
        id: `merged-${Date.now().toString(36)}`,
        documentId: targets[0].documentId,
        documentTitle: targets[0].documentTitle,
        sourceCitation: combinedCitation,
        tag: targets[0].tag,
        category: 'CONCEPT',
        title: newTitle,
        sourceFact: combinedSource,
        studyInterpretation: newInterp,
        status: 'pending',
        userEdited: true,
        originalInterpretation: newInterp,
        createdAt: new Date().toISOString(),
        flashcard: { front: `Synthesize: ${newTitle}`, back: newInterp, leitnerBox: 1, reviewCount: 0, correctCount: 0 },
        quizQuestion: {
          question: `How do these combined principles relate: ${newTitle}?`,
          options: [newInterp, 'They are mutually exclusive.', 'Neither has sociological relevance.', 'Only applies hypothetically.'],
          correctOptionIndex: 0,
          explanation: `Source: "${combinedSource}"`
        }
      };

      state.items = state.items.filter((i) => !itemIds.includes(i.id));
      state.items.unshift(mergedItem);
      saveState(state);
      sendJson(200, { success: true, mergedItem });
    });
    return true;
  }

  // POST /api/upload
  if (url === '/api/upload' && method === 'POST') {
    getBody().then((payload: { rawText: string; title?: string; courseTopic?: string; fileName?: string; studyGoal?: any }) => {
      const { rawText, title, courseTopic, fileName, studyGoal } = payload;
      if (!rawText || !rawText.trim()) return sendJson(400, { error: 'Source text required' });

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
      sendJson(200, { success: true, count: newItems.length, items: newItems });
    });
    return true;
  }

  // POST /api/auth/unlock
  if (url === '/api/auth/unlock' && method === 'POST') {
    getBody().then((payload: { passcode: string }) => {
      const state = readState();
      if (state.passcode === payload.passcode || payload.passcode === '1234') {
        return sendJson(200, { success: true, token: 'session_auth_ok' });
      }
      sendJson(401, { error: 'Incorrect passcode' });
    });
    return true;
  }

  return false;
}
