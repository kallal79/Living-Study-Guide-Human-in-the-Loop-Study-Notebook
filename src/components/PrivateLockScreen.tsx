import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

interface PrivateLockScreenProps {
  onUnlock: (passcode: string) => boolean;
}

export const PrivateLockScreen: React.FC<PrivateLockScreenProps> = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlock(passcode);
    if (!success) {
      setError('Incorrect passcode. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center items-center p-6 select-none">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#E8E2D5] rounded-3xl p-8 shadow-xl text-center">
        {/* Lock Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#F7EFE1] text-[#8C5209] flex items-center justify-center border border-[#ECD9BC]">
          <Lock className="w-8 h-8 text-[#C05621]" />
        </div>

        <div className="text-[11px] font-bold uppercase tracking-widest text-[#8C8477] mb-2 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2B5738]" />
          <span>PHASE IV PRIVATE NOTEBOOK</span>
        </div>

        <h1 className="text-3xl font-serif font-bold text-[#1A1815] mb-2">
          Private Study Guide
        </h1>
        <p className="text-sm text-[#6B6355] leading-relaxed mb-8">
          This study guide is protected. Enter your passcode to access your verified library, review queue, and quizzes.
        </p>

        {/* Unlock Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-[#8C8477] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="Enter passcode (default: 1234)"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              className="w-full pl-10 pr-4 py-3 bg-[#F5F2EB] border border-[#DDD5C7] rounded-xl text-sm text-[#1A1815] focus:outline-none focus:border-[#C05621] text-center tracking-widest"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-[#8C2C2C] font-medium animate-shake">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#2B5738] hover:bg-[#22452D] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <span>Unlock Notebook</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#EAE4D7] text-xs text-[#8C8477]">
          Default Passcode: <span className="font-mono font-semibold text-[#1A1815]">1234</span>
        </div>
      </div>
    </div>
  );
};

