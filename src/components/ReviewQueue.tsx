import React, { useState } from 'react';
import { CheckSquare, GitMerge, Check, Trash2, Filter } from 'lucide-react';
import { StudyItem } from '../types';
import { ReviewCard } from './ReviewCard';
import { EditModal } from './EditModal';
import { MergeModal } from './MergeModal';
import { playTone } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ReviewQueueProps {
  items: StudyItem[];
  onApproveItem: (id: string) => void;
  onDiscardItem: (id: string) => void;
  onUpdateItem: (updated: StudyItem, approveImmediately?: boolean) => void;
  onMergeItems: (itemIds: string[], mergedTitle: string, mergedInterpretation: string) => void;
  onOpenUploader: () => void;
  setActiveTab: (tab: string) => void;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  items,
  onApproveItem,
  onDiscardItem,
  onUpdateItem,
  onMergeItems,
  onOpenUploader,
  setActiveTab,
}) => {
  const pendingItems = items.filter((i) => i.status === 'pending');

  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<StudyItem | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  // Extract unique tags from pending items
  const tags = ['All', ...Array.from(new Set(pendingItems.map((i) => i.tag)))];

  const filteredItems = selectedTag === 'All'
    ? pendingItems
    : pendingItems.filter((i) => i.tag === selectedTag);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const handleApprove = (id: string) => {
    playTone('approve');
    onApproveItem(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDiscard = (id: string) => {
    playTone('discard');
    onDiscardItem(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkApprove = () => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    selectedIds.forEach((id) => onApproveItem(id));
    setSelectedIds(new Set());
  };

  const handleBulkDiscard = () => {
    selectedIds.forEach((id) => onDiscardItem(id));
    setSelectedIds(new Set());
  };

  const selectedItemsForMerge = pendingItems.filter((i) => selectedIds.has(i.id));

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      {/* Filter Bar & Header matching Screenshot 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E8E2D5]">
        {/* Showing Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C8477] uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Showing:</span>
          </div>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedTag === tag
                  ? 'bg-[#1A1815] text-[#FAF7F0] shadow-xs'
                  : 'bg-[#EDE7DA] text-[#6B6355] hover:bg-[#E2DAC9]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Count and Select To Merge Button */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#7A7264]">
            <strong className="text-[#1A1815]">{filteredItems.length}</strong> items ready for your review
          </span>

          <button
            onClick={() => {
              if (selectedIds.size < 2) {
                // Select first two items by default if none or one selected
                const firstTwo = filteredItems.slice(0, 2).map((i) => i.id);
                setSelectedIds(new Set(firstTwo));
              }
              setIsMergeModalOpen(true);
            }}
            disabled={filteredItems.length < 2}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              filteredItems.length < 2
                ? 'opacity-40 cursor-not-allowed bg-[#E8E2D5] text-[#8C8477]'
                : 'bg-[#EAE3D2] text-[#784004] hover:bg-[#E2D8C3] border border-[#D5C9B4]'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>SELECT TO MERGE</span>
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Bar when items selected */}
      {selectedIds.size > 0 && (
        <div className="mb-6 p-3.5 bg-[#FAF4EA] border border-[#ECDDC8] rounded-xl flex items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-medium text-[#5A5348]">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded text-[#C05621] focus:ring-[#C05621] border-[#C8BFB0] cursor-pointer"
            />
            <span>
              <strong>{selectedIds.size}</strong> selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size >= 2 && (
              <button
                onClick={() => setIsMergeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EAE3D2] hover:bg-[#E2D8C3] text-[#784004] border border-[#D5C9B4] rounded-lg text-xs font-semibold transition-colors"
              >
                <GitMerge className="w-3.5 h-3.5" />
                <span>Merge Selected</span>
              </button>
            )}

            <button
              onClick={handleBulkApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve All ({selectedIds.size})</span>
            </button>

            <button
              onClick={handleBulkDiscard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent hover:bg-[#FCE8E8] text-[#8C2C2C] border border-[#E8B4B4] rounded-lg text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          </div>
        </div>
      )}

      {/* Cards List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-5">
          {filteredItems.map((item) => (
            <ReviewCard
              key={item.id}
              item={item}
              isSelected={selectedIds.has(item.id)}
              onToggleSelect={handleToggleSelect}
              onApprove={handleApprove}
              onEdit={(it) => setEditingItem(it)}
              onDiscard={handleDiscard}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#E7F0E9] text-[#2B5738] flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#1A1815] mb-1">
            Review Queue is Clear
          </h3>
          <p className="text-sm text-[#7A7264] max-w-md mx-auto mb-6">
            All extracted candidate cards have been reviewed. Verified cards are now safely in your private library.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setActiveTab('library')}
              className="px-4 py-2 bg-[#2B5738] text-white text-xs font-semibold rounded-lg hover:bg-[#22452D] transition-colors"
            >
              Open Library
            </button>
            <button
              onClick={onOpenUploader}
              className="px-4 py-2 bg-[#EAE3D2] text-[#2C2824] text-xs font-semibold rounded-lg hover:bg-[#E2D8C3] transition-colors"
            >
              Ingest More Notes
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={(updated, approveImmediately) => {
          onUpdateItem(updated, approveImmediately);
          setEditingItem(null);
          if (approveImmediately) {
            playTone('approve');
          }
        }}
      />

      {/* Merge Modal */}
      <MergeModal
        selectedItems={selectedItemsForMerge}
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        onMerge={(mergedTitle, mergedInterpretation) => {
          const ids = selectedItemsForMerge.map((i) => i.id);
          onMergeItems(ids, mergedTitle, mergedInterpretation);
          setIsMergeModalOpen(false);
          setSelectedIds(new Set());
          playTone('approve');
        }}
      />
    </div>
  );
};
