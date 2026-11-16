export type ItemCategory = 
  | 'CONCEPT'
  | 'LECTURE CLAIM'
  | 'KEY TERM'
  | 'SYSTEM'
  | 'PROCESS'
  | 'HOW-TO'
  | 'QUESTION';

export type ItemStatus = 'pending' | 'approved' | 'discarded';

export type QuizQuestionFormat =
  | 'core_mcq'
  | 'source_evidence'
  | 'concept_recall'
  | 'quote_cloze'
  | 'grounding_check'
  | 'source_verify';

export interface GeneratedQuizQuestion {
  id: string;
  itemId: string;
  title: string;
  tag: string;
  category: ItemCategory;
  format: QuizQuestionFormat;
  formatLabel: string;
  question: string;
  promptContext?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  sourceFact: string;
  sourceCitation: string;
  signature: string;
}

export interface StudyItem {
  id: string;
  documentId: string;
  documentTitle: string;
  sourceCitation: string;
  tag: string;
  category: ItemCategory;
  title: string;
  sourceFact: string; // The verbatim sentence(s) from notes
  studyInterpretation: string; // The grounded AI interpretation
  status: ItemStatus;
  userEdited: boolean;
  originalInterpretation: string;
  createdAt: string;
  reviewedAt?: string;
  flashcard: {
    front: string;
    back: string;
    leitnerBox: number; // 1 to 5
    nextReviewDate?: string;
    reviewCount: number;
    correctCount: number;
  };
  quizQuestion: {
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  };
}

export interface SourceDocument {
  id: string;
  title: string;
  courseTopic: string;
  fileName: string;
  rawContent: string;
  uploadedAt: string;
  totalExtracted: number;
  approvedCount: number;
}

export interface StudySessionLog {
  id: string;
  date: string;
  durationMinutes: number;
  itemsReviewed: number;
  quizScore: number;
  quizTotal: number;
  notes: string;
}

export interface NotebookState {
  notebookName: string;
  activeTopic: string;
  studyGoal: 'exam_review' | 'concept_recall' | 'meeting_prep' | 'practical_howto';
  isLocked: boolean;
  passcode: string;
  items: StudyItem[];
  documents: SourceDocument[];
  sessions: StudySessionLog[];
  lastBackupDate?: string;
}
