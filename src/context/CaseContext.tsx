import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LoanCase, 
  ActivePage, 
  VerificationState, 
  AuditEvent 
} from '../types';
import { INITIAL_CASES } from '../data/mockData';
import { kuberaApi } from '../services/api';
import { mapBackendCaseToLoanCase } from '../services/caseMapper';

interface CaseContextType {
  cases: LoanCase[];
  activeCaseId: string;
  activeCase: LoanCase;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedDocumentId: string;
  setSelectedDocumentId: (id: string) => void;
  selectedFieldId: string | null;
  setSelectedFieldId: (id: string | null) => void;
  workspaceSubTab: 'overview' | 'documents' | 'evidence' | 'assessment' | 'contradictions' | 'audit';
  setWorkspaceSubTab: (tab: 'overview' | 'documents' | 'evidence' | 'assessment' | 'contradictions' | 'audit') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  loanTypeFilter: string;
  setLoanTypeFilter: (t: string) => void;
  isStreamlitModalOpen: boolean;
  setIsStreamlitModalOpen: (open: boolean) => void;
  streamlitTargetSnippet: string;
  setStreamlitTargetSnippet: (target: string) => void;
  openStreamlitInspector: (snippetKey?: string) => void;
  openCase: (caseId: string, page?: ActivePage, subTab?: 'overview' | 'documents' | 'evidence' | 'assessment' | 'contradictions' | 'audit') => void;
  verifyField: (docId: string, fieldId: string, newState: VerificationState, overrideValue?: string) => void;
  resolveContradiction: (contradictionId: string, resolutionNote: string, action: 'Resolved by Officer' | 'Clarification Requested') => void;
  recordOfficerAssessmentDecision: (action: string, comments: string) => void;
  addNewCase: (createdCase: LoanCase) => void;
  addAuditEvent: (action: string, actor: string, details: string, category?: 'System' | 'Officer' | 'Policy' | 'Ingestion') => void;

  // Real Backend Integration & Async State
  apiLoading: boolean;
  apiError: string | null;
  clearApiError: () => void;
  createBackendCase: (loanType: string) => Promise<string>;
  uploadBackendDocument: (file: File, docType: string) => Promise<any>;
  runBackendExtraction: () => Promise<any>;
  runBackendAnalysis: () => Promise<any>;
  refreshBackendCase: (caseId?: string) => Promise<LoanCase | null>;
  getBackendDecision: (caseId?: string) => Promise<any>;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with INITIAL_CASES as fallback for dashboard
  const [cases, setCases] = useState<LoanCase[]>(INITIAL_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>('KUB-2026-0842');
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('doc-003');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>('f-011');
  const [workspaceSubTab, setWorkspaceSubTab] = useState<'overview' | 'documents' | 'evidence' | 'assessment' | 'contradictions' | 'audit'>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loanTypeFilter, setLoanTypeFilter] = useState('All');
  const [isStreamlitModalOpen, setIsStreamlitModalOpen] = useState(false);
  const [streamlitTargetSnippet, setStreamlitTargetSnippet] = useState('all');

