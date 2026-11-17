// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App } from '../src/App';
import { initialNotebookState } from '../src/data/initialData';
import { generateDynamicQuiz } from '../src/utils/quizGenerator';

// Mock canvas-confetti so JSDOM doesn't warn on canvas 2D context
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

describe('Living Study Guide End-to-End UI & Main Page Verification', () => {
  let quizGenerateCalls = 0;

  beforeEach(() => {
    window.location.hash = '';
    quizGenerateCalls = 0;
    const ls = createMemoryStorage();
    const ss = createMemoryStorage();
    Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'sessionStorage', { value: ss, configurable: true, writable: true });
    Object.defineProperty(window, 'localStorage', { value: ls, configurable: true, writable: true });
    Object.defineProperty(window, 'sessionStorage', { value: ss, configurable: true, writable: true });

    // Mock fetch simulating local API including POST /api/quiz/generate
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/notebook') && (!init?.method || init.method === 'GET')) {
        return new Response(JSON.stringify(structuredClone(initialNotebookState)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.includes('/api/quiz/generate') && init?.method === 'POST') {
        quizGenerateCalls++;
        const payload = init.body ? JSON.parse(String(init.body)) : {};
        const questions = generateDynamicQuiz(payload.items || initialNotebookState.items, payload);
        return new Response(
          JSON.stringify({
            success: true,
            questions,
            generatedAt: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the main Overview page visibly with all key cards and sidebar metrics', async () => {
    render(<App />);

    expect(await screen.findByText('Explain inequality from the source.')).toBeTruthy();
    expect(screen.getByText('Needs your eye')).toBeTruthy();
    expect(screen.getByText('In your library')).toBeTruthy();
    expect(screen.getByText('NOTHING SAVES WITHOUT A CHECK')).toBeTruthy();
    expect(screen.getByText('Review one candidate →')).toBeTruthy();
    expect(screen.getByText('TRUSTED SOURCE MATERIAL (1)')).toBeTruthy();
    const heroImg = screen.getByAltText(/Open study notebook with flashcards/i) as HTMLImageElement;
    expect(heroImg.getAttribute('src')).toBe('/images/study-hero.jpg');
    const hitlImg = screen.getByAltText(/Human-in-the-loop verification comparing source/i) as HTMLImageElement;
    expect(hitlImg.getAttribute('src')).toBe('/images/hitl-verify.jpg');
  });

  it('navigates cleanly across every sidebar page without crashing', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    fireEvent.click(screen.getByRole('button', { name: /Review queue/i }));
    expect(screen.getByText('The self is social')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^Library$/i }));
    expect(screen.getByText(/Approved Knowledge Library \(8\)/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^Flashcards$/i }));
    expect(screen.getByText('Recall Practice')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^Quick quiz$/i }));
    expect(await screen.findByText('Source-Grounded Quick Quiz')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^Study session$/i }));
    expect(screen.getByText('Focused Study Session')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Understanding/i }));
    expect(screen.getByText('Your foundation is in place.')).toBeTruthy();
    expect(screen.getByText('SOURCE-LINKED COVERAGE')).toBeTruthy();
  });

  it('approves a card from Review Queue, updates Library count, and supports Undo + send back', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    fireEvent.click(screen.getByRole('button', { name: /Review queue/i }));
    expect(screen.getByText('The self is social')).toBeTruthy();

    const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
    fireEvent.click(approveButtons[0]);

    expect(screen.getByText(/to Library\./i)).toBeTruthy();
    expect(screen.queryByText('The self is social')).toBeNull();

    // Undo restores the card back to Review Queue
    fireEvent.click(screen.getByRole('button', { name: /Undo/i }));
    expect(screen.getByText('The self is social')).toBeTruthy();

    // Approve again and check Library
    fireEvent.click(screen.getAllByRole('button', { name: /Approve/i })[0]);

    fireEvent.click(screen.getByRole('button', { name: /^Library$/i }));
    expect(screen.getByText(/Approved Knowledge Library \(9\)/i)).toBeTruthy();

    const sendBackButtons = screen.getAllByTitle('Send back to Review Queue');
    fireEvent.click(sendBackButtons[0]);
    expect(screen.getByText(/Approved Knowledge Library \(8\)/i)).toBeTruthy();
  });

  it('flips flashcards, reveals verbatim source excerpt, and updates Leitner box progress', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    fireEvent.click(screen.getByRole('button', { name: /^Flashcards$/i }));
    expect(screen.getByText('Box 2/5')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Show Verbatim Source Excerpt/i }));
    expect(screen.getByText(/Original Source Sentence:/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Reveal Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Good/i }));
    expect(screen.getByText('Card 2 of 8 • Strictly verified from your notes')).toBeTruthy();
  });

  it('creates both extracted and manual single cards into Review Queue and opens/closes all modals', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    // MissionFlowModal
    fireEvent.click(screen.getByRole('button', { name: /How This Works/i }));
    expect(screen.getByText('Nothing Saves Without A Check')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Got it, take me to Review Queue/i }));

    // EditModal
    fireEvent.click(screen.getByRole('button', { name: /Review queue/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /^Edit/i })[0]);
    expect(screen.getByText('Edit Study Candidate')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    // Manual single card creation inside DocumentUploader
    fireEvent.click(screen.getByRole('button', { name: /Ingest Source Notes/i }));
    fireEvent.click(screen.getByRole('button', { name: /Create Single Study Card/i }));
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Kill Switch/i), {
      target: { value: 'Circuit Breaker' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Incident Prep/i), {
      target: { value: 'Reliability' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Paste the exact sentence/i), {
      target: { value: 'Circuit breakers trip automatically when downstream error rates exceed threshold.' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Write the clean takeaway/i), {
      target: { value: 'Automatically halts failing downstream calls when error thresholds trigger.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add Card to Review Queue/i }));
    expect(screen.getByText('Circuit Breaker')).toBeTruthy();

    // DocumentUploader Bulk Extract with Incident Runbook preset
    fireEvent.click(screen.getByRole('button', { name: /Ingest Source Notes/i }));
    fireEvent.click(screen.getByRole('button', { name: /Incident Runbook/i }));
    expect(screen.getByText(/Live Preview: 5 candidates detected/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Extract \(5\) to Review Queue/i }));
    expect(screen.getByText('Kill Switch')).toBeTruthy();

    // SettingsModal
    fireEvent.click(screen.getByRole('button', { name: /Notebook settings/i }));
    expect(screen.getByText(/Notebook Settings & Security/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Load AWS Module 1/i }));
    fireEvent.click(screen.getByRole('button', { name: /Close modal/i }));
    expect(screen.getByText(/Quiet Study Notebook — AWS Module 1/i)).toBeTruthy();
  });

  it('fetches dynamic varied quiz questions via /api/quiz/generate and generates different questions per attempt', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    fireEvent.click(screen.getByRole('button', { name: /^Quick quiz$/i }));
    await waitFor(() => {
      expect(quizGenerateCalls).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText(/Fresh via \/api\/quiz\/generate/i)).toBeTruthy();

    // Switch to Core MCQ + Quick 5 so we can answer accurately and complete the attempt
    fireEvent.click(screen.getByRole('button', { name: 'Core MCQ' }));
    await waitFor(() => expect(quizGenerateCalls).toBeGreaterThanOrEqual(2));

    fireEvent.click(screen.getByRole('button', { name: 'Quick 5' }));
    await waitFor(() => expect(quizGenerateCalls).toBeGreaterThanOrEqual(3));

    const approvedItems = initialNotebookState.items.filter((i) => i.status === 'approved');

    for (let q = 0; q < 5; q++) {
      // Find the matching approved item by its question prompt and select its exact correct option
      const heading = screen.getByRole('heading', { level: 3 }).textContent || '';
      const matched = approvedItems.find((it) => it.quizQuestion.question === heading);
      expect(matched).toBeTruthy();
      const correctText =
        matched!.quizQuestion.options[matched!.quizQuestion.correctOptionIndex];
      const optionBtn = screen.getByText(correctText).closest('button');
      expect(optionBtn).toBeTruthy();
      fireEvent.click(optionBtn!);

      const nextOrFinish = screen.getByRole('button', {
        name: q < 4 ? /Next Question/i : /Finish Quiz/i,
      });
      fireEvent.click(nextOrFinish);
    }

    expect(screen.getByText('Quiz Completed!')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByText(/You answered 5 of 5 questions correctly/i)).toBeTruthy();

    // Click "Generate Different Quiz" and verify /api/quiz/generate is invoked again & Attempt increments
    const callsBefore = quizGenerateCalls;
    fireEvent.click(screen.getByRole('button', { name: /Generate Different Quiz/i }));
    await waitFor(() => {
      expect(quizGenerateCalls).toBeGreaterThan(callsBefore);
    });
    expect(screen.getByText(/Attempt #4/i)).toBeTruthy();
  });

  it('supports switching to Fill-in-Blank (Cloze) style quiz directly via API', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    fireEvent.click(screen.getByRole('button', { name: /^Quick quiz$/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Fill-in-Blank' }));

    await waitFor(() => {
      expect(screen.getByText('SOURCE CLOZE')).toBeTruthy();
    });
    expect(screen.getByText('[ ? ]')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Source Verify' }));
    await waitFor(() => {
      expect(screen.getByText('SOURCE VERIFY')).toBeTruthy();
    });
  });

  it('targets the chosen card first when launching Quiz directly from Library without overwriting it', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    fireEvent.click(screen.getByRole('button', { name: /^Library$/i }));
    const quizButtons = screen.getAllByTitle('Quiz on this item');
    // Launch quiz specifically for the 2nd approved card ("Primary Socialization")
    fireEvent.click(quizButtons[1]);

    await waitFor(() => {
      expect(screen.getByText('Source-Grounded Quick Quiz')).toBeTruthy();
      expect(screen.getByText(/Primary Socialization/i)).toBeTruthy();
    });
  });

  it('protects content behind PrivateLockScreen and unlocks with valid passcode', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    fireEvent.click(screen.getByRole('button', { name: /Private Lock/i }));

    expect(screen.queryByText('Explain inequality from the source.')).toBeNull();
    expect(screen.getByText('Private Study Guide')).toBeTruthy();
    expect(
      (screen.getByAltText(/Private study sanctuary illustration/i) as HTMLImageElement).getAttribute('src')
    ).toBe('/images/study-hero.jpg');

    const input = screen.getByPlaceholderText(/Enter passcode/i);
    fireEvent.change(input, { target: { value: '0000' } });
    fireEvent.click(screen.getByRole('button', { name: /Unlock Notebook/i }));
    expect(screen.getByText(/Incorrect passcode/i)).toBeTruthy();

    fireEvent.change(input, { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Unlock Notebook/i }));

    await waitFor(() => {
      expect(screen.getByText('Explain inequality from the source.')).toBeTruthy();
    });
  });

  it('supports inline single-card and bulk re-tagging in Review Queue and audio chime toggle in Header', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    // Toggle UI chimes mute state inside Ambient Focus menu & dismiss via Escape
    fireEvent.click(screen.getByRole('button', { name: /Ambient Focus/i }));
    const chimesBtn = screen.getByRole('button', { name: /UI Feedback Chimes/i });
    expect(screen.getByText('On')).toBeTruthy();
    fireEvent.click(chimesBtn);
    expect(screen.getByText('Muted')).toBeTruthy();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('button', { name: /UI Feedback Chimes/i })).toBeNull();

    // Inline tag rename + bulk retag inside Review Queue
    fireEvent.click(screen.getByRole('button', { name: /Review queue/i }));
    const cardTagButtons = screen.getAllByTitle('Click to rename or reassign tag');
    fireEvent.click(cardTagButtons[0]);
    const tagInput = screen.getByLabelText('Edit topic tag');
    fireEvent.change(tagInput, { target: { value: 'Exam Core' } });
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));
    expect(screen.getByText(/Tagged 1 card as "Exam Core"/i)).toBeTruthy();

    // Select two visible cards and bulk retag
    const cardCheckbox = screen.getByLabelText('Select The self is social');
    const secondCheckbox = screen.getByLabelText('Select People interpret social messages');
    fireEvent.click(cardCheckbox);
    fireEvent.click(secondCheckbox);
    const bulkInput = screen.getByPlaceholderText('Retag selected...');
    fireEvent.change(bulkInput, { target: { value: 'Midterm Review' } });
    fireEvent.click(screen.getByRole('button', { name: /^Retag$/i }));
    expect(screen.getByText(/Tagged 2 cards as "Midterm Review"/i)).toBeTruthy();
  });

  it('switches live study focus on Overview, renders Library Guide & Concept Page, and reveals Study Session spotlight card', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    // Live Overview Focus switcher
    fireEvent.click(screen.getByRole('button', { name: 'Practical How-To' }));
    expect(screen.getByText('HOW-TO SYSTEM GUIDE')).toBeTruthy();

    // Library Source-Linked Guide view + Concept Page Modal
    fireEvent.click(screen.getByRole('button', { name: /^Library$/i }));
    fireEvent.click(screen.getByTitle('Source-linked summary and how-to guides view'));
    expect(screen.getByText(/Socialization Study Guide/i)).toBeTruthy();
    expect(screen.getByText(/Stratification Study Guide/i)).toBeTruthy();

    // Open Concept Page via card button after switching to Cards view
    fireEvent.click(screen.getByTitle('Side-by-side cards view'));
    fireEvent.click(screen.getAllByTitle('Open concept page')[0]);
    expect(screen.getByText(/VERIFIED INTERPRETATION/i)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Close concept page'));

    // Study Session Spotlight Recall Card
    fireEvent.click(screen.getByRole('button', { name: /^Study session$/i }));
    expect(screen.getByText(/SPOTLIGHT RECALL CARD/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Source Quote/i }));
    expect(screen.getByRole('button', { name: /Hide Source/i })).toBeTruthy();
  });
});
