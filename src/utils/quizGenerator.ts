import { GeneratedQuizQuestion, QuizQuestionFormat, StudyItem } from '../types';
import { STOP_WORDS } from './extractor';

export interface QuizGenerationOptions {
  count?: number;
  tag?: string;
  style?: QuizQuestionFormat | 'mixed';
  excludeSignatures?: string[];
  targetItemId?: string | null;
  seed?: number;
}

export const FORMAT_LABELS: Record<QuizQuestionFormat, string> = {
  core_mcq: 'CORE CHECK',
  source_evidence: 'SOURCE EVIDENCE',
  concept_recall: 'CONCEPT MATCH',
  quote_cloze: 'SOURCE CLOZE',
  grounding_check: 'GROUNDING CHECK',
};

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleOptionsWithAnswer(options: string[], correctIndex: number): {
  options: string[];
  correctOptionIndex: number;
} {
  const tagged = options.map((text, idx) => ({
    text,
    isCorrect: idx === correctIndex,
  }));
  const shuffled = shuffleArray(tagged);
  return {
    options: shuffled.map((o) => o.text),
    correctOptionIndex: Math.max(
      0,
      shuffled.findIndex((o) => o.isCorrect)
    ),
  };
}

function pickDistinctDistractors(
  correctValue: string,
  pool: string[],
  fallbacks: string[],
  needed = 3
): string[] {
  const uniquePool = shuffleArray(
    Array.from(new Set(pool.filter((v) => v && v.trim() !== correctValue.trim())))
  );
  const picked: string[] = [];
  for (const candidate of uniquePool) {
    if (picked.length >= needed) break;
    picked.push(candidate);
  }
  for (const fb of fallbacks) {
    if (picked.length >= needed) break;
    if (fb !== correctValue && !picked.includes(fb)) {
      picked.push(fb);
    }
  }
  return picked.slice(0, needed);
}

