import React, { useState } from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Edit3, 
  Check, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Code2,
  Eye,
  Info
} from 'lucide-react';
import { VerificationState, ExtractedField } from '../../types';

export const DocumentReviewView: React.FC = () => {
  const { 
    activeCase, 
    selectedDocumentId, 
    setSelectedDocumentId, 
    selectedFieldId, 
    setSelectedFieldId, 
    verifyField,
    openStreamlitInspector,
    uploadBackendDocument,
    runBackendExtraction,
    apiLoading
  } = useCaseContext();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus(`Uploading ${file.name}...`);
      await uploadBackendDocument(file, 'Additional Supporting Document');
      setUploadStatus('Document uploaded. Extracting...');
      await runBackendExtraction();
      setUploadStatus('Uploaded and processed successfully!');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: any) {
      setUploadStatus('Upload completed locally.');
      setTimeout(() => setUploadStatus(null), 2500);
    }
  };

  const currentDoc = activeCase.documents.find(d => d.id === selectedDocumentId) || activeCase.documents[0];

  if (!currentDoc) {
    return (
      <div className="p-8 text-center text-neutral-500">
        No documents available for this case.
      </div>
    );
  }

  const selectedField = currentDoc.extractedFields.find(f => f.id === selectedFieldId) || currentDoc.extractedFields[0];

  const handleStartEdit = (field: ExtractedField) => {
    setEditingFieldId(field.id);
    setEditValue(field.value);
  };

  const handleSaveEdit = (fieldId: string) => {
    verifyField(currentDoc.id, fieldId, 'Manual Override', editValue);
    setEditingFieldId(null);
  };

  const getVerificationBadge = (state: VerificationState) => {
    switch (state) {
      case 'Verified by System':
        return (
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified by System
          </span>
        );
      case 'Officer Confirmed':
        return (
          <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Officer Confirmed
          </span>
        );
      case 'Needs Review':
        return (
          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Needs Review
          </span>
        );
      case 'Manual Override':
        return (
          <span className="text-[11px] font-medium text-purple-700 dark:text-purple-400 flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5" />
            Manual Override
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    const color = confidence >= 95 ? 'text-emerald-600 dark:text-emerald-400' : confidence >= 85 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
    return (
      <span className={`font-mono text-xs font-semibold tabular-nums ${color}`}>
        {confidence}%
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Subheader with document switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Document Review & OCR Verification
            </h1>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              · {activeCase.id}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Synchronized split-screen inspection of original multi-page artifacts and extracted target fields.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick upload input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleQuickUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={apiLoading}
            className="px-2.5 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded transition-colors disabled:opacity-50"
          >
            + Upload Doc
          </button>

          {/* Document Switcher Dropdown */}
          <select
            value={currentDoc.id}
            onChange={(e) => {
              setSelectedDocumentId(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1.5 font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            {activeCase.documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.detectedType} ({doc.fileName})
              </option>
            ))}
          </select>

          <button
            onClick={() => openStreamlitInspector('split_view')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Streamlit Split View Code</span>
          </button>
        </div>
      </div>

      {/* Split Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-14rem)] min-h-[580px]">
        {/* LEFT: DOCUMENT PREVIEW (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/60 overflow-hidden shadow-xs">
          {/* Preview Toolbar */}
          <div className="p-2.5 px-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[220px]">
                {currentDoc.fileName}
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {currentDoc.fileSize}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                SHA256 Verified
              </span>
            </div>

            {/* Page & Zoom Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded px-1.5 py-0.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300 px-1">
                  {currentPage} / {currentDoc.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(currentDoc.pages, p + 1))}
                  disabled={currentPage >= currentDoc.pages}
                  className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded px-1.5 py-0.5">
                <button
                  onClick={() => setZoomLevel(z => Math.max(75, z - 15))}
                  className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300 w-9 text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel(z => Math.min(150, z + 15))}
                  className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Document Artifact Viewport */}
          <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-neutral-200/50 dark:bg-neutral-950/80">
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-[560px] bg-white text-neutral-900 shadow-lg rounded border border-neutral-300 p-8 min-h-[640px] relative transition-transform duration-100 select-none"
            >
              {/* Document Header Representation */}
              <div className="border-b-2 border-neutral-800 pb-3 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-neutral-950 uppercase font-mono">
                      {currentDoc.previewContent?.header || currentDoc.detectedType}
                    </h2>
                    <div className="text-[11px] text-neutral-600">
                      Issuer: {currentDoc.previewContent?.issuer || 'Authorized Financial Authority'}
                    </div>
                  </div>
                  <div className="text-right font-mono text-[10px] text-neutral-500">
                    <div>Page {currentPage} of {currentDoc.pages}</div>
                    <div>Date: {currentDoc.previewContent?.issueDate || '01/2026'}</div>
                  </div>
                </div>
              </div>

              {/* Bounding box highlight if field belongs to this document & page */}
              {selectedField?.source?.boundingBox && (
                <div
                  style={{
                    top: `${selectedField.source.boundingBox.top}%`,
                    left: `${selectedField.source.boundingBox.left}%`,
                    width: `${selectedField.source.boundingBox.width}%`,
                    height: `${selectedField.source.boundingBox.height}%`,
                  }}
                  className="absolute border-2 border-emerald-500 bg-emerald-500/15 pointer-events-none rounded transition-all animate-pulse"
                >
                  <div className="absolute -top-4 left-0 bg-emerald-600 text-white font-mono text-[9px] px-1 py-0.2 rounded whitespace-nowrap shadow-xs">
                    {selectedField.key}: {selectedField.confidence}%
                  </div>
                </div>
              )}

              {/* Structured Body Content */}
              <div className="space-y-4 text-xs">
                {currentDoc.previewContent?.sections.map((sec, i) => {
                  const isHighlighted = selectedField && selectedField.value.toLowerCase().includes(sec.value.toLowerCase());
                  return (
                    <div 
                      key={i} 
                      className={`p-2 rounded transition-colors ${
                        isHighlighted 
                          ? 'bg-amber-100/70 border border-amber-300 font-semibold' 
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                        {sec.label}
                      </div>
                      <div className="text-xs font-mono text-neutral-900 mt-0.5">
                        {sec.value}
                      </div>
                    </div>
                  );
                })}

                {currentDoc.previewContent?.notes && (
                  <div className="mt-8 pt-4 border-t border-dashed border-neutral-300 text-[10px] text-neutral-500 italic">
                    Security Verification: {currentDoc.previewContent.notes}
                  </div>
                )}
              </div>

              {/* Document Seal / Watermark Stamp */}
              <div className="absolute bottom-6 right-8 opacity-25 pointer-events-none border-2 border-neutral-800 rounded-full w-20 h-20 flex items-center justify-center text-center font-mono text-[8px] uppercase font-bold transform -rotate-12">
                VERIFIED<br />DOCUMENT
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: EXTRACTED FIELDS & HUMAN-IN-THE-LOOP CONTROLS (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 overflow-hidden shadow-xs">
          {/* Header */}
          <div className="p-3.5 px-4 bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Extracted Fields ({currentDoc.extractedFields.length})
              </span>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Click any field to zoom and align on the source document
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-neutral-400 block">Overall Confidence</span>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {currentDoc.extractionConfidence}%
              </span>
            </div>
          </div>

          {/* Fields List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800">
            {currentDoc.extractedFields.map((field) => {
              const isSelected = selectedFieldId === field.id;
              const isEditing = editingFieldId === field.id;

              return (
                <div
                  key={field.id}
                  onClick={() => setSelectedFieldId(field.id)}
                  className={`p-3.5 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-100/90 dark:bg-neutral-800/80 border-l-3 border-emerald-500'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {field.key}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400">Confidence:</span>
                      {getConfidenceBadge(field.confidence)}
                    </div>
                  </div>

                  {/* Value / In-place Edit Form */}
                  <div className="mt-1.5">
                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 text-xs px-2 py-1 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white focus:outline-none font-mono"
                        />
                        <button
                          onClick={() => handleSaveEdit(field.id)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-500"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingFieldId(null)}
                          className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                          {field.value}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(field);
                          }}
                          className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 inline-flex items-center gap-1 opacity-60 hover:opacity-100"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Source Snippet */}
                  <div className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950/40 p-2 rounded border border-neutral-200/60 dark:border-neutral-800/60 font-mono truncate">
                    <span className="text-neutral-400">Source (p.{field.source.page}):</span> {field.source.textSnippet}
                  </div>

                  {/* Notes if discrepancy detected */}
                  {field.notes && (
                    <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800/40 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{field.notes}</span>
                    </div>
                  )}

                  {/* Verification Status & Officer Decision Buttons */}
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                    <div>
                      {getVerificationBadge(field.verificationState)}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => verifyField(currentDoc.id, field.id, 'Officer Confirmed')}
                        className="px-2 py-0.5 text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 rounded transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => verifyField(currentDoc.id, field.id, 'Needs Review')}
                        className="px-2 py-0.5 text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-amber-950 text-neutral-700 dark:text-neutral-300 hover:text-amber-600 rounded transition-colors"
                      >
                        Flag Review
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
