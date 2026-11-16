import { describe, it, expect } from 'vitest';
import {
  extractStudyItemsFromText,
  verifyGroundedness,
  getGroundedTokens,
  getExtractionSummary,
} from '../src/utils/extractor';

describe('Grounded Source Extractor & Verification', () => {
  const sampleNote = `
Module: Classical Sociology
The self is social. Mead argued that we learn to see ourselves from other people's perspectives.
Charles Horton Cooley introduced the looking-glass self: we imagine how we appear to others.
To measure status: evaluate whether the role is achieved through effort or ascribed at birth.
Can individual agency meaningfully alter deeply entrenched institutional inequality without collective action?
`;

  it('extracts items and categorizes into claims, terms, how-to, and questions', () => {
    const items = extractStudyItemsFromText(sampleNote, {
      documentTitle: 'Sociology 101',
      courseTopic: 'Socialization',
      fileName: 'notes.txt',
    });

    expect(items.length).toBeGreaterThanOrEqual(4);

    // Every item must be in pending status initially ("NOTHING SAVES WITHOUT A CHECK")
    for (const item of items) {
      expect(item.status).toBe('pending');
      expect(item.sourceFact.length).toBeGreaterThan(15);
      expect(item.flashcard.front).toBeDefined();
      expect(item.quizQuestion.options.length).toBe(4);
      // All 4 quiz options must be distinct
      expect(new Set(item.quizQuestion.options).size).toBe(4);
      expect(item.quizQuestion.explanation).toContain(item.sourceFact);
    }

    const categories = items.map((i) => i.category);
    expect(categories).toContain('LECTURE CLAIM');
    expect(categories).toContain('QUESTION');
  });

  it('detects hallucinated additions vs faithful grounding (Rome fell test case from mission prompt)', () => {
    const verbatimSource = 'Rome fell in 476 AD.';
    const faithfulInterpretation = 'Rome fell in 476 AD.';
    const hallucinatedInterpretation =
      'Rome fell in 476 AD because of barbarian invasions and military collapse.';

    const faithfulCheck = verifyGroundedness(verbatimSource, faithfulInterpretation);
    expect(faithfulCheck.isSuspicious).toBe(false);
    expect(faithfulCheck.groundedScore).toBeGreaterThanOrEqual(0.8);

    const hallucinatedCheck = verifyGroundedness(verbatimSource, hallucinatedInterpretation);
    expect(hallucinatedCheck.isSuspicious).toBe(true);
    expect(hallucinatedCheck.unsupportedWords).toContain('barbarian');
    expect(hallucinatedCheck.unsupportedWords).toContain('invasions');
  });

  it('annotates token grounding correctly for visual trace in ReviewCard', () => {
    const source = 'The self is social.';
    const interp = 'The self is social because of external factors.';

    const tokens = getGroundedTokens(source, interp);
    expect(tokens.length).toBeGreaterThan(3);

    const externalToken = tokens.find((t) => t.text.toLowerCase() === 'external');
    expect(externalToken?.isGrounded).toBe(false);

    const selfToken = tokens.find((t) => t.text.toLowerCase() === 'self');
    expect(selfToken?.isGrounded).toBe(true);
  });

  it('preserves Term: Definition lines and strips lecture transcript timestamps', () => {
    const transcript = `
# AWS Lecture 1
[05:22] Professor: In computing, a client can be a web browser or desktop application that a person interacts with to make requests to computer servers.
Kill Switch: A kill switch exists for shutting off risky behavior mid-incident before queues saturate.
- Elastic Compute Cloud: A type of virtual server on AWS.
`;
    const items = extractStudyItemsFromText(transcript, {
      documentTitle: 'AWS Cloud',
      courseTopic: 'Cloud',
      fileName: 'transcript.txt',
    });

    expect(items.length).toBe(3);
    expect(items[0].sourceFact).not.toContain('[05:22]');
    expect(items[1].title).toBe('Kill Switch');
    expect(items[1].category).toBe('KEY TERM');
    expect(items[2].title).toContain('Elastic Compute Cloud');

    const summary = getExtractionSummary(items);
    expect(summary.total).toBe(3);
    expect(summary.byCategory['KEY TERM']).toBe(2);
  });

  it('always produces 4 unique quiz options even with only 2 input sentences', () => {
    const twoLines = `
First concept: Alpha represents the primary entry condition for all local queries.
Second concept: Beta represents the secondary validation check before writing state.
`;
    const items = extractStudyItemsFromText(twoLines, {
      documentTitle: 'Short Note',
      courseTopic: 'Testing',
      fileName: 'short.txt',
    });

    expect(items.length).toBe(2);
    for (const item of items) {
      expect(new Set(item.quizQuestion.options).size).toBe(4);
    }
  });

  it('creates quiz questions strictly grounded in verbatim citations', () => {
    const items = extractStudyItemsFromText(
      "Mead argued that we learn to see ourselves from other people's perspectives.",
      {
        documentTitle: 'Mead Notes',
        courseTopic: 'Socialization',
        fileName: 'mead.txt',
      }
    );

    const item = items[0];
    expect(item.quizQuestion.explanation).toContain(
      "Mead argued that we learn to see ourselves from other people's perspectives."
    );
    const correctOption = item.quizQuestion.options[item.quizQuestion.correctOptionIndex];
    expect(correctOption).toBe(item.studyInterpretation);
  });
});
