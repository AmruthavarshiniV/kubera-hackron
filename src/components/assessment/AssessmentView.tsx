import React, { useState } from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Send, 
  FileQuestion, 
  ArrowRight,
  UserCheck,
  Code2,
  FileCheck,
  Building
} from 'lucide-react';

export const AssessmentView: React.FC = () => {
  const { 
    activeCase, 
    recordOfficerAssessmentDecision, 
    openStreamlitInspector,
    setActivePage,
    runBackendAnalysis,
    apiLoading
  } = useCaseContext();

  const [selectedAction, setSelectedAction] = useState<string>('Request Missing Evidence');
  const [officerNote, setOfficerNote] = useState<string>(
    'Request applicant to furnish bank statement covering missing 22 days (01-Oct-2025 to 22-Oct-2025). Clarify PF statutory deduction on payslip.'
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const breakdown = activeCase.trustScoreBreakdown;

  const handleSyncBackendDecision = async () => {
    try {
      setSyncStatus('Running analysis on backend...');
      await runBackendAnalysis();
      setSyncStatus('Backend decision synchronized!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      setSyncStatus('Backend offline or error.');
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const handleDecisionSubmit = () => {
    recordOfficerAssessmentDecision(selectedAction, officerNote);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Evidence Trust Assessment
            </h1>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              · Case {activeCase.id}
            </span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Algorithmic evidence completeness evaluation, integrity scoring, and compliance decision support.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSyncBackendDecision}
            disabled={apiLoading}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-xs disabled:opacity-50"
          >
            {syncStatus || 'Re-evaluate with Backend'}
          </button>

          <button
            onClick={() => openStreamlitInspector('assessment_scoring')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Streamlit Assessment Code</span>
          </button>
        </div>
      </div>

      {/* Compliance Disclaimer Notice */}
      <div className="p-3.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100/70 dark:bg-neutral-800/40 text-xs text-neutral-600 dark:text-neutral-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Human Decision Authority:</strong> KUBERA provides evidence synthesis and risk flags. It does not issue automatic loan approvals or rejections.
          </span>
        </div>
        <span className="text-[11px] font-mono text-neutral-400 hidden md:inline">
          CHARTER-V2.4
        </span>
      </div>

      {/* Trust Score & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Big Score Card (5 Cols) */}
        <div className="md:col-span-5 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Evidence Trust Score
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-6xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white tabular-nums">
                {activeCase.trustScore ? activeCase.trustScore : '--'}
              </span>
              <span className="text-xl font-mono text-neutral-400 dark:text-neutral-500">
                / 100
              </span>
            </div>

            {/* Score Band Meter */}
            <div className="mt-4">
              <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full ${activeCase.trustScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${activeCase.trustScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1.5">
                <span>0 Deficient</span>
                <span>70 Borderline</span>
                <span>85+ High Trust</span>
              </div>
            </div>
          </div>

          {/* Evidence State */}
          <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
              Evidence State
            </span>
            <div className="inline-block px-3 py-1 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 font-semibold text-xs tracking-wide">
              {activeCase.evidenceState}
            </div>
          </div>
        </div>

        {/* Right Column: Score Breakdown (7 Cols) */}
        <div className="md:col-span-7 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
            Factor Breakdown & Weightings
          </span>

          <div className="space-y-3.5">
            {/* 1. Document Integrity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Document Integrity
                </span>
                <span className="font-mono tabular-nums text-neutral-900 dark:text-white font-semibold">
                  {breakdown.documentIntegrity}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${breakdown.documentIntegrity}%` }} />
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Pixel consistency, font regularity, and cryptographic tamper checks.
              </div>
            </div>

            {/* 2. Extraction Confidence */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Extraction Confidence
                </span>
                <span className="font-mono tabular-nums text-neutral-900 dark:text-white font-semibold">
                  {breakdown.extractionConfidence}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${breakdown.extractionConfidence}%` }} />
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Mean confidence score across 16 target entities extracted from OCR.
              </div>
            </div>

            {/* 3. Evidence Completeness */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Evidence Completeness
                </span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400 font-semibold">
                  {breakdown.evidenceCompleteness}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${breakdown.evidenceCompleteness}%` }} />
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Partial deduction: Bank statement provides 68 of mandatory 90 days.
              </div>
            </div>

            {/* 4. Cross-document Consistency */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Cross-document Consistency
                </span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400 font-semibold">
                  {breakdown.crossDocConsistency}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${breakdown.crossDocConsistency}%` }} />
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Flagged variance between Payslip gross salary (₹72,500) and Bank credit (₹68,000).
              </div>
            </div>

            {/* 5. Policy Compliance */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Policy Compliance
                </span>
                <span className="font-mono tabular-nums text-neutral-900 dark:text-white font-semibold">
                  {breakdown.policyCompliance}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${breakdown.policyCompliance}%` }} />
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Alignment with Personal Loan Underwriting Policy (POL-RET-PL-2026).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanations & Recommended Review Action Card */}
      <div className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-6 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Audit Explanations
          </h2>
          <div className="mt-3 space-y-2">
            {activeCase.explanations.map((exp, index) => {
              const isWarning = exp.toLowerCase().includes('missing') || exp.toLowerCase().includes('variance');
              return (
                <div key={index} className="flex items-start gap-2.5 text-xs">
                  {isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  )}
                  <span className={isWarning ? 'text-neutral-800 dark:text-neutral-200 font-medium' : 'text-neutral-600 dark:text-neutral-300'}>
                    {exp}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Review Action (NOT loan approval!) */}
        <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>Recommended Review Action</span>
          </div>
          <div className="text-sm font-semibold text-neutral-900 dark:text-white">
            {activeCase.recommendedAction}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            Note: This is an evidence remediation recommendation for the human underwriter, not a loan sanction outcome.
          </div>
        </div>
      </div>

      {/* Officer Decision Console */}
      <div className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-4 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-white">
            Human Underwriter Review Console
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Record loan officer assessment rationale and trigger evidence requests or file escalation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            'Request Missing Evidence',
            'Request Salary Clarification',
            'Escalate to Senior Underwriter',
          ].map((act) => (
            <button
              key={act}
              onClick={() => setSelectedAction(act)}
              className={`p-3 text-xs font-semibold rounded-md border text-left transition-all ${
                selectedAction === act
                  ? 'border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {act}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Officer Rationale & Action Note (Appended to Immutable Audit Trail)
          </label>
          <textarea
            rows={3}
            value={officerNote}
            onChange={(e) => setOfficerNote(e.target.value)}
            className="w-full text-xs p-3 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {isSubmitted ? (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Action recorded in audit log and queued!
            </span>
          ) : (
            <span className="text-[11px] text-neutral-400">
              Authenticated Officer: R. Sharma · Senior Credit Underwriter
            </span>
          )}

          <button
            onClick={handleDecisionSubmit}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-md shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Officer Action</span>
          </button>
        </div>
      </div>
    </div>
  );
};
