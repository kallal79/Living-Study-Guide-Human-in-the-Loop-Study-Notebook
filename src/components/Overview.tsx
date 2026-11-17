import React, { useState } from 'react';
import {
  ArrowRight,
  CheckSquare,
  Library as LibraryIcon,
  Layers,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { NotebookState } from '../types';
import { verifyGroundedness } from '../utils/extractor';

interface OverviewProps {
  state: NotebookState;
  setActiveTab: (tab: string) => void;
  onOpenUploader: () => void;
  onChangeStudyGoal?: (goal: NotebookState['studyGoal']) => void;
}

const GOAL_LABELS: Array<{ id: NotebookState['studyGoal']; label: string }> = [
  { id: 'exam_review', label: 'Exam Review' },
  { id: 'concept_recall', label: 'Concept Recall' },
  { id: 'practical_howto', label: 'Practical How-To' },
  { id: 'meeting_prep', label: 'Meeting Prep' },
];

export const Overview: React.FC<OverviewProps> = ({
  state,
  setActiveTab,
  onOpenUploader,
  onChangeStudyGoal,
}) => {
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  const pendingItems = state.items.filter((i) => i.status === 'pending');
  const approvedItems = state.items.filter((i) => i.status === 'approved');

  const pendingCount = pendingItems.length;
  const approvedCount = approvedItems.length;
  const flaggedPendingCount = pendingItems.filter(
    (i) => verifyGroundedness(i.sourceFact, i.studyInterpretation).isSuspicious
  ).length;

  const isSociology = state.activeTopic === 'Socialization & Stratification';
  const subtitleByGoal: Record<NotebookState['studyGoal'], string> = {
    exam_review: isSociology
      ? 'Review definitions, compare systems and resources, and practice connecting individual outcomes to larger institutions.'
      : `Verify core definitions, practice recall flashcards, and quiz yourself on ${state.activeTopic}.`,
    concept_recall: `Build foundational terminology and verify every generated concept directly beside your ${state.activeTopic} source notes.`,
    meeting_prep: `Review open questions, key decisions, and step-by-step action items grounded in your ${state.activeTopic} notes.`,
    practical_howto: `Inspect step-by-step procedures, systems, and how-to instructions traced back to your ${state.activeTopic} source material.`,
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-10 px-4 sm:px-8">
      {/* Editorial Hero Header */}
      <div className="mb-8">
        {/* Category eyebrow */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#C05621]" />
          <span className="text-xs font-bold tracking-widest uppercase text-[#8C8477]">
            {state.studyGoal === 'exam_review' && (isSociology ? 'STRATIFICATION EXAM REVIEW' : `${state.activeTopic.toUpperCase()} EXAM REVIEW`)}
            {state.studyGoal === 'concept_recall' && 'CONCEPT RECALL WORKSPACE'}
            {state.studyGoal === 'meeting_prep' && 'PRACTICAL MEETING PREP'}
            {state.studyGoal === 'practical_howto' && 'HOW-TO SYSTEM GUIDE'}
          </span>
        </div>

        {/* Page headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#1A1815] tracking-tight leading-tight mb-4">
          {isSociology
            ? 'Explain inequality from the source.'
            : `Master ${state.activeTopic} from the source.`}
        </h1>

        <p className="text-base sm:text-lg text-[#5A5348] font-normal leading-relaxed mb-5 max-w-2xl">
          {subtitleByGoal[state.studyGoal]}
        </p>

        {/* Study focus selector */}
        {onChangeStudyGoal && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#8C8477] mr-1">
              Focus:
            </span>
            {GOAL_LABELS.map((g) => (
              <button
                type="button"
                key={g.id}
                onClick={() => onChangeStudyGoal(g.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  state.studyGoal === g.id
                    ? 'bg-[#1A1815] text-[#FAF7F0] border-[#1A1815] font-semibold'
                    : 'bg-[#FAF7F0] text-[#5C5549] border-[#E0D8C8] hover:bg-[#EFEAE0]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Next candidate prompt */}
      {pendingCount > 0 ? (
        <div
          onClick={() => setActiveTab('review')}
          className="mb-8 p-5 bg-[#FAF4EA] border border-[#ECDDC8] rounded-2xl flex items-center justify-between cursor-pointer hover:bg-[#F5ECE0] transition-all shadow-sm group"
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
        <div className="mb-8 p-5 bg-[#F2F7F3] border border-[#CCE2D2] rounded-2xl flex items-center justify-between gap-4">
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
            type="button"
            onClick={() => setActiveTab('library')}
            className="text-xs font-semibold text-[#1B4D29] hover:underline flex items-center gap-1 shrink-0"
          >
            Go to Library &rarr;
          </button>
        </div>
      )}

      {/* Key status metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Needs your eye */}
        <div
          onClick={() => setActiveTab('review')}
          className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl hover:border-[#DACFB8] transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#6B6355]">Needs your eye</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#C05621]" />
          </div>
          <div className="text-4xl font-serif font-bold text-[#1A1815] mb-2 group-hover:text-[#9A3412] transition-colors">
            {pendingCount}
          </div>
          <div className="text-xs text-[#7C7265] flex items-center gap-1.5 flex-wrap">
            <CheckSquare className="w-3.5 h-3.5 text-[#C05621]" />
            <span>Items waiting beside their source sentence</span>
            {flaggedPendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[10px] font-semibold border border-[#FDE68A]">
                {flaggedPendingCount} check additions
              </span>
            )}
          </div>
        </div>

        {/* In your library */}
        <div
          onClick={() => setActiveTab('library')}
          className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl hover:border-[#DACFB8] transition-all cursor-pointer shadow-sm group"
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

      {/* Verification workflow banner */}
      <div className="p-6 bg-[#F4EFE6] border border-[#E3D9C8] rounded-2xl mb-8">
        <div className="flex items-start gap-4">
          <span className="p-2 rounded-xl bg-[#E8DECE] text-[#784004] mt-0.5 shrink-0">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <button
          type="button"
          onClick={() => setActiveTab('flashcards')}
          className="p-4 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl hover:bg-[#F2ECE0] text-left transition-all"
        >
          <Layers className="w-5 h-5 text-[#8C5209] mb-2" />
          <div className="text-sm font-semibold text-[#1A1815]">Practice Flashcards</div>
          <div className="text-xs text-[#6B6355] mt-1">Flip through verified terms</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className="p-4 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl hover:bg-[#F2ECE0] text-left transition-all"
        >
          <HelpCircle className="w-5 h-5 text-[#2B5738] mb-2" />
          <div className="text-sm font-semibold text-[#1A1815]">Take Quick Quiz</div>
          <div className="text-xs text-[#6B6355] mt-1">Test source-grounded recall</div>
        </button>

        <button
          type="button"
          onClick={onOpenUploader}
          className="p-4 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl hover:bg-[#F2ECE0] text-left transition-all"
        >
          <Upload className="w-5 h-5 text-[#C05621] mb-2" />
          <div className="text-sm font-semibold text-[#1A1815]">Ingest New Material</div>
          <div className="text-xs text-[#6B6355] mt-1">Paste lecture notes or text</div>
        </button>
      </div>

      {/* Trusted Source Documents Inspector */}
      {state.documents.length > 0 && (
        <div className="p-5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl">
          <div className="text-[11px] font-bold tracking-widest uppercase text-[#8C8477] mb-3">
            TRUSTED SOURCE MATERIAL ({state.documents.length})
          </div>
          <div className="space-y-2.5">
            {state.documents.map((doc) => {
              const isOpen = expandedDocId === doc.id;
              return (
                <div key={doc.id} className="border border-[#E5DFD3] rounded-xl bg-[#FBF9F5] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedDocId(isOpen ? null : doc.id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#F5F2EB] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-[#8C5209] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1A1815] truncate">{doc.title}</div>
                        <div className="text-[11px] text-[#7A7264] truncate">{doc.fileName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-xs text-[#8C5209]">
                      <span className="hidden sm:inline">{isOpen ? 'Hide notes' : 'View raw notes'}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <pre className="p-4 border-t border-[#E5DFD3] bg-[#F7F4EC] text-xs text-[#3A352F] font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {doc.rawContent}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
