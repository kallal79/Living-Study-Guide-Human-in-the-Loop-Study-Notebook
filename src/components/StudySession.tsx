import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
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
  const [ambientSound, setAmbientSound] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
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
    setIsActive(!isActive);
  };

  const resetTimer = (mins: number) => {
    setIsActive(false);
    setDurationMinutes(mins);
    setSecondsRemaining(mins * 60);
    setCompleted(false);
  };

  const handleFinishSession = () => {
    const log: StudySessionLog = {
      id: `session-${Date.now().toString(36)}`,
      date: new Date().toISOString(),
      durationMinutes,
      itemsReviewed: state.items.filter((i) => i.status === 'approved').length,
      quizScore: 5,
      quizTotal: 5,
      notes: sessionNotes || 'Focused study and recall session completed.',
    };
    onRecordSession(log);
    setCompleted(false);
    setActiveTab('understanding');
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formatTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const pendingCount = state.items.filter((i) => i.status === 'pending').length;
  const approvedCount = state.items.filter((i) => i.status === 'approved').length;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
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
      <div className="p-8 bg-[#FAF7F0] border border-[#E8E2D5] rounded-3xl shadow-sm text-center mb-8">
        {/* Duration selector */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[15, 25, 45].map((mins) => (
            <button
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

        {/* Play/Pause & Reset Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
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
            onClick={() => resetTimer(durationMinutes)}
            className="p-3 bg-[#FAF7F0] hover:bg-[#F2ECE0] text-[#6B6355] border border-[#DDD5C7] rounded-2xl transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guided 3-Step Routine */}
      <div className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#8C8477] mb-4">
          Recommended Session Routine
        </h3>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-[#F5F2EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#EAE3D2] text-[#8C5209] flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <div className="text-xs font-semibold text-[#1A1815]">
                  Inspect Review Queue ({pendingCount} pending)
                </div>
                <div className="text-[11px] text-[#7A7264]">
                  Compare source sentences with AI interpretations and approve them.
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('review')}
              className="text-xs font-semibold text-[#8C5209] hover:underline"
            >
              Open Queue &rarr;
            </button>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-[#F5F2EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#EAE3D2] text-[#2B5738] flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <div className="text-xs font-semibold text-[#1A1815]">
                  Active Recall with Flashcards ({approvedCount} approved)
                </div>
                <div className="text-[11px] text-[#7A7264]">
                  Practice 5-10 cards without flipping immediately to build retention.
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('flashcards')}
              className="text-xs font-semibold text-[#2B5738] hover:underline"
            >
              Open Cards &rarr;
            </button>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-[#F5F2EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#EAE3D2] text-[#C05621] flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <div className="text-xs font-semibold text-[#1A1815]">
                  Source-Grounded Quick Quiz
                </div>
                <div className="text-[11px] text-[#7A7264]">
                  Answer multiple-choice questions with verified citations.
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('quiz')}
              className="text-xs font-semibold text-[#C05621] hover:underline"
            >
              Open Quiz &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Completion Modal / Banner */}
      {completed && (
        <div className="p-6 bg-[#E7F0E9] border border-[#BDDDC2] rounded-2xl animate-fade-in mb-8">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-6 h-6 text-[#2B5738]" />
            <h4 className="text-base font-serif font-bold text-[#1B4D29]">
              Session Finished!
            </h4>
          </div>
          <p className="text-xs text-[#2B5738] mb-4">
            Great work staying grounded in the material. Add any quick reflections below to save to your habit dashboard.
          </p>
          <input
            type="text"
            placeholder="Notes or takeaway (e.g. Mastered Mead's looking-glass self steps)"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#BDDDC2] rounded-lg text-xs text-[#1A1815] mb-4 focus:outline-none"
          />
          <button
            onClick={handleFinishSession}
            className="px-4 py-2 bg-[#2B5738] hover:bg-[#22452D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Log Session & Update Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
