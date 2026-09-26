import React from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { ActivePage } from '../../types';
import { 
  LayoutDashboard, 
  FilePlus, 
  FolderKanban, 
  Briefcase, 
  FileSearch, 
  TableProperties, 
  ShieldAlert, 
  GitCompare, 
  History, 
  Settings,
  ShieldCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface NavItem {
  id: ActivePage;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'default' | 'amber' | 'emerald';
  isCaseSpecific?: boolean;
}

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, activeCase, cases } = useCaseContext();

  const casesRequiringReview = cases.filter(c => c.status === 'Requires Review').length;
  const contradictionCount = activeCase.contradictions.filter(c => c.status === 'Requires Human Review').length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Decision Console',
      icon: LayoutDashboard,
    },
    {
      id: 'new-application',
      label: 'New Application',
      icon: FilePlus,
    },
    {
      id: 'active-cases',
      label: 'Active Cases',
      icon: FolderKanban,
      badge: cases.length,
    },
    {
      id: 'case-workspace',
      label: 'Case Workspace',
      icon: Briefcase,
      isCaseSpecific: true,
    },
    {
      id: 'document-review',
      label: 'Document Review',
      icon: FileSearch,
      isCaseSpecific: true,
      badge: activeCase.documents.length,
    },
    {
      id: 'evidence-matrix',
      label: 'Evidence Matrix',
      icon: TableProperties,
      isCaseSpecific: true,
    },
    {
      id: 'assessment',
      label: 'Trust Assessment',
      icon: ShieldAlert,
      isCaseSpecific: true,
      badge: `${activeCase.trustScore}/100`,
      badgeVariant: activeCase.trustScore >= 80 ? 'emerald' : 'amber',
    },
    {
      id: 'contradictions',
      label: 'Contradiction Review',
      icon: GitCompare,
      isCaseSpecific: true,
      badge: contradictionCount > 0 ? contradictionCount : undefined,
      badgeVariant: 'amber',
    },
    {
      id: 'audit-trail',
      label: 'Audit Trail',
      icon: History,
      isCaseSpecific: true,
    },
    {
      id: 'settings',
      label: 'System & Policies',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] transition-colors select-none">
      {/* Current Active Case Contextual Pill */}
      <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800">
        <div className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Active Case Context</span>
          <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">{activeCase.updatedAt}</span>
        </div>
        <div 
          onClick={() => setActivePage('case-workspace')}
          className="p-2 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 font-mono tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {activeCase.id}
            </span>
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              {activeCase.loanType}
            </span>
          </div>
          <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate mt-0.5">
            {activeCase.applicant.name}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>Score: <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-200">{activeCase.trustScore}</span></span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">Review Needed</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 px-2 py-1">
          Core Operations
        </div>

        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-neutral-900' : 'text-neutral-500 dark:text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                  isActive 
                    ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-800'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 px-2 py-1">
          Case Deep-Dive
        </div>

        {navItems.slice(3, 9).map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-neutral-900' : 'text-neutral-500 dark:text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                  isActive
                    ? 'bg-neutral-800 text-neutral-100 dark:bg-neutral-300 dark:text-neutral-900'
                    : item.badgeVariant === 'amber'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                    : item.badgeVariant === 'emerald'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 px-2 py-1">
          Governance
        </div>

        {navItems.slice(9).map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-neutral-900' : 'text-neutral-500 dark:text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Human-in-the-Loop Governance Notice */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/80">
        <div className="flex items-start gap-2 text-neutral-600 dark:text-neutral-400">
          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-neutral-900 dark:text-neutral-200 block mb-0.5">
              Human-in-the-Loop Gate
            </span>
            <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">
              KUBERA assists evidence evaluation. Loan officers retain final sanction authority.
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
