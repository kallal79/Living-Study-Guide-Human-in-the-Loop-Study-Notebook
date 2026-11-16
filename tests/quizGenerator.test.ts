import { describe, it, expect } from 'vitest';
import { initialNotebookState } from '../src/data/initialData';
import { generateDynamicQuiz } from '../src/utils/quizGenerator';
import { QuizQuestionFormat } from '../src/types';

describe('Dynamic Multi-Format Grounded Quiz Generator', () => {
  it('generates distinct 4-option grounded questions for every supported quiz format', () => {
    const formats: QuizQuestionFormat[] = [
      'core_mcq',
      'source_evidence',
      'concept_recall',
      'quote_cloze',
      'grounding_check',
      'source_verify',
    ];

    for (const fmt of formats) {
      const qs = generateDynamicQuiz(initialNotebookState.items, {
        style: fmt,
        count: 5,
      });

      expect(qs.length).toBe(5);
      for (const q of qs) {
        expect(q.options.length).toBe(4);
        expect(new Set(q.options).size).toBe(4);
        expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctOptionIndex).toBeLessThan(4);
        expect(q.sourceFact.length).toBeGreaterThan(10);
      }
    }
  });

  it('produces different questions across consecutive attempts using excludeSignatures', () => {
    const attempt1 = generateDynamicQuiz(initialNotebookState.items, {
      style: 'mixed',
      count: 5,
      seed: 0,
    });
    const sigs1 = attempt1.map((q) => q.signature);

    const attempt2 = generateDynamicQuiz(initialNotebookState.items, {
      style: 'mixed',
      count: 5,
      excludeSignatures: sigs1,
      seed: 1,
    });
    const sigs2 = attempt2.map((q) => q.signature);

    // Every item in attempt2 that overlapped with attempt1 must have a different question signature/format
    const overlapping = sigs2.filter((s) => sigs1.includes(s));
    expect(overlapping.length).toBe(0);
  });

  it('filters questions strictly by topic tag and masks verbatim keywords in quote_cloze', () => {
    const socOnly = generateDynamicQuiz(initialNotebookState.items, {
      tag: 'Socialization',
      style: 'quote_cloze',
    });

    expect(socOnly.length).toBe(4);
    for (const q of socOnly) {
      expect(q.tag).toBe('Socialization');
      if (q.format === 'quote_cloze') {
        expect(q.promptContext).toContain('________');
        const answer = q.options[q.correctOptionIndex];
        expect(q.sourceFact).toContain(answer);
      }
    }
  });
});
