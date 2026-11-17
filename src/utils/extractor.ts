import { StudyItem, ItemCategory } from '../types';

export interface ExtractionResult {
  items: StudyItem[];
  documentId: string;
  documentTitle: string;
}

export const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for',
  'with', 'by', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under', 'again', 'further',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'this', 'that',
  'these', 'those', 'it', 'its', 'as', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'our', 'their', 'they', 'we', 'you', 'without', 'across', 'while', 'whether', 'rather', 'vs',
  'versus', 'often', 'also', 'may', 'might', 'can', 'could', 'would', 'within', 'among', 'across',
]);

export function stemWord(w: string): string {
  return w.replace(/(izations?|ations?|ities|ness|ment|ings?|able|ible|ence|ance|ive|ous|ing|ed|es|ly|al|s)$/, '');
}

function wordsMatchCognate(word: string, sourceWords: Set<string>, sourceStems: Set<string>): boolean {
  const s = stemWord(word);
  if (sourceWords.has(word) || sourceStems.has(s)) return true;
  if (s.length >= 4) {
    const prefix = s.slice(0, 5);
    for (const sw of sourceStems) {
      if (sw.length >= 4 && (sw.startsWith(prefix) || s.startsWith(sw.slice(0, 5)))) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Returns token-by-token grounding annotations for visual rendering in the UI.
 */
export function getGroundedTokens(sourceFact: string, interpretation: string): Array<{
  text: string;
  isGrounded: boolean;
  isStopWord: boolean;
}> {
  const clean = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sourceWords = sourceFact
    .split(/\s+/)
    .map(clean)
    .filter(Boolean);

  const sourceSet = new Set(sourceWords);
  const sourceStems = new Set(sourceWords.map(stemWord));

  const tokens = interpretation.split(/(\s+|[.,;!?]+)/);

  return tokens.map((token) => {
    const cleaned = clean(token);
    if (!cleaned) {
      return { text: token, isGrounded: true, isStopWord: false };
    }
    const isStop = STOP_WORDS.has(cleaned);
    const isGrounded = isStop || wordsMatchCognate(cleaned, sourceSet, sourceStems);

    return {
      text: token,
      isGrounded,
      isStopWord: isStop,
    };
  });
}

/**
 * Checks whether words or assertions in interpretation are supported by sourceFact.
 * Returns a score between 0 and 1, plus any words not found in the source text.
 */
export function verifyGroundedness(sourceFact: string, interpretation: string): {
  groundedScore: number;
  unsupportedWords: string[];
  isSuspicious: boolean;
  message: string;
} {
  const cleanWords = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const sourceWords = new Set(cleanWords(sourceFact));
  const interpWords = cleanWords(interpretation);

  if (interpWords.length === 0) {
    return { groundedScore: 1, unsupportedWords: [], isSuspicious: false, message: 'Source text and interpretation match.' };
  }

  const sourceStems = new Set(Array.from(sourceWords).map(stemWord));

  const unsupported: string[] = [];
  let supportedCount = 0;

  for (const word of interpWords) {
    if (wordsMatchCognate(word, sourceWords, sourceStems)) {
      supportedCount++;
    } else {
      unsupported.push(word);
    }
  }

  const score = Math.round((supportedCount / interpWords.length) * 100) / 100;
  // If 3+ substantive words are missing from source, or >35% of content is outside assertions:
  const isSuspicious = unsupported.length >= 3 || (unsupported.length >= 2 && score <= 0.65);

  let message = 'Faithfully grounded in your source excerpt.';
  if (isSuspicious) {
    message = `Caution: Interpretation contains ${unsupported.length} concepts not present in the source sentence.`;
  } else if (unsupported.length > 0) {
    message = 'Grounded interpretation with conceptual synthesis.';
  }

  return {
    groundedScore: score,
    unsupportedWords: Array.from(new Set(unsupported)),
    isSuspicious,
    message,
  };
}

let idSequence = 0;

export function getExtractionSummary(items: StudyItem[]): {
  total: number;
  byCategory: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  }
  return { total: items.length, byCategory };
}

/**
 * Intelligent parser that extracts concepts, terminology, systems, processes,
 * how-to instructions, and questions to investigate from raw study notes.
 */
export function extractStudyItemsFromText(
  rawText: string,
  options: {
    documentTitle: string;
    courseTopic: string;
    fileName: string;
    studyGoal?: 'exam_review' | 'concept_recall' | 'meeting_prep' | 'practical_howto';
  }
): StudyItem[] {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items: StudyItem[] = [];
  const docId = `doc-${Date.now().toString(36)}-${++idSequence}`;
  let currentHeading = options.courseTopic || 'General Study';

  const processedChunks: Array<{
    sentence: string;
    heading: string;
    category: ItemCategory;
    title: string;
    interpretation: string;
  }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect headings (# Header, or Header:)
    if (line.startsWith('#') || (line.endsWith(':') && line.length < 50) || (line.length < 40 && !line.includes('.') && !line.includes(':'))) {
      currentHeading = line.replace(/^[#*\-0-9.\s]+/, '').replace(/:$/, '').trim() || currentHeading;
      continue;
    }

    // Strip lecture timestamps like [05:22] and explicit speaker labels like "Professor:"
    const hasTimestamp = /^\[\d{1,2}:\d{2}(?::\d{2})?\]\s*/.test(line);
    let cleanLine = line.replace(/^\[\d{1,2}:\d{2}(?::\d{2})?\]\s*/, '');
    if (hasTimestamp) {
      cleanLine = cleanLine.replace(/^[A-Za-z\s.]{2,30}:\s*/, '');
    } else {
      cleanLine = cleanLine.replace(/^(?:Professor|Lecturer|Speaker|Host|Instructor|Moderator)\s*:\s*/i, '');
    }

    // Check if line is a bullet/key-term definition: "- Term: Definition", "**Term**: Definition", or "Term: Definition"
    const defMatch = cleanLine.match(/^[-*•]?\s*(?:\*\*)?([A-Za-z0-9\s—–'-]{3,35})(?:\*\*)?\s*(?::|—|–|\s-\s)\s+(.+)$/);
    if (defMatch && !defMatch[1].toLowerCase().startsWith('http')) {
      const termTitle = defMatch[1].trim();
      const termBody = defMatch[2].trim();
      if (termBody.length >= 15) {
        processedChunks.push({
          sentence: cleanLine.replace(/^[-*•]\s*/, '').replace(/\*\*/g, ''),
          heading: currentHeading,
          category: termBody.toLowerCase().startsWith('to ') || termBody.toLowerCase().includes('step') ? 'HOW-TO' : 'KEY TERM',
          title: termTitle,
          interpretation: termBody,
        });
        continue;
      }
    }

    // Split paragraphs into sentences
    const sentences = cleanLine.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [cleanLine];

    for (const rawSentence of sentences) {
      const sentence = rawSentence.replace(/^[-*•0-9.)\s]+/, '').trim();
      if (sentence.length < 20) continue; // Skip trivial fragments

      // Categorize based on keywords and syntax
      let category: ItemCategory = 'CONCEPT';
      const lower = sentence.toLowerCase();

      if (sentence.endsWith('?') || lower.startsWith('can ') || lower.startsWith('why ') || lower.startsWith('how does ') || lower.startsWith('is ')) {
        category = 'QUESTION';
      } else if (lower.startsWith('to ') || lower.includes('how to') || lower.includes('step ') || lower.includes('steps:') || lower.includes('in order to')) {
        category = 'HOW-TO';
      } else if (lower.includes('process') || lower.includes('occurs in') || lower.includes('continues through') || lower.includes('leads to') || lower.includes('develops through')) {
        category = 'PROCESS';
      } else if (lower.includes('system') || lower.includes('matrix') || lower.includes('framework') || lower.includes('architecture') || lower.includes('infrastructure')) {
        category = 'SYSTEM';
      } else if (lower.includes('defined as') || lower.includes('refers to') || lower.includes('introduced the') || lower.includes('is a type of') || lower.includes('is called')) {
        category = 'KEY TERM';
      } else if (lower.includes('argued that') || lower.includes('demonstrates that') || lower.includes('claims that') || lower.includes('suggests that') || lower.includes('debate whether')) {
        category = 'LECTURE CLAIM';
      }

      // Generate crisp title
      let title = '';
      const colonSplit = sentence.split(/[:—–-]/);
      if (colonSplit.length > 1 && colonSplit[0].trim().length < 40 && colonSplit[0].trim().length > 3) {
        title = colonSplit[0].trim();
      } else {
        const words = sentence.split(/\s+/).slice(0, 5).join(' ');
        title = words.replace(/[^a-zA-Z0-9\s]$/, '');
      }

      // Generate clean study interpretation
      let interpretation = sentence;
      if (category === 'KEY TERM' && sentence.includes('refers to')) {
        interpretation = sentence.replace(/.*refers to\s+/i, 'Refers to: ');
      } else if (category === 'LECTURE CLAIM' && sentence.includes('argued that')) {
        interpretation = sentence.replace(/.*argued that\s+/i, 'Key claim: ');
      } else if (category === 'HOW-TO') {
        interpretation = `Procedure: ${sentence}`;
      } else if (category === 'QUESTION') {
        interpretation = `Investigation prompt: ${sentence}`;
      }

      processedChunks.push({
        sentence,
        heading: currentHeading,
        category,
        title: title.charAt(0).toUpperCase() + title.slice(1),
        interpretation,
      });
    }
  }

  // Pre-collect all interpretations to serve as high-quality distractors
  const allInterpretations = processedChunks.map((c) => c.interpretation);

  // Build StudyItems
  for (let idx = 0; idx < processedChunks.length; idx++) {
    const chunk = processedChunks[idx];
    const { sentence, heading, category, title, interpretation } = chunk;

    // Flashcard formulation
    const flashcardFront = category === 'QUESTION'
      ? sentence
      : `Explain the source concept: "${title}"`;
    const flashcardBack = interpretation;

    // Build 3 unique context-aware distractors from sibling items with distinct fallbacks
    const siblingDistractors = Array.from(
      new Set(allInterpretations.filter((interp) => interp !== interpretation))
    );
    const fallbackDistractors = [
      'Opposite assertion: The contrary condition holds true in this system.',
      'Extraneous assumption not documented anywhere in your provided notes.',
      'Alternative theory unrelated to the concepts presented in this source.',
    ];
    const distractors: string[] = [];
    for (let k = 0; k < siblingDistractors.length && distractors.length < 3; k++) {
      distractors.push(siblingDistractors[(idx + k) % siblingDistractors.length]);
    }
    for (const fb of fallbackDistractors) {
      if (distractors.length >= 3) break;
      if (!distractors.includes(fb) && fb !== interpretation) {
        distractors.push(fb);
      }
    }

    const quizOptions = [interpretation, distractors[0], distractors[1], distractors[2]];

    // Shuffle options so correct is not always first
    const correctIndex = idx % 4;
    const temp = quizOptions[0];
    quizOptions[0] = quizOptions[correctIndex];
    quizOptions[correctIndex] = temp;

    const cleanTag =
      heading.length <= 24 ? heading : heading.split(/[\s-]+/).slice(0, 2).join(' ') || 'Core';

    const item: StudyItem = {
      id: `item-${Date.now().toString(36)}-${++idSequence}-${idx}`,
      documentId: docId,
      documentTitle: options.documentTitle,
      sourceCitation: `${heading} | ${options.fileName}`,
      tag: cleanTag,
      category,
      title,
      sourceFact: sentence,
      studyInterpretation: interpretation,
      status: 'pending', // Starts in the Review Queue! "NOTHING SAVES WITHOUT A CHECK"
      userEdited: false,
      originalInterpretation: interpretation,
      createdAt: new Date().toISOString(),
      flashcard: {
        front: flashcardFront,
        back: flashcardBack,
        leitnerBox: 1,
        reviewCount: 0,
        correctCount: 0,
      },
      quizQuestion: {
        question: `According to your notes: ${title}?`,
        options: quizOptions,
        correctOptionIndex: correctIndex,
        explanation: `Source Fact: "${sentence}"`
      }
    };

    items.push(item);
  }

  return items;
}
