import React, { useState } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  ShieldCheck,
  Trophy
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
  const approved = items.filter((i) => i.status === 'approved');

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [missedItemIds, setMissedItemIds] = useState<string[]>([]);

  // If a target item was chosen from Library
  React.useEffect(() => {
    if (targetItemId) {
      const idx = approved.findIndex((i) => i.id === targetItemId);
      if (idx !== -1) {
        setCurrentIdx(idx);
        setSelectedOption(null);
        setIsAnswered(false);
      }
      onClearTargetItem?.();
    }
  }, [targetItemId, approved, onClearTargetItem]);

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

  const currentItem = approved[currentIdx];
  const question = currentItem.quizQuestion;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === question.correctOptionIndex;
    if (isCorrect) {
      playTone('correct');
      setScore((prev) => prev + 1);
    } else {
      playTone('wrong');
      setMissedItemIds((prev) => [...prev, currentItem.id]);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < approved.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
      onRecordQuizResult?.(score + (selectedOption === question.correctOptionIndex ? 1 : 0), approved.length);
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
    setMissedItemIds([]);
  };

  if (isComplete) {
    const finalScore = score;
    const total = approved.length;
    const percentage = Math.round((finalScore / total) * 100);

    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F7EFE1] text-[#8C5209] flex items-center justify-center">
          <Trophy className="w-8 h-8 text-[#C05621]" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#1A1815] mb-2">
          Quiz Completed!
        </h2>
        <div className="text-5xl font-serif font-bold text-[#2B5738] mb-2">
          {percentage}%
        </div>
        <p className="text-sm text-[#7A7264] mb-8">
          You answered {finalScore} of {total} questions correctly based strictly on your source notes.
        </p>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Quiz</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1A1815]">
            Source-Grounded Quick Quiz
          </h2>
          <p className="text-xs text-[#7A7264]">
            Question {currentIdx + 1} of {approved.length} • Score: {score}
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E6EFF8] text-[#1D4E89]">
          {currentItem.tag}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E5DFD3] h-1.5 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-[#2B5738] h-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / approved.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-7 bg-[#FAF7F0] border border-[#E8E2D5] rounded-3xl shadow-sm mb-6">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#8C8477] mb-2">
          {currentItem.category} CHECK
        </div>
        <h3 className="text-xl font-serif font-bold text-[#1A1815] leading-snug mb-6">
          {question.question}
        </h3>

        {/* 4 Multi-Choice Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, idx) => {
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
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-start justify-between gap-3 ${optionStyles}`}
              >
                <span>{option}</span>
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
            <p className="italic font-serif">"{currentItem.sourceFact}"</p>
          </div>
        )}

        {/* Next Question Button */}
        {isAnswered && (
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <span>{currentIdx + 1 < approved.length ? 'Next Question' : 'Finish Quiz'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
