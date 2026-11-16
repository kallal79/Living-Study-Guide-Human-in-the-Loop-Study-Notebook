// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App } from '../src/App';
import { initialNotebookState } from '../src/data/initialData';

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
  beforeEach(() => {
    const ls = createMemoryStorage();
    const ss = createMemoryStorage();
    Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true, writable: true });
    Object.defineProperty(globalThis, 'sessionStorage', { value: ss, configurable: true, writable: true });
    Object.defineProperty(window, 'localStorage', { value: ls, configurable: true, writable: true });
    Object.defineProperty(window, 'sessionStorage', { value: ss, configurable: true, writable: true });

    // Mock fetch to simulate healthy local API returning initial seed
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/notebook') && (!init?.method || init.method === 'GET')) {
        return new Response(JSON.stringify(structuredClone(initialNotebookState)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
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
    expect(screen.getByText('Source-Grounded Quick Quiz')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^Study session$/i }));
    expect(screen.getByText('Focused Study Session')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Understanding/i }));
    expect(screen.getByText('Your foundation is in place.')).toBeTruthy();
    expect(screen.getByText('SOURCE-LINKED COVERAGE')).toBeTruthy();
  });

  it('approves a card from Review Queue, updates Library count, and allows sending back', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    fireEvent.click(screen.getByRole('button', { name: /Review queue/i }));
    expect(screen.getByText('The self is social')).toBeTruthy();

    const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
    fireEvent.click(approveButtons[0]);

    // Undo toast appears and card leaves queue
    expect(screen.getByText(/to Library\./i)).toBeTruthy();
    expect(screen.queryByText('The self is social')).toBeNull();

    // Undo restores the card back to Review Queue
    fireEvent.click(screen.getByRole('button', { name: /Undo/i }));
    expect(screen.getByText('The self is social')).toBeTruthy();

    // Approve again and check Library
    fireEvent.click(screen.getAllByRole('button', { name: /Approve/i })[0]);

    // Library now has 9 approved items
    fireEvent.click(screen.getByRole('button', { name: /^Library$/i }));
    expect(screen.getByText(/Approved Knowledge Library \(9\)/i)).toBeTruthy();

    // Send card back to Review Queue
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

  it('opens and closes EditModal, DocumentUploader, SettingsModal, and MissionFlowModal without hook errors', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    // MissionFlowModal
    fireEvent.click(screen.getByRole('button', { name: /How This Works/i }));
    expect(screen.getByText('Nothing Saves Without A Check')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Got it, take me to Review Queue/i }));

    // EditModal inside ReviewQueue
    fireEvent.click(screen.getByRole('button', { name: /Review queue/i }));
    const editButtons = screen.getAllByRole('button', { name: /^Edit/i });
    fireEvent.click(editButtons[0]);
    expect(screen.getByText('Edit Study Candidate')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    // DocumentUploader with Incident Runbook preset
    fireEvent.click(screen.getByRole('button', { name: /Ingest Source Notes/i }));
    expect(screen.getByText('Ingest Source Notes', { selector: 'h3' })).toBeTruthy();
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

  it('computes QuickQuiz final score accurately without double-counting the final question', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    fireEvent.click(screen.getByRole('button', { name: /^Quick quiz$/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Quick 5' }));

    // Answer first 5 approved items by selecting the exact correct option text
    const firstFiveApproved = initialNotebookState.items
      .filter((i) => i.status === 'approved')
      .slice(0, 5);
    for (let q = 0; q < firstFiveApproved.length; q++) {
      const item = firstFiveApproved[q];
      const correctOptionText =
        item.quizQuestion.options[item.quizQuestion.correctOptionIndex];
      const optionButton = screen.getByText(correctOptionText).closest('button');
      expect(optionButton).toBeTruthy();
      fireEvent.click(optionButton!);

      const nextOrFinish = screen.getByRole('button', {
        name: q < 4 ? /Next Question/i : /Finish Quiz/i,
      });
      fireEvent.click(nextOrFinish);
    }

    expect(screen.getByText('Quiz Completed!')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByText(/You answered 5 of 5 questions correctly/i)).toBeTruthy();
  });

  it('protects content behind PrivateLockScreen and unlocks with valid passcode', async () => {
    render(<App />);
    await screen.findByText('Explain inequality from the source.');

    fireEvent.click(screen.getByRole('button', { name: /Private Lock/i }));

    // Content is hidden behind lock screen
    expect(screen.queryByText('Explain inequality from the source.')).toBeNull();
    expect(screen.getByText('Private Study Guide')).toBeTruthy();

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
});
