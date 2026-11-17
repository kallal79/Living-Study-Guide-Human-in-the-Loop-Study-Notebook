import React from 'react';
import { ArrowRight, Sparkles, BookOpen, Tag, Calendar, Clock, ShieldCheck } from 'lucide-react';
import { NotebookState } from '../types';
import { verifyGroundedness } from '../utils/extractor';

interface UnderstandingDashboardProps {
  state: NotebookState;
  setActiveTab: (tab: string) => void;
}

export const UnderstandingDashboard: React.FC<UnderstandingDashboardProps> = ({
  state,
  setActiveTab,
}) => {
  const approvedItems = state.items.filter((i) => i.status === 'approved');
  const pendingItems = state.items.filter((i) => i.status === 'pending');
  const activeItems = state.items.filter((i) => i.status !== 'discarded');

  // Group by tags
  const tagsMap: Record<string, { total: number; approved: number }> = {};
  const categoryMap: Record<string, { total: number; approved: number }> = {};
  for (const item of activeItems) {
    if (!tagsMap[item.tag]) {
      tagsMap[item.tag] = { total: 0, approved: 0 };
    }
    tagsMap[item.tag].total++;
    if (item.status === 'approved') {
      tagsMap[item.tag].approved++;
    }

    if (!categoryMap[item.category]) {
      categoryMap[item.category] = { total: 0, approved: 0 };
    }
    categoryMap[item.category].total++;
    if (item.status === 'approved') {
      categoryMap[item.category].approved++;
    }
  }

  const tagKeys = Object.keys(tagsMap);
  const categoryKeys = Object.keys(categoryMap);
  const totalNotesWithLens = state.items.length;
  const sessionsCount = state.sessions.length;
  const foundationGoal = Math.min(8, activeItems.length || 8);
  const masteredCards = approvedItems.filter((i) => (i.flashcard.leitnerBox || 1) >= 3).length;
  const cleanGroundedCount = approvedItems.filter(
    (i) => !verifyGroundedness(i.sourceFact, i.studyInterpretation).isSuspicious
  ).length;
  const faithfulnessPct =
    approvedItems.length > 0
      ? Math.round((cleanGroundedCount / approvedItems.length) * 100)
      : 100;
  const quizSessions = state.sessions.filter((s) => s.quizTotal > 0);
  const avgQuizPct =
    quizSessions.length > 0
      ? Math.round(
          (quizSessions.reduce((acc, s) => acc + s.quizScore / s.quizTotal, 0) /
            quizSessions.length) *
            100
        )
      : null;

  const coverageHeading =
    approvedItems.length === 0
      ? 'Start verifying your notes.'
      : approvedItems.length >= foundationGoal
        ? 'Your foundation is in place.'
        : 'Your foundation is growing.';

  const suggestedAction =
    pendingItems.length > 0
      ? {
          title: 'Practice the claims.',
          body: 'Terms give you the vocabulary. Reviewing pending claims and interpretations helps you trace how the vocabulary works.',
          cta: 'Open review queue',
          tab: 'review',
        }
      : {
          title: 'Test your recall.',
          body: 'Your review queue is clear. Reinforce retention by taking a source-grounded quiz or flipping through your flashcard boxes.',
          cta: 'Start quick quiz',
          tab: 'quiz',
        };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-10 px-4 sm:px-8">
      {/* Top Section matching Screenshot 4: Two Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Source-Linked Coverage Card (Takes 2 cols) */}
        <div className="lg:col-span-2 p-7 bg-[#FAF7F0] border border-[#E8E2D5] rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#8C8477]">
                SOURCE-LINKED COVERAGE
              </span>
              <div className="w-12 h-12 rounded-full border-2 border-[#C05621] flex items-center justify-center font-serif font-bold text-sm text-[#1A1815] bg-[#FDFBF7]">
                {approvedItems.length}/{Math.max(approvedItems.length, foundationGoal)}
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1815] mb-2">
              {coverageHeading}
            </h2>
            <p className="text-sm text-[#5C5549] leading-relaxed mb-6">
              {approvedItems.length > 0
                ? 'The approved key terms are ready for recall practice. Review the queue to deepen the edges.'
                : 'Approve candidate cards in the Review Queue so verified concepts enter your recall library.'}
            </p>

            {/* Topic Progress Bars matching Screenshot 4 */}
            <div className="space-y-4 pt-4 border-t border-[#EDE7DA]">
              {tagKeys.slice(0, 5).map((tag, idx) => {
                const info = tagsMap[tag];
                const pct = info.total > 0 ? Math.round((info.approved / info.total) * 100) : 0;
                const barColor = idx % 2 === 0 ? 'bg-[#2B5738]' : 'bg-[#C05621]';

                return (
                  <div key={tag}>
                    <div className="flex justify-between items-center text-xs font-medium text-[#4A4338] mb-1.5">
                      <span className="font-semibold">{tag}</span>
                      <span className="text-[#7A7264]">
                        {info.approved} of {info.total} items
                      </span>
                    </div>
                    <div className="w-full bg-[#EAE4D7] h-2 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-full transition-all duration-500 rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Suggested Next Card matching Screenshot 4 */}
        <div className="p-7 bg-[#233D4D] text-[#FAF7F0] rounded-3xl shadow-md flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-widest uppercase text-[#A0C4D9] mb-3">
              SUGGESTED NEXT
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3 leading-tight text-white">
              {suggestedAction.title}
            </h3>
            <p className="text-sm text-[#D1E3ED] leading-relaxed mb-6 font-light">
              {suggestedAction.body}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab(suggestedAction.tab)}
            className="w-full py-3 px-4 bg-[#FAF7F0] hover:bg-[#FFFFFF] text-[#233D4D] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span>{suggestedAction.cta}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Four Metric Cards matching Screenshot 4 + Groundedness Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Review Habit */}
        <div className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-[#7A7264] mb-3">
            <Calendar className="w-4 h-4 text-[#8C5209]" />
            <span>Review habit</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#1A1815] mb-1">
            {sessionsCount}
          </div>
          <div className="text-xs text-[#7A7264]">
            session{sessionsCount === 1 ? '' : 's'} logged
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-[#7A7264] mb-3">
            <BookOpen className="w-4 h-4 text-[#2B5738]" />
            <span>Interpretation</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#1A1815] mb-1">
            {totalNotesWithLens}
          </div>
          <div className="text-xs text-[#7A7264]">
            notes with a study lens
          </div>
        </div>

        {/* Tags in use */}
        <div className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-[#7A7264] mb-3">
            <Tag className="w-4 h-4 text-[#C05621]" />
            <span>Tags in use</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#1A1815] mb-1">
            {tagKeys.length}
          </div>
          <div className="text-xs text-[#7A7264]">
            ways to find a thread
          </div>
        </div>

        {/* Source Faithfulness & Flashcard Mastery */}
        <div className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-[#7A7264] mb-3">
            <ShieldCheck className="w-4 h-4 text-[#2B5738]" />
            <span>Groundedness</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#1A1815] mb-1">
            {faithfulnessPct}%
          </div>
          <div className="text-xs text-[#7A7264]">
            clean &bull; {masteredCards} Box 3+ mastered{avgQuizPct !== null ? ` • ${avgQuizPct}% quiz` : ''}
          </div>
        </div>
      </div>

      {/* Knowledge Type Breakdown + Recent Study Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Category Breakdown */}
        <div className="p-5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-sm">
          <div className="text-[11px] font-bold tracking-widest uppercase text-[#8C8477] mb-3">
            BY KNOWLEDGE TYPE
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryKeys.map((cat) => {
              const c = categoryMap[cat];
              return (
                <div
                  key={cat}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F2EB] border border-[#E5DFD3] text-xs flex items-center gap-2"
                >
                  <span className="font-semibold text-[#1A1815]">{cat}</span>
                  <span className="text-[#2B5738] font-bold">
                    {c.approved}/{c.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Study Sessions */}
        <div className="p-5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-sm">
          <div className="text-[11px] font-bold tracking-widest uppercase text-[#8C8477] mb-3">
            RECENT SESSIONS
          </div>
          {state.sessions.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {state.sessions.slice(0, 4).map((s) => (
                <div key={s.id} className="text-xs flex items-start justify-between gap-2 pb-1.5 border-b border-[#EAE4D7] last:border-0">
                  <div className="text-[#2C2824] truncate">{s.notes}</div>
                  <span className="text-[11px] text-[#7A7264] flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {s.durationMinutes}m
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#7A7264]">No sessions logged yet.</p>
          )}
        </div>
      </div>

      {/* Explanatory Bottom Card matching Screenshot 4 */}
      <div className="p-6 bg-[#EFEBE1] border border-[#DDD5C7] rounded-2xl">
        <div className="flex items-start gap-3.5">
          <span className="p-1.5 rounded-lg bg-[#E2DACB] text-[#5C5549] mt-0.5 shrink-0">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A4338] mb-1">
              A note on this dashboard
            </h4>
            <p className="text-xs text-[#6B6355] leading-relaxed">
              Progress here reflects what has entered your notebook, not whether you have mastered{' '}
              {state.activeTopic.toLowerCase()}. The next useful move is the one that makes an idea easier to retrieve and easier to trace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
