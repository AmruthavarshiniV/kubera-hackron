import React, { useState } from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Filter, 
  ArrowUpRight,
  Code2,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { EvidenceMatrixItem } from '../../types';

export const EvidenceMatrixView: React.FC = () => {
  const { activeCase, openStreamlitInspector, addAuditEvent } = useCaseContext();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [evidenceList, setEvidenceList] = useState<EvidenceMatrixItem[]>(activeCase.evidenceMatrix);

  // Sync if active case changes
  React.useEffect(() => {
    setEvidenceList(activeCase.evidenceMatrix);
  }, [activeCase]);

  const toggleVerify = (id: string) => {
    setEvidenceList(prev => prev.map(item => {
      if (item.id === id) {
        const nextVerified = !item.verified;
        addAuditEvent(
          `Evidence Check: ${item.evidence}`,
          'Officer R. Sharma',
          `Toggled verification state to ${nextVerified ? 'Verified' : 'Unverified'}`
        );
        return {
          ...item,
          verified: nextVerified,
          status: nextVerified ? 'Verified' : item.found ? 'Incomplete' : 'Missing',
        };
      }
      return item;
    }));
  };

  const filteredItems = evidenceList.filter(item => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    return true;
  });

  const getStatusBadge = (status: EvidenceMatrixItem['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Verified
          </span>
        );
      case 'Incomplete':
        return (
          <span className="inline-flex items-center text-xs font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Incomplete
          </span>
        );
      case 'Missing':
        return (
          <span className="inline-flex items-center text-xs font-semibold text-rose-700 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Missing
          </span>
        );
      case 'Mismatch':
        return (
          <span className="inline-flex items-center text-xs font-semibold text-purple-700 dark:text-purple-400">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Mismatch
          </span>
        );
    }
  };

  const verifiedCount = evidenceList.filter(e => e.verified).length;
  const coveragePercent = Math.round((verifiedCount / (evidenceList.length || 1)) * 100);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Evidence Matrix & Checklist
            </h1>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              · Case {activeCase.id}
            </span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Systematic cross-examination of mandatory loan evidence requirements, document freshness, and extraction confidence.
          </p>
        </div>

        <button
          onClick={() => openStreamlitInspector('evidence_matrix')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors self-start sm:self-auto"
        >
          <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Streamlit Matrix Code</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Total Checklist Items
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-900 dark:text-white">
            {evidenceList.length}
          </div>
          <span className="text-[11px] text-neutral-400">
            Grounded in {activeCase.loanType} Underwriting Policy
          </span>
        </div>

        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Verified Evidence Items
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {verifiedCount} / {evidenceList.length}
          </div>
          <span className="text-[11px] text-neutral-400">
            {coveragePercent}% policy coverage
          </span>
        </div>

        <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
          <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
            Items Requiring Human Attention
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-900 dark:text-amber-100">
            {evidenceList.filter(e => !e.verified).length}
          </div>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
            Pending statement duration & pay reconciliation
          </span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900/80 overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-3.5 px-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/70 dark:bg-neutral-800/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Evidence Checklist Table
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Filter Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Identity">Identity</option>
              <option value="Income">Income</option>
              <option value="Banking">Banking</option>
              <option value="Employment">Employment</option>
              <option value="Collateral">Collateral</option>
            </select>
          </div>
        </div>

        {/* High Density Evidence Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-800/60 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Evidence</th>
                <th className="py-3 px-4">Required</th>
                <th className="py-3 px-4">Found</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4">Freshness</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Officer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {filteredItems.map((item) => (
                <tr 
                  key={item.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  {/* Evidence Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.evidence}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Category: {item.category}
                    </div>
                  </td>

                  {/* Required Column */}
                  <td className="py-3.5 px-4 font-mono">
                    {item.required ? (
                      <span className="text-neutral-900 dark:text-neutral-200 font-medium">Yes</span>
                    ) : (
                      <span className="text-neutral-400">Optional</span>
                    )}
                  </td>

                  {/* Found Column */}
                  <td className="py-3.5 px-4">
                    {item.found ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">Found</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold font-mono">Missing</span>
                    )}
                  </td>

                  {/* Verified Column */}
                  <td className="py-3.5 px-4">
                    {item.verified ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Yes
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Freshness Column */}
                  <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300">
                    <span className="font-mono text-[11px]">{item.freshness}</span>
                  </td>

                  {/* Confidence Column */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-semibold tabular-nums text-neutral-800 dark:text-neutral-200">
                      {item.confidence}%
                    </span>
                  </td>

                  {/* Source Column */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded inline-block truncate max-w-[200px]" title={item.source}>
                      {item.source}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Officer Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleVerify(item.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        item.verified
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {item.verified ? 'Mark Unverified' : 'Verify Evidence'}
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
