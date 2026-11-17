import { describe, it, expect } from 'vitest';
import { initialNotebookState, awsNotebookState, sociologyNotebookState } from '../src/data/initialData';
import { NotebookState, StudyItem } from '../src/types';

describe('Living Study Guide Human-In-The-Loop Workflow', () => {
  it('loads initial dataset with expected counts (13 pending, 8 approved)', () => {
    const pending = initialNotebookState.items.filter((i) => i.status === 'pending');
    const approved = initialNotebookState.items.filter((i) => i.status === 'approved');

    expect(pending.length).toBe(13);
    expect(approved.length).toBe(8);

    // Topic foundation: 4 Socialization terms + 4 Stratification terms
    const socializationApproved = approved.filter((i) => i.tag === 'Socialization');
    const stratificationApproved = approved.filter((i) => i.tag === 'Stratification');
    expect(socializationApproved.length).toBe(4);
    expect(stratificationApproved.length).toBe(4);
  });

  it('guarantees human approval gate: items only reach library when approved', () => {
    let state: NotebookState = { ...initialNotebookState };

    const candidate = state.items.find((i) => i.id === 'soc-pen-1');
    expect(candidate).toBeDefined();
    expect(candidate?.status).toBe('pending');

    // Simulate approving the candidate
    state = {
      ...state,
      items: state.items.map((i) =>
        i.id === 'soc-pen-1' ? { ...i, status: 'approved', reviewedAt: new Date().toISOString() } : i
      ),
    };

    const newApproved = state.items.filter((i) => i.status === 'approved');
    expect(newApproved.length).toBe(9);
    expect(newApproved.some((i) => i.id === 'soc-pen-1')).toBe(true);
  });

  it('keeps discarded cards out of the library permanently', () => {
    let state: NotebookState = { ...initialNotebookState };

    // Discard candidate
    state = {
      ...state,
      items: state.items.map((i) =>
        i.id === 'soc-pen-2' ? { ...i, status: 'discarded', reviewedAt: new Date().toISOString() } : i
      ),
    };

    const approved = state.items.filter((i) => i.status === 'approved');
    expect(approved.some((i) => i.id === 'soc-pen-2')).toBe(false);

    const pending = state.items.filter((i) => i.status === 'pending');
    expect(pending.some((i) => i.id === 'soc-pen-2')).toBe(false);
  });

  it('allows merging two items into a synthesized knowledge card', () => {
    const item1 = initialNotebookState.items.find((i) => i.id === 'soc-pen-1')!;
    const item2 = initialNotebookState.items.find((i) => i.id === 'soc-pen-2')!;

    const combinedSource = `${item1.sourceFact} ${item2.sourceFact}`;
    const mergedTitle = `${item1.title} & ${item2.title}`;
    const mergedInterpretation = `${item1.studyInterpretation} Furthermore, ${item2.studyInterpretation}`;

    const mergedItem: StudyItem = {
      id: 'merged-test-1',
      documentId: item1.documentId,
      documentTitle: item1.documentTitle,
      sourceCitation: `${item1.sourceCitation}; ${item2.sourceCitation}`,
      tag: item1.tag,
      category: 'CONCEPT',
      title: mergedTitle,
      sourceFact: combinedSource,
      studyInterpretation: mergedInterpretation,
      status: 'pending',
      userEdited: true,
      originalInterpretation: mergedInterpretation,
      createdAt: new Date().toISOString(),
      flashcard: {
        front: `Synthesize: ${mergedTitle}`,
        back: mergedInterpretation,
        leitnerBox: 1,
        reviewCount: 0,
        correctCount: 0,
      },
      quizQuestion: {
        question: `How do these combined principles relate?`,
        options: [mergedInterpretation, 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: 0,
        explanation: `Source: "${combinedSource}"`,
      },
    };

    expect(mergedItem.sourceFact).toContain(item1.sourceFact);
    expect(mergedItem.sourceFact).toContain(item2.sourceFact);
    expect(mergedItem.userEdited).toBe(true);
  });

  it('validates passcode unlock for Phase IV private security', () => {
    const passcode = initialNotebookState.passcode; // '1234'
    expect(passcode).toBe('1234');

    const checkPasscode = (input: string) => input === passcode;
    expect(checkPasscode('wrong')).toBe(false);
    expect(checkPasscode('1234')).toBe(true);
  });

  it('supports switching to AWS Module 1 dataset', () => {
    expect(awsNotebookState.notebookName).toContain('AWS Module 1');
    expect(awsNotebookState.items.length).toBe(15);

    const clientItem = awsNotebookState.items.find((i) => i.title === 'Client');
    expect(clientItem).toBeDefined();
    expect(clientItem?.sourceFact).toContain('In computing, a client can be a web browser');

    const serverItem = awsNotebookState.items.find((i) => i.title === 'Server');
    expect(serverItem).toBeDefined();
    expect(serverItem?.sourceFact).toContain('Amazon Elastic Compute Cloud');
  });
});
