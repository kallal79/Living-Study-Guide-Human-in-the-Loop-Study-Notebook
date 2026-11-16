import React, { useState } from 'react';
import { Check, Edit3, Trash2, FileText, AlertTriangle, ShieldCheck, Eye } from 'lucide-react';
import { StudyItem } from '../types';
import { verifyGroundedness, getGroundedTokens } from '../utils/extractor';

interface ReviewCardProps {
  item: StudyItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onEdit: (item: StudyItem) => void;
  onDiscard: (id: string) => void;
  showKeyboardShortcuts?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onApprove,
  onEdit,
  onDiscard,
  showKeyboardShortcuts = false,
}) => {
  const [highlightGrounded, setHighlightGrounded] = useState(false);
  const groundedAnalysis = verifyGroundedness(item.sourceFact, item.studyInterpretation);
  const tokens = getGroundedTokens(item.sourceFact, item.studyInterpretation);

  return (
    <div
      className={`p-6 rounded-2xl border transition-all duration-200 bg-[#FAF7F0] ${
        isSelected
          ? 'border-[#C05621] ring-1 ring-[#C05621] shadow-md bg-[#FAF4EA]'
          : 'border-[#E8E2D5] hover:border-[#DACFB8] shadow-sm'
      }`}
    >
      {/* Top Header: Checkbox + Tags */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            className="w-4 h-4 rounded text-[#C05621] focus:ring-[#C05621] border-[#C8BFB0] cursor-pointer"
          />

          {/* Primary Tag (e.g. SOCIALIZATION, STRATIFICATION) */}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E6EFF8] text-[#1D4E89] border border-[#CCDCEE]">
            {item.tag}
          </span>

          {/* Category Tag (e.g. LECTURE CLAIM, KEY TERM) */}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F7EFE1] text-[#8C5209] border border-[#ECD9BC]">
            {item.category}
          </span>

          {item.userEdited && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAE5D9] text-[#5C5549]">
              Edited by you
            </span>
          )}
        </div>

        {/* Groundedness Pill & Word Highlighter Toggle */}
        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={() => setHighlightGrounded(!highlightGrounded)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors border ${
              highlightGrounded
                ? 'bg-[#EAE3D2] text-[#784004] border-[#D5C9B4]'
                : 'bg-transparent text-[#7A7264] border-transparent hover:bg-[#EFEAE0]'
            }`}
            title="Highlight words directly supported vs added by AI"
          >
            <Eye className="w-3 h-3" />
            <span>{highlightGrounded ? 'Word Trace: ON' : 'Word Trace'}</span>
          </button>

          {groundedAnalysis.isSuspicious ? (
            <span className="inline-flex items-center gap-1 text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-md font-medium border border-[#FDE68A]">
              <AlertTriangle className="w-3 h-3" />
              Check additions
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#2B5738] bg-[#E7F0E9] px-2 py-0.5 rounded-md font-medium">
              <ShieldCheck className="w-3 h-3 text-[#2B5738]" />
              Grounded
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-serif font-bold text-[#1A1815] mb-4">
        {item.title}
      </h3>

      {/* Two Comparative Columns matching Screenshot 5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Column 1: SOURCE FACT */}
        <div className="p-4 rounded-xl bg-[#F7EFE2] border border-[#E8DCBE] flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-[#9A3412] mb-1.5 flex items-center justify-between">
              <span>SOURCE FACT</span>
              <span className="text-[9px] font-normal text-[#B45309]">Verbatim Quote</span>
            </div>
            <p className="text-sm text-[#2C2824] font-normal leading-relaxed italic font-serif">
              "{item.sourceFact}"
            </p>
          </div>
        </div>

        {/* Column 2: STUDY INTERPRETATION */}
        <div className="p-4 rounded-xl bg-[#F2F0E8] border border-[#E2DBD0] flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-[#5A5348] mb-1.5 flex items-center justify-between">
              <span>STUDY INTERPRETATION</span>
              <span className="text-[9px] font-normal text-[#7A7264]">AI Formulation</span>
            </div>

            {highlightGrounded ? (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed">
                  {tokens.map((tok, i) => {
                    if (tok.isStopWord || !tok.text.trim()) {
                      return <span key={i}>{tok.text}</span>;
                    }
                    if (tok.isGrounded) {
                      return (
                        <span key={i} className="bg-[#E7F0E9] text-[#166534] rounded px-0.5">
                          {tok.text}
                        </span>
                      );
                    }
                    return (
                      <span
                        key={i}
                        className="bg-[#FEF3C7] text-[#92400E] underline decoration-amber-400 font-medium rounded px-0.5"
                        title="Word not found in source excerpt"
                      >
                        {tok.text}
                      </span>
                    );
                  })}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[#7A7264] pt-1 border-t border-[#E2DBD0]">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#166534]" /> In Source
                    <span className="inline-block w-2 h-2 rounded-full bg-[#D97706] ml-1" /> Added
                  </span>
                  <span className="font-mono font-semibold text-[#5A5348]">
                    {Math.round(groundedAnalysis.groundedScore * 100)}% overlap
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#1A1815] font-normal leading-relaxed">
                {item.studyInterpretation}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Provenance Citation Footer & Right-Aligned Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E8E2D5]">
        {/* Citation */}
        <div className="flex items-center gap-1.5 text-xs text-[#7A7264] truncate max-w-md">
          <FileText className="w-3.5 h-3.5 text-[#A89F90] shrink-0" />
          <span className="truncate">{item.sourceCitation}</span>
        </div>

        {/* Action Buttons matching Screenshot 5 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onApprove(item.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve</span>
            {showKeyboardShortcuts && <span className="text-[9px] opacity-70 ml-0.5 font-mono">[A]</span>}
          </button>

          <button
            onClick={() => onEdit(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F2EB] hover:bg-[#ECE6DB] text-[#4A4338] border border-[#DCD5C8] rounded-lg text-xs font-medium transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
            {showKeyboardShortcuts && <span className="text-[9px] opacity-70 ml-0.5 font-mono">[E]</span>}
          </button>

          <button
            onClick={() => onDiscard(item.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent hover:bg-[#FCE8E8] text-[#8C2C2C] hover:border-[#E8B4B4] border border-transparent rounded-lg text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Discard</span>
            {showKeyboardShortcuts && <span className="text-[9px] opacity-70 ml-0.5 font-mono">[D]</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
