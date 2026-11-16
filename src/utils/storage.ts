import { NotebookState, StudyItem } from '../types';
import { initialNotebookState } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'living_study_guide_state_v1';

function safeSetLocalStorage(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore restricted storage environments (e.g., strict private iframes)
  }
}

function safeGetLocalStorage(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      return localStorage.getItem(key);
    }
  } catch {
    // Ignore restricted storage environments
  }
  return null;
}

export async function loadNotebookState(): Promise<NotebookState> {
  // Try fetching from backend API first
  try {
    const res = await fetch('/api/notebook');
    if (res.ok) {
      const data = await res.json();
      if (data && data.items) {
        safeSetLocalStorage(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // Backend may not be running in static preview; use localStorage
  }

  // Fallback to localStorage
  try {
    const cached = safeGetLocalStorage(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading from localStorage', err);
  }

  // Fallback to initial seed data
  safeSetLocalStorage(LOCAL_STORAGE_KEY, JSON.stringify(initialNotebookState));
  return structuredClone(initialNotebookState);
}

export async function saveNotebookState(state: NotebookState): Promise<void> {
  // Always update localStorage immediately
  safeSetLocalStorage(LOCAL_STORAGE_KEY, JSON.stringify(state));

  // Try updating backend API
  try {
    await fetch('/api/notebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  } catch {
    // Offline or backend unavailable, local persistence is already guaranteed
  }
}

export function downloadBackup(state: NotebookState) {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `living-study-guide-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportLibraryMarkdown(items: StudyItem[], notebookName: string): void {
  const approved = items.filter((i) => i.status === 'approved');
  let md = `# ${notebookName} — Approved Study Guide\n`;
  md += `*Generated: ${new Date().toLocaleDateString()} — Strictly Grounded in Original Sources*\n\n`;

  for (const item of approved) {
    md += `## [${item.category}] ${item.title}\n`;
    md += `**Tag:** \`${item.tag}\` | **Citation:** *${item.sourceCitation}*\n\n`;
    md += `> **Source Fact:**  \n> "${item.sourceFact}"\n\n`;
    md += `**Study Interpretation:**  \n${item.studyInterpretation}\n\n`;
    md += `---\n\n`;
  }

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${notebookName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-study-guide.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAnkiCSV(items: StudyItem[]): void {
  const approved = items.filter((i) => i.status === 'approved');
  let csv = 'Front,Back,Source Fact,Tag\n';

  for (const item of approved) {
    const front = `"${item.flashcard.front.replace(/"/g, '""')}"`;
    const back = `"${item.flashcard.back.replace(/"/g, '""')}"`;
    const source = `"${item.sourceFact.replace(/"/g, '""')}"`;
    const tag = `"${item.tag}"`;
    csv += `${front},${back},${source},${tag}\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `anki-cards-grounded.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

