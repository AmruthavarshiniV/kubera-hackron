import React, { useState } from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { 
  X, 
  Copy, 
  Check, 
  Code2, 
  Terminal, 
  BookOpen, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

export const StreamlitInspectorModal: React.FC = () => {
  const { isStreamlitModalOpen, setIsStreamlitModalOpen, streamlitTargetSnippet } = useCaseContext();
  const [activeTab, setActiveTab] = useState<string>('split_view');
  const [copied, setCopied] = useState<boolean>(false);

  // Sync initial tab when opened with target snippet
  React.useEffect(() => {
    if (streamlitTargetSnippet && streamlitTargetSnippet !== 'all') {
      setActiveTab(streamlitTargetSnippet);
    }
  }, [streamlitTargetSnippet]);

  if (!isStreamlitModalOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const codeSnippets: Record<string, { title: string; desc: string; code: string }> = {
    split_view: {
      title: 'Split-Screen Document Review in Streamlit',
      desc: 'Synchronized PDF preview and editable extracted fields with confidence badges.',
      code: `import streamlit as st
import base64

def render_document_review_screen(pdf_bytes, extracted_entities):
    st.subheader("📄 Document Review & OCR Verification")
    
    # Create side-by-side columns: Left for document, Right for extracted fields
    col_doc, col_fields = st.columns([6, 5], gap="large")
    
    with col_doc:
        st.markdown("#### Document Artifact Preview")
        # Embed PDF or multi-page image in iframe
        base64_pdf = base64.b64encode(pdf_bytes).decode('utf-8')
        pdf_display = f'<iframe src="data:application/pdf;base64,{base64_pdf}" width="100%" height="680" type="application/pdf" style="border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>'
        st.markdown(pdf_display, unsafe_allow_html=True)
        
    with col_fields:
        st.markdown("#### Extracted Target Entities")
        st.caption("Click any field to confirm verification or manual override")
        
        for field in extracted_entities:
            with st.container():
                st.markdown(f"**{field['key']}** · *Confidence: {field['confidence']}%*")
                
                # In-place editable input with current extracted value
                val = st.text_input(
                    label=field['key'], 
                    value=field['value'], 
                    key=f"field_{field['id']}", 
                    label_visibility="collapsed"
                )
                
                # Verification action buttons
                b_col1, b_col2 = st.columns([1, 1])
                with b_col1:
                    if st.button("Confirm Field", key=f"conf_{field['id']}", use_container_width=True):
                        st.session_state[f"status_{field['id']}"] = "Officer Confirmed"
                        st.toast(f"Confirmed {field['key']}")
                with b_col2:
                    if st.button("Flag for Review", key=f"flag_{field['id']}", use_container_width=True):
                        st.session_state[f"status_{field['id']}"] = "Needs Review"
                        st.warning(f"Flagged {field['key']} for secondary review")
                
                st.markdown(f"<small style='color: #64748b;'>Source (p.{field['page']}): {field['snippet']}</small>", unsafe_allow_html=True)
                st.divider()`,
    },

    contradiction: {
      title: 'Contradiction Reconciliation Card',
      desc: 'Side-by-side reconciliation of variances (e.g. gross pay vs bank credit) without automated fraud labelling.',
      code: `import streamlit as st

def render_contradiction_reconciliation(contra_data):
    st.warning("⚠️ **Potential Cross-Document Inconsistency Detected**")
    st.info("KUBERA Charter: Do not automatically label discrepancies as fraud. Review for statutory deductions.")
    
    col_a, col_b = st.columns(2)
    with col_a:
        st.markdown(f"**Document A: {contra_data['doc_a']}**")
        st.metric(label=contra_data['label_a'], value=contra_data['val_a'])
        st.caption(f"Source: Page {contra_data['page_a']}")
        
    with col_b:
        st.markdown(f"**Document B: {contra_data['doc_b']}**")
        st.metric(label=contra_data['label_b'], value=contra_data['val_b'], delta=contra_data['diff'], delta_color="inverse")
        st.caption(f"Source: Page {contra_data['page_b']}")
        
    st.markdown("#### Algorithmic Contextual Hypothesis")
    st.write(contra_data['hypothesis'])
    
    # Loan Officer Rationale Text Area
    officer_note = st.text_area(
        "Underwriter Reconciliation Rationale",
        placeholder="Enter notes explaining statutory deductions (PF, Professional Tax) or request clarification...",
        key="contra_officer_note"
    )
    
    action_col1, action_col2 = st.columns([1, 1])
    with action_col1:
        if st.button("Resolve & Reconcile Consistency", type="primary", use_container_width=True):
            st.session_state['contra_resolved'] = True
            st.success("Reconciliation recorded in audit ledger. Consistency score recalculated.")
    with action_col2:
        if st.button("Request Borrower Clarification", use_container_width=True):
            st.warning("Clarification request drafted for applicant.")`,
    },

    evidence_matrix: {
      title: 'Evidence Matrix Checklist Table',
      desc: 'Interactive Streamlit Data Editor with column configuration for evidence verification.',
      code: `import streamlit as st
import pandas as pd

def render_evidence_matrix(evidence_items):
    st.subheader("📋 Policy Evidence Matrix & Freshness Checklist")
    
    df = pd.DataFrame(evidence_items)
    
    # Configure interactive Streamlit Data Editor
    edited_df = st.data_editor(
        df,
        column_config={
            "evidence": st.column_config.TextColumn("Evidence Requirement", width="medium"),
            "required": st.column_config.CheckboxColumn("Mandatory"),
            "found": st.column_config.CheckboxColumn("Found in File"),
            "verified": st.column_config.CheckboxColumn("Officer Verified"),
            "confidence": st.column_config.ProgressColumn("Confidence", min_value=0, max_value=100, format="%d%%"),
            "freshness": st.column_config.TextColumn("Freshness / Age"),
            "status": st.column_config.SelectboxColumn("Status", options=["Verified", "Incomplete", "Missing", "Mismatch"])
        },
        disabled=["evidence", "required", "confidence", "freshness"],
        hide_index=True,
        use_container_width=True
    )
    
    if st.button("Save Matrix Review State"):
        st.success("Evidence matrix state updated.")`,
    },

    assessment_scoring: {
      title: 'Trust Score & Recommended Review Action',
      desc: 'Evidence Trust Score breakdown and human review console (strictly avoiding "loan approval" nomenclature).',
      code: `import streamlit as st

def render_trust_assessment(trust_score, breakdown, explanations, recommended_action):
    st.subheader("🛡️ KUBERA Evidence Trust Assessment")
    
    col_score, col_breakdown = st.columns([1, 2])
    
    with col_score:
        st.metric("Evidence Trust Score", f"{trust_score} / 100")
        st.markdown("**Evidence State:** \`REQUIRES HUMAN REVIEW\`")
        st.caption("Human loan officer retains final credit sanction authority.")
        
    with col_breakdown:
        st.markdown("**Factor Score Breakdown**")
        st.progress(breakdown['document_integrity'] / 100, text=f"Document Integrity: {breakdown['document_integrity']}%")
        st.progress(breakdown['extraction_confidence'] / 100, text=f"Extraction Confidence: {breakdown['extraction_confidence']}%")
        st.progress(breakdown['evidence_completeness'] / 100, text=f"Evidence Completeness: {breakdown['evidence_completeness']}%")
        st.progress(breakdown['cross_doc_consistency'] / 100, text=f"Cross-Document Consistency: {breakdown['cross_doc_consistency']}%")
        st.progress(breakdown['policy_compliance'] / 100, text=f"Policy Compliance: {breakdown['policy_compliance']}%")
        
    st.markdown("---")
    st.markdown("#### Audit Explanations")
    for exp in explanations:
        st.markdown(f"- {exp}")
        
    st.info(f"**Recommended Review Action:** {recommended_action}")
    st.caption("Note: This is an evidence remediation recommendation, not a loan sanction outcome.")`,
    },

    audit_trail: {
      title: 'Cryptographic Audit Trail Timeline',
      desc: 'Streamlit event log with timestamps, SHA-256 hashes, and actor provenance.',
      code: `import streamlit as st

def render_audit_trail(audit_events):
    st.subheader("📜 Immutable Case Audit Trail")
    st.caption("Chronological ledger with cryptographic SHA-256 event integrity.")
    
    for event in audit_events:
        with st.expander(f"{event['timestamp']} · **{event['action']}** ({event['actor']})", expanded=False):
            st.markdown(f"**Details:** {event['details']}")
            st.code(f"Integrity Block Hash: {event['hash']}", language="bash")
            st.caption(f"Category: {event['category']}")`,
    },
  };

  const currentSnippet = codeSnippets[activeTab] || codeSnippets['split_view'];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Streamlit / Python Implementation Blueprint
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Ready-to-use Python components for your existing Streamlit backend
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsStreamlitModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto bg-neutral-50 dark:bg-neutral-900/60">
          {[
            { id: 'split_view', label: '1. Split Review' },
            { id: 'contradiction', label: '2. Contradiction' },
            { id: 'evidence_matrix', label: '3. Evidence Matrix' },
            { id: 'assessment_scoring', label: '4. Trust Assessment' },
            { id: 'audit_trail', label: '5. Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {currentSnippet.title}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {currentSnippet.desc}
              </p>
            </div>

            <button
              onClick={() => handleCopy(currentSnippet.code)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Python Code'}</span>
            </button>
          </div>

          {/* Python Code Block */}
          <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 overflow-x-auto">
            <pre className="text-xs font-mono text-neutral-200 leading-relaxed">
              <code>{currentSnippet.code}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-500">
          <span>Python 3.10+ · Streamlit 1.30+ · Zero external npm dependencies required</span>
          <button
            onClick={() => setIsStreamlitModalOpen(false)}
            className="px-3 py-1.5 text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
