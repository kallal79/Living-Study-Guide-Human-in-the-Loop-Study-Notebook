import React, { useState, useEffect } from 'react';
import { NotebookState, StudyItem, SourceDocument, StudySessionLog } from './types';
import { initialNotebookState, sociologyNotebookState, awsNotebookState } from './data/initialData';
import { loadNotebookState, saveNotebookState, downloadBackup } from './utils/storage';
import { stopAmbientSound } from './utils/sound';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Overview } from './components/Overview';
import { ReviewQueue } from './components/ReviewQueue';
import { Library } from './components/Library';
import { Flashcards } from './components/Flashcards';
import { QuickQuiz } from './components/QuickQuiz';
import { StudySession } from './components/StudySession';
import { UnderstandingDashboard } from './components/UnderstandingDashboard';
import { DocumentUploader } from './components/DocumentUploader';
import { SettingsModal } from './components/SettingsModal';
import { PrivateLockScreen } from './components/PrivateLockScreen';
import { ReplitPreviewBanner } from './components/ReplitPreviewBanner';
import { MissionFlowModal } from './components/MissionFlowModal';

const SESSION_UNLOCK_KEY = 'living_study_guide_unlocked';
const VALID_TABS = new Set([
  'overview',
  'review',
  'library',
  'flashcards',
  'quiz',
  'session',
  'understanding',
]);

