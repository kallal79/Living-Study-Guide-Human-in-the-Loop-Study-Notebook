import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileDown, 
  Layers, 
  Edit3, 
  Trash2, 
  FileText, 
  LayoutGrid, 
  List, 
  HelpCircle,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { StudyItem } from '../types';
import { exportLibraryMarkdown, exportAnkiCSV, downloadBackup } from '../utils/storage';
import { EditModal } from './EditModal';

interface LibraryProps {
  items: StudyItem[];
  notebookName: string;
  onUpdateItem: (updated: StudyItem) => void;
  onDeleteItem: (id: string) => void;
  onStartQuizWithItem: (item: StudyItem) => void;
  onFlipCardWithItem: (item: StudyItem) => void;
}

export const Library: React.FC<LibraryProps> = ({
  items,
  notebookName,
  onUpdateItem,
  onDeleteItem,
  onStartQuizWithItem,
  onFlipCardWithItem,
}) => {
  const approvedItems = items.filter((i) => i.status === 'approved');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [editingItem, setEditingItem] = useState<StudyItem | null>(null);

  // Extract tags and categories
  const tags = ['All', ...Array.from(new Set(approvedItems.map((i) => i.tag)))];
  const categories = ['All', ...Array.from(new Set(approvedItems.map((i) => i.category)))];

  // Filtering
  const filtered = approvedItems.filter((item) => {
    const matchesTag = selectedTag === 'All' || item.tag === selectedTag;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.sourceFact.toLowerCase().includes(q) ||
      item.studyInterpretation.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q);

    return matchesTag && matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1A1815]">
            Approved Knowledge Library
          </h2>
          <p className="text-xs text-[#7A7264] mt-0.5">
            Every card here has been inspected and verified against your trusted notes.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportLibraryMarkdown(approvedItems, notebookName)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF7F0] hover:bg-[#F2ECE0] text-[#4A4338] border border-[#DDD5C7] transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>

          <button
            onClick={() => exportAnkiCSV(approvedItems)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF7F0] hover:bg-[#F2ECE0] text-[#4A4338] border border-[#DDD5C7] transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Anki CSV</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl mb-6 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C8477] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search approved library by keyword, claim, or source quote..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-xl text-xs text-[#1A1815] focus:outline-none focus:border-[#C05621]"
          />
        </div>

        {/* Tags & View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase text-[#8C8477]">Tag:</span>
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                  selectedTag === t
                    ? 'bg-[#1A1815] text-[#FAF7F0]'
                    : 'bg-[#EDE7DA] text-[#6B6355] hover:bg-[#E2DAC9]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#EAE4D7] p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-[#FAF7F0] text-[#1A1815] shadow-xs' : 'text-[#7A7264]'
              }`}
              title="Side-by-side cards view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-[#FAF7F0] text-[#1A1815] shadow-xs' : 'text-[#7A7264]'
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
                className="p-6 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl shadow-2xs hover:border-[#DACFB8] transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onFlipCardWithItem(item)}
                      title="Practice this flashcard"
                      className="p-1.5 text-[#6B6355] hover:bg-[#EFEAE0] hover:text-[#1A1815] rounded-lg transition-colors"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onStartQuizWithItem(item)}
                      title="Quiz on this item"
                      className="p-1.5 text-[#6B6355] hover:bg-[#EFEAE0] hover:text-[#1A1815] rounded-lg transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      title="Edit item"
                      className="p-1.5 text-[#6B6355] hover:bg-[#EFEAE0] hover:text-[#1A1815] rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      title="Remove from library"
                      className="p-1.5 text-[#8C2C2C] hover:bg-[#FCE8E8] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-serif font-bold text-[#1A1815] mb-3">
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
                      "{item.sourceFact}"
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
                  <FileText className="w-3.5 h-3.5 text-[#A89F90]" />
                  <span>{item.sourceCitation}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2ECE0] text-[#5A5348] font-bold uppercase tracking-wider border-b border-[#E0D8C8]">
                <tr>
                  <th className="py-3 px-4">Concept / Term</th>
                  <th className="py-3 px-4">Tag</th>
                  <th className="py-3 px-4">Source Fact</th>
                  <th className="py-3 px-4">Study Interpretation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                      "{item.sourceFact}"
                    </td>
                    <td className="py-3 px-4 text-[#2C2824] max-w-xs truncate">
                      {item.studyInterpretation}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 text-[#6B6355] hover:text-[#1A1815]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
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
          <p className="text-sm text-[#7A7264]">
            No approved items found matching your filters.
          </p>
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

