import React from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { 
  Sun, 
  Moon, 
  Code2, 
  PlusCircle, 
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    activeCase, 
    theme, 
    toggleTheme, 
    openStreamlitInspector,
    searchQuery,
    setSearchQuery,
    apiLoading
  } = useCaseContext();

  const getBreadcrumb = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Decision Console';
      case 'new-application':
        return 'New Application Intake';
      case 'active-cases':
        return 'Active Credit Cases';
      case 'case-workspace':
        return `Case Workspace · ${activeCase.id}`;
      case 'document-review':
        return `Document Review · ${activeCase.id}`;
      case 'evidence-matrix':
        return `Evidence Matrix · ${activeCase.id}`;
      case 'assessment':
        return `Trust Assessment · ${activeCase.id}`;
      case 'contradictions':
        return `Contradiction Review · ${activeCase.id}`;
      case 'audit-trail':
        return `Immutable Audit Trail · ${activeCase.id}`;
      case 'settings':
        return 'Policy Engine & System Settings';
      default:
        return 'Decision Console';
    }
  };

  return (
    <header className="h-16 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Zone 1: Single text wordmark with subtle security mark */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setActivePage('dashboard')} 
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold text-sm tracking-widest shadow-sm">
            K
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white block leading-none">
              KUBERA
            </span>
            <span className="text-[10px] tracking-wider uppercase text-neutral-400 dark:text-neutral-400 font-medium">
              Decision Intelligence
            </span>
          </div>
        </button>

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <span className="text-neutral-400 dark:text-neutral-400">KUBERA</span>
          <span>/</span>
          <span className="text-neutral-900 dark:text-neutral-200 font-semibold">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Zone 2: Fast Search & Quick Links */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case ID, applicant name, PAN, or employer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: 1-2 Primary Actions, Streamlit Blueprint & Officer Profile */}
      <div className="flex items-center gap-3">
        {/* Backend status indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
          <span className={`w-2 h-2 rounded-full ${apiLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span>{apiLoading ? 'API Processing...' : '127.0.0.1:8000'}</span>
        </div>

        {/* Streamlit Component Blueprint button */}
        <button
          onClick={() => openStreamlitInspector('all')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          title="Inspect and copy Python / Streamlit code for these components"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Streamlit Blueprint</span>
        </button>

        {/* New Application CTA */}
        <button
          onClick={() => setActivePage('new-application')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-md shadow-sm transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Application</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Officer Status / Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
          <div className="w-7 h-7 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs flex items-center justify-center border border-neutral-300 dark:border-neutral-700">
            RS
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 block leading-tight">
              R. Sharma
            </span>
            <span className="text-[10px] text-neutral-400 block leading-tight">
              Senior Underwriter
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
