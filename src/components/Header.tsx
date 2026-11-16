import React, { useState } from 'react';
import { Lock, Unlock, Download, ShieldCheck, Volume2, VolumeX, CloudRain, Wind, Coffee } from 'lucide-react';
import { NotebookState } from '../types';
import { startAmbientSound, stopAmbientSound } from '../utils/sound';

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
  const [ambientActive, setAmbientActive] = useState(false);
  const [ambientPreset, setAmbientPreset] = useState<'rain' | 'zen' | 'library'>('rain');
  const [showAmbientMenu, setShowAmbientMenu] = useState(false);

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

      {/* Action Controls & Ambient Focus Sound & Avatar */}
      <div className="flex items-center gap-3 relative">
        {/* Ambient Focus Audio Button */}
        <div className="relative">
          <button
            onClick={() => setShowAmbientMenu(!showAmbientMenu)}
            title="Focus Ambient Sounds (Rain, Zen Stream, Quiet Room)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              ambientActive
                ? 'bg-[#E7F0E9] text-[#2B5738] border-[#A3D7BD]'
                : 'text-[#5C5549] hover:bg-[#EFEAE0] border-[#E0D9CB]'
            }`}
          >
            {ambientActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#2B5738] animate-pulse" />
                <span className="capitalize">{ambientPreset}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#8C8477]" />
                <span>Ambient Focus</span>
              </>
            )}
          </button>

          {showAmbientMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#FAF7F0] border border-[#DDD5C7] rounded-xl shadow-lg p-2 z-30 animate-fade-in text-xs space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase text-[#8C8477]">
                Ambient Background
              </div>
              <button
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
