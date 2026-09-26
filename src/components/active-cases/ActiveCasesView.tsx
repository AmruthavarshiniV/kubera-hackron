import React, { useState } from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  SlidersHorizontal,
  FolderOpen,
  Code2,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { LoanType, CaseStatus } from '../../types';

export const ActiveCasesView: React.FC = () => {
  const { cases, openCase, searchQuery, setSearchQuery, openStreamlitInspector } = useCaseContext();

  const [selectedLoanType, setSelectedLoanType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [minTrustScore, setMinTrustScore] = useState<number>(0);

  const filteredCases = cases.filter(c => {
    // Search query matches ID, name, pan, employer
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      c.id.toLowerCase().includes(query) ||
      c.applicant.name.toLowerCase().includes(query) ||
      c.applicant.pan.toLowerCase().includes(query) ||
      c.applicant.employer.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (selectedLoanType !== 'All' && c.loanType !== selectedLoanType) return false;
    if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
    if (c.trustScore < minTrustScore) return false;

    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Active Credit Cases
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Enterprise portfolio queue for evidence verification, document OCR audit, and trust score review.
          </p>
        </div>

        <button
          onClick={() => openStreamlitInspector('cases_table')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors self-start sm:self-auto"
        >
          <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Streamlit Dataframe / Grid</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by applicant, ID, PAN, employer..."
              className="w-full text-xs pl-9 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
            />
          </div>

          {/* Loan Type Filter */}
          <select
            value={selectedLoanType}
            onChange={(e) => setSelectedLoanType(e.target.value)}
            className="text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="All">All Loan Types</option>
            <option value="Personal Loan">Personal Loan</option>
            <option value="Home Loan">Home Loan</option>
            <option value="Auto Loan">Auto Loan</option>
            <option value="Education Loan">Education Loan</option>
            <option value="Business Loan">Business Loan</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Requires Review">Requires Review</option>
            <option value="In Verification">In Verification</option>
            <option value="Evidence Verified">Evidence Verified</option>
            <option value="Missing Documents">Missing Documents</option>
          </select>
        </div>

        {/* Score Threshold */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span>Min Trust Score:</span>
          <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200 w-6">
            {minTrustScore}
          </span>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minTrustScore}
            onChange={(e) => setMinTrustScore(Number(e.target.value))}
            className="w-24 accent-neutral-900 dark:accent-white"
          />
        </div>
      </div>

      {/* Cases Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-800/40 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Applicant & Entity</th>
                <th className="py-3 px-4">Product & Amount</th>
                <th className="py-3 px-4">Evidence Coverage</th>
                <th className="py-3 px-4">Trust Score</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-4">Officer</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => openCase(c.id, 'case-workspace')}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {c.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {c.applicant.name}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {c.applicant.employer}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">
                      {c.loanType}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      ₹{c.applicant.requestedAmount.toLocaleString('en-IN')} · {c.applicant.tenureMonths}m
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${c.evidenceCoverage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${c.evidenceCoverage}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs tabular-nums text-neutral-700 dark:text-neutral-300">
                        {c.evidenceCoverage}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold font-mono tabular-nums ${
                        !c.trustScore ? 'text-neutral-400' : c.trustScore >= 85 ? 'text-emerald-600 dark:text-emerald-400' : c.trustScore >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {c.trustScore ? c.trustScore : '--'}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">/100</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {c.status === 'Requires Review' ? (
                      <span className="text-amber-700 dark:text-amber-400 font-medium inline-flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                        Requires Review
                      </span>
                    ) : c.status === 'Evidence Verified' ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                        Evidence Verified
                      </span>
                    ) : (
                      <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                        {c.status}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400 text-xs">
                    {c.assignedOfficer.split(' ')[0]}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                    {c.updatedAt}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCase(c.id, 'case-workspace');
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <span>Open Workspace</span>
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
