import React, { useState } from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { 
  GitCompare, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  HelpCircle, 
  ShieldCheck, 
  Code2,
  Info,
  CornerDownRight
} from 'lucide-react';
import { ContradictionItem } from '../../types';

export const ContradictionReviewView: React.FC = () => {
  const { activeCase, resolveContradiction, openStreamlitInspector } = useCaseContext();

  const [activeContraId, setActiveContraId] = useState<string>(activeCase.contradictions[0]?.id || '');
  const [resolutionNote, setResolutionNote] = useState<string>(
    'Verified via salary slip breakdown: Gross pay ₹72,500 minus Employee PF (₹4,300) and PT (₹200) equals exact net take-home salary credit of ₹68,000. Reconciled.'
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeContra = activeCase.contradictions.find(c => c.id === activeContraId) || activeCase.contradictions[0];

  const handleResolve = (action: 'Resolved by Officer' | 'Clarification Requested') => {
    if (!activeContra) return;
    resolveContradiction(activeContra.id, resolutionNote, action);
    setSuccessMessage(`Contradiction marked as "${action}". Consistency score recalculated.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Cross-Document Contradiction Review
            </h1>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              · Case {activeCase.id}
            </span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Reconcile variances across uploaded borrower documents without automated fraud labelling.
          </p>
        </div>

        <button
          onClick={() => openStreamlitInspector('contradiction')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors self-start sm:self-auto"
        >
          <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Streamlit Reconciliation Code</span>
        </button>
      </div>

      {/* Ethical Underwriting Guardrail Banner */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-start gap-3">
        <Info className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-0.5">
            Non-Defamatory Discrepancy Policy
          </span>
          <span className="text-neutral-600 dark:text-neutral-400">
            KUBERA treats discrepancies as <em>"Potential Inconsistencies"</em> requiring human review, accounting for standard tax deductions, bank delays, and name formatting differences. System never labels records as fraudulent.
          </span>
        </div>
      </div>

      {activeCase.contradictions.length === 0 ? (
        <div className="p-12 text-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Zero Contradictions Detected
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            All extracted applicant names, tax identifiers, and income figures align across documents.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeCase.contradictions.map((contra) => {
            const isResolved = contra.status === 'Resolved by Officer';
            return (
              <div 
                key={contra.id}
                className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-6 shadow-xs"
              >
                {/* Contradiction Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {contra.title}
                      </h2>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        Severity: {contra.severity} · Variance: {contra.difference}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded ${
                      isResolved
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                    }`}>
                      Status: {contra.status}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item A */}
                  <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800/40">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                      <span className="font-semibold uppercase tracking-wider">Document A</span>
                      <span className="font-mono text-[11px]">Page {contra.itemA.sourcePage}</span>
                    </div>
                    <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 truncate">
                      {contra.itemA.docName}
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        {contra.itemA.label}:
                      </span>
                      <span className="text-xl font-bold font-mono text-neutral-950 dark:text-white tabular-nums">
                        {contra.itemA.value}
                      </span>
                    </div>
                  </div>

                  {/* Item B */}
                  <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800/40">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                      <span className="font-semibold uppercase tracking-wider">Document B</span>
                      <span className="font-mono text-[11px]">Page {contra.itemB.sourcePage}</span>
                    </div>
                    <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 truncate">
                      {contra.itemB.docName}
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        {contra.itemB.label}:
                      </span>
                      <span className="text-xl font-bold font-mono text-neutral-950 dark:text-white tabular-nums">
                        {contra.itemB.value}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Hypothesis (Reasoning & Plausibility) */}
                <div className="p-4 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Algorithmic Hypothesis & Contextual Explanation</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {contra.aiHypothesis}
                  </p>
                </div>

                {/* If already resolved, show resolution summary */}
                {contra.resolutionNote && (
                  <div className="p-3.5 rounded bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolution Recorded by {contra.resolvedBy || 'Officer'}</span>
                      <span className="font-mono text-[10px] text-emerald-600">({contra.resolvedAt})</span>
                    </div>
                    <div className="text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                      {contra.resolutionNote}
                    </div>
                  </div>
                )}

                {/* Officer Resolution Form */}
                <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Loan Officer Reconciliation Rationale
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Enter underwriter notes explaining resolution or specific clarifications required from borrower..."
                    className="w-full text-xs p-3 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  />

                  {successMessage && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleResolve('Clarification Requested')}
                      className="px-3.5 py-2 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 rounded-md transition-colors"
                    >
                      Request Borrower Clarification
                    </button>

                    <button
                      onClick={() => handleResolve('Resolved by Officer')}
                      className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-md shadow-xs transition-colors"
                    >
                      Resolve & Update Consistency Score
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
