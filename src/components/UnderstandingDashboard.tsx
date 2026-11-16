import React from 'react';
import { ArrowRight, Sparkles, BookOpen, Tag, Calendar, Layers } from 'lucide-react';
import { NotebookState } from '../types';

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
  const totalActive = approvedItems.length + pendingItems.length;

  // Group by tags
  const tagsMap: Record<string, { total: number; approved: number }> = {};
  for (const item of state.items.filter((i) => i.status !== 'discarded')) {
    if (!tagsMap[item.tag]) {
      tagsMap[item.tag] = { total: 0, approved: 0 };
    }
    tagsMap[item.tag].total++;
    if (item.status === 'approved') {
      tagsMap[item.tag].approved++;
    }
  }

  const tagKeys = Object.keys(tagsMap);
  const totalNotesWithLens = state.items.length;
  const sessionsCount = state.sessions.length > 0 ? state.sessions.length : 1;

  return (
    <div className="max-w-4xl mx-auto py-10 px-8">
      {/* Top Section matching Screenshot 4: Two Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Source-Linked Coverage Card (Takes 2 cols) */}
        <div className="lg:col-span-2 p-7 bg-[#FAF7F0] border border-[#E8E2D5] rounded-3xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#8C8477]">
                SOURCE-LINKED COVERAGE
              </span>
              <div className="w-12 h-12 rounded-full border-2 border-[#C05621] flex items-center justify-center font-serif font-bold text-sm text-[#1A1815] bg-[#FDFBF7]">
                {approvedItems.length}/{Math.max(approvedItems.length, 8)}
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1815] mb-2">
              Your foundation is in place.
            </h2>
            <p className="text-sm text-[#5C5549] leading-relaxed mb-6">
              The approved key terms are ready for recall practice. Review the queue to deepen the edges.
            </p>

            {/* Topic Progress Bars matching Screenshot 4 */}
            <div className="space-y-4 pt-4 border-t border-[#EDE7DA]">
              {tagKeys.slice(0, 4).map((tag, idx) => {
                const info = tagsMap[tag];
                const pct = info.total > 0 ? Math.round((info.approved / info.total) * 100) : 0;
                const barColor = idx % 2 === 0 ? 'bg-[#2B5738]' : 'bg-[#C05621]';

                return (
                  <div key={tag}>
                    <div className="flex justify-between items-center text-xs font-medium text-[#4A4338] mb-1.5">
                      <span className="font-semibold">{tag}</span>
                      <span className="text-[#7A7264]">
                        {info.approved} of {info.total} terms
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
              Practice the claims.
            </h3>
            <p className="text-sm text-[#D1E3ED] leading-relaxed mb-6 font-light">
              Terms give you the vocabulary. Lecture claims help you explain what the vocabulary is doing.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('review')}
            className="w-full py-3 px-4 bg-[#FAF7F0] hover:bg-[#FFFFFF] text-[#233D4D] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <span>Open review queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Three Metric Cards matching Screenshot 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Review Habit */}
        <div className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium text-[#7A7264] mb-3">
            <Calendar className="w-4 h-4 text-[#8C5209]" />
            <span>Review habit</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#1A1815] mb-1">
            {sessionsCount}
          </div>
          <div className="text-xs text-[#7A7264]">
            session{sessionsCount === 1 ? '' : 's'} started this week
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-2xs">
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
        <div className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-2xs">
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
      </div>

      {/* Explanatory Bottom Card matching Screenshot 4 */}
      <div className="p-6 bg-[#EFEBE1] border border-[#DDD5C7] rounded-2xl">
        <div className="flex items-start gap-3.5">
          <span className="p-1.5 rounded-lg bg-[#E2DACB] text-[#5C5549] mt-0.5">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A4338] mb-1">
              A note on this dashboard
            </h4>
            <p className="text-xs text-[#6B6355] leading-relaxed">
              Progress here reflects what has entered your notebook, not whether you have mastered sociology. The next useful move is the one that makes an idea easier to retrieve and easier to trace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
