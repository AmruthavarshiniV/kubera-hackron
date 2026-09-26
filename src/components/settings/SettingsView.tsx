import React, { useState } from 'react';
import { useCaseContext } from '../../context/CaseContext';
import { 
  Settings, 
  ShieldCheck, 
  Sliders, 
  FileCode, 
  CheckCircle2, 
  Save, 
  Download, 
  Code2, 
  Layers,
  HelpCircle
} from 'lucide-react';
import { REQUIRED_EVIDENCE_BY_LOAN_TYPE } from '../../data/mockData';
import { LoanType } from '../../types';

export const SettingsView: React.FC = () => {
  const { openStreamlitInspector, theme, toggleTheme } = useCaseContext();

  const [minTrustScoreThreshold, setMinTrustScoreThreshold] = useState<number>(80);
  const [ocrConfidenceCutoff, setOcrConfidenceCutoff] = useState<number>(85);
  const [bankStatementMonthsRequired, setBankStatementMonthsRequired] = useState<number>(3);
  const [allowAutomatedFastTrack, setAllowAutomatedFastTrack] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<LoanType>('Personal Loan');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            System & Policy Settings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Configure underwriting rules, extraction confidence boundaries, and Streamlit export blueprints.
          </p>
        </div>

        <button
          onClick={() => openStreamlitInspector('all')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-md hover:bg-emerald-100 transition-colors"
        >
          <Code2 className="w-4 h-4" />
          <span>Streamlit Blueprint Guide</span>
        </button>
      </div>

      {/* Policy Engine Rules */}
      <div className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-6 shadow-xs">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Underwriting Policy Engine Parameters
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Parameters determine when an application flags "REQUIRES HUMAN REVIEW" vs "COMPLETE".
          </p>
        </div>

        <div className="space-y-5">
          {/* Minimum Trust Score */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Minimum Evidence Trust Score for Standard Review
              </span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {minTrustScoreThreshold} / 100
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={minTrustScoreThreshold}
              onChange={(e) => setMinTrustScoreThreshold(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white"
            />
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              Applications scoring below {minTrustScoreThreshold} require senior underwriter signoff.
            </p>
          </div>

          {/* OCR Cutoff */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                OCR Target Entity Confidence Cutoff
              </span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {ocrConfidenceCutoff}%
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="98"
              step="1"
              value={ocrConfidenceCutoff}
              onChange={(e) => setOcrConfidenceCutoff(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white"
            />
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              Fields extracted with confidence under {ocrConfidenceCutoff}% require officer confirmation.
            </p>
          </div>

          {/* Automated Approval Prohibition */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                Enforce Strict Human-in-the-Loop Mandate
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Prohibits automated loan approval or rejection regardless of Trust Score.
              </div>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              MANDATORY ENFORCED
            </span>
          </div>
        </div>
      </div>

      {/* Required Evidence Schemas per Product */}
      <div className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Product Evidence Checklists
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Configure mandatory checklist items for each loan type.
            </p>
          </div>

          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value as LoanType)}
            className="text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-1 text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            {(['Personal Loan', 'Home Loan', 'Auto Loan', 'Education Loan', 'Business Loan'] as LoanType[]).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-md divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
          {REQUIRED_EVIDENCE_BY_LOAN_TYPE[selectedProduct].map((item, idx) => (
            <div key={idx} className="p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white block">
                  {item.name}
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {item.description}
                </span>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-medium ${
                item.mandatory ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200' : 'text-neutral-400'
              }`}>
                {item.mandatory ? 'Mandatory' : 'Optional'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Save Settings Bar */}
      <div className="flex items-center justify-between pt-2">
        {isSaved ? (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Policy parameters successfully updated!
          </span>
        ) : (
          <span className="text-xs text-neutral-400">
            Changes immediately take effect across all active case assessments.
          </span>
        )}

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-md shadow-xs transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Policy Configuration</span>
        </button>
      </div>
    </div>
  );
};
