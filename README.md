# Living Study Guide 

> **Turn your own notes into a private study guide that writes flashcards and quiz questions confidently grounded in only your trusted sources.**

An implementation of the **Living Study Guide** mission, featuring a human-in-the-loop AI review queue, side-by-side source fact grounding, spaced-repetition flashcards, adaptive quizzes, focused study sessions, understanding analytics, and Phase IV passcode privacy and full JSON backup.

---

## 🏛️ Core Philosophy: Nothing Saves Without A Check

```
+-------------------------------------------------------------+
|                     SOURCE EXCERPT                          |
| "A kill switch exists for shutting off risky behavior..."    |
+-------------------------------------------------------------+
                              +
                              |
+-----------------------------v-------------------------------+
|                  WHAT THE AI MADE OF IT                     |
|  "A control for shutting off risky behavior mid-incident."  |
+-------------------------------------------------------------+
                              +
                              |
                     +--------v--------+
                     |   YOU DECIDE    |
                     +---+---------+---+
                         |         |
           [Edit, then approve]    [Discard]
                         |         |
                         v         v
             +-----------------+  Never Saved
             | Private Library |  (Zero Hallucinations)
             +-----------------+
```

When source sentences are short, ungrounded AI tools tend to fill the void with popular historical assumptions (e.g., adding *"because of barbarian invasions"* to *"Rome fell in 476 AD"* when the notes didn't say that). The Living Study Guide displays the original source sentence right next to the generated explanation, empowering the human to approve, edit, merge, or discard every candidate before it enters the library.

---

##  Features & Navigation

1. **Overview Dashboard** (`#overview`):
   - Live Study Focus switcher (`Exam Review`, `Concept Recall`, `Practical How-To`, `Meeting Prep`)
   - Custom study-desk editorial illustration (`public/images/study-hero.jpg`) paired with `NEXT UP: Review one candidate`
   - Real-time metrics (**Needs your eye**, flagged addition count, **In your library**) and Trusted Source Material inspector
   - Quick launch for flashcards, quizzes, and note ingestion

2. **Human-in-the-Loop Review Queue** (`#review`):
   - Topic filter chips (`Showing: All, Socialization, Stratification`), type filters (`CONCEPT`, `LECTURE CLAIM`, `KEY TERM`, `SYSTEM`, `PROCESS`, `HOW-TO`, `QUESTION`), live search, `Check Additions` filter, and `Goal Priority` ordering
   - Two comparative side-by-side boxes on every card:
     - **SOURCE FACT**: Verbatim quote from source notes
     - **STUDY INTERPRETATION**: Grounded study formulation
   - Token-level **Word Trace** toggle highlighting source-backed vs added terms with percentage overlap
   - Interactive actions: `Approve [A]`, `Edit [E]` (with 1-click *Cut back to exact source fact*), `Discard [D]`, inline card **Tag editing**, bulk **Retag**, bulk Approve/Discard, and **Select to Merge (`M`)** with Undo toast recovery

3. **Approved Knowledge Library** (`#library`):
   - Searchable, filterable repository of verified knowledge across **Cards**, **Source-Linked Guides & How-To Summaries**, and **Compact Table** views
   - Clickable **Concept Page modal** displaying full groundedness overlap, Leitner box level, related concepts, and quick Flashcard / Quiz launch
   - 1-click **Markdown Study Guide**, **Anki CSV**, and print-ready exports

4. **Spaced-Repetition Flashcards** (`#flashcards`):
   - Interactive 3D flip card animation with topic and Leitner Box filters (`All Boxes`, `Box 1-2`, `Box 3-5`)
   - `Show Verbatim Source Excerpt [S]` drawer to inspect the original quote beside the card
   - 5-Level Leitner Spaced Repetition rating: `Again [1]`, `Hard [2]`, `Good [3]`, `Easy [4]`

5. **Dynamic Multi-Format Quick Quiz** (`#quiz` + `POST /api/quiz/generate`):
   - Dynamically generates non-repeating 4-choice questions across **6 study formats**: `Core MCQ`, `Concept Match`, `Fill-in-Blank (Quote Cloze)`, `Grounding Check`, `Source Verify`, and `Source Evidence`
   - Tracks excluded question signatures across attempts so retakes (`Generate Different Quiz`) produce fresh items
   - Displays verbatim source quote citations, streak tracking, `Retry Missed`, and a full per-question **Review Answers** breakdown

6. **Focused Study Session** (`#session`):
   - Zen countdown timer (`5`, `15`, `25`, `45` minutes) paired with a live **Spotlight Recall Card** and guided 3-step routine
   - Optional Web Audio API **Ambient Focus** synthesis (`Gentle Rain`, `Zen Stream`, `Quiet Library Room`) with volume control and UI chime mute toggle

7. **Understanding Dashboard** (`#understanding`):
   - **Source-Linked Coverage**: Circular foundation gauge (`8/8`), topic progress bars, Knowledge Type counts, and Recent Sessions log
   - **Groundedness & Retention** card displaying clean grounded percentage, Box 3+ mastered count, and quiz average

8. **Document Ingestion & Manual Card Engine**:
   - Paste lecture notes/transcripts, upload `.txt` / `.md` / `.json` files, or load built-in **Sociology 101**, **AWS Module 1**, and **Incident Runbook** presets
   - **Create Single Study Card** tab for individual cards — all extracted and manual cards start `pending` in the Review Queue

9. **Phase IV Privacy, API & Full Backup**:
   - Optional PIN passcode lock screen (`1234` demo default, hides default hint when customized) with lock-gate pre-load protection
   - Full 1-click **JSON Backup** download and restore (`/api/backup`, `/api/restore`) persisted atomically to `server/data/database.json`

---

##  Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Running Locally
Start the integrated development server (Vite frontend + in-process `/api/*` backend via `server/apiHandler.ts`):
```bash
npm start
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

Or build and serve the standalone Express production bundle (`npm run build` followed by `npm run server` on port `3001`):
```bash
npm run build
npm run server
```

### Running Tests
Execute the full Vitest test suite (`5` test suites, `32` tests):
```bash
npm test
```
- `tests/extractor.test.ts` (`6` tests): Grounded extraction, categorization, and hallucination checks ("Rome fell in 476 AD")
- `tests/workflow.test.ts` (`6` tests): Full human-in-the-loop review, edit, merge, Leitner flashcards, and session logging
- `tests/quizGenerator.test.ts` (`3` tests): All 6 quiz formats, non-repeating signature exclusion, and quote cloze masking
- `tests/api.test.ts` (`6` tests): In-process `/api/*` endpoints (`/health`, `/notebook`, `/backup`, `/quiz/generate`, `/items`, `/upload`, `/sessions`, `/auth/unlock`)
- `tests/ui.test.tsx` (`11` tests): JSDOM end-to-end UI workflows, tagging, Library guides, dynamic quiz, artwork assets, and passcode lock screen

### Production Build
```bash
npm run build
```
Creates an optimized production bundle in `/dist`.

---

##  Mission Verification Checklist

- [x] **Phase I: Source Material Selection**: Pre-loaded with Sociology 101 (Mead, Cooley, Stratification) and AWS Cloud Practitioner Module 1.
- [x] **Phase II: Core Architecture & UI**: Calm, professional, responsive reading experience matching all learner reference designs.
- [x] **Phase III: Human-In-The-Loop Review Queue**: Every candidate sits beside its source sentence with `Approve`, `Edit`, `Merge`, and `Discard`.
- [x] **Phase IV: Publish & Private Security**: Passcode lock screen protecting content, persistent storage, and full JSON backup download.