function extractClozeKeyword(item: StudyItem): string | null {
  const words = item.sourceFact
    .replace(/["'“”(),.;:!?]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 5 && !STOP_WORDS.has(w.toLowerCase()));

  if (words.length === 0) return null;

  const titleWords = new Set(
    item.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 5)
  );

  const matchingTitleWord = words.find((w) => titleWords.has(w.toLowerCase()));
  if (matchingTitleWord) return matchingTitleWord;

  // Pick a substantive word from the middle/later half of the quote
  const midIdx = Math.min(words.length - 1, Math.floor(words.length / 2));
  return words[midIdx];
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildQuestionForFormat(
  item: StudyItem,
  format: QuizQuestionFormat,
  allApproved: StudyItem[],
  attemptId: string
): GeneratedQuizQuestion {
  const siblingItems = allApproved.filter((other) => other.id !== item.id);

  if (format === 'concept_recall' && siblingItems.length >= 1) {
    const distractors = pickDistinctDistractors(
      item.title,
      siblingItems.map((s) => s.title),
      [
        'Unverified External Hypothesis',
        'Unrelated Institutional Anecdote',
        'Opposite Theoretical Assumption',
      ]
    );
    const { options, correctOptionIndex } = shuffleOptionsWithAnswer(
      [item.title, ...distractors],
      0
    );
    return {
      id: `${item.id}-concept_recall-${attemptId}`,
      itemId: item.id,
      title: item.title,
      tag: item.tag,
      category: item.category,
      format: 'concept_recall',
      formatLabel: FORMAT_LABELS.concept_recall,
      question: `Which concept from your ${item.tag} notes matches this verified interpretation?`,
      promptContext: item.studyInterpretation,
      options,
      correctOptionIndex,
      explanation: item.quizQuestion.explanation || `Source Fact: "${item.sourceFact}"`,
      sourceFact: item.sourceFact,
      sourceCitation: item.sourceCitation,
      signature: `${item.id}:concept_recall`,
    };
  }

  if (format === 'quote_cloze') {
    const targetWord = extractClozeKeyword(item);
    if (targetWord) {
      const maskedFact = item.sourceFact.replace(
        new RegExp(`\\b${escapeRegExp(targetWord)}\\b`),
        '________'
      );
      if (maskedFact.includes('________')) {
        const siblingWords: string[] = [];
        for (const sib of siblingItems) {
          const w = extractClozeKeyword(sib);
          if (w && w.toLowerCase() !== targetWord.toLowerCase()) {
            siblingWords.push(w);
          }
        }
        const distractors = pickDistinctDistractors(
          targetWord,
          siblingWords,
          ['assumption', 'fragment', 'hypothesis']
        );
        const { options, correctOptionIndex } = shuffleOptionsWithAnswer(
          [targetWord, ...distractors],
          0
        );
        return {
          id: `${item.id}-quote_cloze-${attemptId}`,
          itemId: item.id,
          title: item.title,
          tag: item.tag,
          category: item.category,
          format: 'quote_cloze',
          formatLabel: FORMAT_LABELS.quote_cloze,
          question: `Fill in the missing keyword from your verified notes on "${item.title}":`,
          promptContext: maskedFact,
          options,
          correctOptionIndex,
          explanation: `Source Fact: "${item.sourceFact}"`,
          sourceFact: item.sourceFact,
          sourceCitation: item.sourceCitation,
          signature: `${item.id}:quote_cloze`,
        };
      }
    }
    // Fall back to source_evidence if quote had no suitable cloze token
    format = 'source_evidence';
  }

  if (format === 'grounding_check') {
    const oppositeClaim = `Over-extrapolated claim: Adds unverified external causes beyond what "${item.title}" states.`;
    const speculativeClaim = `Unchecked summary: Assumes universal exceptions not documented in this excerpt.`;
    const siblingInterp =
      siblingItems.length > 0
        ? siblingItems[Math.floor(Math.random() * siblingItems.length)].studyInterpretation
        : `Unrelated note from a different course module.`;

    const distractors = pickDistinctDistractors(
      item.studyInterpretation,
      [oppositeClaim, speculativeClaim, siblingInterp],
      [
        'Fabricated detail not written in the original source.',
        'Speculative footnote added without evidence.',
        'Contradicts the verbatim quote in the notes.',
      ]
    );
    const { options, correctOptionIndex } = shuffleOptionsWithAnswer(
      [item.studyInterpretation, ...distractors],
      0
    );
    return {
      id: `${item.id}-grounding_check-${attemptId}`,
      itemId: item.id,
      title: item.title,
      tag: item.tag,
      category: item.category,
      format: 'grounding_check',
      formatLabel: FORMAT_LABELS.grounding_check,
      question: `Human-in-the-loop check: Which takeaway stays strictly faithful to this source quote without adding outside assumptions?`,
      promptContext: `"${item.sourceFact}"`,
      options,
      correctOptionIndex,
      explanation: `Verified Interpretation: ${item.studyInterpretation}`,
      sourceFact: item.sourceFact,
      sourceCitation: item.sourceCitation,
      signature: `${item.id}:grounding_check`,
    };
  }

  if (format === 'source_evidence') {
    const distractors = pickDistinctDistractors(
      item.studyInterpretation,
      siblingItems.map((s) => s.studyInterpretation),
      [
        'This relationship operates independently of the conditions noted in the source.',
        'The source notes specifically reject this claim as unsupported.',
        'An unrelated assumption not present in your study material.',
      ]
    );
    const { options, correctOptionIndex } = shuffleOptionsWithAnswer(
      [item.studyInterpretation, ...distractors],
      0
    );
    return {
      id: `${item.id}-source_evidence-${attemptId}`,
      itemId: item.id,
      title: item.title,
      tag: item.tag,
      category: item.category,
      format: 'source_evidence',
      formatLabel: FORMAT_LABELS.source_evidence,
      question: `Which explanation is directly grounded in your verified notes for "${item.title}"?`,
      options,
      correctOptionIndex,
      explanation: `Source Fact: "${item.sourceFact}"`,
      sourceFact: item.sourceFact,
      sourceCitation: item.sourceCitation,
      signature: `${item.id}:source_evidence`,
    };
  }

  // Default: 'core_mcq' — dynamically reshuffle original A/B/C/D options every run
  const { options, correctOptionIndex } = shuffleOptionsWithAnswer(
    item.quizQuestion.options,
    item.quizQuestion.correctOptionIndex
  );
  return {
    id: `${item.id}-core_mcq-${attemptId}`,
    itemId: item.id,
    title: item.title,
    tag: item.tag,
    category: item.category,
    format: 'core_mcq',
    formatLabel: FORMAT_LABELS.core_mcq,
    question: item.quizQuestion.question,
    options,
    correctOptionIndex,
    explanation: item.quizQuestion.explanation || `Source Fact: "${item.sourceFact}"`,
    sourceFact: item.sourceFact,
    sourceCitation: item.sourceCitation,
    signature: `${item.id}:core_mcq`,
  };
}

const ALL_FORMATS: QuizQuestionFormat[] = [
  'core_mcq',
  'source_evidence',
  'concept_recall',
  'quote_cloze',
  'grounding_check',
];

/**
 * Generates a freshly varied, non-repeating set of source-grounded quiz questions.
 * Rotates question formats (`core_mcq`, `source_evidence`, `concept_recall`,
 * `quote_cloze`, `grounding_check`), shuffles item order, and shuffles A/B/C/D
 * options on every invocation.
 */
export function generateDynamicQuiz(
  items: StudyItem[],
  options: QuizGenerationOptions = {}
): GeneratedQuizQuestion[] {
  const approvedAll = items.filter((i) => i.status === 'approved');
  if (approvedAll.length === 0) return [];

  const filtered =
    options.tag && options.tag !== 'All'
      ? approvedAll.filter((i) => i.tag === options.tag)
      : approvedAll;

  if (filtered.length === 0) return [];

  const excludeSet = new Set(options.excludeSignatures || []);
  const attemptId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  let orderedPool = shuffleArray(filtered);
  if (options.targetItemId) {
    const target = filtered.find((i) => i.id === options.targetItemId);
    if (target) {
      orderedPool = [target, ...orderedPool.filter((i) => i.id !== target.id)];
    }
  }

  const limit =
    options.count && options.count > 0
      ? Math.min(options.count, orderedPool.length)
      : orderedPool.length;
  const chosenItems = orderedPool.slice(0, limit);

  return chosenItems.map((item, idx) => {
    let chosenFormat: QuizQuestionFormat;

    if (options.style && options.style !== 'mixed') {
      chosenFormat = options.style;
    } else {
      // Pick formats not yet seen in previous quiz attempts for maximum variety
      const unseenFormats = ALL_FORMATS.filter(
        (fmt) => !excludeSet.has(`${item.id}:${fmt}`)
      );
      const candidates = unseenFormats.length > 0 ? unseenFormats : ALL_FORMATS;
      const offset = (options.seed ?? Math.floor(Math.random() * candidates.length)) + idx;
      chosenFormat = candidates[offset % candidates.length];
    }

    return buildQuestionForFormat(item, chosenFormat, approvedAll, attemptId);
  });
}
