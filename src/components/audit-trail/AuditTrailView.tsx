import React from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { 
  History, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Hash, 
  UserCheck, 
  Cpu, 
  Code2, 
  FileSearch, 
  ExternalLink 
} from 'lucide-react';
import { AuditEvent } from '../../types';

export const AuditTrailView: React.FC = () => {
  const { activeCase, openStreamlitInspector } = useCaseContext();

  const getActorIcon = (category: AuditEvent['category']) => {
    switch (category) {
      case 'Officer':
        return <UserCheck className="w-3.5 h-3.5 text-blue-500" />;
      case 'System':
        return <Cpu className="w-3.5 h-3.5 text-purple-500" />;
      case 'Policy':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />;
      case 'Ingestion':
        return <FileSearch className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Immutable Case Audit Trail
            </h1>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              · Case {activeCase.id}
            </span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Chronological, cryptographically hashed event ledger recording every automated extraction and human underwriter action.
          </p>
        </div>

        <button
          onClick={() => openStreamlitInspector('audit_trail')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors self-start sm:self-auto"
        >
          <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Streamlit Audit Timeline Code</span>
        </button>
      </div>

      {/* Ledger Security Banner */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              Cryptographic Integrity Chain
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Each state transition produces an immutable SHA-256 block hash for banking compliance and RBI auditing.
            </div>
          </div>
        </div>

        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800">
          Chain Valid
        </span>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-px before:bg-neutral-200 dark:before:bg-neutral-800">
        {activeCase.auditTrail.map((event, index) => (
          <div key={event.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-400 dark:border-neutral-600 flex items-center justify-center group-hover:border-neutral-900 dark:group-hover:border-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white" />
            </div>

            {/* Event Card */}
            <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">
                    {event.action}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {getActorIcon(event.category)}
                    <span>{event.actor}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-neutral-400">
                    {event.timestamp}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                    {event.hash}
                  </span>
                </div>
              </div>

              <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {event.details}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
