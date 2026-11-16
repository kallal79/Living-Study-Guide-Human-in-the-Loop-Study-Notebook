import React from 'react';
import { 
  ArrowRight, 
  CheckSquare, 
  Library as LibraryIcon, 
  Layers, 
  HelpCircle, 
  Clock, 
  Sparkles, 
  ShieldCheck,
  Upload
} from 'lucide-react';
import { NotebookState } from '../types';

interface OverviewProps {
  state: NotebookState;
  setActiveTab: (tab: string) => void;
  onOpenUploader: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  state,
  setActiveTab,
  onOpenUploader,
}) => {
  const pendingItems = state.items.filter((i) => i.status === 'pending');
  const approvedItems = state.items.filter((i) => i.status === 'approved');

  const pendingCount = pendingItems.length;
  const approvedCount = approvedItems.length;

  return (
    <div className="max-w-4xl mx-auto py-10 px-8">
      {/* Category Tagline matching Screenshot 3 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-[#C05621]" />
        <span className="text-xs font-bold tracking-widest uppercase text-[#8C8477]">
          {state.studyGoal === 'exam_review' && 'STRATIFICATION EXAM REVIEW'}
          {state.studyGoal === 'concept_recall' && 'CONCEPT RECALL WORKSPACE'}
          {state.studyGoal === 'meeting_prep' && 'PRACTICAL MEETING PREP'}
          {state.studyGoal === 'practical_howto' && 'HOW-TO SYSTEM GUIDE'}
        </span>
      </div>

      {/* Big Serif Heading matching Screenshot 3 */}
      <h1 className="text-4xl md:text-5xl font-serif font-normal text-[#1A1815] tracking-tight leading-tight mb-4">
        {state.activeTopic === 'Socialization & Stratification' 
          ? 'Explain inequality from the source.'
          : `Master ${state.activeTopic} from the source.`}
      </h1>

      <p className="text-lg text-[#5A5348] font-normal leading-relaxed mb-8 max-w-2xl">
        Review definitions, compare systems and resources, and practice connecting individual outcomes to larger institutions.
      </p>

      {/* Next Up Hero Card matching Screenshot 3 */}
      {pendingCount > 0 ? (
        <div 
          onClick={() => setActiveTab('review')}
          className="mb-8 p-5 bg-[#FAF4EA] border border-[#ECDDC8] rounded-2xl flex items-center justify-between cursor-pointer hover:bg-[#F5ECE0] transition-all shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#EFE3CF] text-[#9A3412] rounded-xl group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-[#8C5209]">
                NEXT UP
              </div>
              <div className="text-sm font-semibold text-[#1A1815]">
                Review one candidate &rarr;
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8C5209] group-hover:translate-x-1 transition-transform" />
        </div>
      ) : (
        <div className="mb-8 p-5 bg-[#F2F7F3] border border-[#CCE2D2] rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#DCEDE0] text-[#1B4D29] rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-[#1B4D29]">
                QUEUE CLEAR
              </div>
              <div className="text-sm font-semibold text-[#1A1815]">
                All candidates have been approved or inspected!
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('library')}
            className="text-xs font-semibold text-[#1B4D29] hover:underline flex items-center gap-1"
          >
            Go to Library &rarr;
          </button>
        </div>
      )}

      {/* Two Metric Cards matching Screenshot 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {/* Needs your eye */}
        <div 
          onClick={() => setActiveTab('review')}
          className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl hover:border-[#DACFB8] transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#6B6355]">Needs your eye</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#C05621]" />
          </div>
          <div className="text-4xl font-serif font-bold text-[#1A1815] mb-2 group-hover:text-[#9A3412] transition-colors">
            {pendingCount}
          </div>
          <div className="text-xs text-[#7C7265] flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-[#C05621]" />
            <span>Items waiting beside their source sentence</span>
          </div>
        </div>

        {/* In your library */}
        <div 
          onClick={() => setActiveTab('library')}
          className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl hover:border-[#DACFB8] transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#6B6355]">In your library</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#2B5738]" />
          </div>
          <div className="text-4xl font-serif font-bold text-[#1A1815] mb-2 group-hover:text-[#2B5738] transition-colors">
            {approvedCount}
          </div>
          <div className="text-xs text-[#7C7265] flex items-center gap-1.5">
            <LibraryIcon className="w-3.5 h-3.5 text-[#2B5738]" />
            <span>Approved knowledge cards ready for recall</span>
          </div>
        </div>
      </div>

      {/* Workflow Explainer Banner matching Image 2 */}
      <div className="p-6 bg-[#F4EFE6] border border-[#E3D9C8] rounded-2xl mb-10">
        <div className="flex items-start gap-4">
          <span className="p-2 rounded-xl bg-[#E8DECE] text-[#784004] mt-0.5">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[11px] font-bold tracking-widest uppercase text-[#784004] mb-1">
              NOTHING SAVES WITHOUT A CHECK
            </div>
            <p className="text-sm text-[#4A4338] leading-relaxed mb-3">
              Each item arrives with the sentence it came from, so checking it takes seconds. A knowledge base built without that step fills up with confident summaries nobody can trace.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-[#FAF7F0] text-[#5C5549] border border-[#E0D8C8]">
                1. Read source fact
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#FAF7F0] text-[#5C5549] border border-[#E0D8C8]">
                2. Verify accuracy
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#FAF7F0] text-[#5C5549] border border-[#E0D8C8]">
                3. Decide: Approve, Edit, or Discard
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Study Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('flashcards')}
          className="p-4 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl hover:bg-[#F2ECE0] text-left transition-all"
        >
          <Layers className="w-5 h-5 text-[#8C5209] mb-2" />
          <div className="text-sm font-semibold text-[#1A1815]">Practice Flashcards</div>
          <div className="text-xs text-[#6B6355] mt-1">Flip through verified terms</div>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className="p-4 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl hover:bg-[#F2ECE0] text-left transition-all"
        >
          <HelpCircle className="w-5 h-5 text-[#2B5738] mb-2" />
          <div className="text-sm font-semibold text-[#1A1815]">Take Quick Quiz</div>
          <div className="text-xs text-[#6B6355] mt-1">Test source-grounded recall</div>
        </button>

        <button
          onClick={onOpenUploader}
          className="p-4 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl hover:bg-[#F2ECE0] text-left transition-all"
        >
          <Upload className="w-5 h-5 text-[#C05621] mb-2" />
          <div className="text-sm font-semibold text-[#1A1815]">Ingest New Material</div>
          <div className="text-xs text-[#6B6355] mt-1">Paste lecture notes or text</div>
        </button>
      </div>
    </div>
  );
};

