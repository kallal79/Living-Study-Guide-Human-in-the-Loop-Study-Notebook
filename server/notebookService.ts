import fs from 'fs';
import path from 'path';
import { initialNotebookState } from '../src/data/initialData';
import {
  GeneratedQuizQuestion,
  ItemCategory,
  NotebookState,
  StudyItem,
  StudySessionLog,
} from '../src/types';
import { extractStudyItemsFromText } from '../src/utils/extractor';
import { generateDynamicQuiz, QuizGenerationOptions } from '../src/utils/quizGenerator';

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
  const seed = structuredClone(initialNotebookState);
  saveState(seed);
  return seed;
}

export function saveState(state: NotebookState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database.json:', err);
  }
}

export function createManualItem(payload: {
  title: string;
  tag?: string;
  category?: ItemCategory;
  sourceFact: string;
  studyInterpretation: string;
  flashcardFront?: string;
}): StudyItem {
  const title = payload.title.trim();
  const sourceFact = payload.sourceFact.trim();
  const studyInterpretation = payload.studyInterpretation.trim();
  const tag = (payload.tag || 'Custom').trim();
  const category: ItemCategory = payload.category || 'CONCEPT';

  const newItem: StudyItem = {
    id: `manual-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    documentId: 'doc-manual',
    documentTitle: 'Manual Study Entry',
    sourceCitation: `${tag} | User Verified Entry`,
    tag,
    category,
    title,
    sourceFact,
    studyInterpretation,
    status: 'pending', // Always starts in Review Queue: Nothing saves without a check
    userEdited: true,
    originalInterpretation: studyInterpretation,
    createdAt: new Date().toISOString(),
    flashcard: {
      front: payload.flashcardFront?.trim() || `Explain the source concept: "${title}"`,
      back: studyInterpretation,
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0,
    },
    quizQuestion: {
      question: `According to your notes on "${title}": what does the source establish?`,
      options: [
        studyInterpretation,
        'The opposite condition holds true across all contexts.',
        'Extraneous detail not present in your notes.',
        'Unverified historical conjecture.',
      ],
      correctOptionIndex: 0,
      explanation: `Source Fact: "${sourceFact}"`,
    },
  };

  const state = readState();
  state.items.unshift(newItem);
  saveState(state);
  return newItem;
}

export function approveItemById(id: string): StudyItem | null {
  const state = readState();
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  state.items[idx].status = 'approved';
  state.items[idx].reviewedAt = new Date().toISOString();
  saveState(state);
  return state.items[idx];
}

export function discardItemById(id: string): StudyItem | null {
  const state = readState();
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  state.items[idx].status = 'discarded';
  state.items[idx].reviewedAt = new Date().toISOString();
  saveState(state);
  return state.items[idx];
}

export function restoreItemToQueueById(id: string): StudyItem | null {
  const state = readState();
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  state.items[idx].status = 'pending';
  state.items[idx].reviewedAt = undefined;
  saveState(state);
  return state.items[idx];
}

export function updateItemById(id: string, updates: Partial<StudyItem>): StudyItem | null {
  const state = readState();
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  state.items[idx] = { ...state.items[idx], ...updates, userEdited: true };
  saveState(state);
  return state.items[idx];
}

export function mergeItemsById(
  itemIds: string[],
  mergedTitle?: string,
  mergedInterpretation?: string
): { error?: string; status?: number; mergedItem?: StudyItem } {
  if (!itemIds || itemIds.length < 2) {
    return { error: 'At least 2 items required', status: 400 };
  }
  const state = readState();
  const targets = state.items.filter((i) => itemIds.includes(i.id));
  if (targets.length < 2) {
    return { error: 'Selected items not found', status: 404 };
  }

  const combinedSource = targets.map((i) => i.sourceFact).join(' ');
  const combinedCitation = targets.map((i) => i.sourceCitation).filter(Boolean).join('; ');
  const newTitle = mergedTitle || `${targets[0].title} & ${targets[1].title}`;
  const newInterp =
    mergedInterpretation || targets.map((i) => i.studyInterpretation).join(' Furthermore, ');

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
        'Neither principle has any conceptual relevance.',
        'They only apply in hypothetical situations without source evidence.',
      ],
      correctOptionIndex: 0,
      explanation: `Source: "${combinedSource}"`,
    },
  };

  state.items = state.items.filter((i) => !itemIds.includes(i.id));
  state.items.unshift(mergedItem);
  saveState(state);
  return { mergedItem };
}

export function ingestTextDocument(payload: {
  rawText: string;
  title?: string;
  courseTopic?: string;
  fileName?: string;
  studyGoal?: NotebookState['studyGoal'];
}): { count: number; items: StudyItem[]; documentId: string } {
  const { rawText, title, courseTopic, fileName, studyGoal } = payload;
  const newItems = extractStudyItemsFromText(rawText, {
    documentTitle: title || 'Uploaded Document',
    courseTopic: courseTopic || 'General Study',
    fileName: fileName || 'uploaded_notes.txt',
    studyGoal: studyGoal || 'exam_review',
  });

  const docId = newItems[0]?.documentId || `doc-${Date.now().toString(36)}`;
  const state = readState();
  state.items.unshift(...newItems);
  state.documents.unshift({
    id: docId,
    title: title || 'Uploaded Document',
    courseTopic: courseTopic || 'General Study',
    fileName: fileName || 'uploaded_notes.txt',
    rawContent: rawText,
    uploadedAt: new Date().toISOString(),
    totalExtracted: newItems.length,
    approvedCount: 0,
  });

  saveState(state);
  return { count: newItems.length, items: newItems, documentId: docId };
}

export function generateQuizFromState(
  options: QuizGenerationOptions & { items?: StudyItem[] } = {}
): {
  questions: GeneratedQuizQuestion[];
  totalApproved: number;
  generatedAt: string;
} {
  const state = readState();
  const sourceItems =
    Array.isArray(options.items) && options.items.length > 0 ? options.items : state.items;
  const approvedCount = sourceItems.filter((i) => i.status === 'approved').length;
  const questions = generateDynamicQuiz(sourceItems, options);
  return {
    questions,
    totalApproved: approvedCount,
    generatedAt: new Date().toISOString(),
  };
}

export function recordSessionLog(session: StudySessionLog): StudySessionLog {
  const state = readState();
  state.sessions.unshift(session);
  saveState(state);
  return session;
}
