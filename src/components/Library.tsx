import React, { useState } from 'react';
import {
  Search,
  FileDown,
  Layers,
  Edit3,
  Trash2,
  FileText,
  LayoutGrid,
  List,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Printer,
  RotateCcw,
  X,
  Compass,
} from 'lucide-react';
import { StudyItem } from '../types';
import { exportLibraryMarkdown, exportAnkiCSV } from '../utils/storage';
import { verifyGroundedness } from '../utils/extractor';
import { EditModal } from './EditModal';

interface LibraryProps {
  items: StudyItem[];
  notebookName: string;
  onUpdateItem: (updated: StudyItem) => void;
  onDeleteItem: (id: string) => void;
  onSendBackToQueue?: (id: string) => void;
  onStartQuizWithItem: (item: StudyItem) => void;
  onFlipCardWithItem: (item: StudyItem) => void;
}

export const Library: React.FC<LibraryProps> = ({
  items,
  notebookName,
  onUpdateItem,
  onDeleteItem,
  onSendBackToQueue,
  onStartQuizWithItem,
  onFlipCardWithItem,
}) => {
  const approvedItems = items.filter((i) => i.status === 'approved');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'guide'>('cards');
  const [editingItem, setEditingItem] = useState<StudyItem | null>(null);
  const [inspectedItem, setInspectedItem] = useState<StudyItem | null>(null);

  const tags = ['All', ...Array.from(new Set(approvedItems.map((i) => i.tag)))];
  const categories = ['All', ...Array.from(new Set(approvedItems.map((i) => i.category)))];

  const activeTag = tags.includes(selectedTag) ? selectedTag : 'All';
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'All';

  const filtered = approvedItems.filter((item) => {
    const matchesTag = activeTag === 'All' || item.tag === activeTag;
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.sourceFact.toLowerCase().includes(q) ||
      item.studyInterpretation.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    return matchesTag && matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1A1815]">
            Approved Knowledge Library ({approvedItems.length})
          </h2>
          <p className="text-xs text-[#7A7264] mt-0.5">
            Every card here has been inspected and verified against your trusted notes.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap no-print">
          <button
            type="button"
            onClick={() => exportLibraryMarkdown(approvedItems, notebookName)}
            disabled={approvedItems.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF7F0] hover:bg-[#F2ECE0] text-[#4A4338] border border-[#DDD5C7] transition-colors disabled:opacity-40"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>

          <button
            type="button"
            onClick={() => exportAnkiCSV(approvedItems)}
            disabled={approvedItems.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF7F0] hover:bg-[#F2ECE0] text-[#4A4338] border border-[#DDD5C7] transition-colors disabled:opacity-40"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Anki CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={approvedItems.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF7F0] hover:bg-[#F2ECE0] text-[#4A4338] border border-[#DDD5C7] transition-colors disabled:opacity-40"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl mb-6 space-y-3 no-print">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C8477] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search approved library by keyword, claim, tag, or source quote..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-xl text-xs text-[#1A1815] focus:outline-none focus:border-[#C05621]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8477] hover:text-[#1A1815]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tags, Categories & View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="space-y-2">
            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase text-[#8C8477]">Tag:</span>
              {tags.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setSelectedTag(t)}
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

            {/* Category Filters */}
            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase text-[#8C8477]">Type:</span>
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-[#784004] text-white'
                        : 'bg-[#F2ECE0] text-[#5A5348] hover:bg-[#E8DFCF]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#EAE4D7] p-0.5 rounded-lg self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-[#FAF7F0] text-[#1A1815] shadow-sm' : 'text-[#7A7264]'
              }`}
              title="Side-by-side cards view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('guide')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'guide' ? 'bg-[#FAF7F0] text-[#1A1815] shadow-sm' : 'text-[#7A7264]'
              }`}
              title="Source-linked summary and how-to guides view"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-[#FAF7F0] text-[#1A1815] shadow-sm' : 'text-[#7A7264]'
              }`}
              title="Compact list view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Items Display */}
      {filtered.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-sm hover:border-[#DACFB8] transition-all break-inside-avoid"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E6EFF8] text-[#1D4E89] border border-[#CCDCEE]">
                      {item.tag}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F7EFE1] text-[#8C5209] border border-[#ECD9BC]">
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E7F0E9] text-[#2B5738] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Approved
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 no-print shrink-0">
                    <button
                      type="button"
                      onClick={() => setInspectedItem(item)}
                      title="Open concept page"
                      className="p-1.5 text-[#6B6355] hover:bg-[#EFEAE0] hover:text-[#1A1815] rounded-lg transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onFlipCardWithItem(item)}
                      title="Practice this flashcard"
                      className="p-1.5 text-[#6B6355] hover:bg-[#EFEAE0] hover:text-[#1A1815] rounded-lg transition-colors"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartQuizWithItem(item)}
                      title="Quiz on this item"
                      className="p-1.5 text-[#6B6355] hover:bg-[#EFEAE0] hover:text-[#1A1815] rounded-lg transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      title="Edit item"
                      className="p-1.5 text-[#6B6355] hover:bg-[#EFEAE0] hover:text-[#1A1815] rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {onSendBackToQueue && (
                      <button
                        type="button"
                        onClick={() => onSendBackToQueue(item.id)}
                        title="Send back to Review Queue"
                        className="p-1.5 text-[#8C5209] hover:bg-[#FAF4EA] rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      title="Remove from library"
                      className="p-1.5 text-[#8C2C2C] hover:bg-[#FCE8E8] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => setInspectedItem(item)}
                  className="text-xl font-serif font-bold text-[#1A1815] mb-3 cursor-pointer hover:text-[#8C5209] transition-colors"
                >
                  {item.title}
                </h3>

                {/* Side-by-side comparative boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Source Fact */}
                  <div className="p-4 rounded-xl bg-[#F7EFE2] border border-[#E8DCBE]">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-[#9A3412] mb-1">
                      SOURCE FACT (ORIGINAL SENTENCE)
                    </div>
                    <p className="text-sm text-[#2C2824] leading-relaxed italic font-serif">
                      &ldquo;{item.sourceFact}&rdquo;
                    </p>
                  </div>

                  {/* Study Interpretation */}
                  <div className="p-4 rounded-xl bg-[#F2F0E8] border border-[#E2DBD0]">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-[#5A5348] mb-1">
                      STUDY INTERPRETATION
                    </div>
                    <p className="text-sm text-[#1A1815] leading-relaxed">
                      {item.studyInterpretation}
                    </p>
                  </div>
                </div>

                {/* Citation */}
                <div className="flex items-center gap-1.5 text-xs text-[#7A7264]">
                  <FileText className="w-3.5 h-3.5 text-[#A89F90] shrink-0" />
                  <span className="truncate">{item.sourceCitation}</span>
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'guide' ? (
          /* Source-Linked Topic Summaries, Concept Pages & How-To Guides View */
          <div className="space-y-6">
            {Array.from(new Set(filtered.map((i) => i.tag))).map((topicTag) => {
              const groupItems = filtered.filter((i) => i.tag === topicTag);
              const howToItems = groupItems.filter((i) =>
                ['HOW-TO', 'PROCESS', 'SYSTEM'].includes(i.category)
              );
              const coreItems = groupItems.filter(
                (i) => !['HOW-TO', 'PROCESS', 'SYSTEM'].includes(i.category)
              );

              return (
                <section
                  key={topicTag}
                  className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-sm space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-[#EAE4D7] pb-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#8C8477]">
                        SOURCE-LINKED TOPIC SUMMARY
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-[#1A1815]">
                        {topicTag} Study Guide ({groupItems.length})
                      </h3>
                    </div>
                  </div>

                  {coreItems.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#2B5738]">
                        Key Concepts &amp; Verified Claims
                      </div>
                      <div className="space-y-2.5">
                        {coreItems.map((it) => (
                          <div
                            key={it.id}
                            className="p-3.5 rounded-xl bg-[#F5F2EB] border border-[#E2DBD0] flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => setInspectedItem(it)}
                                className="text-sm font-serif font-bold text-[#1A1815] hover:text-[#8C5209] text-left"
                              >
                                {it.title}
                              </button>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FAF7F0] text-[#8C5209] border border-[#ECD9BC]">
                                {it.category}
                              </span>
                            </div>
                            <p className="text-xs text-[#2C2824] leading-relaxed">
                              {it.studyInterpretation}
                            </p>
                            <p className="text-[11px] italic font-serif text-[#7A7264] border-l-2 border-[#C05621] pl-2.5">
                              &ldquo;{it.sourceFact}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {howToItems.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#9A3412] flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>How-To Guides &amp; System Processes</span>
                      </div>
                      <ol className="space-y-2.5">
                        {howToItems.map((it, stepIdx) => (
                          <li
                            key={it.id}
                            className="p-3.5 rounded-xl bg-[#F7EFE2] border border-[#E8DCBE] space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => setInspectedItem(it)}
                                className="text-sm font-serif font-bold text-[#1A1815] hover:text-[#8C5209] text-left"
                              >
                                {stepIdx + 1}. {it.title}
                              </button>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white text-[#9A3412]">
                                {it.category}
                              </span>
                            </div>
                            <p className="text-xs text-[#2C2824] leading-relaxed">
                              {it.studyInterpretation}
                            </p>
                            <p className="text-[11px] italic font-serif text-[#5A5348]">
                              Source Basis: &ldquo;{it.sourceFact}&rdquo;
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2ECE0] text-[#5A5348] font-bold uppercase tracking-wider border-b border-[#E0D8C8]">
                <tr>
                  <th className="py-3 px-4">Concept / Term</th>
                  <th className="py-3 px-4">Tag</th>
                  <th className="py-3 px-4">Source Fact</th>
                  <th className="py-3 px-4">Study Interpretation</th>
                  <th className="py-3 px-4 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D7]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F2E7] transition-colors">
                    <td className="py-3 px-4 font-serif font-bold text-sm text-[#1A1815]">
                      {item.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6EFF8] text-[#1D4E89]">
                        {item.tag}
                      </span>
                    </td>
                    <td className="py-3 px-4 italic text-[#4A4338] max-w-xs truncate">
                      &ldquo;{item.sourceFact}&rdquo;
                    </td>
                    <td className="py-3 px-4 text-[#2C2824] max-w-xs truncate">
                      {item.studyInterpretation}
                    </td>
                    <td className="py-3 px-4 text-right no-print">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="p-1 text-[#6B6355] hover:text-[#1A1815]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 text-[#8C2C2C] hover:text-[#C53030]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="p-12 text-center bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl">
          <p className="text-sm text-[#7A7264] mb-3">
            {approvedItems.length === 0
              ? 'Your approved library is empty. Approve candidates from the Review Queue first.'
              : 'No approved items found matching your current search or filters.'}
          </p>
          {(searchQuery || activeTag !== 'All' || activeCategory !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('All');
                setSelectedCategory('All');
              }}
              className="px-4 py-1.5 bg-[#1A1815] text-white text-xs font-semibold rounded-lg"
            >
              Reset Search &amp; Filters
            </button>
          )}
        </div>
      )}

      {/* Concept Page Modal */}
      {inspectedItem && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectedItem(null);
          }}
          className="fixed inset-0 z-50 bg-[#1A1815]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print"
        >
          <div className="bg-[#FAF7F0] border border-[#E0D8C8] rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl relative my-4 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#E8E2D5] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E6EFF8] text-[#1D4E89]">
                    {inspectedItem.tag}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F7EFE1] text-[#8C5209]">
                    {inspectedItem.category}
                  </span>
                  <span className="text-[11px] font-mono text-[#2B5738] font-semibold">
                    {Math.round(
                      verifyGroundedness(inspectedItem.sourceFact, inspectedItem.studyInterpretation)
                        .groundedScore * 100
                    )}
                    % overlap &bull; Box {inspectedItem.flashcard.leitnerBox || 1}/5
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1A1815]">
                  {inspectedItem.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close concept page"
                onClick={() => setInspectedItem(null)}
                className="p-1.5 rounded-lg text-[#7A7264] hover:bg-[#EFEAE0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F7EFE2] border border-[#E8DCBE]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#9A3412] mb-1">
                  SOURCE FACT
                </div>
                <p className="text-sm font-serif italic text-[#2C2824] leading-relaxed">
                  &ldquo;{inspectedItem.sourceFact}&rdquo;
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F2F0E8] border border-[#E2DBD0]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#5A5348] mb-1">
                  VERIFIED INTERPRETATION
                </div>
                <p className="text-sm text-[#1A1815] leading-relaxed">
                  {inspectedItem.studyInterpretation}
                </p>
              </div>
            </div>

            {approvedItems.filter((i) => i.tag === inspectedItem.tag && i.id !== inspectedItem.id)
              .length > 0 && (
              <div className="pt-2 border-t border-[#EAE4D7]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#8C8477] mb-2">
                  Related {inspectedItem.tag} Concepts
                </div>
                <div className="flex flex-wrap gap-2">
                  {approvedItems
                    .filter((i) => i.tag === inspectedItem.tag && i.id !== inspectedItem.id)
                    .map((rel) => (
                      <button
                        type="button"
                        key={rel.id}
                        onClick={() => setInspectedItem(rel)}
                        className="px-3 py-1 rounded-lg bg-[#F5F2EB] hover:bg-[#EAE3D2] text-xs font-medium text-[#1A1815] border border-[#DDD5C7] transition-colors"
                      >
                        {rel.title}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E8E2D5]">
              <span className="text-xs text-[#7A7264] truncate max-w-xs">
                {inspectedItem.sourceCitation}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectedItem;
                    setInspectedItem(null);
                    onFlipCardWithItem(target);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F7EFE1] hover:bg-[#F2E5D0] text-[#784004] border border-[#ECD9BC]"
                >
                  Practice Flashcard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectedItem;
                    setInspectedItem(null);
                    onStartQuizWithItem(target);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2B5738] hover:bg-[#22452D] text-white"
                >
                  Quiz on Concept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={(updated) => {
          onUpdateItem(updated);
          setEditingItem(null);
        }}
      />
    </div>
  );
};