function readTabFromHash(): string {
  try {
    const raw = window.location.hash.replace(/^#\/?/, '').trim();
    return VALID_TABS.has(raw) ? raw : 'overview';
  } catch {
    return 'overview';
  }
}

export const App: React.FC = () => {
  const [state, setState] = useState<NotebookState>(() => structuredClone(initialNotebookState));
  const [activeTab, setActiveTabState] = useState<string>(readTabFromHash);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(true);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMissionFlowOpen, setIsMissionFlowOpen] = useState<boolean>(false);
  const [targetItemId, setTargetItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const setActiveTab = (tab: string) => {
    const clean = VALID_TABS.has(tab) ? tab : 'overview';
    setActiveTabState(clean);
    try {
      if (window.location.hash !== `#${clean}`) {
        window.history.replaceState(null, '', `#${clean}`);
      }
    } catch {
      // Ignore hash restrictions
    }
  };

  useEffect(() => {
    const onHashChange = () => {
      const next = readTabFromHash();
      setActiveTabState(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Initialize and load saved state without flashing private content prior to lock check
  useEffect(() => {
    let active = true;
    loadNotebookState()
      .then((loaded) => {
        if (!active) return;
        setState(loaded);
        if (loaded.isLocked) {
          const sessionOk =
            typeof sessionStorage !== 'undefined' &&
            sessionStorage.getItem(SESSION_UNLOCK_KEY) === '1';
          setIsUnlocked(sessionOk);
        } else {
          setIsUnlocked(true);
        }
      })
      .finally(() => {
        if (active) setIsLoadingState(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Global Escape handler to close top-level modals cleanly
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isUploaderOpen) setIsUploaderOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isMissionFlowOpen) setIsMissionFlowOpen(false);
        else if (isMobileNavOpen) setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isUploaderOpen, isSettingsOpen, isMissionFlowOpen, isMobileNavOpen]);

  // Save changes to storage whenever state updates
  const updateState = (updater: (prev: NotebookState) => NotebookState) => {
    setState((prev) => {
      const next = updater(prev);
      saveNotebookState(next);
      return next;
    });
  };

  // Item Actions
  const handleApproveItem = (id: string) => {
    updateState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === id ? { ...i, status: 'approved', reviewedAt: new Date().toISOString() } : i
      ),
    }));
  };

  const handleDiscardItem = (id: string) => {
    updateState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === id ? { ...i, status: 'discarded', reviewedAt: new Date().toISOString() } : i
      ),
    }));
  };

  const handleRestoreToQueue = (id: string) => {
    updateState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === id ? { ...i, status: 'pending', reviewedAt: undefined } : i
      ),
    }));
  };

  const handleRestoreDiscarded = () => {
    updateState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.status === 'discarded' ? { ...i, status: 'pending', reviewedAt: undefined } : i
      ),
    }));
  };

  const handleDeleteItem = (id: string) => {
    updateState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  const handleUpdateItem = (updated: StudyItem, approveImmediately = false) => {
    updateState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === updated.id
          ? {
              ...updated,
              status: approveImmediately ? 'approved' : updated.status,
              reviewedAt: approveImmediately ? new Date().toISOString() : updated.reviewedAt,
              userEdited: true,
            }
          : i
      ),
    }));
  };

  const handleMergeItems = (
    itemIds: string[],
    mergedTitle: string,
    mergedInterpretation: string
  ) => {
    const targets = state.items.filter((i) => itemIds.includes(i.id));
    if (targets.length < 2) return;

    const combinedSource = targets.map((i) => i.sourceFact).join(' ');
    const combinedCitation = targets.map((i) => i.sourceCitation).filter(Boolean).join('; ');

    const mergedItem: StudyItem = {
      id: `merged-${Date.now().toString(36)}`,
      documentId: targets[0].documentId,
      documentTitle: targets[0].documentTitle,
      sourceCitation: combinedCitation,
      tag: targets[0].tag,
      category: 'CONCEPT',
      title: mergedTitle,
      sourceFact: combinedSource,
      studyInterpretation: mergedInterpretation,
      status: 'pending',
      userEdited: true,
      originalInterpretation: mergedInterpretation,
      createdAt: new Date().toISOString(),
      flashcard: {
        front: `Synthesize: ${mergedTitle}`,
        back: mergedInterpretation,
        leitnerBox: 1,
        reviewCount: 0,
        correctCount: 0,
      },
      quizQuestion: {
        question: `How do these combined principles relate: ${mergedTitle}?`,
        options: [
          mergedInterpretation,
          'They operate completely in opposition with zero shared effects.',
          'They only apply to hardware architecture without human involvement.',
          'This synthesis is mathematically disproven.',
        ],
        correctOptionIndex: 0,
        explanation: `Source Citation: "${combinedSource}"`,
      },
    };

    updateState((prev) => ({
      ...prev,
      items: [mergedItem, ...prev.items.filter((i) => !itemIds.includes(i.id))],
    }));
  };

  const handleIngestItems = (newItems: StudyItem[], newDoc: SourceDocument) => {
    updateState((prev) => ({
      ...prev,
      items: [...newItems, ...prev.items],
      documents: [newDoc, ...prev.documents],
      activeTopic: newDoc.courseTopic || prev.activeTopic,
    }));
    showToast(`Added ${newItems.length} grounded candidate${newItems.length === 1 ? '' : 's'} to Review Queue.`);
    setActiveTab('review');
  };

  const handleAddSingleItem = (newItem: StudyItem) => {
    updateState((prev) => ({
      ...prev,
      items: [newItem, ...prev.items],
    }));
    showToast(`Created "${newItem.title}" in Review Queue for verification.`);
    setActiveTab('review');
  };

  const handleRecordSession = (session: StudySessionLog) => {
    updateState((prev) => ({
      ...prev,
      sessions: [session, ...prev.sessions],
    }));
  };

  const handleRecordQuizResult = (score: number, total: number, details?: string) => {
    const log: StudySessionLog = {
      id: `quiz-session-${Date.now().toString(36)}`,
      date: new Date().toISOString(),
      durationMinutes: 5,
      itemsReviewed: total,
      quizScore: score,
      quizTotal: total,
      notes: details || `Quick quiz completed with score ${score}/${total}.`,
    };
    handleRecordSession(log);
  };

  const handleUpdateItemProgress = (itemId: string, leitnerBox: number, wasCorrect: boolean) => {
    updateState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              flashcard: {
                ...i.flashcard,
                leitnerBox,
                reviewCount: i.flashcard.reviewCount + 1,
                correctCount: i.flashcard.correctCount + (wasCorrect ? 1 : 0),
              },
            }
          : i
      ),
    }));
  };

  const handleSwitchNotebookPreset = (preset: 'sociology' | 'aws') => {
    if (preset === 'sociology') {
      updateState(() => structuredClone(sociologyNotebookState));
    } else {
      updateState(() => structuredClone(awsNotebookState));
    }
  };

  const handleLockNotebook = () => {
    stopAmbientSound();
    try {
      sessionStorage.removeItem(SESSION_UNLOCK_KEY);
    } catch {
      // Ignore storage error
    }
    updateState((prev) => ({ ...prev, isLocked: true }));
    setIsUnlocked(false);
  };

  const handleBulkRetag = (itemIds: string[], newTag: string) => {
    const cleanTag = newTag.trim();
    if (!cleanTag || itemIds.length === 0) return;
    const idSet = new Set(itemIds);
    updateState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        idSet.has(i.id) ? { ...i, tag: cleanTag, userEdited: true } : i
      ),
    }));
    showToast(`Tagged ${itemIds.length} card${itemIds.length === 1 ? '' : 's'} as "${cleanTag}".`);
  };

  const isAppModalOpen = isUploaderOpen || isSettingsOpen || isMissionFlowOpen || isMobileNavOpen;

  const handleUnlock = (code: string) => {
    if (code === state.passcode) {
      try {
        sessionStorage.setItem(SESSION_UNLOCK_KEY, '1');
      } catch {
        // Ignore storage error
      }
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  // Phase IV: Never reveal private content while verifying lock status
  if (isLoadingState) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6 text-xs text-[#7A7264] font-medium">
        Loading private notebook...
      </div>
    );
  }

  // Phase IV: Locked screen check
  if (state.isLocked && !isUnlocked) {
    return (
      <PrivateLockScreen
        onUnlock={handleUnlock}
        hasCustomPasscode={state.passcode !== '1234'}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#1A1815]">
      {/* Replit Dev Preview Banner matching Image 4 */}
      <ReplitPreviewBanner onOpenSettings={() => setIsSettingsOpen(true)} />

      <div className="flex flex-1">
        {/* Left Sidebar matching Screenshots */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          state={state}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenUploader={() => setIsUploaderOpen(true)}
          onOpenMissionFlow={() => setIsMissionFlowOpen(true)}
          onSwitchNotebookPreset={handleSwitchNotebookPreset}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {/* Top Header */}
          <Header
            state={state}
            onLockNotebook={handleLockNotebook}
            onExportBackup={() => {
              downloadBackup(state);
              showToast('Downloaded full study guide backup (.json).');
            }}
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* Dynamic Route Content */}
          <main className="flex-1 pb-16">
            {activeTab === 'overview' && (
              <Overview
                state={state}
                setActiveTab={setActiveTab}
                onOpenUploader={() => setIsUploaderOpen(true)}
                onChangeStudyGoal={(goal) =>
                  updateState((prev) => ({ ...prev, studyGoal: goal }))
                }
              />
            )}

            {activeTab === 'review' && (
              <ReviewQueue
                items={state.items}
                studyGoal={state.studyGoal}
                onApproveItem={handleApproveItem}
                onDiscardItem={handleDiscardItem}
                onRestoreToQueue={handleRestoreToQueue}
                onUpdateItem={handleUpdateItem}
                onMergeItems={handleMergeItems}
                onBulkRetag={handleBulkRetag}
                onOpenUploader={() => setIsUploaderOpen(true)}
                setActiveTab={setActiveTab}
                isModalBlocked={isAppModalOpen}
              />
            )}

            {activeTab === 'library' && (
              <Library
                items={state.items}
                notebookName={state.notebookName}
                onUpdateItem={(up) => handleUpdateItem(up)}
                onDeleteItem={handleDeleteItem}
                onSendBackToQueue={handleRestoreToQueue}
                onStartQuizWithItem={(item) => {
                  setTargetItemId(item.id);
                  setActiveTab('quiz');
                }}
                onFlipCardWithItem={(item) => {
                  setTargetItemId(item.id);
                  setActiveTab('flashcards');
                }}
              />
            )}

            {activeTab === 'flashcards' && (
              <Flashcards
                items={state.items}
                onUpdateItemProgress={handleUpdateItemProgress}
                targetItemId={targetItemId}
                onClearTargetItem={() => setTargetItemId(null)}
                isModalBlocked={isAppModalOpen}
              />
            )}

            {activeTab === 'quiz' && (
              <QuickQuiz
                items={state.items}
                targetItemId={targetItemId}
                onClearTargetItem={() => setTargetItemId(null)}
                onRecordQuizResult={handleRecordQuizResult}
                isModalBlocked={isAppModalOpen}
              />
            )}

            {activeTab === 'session' && (
              <StudySession
                state={state}
                onRecordSession={handleRecordSession}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'understanding' && (
              <UnderstandingDashboard
                state={state}
                setActiveTab={setActiveTab}
              />
            )}
          </main>
        </div>
      </div>

      {/* Ingestion, Settings & Mission Flow Modals */}
      <DocumentUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onIngestItems={handleIngestItems}
        onAddSingleItem={handleAddSingleItem}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onUpdateSettings={(updates) => {
          if (updates.isLocked === false) {
            try {
              sessionStorage.removeItem(SESSION_UNLOCK_KEY);
            } catch {
              // Ignore
            }
          } else if (updates.isLocked === true && !state.isLocked) {
            try {
              sessionStorage.setItem(SESSION_UNLOCK_KEY, '1');
            } catch {
              // Ignore
            }
          }
          updateState((prev) => ({ ...prev, ...updates }));
        }}
        onRestoreState={(restored) => updateState(() => restored)}
        onResetToDemo={(mode) => handleSwitchNotebookPreset(mode)}
        onRestoreDiscarded={handleRestoreDiscarded}
      />

      <MissionFlowModal
        isOpen={isMissionFlowOpen}
        onClose={() => setIsMissionFlowOpen(false)}
      />

      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-40 px-4 py-2.5 bg-[#1A1815] text-[#FAF7F0] text-xs font-medium rounded-xl shadow-lg border border-[#3A352F] animate-fade-in no-print"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
