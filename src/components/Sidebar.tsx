import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  CheckSquare,
  Library as LibraryIcon,
  Layers,
  HelpCircle,
  Clock,
  BarChart3,
  Settings,
  UploadCloud,
  ChevronRight,
  BookMarked,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';
import { NotebookState } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  state: NotebookState;
  onOpenSettings: () => void;
  onOpenUploader: () => void;
  onOpenMissionFlow: () => void;
  onSwitchNotebookPreset: (preset: 'sociology' | 'aws') => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  state,
  onOpenSettings,
  onOpenUploader,
  onOpenMissionFlow,
  onSwitchNotebookPreset,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPresetDropdown) return;
    const handleOutside = (e: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) {
        setShowPresetDropdown(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPresetDropdown(false);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleKey);
    };
  }, [showPresetDropdown]);

  const pendingCount = state.items.filter((i) => i.status === 'pending').length;
  const approvedCount = state.items.filter((i) => i.status === 'approved').length;
  const totalRelevant = pendingCount + approvedCount;
  const completionPercentage =
    totalRelevant > 0 ? Math.round((approvedCount / totalRelevant) * 100) : 0;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    {
      id: 'review',
      label: 'Review queue',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : null,
      highlight: pendingCount > 0,
    },
    { id: 'library', label: 'Library', icon: LibraryIcon },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quiz', label: 'Quick quiz', icon: HelpCircle },
    { id: 'session', label: 'Study session', icon: Clock },
    { id: 'understanding', label: 'Understanding', icon: BarChart3, arrow: true },
  ];

  const isAws = state.notebookName.includes('AWS');

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile?.();
  };

  const sidebarContent = (
    <div className="w-64 bg-[#F5F2EB] border-r border-[#E5DFD3] flex flex-col justify-between h-full select-none text-[#2C2824]">
      {/* Top Section */}
      <div className="p-4 flex flex-col flex-1 overflow-y-auto">
        {/* Notebook Title Badge & Preset Switcher */}
        <div ref={presetRef} className="mb-4 relative">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-lg bg-[#EAE3D2] text-[#8C5209] shrink-0">
                <BookMarked className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold tracking-widest text-[#7C7265] uppercase truncate">
                {state.activeTopic || 'YOUR NOTEBOOK'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                className="text-[#7C7265] hover:text-[#1A1815] p-1 rounded transition-colors"
                title="Switch demo course notebook"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  aria-label="Close navigation menu"
                  className="md:hidden text-[#7C7265] hover:text-[#1A1815] p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <h2
            onClick={() => setShowPresetDropdown(!showPresetDropdown)}
            className="text-base font-serif font-semibold text-[#1A1815] truncate cursor-pointer hover:text-[#784004] transition-colors"
            title={state.notebookName}
          >
            {state.notebookName}
          </h2>

          {/* Preset Switcher Popover */}
          {showPresetDropdown && (
            <div className="absolute left-0 mt-2 w-56 bg-[#FAF7F0] border border-[#DDD5C7] rounded-xl shadow-lg p-2 z-30 animate-fade-in text-xs space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase text-[#8C8477]">
                Switch Demo Material
              </div>
              <button
                type="button"
                onClick={() => {
                  onSwitchNotebookPreset('sociology');
                  setShowPresetDropdown(false);
                  onCloseMobile?.();
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  !isAws ? 'bg-[#EAE3D2] text-[#1A1815] font-semibold' : 'hover:bg-[#EFEAE0] text-[#5A5348]'
                }`}
              >
                <div>Sociology 101 Notes</div>
                <div className="text-[10px] text-[#7A7264] font-normal">Mead, Cooley, Stratification</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSwitchNotebookPreset('aws');
                  setShowPresetDropdown(false);
                  onCloseMobile?.();
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  isAws ? 'bg-[#EAE3D2] text-[#1A1815] font-semibold' : 'hover:bg-[#EFEAE0] text-[#5A5348]'
                }`}
              >
                <div>AWS Module 1 Cloud</div>
                <div className="text-[10px] text-[#7A7264] font-normal">Clients, Servers, EC2, S3</div>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="text-[11px] font-bold tracking-wider text-[#928B7E] uppercase px-2 mb-2">
          Your Notebook
        </div>
        <nav className="space-y-0.5 mb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#EAE3D2] text-[#1A1815] shadow-sm font-semibold'
                    : 'text-[#5C5549] hover:bg-[#EFEAE0] hover:text-[#1A1815]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#8C5209]' : 'text-[#8A8172]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-[#E7DAC3] text-[#784004] rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.arrow && !item.badge && (
                  <ChevronRight className="w-4 h-4 text-[#A8A092]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Interactive Mission Flow & Ingest Buttons */}
        <div className="pt-2 border-t border-[#E5DFD3] space-y-2">
          <button
            type="button"
            onClick={() => {
              onOpenMissionFlow();
              onCloseMobile?.();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#2B5738] bg-[#E7F0E9] hover:bg-[#DBEADF] border border-[#BDDDC2] transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#2B5738]" />
            <span>How This Works</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenUploader();
              onCloseMobile?.();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#784004] bg-[#F7EFE1] hover:bg-[#F2E5D0] border border-[#ECD9BC] transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Ingest Source Notes</span>
          </button>
        </div>
      </div>

      {/* Bottom Progress & Settings */}
      <div className="p-4 border-t border-[#E5DFD3] bg-[#EFEBE0]/60">
        <div className="mb-2">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-[#5C5549]">
            <span>Notebook complete</span>
            <span className="font-bold text-[#1A1815]">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-[#E2DBD0] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2B5738] h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-[#7C7265] mt-1.5">
            {approvedCount} approved item{approvedCount === 1 ? '' : 's'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onOpenSettings();
            onCloseMobile?.();
          }}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-[#6B6355] hover:text-[#1A1815] transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Notebook settings</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex h-screen sticky top-0 shrink-0 no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex no-print">
          <div
            className="fixed inset-0 bg-[#1A1815]/50 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 h-full shadow-2xl animate-fade-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
