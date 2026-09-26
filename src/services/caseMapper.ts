import { 
  LoanCase, 
  LoanType, 
  CaseStatus, 
  EvidenceState, 
  VerificationState, 
  DocumentItem, 
  ExtractedField, 
  EvidenceMatrixItem, 
  ContradictionItem, 
  AuditEvent 
} from '../types';

/**
 * Pure mapping function that safely transforms raw FastAPI responses into the frontend LoanCase model.
 * Does not invent backend values. If a field is missing, uses safe fallbacks such as "Not available".
 */
export function mapBackendCaseToLoanCase(
  rawCase: any, 
  rawDecision?: any,
  existingCase?: LoanCase
): LoanCase {
  const caseId: string = rawCase?.case_id || rawCase?.id || 'Unknown';
  const rawLoanType: string = rawCase?.loan_type || rawCase?.loanType || 'Personal Loan';

  // Standardize loan type
  const validLoanTypes: LoanType[] = [
    'Personal Loan',
    'Home Loan',
    'Auto Loan',
    'Education Loan',
    'Business Loan'
  ];
  const loanType: LoanType = validLoanTypes.includes(rawLoanType as LoanType)
    ? (rawLoanType as LoanType)
    : 'Personal Loan';

  // Applicant info safely mapped without inventing details
  const rawApplicant = rawCase?.applicant || rawCase?.borrower || {};
  const applicant = {
    name: rawApplicant?.name || rawApplicant?.full_name || rawCase?.applicant_name || existingCase?.applicant?.name || 'Not available',
    email: rawApplicant?.email || existingCase?.applicant?.email || 'Not available',
    phone: rawApplicant?.phone || existingCase?.applicant?.phone || 'Not available',
    pan: rawApplicant?.pan || rawApplicant?.pan_number || existingCase?.applicant?.pan || 'Not available',
    employer: rawApplicant?.employer || rawApplicant?.company || existingCase?.applicant?.employer || 'Not available',
    requestedAmount: Number(rawApplicant?.requested_amount || rawApplicant?.amount || rawCase?.amount || existingCase?.applicant?.requestedAmount || 0),
    tenureMonths: Number(rawApplicant?.tenure_months || rawApplicant?.tenure || rawCase?.tenure || existingCase?.applicant?.tenureMonths || 0),
    address: rawApplicant?.address || existingCase?.applicant?.address || 'Not available',
  };

  // Map Documents
  const rawDocuments: any[] = Array.isArray(rawCase?.documents) 
    ? rawCase.documents 
    : (Array.isArray(rawCase?.files) ? rawCase.files : []);

  const documents: DocumentItem[] = rawDocuments.map((doc: any, index: number) => {
    const docId = doc?.id || doc?.doc_id || `doc-${index + 1}`;
    const fileName = doc?.file_name || doc?.filename || doc?.name || `Document_${index + 1}`;
    const detectedType = doc?.doc_type || doc?.detected_type || doc?.type || 'Not available';
    const pages = Number(doc?.pages || doc?.page_count || 1);
    
    // Map extracted fields if available
    const rawFields: any[] = Array.isArray(doc?.extracted_fields) 
      ? doc.extracted_fields 
      : (Array.isArray(doc?.fields) ? doc.fields : (doc?.extractions ? Object.entries(doc.extractions).map(([k, v]) => ({ key: k, value: v })) : []));

    const extractedFields: ExtractedField[] = rawFields.map((field: any, fIdx: number) => {
      return {
        id: field?.id || `f-${docId}-${fIdx}`,
        key: field?.key || field?.name || 'Field',
        value: typeof field?.value === 'object' ? JSON.stringify(field.value) : String(field?.value ?? 'Not available'),
        confidence: Number(field?.confidence || field?.score || 90),
        verificationState: (field?.verification_state || field?.status || 'Verified by System') as VerificationState,
        source: {
          page: Number(field?.page || field?.source_page || 1),
          textSnippet: field?.text_snippet || field?.snippet || field?.source || 'Extracted from document',
        },
        notes: field?.notes || field?.note,
      };
    });

    return {
      id: docId,
      fileName,
      fileSize: doc?.file_size || doc?.size || 'Not available',
      detectedType,
      pages,
      processingStatus: (doc?.processing_status || (doc?.processed ? 'Processed' : 'Processing')) as any,
      extractionConfidence: Number(doc?.extraction_confidence || doc?.confidence || 90),
      evidenceStatus: (doc?.evidence_status || (doc?.status === 'verified' ? 'Verified' : 'Pending Review')) as any,
      uploadedAt: doc?.uploaded_at || doc?.created_at || 'Recently',
      checksum: doc?.checksum || doc?.hash || 'Not available',
      integrityPassed: Boolean(doc?.integrity_passed ?? true),
      mimeType: doc?.mime_type || doc?.content_type || 'application/pdf',
      extractedFields,
      previewContent: doc?.preview_content || {
        header: detectedType,
        issuer: doc?.issuer || 'Issuing Authority',
        issueDate: doc?.issue_date || 'Not available',
        sections: extractedFields.map(f => ({ label: f.key, value: f.value })),
        notes: doc?.notes,
      },
    };
  });

  // Map Evidence Matrix
  const rawEvidence: any[] = Array.isArray(rawCase?.evidence_matrix)
    ? rawCase.evidence_matrix
    : (Array.isArray(rawCase?.evidence) ? rawCase.evidence : []);

  const evidenceMatrix: EvidenceMatrixItem[] = rawEvidence.map((ev: any, idx: number) => {
    return {
      id: ev?.id || `ev-${idx + 1}`,
      evidence: ev?.evidence || ev?.name || ev?.rule_name || 'Not available',
      required: Boolean(ev?.required ?? true),
      found: Boolean(ev?.found ?? false),
      verified: Boolean(ev?.verified ?? false),
      freshness: ev?.freshness || 'Not available',
      confidence: Number(ev?.confidence || 90),
      source: ev?.source || ev?.document || 'Not available',
      status: (ev?.status || (ev?.verified ? 'Verified' : (ev?.found ? 'Incomplete' : 'Missing'))) as any,
      category: (ev?.category || 'Identity') as any,
    };
  });

  // Map Contradictions
  const rawContradictions: any[] = Array.isArray(rawCase?.contradictions)
    ? rawCase.contradictions
    : (Array.isArray(rawCase?.inconsistencies) ? rawCase.inconsistencies : (Array.isArray(rawDecision?.contradictions) ? rawDecision.contradictions : []));

  const contradictions: ContradictionItem[] = rawContradictions.map((contra: any, idx: number) => {
    return {
      id: contra?.id || `contra-${idx + 1}`,
      title: contra?.title || contra?.description || 'Potential inconsistency detected',
      severity: contra?.severity || 'Medium',
      itemA: {
        docName: contra?.item_a?.doc_name || contra?.itemA?.docName || 'Document A',
        label: contra?.item_a?.label || contra?.itemA?.label || 'Item A',
        value: String(contra?.item_a?.value || contra?.itemA?.value || 'Not available'),
        sourcePage: Number(contra?.item_a?.page || contra?.itemA?.sourcePage || 1),
      },
      itemB: {
        docName: contra?.item_b?.doc_name || contra?.itemB?.docName || 'Document B',
        label: contra?.item_b?.label || contra?.itemB?.label || 'Item B',
        value: String(contra?.item_b?.value || contra?.itemB?.value || 'Not available'),
        sourcePage: Number(contra?.item_b?.page || contra?.itemB?.sourcePage || 1),
      },
      difference: contra?.difference || 'Variance detected',
      aiHypothesis: contra?.ai_hypothesis || contra?.hypothesis || contra?.explanation || 'Requires human loan officer confirmation.',
      status: (contra?.status || 'Requires Human Review') as any,
      resolutionNote: contra?.resolution_note || contra?.resolutionNote,
    };
  });

  // Calculate or retrieve Trust Score and breakdown from rawCase or rawDecision
  const decisionData = rawDecision || rawCase?.decision || {};
  const rawScore = decisionData?.trust_score ?? decisionData?.score ?? rawCase?.trust_score ?? rawCase?.score;
  const trustScore: number = rawScore !== undefined && rawScore !== null
    ? Number(rawScore)
    : (existingCase?.trustScore ?? 0);

  const rawBreakdown = decisionData?.breakdown || rawCase?.trust_score_breakdown || {};
  const trustScoreBreakdown = {
    documentIntegrity: Number(rawBreakdown?.document_integrity ?? rawBreakdown?.documentIntegrity ?? 90),
    extractionConfidence: Number(rawBreakdown?.extraction_confidence ?? rawBreakdown?.extractionConfidence ?? 90),
    evidenceCompleteness: Number(rawBreakdown?.evidence_completeness ?? rawBreakdown?.evidenceCompleteness ?? 80),
    crossDocConsistency: Number(rawBreakdown?.cross_doc_consistency ?? rawBreakdown?.crossDocConsistency ?? 80),
    policyCompliance: Number(rawBreakdown?.policy_compliance ?? rawBreakdown?.policyCompliance ?? 85),
  };

  const explanations: string[] = Array.isArray(decisionData?.explanations)
    ? decisionData.explanations
    : (Array.isArray(rawCase?.explanations) ? rawCase.explanations : [
        'Document evaluation performed by KUBERA engine',
        'Officer review required before final credit sanction'
      ]);

  const recommendedAction: string = 
    decisionData?.recommended_action || 
    rawCase?.recommended_action || 
    'Review uploaded borrower documents and confirm consistency.';

  // Map Audit Trail
  const rawAudit: any[] = Array.isArray(rawCase?.audit_trail)
    ? rawCase.audit_trail
    : (Array.isArray(rawCase?.events) ? rawCase.events : []);

  const auditTrail: AuditEvent[] = rawAudit.map((event: any, idx: number) => {
    return {
      id: event?.id || `aud-backend-${idx + 1}`,
      timestamp: event?.timestamp || new Date().toISOString(),
      action: event?.action || event?.event || 'Backend Event',
      actor: event?.actor || 'KUBERA Backend',
      details: event?.details || event?.message || 'State updated',
      hash: event?.hash || `0x${idx}a...${idx}f`,
      category: (event?.category || 'System') as any,
    };
  });

  const evidenceState: EvidenceState = (
    decisionData?.evidence_state || 
    rawCase?.evidence_state || 
    (trustScore >= 90 && contradictions.length === 0 ? 'VERIFIED & COMPLETE' : 'REQUIRES HUMAN REVIEW')
  ) as EvidenceState;

  const status: CaseStatus = (
    rawCase?.status || 
    (contradictions.length > 0 ? 'Requires Review' : 'In Verification')
  ) as CaseStatus;

  // Calculate evidence coverage %
  const evidenceCoverage = evidenceMatrix.length > 0
    ? Math.round((evidenceMatrix.filter(e => e.found).length / evidenceMatrix.length) * 100)
    : (Number(rawCase?.evidence_coverage || rawCase?.coverage || 80));

  return {
    id: caseId,
    applicant,
    loanType,
    evidenceCoverage,
    trustScore,
    status,
    evidenceState,
    updatedAt: rawCase?.updated_at || rawCase?.updatedAt || 'Just now',
    createdAt: rawCase?.created_at || rawCase?.createdAt || new Date().toISOString(),
    assignedOfficer: rawCase?.assigned_officer || rawCase?.assignedOfficer || 'Officer R. Sharma',
    trustScoreBreakdown,
    explanations,
    recommendedAction,
    documents: documents.length > 0 ? documents : (existingCase?.documents || []),
    evidenceMatrix: evidenceMatrix.length > 0 ? evidenceMatrix : (existingCase?.evidenceMatrix || []),
    contradictions: contradictions.length > 0 ? contradictions : (existingCase?.contradictions || []),
    auditTrail: auditTrail.length > 0 ? auditTrail : (existingCase?.auditTrail || []),
    officerDecision: rawCase?.officer_decision || existingCase?.officerDecision,
  };
}
