import React, { useState, useMemo } from 'react';
import { X, UploadCloud, Sparkles, Check } from 'lucide-react';
import { extractStudyItemsFromText, getExtractionSummary } from '../utils/extractor';
import { StudyItem, SourceDocument } from '../types';
import { initialDocuments } from '../data/initialData';

interface DocumentUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestItems: (newItems: StudyItem[], newDoc: SourceDocument) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = (props) => {
  if (!props.isOpen) return null;
  return <DocumentUploaderInner {...props} />;
};

const DocumentUploaderInner: React.FC<DocumentUploaderProps> = ({
  onClose,
  onIngestItems,
}) => {
  const [title, setTitle] = useState('');
  const [courseTopic, setCourseTopic] = useState('');
  const [rawText, setRawText] = useState('');
  const [studyGoal, setStudyGoal] = useState<
    'exam_review' | 'concept_recall' | 'meeting_prep' | 'practical_howto'
  >('exam_review');

  const previewItems = useMemo(() => {
    if (!rawText.trim()) return [];
    return extractStudyItemsFromText(rawText, {
      documentTitle: title.trim() || 'Preview',
      courseTopic: courseTopic.trim() || 'General',
      fileName: 'preview.txt',
      studyGoal,
    });
  }, [rawText, title, courseTopic, studyGoal]);

  const previewSummary = useMemo(() => getExtractionSummary(previewItems), [previewItems]);

  const handlePresetSelect = (presetIndex: number) => {
    const doc = initialDocuments[presetIndex];
    if (doc) {
      setTitle(doc.title);
      setCourseTopic(doc.courseTopic);
      setRawText(doc.rawContent);
      if (presetIndex === 2) {
        setStudyGoal('meeting_prep');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTitle(file.name.replace(/\.[^/.]+$/, ''));
    setCourseTopic(file.name.split(/[_-]/)[0] || 'Study Notes');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    const finalTitle = title.trim() || 'Untitled Study Notes';
    const finalTopic = courseTopic.trim() || 'General';
    const fileName = `${finalTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;

    const newItems = extractStudyItemsFromText(rawText, {
      documentTitle: finalTitle,
      courseTopic: finalTopic,
      fileName,
      studyGoal,
    });

    const newDoc: SourceDocument = {
      id: `doc-${Date.now().toString(36)}`,
      title: finalTitle,
      courseTopic: finalTopic,
      fileName,
      rawContent: rawText,
      uploadedAt: new Date().toISOString(),
      totalExtracted: newItems.length,
      approvedCount: 0,
    };

    onIngestItems(newItems, newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1815]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF7F0] border border-[#E0D8C8] rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl relative my-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5] mb-5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#EAE3D2] text-[#8C5209] rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#1A1815]">
                Ingest Source Notes
              </h3>
              <p className="text-xs text-[#7A7264]">
                Extract grounded candidates directly into your Review Queue.
              </p>
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

        {/* Preset Selector Banner */}
        <div className="p-3.5 bg-[#FAF4EA] border border-[#ECDDC8] rounded-2xl mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[#784004] font-medium">
            <Sparkles className="w-4 h-4 text-[#C05621] shrink-0" />
            <span>Load sample material:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handlePresetSelect(0)}
              className="px-2.5 py-1 bg-[#FAF7F0] hover:bg-[#FFFFFF] text-[#784004] border border-[#ECDDC8] rounded-lg text-xs font-semibold transition-colors"
            >
              Sociology 101
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect(1)}
              className="px-2.5 py-1 bg-[#FAF7F0] hover:bg-[#FFFFFF] text-[#784004] border border-[#ECDDC8] rounded-lg text-xs font-semibold transition-colors"
            >
              AWS Module 1
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect(2)}
              className="px-2.5 py-1 bg-[#FAF7F0] hover:bg-[#FFFFFF] text-[#784004] border border-[#ECDDC8] rounded-lg text-xs font-semibold transition-colors"
            >
              Incident Runbook
            </button>
          </div>
        </div>

        {/* Ingest Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A5348] mb-1">
                Document / Course Title
              </label>
              <input
                type="text"
                placeholder="e.g. Sociology 101 Exam Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-lg text-sm text-[#1A1815] focus:outline-none focus:border-[#C05621]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A5348] mb-1">
                Subject / Topic Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Socialization, Cloud Concepts"
                value={courseTopic}
                onChange={(e) => setCourseTopic(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#DDD5C7] rounded-lg text-sm text-[#1A1815] focus:outline-none focus:border-[#C05621]"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#5A5348]">
                Paste Lecture Notes or Upload Text File
              </label>
              <label className="text-xs text-[#8C5209] hover:underline cursor-pointer font-medium">
                Upload File (.txt, .md)
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={6}
              placeholder="Paste your course notes, lecture transcript, or study summary here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-3 bg-[#F5F2EB] border border-[#DDD5C7] rounded-xl text-xs text-[#1A1815] font-mono leading-relaxed focus:outline-none focus:border-[#C05621]"
              required
            />
          </div>

          {/* Live Extraction Preview */}
          {rawText.trim().length > 0 && (
            <div className="p-3 bg-[#E7F0E9]/80 border border-[#BDDDC2] rounded-xl text-xs text-[#204E2D] flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">
                Live Preview: {previewSummary.total} candidate{previewSummary.total === 1 ? '' : 's'} detected
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(previewSummary.byCategory).map(([cat, count]) => (
                  <span key={cat} className="px-2 py-0.5 bg-white/80 rounded-md font-mono text-[10px] border border-[#BDDDC2]">
                    {cat}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Study Goal Setting matching prompt */}
          <div>
            <label className="block text-xs font-semibold text-[#5A5348] mb-1">
              Study Goal / Focus
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'exam_review', label: 'Exam Review' },
                { id: 'concept_recall', label: 'Concept Recall' },
                { id: 'practical_howto', label: 'Practical How-To' },
                { id: 'meeting_prep', label: 'Meeting Prep' },
              ].map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setStudyGoal(g.id as typeof studyGoal)}
                  className={`p-2 rounded-lg border text-center font-medium transition-all ${
                    studyGoal === g.id
                      ? 'bg-[#1A1815] text-[#FAF7F0] border-[#1A1815]'
                      : 'bg-[#F5F2EB] text-[#5A5348] border-[#DDD5C7] hover:bg-[#ECE6DB]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
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
              disabled={previewSummary.total === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2B5738] hover:bg-[#22452D] disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Extract {previewSummary.total > 0 ? `(${previewSummary.total}) ` : ''}to Review Queue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
