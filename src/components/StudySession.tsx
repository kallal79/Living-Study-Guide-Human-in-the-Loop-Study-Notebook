import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Check, RefreshCw, Eye } from 'lucide-react';
import { NotebookState, StudySessionLog } from '../types';
import { playTone } from '../utils/sound';
import confetti from 'canvas-confetti';

interface StudySessionProps {
  state: NotebookState;
  onRecordSession: (session: StudySessionLog) => void;
  setActiveTab: (tab: string) => void;
}

export const StudySession: React.FC<StudySessionProps> = ({
  state,
  onRecordSession,
  setActiveTab,
}) => {
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [sessionNotes, setSessionNotes] = useState('');
  const [completed, setCompleted] = useState(false);

  const approvedCards = useMemo(
    () => state.items.filter((i) => i.status === 'approved'),
    [state.items]
  );
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [spotlightRevealed, setSpotlightRevealed] = useState(false);
  const [spotlightSourceOpen, setSpotlightSourceOpen] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => sec - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      setIsActive(false);
      setCompleted(true);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      playTone('approve');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining]);

  const toggleTimer = () => {
    setIsActive((prev) => !prev);
  };

  const resetTimer = (mins: number) => {
    setIsActive(false);
    setDurationMinutes(mins);
    setSecondsRemaining(mins * 60);
    setCompleted(false);
  };

  const toggleStep = (stepNum: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) next.delete(stepNum);
      else next.add(stepNum);
      return next;
    });
  };

  const handleFinishSession = () => {
    const secondsElapsed = Math.max(0, durationMinutes * 60 - secondsRemaining);
    const elapsedMinutes =
      secondsElapsed > 0 ? Math.max(1, Math.round(secondsElapsed / 60)) : durationMinutes;
    const log: StudySessionLog = {
      id: `session-${Date.now().toString(36)}`,
      date: new Date().toISOString(),
      durationMinutes: elapsedMinutes,
      itemsReviewed: state.items.filter((i) => i.status === 'approved').length,
      quizScore: 0,
      quizTotal: 0,
      notes: sessionNotes.trim() || `Completed ${elapsedMinutes}m focused ${state.activeTopic} study routine.`,
    };
    onRecordSession(log);
    setCompleted(false);
    setSessionNotes('');
    setActiveTab('understanding');
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formatTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const pendingCount = state.items.filter((i) => i.status === 'pending').length;
  const approvedCount = approvedCards.length;
  const spotlightItem =
    approvedCards.length > 0 ? approvedCards[spotlightIndex % approvedCards.length] : null;

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-[#1A1815] mb-2">
          Focused Study Session
        </h2>
        <p className="text-sm text-[#7A7264]">
          A calm, structured routine connecting your verified source facts to active recall.
        </p>
      </div>

      {/* Main Timer Display */}
      <div className="p-6 sm:p-8 bg-[#FAF7F0] border border-[#E8E2D5] rounded-3xl shadow-sm text-center mb-8">
        {/* Duration selector */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {[5, 15, 25, 45].map((mins) => (
            <button
              type="button"
              key={mins}
              onClick={() => resetTimer(mins)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                durationMinutes === mins
                  ? 'bg-[#1A1815] text-[#FAF7F0]'
                  : 'bg-[#EDE7DA] text-[#6B6355] hover:bg-[#E2DAC9]'
              }`}
            >
              {mins} Minutes
            </button>
          ))}
        </div>

        {/* Big Digit Countdown */}
        <div className="text-6xl md:text-7xl font-serif font-bold text-[#1A1815] tracking-tight mb-6">
          {formatTime}
        </div>

        {/* Play/Pause & Complete Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
              isActive
                ? 'bg-[#C05621] hover:bg-[#A34415] text-white'
                : 'bg-[#2B5738] hover:bg-[#22452D] text-white'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Session</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => resetTimer(durationMinutes)}
            className="p-3 bg-[#FAF7F0] hover:bg-[#F2ECE0] text-[#6B6355] border border-[#DDD5C7] rounded-2xl transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {!completed && (
            <button
              type="button"
              onClick={() => {
                setIsActive(false);
                setCompleted(true);
                playTone('approve');
              }}
              className="flex items-center gap-1.5 px-4 py-3 bg-[#EAE3D2] hover:bg-[#E2D8C3] text-[#2C2824] border border-[#D5C9B4] rounded-2xl text-xs font-semibold transition-colors"
            >
              <Check className="w-4 h-4 text-[#2B5738]" />
              <span>Log Session Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Spotlight Recall Card while Studying */}
      {spotlightItem && (
        <div className="p-5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl mb-8 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#2B5738]">
              SPOTLIGHT RECALL CARD ({(spotlightIndex % approvedCards.length) + 1}/{approvedCards.length})
            </span>
            <button
              type="button"
              onClick={() => {
                setSpotlightIndex((i) => (i + 1) % approvedCards.length);
                setSpotlightRevealed(false);
                setSpotlightSourceOpen(false);
                playTone('flip');
              }}
              className="flex items-center gap-1 text-xs font-semibold text-[#8C5209] hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Next Card</span>
            </button>
          </div>
          <h4 className="text-lg font-serif font-bold text-[#1A1815] mb-2">
            {spotlightItem.flashcard.front}
          </h4>
          {spotlightRevealed && (
            <p className="text-sm text-[#2C2824] bg-[#F2F0E8] border border-[#E2DBD0] p-3 rounded-xl mb-3 animate-fade-in">
              {spotlightItem.studyInterpretation}
            </p>
          )}
          {spotlightSourceOpen && (
            <p className="text-xs italic font-serif text-[#4A4338] bg-[#F7EFE2] border border-[#E8DCBE] p-3 rounded-xl mb-3 animate-fade-in">
              &ldquo;{spotlightItem.sourceFact}&rdquo;
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                playTone('flip');
                setSpotlightRevealed((prev) => !prev);
              }}
              className="px-3 py-1.5 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-lg text-xs font-semibold transition-colors"
            >
              {spotlightRevealed ? 'Hide Answer' : 'Reveal Answer'}
            </button>
            <button
              type="button"
              onClick={() => setSpotlightSourceOpen((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#F7EFE1] hover:bg-[#F2E5D0] text-[#784004] border border-[#ECD9BC] rounded-lg text-xs font-semibold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{spotlightSourceOpen ? 'Hide Source' : 'Source Quote'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Guided 3-Step Routine */}
      <div className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#8C8477] mb-4">
          Recommended Session Routine
        </h3>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-[#F5F2EB] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleStep(1)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                  checkedSteps.has(1)
                    ? 'bg-[#2B5738] text-white'
                    : 'bg-[#EAE3D2] text-[#8C5209]'
                }`}
              >
                {checkedSteps.has(1) ? <Check className="w-3.5 h-3.5" /> : '1'}
              </button>
              <div>
                <div className={`text-xs font-semibold ${checkedSteps.has(1) ? 'line-through text-[#8C8477]' : 'text-[#1A1815]'}`}>
                  Inspect Review Queue ({pendingCount} pending)
                </div>
                <div className="text-[11px] text-[#7A7264]">
                  Compare source sentences with AI interpretations and approve them.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className="text-xs font-semibold text-[#8C5209] hover:underline shrink-0"
            >
              Open Queue &rarr;
            </button>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-[#F5F2EB] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleStep(2)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                  checkedSteps.has(2)
                    ? 'bg-[#2B5738] text-white'
                    : 'bg-[#EAE3D2] text-[#2B5738]'
                }`}
              >
                {checkedSteps.has(2) ? <Check className="w-3.5 h-3.5" /> : '2'}
              </button>
              <div>
                <div className={`text-xs font-semibold ${checkedSteps.has(2) ? 'line-through text-[#8C8477]' : 'text-[#1A1815]'}`}>
                  Active Recall with Flashcards ({approvedCount} approved)
                </div>
                <div className="text-[11px] text-[#7A7264]">
                  Practice 5-10 cards without flipping immediately to build retention.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('flashcards')}
              className="text-xs font-semibold text-[#2B5738] hover:underline shrink-0"
            >
              Open Cards &rarr;
            </button>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-[#F5F2EB] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleStep(3)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                  checkedSteps.has(3)
                    ? 'bg-[#2B5738] text-white'
                    : 'bg-[#EAE3D2] text-[#C05621]'
                }`}
              >
                {checkedSteps.has(3) ? <Check className="w-3.5 h-3.5" /> : '3'}
              </button>
              <div>
                <div className={`text-xs font-semibold ${checkedSteps.has(3) ? 'line-through text-[#8C8477]' : 'text-[#1A1815]'}`}>
                  Source-Grounded Quick Quiz
                </div>
                <div className="text-[11px] text-[#7A7264]">
                  Answer multiple-choice questions with verified citations.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className="text-xs font-semibold text-[#C05621] hover:underline shrink-0"
            >
              Open Quiz &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {completed && (
        <div className="p-6 bg-[#E7F0E9] border border-[#BDDDC2] rounded-2xl animate-fade-in mb-8">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-6 h-6 text-[#2B5738]" />
            <h4 className="text-base font-serif font-bold text-[#1B4D29]">
              Session Ready to Log
            </h4>
          </div>
          <p className="text-xs text-[#2B5738] mb-4">
            Great work staying grounded in the material. Add any quick reflections below to save to your Understanding dashboard.
          </p>
          <input
            type="text"
            placeholder="Notes or takeaway (e.g. Mastered Mead's looking-glass self steps)"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#BDDDC2] rounded-lg text-xs text-[#1A1815] mb-4 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleFinishSession}
            className="px-4 py-2 bg-[#2B5738] hover:bg-[#22452D] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Log Session &amp; Update Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
