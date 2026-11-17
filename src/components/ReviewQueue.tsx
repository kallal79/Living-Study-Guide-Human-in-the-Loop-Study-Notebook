import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  GitMerge,
  Check,
  Trash2,
  Keyboard,
  HelpCircle,
  Tag,
  RotateCcw,
} from 'lucide-react';
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
  onRestoreToQueue?: (id: string) => void;
  onUpdateItem: (updated: StudyItem, approveImmediately?: boolean) => void;
  onMergeItems: (itemIds: string[], mergedTitle: string, mergedInterpretation: string) => void;
  onBulkRetag?: (itemIds: string[], newTag: string) => void;
  onOpenUploader: () => void;
  setActiveTab: (tab: string) => void;
  isModalBlocked?: boolean;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  items,
  onApproveItem,
  onDiscardItem,
  onRestoreToQueue,
  onUpdateItem,
  onMergeItems,
  onBulkRetag,
  onOpenUploader,
  setActiveTab,
  isModalBlocked = false,
}) => {
  const pendingItems = items.filter((i) => i.status === 'pending');

  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mergeHintActive, setMergeHintActive] = useState(false);
  const [editingItem, setEditingItem] = useState<StudyItem | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [bulkTagDraft, setBulkTagDraft] = useState('');
  const [lastAction, setLastAction] = useState<{
    id: string;
    title: string;
    action: 'approved' | 'discarded';
  } | null>(null);

  // Extract unique tags and categories from pending + existing items
  const allNotebookTags = Array.from(new Set(items.filter((i) => i.status !== 'discarded').map((i) => i.tag)));
  const tags = ['All', ...Array.from(new Set(pendingItems.map((i) => i.tag)))];
  const categories: Array<string> = [
    'All',
    'CONCEPT',
    'LECTURE CLAIM',
    'KEY TERM',
    'SYSTEM',
    'PROCESS',
    'HOW-TO',
    'QUESTION',
  ];

  // Ensure selectedTag stays valid if all items of a tag are reviewed
  const activeTag = tags.includes(selectedTag) ? selectedTag : 'All';

  const filteredItems = pendingItems.filter((item) => {
    const matchesTag = activeTag === 'All' || item.tag === activeTag;
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesTag && matchesCat;
  });

  // Restrict selection actions strictly to visible filtered items so hidden items aren't silently mutated
  const visibleSelectedIds = filteredItems.filter((i) => selectedIds.has(i.id)).map((i) => i.id);
  const visibleSelectedSet = new Set(visibleSelectedIds);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isModalBlocked ||
        editingItem ||
        isMergeModalOpen ||
        showShortcutsModal ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowShortcutsModal(false);
        setMergeHintActive(false);
      } else if ((e.key === 'a' || e.key === 'A') && filteredItems.length > 0) {
        e.preventDefault();
        handleApprove(filteredItems[0].id);
      } else if ((e.key === 'd' || e.key === 'D') && filteredItems.length > 0) {
        e.preventDefault();
        handleDiscard(filteredItems[0].id);
      } else if ((e.key === 'e' || e.key === 'E') && filteredItems.length > 0) {
        e.preventDefault();
        setEditingItem(filteredItems[0]);
      } else if ((e.key === 'm' || e.key === 'M') && visibleSelectedIds.length >= 2) {
        e.preventDefault();
        setIsMergeModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, visibleSelectedIds.length, editingItem, isMergeModalOpen, showShortcutsModal, isModalBlocked]);

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
    if (visibleSelectedIds.length === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const handleApprove = (id: string) => {
    const target = items.find((i) => i.id === id);
    playTone('approve');
    onApproveItem(id);
    if (target) {
      setLastAction({ id, title: target.title, action: 'approved' });
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDiscard = (id: string) => {
    const target = items.find((i) => i.id === id);
    playTone('discard');
    onDiscardItem(id);
    if (target) {
      setLastAction({ id, title: target.title, action: 'discarded' });
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleUndo = () => {
    if (!lastAction || !onRestoreToQueue) return;
    onRestoreToQueue(lastAction.id);
    setLastAction(null);
  };

  const handleBulkApprove = () => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    playTone('approve');
    visibleSelectedIds.forEach((id) => onApproveItem(id));
    setSelectedIds(new Set());
    setMergeHintActive(false);
  };

  const handleBulkDiscard = () => {
    playTone('discard');
    visibleSelectedIds.forEach((id) => onDiscardItem(id));
    setSelectedIds(new Set());
    setMergeHintActive(false);
  };

  const handleBulkTagApply = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = bulkTagDraft.trim();
    if (!clean || visibleSelectedIds.length === 0) return;
    if (onBulkRetag) {
      onBulkRetag(visibleSelectedIds, clean);
    } else {
      visibleSelectedIds.forEach((id) => {
        const target = items.find((i) => i.id === id);
        if (target) onUpdateItem({ ...target, tag: clean });
      });
    }
    setBulkTagDraft('');
  };

  const handleMergeButtonClick = () => {
    if (visibleSelectedIds.length >= 2) {
      setMergeHintActive(false);
      setIsMergeModalOpen(true);
    } else {
      setMergeHintActive((prev) => !prev);
    }
  };

  const selectedItemsForMerge = filteredItems.filter((i) => visibleSelectedSet.has(i.id));

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Header matching Screenshot 5 & Image 1 */}
      <div className="space-y-3 mb-6 pb-4 border-b border-[#E8E2D5]">
        {/* Row 1: Topic Tag Chips & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C8477] uppercase tracking-wider mr-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Showing:</span>
            </div>
            {tags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTag === tag
                    ? 'bg-[#1A1815] text-[#FAF7F0] shadow-sm'
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
              type="button"
              onClick={handleMergeButtonClick}
              disabled={filteredItems.length < 2 && visibleSelectedIds.length < 2}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
                filteredItems.length < 2 && visibleSelectedIds.length < 2
                  ? 'opacity-40 cursor-not-allowed bg-[#E8E2D5] text-[#8C8477]'
                  : 'bg-[#EAE3D2] text-[#784004] hover:bg-[#E2D8C3] border border-[#D5C9B4]'
              }`}
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>{visibleSelectedIds.length >= 2 ? `MERGE (${visibleSelectedIds.length})` : 'SELECT TO MERGE'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Category Filter Pills matching Image 1 */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
          <span className="text-[#8C8477] font-semibold uppercase tracking-wider mr-1">Type:</span>
          {categories.map((cat) => {
            const count =
              cat === 'All'
                ? pendingItems.length
                : pendingItems.filter((i) => i.category === cat).length;

            if (cat !== 'All' && count === 0) return null;

            return (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#784004] text-white shadow-sm font-semibold'
                    : 'bg-[#F2ECE0] text-[#5A5348] hover:bg-[#E8DFCF]/80'
                }`}
              >
                {cat === 'All' ? `All (${count})` : `${cat} (${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Undo Toast Banner */}
      {lastAction && onRestoreToQueue && (
        <div className="mb-4 px-4 py-2.5 bg-[#1A1815] text-[#FAF7F0] rounded-xl flex items-center justify-between text-xs shadow-md animate-fade-in">
          <span>
            {lastAction.action === 'approved' ? 'Approved' : 'Discarded'}{' '}
            <strong>&ldquo;{lastAction.title}&rdquo;</strong>
            {lastAction.action === 'approved' ? ' to Library.' : '.'}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleUndo}
              className="flex items-center gap-1 text-[#FCD34D] hover:underline font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
            <button
              type="button"
              onClick={() => setLastAction(null)}
              className="text-[#928B7E] hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Merge Guidance Banner when user clicks Select to Merge with < 2 selected */}
      {mergeHintActive && visibleSelectedIds.length < 2 && filteredItems.length >= 2 && (
        <div className="mb-4 px-4 py-3 bg-[#FAF4EA] border border-[#ECDDC8] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#784004] animate-fade-in">
          <span>
            Check the boxes on any <strong>2 or more cards</strong> below to combine them into a single concept card.
          </span>
          <button
            type="button"
            onClick={() => {
              const firstTwo = filteredItems.slice(0, 2).map((i) => i.id);
              setSelectedIds(new Set(firstTwo));
              setMergeHintActive(false);
              setIsMergeModalOpen(true);
            }}
            className="px-3 py-1 bg-[#784004] text-white rounded-lg font-semibold shrink-0 hover:bg-[#5F3203]"
          >
            Quick-merge top 2
          </button>
        </div>
      )}

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="mb-6 flex items-center justify-between text-[11px] text-[#7A7264] bg-[#F7F4EC] px-3.5 py-1.5 rounded-xl border border-[#E8E2D5]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-[#5A5348] flex items-center gap-1">
            <Keyboard className="w-3.5 h-3.5 text-[#8C5209]" />
            Quick keys:
          </span>
          <span><kbd className="px-1.5 py-0.5 bg-[#EAE3D2] rounded text-[#2C2824] font-mono text-[10px]">A</kbd> Approve</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#EAE3D2] rounded text-[#2C2824] font-mono text-[10px]">E</kbd> Edit</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#EAE3D2] rounded text-[#2C2824] font-mono text-[10px]">D</kbd> Discard</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#EAE3D2] rounded text-[#2C2824] font-mono text-[10px]">M</kbd> Merge</span>
        </div>
        <button
          type="button"
          onClick={() => setShowShortcutsModal(true)}
          className="text-[#8C5209] hover:underline flex items-center gap-1 shrink-0"
        >
          <HelpCircle className="w-3 h-3" />
          <span>All shortcuts [?]</span>
        </button>
      </div>

      {/* Floating Bulk Action Bar when visible items selected */}
      {visibleSelectedIds.length > 0 && (
        <div className="mb-6 p-3.5 bg-[#FAF4EA] border border-[#ECDDC8] rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-medium text-[#5A5348]">
            <input
              type="checkbox"
              aria-label="Select all visible cards"
              checked={visibleSelectedIds.length === filteredItems.length && filteredItems.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded text-[#C05621] focus:ring-[#C05621] border-[#C8BFB0] cursor-pointer"
            />
            <span>
              <strong>{visibleSelectedIds.length}</strong> selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <form onSubmit={handleBulkTagApply} className="flex items-center gap-1">
              <input
                type="text"
                list="bulk-tags-datalist"
                placeholder="Retag selected..."
                value={bulkTagDraft}
                onChange={(e) => setBulkTagDraft(e.target.value)}
                className="px-2.5 py-1 bg-white border border-[#D5C9B4] rounded-lg text-xs text-[#1A1815] w-32 focus:outline-none focus:border-[#C05621]"
              />
              <datalist id="bulk-tags-datalist">
                {allNotebookTags.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <button
                type="submit"
                disabled={!bulkTagDraft.trim()}
                className="px-2.5 py-1 bg-[#EAE3D2] hover:bg-[#E2D8C3] disabled:opacity-40 text-[#784004] border border-[#D5C9B4] rounded-lg text-xs font-semibold transition-colors"
              >
                Retag
              </button>
            </form>

            {visibleSelectedIds.length >= 2 && (
              <button
                type="button"
                onClick={() => setIsMergeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EAE3D2] hover:bg-[#E2D8C3] text-[#784004] border border-[#D5C9B4] rounded-lg text-xs font-semibold transition-colors"
              >
                <GitMerge className="w-3.5 h-3.5" />
                <span>Merge Selected</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleBulkApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve All ({visibleSelectedIds.length})</span>
            </button>

            <button
              type="button"
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
          {filteredItems.map((item, idx) => (
            <ReviewCard
              key={item.id}
              item={item}
              isSelected={visibleSelectedSet.has(item.id)}
              onToggleSelect={handleToggleSelect}
              onApprove={handleApprove}
              onEdit={(it) => setEditingItem(it)}
              onDiscard={handleDiscard}
              onQuickTag={(id, newTag) => {
                if (onBulkRetag) {
                  onBulkRetag([id], newTag);
                } else {
                  const target = items.find((i) => i.id === id);
                  if (target) onUpdateItem({ ...target, tag: newTag });
                }
              }}
              availableTags={allNotebookTags}
              showKeyboardShortcuts={idx === 0}
            />
          ))}
        </div>
      ) : pendingItems.length > 0 ? (
        /* Filtered Empty State */
        <div className="p-10 text-center bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl">
          <p className="text-sm text-[#7A7264] mb-4">
            No pending cards match your current tag/category filter. There are still{' '}
            <strong>{pendingItems.length}</strong> items in other categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedTag('All');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-[#1A1815] text-white text-xs font-semibold rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* All Queue Clear State */
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
              type="button"
              onClick={() => setActiveTab('library')}
              className="px-4 py-2 bg-[#2B5738] text-white text-xs font-semibold rounded-lg hover:bg-[#22452D] transition-colors"
            >
              Open Library
            </button>
            <button
              type="button"
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
        availableTags={allNotebookTags}
        onSave={(updated, approveImmediately) => {
          onUpdateItem(updated, approveImmediately);
          setEditingItem(null);
          if (approveImmediately) {
            playTone('approve');
            setLastAction({ id: updated.id, title: updated.title, action: 'approved' });
            setSelectedIds((prev) => {
              const next = new Set(prev);
              next.delete(updated.id);
              return next;
            });
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

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowShortcutsModal(false);
          }}
          className="fixed inset-0 z-50 bg-[#1A1815]/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[#FAF7F0] border border-[#E0D8C8] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5] mb-4">
              <h3 className="text-base font-serif font-bold text-[#1A1815] flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#8C5209]" />
                Keyboard Shortcuts Guide
              </h3>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="text-xs text-[#7A7264] hover:text-[#1A1815]"
              >
                Close (Esc)
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#5A5348]">
              <div className="flex justify-between items-center py-1 border-b border-[#EAE4D7]">
                <span>Approve top candidate</span>
                <kbd className="px-2 py-0.5 bg-[#EAE3D2] font-mono rounded font-semibold text-[#1A1815]">A</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#EAE4D7]">
                <span>Discard top candidate</span>
                <kbd className="px-2 py-0.5 bg-[#EAE3D2] font-mono rounded font-semibold text-[#1A1815]">D</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#EAE4D7]">
                <span>Edit candidate</span>
                <kbd className="px-2 py-0.5 bg-[#EAE3D2] font-mono rounded font-semibold text-[#1A1815]">E</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#EAE4D7]">
                <span>Merge selected cards</span>
                <kbd className="px-2 py-0.5 bg-[#EAE3D2] font-mono rounded font-semibold text-[#1A1815]">M</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#EAE4D7]">
                <span>Flip flashcard</span>
                <kbd className="px-2 py-0.5 bg-[#EAE3D2] font-mono rounded font-semibold text-[#1A1815]">Space</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Select Quiz option</span>
                <kbd className="px-2 py-0.5 bg-[#EAE3D2] font-mono rounded font-semibold text-[#1A1815]">1 - 4</kbd>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E8E2D5] text-right">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 bg-[#2B5738] text-white rounded-lg text-xs font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
