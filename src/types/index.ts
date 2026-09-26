export type LoanType = 
  | 'Personal Loan'
  | 'Home Loan'
  | 'Auto Loan'
  | 'Education Loan'
  | 'Business Loan';

export type CaseStatus = 
  | 'Requires Review'
  | 'In Verification'
  | 'Evidence Verified'
  | 'Missing Documents'
  | 'Escalated';

export type EvidenceState = 
  | 'REQUIRES HUMAN REVIEW'
  | 'VERIFIED & COMPLETE'
  | 'CRITICAL EVIDENCE MISSING'
  | 'INCONSISTENCY DETECTED';

export type VerificationState = 
  | 'Verified by System'
  | 'Officer Confirmed'
  | 'Needs Review'
  | 'Manual Override';

export interface BoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ExtractedField {
  id: string;
  key: string;
  value: string;
  confidence: number; // 0 - 100
  verificationState: VerificationState;
  source: {
    page: number;
    textSnippet: string;
    boundingBox?: BoundingBox;
  };
  crossRefDocId?: string;
  notes?: string;
}

export interface DocumentItem {
  id: string;
  fileName: string;
  fileSize: string;
  detectedType: string;
  pages: number;
  processingStatus: 'Processed' | 'Processing' | 'Failed' | 'Queued';
  extractionConfidence: number;
  evidenceStatus: 'Verified' | 'Pending Review' | 'Discrepancy' | 'Missing Pages';
  uploadedAt: string;
  checksum: string;
  integrityPassed: boolean;
  mimeType: string;
  extractedFields: ExtractedField[];
  previewContent?: {
    header: string;
    issuer: string;
    issueDate: string;
    sections: { label: string; value: string; isKeyField?: boolean }[];
    notes?: string;
  };
}

export interface EvidenceMatrixItem {
  id: string;
  evidence: string;
  required: boolean;
  found: boolean;
  verified: boolean;
  freshness: string;
  confidence: number;
  source: string;
  status: 'Verified' | 'Incomplete' | 'Missing' | 'Mismatch';
  category: 'Identity' | 'Income' | 'Banking' | 'Employment' | 'Collateral' | 'Business';
}

export interface ContradictionItem {
  id: string;
  title: string;
  severity: 'Medium' | 'High' | 'Low';
  itemA: {
    docName: string;
    label: string;
    value: string;
    sourcePage: number;
  };
  itemB: {
    docName: string;
    label: string;
    value: string;
    sourcePage: number;
  };
  difference: string;
  aiHypothesis: string;
  status: 'Requires Human Review' | 'Resolved by Officer' | 'Clarification Requested';
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  hash: string;
  category: 'System' | 'Officer' | 'Policy' | 'Ingestion';
}

export interface LoanCase {
  id: string;
  applicant: {
    name: string;
    email: string;
    phone: string;
    pan: string;
    employer: string;
    requestedAmount: number;
    tenureMonths: number;
    address: string;
  };
  loanType: LoanType;
  evidenceCoverage: number; // percentage
  trustScore: number; // 0 - 100
  status: CaseStatus;
  evidenceState: EvidenceState;
  updatedAt: string;
  createdAt: string;
  assignedOfficer: string;
  trustScoreBreakdown: {
    documentIntegrity: number;
    extractionConfidence: number;
    evidenceCompleteness: number;
    crossDocConsistency: number;
    policyCompliance: number;
  };
  explanations: string[];
  recommendedAction: string;
  documents: DocumentItem[];
  evidenceMatrix: EvidenceMatrixItem[];
  contradictions: ContradictionItem[];
  auditTrail: AuditEvent[];
  officerDecision?: {
    action: string;
    timestamp: string;
    officer: string;
    comment: string;
  };
}

export type ActivePage = 
  | 'dashboard'
  | 'new-application'
  | 'active-cases'
  | 'case-workspace'
  | 'document-review'
  | 'evidence-matrix'
  | 'assessment'
  | 'contradictions'
  | 'audit-trail'
  | 'settings';
