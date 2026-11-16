import type { IncomingMessage, ServerResponse } from 'http';
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

export { readState, saveState };

/**
 * Connect/Vite compatible middleware dispatcher for /api/*
 */
export function handleApiRequest(req: IncomingMessage, res: ServerResponse): boolean {
  const rawUrl = req.url || '/';
  const pathname = new URL(rawUrl, 'http://localhost').pathname;
  if (!pathname.startsWith('/api')) return false;

  const method = req.method || 'GET';

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
    return sendJson(200, { ok: true });
  }

  // GET /api/health
  if (pathname === '/api/health' && method === 'GET') {
    return sendJson(200, { status: 'healthy', timestamp: new Date().toISOString() });
  }

  // GET /api/notebook
  if (pathname === '/api/notebook' && method === 'GET') {
    return sendJson(200, readState());
  }

  // GET /api/backup
  if (pathname === '/api/backup' && method === 'GET') {
    const state = readState();
    res.setHeader('Content-Disposition', 'attachment; filename="living-study-guide-backup.json"');
    return sendJson(200, state);
  }

  // POST /api/notebook or POST /api/restore
  if ((pathname === '/api/notebook' || pathname === '/api/restore') && method === 'POST') {
    getBody().then((state: NotebookState) => {
      if (!state || !Array.isArray(state.items)) {
        return sendJson(400, { error: 'Invalid notebook state payload' });
      }
      saveState(state);
      sendJson(200, { success: true, count: state.items.length });
    });
    return true;
  }

  // POST /api/items/:id/approve
  const approveMatch = pathname.match(/^\/api\/items\/([^/]+)\/approve$/);
  if (approveMatch && method === 'POST') {
    const id = decodeURIComponent(approveMatch[1]);
    const item = approveItemById(id);
    if (!item) return sendJson(404, { error: 'Item not found' });
    return sendJson(200, { success: true, item });
  }

  // POST /api/items/:id/discard
  const discardMatch = pathname.match(/^\/api\/items\/([^/]+)\/discard$/);
  if (discardMatch && method === 'POST') {
    const id = decodeURIComponent(discardMatch[1]);
    const item = discardItemById(id);
    if (!item) return sendJson(404, { error: 'Item not found' });
    return sendJson(200, { success: true, item });
  }

  // PUT /api/items/:id
  const editMatch = pathname.match(/^\/api\/items\/([^/]+)$/);
  if (editMatch && method === 'PUT') {
    const id = decodeURIComponent(editMatch[1]);
    getBody().then((updates: Partial<StudyItem>) => {
      const item = updateItemById(id, updates);
      if (!item) return sendJson(404, { error: 'Item not found' });
      sendJson(200, { success: true, item });
    });
    return true;
  }

  // POST /api/items/merge
  if (pathname === '/api/items/merge' && method === 'POST') {
    getBody().then(
      (payload: { itemIds: string[]; mergedTitle?: string; mergedInterpretation?: string }) => {
        const result = mergeItemsById(
          payload.itemIds,
          payload.mergedTitle,
          payload.mergedInterpretation
        );
        if (result.error) {
          return sendJson(result.status || 400, { error: result.error });
        }
        sendJson(200, { success: true, mergedItem: result.mergedItem });
      }
    );
    return true;
  }

  // POST /api/upload
  if (pathname === '/api/upload' && method === 'POST') {
    getBody().then((payload) => {
      if (!payload.rawText || !String(payload.rawText).trim()) {
        return sendJson(400, { error: 'Source text required' });
      }
      const resData = ingestTextDocument(payload);
      sendJson(200, { success: true, ...resData });
    });
    return true;
  }

  // POST /api/auth/unlock
  if (pathname === '/api/auth/unlock' && method === 'POST') {
    getBody().then((payload: { passcode: string }) => {
      const state = readState();
      if (state.passcode === payload.passcode) {
        return sendJson(200, { success: true, token: 'session_auth_ok' });
      }
      sendJson(401, { error: 'Incorrect passcode' });
    });
    return true;
  }

  return sendJson(404, { error: 'API endpoint not found' });
}
