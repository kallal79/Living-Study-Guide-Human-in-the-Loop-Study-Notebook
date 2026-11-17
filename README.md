# Living Study Guide

A private, source-grounded study notebook that extracts concepts, claims, key terms, processes, and how-to steps from your notes and requires human review before anything enters the study library.

## Overview

When source excerpts are brief, automated summaries often add outside assumptions that were never in the original notes. Living Study Guide puts every candidate card beside its exact source sentence (`SOURCE FACT` vs. `STUDY INTERPRETATION`) so you can approve, edit, retag, merge, or discard each item before practicing flashcards or quizzes from it.

## Core Features

- **Overview & Study Focus**: Tracks pending queue count, flagged addition checks, approved library cards, source material inspection, and focus modes (`Exam Review`, `Concept Recall`, `Practical How-To`, `Meeting Prep`).
- **Human-in-the-Loop Review Queue**: Side-by-side comparison of verbatim source sentences and interpretations, token-level Word Trace highlighting, inline/bulk tagging, card merging, keyboard shortcuts (`A`, `E`, `D`, `M`), and Undo recovery.
- **Approved Knowledge Library**: Filter and search verified cards across Cards, Source-Linked Topic Guides, and Table views, inspect Concept Pages with related terms, or export to Markdown, Anki CSV, and print.
- **Spaced-Repetition Flashcards**: 5-level Leitner box practice (`Box 1` to `Box 5`) with keyboard navigation (`Space`, `1-4`, `S` to toggle verbatim source excerpt).
- **Dynamic Quick Quiz (`/api/quiz/generate`)**: Generates varied, non-repeating 4-choice questions across 6 formats (`Core MCQ`, `Concept Match`, `Fill-in-Blank`, `Grounding Check`, `Source Verify`, `Source Evidence`) with source citations and post-quiz answer breakdowns.
- **Study Session & Understanding Dashboard**: Timed focus sessions (`5`, `15`, `25`, `45` minutes) with a Spotlight Recall card, optional Web Audio ambient sound presets, and progress analytics covering coverage, sessions logged, and groundedness rate.
- **Ingestion, Lock Screen & Backups**: Upload `.txt`/`.md`/`.json` files or create single cards directly, lock the notebook behind a passcode, and download or restore full JSON backups persisted via `server/data/database.json`.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 6, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express 4 + Vite in-process API middleware (`server/apiHandler.ts`), atomic JSON storage (`server/notebookService.ts`)
- **Testing**: Vitest, React Testing Library, JSDOM

## Local Development

```bash
npm install
npm start
```

Open `http://localhost:5173` in your browser. The Vite dev server mounts all `/api/*` endpoints in-process so frontend and API run together in a single command.

For a standalone Express build:

```bash
npm run build
npm run server
```

## Testing

```bash
npm test
```

Runs all 5 Vitest suites (32 tests):
- `tests/extractor.test.ts` — Extraction parsing, cognate groundedness checks, and hallucination detection
- `tests/workflow.test.ts` — Approval gating, merge, edit, Leitner updates, and dataset switching
- `tests/quizGenerator.test.ts` — Multi-format quiz generation and signature non-repetition
- `tests/api.test.ts` — Full API lifecycle tests running against an isolated temporary JSON store (`LIVING_STUDY_DB_FILE`)
- `tests/ui.test.tsx` — End-to-end JSDOM React component and user workflow checks
