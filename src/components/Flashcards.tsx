import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  Sparkles,
  Layers,
  Keyboard,
} from 'lucide-react';
import { StudyItem } from '../types';
import { playTone } from '../utils/sound';
import confetti from 'canvas-confetti';

interface FlashcardsProps {
  items: StudyItem[];
  onUpdateItemProgress: (itemId: string, leitnerBox: number, wasCorrect: boolean) => void;
  targetItemId?: string | null;
  onClearTargetItem?: () => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({
  items,
  onUpdateItemProgress,
  targetItemId,
  onClearTargetItem,
}) => {
  const approvedItems = useMemo(
    () => items.filter((i) => i.status === 'approved'),
    [items]
  );

  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [boxFilter, setBoxFilter] = useState<'all' | 'due' | 'mastered'>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showSource, setShowSource] = useState<boolean>(false);

  const tags = useMemo(
    () => ['All', ...Array.from(new Set(approvedItems.map((i) => i.tag)))],
    [approvedItems]
  );

  const activeTag = tags.includes(selectedTag) ? selectedTag : 'All';

  const dueCount = useMemo(
    () =>
      approvedItems.filter(
        (i) => (activeTag === 'All' || i.tag === activeTag) && (i.flashcard.leitnerBox || 1) <= 2
      ).length,
    [approvedItems, activeTag]
  );

  const masteredCount = useMemo(
    () =>
      approvedItems.filter(
        (i) => (activeTag === 'All' || i.tag === activeTag) && (i.flashcard.leitnerBox || 1) >= 3
      ).length,
    [approvedItems, activeTag]
  );

  const totalTagCount = dueCount + masteredCount;

  const deck = useMemo(() => {
    return approvedItems.filter((i) => {
      const matchesTag = activeTag === 'All' || i.tag === activeTag;
      const box = i.flashcard.leitnerBox || 1;
      const matchesBox =
        boxFilter === 'all' ||
        (boxFilter === 'due' && box <= 2) ||
        (boxFilter === 'mastered' && box >= 3);
      return matchesTag && matchesBox;
    });
  }, [approvedItems, activeTag, boxFilter]);

  const safeIndex = deck.length > 0 ? Math.min(currentIndex, deck.length - 1) : 0;

  // If a target item was specified from Library, navigate to it
  useEffect(() => {
    if (targetItemId) {
      setSelectedTag('All');
      setBoxFilter('all');
      const idx = approvedItems.findIndex((i) => i.id === targetItemId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setIsFlipped(false);
        setShowSource(false);
      }
      onClearTargetItem?.();
    }
  }, [targetItemId, approvedItems, onClearTargetItem]);

  const currentItem = deck[safeIndex];

  const handleFlip = () => {
    playTone('flip');
    setIsFlipped((prev) => !prev);
  };

  const handleRate = (deltaBox: number) => {
    if (!currentItem || deck.length === 0) return;
    const currentBox = currentItem.flashcard.leitnerBox || 1;
    const newBox = deltaBox < 0 ? 1 : Math.max(1, Math.min(5, currentBox + deltaBox));
    onUpdateItemProgress(currentItem.id, newBox, deltaBox > 0);
    playTone('approve');

    if (safeIndex >= deck.length - 1) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }

