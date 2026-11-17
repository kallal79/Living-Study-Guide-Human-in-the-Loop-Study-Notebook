import React, { useState } from 'react';
import { X, GitMerge, Check } from 'lucide-react';
import { StudyItem } from '../types';

interface MergeModalProps {
  selectedItems: StudyItem[];
  isOpen: boolean;
  onClose: () => void;
  onMerge: (mergedTitle: string, mergedInterpretation: string) => void;
}

export const MergeModal: React.FC<MergeModalProps> = (props) => {
  if (!props.isOpen || props.selectedItems.length < 2) return null;
  return <MergeModalInner key={props.selectedItems.map((i) => i.id).join('|')} {...props} />;
};

const MergeModalInner: React.FC<MergeModalProps> = ({
  selectedItems,
  onClose,
  onMerge,
}) => {

  const defaultTitle = `${selectedItems[0].title} & ${selectedItems[1].title}`;
  const defaultInterpretation = selectedItems.map((i) => i.studyInterpretation).join(' Furthermore, ');

  const [title, setTitle] = useState(defaultTitle);
  const [interpretation, setInterpretation] = useState(defaultInterpretation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMerge(title, interpretation);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-[#1A1815]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#FAF7F0] border border-[#E0D8C8] rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5] mb-5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#EAE3D2] text-[#8C5209] rounded-lg">
              <GitMerge className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#1A1815]">
                Merge {selectedItems.length} Study Candidates
              </h3>
              <p className="text-xs text-[#7A7264]">
                Synthesize related items into a single unified knowledge card.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close merge modal"
            className="p-1.5 rounded-lg text-[#7A7264] hover:bg-[#EFEAE0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Source Excerpts Being Combined */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9A3412] mb-1.5">
              Combined Source Quotes
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-[#F7EFE2] border border-[#E8DCBE] rounded-xl text-xs text-[#2C2824] italic font-serif">
              {selectedItems.map((item, idx) => (
                <div key={item.id} className="pb-1.5 border-b border-[#ECDDC8] last:border-0 last:pb-0">
                  <span className="font-semibold text-[#8C5209] not-italic mr-1">[{idx + 1}]</span>
                  "{item.sourceFact}"
                </div>
              ))}
            </div>
          </div>

          {/* Merged Title */}
          <div>
            <label className="block text-xs font-semibold text-[#5A5348] mb-1">
              Synthesized Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-lg text-sm text-[#1A1815] focus:outline-none focus:border-[#C05621]"
              required
            />
          </div>

          {/* Merged Interpretation */}
          <div>
            <label className="block text-xs font-semibold text-[#5A5348] mb-1">
              Synthesized Study Interpretation
            </label>
            <textarea
              rows={4}
              value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
              className="w-full p-3 bg-[#F2F0E8] border border-[#E2DBD0] rounded-xl text-sm text-[#1A1815] focus:outline-none focus:border-[#C05621]"
              required
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#6B6355] hover:bg-[#EFEAE0] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Merged Candidate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

