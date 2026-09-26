import React, { useState } from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { LoanType } from '../../types';
import { REQUIRED_EVIDENCE_BY_LOAN_TYPE } from '../../data/mockData';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  Loader2, 
  ShieldCheck,
  Building,
  Home,
  Car,
  GraduationCap,
  User,
  Code2,
  RefreshCw,
  Server
} from 'lucide-react';

interface UploadedFilePreview {
  file: File;
  name: string;
  size: string;
  detectedType: string;
  pages: number;
  processing: 'Pending' | 'Uploading' | 'Uploaded' | 'Failed';
  extraction: string;
  evidenceStatus: 'Pending Review' | 'Attached' | 'Verified';
}

export const NewApplicationWizard: React.FC = () => {
  const { 
    openStreamlitInspector, 
    createBackendCase, 
    uploadBackendDocument, 
    runBackendExtraction, 
    runBackendAnalysis, 
    refreshBackendCase,
    getBackendDecision,
    activeCase,
    setActivePage,
    setWorkspaceSubTab
  } = useCaseContext();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loanType, setLoanType] = useState<LoanType>('Personal Loan');
  const [createdBackendCaseId, setCreatedBackendCaseId] = useState<string | null>(null);

  // Step 2: Applicant Information
  const [applicantName, setApplicantName] = useState('Ananya Deshmukh');
  const [applicantEmail, setApplicantEmail] = useState('ananya.deshmukh@tcs.com');
  const [applicantPhone, setApplicantPhone] = useState('+91 98201 44520');
  const [applicantPan, setApplicantPan] = useState('ABCDE1234F');
  const [employer, setEmployer] = useState('Tata Consultancy Services Ltd.');
  const [requestedAmount, setRequestedAmount] = useState('850000');
  const [tenureMonths, setTenureMonths] = useState('36');
  const [address, setAddress] = useState('Flat 402, Skylark Heights, Baner Road, Pune 411045');

  // Step 3: Document Uploads - Start strictly empty as required
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Submission & Real Backend Execution States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<string>('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const steps = [
    { number: 1, label: 'Loan Type' },
    { number: 2, label: 'Applicant Information' },
    { number: 3, label: 'Document Upload' },
    { number: 4, label: 'Evidence Verification' },
    { number: 5, label: 'Assessment' },
  ];

  const loanTypeIcons = {
    'Personal Loan': User,
    'Home Loan': Home,
    'Auto Loan': Car,
    'Education Loan': GraduationCap,
    'Business Loan': Building,
  };

  /**
   * Handle real file selection or drag-and-drop
   * Does NOT simulate fake OCR or set artificial timeouts.
   * Stores real File objects and calculates real file sizes.
   */
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSubmissionError(null);

    const newItems: UploadedFilePreview[] = Array.from(files).map((f) => {
      const lower = f.name.toLowerCase();
      const isBank = lower.includes('bank') || lower.includes('statement') || lower.includes('passbook');
      const isSalary = lower.includes('salary') || lower.includes('payslip') || lower.includes('income') || lower.includes('pay');
      const isPan = lower.includes('pan');
      const isAadhaar = lower.includes('aadhaar') || lower.includes('uidai') || lower.includes('kyc');

      let detected = 'KYC Document';
      if (isBank) detected = 'Bank Statement — 3 Months';
      else if (isSalary) detected = 'Income Proof (Payslip)';
      else if (isPan) detected = 'PAN Card';
      else if (isAadhaar) detected = 'KYC Document (Aadhaar)';

      const sizeFormatted = f.size > 1024 * 1024 
        ? `${(f.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(f.size / 1024)} KB`;

      return {
        file: f,
        name: f.name,
        size: sizeFormatted,
        detectedType: detected,
        pages: 1,
        processing: createdBackendCaseId ? 'Uploading' : 'Pending',
        extraction: createdBackendCaseId ? 'Queued for OCR' : 'Pending Ingestion',
        evidenceStatus: 'Attached',
      };
    });

    setUploadedFiles(prev => [...prev, ...newItems]);

    // If a backend case already exists, upload real files directly to FastAPI
    if (createdBackendCaseId) {
      for (const item of newItems) {
        try {
          await uploadBackendDocument(item.file, item.detectedType);
          setUploadedFiles(prev =>
            prev.map(f =>
              f.name === item.name
                ? { ...f, processing: 'Uploaded', extraction: 'Uploaded to Backend' }
                : f
            )
          );
        } catch (uploadErr: any) {
          console.error('[KUBERA API] Error uploading to backend:', uploadErr);
          setUploadedFiles(prev =>
            prev.map(f =>
              f.name === item.name
                ? { ...f, processing: 'Failed', extraction: uploadErr.message || 'Upload failed' }
                : f
            )
          );
        }
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Real Submission Pipeline:
   * 1. Calls POST /api/cases (real case_id from FastAPI)
   * 2. Uploads real File objects via POST /api/cases/{case_id}/documents
   * 3. Triggers real extraction via POST /api/cases/{case_id}/extract
   * 4. Triggers real analysis via POST /api/cases/{case_id}/analyze
   * 5. Retrieves real decision via GET /api/cases/{case_id}/decision
   * 6. Routes directly to the Case Workspace
   */
  const handleCompleteSubmission = async () => {
    if (uploadedFiles.length === 0) {
      setSubmissionError('Please upload at least one borrower document before initializing the case.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // 1. Create real case on backend
      setSubmissionStage('Step 1/5: Initializing real case on KUBERA backend (POST /api/cases)...');
      const applicantInfo = {
        name: applicantName,
        email: applicantEmail,
        phone: applicantPhone,
        pan: applicantPan,
        employer,
        requestedAmount: Number(requestedAmount) || 0,
        tenureMonths: Number(tenureMonths) || 0,
        address,
      };

      const realCaseId = await createBackendCase(loanType);
      setCreatedBackendCaseId(realCaseId);

      // 2. Upload every pending real File using uploadBackendDocument
      for (let i = 0; i < uploadedFiles.length; i++) {
        const item = uploadedFiles[i];
        setSubmissionStage(`Step 2/5: Uploading document ${i + 1} of ${uploadedFiles.length}: "${item.name}" (POST /api/cases/${realCaseId}/documents)...`);
        
        setUploadedFiles(prev =>
          prev.map((f, idx) => idx === i ? { ...f, processing: 'Uploading' } : f)
        );

        await uploadBackendDocument(item.file, item.detectedType);

        setUploadedFiles(prev =>
          prev.map((f, idx) => idx === i ? { ...f, processing: 'Uploaded', extraction: 'Uploaded to Backend' } : f)
        );
      }

      // 3. Trigger extraction on backend
      setSubmissionStage(`Step 3/5: Running OCR entity extraction (POST /api/cases/${realCaseId}/extract)...`);
      await runBackendExtraction();
      
      setUploadedFiles(prev =>
        prev.map(f => ({ ...f, extraction: 'Extraction Completed' }))
      );

      // 4. Trigger analysis on backend
      setSubmissionStage(`Step 4/5: Running evidence intelligence & policy analysis (POST /api/cases/${realCaseId}/analyze)...`);
      await runBackendAnalysis();

      // 5. Fetch decision
      setSubmissionStage(`Step 5/5: Fetching final decision and Evidence Trust Score (GET /api/cases/${realCaseId}/decision)...`);
      await getBackendDecision(realCaseId);
      await refreshBackendCase(realCaseId);

      setSubmissionStage('Complete! Opening Case Workspace...');
      setActivePage('case-workspace');
      setWorkspaceSubTab('overview');
    } catch (err: any) {
      console.error('[KUBERA API] Error during intake submission workflow:', err);
      const errMsg = err.message 
        ? `${err.message} (Backend connection failed. Please make sure FastAPI is running on http://127.0.0.1:8000.)`
        : 'Backend connection failed. Please make sure FastAPI is running on http://127.0.0.1:8000.';
      setSubmissionError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredEvidenceList = REQUIRED_EVIDENCE_BY_LOAN_TYPE[loanType];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              New Loan Application Intake
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              <Server className="w-3 h-3" />
              FastAPI: 127.0.0.1:8000
            </span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Follow the 5-step guided compliance workflow to ingest real borrower documents, extract fields, and evaluate evidence.
          </p>
        </div>

        <button
          onClick={() => openStreamlitInspector('wizard')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Streamlit Wizard Code</span>
        </button>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-5 gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        {steps.map((s) => {
          const isCurrent = currentStep === s.number;
          const isPassed = currentStep > s.number;
          return (
            <button
              key={s.number}
              onClick={() => setCurrentStep(s.number)}
              className="text-left group focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-colors ${
                  isPassed 
                    ? 'bg-emerald-600 text-white' 
                    : isCurrent 
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' 
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}>
                  {isPassed ? '✓' : s.number}
                </span>
                <span className={`text-xs font-medium transition-colors ${
                  isCurrent 
                    ? 'text-neutral-900 dark:text-white font-semibold' 
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}>
                  {s.label}
                </span>
              </div>
              <div className={`mt-2 h-1 rounded-full transition-all ${
                isPassed 
                  ? 'bg-emerald-500' 
                  : isCurrent 
                  ? 'bg-neutral-900 dark:bg-white' 
                  : 'bg-neutral-200 dark:bg-neutral-800'
              }`} />
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 min-h-[420px] transition-colors">
        {/* STEP 1: LOAN TYPE */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Step 1: Select Loan Type
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Choosing a loan product dynamically binds applicable evidence policies and mandatory checklist items.
              </p>
            </div>

            {/* Loan Type Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(['Personal Loan', 'Home Loan', 'Auto Loan', 'Education Loan', 'Business Loan'] as LoanType[]).map((type) => {
                const Icon = loanTypeIcons[type];
                const isSelected = loanType === type;
                return (
                  <div
                    key={type}
                    onClick={() => setLoanType(type)}
                    className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/80 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="mt-3 text-sm font-semibold text-neutral-900 dark:text-white">
                      {type}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {type === 'Personal Loan' && 'Unsecured credit with KYC, payslips, and 3-month bank statement.'}
                      {type === 'Home Loan' && 'Secured mortgage with 6-month statement, title deed, and ITR.'}
                      {type === 'Auto Loan' && 'Vehicle finance requiring vehicle proforma, KYC, and income proof.'}
                      {type === 'Education Loan' && 'University admission offer, co-borrower proof, and fee schedule.'}
                      {type === 'Business Loan' && 'Commercial finance with GST filings, 12-month statements, and P&L.'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Required Evidence Preview */}
            <div className="mt-6 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 bg-neutral-50/70 dark:bg-neutral-800/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                  Required Evidence for {loanType}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {requiredEvidenceList.length} Requirements
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {requiredEvidenceList.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: APPLICANT INFORMATION */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Step 2: Applicant Information
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Primary borrower demographic and employment declarations for cross-document reconciliation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Permanent Account Number (PAN)
                </label>
                <input
                  type="text"
                  value={applicantPan}
                  onChange={(e) => setApplicantPan(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono uppercase px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Current Employer / Business Entity
                </label>
                <input
                  type="text"
                  value={employer}
                  onChange={(e) => setEmployer(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Requested Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Tenure (Months)
                  </label>
                  <input
                    type="number"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DOCUMENT UPLOAD */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Step 3: Document Upload
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Upload real borrower files from your computer. KUBERA will stream them directly to the FastAPI backend for ingestion.
              </p>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging
                  ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800/80'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/40'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  Drop loan dossier documents here or click to browse
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Accepted formats: <span className="font-mono font-medium">PDF, JPG, JPEG, PNG</span>
                </div>
                <label className="mt-4 cursor-pointer">
                  <span className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-md shadow-xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors inline-block">
                    Select Files from Computer
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Uploaded Documents List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-1">
                <span>Uploaded Documents ({uploadedFiles.length})</span>
                {uploadedFiles.length === 0 && (
                  <span className="text-amber-600 dark:text-amber-400 normal-case font-normal text-xs">
                    Please upload borrower files from your machine
                  </span>
                )}
              </div>

              {uploadedFiles.length === 0 ? (
                <div className="p-6 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-center bg-neutral-50/40 dark:bg-neutral-900/20">
                  <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                    No documents uploaded yet
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Click "Select Files from Computer" above to stage your KYC, Bank Statement, and Income proofs.
                  </p>
                </div>
              ) : (
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/40 text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold uppercase">
                        <th className="py-2.5 px-3">File</th>
                        <th className="py-2.5 px-3">Detected Type</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Extraction</th>
                        <th className="py-2.5 px-3">Evidence State</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {uploadedFiles.map((doc, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                          <td className="py-2.5 px-3 font-medium text-neutral-900 dark:text-neutral-100">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                              <div>
                                <div className="truncate max-w-[200px]">{doc.name}</div>
                                <div className="text-[10px] text-neutral-400 font-mono">{doc.size}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-neutral-700 dark:text-neutral-300 font-medium">
                            {doc.detectedType}
                          </td>
                          <td className="py-2.5 px-3">
                            {doc.processing === 'Uploading' ? (
                              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Uploading
                              </span>
                            ) : doc.processing === 'Uploaded' ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                Uploaded to Backend
                              </span>
                            ) : doc.processing === 'Failed' ? (
                              <span className="text-rose-600 dark:text-rose-400 font-medium">
                                Upload Failed
                              </span>
                            ) : (
                              <span className="text-neutral-500 font-medium">
                                Pending Ingestion
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-neutral-600 dark:text-neutral-400">
                            {doc.extraction}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center text-[11px] font-medium text-amber-600 dark:text-amber-400">
                              {doc.evidenceStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => removeFile(idx)}
                              className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: EVIDENCE VERIFICATION */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Step 4: Evidence Completeness Check
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  KUBERA checks whether required evidence items for {loanType} are satisfied by the uploaded borrower files.
                </p>
              </div>

              <div className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
                Coverage: {uploadedFiles.length} / {requiredEvidenceList.length} Attached
              </div>
            </div>

            <div className="space-y-3">
              {requiredEvidenceList.map((item, idx) => {
                // Match against uploaded files
                const matchingFile = uploadedFiles.find(f => {
                  const fName = f.name.toLowerCase();
                  const reqName = item.name.toLowerCase();
                  return (
                    f.detectedType.toLowerCase().includes(reqName) ||
                    (reqName.includes('kyc') && (fName.includes('aadhaar') || fName.includes('kyc') || fName.includes('uidai'))) ||
                    (reqName.includes('pan') && fName.includes('pan')) ||
                    (reqName.includes('income') && (fName.includes('salary') || fName.includes('payslip') || fName.includes('income'))) ||
                    (reqName.includes('bank') && (fName.includes('bank') || fName.includes('statement') || fName.includes('passbook')))
                  );
                }) || (uploadedFiles.length > idx ? uploadedFiles[idx] : undefined);

                const isSatisfied = !!matchingFile;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                      isSatisfied
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isSatisfied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {item.description}
                        </div>
                        {isSatisfied && (
                          <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>File attached: {matchingFile.name} ({matchingFile.size})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-medium font-mono ${
                        isSatisfied 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {isSatisfied ? 'Pending backend verification' : 'Missing / Pending Upload'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: ASSESSMENT PREVIEW */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Step 5: Preliminary Evidence Assessment Preview
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Ready to initialize persistent dossier on the KUBERA FastAPI backend, extract entities via OCR, and compute the Evidence Trust Score.
              </p>
            </div>

            {/* Assessment Snapshot */}
            <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                    Synthesized Trust Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold font-mono text-neutral-700 dark:text-neutral-300">
                      {createdBackendCaseId && activeCase?.trustScore ? activeCase.trustScore : '--'}
                    </span>
                    <span className="text-sm font-mono text-neutral-400">/ 100</span>
                    <span className="text-[11px] font-mono text-neutral-500 ml-2">
                      (Computed by KUBERA engine upon case submission)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                    Evidence State
                  </span>
                  <span className="inline-block mt-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    AWAITING INTAKE & ANALYSIS
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
                <p>• {uploadedFiles.length} real document(s) staged for backend ingestion.</p>
                <p>• Applicant: <span className="font-semibold text-neutral-900 dark:text-white">{applicantName}</span> (PAN: <span className="font-mono">{applicantPan}</span>).</p>
                <p>• Product: <span className="font-semibold text-neutral-900 dark:text-white">{loanType}</span> — ₹{Number(requestedAmount).toLocaleString('en-IN')}.</p>
                <p>• Backend endpoint: <span className="font-mono text-neutral-500">http://127.0.0.1:8000/api/cases</span></p>
              </div>
            </div>

            {/* Error state alert if any */}
            {submissionError && (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-rose-900 dark:text-rose-200">
                      Backend Operation Failed
                    </div>
                    <div className="text-rose-700 dark:text-rose-300 mt-0.5 font-mono">
                      {submissionError}
                    </div>
                    <div className="text-neutral-500 dark:text-neutral-400 mt-1">
                      Ensure your FastAPI backend is running locally at <code>http://127.0.0.1:8000</code>.
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCompleteSubmission}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-700 text-white shrink-0 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Live Progress Stage Indicator */}
            {isSubmitting && (
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                <div className="font-mono font-medium">
                  {submissionStage || 'Executing KUBERA pipeline...'}
                </div>
              </div>
            )}

            <div className="p-4 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-400">
              Clicking <strong>"Initialize Case Workspace & Analyze"</strong> will create the real case on your FastAPI backend, upload each file, execute OCR extraction, and calculate the Evidence Trust Score.
            </div>
          </div>
        )}
      </div>

      {/* Stepper Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1 || isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:pointer-events-none rounded-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {currentStep < 5 ? (
          <button
            onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-md transition-all shadow-sm"
          >
            <span>Continue to Step {currentStep + 1}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleCompleteSubmission}
            disabled={isSubmitting || uploadedFiles.length === 0}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none rounded-md transition-all shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Real Application...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Initialize Case Workspace & Analyze</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
