import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  RotateCcw, 
  Lock, 
  ShieldCheck, 
  Check,
  BookOpen
} from 'lucide-react';
import { NotebookState } from '../types';
import { downloadBackup } from '../utils/storage';
import { initialNotebookState } from '../data/initialData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: NotebookState;
  onUpdateSettings: (updates: Partial<NotebookState>) => void;
  onRestoreState: (restored: NotebookState) => void;
  onResetToDemo: (mode: 'sociology' | 'aws') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateSettings,
  onRestoreState,
  onResetToDemo,
}) => {
  if (!isOpen) return null;

  const [notebookName, setNotebookName] = useState(state.notebookName);
  const [activeTopic, setActiveTopic] = useState(state.activeTopic);
  const [studyGoal, setStudyGoal] = useState(state.studyGoal);
  const [isLocked, setIsLocked] = useState(state.isLocked);
  const [passcode, setPasscode] = useState(state.passcode);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      notebookName,
      activeTopic,
      studyGoal,
      isLocked,
      passcode,
    });
    setStatusMessage('Settings saved successfully!');
    setTimeout(() => {
      setStatusMessage('');
      onClose();
    }, 800);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.items)) {
          onRestoreState(parsed);
          setStatusMessage('Backup restored successfully!');
          setTimeout(() => {
            setStatusMessage('');
            onClose();
          }, 1000);
        } else {
          alert('Invalid backup file structure.');
        }
      } catch {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1815]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF7F0] border border-[#E0D8C8] rounded-3xl w-full max-w-xl p-7 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5] mb-5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#EAE3D2] text-[#8C5209] rounded-xl">
              <SettingsIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#1A1815]">
                Notebook Settings & Security
              </h3>
              <p className="text-xs text-[#7A7264]">
                Manage study goals, private access, and backups.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7264] hover:bg-[#EFEAE0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 mb-4 rounded-xl bg-[#E7F0E9] border border-[#A3D7BD] text-xs font-semibold text-[#166534] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#166534]" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 mb-6">
          {/* Notebook Name */}
          <div>
            <label className="block text-xs font-semibold text-[#5A5348] mb-1">
              Notebook Title
            </label>
            <input
              type="text"
              value={notebookName}
              onChange={(e) => setNotebookName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-lg text-sm text-[#1A1815] focus:outline-none focus:border-[#C05621]"
              required
            />
          </div>

          {/* Active Topic */}
          <div>
            <label className="block text-xs font-semibold text-[#5A5348] mb-1">
              Active Course / Topic
            </label>
            <input
              type="text"
              value={activeTopic}
              onChange={(e) => setActiveTopic(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-lg text-sm text-[#1A1815] focus:outline-none focus:border-[#C05621]"
              required
            />
          </div>

          {/* Study Goal Setting */}
          <div>
            <label className="block text-xs font-semibold text-[#5A5348] mb-1">
              Study Goal Strategy
            </label>
            <select
              value={studyGoal}
              onChange={(e) => setStudyGoal(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-lg text-sm text-[#1A1815] focus:outline-none focus:border-[#C05621]"
            >
              <option value="exam_review">Exam Review (Flashcards & Verification)</option>
              <option value="concept_recall">Concept Recall (Foundational Terms)</option>
              <option value="practical_howto">Practical How-To Knowledge</option>
              <option value="meeting_prep">Meeting Preparation & Open Questions</option>
            </select>
          </div>

          {/* Privacy & Passcode Lock */}
          <div className="p-4 bg-[#F5F2EB] border border-[#DDD5C7] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8C5209]" />
                <span className="text-xs font-bold text-[#1A1815]">
                  Require Passcode on Launch (Phase IV)
                </span>
              </div>
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="w-4 h-4 rounded text-[#C05621] focus:ring-[#C05621] border-[#C8BFB0] cursor-pointer"
              />
            </div>

            {isLocked && (
              <div>
                <label className="block text-xs text-[#5A5348] mb-1">
                  Passcode PIN
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs text-[#1A1815] focus:outline-none"
                  placeholder="e.g. 1234"
                />
              </div>
            )}
          </div>

          {/* Full Backup & Restore Buttons */}
          <div className="p-4 bg-[#FAF4EA] border border-[#ECDDC8] rounded-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8C5209] mb-2 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-[#C05621]" />
              <span>Full Study Guide Backup (Phase IV Requirement)</span>
            </div>
            <p className="text-xs text-[#6B6355] mb-3 leading-relaxed">
              Export an exact copy of your notes, approved cards, review queue, and progress.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadBackup(state)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#FFFFFF] text-[#784004] border border-[#ECDDC8] rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Backup (.json)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#FFFFFF] text-[#784004] border border-[#ECDDC8] rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Switch Demo Data */}
          <div className="pt-2 flex items-center justify-between text-xs text-[#7A7264]">
            <span>Preset Switcher:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onResetToDemo('sociology')}
                className="text-xs text-[#8C5209] hover:underline"
              >
                Load Sociology 101
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onResetToDemo('aws')}
                className="text-xs text-[#8C5209] hover:underline"
              >
                Load AWS Module 1
              </button>
            </div>
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
              className="px-5 py-2.5 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
