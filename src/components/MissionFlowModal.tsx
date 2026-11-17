import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Check, Edit3, Trash2, Library } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playTone } from '../utils/sound';

interface MissionFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MissionFlowModal: React.FC<MissionFlowModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <MissionFlowModalInner {...props} />;
};

const MissionFlowModalInner: React.FC<MissionFlowModalProps> = ({ onClose }) => {

  const [decision, setDecision] = useState<'idle' | 'approved' | 'edited' | 'discarded'>('idle');

  const handleDecision = (type: 'approved' | 'edited' | 'discarded') => {
    setDecision(type);
    if (type === 'approved' || type === 'edited') {
      playTone('approve');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } else {
      playTone('discard');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-[#1A1815]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#FAF7F0] border border-[#E0D8C8] rounded-3xl w-full max-w-3xl p-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5] mb-6">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#EAE3D2] text-[#8C5209] rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-[#8C8477]">
                HUMAN-IN-THE-LOOP DESIGN ARCHITECTURE
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1A1815]">
                Nothing Saves Without A Check
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#7A7264] hover:bg-[#EFEAE0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Decision workflow */}
        <div className="p-6 bg-[#F5F2EB] border border-[#DDD5C7] rounded-2xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Step 1: Input Candidate Box */}
            <div className="p-4 bg-[#FAF7F0] border border-[#D5C9B4] rounded-xl space-y-3 shadow-2xs">
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-[#9A3412] mb-1">
                  SOURCE EXCERPT
                </div>
                <p className="text-xs text-[#2C2824] italic font-serif leading-relaxed">
                  "A kill switch exists for shutting off risky behavior mid-incident."
                </p>
              </div>

              <div className="pt-2 border-t border-[#EAE4D7]">
                <div className="text-[10px] font-bold tracking-widest uppercase text-[#5A5348] mb-1">
                  WHAT THE AI MADE OF IT
                </div>
                <p className="text-xs text-[#1A1815] leading-relaxed">
                  A control for shutting off risky behavior mid-incident.
                </p>
              </div>

              <div className="pt-2 text-center">
                <span className="px-3 py-1 bg-[#D9F99D] text-[#365314] text-[10px] font-bold uppercase tracking-wider rounded-full">
                  YOU DECIDE
                </span>
              </div>
            </div>

            {/* Step 2: Human Decision Interactive Controls */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleDecision('approved')}
                className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  decision === 'approved'
                    ? 'bg-[#2B5738] text-white border-[#2B5738] shadow-sm'
                    : 'bg-[#FAF7F0] text-[#2B5738] border-[#A3D7BD] hover:bg-[#E7F0E9]'
                }`}
              >
                <span>Direct Approve</span>
                <Check className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDecision('edited')}
                className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  decision === 'edited'
                    ? 'bg-[#8C5209] text-white border-[#8C5209] shadow-sm'
                    : 'bg-[#FAF7F0] text-[#784004] border-[#ECDDC8] hover:bg-[#FAF4EA]'
                }`}
              >
                <span>Edit, then approve</span>
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDecision('discarded')}
                className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  decision === 'discarded'
                    ? 'bg-[#8C2C2C] text-white border-[#8C2C2C] shadow-sm'
                    : 'bg-[#FAF7F0] text-[#8C2C2C] border-[#F2B6B6] hover:bg-[#FCE8E8]'
                }`}
              >
                <span>Discard completely</span>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Step 3: Result Destination Box */}
            <div className="p-4 rounded-xl border min-h-[140px] flex flex-col justify-center items-center text-center transition-all bg-[#FAF7F0] border-[#D5C9B4]">
              {decision === 'idle' && (
                <div className="text-xs text-[#7A7264]">
                  <ArrowRight className="w-6 h-6 mx-auto mb-2 text-[#8C8477]" />
                  <span>Choose an action above to trace its destination.</span>
                </div>
              )}
              {(decision === 'approved' || decision === 'edited') && (
                <div className="animate-fade-in text-[#2B5738]">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#E7F0E9] flex items-center justify-center">
                    <Library className="w-5 h-5 text-[#2B5738]" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1">
                    Added to Private Library
                  </div>
                  <p className="text-[11px] text-[#4A4338] leading-tight">
                    Now available for recall flashcards and quiz questions.
                  </p>
                </div>
              )}
              {decision === 'discarded' && (
                <div className="animate-fade-in text-[#8C2C2C]">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#FCE8E8] flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-[#8C2C2C]" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1">
                    Never Saved
                  </div>
                  <p className="text-[11px] text-[#4A4338] leading-tight">
                    Completely removed with zero unverified facts leaked.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary note */}
        <p className="text-xs text-[#5A5348] leading-relaxed mb-6 font-normal">
          Each item arrives with the sentence it came from, so checking it takes seconds. A knowledge base built without that step fills up with confident summaries nobody can trace.
        </p>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[#E8E2D5]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Got it, take me to Review Queue
          </button>
        </div>
      </div>
    </div>
  );
};

