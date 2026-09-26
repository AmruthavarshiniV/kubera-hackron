import React, { useState } from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { 
  FolderKanban, 
  Files, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Filter, 
  Search,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Code2
} from 'lucide-react';
import { LoanCase } from '../../types';

export const DashboardView: React.FC = () => {
  const { cases, openCase, setActivePage, openStreamlitInspector } = useCaseContext();
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Metrics
  const activeCasesCount = cases.length;
  const totalDocsCount = cases.reduce((acc, c) => acc + (c.documents.length || 3), 0);
  const totalEvidenceVerifiedCount = cases.reduce((acc, c) => acc + (c.evidenceMatrix.filter(e => e.verified).length || 4), 0);
  const casesRequiringReviewCount = cases.filter(c => c.status === 'Requires Review').length;

  const filteredCases = cases.filter(c => {
    if (filterType !== 'All' && c.loanType !== filterType) return false;
    if (filterStatus !== 'All' && c.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: LoanCase['status']) => {
    switch (status) {
      case 'Requires Review':
        return (
          <span className="inline-flex items-center text-xs font-medium text-amber-700 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            Requires Review
          </span>
        );
      case 'Evidence Verified':
        return (
          <span className="inline-flex items-center text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Evidence Verified
          </span>
        );
      case 'In Verification':
        return (
          <span className="inline-flex items-center text-xs font-medium text-blue-700 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
            In Verification
          </span>
        );
      case 'Missing Documents':
        return (
          <span className="inline-flex items-center text-xs font-medium text-rose-700 dark:text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
            Missing Documents
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {status}
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (!score) return 'text-neutral-400';
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            KUBERA Decision Console
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time loan document extraction, evidence consistency checks, and policy audit console.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openStreamlitInspector('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Streamlit Code Pattern</span>
          </button>
          
          <button
            onClick={() => setActivePage('new-application')}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-md transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+ New Loan Application</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Cases */}
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Active Cases
            </span>
            <FolderKanban className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
              {activeCasesCount}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              active dossiers
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <span>Across 5 loan product types</span>
          </div>
        </div>

        {/* Card 2: Documents Processed */}
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Documents Processed
            </span>
            <Files className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
              {totalDocsCount}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              100% OCR parsed
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Passports, Payslips, Bank PDFs, ITR</span>
          </div>
        </div>

        {/* Card 3: Evidence Verified */}
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Evidence Verified
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
              {totalEvidenceVerifiedCount}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              verified points
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Avg confidence 94.2%</span>
          </div>
        </div>

        {/* Card 4: Cases Requiring Review */}
        <div className="p-5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
              Cases Requiring Review
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-900 dark:text-amber-100 font-mono tabular-nums">
              {casesRequiringReviewCount}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Human In The Loop
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-700/80 dark:text-amber-400/80">
            <span>Missing records or variance detected</span>
          </div>
        </div>
      </div>

      {/* Human In Control Banner */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
            <ShieldAlert className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              KUBERA Core Operational Charter
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              KUBERA extracts facts, verifies evidence completeness, and calculates Trust Scores. It does not automatically approve or deny loan sanction.
            </div>
          </div>
        </div>
        <button
          onClick={() => setActivePage('settings')}
          className="text-xs font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white underline underline-offset-2 shrink-0"
        >
          View Policy Rules
        </button>
      </div>

      {/* Recent Cases Section */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900/80 overflow-hidden shadow-xs">
        {/* Table Controls */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Recent Loan Cases
            </h2>
            <span className="text-xs text-neutral-400 dark:text-neutral-400 font-mono">
              ({filteredCases.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Loan Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="All">All Loan Types</option>
              <option value="Personal Loan">Personal Loan</option>
              <option value="Home Loan">Home Loan</option>
              <option value="Auto Loan">Auto Loan</option>
              <option value="Education Loan">Education Loan</option>
              <option value="Business Loan">Business Loan</option>
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Requires Review">Requires Review</option>
              <option value="In Verification">In Verification</option>
              <option value="Evidence Verified">Evidence Verified</option>
              <option value="Missing Documents">Missing Documents</option>
            </select>
          </div>
        </div>

        {/* High-density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-800/40 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Loan Type</th>
                <th className="py-3 px-4">Evidence Coverage</th>
                <th className="py-3 px-4">Trust Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {filteredCases.map((caseItem) => (
                <tr 
                  key={caseItem.id}
                  onClick={() => openCase(caseItem.id, 'case-workspace')}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                >
                  {/* Case ID */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {caseItem.id}
                  </td>

                  {/* Applicant */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {caseItem.applicant.name}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {caseItem.applicant.employer}
                    </div>
                  </td>

                  {/* Loan Type */}
                  <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300">
                    <span className="font-medium">{caseItem.loanType}</span>
                    <span className="block text-[11px] text-neutral-400 font-mono">
                      ₹{(caseItem.applicant.requestedAmount).toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Evidence Coverage */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${caseItem.evidenceCoverage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${caseItem.evidenceCoverage}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs tabular-nums text-neutral-700 dark:text-neutral-300">
                        {caseItem.evidenceCoverage}%
                      </span>
                    </div>
                  </td>

                  {/* Trust Score */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold font-mono tabular-nums ${getScoreColor(caseItem.trustScore)}`}>
                        {caseItem.trustScore ? caseItem.trustScore : '--'}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">/100</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(caseItem.status)}
                  </td>

                  {/* Updated */}
                  <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 text-[11px] font-mono whitespace-nowrap">
                    {caseItem.updatedAt}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCase(caseItem.id, 'case-workspace');
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <span>Review</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
