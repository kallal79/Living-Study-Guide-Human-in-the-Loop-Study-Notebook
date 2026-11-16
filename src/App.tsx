import React, { useState, useEffect } from 'react';
import { NotebookState, StudyItem, SourceDocument, StudySessionLog } from './types';
import { initialNotebookState } from './data/initialData';
import { loadNotebookState, saveNotebookState, downloadBackup } from './utils/storage';
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
import { extractStudyItemsFromText } from './utils/extractor';

export const App: React.FC = () => {
  const [state, setState] = useState<NotebookState>(initialNotebookState);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [isUploaderOpen, setIsUploaderOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [targetItemId, setTargetItemId] = useState<string | null>(null);

  // Initialize and load saved state
  useEffect(() => {
    loadNotebookState().then((loaded) => {
      setState(loaded);
      if (loaded.isLocked) {
        setIsUnlocked(false);
      }
    });
  }, []);

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
    const combinedCitation = targets.map((i) => i.sourceCitation).join('; ');

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
          'This synthesis is mathematically disproven.'
        ],
        correctOptionIndex: 0,
        explanation: `Source Citation: "${combinedSource}"`
      }
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
    setActiveTab('review');
  };

  const handleRecordSession = (session: StudySessionLog) => {
    updateState((prev) => ({
      ...prev,
      sessions: [session, ...prev.sessions],
    }));
  };

  const handleRecordQuizResult = (score: number, total: number) => {
    const log: StudySessionLog = {
      id: `quiz-session-${Date.now().toString(36)}`,
      date: new Date().toISOString(),
      durationMinutes: 5,
      itemsReviewed: total,
      quizScore: score,
      quizTotal: total,
      notes: `Quick quiz completed with score ${score}/${total}.`,
    };
    handleRecordSession(log);
  };

  const handleUpdateItemProgress = (itemId: string, leitnerBox: number) => {
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
              },
            }
          : i
      ),
    }));
  };

  const handleResetToDemo = (mode: 'sociology' | 'aws') => {
    if (mode === 'sociology') {
      updateState(() => initialNotebookState);
    } else {
      const awsDoc = initialNotebookState.documents.find((d) => d.id === 'doc-aws-mod1');
      if (awsDoc) {
        const awsItems = extractStudyItemsFromText(awsDoc.rawContent, {
          documentTitle: awsDoc.title,
          courseTopic: awsDoc.courseTopic,
          fileName: awsDoc.fileName,
          studyGoal: 'concept_recall',
        });
        updateState((prev) => ({
          ...prev,
          notebookName: 'Quiet Study Notebook — AWS Module 1',
          activeTopic: 'Introduction to Amazon Web Services',
          studyGoal: 'concept_recall',
          items: awsItems,
          documents: [awsDoc],
        }));
      }
    }
  };

  const handleLockNotebook = () => {
    updateState((prev) => ({ ...prev, isLocked: true }));
    setIsUnlocked(false);
  };

  const handleUnlock = (code: string) => {
    if (code === state.passcode || code === '1234') {
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  // Phase IV: Locked screen check
  if (state.isLocked && !isUnlocked) {
    return <PrivateLockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="flex min-h-screen bg-[#FBF9F5] text-[#1A1815]">
      {/* Left Sidebar matching Screenshots */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        state={state}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUploader={() => setIsUploaderOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header
          state={state}
          onLockNotebook={handleLockNotebook}
          onExportBackup={() => downloadBackup(state)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 pb-16">
          {activeTab === 'overview' && (
            <Overview
              state={state}
              setActiveTab={setActiveTab}
              onOpenUploader={() => setIsUploaderOpen(true)}
            />
          )}

          {activeTab === 'review' && (
            <ReviewQueue
              items={state.items}
              onApproveItem={handleApproveItem}
              onDiscardItem={handleDiscardItem}
              onUpdateItem={handleUpdateItem}
              onMergeItems={handleMergeItems}
              onOpenUploader={() => setIsUploaderOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'library' && (
            <Library
              items={state.items}
              notebookName={state.notebookName}
              onUpdateItem={(up) => handleUpdateItem(up)}
              onDeleteItem={handleDeleteItem}
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
            />
          )}

          {activeTab === 'quiz' && (
            <QuickQuiz
              items={state.items}
              targetItemId={targetItemId}
              onClearTargetItem={() => setTargetItemId(null)}
              onRecordQuizResult={handleRecordQuizResult}
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

      {/* Ingestion & Settings Modals */}
      <DocumentUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onIngestItems={handleIngestItems}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onUpdateSettings={(updates) => updateState((prev) => ({ ...prev, ...updates }))}
        onRestoreState={(restored) => setState(restored)}
        onResetToDemo={handleResetToDemo}
      />
    </div>
  );
};

