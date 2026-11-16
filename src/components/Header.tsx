import React from 'react';
import { Lock, Unlock, Download, ShieldCheck } from 'lucide-react';
import { NotebookState } from '../types';

interface HeaderProps {
  state: NotebookState;
  onLockNotebook: () => void;
  onExportBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onLockNotebook,
  onExportBackup,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 border-b border-[#E8E2D5] bg-[#FBF9F5]/90 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb matching Screenshot 3 */}
      <div className="flex items-center gap-3 text-xs tracking-wider uppercase font-semibold text-[#8C8477]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C05621]" />
          <span>{currentDate}</span>
        </div>
        <span>/</span>
        <span className="text-[#3A352F] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2B5738]" />
          PRIVATE NOTEBOOK
        </span>
      </div>

      {/* Action Controls & User Avatar matching Screenshot 3 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onExportBackup}
          title="Download full JSON backup of study guide"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#5C5549] hover:bg-[#EFEAE0] border border-[#E0D9CB] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Backup</span>
        </button>

        <button
          onClick={onLockNotebook}
          title="Lock private notebook (Phase IV Security Check)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#5C5549] hover:bg-[#EFEAE0] border border-[#E0D9CB] transition-colors"
        >
          {state.isLocked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-[#C05621]" />
              <span>Locked</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-[#2B5738]" />
              <span>Private Lock</span>
            </>
          )}
        </button>

        {/* User Avatar Circle 'B' as in screenshot 3 */}
        <div 
          className="w-8 h-8 rounded-full bg-[#EADCC8] text-[#7A3F05] flex items-center justify-center font-serif font-bold text-sm border border-[#DAC9AF] shadow-xs cursor-pointer select-none"
          title="Learner Profile (Bjones3623)"
        >
          B
        </div>
      </div>
    </header>
  );
};
