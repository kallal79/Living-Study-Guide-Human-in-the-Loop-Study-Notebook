import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Check, Tag } from 'lucide-react';
import { StudyItem, ItemCategory } from '../types';
import { verifyGroundedness } from '../utils/extractor';

interface EditModalProps {
  item: StudyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: StudyItem, approveImmediately?: boolean) => void;
}

export const EditModal: React.FC<EditModalProps> = (props) => {
  if (!props.isOpen || !props.item) return null;
  return <EditModalInner key={props.item.id} {...props} item={props.item} />;
};

const EditModalInner: React.FC<EditModalProps & { item: StudyItem }> = ({
  item,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(item.title);
  const [tag, setTag] = useState(item.tag);
  const [category, setCategory] = useState<ItemCategory>(item.category);
  const [sourceFact, setSourceFact] = useState(item.sourceFact);
  const [studyInterpretation, setStudyInterpretation] = useState(item.studyInterpretation);
  const [flashcardFront, setFlashcardFront] = useState(item.flashcard.front);

  const analysis = verifyGroundedness(sourceFact, studyInterpretation);

  const handleSave = (approveImmediately = false) => {
    const cleanTag = tag.trim() || 'Core';
    const updated: StudyItem = {
      ...item,
      title: title.trim() || item.title,
      tag: cleanTag,
      category,
      sourceFact: sourceFact.trim() || item.sourceFact,
      studyInterpretation: studyInterpretation.trim() || item.studyInterpretation,
      userEdited: true,
      flashcard: {
        ...item.flashcard,
        front: flashcardFront.trim() || item.flashcard.front,
        back: studyInterpretation.trim() || item.studyInterpretation,
      },
      quizQuestion: {
        ...item.quizQuestion,
        explanation: `Source Fact: "${sourceFact.trim() || item.sourceFact}"`,
      },
    };
    onSave(updated, approveImmediately);
  };

  const categories: ItemCategory[] = [
    'CONCEPT',
    'LECTURE CLAIM',
    'KEY TERM',
    'SYSTEM',
    'PROCESS',
    'HOW-TO',
    'QUESTION',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1815]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF7F0] border border-[#E0D8C8] rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5] mb-5">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#1A1815]">
              Edit Study Candidate
            </h3>
            <p className="text-xs text-[#7A7264] mt-0.5">
              Keep the explanation accurate to what your notes actually say, and adjust tags as needed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#7A7264] hover:bg-[#EFEAE0] hover:text-[#1A1815] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 mb-6">
          {/* Title, Tag & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#5A5348] mb-1">
                Candidate Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-lg text-sm text-[#1A1815] focus:outline-none focus:border-[#C05621]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A5348] mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#8C5209]" />
                <span>Topic Tag</span>
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. Socialization"
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-lg text-sm text-[#1A1815] focus:outline-none focus:border-[#C05621]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A5348] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-lg text-sm text-[#1A1815] focus:outline-none focus:border-[#C05621]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Source Fact Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9A3412] mb-1">
              Source Fact (Verbatim from your notes)
            </label>
            <textarea
              rows={3}
              value={sourceFact}
              onChange={(e) => setSourceFact(e.target.value)}
              className="w-full p-3 bg-[#F7EFE2] border border-[#E8DCBE] rounded-xl text-sm text-[#2C2824] leading-relaxed font-serif italic focus:outline-none focus:border-[#C05621]"
            />
          </div>

          {/* Study Interpretation Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5348]">
                Study Interpretation
              </label>
              {analysis.isSuspicious && (
                <button
                  type="button"
                  onClick={() => setStudyInterpretation(sourceFact)}
                  className="text-[11px] font-semibold text-[#9A3412] hover:underline"
                >
                  Cut back to exact source fact
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={studyInterpretation}
              onChange={(e) => setStudyInterpretation(e.target.value)}
              className="w-full p-3 bg-[#F2F0E8] border border-[#E2DBD0] rounded-xl text-sm text-[#1A1815] leading-relaxed focus:outline-none focus:border-[#C05621]"
            />
          </div>

          {/* Flashcard Front Prompt */}
          <div>
            <label className="block text-xs font-semibold text-[#5A5348] mb-1">
              Flashcard Prompt (Front)
            </label>
            <input
              type="text"
              value={flashcardFront}
              onChange={(e) => setFlashcardFront(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-lg text-xs text-[#1A1815] focus:outline-none focus:border-[#C05621]"
            />
          </div>

          {/* Live Groundedness Analysis Bar */}
          <div
            className={`p-3.5 rounded-xl border text-xs ${
              analysis.isSuspicious
                ? 'bg-[#FEF3C7]/80 border-[#FCD34D] text-[#92400E]'
                : 'bg-[#E7F0E9]/80 border-[#C1DEC6] text-[#204E2D]'
            }`}
          >
            <div className="flex items-center justify-between gap-2 font-semibold mb-1">
              <div className="flex items-center gap-2">
                {analysis.isSuspicious ? (
                  <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#2B5738] shrink-0" />
                )}
                <span>{analysis.message}</span>
              </div>
              <span className="font-mono text-[11px]">
                {Math.round(analysis.groundedScore * 100)}% overlap
              </span>
            </div>
            {analysis.unsupportedWords.length > 0 && (
              <p className="text-[11px] mt-1 text-[#78350F]">
                Words/concepts not matched in source:{' '}
                <span className="font-mono">{analysis.unsupportedWords.join(', ')}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-[#6B6355] hover:bg-[#EFEAE0] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-4 py-2 bg-[#EAE3D2] hover:bg-[#E2D8C3] text-[#2C2824] border border-[#D5C9B4] rounded-lg text-xs font-semibold transition-colors"
          >
            Save Changes
          </button>

          {item.status !== 'approved' && (
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Approve to Library</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