    setIsFlipped(false);
    setShowSource(false);
    setCurrentIndex((safeIndex + 1) % deck.length);
  };

  const handleNext = () => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setShowSource(false);
    setCurrentIndex((safeIndex + 1) % deck.length);
  };

  const handlePrev = () => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setShowSource(false);
    setCurrentIndex((safeIndex - 1 + deck.length) % deck.length);
  };

  // Keyboard controls for rapid study
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (deck.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setShowSource((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRate(-1);
        else if (e.key === '2') handleRate(0);
        else if (e.key === '3') handleRate(1);
        else if (e.key === '4') handleRate(2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, safeIndex, deck]);

  if (approvedItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F7EFE1] text-[#8C5209] flex items-center justify-center">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#1A1815] mb-2">
          Your Flashcard Deck is Waiting
        </h2>
        <p className="text-sm text-[#7A7264] max-w-md mx-auto mb-6">
          Approve items from the Review Queue first. Only cards you have personally verified enter your active recall deck.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-10 px-4 sm:px-6">
      {/* Header & Tag Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1A1815]">
            Recall Practice
          </h2>
          <p className="text-xs text-[#7A7264]">
            {deck.length > 0
              ? `Card ${safeIndex + 1} of ${deck.length} • Strictly verified from your notes`
              : 'No cards in this box filter'}
          </p>
        </div>

        {/* Tag & Leitner Filters */}
        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-[#8C8477]" />
            {tags.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => {
                  setSelectedTag(t);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setShowSource(false);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTag === t
                    ? 'bg-[#1A1815] text-[#FAF7F0]'
                    : 'bg-[#EDE7DA] text-[#6B6355] hover:bg-[#E2DAC9]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
            {[
              { id: 'all', label: `All Boxes (${totalTagCount})` },
              { id: 'due', label: `Box 1-2 (${dueCount})` },
              { id: 'mastered', label: `Box 3-5 (${masteredCount})` },
            ].map((b) => (
              <button
                type="button"
                key={b.id}
                onClick={() => {
                  setBoxFilter(b.id as 'all' | 'due' | 'mastered');
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                  boxFilter === b.id
                    ? 'bg-[#784004] text-white'
                    : 'bg-[#F2ECE0] text-[#5A5348] hover:bg-[#E8DFCF]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E5DFD3] h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-[#2B5738] h-full transition-all duration-300"
          style={{ width: deck.length > 0 ? `${((safeIndex + 1) / deck.length) * 100}%` : '0%' }}
        />
      </div>

      {deck.length === 0 ? (
        <div className="p-10 text-center bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl">
          <p className="text-sm text-[#7A7264] mb-4">
            No cards match the selected Leitner box filter.
          </p>
          <button
            type="button"
            onClick={() => setBoxFilter('all')}
            className="px-4 py-2 bg-[#1A1815] text-white rounded-lg text-xs font-semibold"
          >
            Show All Boxes
          </button>
        </div>
      ) : (
        currentItem && (
          <div className="perspective-1000 mb-6">
            <div
              onClick={handleFlip}
              className={`min-h-[340px] p-6 sm:p-8 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-md select-none relative ${
                isFlipped
                  ? 'bg-[#FAF7F0] border-[#C05621]/40 shadow-lg'
                  : 'bg-[#FAF7F0] border-[#E8E2D5] hover:border-[#DACFB8]'
              }`}
            >
              {/* Top Bar on Card */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E6EFF8] text-[#1D4E89] border border-[#CCDCEE]">
                    {currentItem.tag}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F7EFE1] text-[#8C5209] border border-[#ECD9BC]">
                    {currentItem.category}
                  </span>
                </div>

                {/* Leitner Box Level */}
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#8C5209] bg-[#F7EFE1] px-2.5 py-0.5 rounded-full border border-[#ECD9BC] shrink-0">
                  <Sparkles className="w-3 h-3 text-[#C05621]" />
                  <span>Box {currentItem.flashcard.leitnerBox || 1}/5</span>
                </div>
              </div>

              {/* Main Center Content */}
              <div className="py-8 text-center">
                {!isFlipped ? (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#8C8477] mb-3">
                      PROMPT / QUESTION
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1815] leading-snug">
                      {currentItem.flashcard.front}
                    </h3>
                    <div className="text-xs text-[#8C8477] mt-6 flex items-center justify-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Space or Click anywhere to reveal verified answer</span>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <div className="text-xs font-bold uppercase tracking-widest text-[#2B5738] mb-3">
                      GROUNDED ANSWER &amp; INTERPRETATION
                    </div>
                    <p className="text-lg md:text-xl font-normal text-[#1A1815] leading-relaxed max-w-xl mx-auto">
                      {currentItem.flashcard.back}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 border-t border-[#EAE4D7] flex items-center justify-between text-xs text-[#7A7264] gap-2">
                <div className="flex items-center gap-1.5 truncate max-w-xs">
                  <FileText className="w-3.5 h-3.5 text-[#A89F90] shrink-0" />
                  <span className="truncate">{currentItem.sourceCitation}</span>
                </div>
                <div className="text-[11px] text-[#8C8477] flex items-center gap-1 shrink-0">
                  <Keyboard className="w-3 h-3" />
                  <span>[Space] flip &bull; [S] source</span>
                </div>
              </div>
            </div>

            {/* Toggle Verbatim Source Quote Drawer */}
            <div className="mt-4 mb-6">
              <button
                type="button"
                onClick={() => setShowSource(!showSource)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-[#784004] bg-[#F7EFE1] hover:bg-[#F2E5D0] border border-[#ECD9BC] transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showSource ? 'Hide Source Excerpt' : 'Show Verbatim Source Excerpt [S]'}</span>
              </button>

              {showSource && (
                <div className="mt-2 p-4 bg-[#F7EFE2] border border-[#E8DCBE] rounded-xl animate-fade-in text-xs text-[#2C2824] leading-relaxed">
                  <span className="font-bold uppercase tracking-wider text-[#9A3412] block mb-1">
                    Original Source Sentence:
                  </span>
                  <p className="italic font-serif">&ldquo;{currentItem.sourceFact}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Self-Rating Controls (Spaced Repetition) */}
            {isFlipped ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fade-in">
                <button
                  type="button"
                  onClick={() => handleRate(-1)}
                  className="py-3 px-2 bg-[#FCE8E8] hover:bg-[#F9D2D2] text-[#8C2C2C] border border-[#F2B6B6] rounded-xl text-xs font-bold transition-all text-center"
                >
                  <div>Again <kbd className="font-mono text-[10px] opacity-75">[1]</kbd></div>
                  <div className="text-[10px] font-normal text-[#9B3838]">Reset Box 1</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(0)}
                  className="py-3 px-2 bg-[#FAF4EA] hover:bg-[#F2E5D0] text-[#8C5209] border border-[#ECDDC8] rounded-xl text-xs font-bold transition-all text-center"
                >
                  <div>Hard <kbd className="font-mono text-[10px] opacity-75">[2]</kbd></div>
                  <div className="text-[10px] font-normal text-[#784004]">Keep Box</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(1)}
                  className="py-3 px-2 bg-[#E7F0E9] hover:bg-[#D5E7D8] text-[#2B5738] border border-[#BDDDC2] rounded-xl text-xs font-bold transition-all text-center"
                >
                  <div>Good <kbd className="font-mono text-[10px] opacity-75">[3]</kbd></div>
                  <div className="text-[10px] font-normal text-[#1E3F27]">Advance +1</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(2)}
                  className="py-3 px-2 bg-[#D1E7DD] hover:bg-[#BCE0CE] text-[#0F5132] border border-[#A3D7BD] rounded-xl text-xs font-bold transition-all text-center"
                >
                  <div>Easy <kbd className="font-mono text-[10px] opacity-75">[4]</kbd></div>
                  <div className="text-[10px] font-normal text-[#0A3622]">+2 Boxes</div>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-4 py-2 bg-[#FAF7F0] hover:bg-[#F2ECE0] text-[#4A4338] border border-[#DDD5C7] rounded-xl text-xs font-medium transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev [&larr;]</span>
                </button>

                <button
                  type="button"
                  onClick={handleFlip}
                  className="px-6 py-2.5 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Reveal Answer [Space]
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 bg-[#FAF7F0] hover:bg-[#F2ECE0] text-[#4A4338] border border-[#DDD5C7] rounded-xl text-xs font-medium transition-colors"
                >
                  <span>Next [&rarr;]</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
