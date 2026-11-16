import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Trophy,
  Keyboard,
} from 'lucide-react';
import { StudyItem } from '../types';
import { playTone } from '../utils/sound';
import confetti from 'canvas-confetti';

interface QuickQuizProps {
  items: StudyItem[];
  targetItemId?: string | null;
  onClearTargetItem?: () => void;
  onRecordQuizResult?: (score: number, total: number) => void;
}

export const QuickQuiz: React.FC<QuickQuizProps> = ({
  items,
  targetItemId,
  onClearTargetItem,
  onRecordQuizResult,
}) => {
  const approved = useMemo(
    () => items.filter((i) => i.status === 'approved'),
    [items]
  );

  const [quizScope, setQuizScope] = useState<'full' | 'quick5' | 'missed'>('full');
  const [missedDeckIds, setMissedDeckIds] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [missedItemIds, setMissedItemIds] = useState<string[]>([]);

  const quizDeck = useMemo(() => {
    if (quizScope === 'missed' && missedDeckIds.length > 0) {
      return approved.filter((i) => missedDeckIds.includes(i.id));
    }
    if (quizScope === 'quick5') {
      return approved.slice(0, 5);
    }
    return approved;
  }, [approved, quizScope, missedDeckIds]);

  const safeIdx = quizDeck.length > 0 ? Math.min(currentIdx, quizDeck.length - 1) : 0;

  // If a target item was chosen from Library
  useEffect(() => {
    if (targetItemId) {
      setQuizScope('full');
      const idx = approved.findIndex((i) => i.id === targetItemId);
      if (idx !== -1) {
        setCurrentIdx(idx);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsComplete(false);
      }
      onClearTargetItem?.();
    }
  }, [targetItemId, approved, onClearTargetItem]);

  const currentItem = quizDeck[safeIdx];
  const question = currentItem?.quizQuestion;

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !question || !currentItem) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === question.correctOptionIndex;
    if (isCorrect) {
      playTone('correct');
      setScore((prev) => prev + 1);
    } else {
      playTone('wrong');
      setMissedItemIds((prev) =>
        prev.includes(currentItem.id) ? prev : [...prev, currentItem.id]
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
      onRecordQuizResult?.(score, quizDeck.length);
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (isComplete || quizDeck.length === 0) return;

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
  }, [isAnswered, isComplete, safeIdx, quizDeck, question, score]);

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

  const handleRestart = (scope: 'full' | 'quick5' | 'missed' = 'full') => {
    if (scope === 'missed') {
      setMissedDeckIds([...missedItemIds]);
    } else {
      setMissedDeckIds([]);
    }
    setQuizScope(scope);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
    setMissedItemIds([]);
  };

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
          <h2 className="text-3xl font-serif font-bold text-[#1A1815] mb-2">
            Quiz Completed!
          </h2>
          <div className="text-5xl font-serif font-bold text-[#2B5738] mb-2">
            {percentage}%
          </div>
          <p className="text-sm text-[#7A7264] mb-6">
            You answered {score} of {total} questions correctly based strictly on your source notes.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => handleRestart('full')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Full Quiz</span>
            </button>

            {missedItems.length > 0 && (
              <button
                type="button"
                onClick={() => handleRestart('missed')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C05621] hover:bg-[#9C4215] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Missed ({missedItems.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Missed Questions Breakdown */}
        {missedItems.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-[#E8E2D5]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9A3412]">
              Review Missed Items &amp; Source Citations
            </h3>
            {missedItems.map((m) => (
              <div key={m.id} className="p-4 bg-[#FAF7F0] border border-[#E8DCBE] rounded-2xl text-xs space-y-2">
                <div className="font-serif font-bold text-sm text-[#1A1815]">{m.title}</div>
                <div className="text-[#2B5738] font-medium">
                  Correct Answer: {m.quizQuestion.options[m.quizQuestion.correctOptionIndex]}
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
    <div className="max-w-2xl mx-auto py-8 sm:py-10 px-4 sm:px-6">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1A1815]">
            Source-Grounded Quick Quiz
          </h2>
          <p className="text-xs text-[#7A7264]">
            Question {safeIdx + 1} of {quizDeck.length} &bull; Score: {score}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {approved.length > 5 && (
            <div className="flex items-center gap-1 bg-[#EDE7DA] p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => handleRestart('quick5')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  quizScope === 'quick5' ? 'bg-[#1A1815] text-white' : 'text-[#5A5348]'
                }`}
              >
                Quick 5
              </button>
              <button
                type="button"
                onClick={() => handleRestart('full')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  quizScope === 'full' ? 'bg-[#1A1815] text-white' : 'text-[#5A5348]'
                }`}
              >
                All ({approved.length})
              </button>
            </div>
          )}

          {currentItem && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E6EFF8] text-[#1D4E89]">
              {currentItem.tag}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E5DFD3] h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-[#2B5738] h-full transition-all duration-300"
          style={{ width: `${((safeIdx + 1) / quizDeck.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      {currentItem && question && (
        <div className="p-6 sm:p-7 bg-[#FAF7F0] border border-[#E8E2D5] rounded-3xl shadow-sm mb-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#8C8477] mb-2">
            {currentItem.category} CHECK
          </div>
          <h3 className="text-xl font-serif font-bold text-[#1A1815] leading-snug mb-6">
            {question.question}
          </h3>

          {/* 4 Multi-Choice Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              let optionStyles = 'bg-[#F5F2EB] border-[#DDD5C7] text-[#2C2824] hover:bg-[#ECE6DB]';

              if (isAnswered) {
                if (idx === question.correctOptionIndex) {
                  optionStyles = 'bg-[#E7F0E9] border-[#A3D7BD] text-[#0F5132] font-semibold ring-1 ring-[#2B5738]';
                } else if (idx === selectedOption) {
                  optionStyles = 'bg-[#FCE8E8] border-[#F2B6B6] text-[#8C2C2C] font-semibold';
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
                  {isAnswered && idx === question.correctOptionIndex && (
                    <CheckCircle2 className="w-5 h-5 text-[#2B5738] shrink-0 mt-0.5" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== question.correctOptionIndex && (
                    <XCircle className="w-5 h-5 text-[#8C2C2C] shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Verbatim Ground Truth Citation Feedback */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-[#F7EFE2] border border-[#E8DCBE] animate-fade-in text-xs leading-relaxed text-[#2C2824] mb-6">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#9A3412] mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified From Source Notes:</span>
              </div>
              <p className="italic font-serif">&ldquo;{currentItem.sourceFact}&rdquo;</p>
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
      )}
    </div>
  );
};
