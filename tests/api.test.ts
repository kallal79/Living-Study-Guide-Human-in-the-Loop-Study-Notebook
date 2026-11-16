import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initialNotebookState } from '../src/data/initialData';
import { NotebookState } from '../src/types';
import { handleApiRequest, readState, saveState } from '../server/apiHandler';
import { EventEmitter } from 'events';

function invokeHandler(
  method: string,
  url: string,
  body?: unknown
): Promise<{ statusCode: number; headers: Record<string, string>; json: any; handled: boolean }> {
  return new Promise((resolve) => {
    class MockReq extends EventEmitter {
      url = url;
      method = method;
    }

    class MockRes {
      statusCode = 200;
      headers: Record<string, string> = {};
      setHeader(name: string, value: string) {
        this.headers[name] = value;
      }
      end(chunk: string) {
        let parsed: any = chunk;
        try {
          parsed = chunk ? JSON.parse(chunk) : null;
        } catch {
          // keep raw
        }
        resolve({ statusCode: this.statusCode, headers: this.headers, json: parsed, handled: true });
      }
    }

    const req = new MockReq() as any;
    const res = new MockRes() as any;
    const handled = handleApiRequest(req, res);
    if (!handled) {
      resolve({ statusCode: 404, headers: {}, json: null, handled: false });
      return;
    }

    if (body !== undefined) {
      queueMicrotask(() => {
        req.emit('data', JSON.stringify(body));
        req.emit('end');
      });
    }
  });
}

describe('Living Study Guide In-Process API Middleware', () => {
  let originalBackup: NotebookState;

  beforeAll(() => {
    originalBackup = structuredClone(readState());
    saveState(structuredClone(initialNotebookState));
  });

  afterAll(() => {
    saveState(originalBackup);
  });

  it('handles GET /api/health with query strings cleanly', async () => {
    const res = await invokeHandler('GET', '/api/health?probe=1');
    expect(res.handled).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.json.status).toBe('healthy');
  });

  it('handles GET /api/notebook and /api/backup', async () => {
    const nb = await invokeHandler('GET', '/api/notebook');
    expect(nb.statusCode).toBe(200);
    expect(nb.json.notebookName).toBe('Sociology 101 Study Notebook');
    expect(nb.json.items.length).toBe(21);

    const backup = await invokeHandler('GET', '/api/backup');
    expect(backup.statusCode).toBe(200);
    expect(backup.headers['Content-Disposition']).toContain('living-study-guide-backup.json');
  });

  it('approves, edits, and discards items through the API and persists state', async () => {
    const approve = await invokeHandler('POST', '/api/items/soc-pen-1/approve');
    expect(approve.statusCode).toBe(200);
    expect(approve.json.item.status).toBe('approved');

    const edit = await invokeHandler('PUT', '/api/items/soc-pen-1', {
      tag: 'Mead Theory',
      studyInterpretation: 'Identity forms through interaction.',
    });
    expect(edit.statusCode).toBe(200);
    expect(edit.json.item.tag).toBe('Mead Theory');
    expect(edit.json.item.userEdited).toBe(true);

    const discard = await invokeHandler('POST', '/api/items/soc-pen-2/discard');
    expect(discard.statusCode).toBe(200);
    expect(discard.json.item.status).toBe('discarded');
  });

  it('merges two items and ingests new documents via /api/upload', async () => {
    const merge = await invokeHandler('POST', '/api/items/merge', {
      itemIds: ['soc-pen-3', 'soc-pen-4'],
      mergedTitle: 'Institutional Capital & Agency',
    });
    expect(merge.statusCode).toBe(200);
    expect(merge.json.mergedItem.title).toBe('Institutional Capital & Agency');

    const upload = await invokeHandler('POST', '/api/upload', {
      title: 'Test Note',
      courseTopic: 'Testing',
      rawText: 'Kill Switch: A kill switch exists for shutting off risky behavior mid-incident.',
    });
    expect(upload.statusCode).toBe(200);
    expect(upload.json.count).toBe(1);
    expect(upload.json.items[0].status).toBe('pending');
  });

  it('validates passcode strictly on /api/auth/unlock and returns 404 on unknown API routes', async () => {
    const badAuth = await invokeHandler('POST', '/api/auth/unlock', { passcode: '9999' });
    expect(badAuth.statusCode).toBe(401);

    const goodAuth = await invokeHandler('POST', '/api/auth/unlock', { passcode: '1234' });
    expect(goodAuth.statusCode).toBe(200);
    expect(goodAuth.json.token).toBe('session_auth_ok');

    const missing = await invokeHandler('GET', '/api/does-not-exist');
    expect(missing.statusCode).toBe(404);
  });
});
