import { StudyItem, ItemCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface ExtractionResult {
  items: StudyItem[];
  documentId: string;
  documentTitle: string;
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
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for',
    'with', 'by', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'this', 'that',
    'these', 'those', 'it', 'its', 'as', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does'
  ]);

  const cleanWords = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

  const sourceWords = new Set(cleanWords(sourceFact));
  const interpWords = cleanWords(interpretation);

  if (interpWords.length === 0) {
    return { groundedScore: 1, unsupportedWords: [], isSuspicious: false, message: 'Source text and interpretation match.' };
  }

  // Count how many substantive words in interpretation can be stemmed or matched directly to source
  const stem = (w: string) => w.replace(/(ing|ed|es|s|tion|ly|ment|al|ive)$/, '');
  const sourceStems = new Set(Array.from(sourceWords).map(stem));

  const unsupported: string[] = [];
  let supportedCount = 0;

  for (const word of interpWords) {
    const s = stem(word);
    if (sourceWords.has(word) || sourceStems.has(s)) {
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
  const docId = `doc-${Date.now().toString(36)}`;
  let currentHeading = options.courseTopic || 'General Study';

  const processedChunks: Array<{
    sentence: string;
    heading: string;
    category: ItemCategory;
  }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect headings
    if (line.startsWith('#') || line.endsWith(':') || (line.length < 50 && !line.endsWith('.'))) {
      currentHeading = line.replace(/^[#*\-0-9.\s]+/, '').replace(/:$/, '').trim() || currentHeading;
      continue;
    }

    // Split paragraphs into clear sentences
    const sentences = line.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [line];

    for (const rawSentence of sentences) {
      const sentence = rawSentence.trim();
      if (sentence.length < 20) continue; // Skip trivial fragments

      // Determine category based on syntax and keywords
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

      processedChunks.push({
        sentence,
        heading: currentHeading,
        category,
      });
    }
  }

  // Generate grounded StudyItems
  for (let idx = 0; idx < processedChunks.length; idx++) {
    const chunk = processedChunks[idx];
    const sentence = chunk.sentence;

    // Generate crisp title
    let title = '';
    const colonSplit = sentence.split(/[:—–-]/);
    if (colonSplit.length > 1 && colonSplit[0].trim().length < 40 && colonSplit[0].trim().length > 3) {
      title = colonSplit[0].trim();
    } else {
      const words = sentence.split(/\s+/).slice(0, 5).join(' ');
      title = words.replace(/[^a-zA-Z0-9\s]$/, '');
    }

    // Generate clean study interpretation strictly based on source sentence
    let interpretation = sentence;
    if (chunk.category === 'KEY TERM' && sentence.includes('refers to')) {
      interpretation = sentence.replace(/.*refers to\s+/i, 'Refers to: ');
    } else if (chunk.category === 'LECTURE CLAIM' && sentence.includes('argued that')) {
      interpretation = sentence.replace(/.*argued that\s+/i, 'Key claim: ');
    } else if (chunk.category === 'HOW-TO') {
      interpretation = `Procedure: ${sentence}`;
    } else if (chunk.category === 'QUESTION') {
      interpretation = `Investigation prompt: ${sentence}`;
    }

    // Flashcard formulation
    const flashcardFront = chunk.category === 'QUESTION'
      ? sentence
      : `Explain the source concept: "${title}"`;
    const flashcardBack = interpretation;

    // Distractor generation for quiz
    const quizOptions = [
      interpretation,
      `Opposite assertion: The contrary condition holds true in this system.`,
      `Extraneous assumption not documented in the provided notes.`,
      `Generic unrelated claim regarding alternative historical topics.`
    ];

    // Shuffle options so correct is not always first
    const correctIndex = (idx % 3);
    const temp = quizOptions[0];
    quizOptions[0] = quizOptions[correctIndex];
    quizOptions[correctIndex] = temp;

    const item: StudyItem = {
      id: `item-${Date.now().toString(36)}-${idx}`,
      documentId: docId,
      documentTitle: options.documentTitle,
      sourceCitation: `${chunk.heading} | ${options.fileName}`,
      tag: chunk.heading.split(/[\s-]/)[0] || 'Core',
      category: chunk.category,
      title: title.charAt(0).toUpperCase() + title.slice(1),
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
