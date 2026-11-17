import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Trophy,
  Keyboard,
  RefreshCw,
  Flame,
  Sparkles,
} from 'lucide-react';
import { GeneratedQuizQuestion, QuizQuestionFormat, StudyItem } from '../types';
import { playTone } from '../utils/sound';
import { fetchGeneratedQuiz } from '../utils/storage';
import { generateDynamicQuiz } from '../utils/quizGenerator';
import confetti from 'canvas-confetti';

interface QuickQuizProps {
  items: StudyItem[];
  targetItemId?: string | null;
  onClearTargetItem?: () => void;
  onRecordQuizResult?: (score: number, total: number, details?: string) => void;
  isModalBlocked?: boolean;
}

const STYLE_OPTIONS: Array<{ id: QuizQuestionFormat | 'mixed'; label: string }> = [
  { id: 'mixed', label: 'Mixed Variety' },
  { id: 'core_mcq', label: 'Core MCQ' },
  { id: 'concept_recall', label: 'Concept Match' },
  { id: 'quote_cloze', label: 'Fill-in-Blank' },
  { id: 'grounding_check', label: 'Grounding Check' },
  { id: 'source_verify', label: 'Source Verify' },
  { id: 'source_evidence', label: 'Source Evidence' },
];

export const QuickQuiz: React.FC<QuickQuizProps> = ({
  items,
  targetItemId,
  onClearTargetItem,
  onRecordQuizResult,
  isModalBlocked = false,
}) => {
  const approved = useMemo(
    () => items.filter((i) => i.status === 'approved'),
    [items]
  );

  const tags = useMemo(
    () => ['All', ...Array.from(new Set(approved.map((i) => i.tag)))],
    [approved]
  );

  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedStyle, setSelectedStyle] = useState<QuizQuestionFormat | 'mixed'>('mixed');
  const [quizScope, setQuizScope] = useState<'full' | 'quick5'>('full');
  const [quizDeck, setQuizDeck] = useState<GeneratedQuizQuestion[]>(() =>
    generateDynamicQuiz(approved, { style: 'mixed' })
  );
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [generationSource, setGenerationSource] = useState<'api' | 'local'>('local');
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [missedItemIds, setMissedItemIds] = useState<string[]>([]);
  const [answerHistory, setAnswerHistory] = useState<
    Array<{ question: GeneratedQuizQuestion; selectedIdx: number; isCorrect: boolean }>
  >([]);
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const [isMissedOnlyMode, setIsMissedOnlyMode] = useState(false);

  const seenSignaturesRef = useRef<string[]>([]);
  const mountedRef = useRef(false);
  const requestSeqRef = useRef(0);

  const activeTag = tags.includes(selectedTag) ? selectedTag : 'All';

  const loadFreshQuiz = useCallback(
    async (opts?: {
      tag?: string;
      style?: QuizQuestionFormat | 'mixed';
      scope?: 'full' | 'quick5';
      focusItemId?: string | null;
      incrementAttempt?: boolean;
      onlyItemIds?: string[];
    }) => {
      if (approved.length === 0) {
        setQuizDeck([]);
        return;
      }

      const reqId = ++requestSeqRef.current;
      const tag = opts?.tag ?? activeTag;
      const style = opts?.style ?? selectedStyle;
      const scope = opts?.scope ?? quizScope;
      const sourcePool = opts?.onlyItemIds
        ? items.filter((i) => i.status === 'approved' && opts.onlyItemIds!.includes(i.id))
        : items;

      const count = scope === 'quick5' ? 5 : undefined;
      setIsLoadingQuiz(true);

      const { questions, source } = await fetchGeneratedQuiz(sourcePool, {
        tag,
        style,
        count,
        excludeSignatures: seenSignaturesRef.current,
        targetItemId: opts?.focusItemId ?? null,
      });

      if (reqId !== requestSeqRef.current) return;

      // Remember signatures so the next quiz rotates to different question styles
      const newSignatures = questions.map((q) => q.signature);
      const combined = Array.from(new Set([...seenSignaturesRef.current, ...newSignatures]));
      // Keep sliding window so if all 5 formats for all items were exhausted, rotation continues smoothly
      seenSignaturesRef.current =
        combined.length >= approved.length * 4 ? newSignatures : combined;

      setQuizDeck(questions);
      setGenerationSource(source);
      setIsMissedOnlyMode(Boolean(opts?.onlyItemIds));
      if (opts?.incrementAttempt) {
        setAttemptNumber((n) => n + 1);
      }
      setCurrentIdx(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setIsComplete(false);
      setMissedItemIds([]);
      setAnswerHistory([]);
      setShowFullBreakdown(false);
      setIsLoadingQuiz(false);
    },
    [approved, items, activeTag, selectedStyle, quizScope]
  );

  // Load quiz from API on initial mount or when approved count changes (without overwriting targeted item)
  useEffect(() => {
    if (approved.length === 0) {
      setQuizDeck([]);
      return;
    }
    if (targetItemId) {
      mountedRef.current = true;
      setSelectedTag('All');
      setQuizScope('full');
      loadFreshQuiz({ tag: 'All', scope: 'full', focusItemId: targetItemId });
      onClearTargetItem?.();
      return;
    }
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadFreshQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approved.length, targetItemId]);

  const safeIdx = quizDeck.length > 0 ? Math.min(currentIdx, quizDeck.length - 1) : 0;
  const currentQ = quizDeck[safeIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctOptionIndex;
    setAnswerHistory((prev) => [
      ...prev,
      { question: currentQ, selectedIdx: idx, isCorrect },
    ]);
    if (isCorrect) {
      playTone('correct');
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const nextStreak = prev + 1;
        setBestStreak((b) => Math.max(b, nextStreak));
        return nextStreak;
      });
    } else {
      playTone('wrong');
      setStreak(0);
      setMissedItemIds((prev) =>
        prev.includes(currentQ.itemId) ? prev : [...prev, currentQ.itemId]
      );
    }
  };

  const handleNext = () => {
    if (safeIdx + 1 < quizDeck.length) {
      setCurrentIdx(safeIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
      onRecordQuizResult?.(
        score,
        quizDeck.length,
        `Quiz Attempt #${attemptNumber} (${selectedStyle}): ${score}/${quizDeck.length}`
      );
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isModalBlocked ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }
      if (isComplete || quizDeck.length === 0 || isLoadingQuiz) return;

      if (!isAnswered) {
        if (['1', 'a', 'A'].includes(e.key)) handleSelectOption(0);
        else if (['2', 'b', 'B'].includes(e.key)) handleSelectOption(1);
        else if (['3', 'c', 'C'].includes(e.key)) handleSelectOption(2);
        else if (['4', 'd', 'D'].includes(e.key)) handleSelectOption(3);
      } else {
        if (e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, isComplete, safeIdx, quizDeck, currentQ, score, isLoadingQuiz, isModalBlocked]);

  if (approved.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#E7F0E9] text-[#2B5738] flex items-center justify-center">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#1A1815] mb-2">
          No Approved Cards for Quiz
        </h2>
        <p className="text-sm text-[#7A7264] max-w-md mx-auto mb-6">
          Approve candidate cards in the Review Queue first. The quiz only tests knowledge you have personally verified.
        </p>
      </div>
    );
  }

  if (isComplete) {
    const total = quizDeck.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const missedItems = approved.filter((i) => missedItemIds.includes(i.id));

    return (
      <div className="max-w-2xl mx-auto py-12 px-6 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F7EFE1] text-[#8C5209] flex items-center justify-center">
            <Trophy className="w-8 h-8 text-[#C05621]" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#8C8477] mb-1">
            ATTEMPT #{attemptNumber} {isMissedOnlyMode ? '• MISSED REVIEW' : ''}
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#1A1815] mb-2">
            Quiz Completed!
          </h2>
          <div className="text-5xl font-serif font-bold text-[#2B5738] mb-2">
            {percentage}%
          </div>
          <p className="text-sm text-[#7A7264] mb-2">
            You answered {score} of {total} questions correctly based strictly on your source notes.
          </p>
          {bestStreak >= 2 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-semibold mb-6">
              <Flame className="w-3.5 h-3.5 text-[#C05621]" />
              <span>Best Streak: {bestStreak} in a row</span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => loadFreshQuiz({ incrementAttempt: true })}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate Different Quiz</span>
            </button>

            {missedItems.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  loadFreshQuiz({
                    onlyItemIds: missedItemIds,
                    incrementAttempt: true,
                    scope: 'full',
                  })
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C05621] hover:bg-[#9C4215] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Missed ({missedItems.length})</span>
              </button>
            )}

            {answerHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setShowFullBreakdown((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF7F0] hover:bg-[#EFEAE0] text-[#4A4338] border border-[#DDD5C7] rounded-xl text-xs font-semibold transition-colors"
              >
                <span>{showFullBreakdown ? 'Hide Breakdown' : `Review Answers (${answerHistory.length})`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Optional All-Questions Answer Breakdown */}
        {showFullBreakdown && answerHistory.length > 0 && (
          <div className="space-y-2.5 mb-6 pt-6 border-t border-[#E8E2D5]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2B5738]">
              Full Answer Breakdown &amp; Citations
            </h3>
            {answerHistory.map((entry, idx) => (
              <div
                key={`${entry.question.id}-${idx}`}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  entry.isCorrect
                    ? 'bg-[#E7F0E9]/60 border-[#BDDDC2]'
                    : 'bg-[#FCE8E8]/60 border-[#F2B6B6]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-serif font-bold text-sm text-[#1A1815]">
                    {idx + 1}. {entry.question.title} ({entry.question.formatLabel})
                  </span>
                  <span
                    className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                      entry.isCorrect
                        ? 'bg-[#2B5738] text-white'
                        : 'bg-[#8C2C2C] text-white'
                    }`}
                  >
                    {entry.isCorrect ? 'Correct' : 'Missed'}
                  </span>
                </div>
                <p className="text-[#2C2824]">
                  Answer: <strong>{entry.question.options[entry.question.correctOptionIndex]}</strong>
                </p>
                <p className="italic font-serif text-[#5A5348]">
                  &ldquo;{entry.question.sourceFact}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Missed Questions Breakdown */}
        {missedItems.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-[#E8E2D5]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9A3412]">
              Review Missed Items &amp; Source Citations
            </h3>
            {missedItems.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-[#FAF7F0] border border-[#E8DCBE] rounded-2xl text-xs space-y-2"
              >
                <div className="font-serif font-bold text-sm text-[#1A1815]">{m.title}</div>
                <div className="text-[#2B5738] font-medium">
                  Verified Takeaway: {m.studyInterpretation}
                </div>
                <div className="p-2.5 bg-[#F7EFE2] rounded-lg italic font-serif text-[#4A4338]">
                  &ldquo;{m.sourceFact}&rdquo;
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-10 px-4 sm:px-6">
      {/* Header & Attempt/Streak Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-serif font-bold text-[#1A1815]">
              Source-Grounded Quick Quiz
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E7F0E9] text-[#2B5738] border border-[#BDDDC2]">
              Attempt #{attemptNumber}
            </span>
          </div>
          <p className="text-xs text-[#7A7264] flex items-center gap-2 flex-wrap">
            <span>
              Question {safeIdx + 1} of {quizDeck.length} &bull; Score: {score}
            </span>
            {streak >= 2 && (
              <span className="inline-flex items-center gap-1 text-[#C05621] font-semibold">
                <Flame className="w-3.5 h-3.5" />
                {streak} streak
              </span>
            )}
            <span className="text-[10px] text-[#8C8477]">
              ({generationSource === 'api' ? 'Fresh via /api/quiz/generate' : 'Dynamic local generator'})
            </span>
          </p>
        </div>

        {/* New Quiz Button + Scope Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {approved.length > 5 && (
            <div className="flex items-center gap-1 bg-[#EDE7DA] p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setQuizScope('quick5');
                  loadFreshQuiz({ scope: 'quick5', incrementAttempt: true });
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  quizScope === 'quick5' ? 'bg-[#1A1815] text-white' : 'text-[#5A5348]'
                }`}
              >
                Quick 5
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuizScope('full');
                  loadFreshQuiz({ scope: 'full', incrementAttempt: true });
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  quizScope === 'full' ? 'bg-[#1A1815] text-white' : 'text-[#5A5348]'
                }`}
              >
                All ({approved.length})
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => loadFreshQuiz({ incrementAttempt: true })}
            disabled={isLoadingQuiz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF7F0] hover:bg-[#EFEAE0] text-[#784004] border border-[#DDD5C7] transition-colors disabled:opacity-50"
            title="Fetch a brand-new shuffled set of varied questions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuiz ? 'animate-spin' : ''}`} />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* Topic & Question Format Filter Bar */}
      <div className="p-3.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl mb-5 space-y-2.5">
        {/* Topic Tag Selector */}
        {tags.length > 2 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477] mr-1">
              Topic:
            </span>
            {tags.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => {
                  setSelectedTag(t);
                  loadFreshQuiz({ tag: t, incrementAttempt: true });
                }}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                  activeTag === t
                    ? 'bg-[#1A1815] text-[#FAF7F0]'
                    : 'bg-[#EDE7DA] text-[#6B6355] hover:bg-[#E2DAC9]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Question Format Selector */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477] mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C05621]" />
            Question Style:
          </span>
          {STYLE_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.id}
              onClick={() => {
                setSelectedStyle(opt.id);
                loadFreshQuiz({ style: opt.id, incrementAttempt: true });
              }}
              className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                selectedStyle === opt.id
                  ? 'bg-[#784004] text-white font-semibold'
                  : 'bg-[#F2ECE0] text-[#5A5348] hover:bg-[#E8DFCF]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E5DFD3] h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-[#2B5738] h-full transition-all duration-300"
          style={{
            width: quizDeck.length > 0 ? `${((safeIdx + 1) / quizDeck.length) * 100}%` : '0%',
          }}
        />
      </div>

      {/* Question Card or Empty Fallback */}
      {currentQ ? (
        <div className="p-6 sm:p-7 bg-[#FAF7F0] border border-[#E8E2D5] rounded-3xl shadow-sm mb-6">
          {/* Format, Category & Tag Pills */}
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F7EFE1] text-[#8C5209] border border-[#ECD9BC]">
                {currentQ.formatLabel}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C8477]">
                {currentQ.category}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6EFF8] text-[#1D4E89] border border-[#CCDCEE]">
              {currentQ.tag}
            </span>
          </div>

          <h3 className="text-xl font-serif font-bold text-[#1A1815] leading-snug mb-4">
            {currentQ.question}
          </h3>

          {/* Optional Prompt Context Box (Cloze Quote / Concept Description / Grounding Excerpt) */}
          {currentQ.promptContext && (
            <div className="p-4 mb-5 rounded-2xl bg-[#F7EFE2] border border-[#E8DCBE] text-sm text-[#2C2824] font-serif italic leading-relaxed">
              {currentQ.promptContext.split('________').map((part, idx, arr) => (
                <React.Fragment key={idx}>
                  {part}
                  {idx < arr.length - 1 && (
                    <span
                      className={`inline-block px-3 py-0.5 mx-1 border-b-2 font-mono not-italic text-xs font-bold rounded ${
                        isAnswered
                          ? 'bg-[#E7F0E9] border-[#2B5738] text-[#0F5132]'
                          : 'bg-[#FAF7F0] border-[#C05621] text-[#9A3412]'
                      }`}
                    >
                      {isAnswered ? currentQ.options[currentQ.correctOptionIndex] : '[ ? ]'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* 4 Multi-Choice Options */}
          <div className="space-y-3 mb-6">
            {currentQ.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              let optionStyles = 'bg-[#F5F2EB] border-[#DDD5C7] text-[#2C2824] hover:bg-[#ECE6DB]';

              if (isAnswered) {
                if (idx === currentQ.correctOptionIndex) {
                  optionStyles =
                    'bg-[#E7F0E9] border-[#A3D7BD] text-[#0F5132] font-semibold ring-1 ring-[#2B5738]';
                } else if (idx === selectedOption) {
                  optionStyles =
                    'bg-[#FCE8E8] border-[#F2B6B6] text-[#8C2C2C] font-semibold';
                } else {
                  optionStyles = 'bg-[#F5F2EB] border-[#DDD5C7] text-[#9A9184] opacity-50';
                }
              }

              return (
                <button
                  type="button"
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-start justify-between gap-3 ${optionStyles}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#EAE3D2] text-[#5A5348] flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                      {letter}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isAnswered && idx === currentQ.correctOptionIndex && (
                    <CheckCircle2 className="w-5 h-5 text-[#2B5738] shrink-0 mt-0.5" />
                  )}
                  {isAnswered &&
                    idx === selectedOption &&
                    idx !== currentQ.correctOptionIndex && (
                      <XCircle className="w-5 h-5 text-[#8C2C2C] shrink-0 mt-0.5" />
                    )}
                </button>
              );
            })}
          </div>

          {/* Verbatim Ground Truth Citation Feedback */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-[#F7EFE2] border border-[#E8DCBE] animate-fade-in text-xs leading-relaxed text-[#2C2824] mb-6 space-y-1.5">
              <div className="flex items-center justify-between gap-2 font-bold uppercase tracking-wider text-[#9A3412]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified From Source Notes:</span>
                </div>
                <span className="text-[10px] font-normal text-[#7A7264] truncate max-w-xs">
                  {currentQ.sourceCitation}
                </span>
              </div>
              {currentQ.format === 'source_verify' && currentQ.explanation && (
                <p className="text-[#1A1815] font-medium">{currentQ.explanation}</p>
              )}
              <p className="italic font-serif">&ldquo;{currentQ.sourceFact}&rdquo;</p>
            </div>
          )}

          {/* Next Question Button & Keyboard Hint */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-[#8C8477] flex items-center gap-1">
              <Keyboard className="w-3.5 h-3.5" />
              <span>{!isAnswered ? 'Keys [1-4] or [A-D]' : 'Press [Enter] for Next'}</span>
            </div>

            {isAnswered && (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <span>{safeIdx + 1 < quizDeck.length ? 'Next Question' : 'Finish Quiz'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        !isLoadingQuiz && (
          <div className="p-10 text-center bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl">
            <p className="text-sm text-[#7A7264] mb-4">
              No questions matched your current topic or format filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedTag('All');
                setSelectedStyle('mixed');
                loadFreshQuiz({ tag: 'All', style: 'mixed', incrementAttempt: true });
              }}
              className="px-4 py-2 bg-[#1A1815] text-white text-xs font-semibold rounded-lg"
            >
              Reset Quiz Filters
            </button>
          </div>
        )
      )}
    </div>
  );
};
