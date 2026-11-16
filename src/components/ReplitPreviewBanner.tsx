import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface ReplitPreviewBannerProps {
  onOpenSettings: () => void;
}

export const ReplitPreviewBanner: React.FC<ReplitPreviewBannerProps> = ({ onOpenSettings }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="bg-[#1E293B] text-[#E2E8F0] text-xs px-4 py-2 select-none border-b border-[#0F172A] z-30 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Banner Notice matching Image 4 */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          <span className="text-[11px] text-[#94A3B8]">
            This is a temporary development preview, and these links are not for public use.{' '}
            <button
              onClick={onOpenSettings}
              className="text-[#38BDF8] underline hover:text-[#7DD3FC] ml-1 font-medium inline-flex items-center gap-0.5"
            >
              <span>Publish your app</span>
              <ExternalLink className="w-2.5 h-2.5 inline" />
            </button>
            {' '}for secure sharing or use an invite link.
          </span>
        </div>

        {/* Right side verification checklist toggle & dismiss */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
            className="flex items-center gap-1 text-[11px] text-[#CBD5E1] hover:text-white transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Verification Status (4/4)</span>
            {isChecklistExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="text-[#94A3B8] hover:text-white p-0.5 rounded transition-colors"
            title="Dismiss development banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Verification Checklist Drawer matching Image 3 */}
      {isChecklistExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-[#334155] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] animate-fade-in">
          <div className="flex items-center gap-1.5 text-[#10B981]">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[#E2E8F0]">Frontend & backend type checks pass</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#10B981]">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[#E2E8F0]">Owner login/logout browser test passed</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#10B981]">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[#E2E8F0]">Anonymous API & mobile lock confirmed</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#10B981]">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[#E2E8F0]">Workflows running without error</span>
          </div>
        </div>
      )}
    </div>
  );
};

