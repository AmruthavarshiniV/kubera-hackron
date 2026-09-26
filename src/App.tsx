/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CaseProvider, useCaseContext } from './context/CaseContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { NewApplicationWizard } from './components/new-application/NewApplicationWizard';
import { ActiveCasesView } from './components/active-cases/ActiveCasesView';
import { CaseWorkspace } from './components/workspace/CaseWorkspace';
import { DocumentReviewView } from './components/document-review/DocumentReviewView';
import { EvidenceMatrixView } from './components/evidence-matrix/EvidenceMatrixView';
import { AssessmentView } from './components/assessment/AssessmentView';
import { ContradictionReviewView } from './components/contradiction/ContradictionReviewView';
import { AuditTrailView } from './components/audit-trail/AuditTrailView';
import { SettingsView } from './components/settings/SettingsView';
import { StreamlitInspectorModal } from './components/streamlit/StreamlitInspectorModal';

const AppContent: React.FC = () => {
  const { activePage } = useCaseContext();

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView />;
      case 'new-application':
        return <NewApplicationWizard />;
      case 'active-cases':
        return <ActiveCasesView />;
      case 'case-workspace':
        return <CaseWorkspace />;
      case 'document-review':
        return <DocumentReviewView />;
      case 'evidence-matrix':
        return <EvidenceMatrixView />;
      case 'assessment':
        return <AssessmentView />;
      case 'contradictions':
        return <ContradictionReviewView />;
      case 'audit-trail':
        return <AuditTrailView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-w-0 pb-16">
          {renderActivePage()}
        </main>
      </div>
      <StreamlitInspectorModal />
    </div>
  );
};

export default function App() {
  return (
    <CaseProvider>
      <AppContent />
    </CaseProvider>
  );
}
