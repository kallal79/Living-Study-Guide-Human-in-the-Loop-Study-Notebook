import React, { useState } from 'react';
import { Lock, Unlock, Download, ShieldCheck, Volume2, VolumeX, CloudRain, Wind, Coffee, Menu } from 'lucide-react';
import { NotebookState } from '../types';
import { startAmbientSound, stopAmbientSound } from '../utils/sound';

interface HeaderProps {
  state: NotebookState;
  onLockNotebook: () => void;
  onExportBackup: () => void;
  onOpenMobileNav?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onLockNotebook,
  onExportBackup,
  onOpenMobileNav,
  onOpenSettings,
}) => {
  const [ambientActive, setAmbientActive] = useState(false);
  const [ambientPreset, setAmbientPreset] = useState<'rain' | 'zen' | 'library'>('rain');
  const [showAmbientMenu, setShowAmbientMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const toggleAmbient = (preset: 'rain' | 'zen' | 'library') => {
    if (ambientActive && ambientPreset === preset) {
      stopAmbientSound();
      setAmbientActive(false);
    } else {
      setAmbientPreset(preset);
      startAmbientSound(preset, 0.08);
      setAmbientActive(true);
    }
  };

  return (
    <header className="h-16 border-b border-[#E8E2D5] bg-[#FBF9F5]/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 gap-3">
      {/* Mobile Menu Trigger + Breadcrumb matching Screenshot 3 */}
      <div className="flex items-center gap-3 text-xs tracking-wider uppercase font-semibold text-[#8C8477] min-w-0">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            className="md:hidden p-2 rounded-lg text-[#5C5549] hover:bg-[#EFEAE0] border border-[#E0D9CB]"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#C05621]" />
          <span>{currentDate}</span>
        </div>
        <span className="hidden sm:inline">/</span>
        <span className="text-[#3A352F] flex items-center gap-1.5 truncate">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2B5738] shrink-0" />
          <span className="truncate">PRIVATE NOTEBOOK</span>
        </span>
      </div>

      {/* Action Controls & Ambient Focus Sound & Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 relative shrink-0">
        {/* Ambient Focus Audio Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAmbientMenu(!showAmbientMenu)}
            title="Focus Ambient Sounds (Rain, Zen Stream, Quiet Room)"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              ambientActive
                ? 'bg-[#E7F0E9] text-[#2B5738] border-[#A3D7BD]'
                : 'text-[#5C5549] hover:bg-[#EFEAE0] border-[#E0D9CB]'
            }`}
          >
            {ambientActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#2B5738] animate-pulse" />
                <span className="capitalize hidden sm:inline">{ambientPreset}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#8C8477]" />
                <span className="hidden sm:inline">Ambient Focus</span>
              </>
            )}
          </button>

          {showAmbientMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#FAF7F0] border border-[#DDD5C7] rounded-xl shadow-lg p-2 z-30 animate-fade-in text-xs space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase text-[#8C8477]">
                Ambient Background
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleAmbient('rain');
                  setShowAmbientMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left ${
                  ambientActive && ambientPreset === 'rain' ? 'bg-[#EAE3D2] text-[#1A1815] font-semibold' : 'hover:bg-[#EFEAE0] text-[#5A5348]'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5 text-[#2B5738]" />
                <span>Gentle Rain</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleAmbient('zen');
                  setShowAmbientMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left ${
                  ambientActive && ambientPreset === 'zen' ? 'bg-[#EAE3D2] text-[#1A1815] font-semibold' : 'hover:bg-[#EFEAE0] text-[#5A5348]'
                }`}
              >
                <Wind className="w-3.5 h-3.5 text-[#C05621]" />
                <span>Zen Stream</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleAmbient('library');
                  setShowAmbientMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left ${
                  ambientActive && ambientPreset === 'library' ? 'bg-[#EAE3D2] text-[#1A1815] font-semibold' : 'hover:bg-[#EFEAE0] text-[#5A5348]'
                }`}
              >
                <Coffee className="w-3.5 h-3.5 text-[#8C5209]" />
                <span>Quiet Library Room</span>
              </button>
              {ambientActive && (
                <button
                  type="button"
                  onClick={() => {
                    stopAmbientSound();
                    setAmbientActive(false);
                    setShowAmbientMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[#8C2C2C] hover:bg-[#FCE8E8] pt-1.5 border-t border-[#EAE4D7]"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Mute Sound</span>
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onExportBackup}
          title="Download full JSON backup of study guide"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-[#5C5549] hover:bg-[#EFEAE0] border border-[#E0D9CB] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Backup</span>
        </button>

        <button
          type="button"
          onClick={onLockNotebook}
          title="Lock private notebook (Phase IV Security Check)"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-[#5C5549] hover:bg-[#EFEAE0] border border-[#E0D9CB] transition-colors"
        >
          {state.isLocked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-[#C05621]" />
              <span className="hidden sm:inline">Lock Now</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-[#2B5738]" />
              <span className="hidden sm:inline">Private Lock</span>
            </>
          )}
        </button>

        {/* User Avatar Circle 'B' as in screenshot 3 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-[#EADCC8] text-[#7A3F05] flex items-center justify-center font-serif font-bold text-sm border border-[#DAC9AF] shadow-sm cursor-pointer select-none hover:ring-2 hover:ring-[#D5C9B4] transition-all"
            title="Private Notebook Owner"
          >
            B
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#FAF7F0] border border-[#DDD5C7] rounded-xl shadow-lg p-2 z-30 animate-fade-in text-xs space-y-1">
              <div className="px-2.5 py-1.5 border-b border-[#EAE4D7] mb-1">
                <div className="font-semibold text-[#1A1815]">Private Owner</div>
                <div className="text-[10px] text-[#7A7264] truncate">{state.notebookName}</div>
              </div>
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#5A5348]"
                >
                  Notebook Settings
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onExportBackup();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#5A5348]"
              >
                Download Full Backup
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLockNotebook();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FCE8E8] text-[#8C2C2C] font-medium"
              >
                Sign Out / Lock Notebook
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
