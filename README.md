# Living Study Guide 🧠📚

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

## ✨ Features & Navigation

1. **Overview Dashboard** (`/overview`):
   - Welcome banner and topic header (`STRATIFICATION EXAM REVIEW`)
   - Direct shortcut: `NEXT UP: Review one candidate ->`
   - Real-time status cards: **Needs your eye** (pending count) and **In your library** (approved count)
   - Quick launch for flashcards, quizzes, and note ingestion

2. **Review Queue** (`/review`):
   - Topic filter chips (`Showing: All, Socialization, Stratification`)
   - Candidate count badge (`13 items ready for your review`)
   - Two comparative side-by-side boxes on every card:
     - **SOURCE FACT**: Verbatim quote from source notes
     - **STUDY INTERPRETATION**: Clear AI formulation
   - Interactive actions: `✓ Approve`, `✏️ Edit`, `🗑️ Discard`
   - Multi-item selection & **Select to Merge**: Synthesize 2+ complementary claims into 1 unified study card
   - Real-time Groundedness Detector: Warns if extra terms not present in the notes were added

3. **Approved Library** (`/library`):
   - Searchable, filterable repository of approved knowledge
   - Search across terms, source facts, interpretations, and tags
   - Switch between Side-by-Side Cards view and Compact Table view
   - 1-Click Export to **Markdown Study Guide** and **Anki CSV** format

4. **Spaced-Repetition Flashcards** (`/flashcards`):
   - Interactive 3D flip card animation
   - Front: Concept or key question
   - Back: Grounded answer & interpretation
   - `Show Verbatim Source Excerpt` toggle to inspect the original sentence
   - 5-Level Leitner Spaced Repetition rating: `Again (1)`, `Hard (2)`, `Good (3)`, `Easy (4)`

5. **Source-Grounded Quick Quiz** (`/quiz`):
   - 4-choice questions generated strictly from approved notes
   - Instant feedback with green/red answer highlighting
   - Verbatim source quote citation explaining *why* the correct answer is true
   - End-of-quiz score recap and retake options

6. **Focused Study Session** (`/session`):
   - Zen timer (15 min, 25 min Pomodoro, 45 min)
   - Guided 3-step structured routine: Inspect queue &rarr; Active recall drill &rarr; Quick quiz
   - Reflective session logger feeding the habit tracker

7. **Understanding Dashboard** (`/understanding`):
   - **Source-Linked Coverage**: Circular gauge (`8/8 foundation in place`)
   - Topic progress meters (`Socialization: 4 of 4 terms`, `Stratification: 4 of 4 terms`)
   - **Suggested Next** card: `Practice the claims. Terms give you the vocabulary...`
   - Habit statistics: Review habit (sessions started), Interpretation notes, Tags in use

8. **Document Ingestion Engine** (`/upload`):
   - Paste any lecture notes, syllabus, or upload `.txt` / `.md` files
   - Pre-loaded with learner test presets: **Sociology 101 Notes** & **AWS Module 1 Concepts**
   - Automatically parses Concepts, Claims, Key Terms, Systems, Processes, How-To guides, and Questions

9. **Phase IV Privacy & Security Mode**:
   - Optional PIN passcode lock screen (`1234` default)
   - Protects private notes from unauthorized viewing in shared or public browsers
   - Full 1-Click **JSON Backup Download** and **Restore** functionality

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Running Locally
To launch the interactive frontend:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

To run the backend API server:
```bash
npm run server
```
API runs at [http://localhost:3001](http://localhost:3001).

### Running Tests
Execute the comprehensive Vitest automated test suite:
```bash
npm test
```
All 12 unit and workflow tests will run:
- Grounded extraction & categorization tests
- Hallucination detection tests (verifying the "Rome fell in 476 AD" test case)
- Full human-in-the-loop review queue tests
- Spaced repetition & quiz citation tests
- API endpoint integration tests

### Production Build
```bash
npm run build
```
Creates an optimized production bundle in `/dist`.

---

## 📋 Mission Verification Checklist

- [x] **Phase I: Source Material Selection**: Pre-loaded with Sociology 101 (Mead, Cooley, Stratification) and AWS Cloud Practitioner Module 1.
- [x] **Phase II: Core Architecture & UI**: Calm, professional, responsive reading experience matching all learner reference designs.
- [x] **Phase III: Human-In-The-Loop Review Queue**: Every candidate sits beside its source sentence with `Approve`, `Edit`, `Merge`, and `Discard`.
- [x] **Phase IV: Publish & Private Security**: Passcode lock screen protecting content, persistent storage, and full JSON backup download.
