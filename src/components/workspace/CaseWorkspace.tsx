import React from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  User, 
  GitCompare, 
  History, 
  TableProperties, 
  ArrowUpRight,
  Code2,
  FileSearch,
  ExternalLink
} from 'lucide-react';
import { DocumentReviewView } from '../document-review/DocumentReviewView';
import { EvidenceMatrixView } from '../evidence-matrix/EvidenceMatrixView';
import { AssessmentView } from '../assessment/AssessmentView';
import { ContradictionReviewView } from '../contradiction/ContradictionReviewView';
import { AuditTrailView } from '../audit-trail/AuditTrailView';

export const CaseWorkspace: React.FC = () => {
  const { 
    activeCase, 
    workspaceSubTab, 
    setWorkspaceSubTab, 
    openStreamlitInspector,
    setActivePage,
    runBackendExtraction,
    runBackendAnalysis,
    refreshBackendCase,
    apiLoading,
    apiError,
    clearApiError
  } = useCaseContext();

  const [backendFeedback, setBackendFeedback] = React.useState<string | null>(null);

  const handleExtraction = async () => {
    try {
      setBackendFeedback('Running backend extraction (POST /api/cases/{id}/extract)...');
      await runBackendExtraction();
      setBackendFeedback('Extraction complete!');
      setTimeout(() => setBackendFeedback(null), 3000);
    } catch (err: any) {
      setBackendFeedback('Backend offline or extraction error.');
      setTimeout(() => setBackendFeedback(null), 3500);
    }
  };

  const handleAnalysis = async () => {
    try {
      setBackendFeedback('Running policy analysis & calculating trust score (POST /analyze & GET /decision)...');
      await runBackendAnalysis();
      setBackendFeedback('Analysis and Trust Assessment synchronized with backend!');
      setTimeout(() => setBackendFeedback(null), 3000);
    } catch (err: any) {
      setBackendFeedback('Backend offline or analysis error.');
      setTimeout(() => setBackendFeedback(null), 3500);
    }
  };

  const handleRefresh = async () => {
    try {
      setBackendFeedback('Refreshing from backend (GET /api/cases/{id})...');
      await refreshBackendCase();
      setBackendFeedback('Case refreshed.');
      setTimeout(() => setBackendFeedback(null), 2500);
    } catch (err: any) {
      setBackendFeedback('Refresh failed.');
      setTimeout(() => setBackendFeedback(null), 2500);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents', count: activeCase.documents.length },
    { id: 'evidence', label: 'Evidence', count: activeCase.evidenceMatrix.length },
    { id: 'assessment', label: 'Assessment', badge: `${activeCase.trustScore}/100` },
    { 
      id: 'contradictions', 
      label: 'Contradictions', 
      count: activeCase.contradictions.length > 0 ? activeCase.contradictions.length : undefined, 
      alert: activeCase.contradictions.some(c => c.status === 'Requires Human Review') 
    },
    { id: 'audit', label: 'Audit Trail', count: activeCase.auditTrail.length },
  ];

  // Number of issues
  const missingCount = activeCase.evidenceMatrix.filter(e => !e.found || !e.verified).length;
  const contradictionCount = activeCase.contradictions.filter(c => c.status === 'Requires Human Review').length;
  const totalIssuesCount = missingCount + contradictionCount;

  return (
    <div className="space-y-6">
      {/* CASE WORKSPACE HEADER */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-8 py-5 transition-colors">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Top Line: Applicant Name, Case ID, Loan Type */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {activeCase.applicant.name}
                </h1>
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
                  {activeCase.id}
                </span>
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  {activeCase.loanType}
                </span>
              </div>

              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex flex-wrap items-center gap-3 font-mono">
                <span>Requested: ₹{activeCase.applicant.requestedAmount.toLocaleString('en-IN')}</span>
                <span>·</span>
                <span>Tenure: {activeCase.applicant.tenureMonths} Months</span>
                <span>·</span>
                <span>Employer: {activeCase.applicant.employer}</span>
                <span>·</span>
                <span>PAN: {activeCase.applicant.pan}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={apiLoading}
                className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                title="Refresh case state from backend"
              >
                Sync Backend
              </button>

              <button
                onClick={handleExtraction}
                disabled={apiLoading}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded transition-colors disabled:opacity-50"
              >
                Extract OCR
              </button>

              <button
                onClick={handleAnalysis}
                disabled={apiLoading}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors shadow-xs disabled:opacity-50"
              >
                Run Analysis
              </button>

              <button
                onClick={() => openStreamlitInspector('workspace')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Streamlit Blueprint</span>
              </button>
            </div>
          </div>

          {/* Backend feedback notification */}
          {backendFeedback && (
            <div className="p-2.5 px-3 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-mono text-neutral-800 dark:text-neutral-200 flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {backendFeedback}
              </span>
            </div>
          )}

          {/* 4 PRIMARY KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* KPI 1: Evidence Coverage */}
            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                Evidence Coverage
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
                  {activeCase.evidenceCoverage}%
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">of checklist</span>
              </div>
            </div>

            {/* KPI 2: Trust Score */}
            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                Trust Score
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold font-mono tabular-nums ${
                  activeCase.trustScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : activeCase.trustScore > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'
                }`}>
                  {activeCase.trustScore ? activeCase.trustScore : '--'}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">/ 100</span>
              </div>
            </div>

            {/* KPI 3: Documents */}
            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                Documents
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
                  {activeCase.documents.length}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">all OCR verified</span>
              </div>
            </div>

            {/* KPI 4: Issues */}
            <div className={`p-3.5 rounded-lg border ${
              totalIssuesCount > 0 
                ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20' 
                : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40'
            }`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                Issues / Action Items
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-amber-900 dark:text-amber-200 tabular-nums">
                  {totalIssuesCount}
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  {contradictionCount > 0 ? 'Variance detected' : 'Incomplete'}
                </span>
              </div>
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 -mb-5 pt-3 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = workspaceSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setWorkspaceSubTab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                    isActive
                      ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive 
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' 
                        : tab.alert 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SUB-TAB CONTENTS */}
      <div className="transition-all">
        {/* OVERVIEW SUB-TAB */}
        {workspaceSubTab === 'overview' && (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Contradiction Alert Callout if present */}
            {activeCase.contradictions.length > 0 && (
              <div className="p-4 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                      Potential Cross-Document Inconsistency Detected
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                      Payslip gross income (₹72,500) differs from Bank statement salary credit (₹68,000). Likely statutory tax/PF deduction variance.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setWorkspaceSubTab('contradictions')}
                  className="px-3.5 py-2 text-xs font-semibold text-amber-900 dark:text-amber-100 bg-amber-200 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 rounded-md transition-colors shrink-0"
                >
                  Review Contradiction →
                </button>
              </div>
            )}

            {/* Grid with 2 columns: Left Document Summary, Right Trust Assessment Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Document Dossier Summary (6 Cols) */}
              <div className="lg:col-span-6 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    Uploaded Document Dossier
                  </h3>
                  <button
                    onClick={() => setWorkspaceSubTab('documents')}
                    className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                  >
                    <span>Full Review</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activeCase.documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setWorkspaceSubTab('documents')}
                      className="p-3 rounded border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-neutral-400" />
                        <div>
                          <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                            {doc.detectedType}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {doc.fileName} · {doc.pages} Pages
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[11px] font-medium ${
                          doc.evidenceStatus === 'Verified' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {doc.evidenceStatus}
                        </span>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          OCR: {doc.extractionConfidence}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment & Action Snapshot (6 Cols) */}
              <div className="lg:col-span-6 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    Trust Assessment Summary
                  </h3>
                  <button
                    onClick={() => setWorkspaceSubTab('assessment')}
                    className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                  >
                    <span>Full Assessment</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500">Evidence State:</span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      {activeCase.evidenceState}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500">Evidence Trust Score:</span>
                    <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                      {activeCase.trustScore} / 100
                    </span>
                  </div>
                </div>

                <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1.5">
                  <span className="font-semibold block text-neutral-900 dark:text-white">
                    Primary Evidence Observations:
                  </span>
                  {activeCase.explanations.slice(0, 3).map((exp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-neutral-400">•</span>
                      <span>{exp}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setWorkspaceSubTab('assessment')}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                  >
                    Open Underwriter Decision Console
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS SUB-TAB */}
        {workspaceSubTab === 'documents' && <DocumentReviewView />}

        {/* EVIDENCE MATRIX SUB-TAB */}
        {workspaceSubTab === 'evidence' && <EvidenceMatrixView />}

        {/* ASSESSMENT SUB-TAB */}
        {workspaceSubTab === 'assessment' && <AssessmentView />}

        {/* CONTRADICTIONS SUB-TAB */}
        {workspaceSubTab === 'contradictions' && <ContradictionReviewView />}

        {/* AUDIT TRAIL SUB-TAB */}
        {workspaceSubTab === 'audit' && <AuditTrailView />}
      </div>
    </div>
  );
};