  // Backend state
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const clearApiError = () => setApiError(null);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];

  const openStreamlitInspector = (snippetKey = 'all') => {
    setStreamlitTargetSnippet(snippetKey);
    setIsStreamlitModalOpen(true);
  };

  const openCase = (caseId: string, page: ActivePage = 'case-workspace', subTab?: 'overview' | 'documents' | 'evidence' | 'assessment' | 'contradictions' | 'audit') => {
    setActiveCaseId(caseId);
    setActivePage(page);
    if (subTab) {
      setWorkspaceSubTab(subTab);
    }
    const foundCase = cases.find(c => c.id === caseId);
    if (foundCase && foundCase.documents.length > 0) {
      setSelectedDocumentId(foundCase.documents[0].id);
      if (foundCase.documents[0].extractedFields.length > 0) {
        setSelectedFieldId(foundCase.documents[0].extractedFields[0].id);
      }
    }
  };

  const addAuditEvent = (action: string, actor: string, details: string, category: 'System' | 'Officer' | 'Policy' | 'Ingestion' = 'Officer') => {
    const newEvent: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST',
      action,
      actor,
      details,
      hash: '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6),
      category,
    };

    setCases(prev => prev.map(c => {
      if (c.id === activeCaseId) {
        return {
          ...c,
          auditTrail: [newEvent, ...c.auditTrail],
          updatedAt: 'Just now',
        };
      }
      return c;
    }));
  };

  const verifyField = (docId: string, fieldId: string, newState: VerificationState, overrideValue?: string) => {
    setCases(prev => prev.map(c => {
      if (c.id !== activeCaseId) return c;

      const updatedDocs = c.documents.map(doc => {
        if (doc.id !== docId) return doc;
        const updatedFields = doc.extractedFields.map(f => {
          if (f.id !== fieldId) return f;
          return {
            ...f,
            verificationState: newState,
            value: overrideValue !== undefined ? overrideValue : f.value,
          };
        });
        return { ...doc, extractedFields: updatedFields };
      });

      return {
        ...c,
        documents: updatedDocs,
        updatedAt: 'Just now',
      };
    }));

    addAuditEvent(
      `Field ${newState}: ${fieldId}`,
      'Officer R. Sharma',
      `Manual status change to "${newState}"${overrideValue ? ` with overridden value "${overrideValue}"` : ''}`,
      'Officer'
    );
  };

  const resolveContradiction = (contradictionId: string, resolutionNote: string, action: 'Resolved by Officer' | 'Clarification Requested') => {
    setCases(prev => prev.map(c => {
      if (c.id !== activeCaseId) return c;

      const updatedContradictions = c.contradictions.map(contra => {
        if (contra.id !== contradictionId) return contra;
        return {
          ...contra,
          status: action,
          resolutionNote,
          resolvedBy: 'Officer R. Sharma',
          resolvedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        };
      });

      const newConsistency = action === 'Resolved by Officer' 
        ? Math.min(94, c.trustScoreBreakdown.crossDocConsistency + 18) 
        : c.trustScoreBreakdown.crossDocConsistency;

      const newTrustScore = Math.round(
        (c.trustScoreBreakdown.documentIntegrity * 0.2) +
        (c.trustScoreBreakdown.extractionConfidence * 0.2) +
        (c.trustScoreBreakdown.evidenceCompleteness * 0.25) +
        (newConsistency * 0.2) +
        (c.trustScoreBreakdown.policyCompliance * 0.15)
      );

      return {
        ...c,
        contradictions: updatedContradictions,
        trustScoreBreakdown: {
          ...c.trustScoreBreakdown,
          crossDocConsistency: newConsistency,
        },
        trustScore: newTrustScore,
        updatedAt: 'Just now',
      };
    }));

    addAuditEvent(
      action === 'Resolved by Officer' ? 'Contradiction Resolved by Officer' : 'Clarification Requested on Contradiction',
      'Officer R. Sharma',
      `Note: ${resolutionNote}`,
      'Officer'
    );
  };

  const recordOfficerAssessmentDecision = (action: string, comments: string) => {
    setCases(prev => prev.map(c => {
      if (c.id !== activeCaseId) return c;
      return {
        ...c,
        status: action === 'Request Missing Evidence' ? 'Missing Documents' : action === 'Escalate Case' ? 'Escalated' : 'Evidence Verified',
        officerDecision: {
          action,
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
          officer: 'Officer R. Sharma',
          comment: comments,
        },
        updatedAt: 'Just now',
      };
    }));

    addAuditEvent(
      `Officer Action: ${action}`,
      'Officer R. Sharma',
      comments || `Recorded decision action: ${action}`,
      'Officer'
    );
  };

  const addNewCase = (newCase: LoanCase) => {
    setCases(prev => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setActivePage('case-workspace');
    setWorkspaceSubTab('overview');
  };

  // ==========================================
  // REAL BACKEND ACTIONS (FastAPI 127.0.0.1:8000)
  // ==========================================

  /**
   * Refreshes a case directly from GET /api/cases/{caseId}
   * and merges into the cases state as the source of truth.
   */
  const refreshBackendCase = async (targetCaseId?: string): Promise<LoanCase | null> => {
    const idToFetch = targetCaseId || activeCaseId;
    if (!idToFetch) return null;

    try {
      setApiLoading(true);
      setApiError(null);

      const rawCase = await kuberaApi.getCase(idToFetch);
      
      // Optionally fetch decision data if available
      let rawDecision = null;
      try {
        rawDecision = await kuberaApi.getDecision(idToFetch);
      } catch {
        // Decision may not exist yet if analyze has not run
      }

      const existing = cases.find(c => c.id === idToFetch);
      const mappedCase = mapBackendCaseToLoanCase(rawCase, rawDecision, existing);

      setCases(prev => {
        const index = prev.findIndex(c => c.id === idToFetch);
        if (index >= 0) {
          const next = [...prev];
          next[index] = mappedCase;
          return next;
        } else {
          return [mappedCase, ...prev];
        }
      });

      return mappedCase;
    } catch (err: any) {
      const msg = err.message || 'Failed to refresh case from backend';
      setApiError(msg);
      console.error('[KUBERA API] Error refreshing case:', err);
      return null;
    } finally {
      setApiLoading(false);
    }
  };

  /**
   * 1. Call POST /api/cases
   * 2. Get real case_id
   * 3. Set activeCaseId
   * 4. Refresh from GET /api/cases/{case_id}
   */
  const createBackendCase = async (loanType: string): Promise<string> => {
    try {
      setApiLoading(true);
      setApiError(null);

      const response = await kuberaApi.createCase(loanType);
      const realCaseId = response.case_id;

      setActiveCaseId(realCaseId);

      // Create initial shell
      const initialCase = mapBackendCaseToLoanCase(
        { case_id: realCaseId, loan_type: loanType },
        undefined,
        undefined
      );
      setCases(prev => [initialCase, ...prev.filter(c => c.id !== realCaseId)]);

      // Refresh case to load initial backend state
      try {
        await refreshBackendCase(realCaseId);
      } catch (refreshErr) {
        console.warn('[KUBERA API] Initial refresh notice:', refreshErr);
      }

      addAuditEvent(
        'Backend Case Initialized',
        'FastAPI Service (POST /api/cases)',
        `Initialized case ${realCaseId} for product: ${loanType}`,
        'System'
      );

      return realCaseId;
    } catch (err: any) {
      const msg = err.message || 'Failed to create case on backend';
      setApiError(msg);
      console.error('[KUBERA API] Error creating case:', err);
      throw err;
    } finally {
      setApiLoading(false);
    }
  };

  /**
   * Uploads real document file to POST /api/cases/{case_id}/documents
   * and refreshes the case.
   */
  const uploadBackendDocument = async (file: File, docType: string): Promise<any> => {
    if (!activeCaseId) {
      throw new Error('No active case selected for upload');
    }

    try {
      setApiLoading(true);
      setApiError(null);

      const result = await kuberaApi.uploadDocument(activeCaseId, file, docType);
      
      // Refresh case after upload to get updated document list
      await refreshBackendCase(activeCaseId);

      addAuditEvent(
        'Document Ingested via Backend',
        'POST /api/cases/{id}/documents',
        `File ${file.name} uploaded as ${docType}`,
        'Ingestion'
      );

      return result;
    } catch (err: any) {
      const msg = err.message || 'Failed to upload document to backend';
      setApiError(msg);
      console.error('[KUBERA API] Error uploading document:', err);
      throw err;
    } finally {
      setApiLoading(false);
    }
  };

  /**
   * Triggers POST /api/cases/{case_id}/extract
   * and refreshes the case.
   */
  const runBackendExtraction = async (): Promise<any> => {
    if (!activeCaseId) {
      throw new Error('No active case selected for extraction');
    }

    try {
      setApiLoading(true);
      setApiError(null);

      const result = await kuberaApi.extract(activeCaseId);
      await refreshBackendCase(activeCaseId);

      addAuditEvent(
        'OCR Extraction Executed',
        'POST /api/cases/{id}/extract',
        `Document layout OCR and target entity extraction pipeline completed`,
        'System'
      );

      return result;
    } catch (err: any) {
      const msg = err.message || 'Extraction failed on backend';
      setApiError(msg);
      console.error('[KUBERA API] Error extracting entities:', err);
      throw err;
    } finally {
      setApiLoading(false);
    }
  };

  /**
   * Triggers POST /api/cases/{case_id}/analyze
   * Then calls GET /api/cases/{case_id}/decision
   * and refreshes the case.
   */
  const runBackendAnalysis = async (): Promise<any> => {
    if (!activeCaseId) {
      throw new Error('No active case selected for analysis');
    }

    try {
      setApiLoading(true);
      setApiError(null);

      // 1. Analyze
      const analyzeResult = await kuberaApi.analyze(activeCaseId);

      // 2. Get Decision
      const decisionResult = await kuberaApi.getDecision(activeCaseId);

      // 3. Refresh Case to pull all updated fields
      await refreshBackendCase(activeCaseId);

      addAuditEvent(
        'Evidence Analysis & Decision Computed',
        'POST /api/cases/{id}/analyze & GET /decision',
        `Trust score and cross-document evidence analysis synchronized with backend`,
        'Policy'
      );

      return { analyzeResult, decisionResult };
    } catch (err: any) {
      const msg = err.message || 'Analysis failed on backend';
      setApiError(msg);
      console.error('[KUBERA API] Error analyzing case:', err);
      throw err;
    } finally {
      setApiLoading(false);
    }
  };

  /**
   * Calls GET /api/cases/{case_id}/decision
   */
  const getBackendDecision = async (caseId?: string): Promise<any> => {
    const idToQuery = caseId || activeCaseId;
    if (!idToQuery) return null;

    try {
      setApiLoading(true);
      setApiError(null);
      return await kuberaApi.getDecision(idToQuery);
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch decision from backend';
      setApiError(msg);
      console.error('[KUBERA API] Error getting decision:', err);
      throw err;
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <CaseContext.Provider
      value={{
        cases,
        activeCaseId,
        activeCase,
        activePage,
        setActivePage,
        selectedDocumentId,
        setSelectedDocumentId,
        selectedFieldId,
        setSelectedFieldId,
        workspaceSubTab,
        setWorkspaceSubTab,
        theme,
        toggleTheme,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        loanTypeFilter,
        setLoanTypeFilter,
        isStreamlitModalOpen,
        setIsStreamlitModalOpen,
        streamlitTargetSnippet,
        setStreamlitTargetSnippet,
        openStreamlitInspector,
        openCase,
        verifyField,
        resolveContradiction,
        recordOfficerAssessmentDecision,
        addNewCase,
        addAuditEvent,

        // Real backend values
        apiLoading,
        apiError,
        clearApiError,
        createBackendCase,
        uploadBackendDocument,
        runBackendExtraction,
        runBackendAnalysis,
        refreshBackendCase,
        getBackendDecision,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCaseContext = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCaseContext must be used within a CaseProvider');
  }
  return context;
};
