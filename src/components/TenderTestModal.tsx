import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  Terminal, 
  ArrowRight, 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  FileCheck,
  DollarSign,
  Users,
  Scale
} from 'lucide-react';
import { Language, TenderProposal } from '../types/tender';
import { runTenderAudit, calculateBOQSummary } from '../utils/tenderAuditor';

interface TenderTestModalProps {
  tender: TenderProposal;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onQuickFixDoc?: (docId: string) => void;
  onQuickFixClause?: (clauseId: string) => void;
}

export const TenderTestModal: React.FC<TenderTestModalProps> = ({
  tender,
  isOpen,
  onClose,
  lang,
  onQuickFixDoc,
  onQuickFixClause,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const auditReport = runTenderAudit(tender);
  const boqSummary = calculateBOQSummary(tender);

  const testSteps = [
    { titleEn: 'Statutory Documentation Verification', titleBn: 'আইনি ও কর নথিপত্র নিরীক্ষা' },
    { titleEn: 'Earnest Money & Bank Guarantee Audit', titleBn: 'দরপত্র জামানত ও ব্যাংক গ্যারান্টি নিরীক্ষা' },
    { titleEn: 'Technical Specification Compliance Matrix', titleBn: 'কারিগরি শর্তাবলি ও সম্মতি ম্যাট্রিক্স যাচাই' },
    { titleEn: 'BOQ Financial Health & Margin Sanity', titleBn: 'বিওকিউ আর্থিক স্বাস্থ্য ও মুনাফার যৌক্তিকতা' },
    { titleEn: 'Key Personnel & Experience Grid', titleBn: 'মূল জনবল ও অভিজ্ঞতার প্রোফাইল যাচাই' },
    { titleEn: 'Submission Deadline & Risk Index', titleBn: 'দাখিলের সময়সীমা ও সামগ্রিক ঝুঁকি সূচক' },
  ];

  const handleRunFullTest = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setLogs([]);

    const timestamp = () => new Date().toLocaleTimeString();

    const sequence = [
      `[${timestamp()}] 🚀 Initiating automated qualification audit for "${tender.referenceNumber}"...`,
      `[${timestamp()}] 📄 [Step 1/6] Verifying ${tender.documents.length} legal, financial and technical documents...`,
      `[${timestamp()}] 🛡️ [Step 2/6] Auditing Earnest Money security (${tender.currency} ${tender.earnestMoneyAmount.toLocaleString()})...`,
      `[${timestamp()}] ⚙️ [Step 3/6] Inspecting ${tender.complianceClauses.length} mandatory & non-mandatory RFP clauses...`,
      `[${timestamp()}] 💰 [Step 4/6] Computing BOQ financial model (Total: ${tender.currency} ${boqSummary.totalBidPrice.toLocaleString()})...`,
      `[${timestamp()}] 👥 [Step 5/6] Validating ${tender.personnel.length} key personnel CV credentials & PMP roles...`,
      `[${timestamp()}] ⏱️ [Step 6/6] Checking submission deadline countdown and portal risk index...`,
      `[${timestamp()}] ✅ Audit complete. Final Qualification Verdict: ${auditReport.qualificationVerdict} (Score: ${auditReport.overallScore}/100)`,
    ];

    sequence.forEach((logMessage, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, logMessage]);
        setCurrentStep(Math.min(testSteps.length, index));
        if (index === sequence.length - 1) {
          setIsRunning(false);
        }
      }, (index + 1) * 320);
    });
  };

  useEffect(() => {
    if (isOpen) {
      handleRunFullTest();
    }
  }, [isOpen, tender.id]);

  if (!isOpen) return null;

  const filteredCheckItems = auditReport.checkItems.filter((item) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'failed') return item.status === 'failed';
    if (filterCategory === 'warning') return item.status === 'warning';
    if (filterCategory === 'passed') return item.status === 'passed';
    return item.category === filterCategory;
  });

  const copySummary = () => {
    const text = `TENDER QUALIFICATION TEST REPORT
Reference: ${tender.referenceNumber}
Title: ${tender.title}
Client: ${tender.clientName}
Verdict: ${auditReport.qualificationVerdict}
Overall Score: ${auditReport.overallScore}/100
Passed Tests: ${auditReport.passedTests}/${auditReport.totalTests}
Critical Deficits: ${auditReport.criticalIssuesCount}
Warnings: ${auditReport.warningsCount}
Calculated Bid: ${tender.currency} ${boqSummary.totalBidPrice.toLocaleString()}
Margin: ${boqSummary.blendedMarginPercent.toFixed(1)}%

Audit Summary:
${auditReport.checkItems.map((c) => `[${c.status.toUpperCase()}] ${c.nameEn}: ${c.descriptionEn}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-5xl border border-slate-300 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-white">
                  {lang === 'bn' ? 'দরপত্র যোগ্যতা ও অডিট টেস্ট ল্যাব' : 'Tender Qualification & Compliance Test Lab'}
                </h2>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5">
                  LIVE RUNNER
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xl">
                [{tender.referenceNumber}] {tender.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunFullTest}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{lang === 'bn' ? 'পুনরায় টেস্ট করুন' : 'Re-run Tests'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 border border-transparent hover:border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Scorecard & Verdict Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Verdict Card */}
            <div className={`p-4 border md:col-span-1 flex flex-col justify-between ${
              auditReport.qualificationVerdict === 'QUALIFIED'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : auditReport.qualificationVerdict === 'CONDITIONAL'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600">
                  {lang === 'bn' ? 'চূড়ান্ত ফলাফল' : 'EVALUATION VERDICT'}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {auditReport.qualificationVerdict === 'QUALIFIED' && <CheckCircle2 className="w-6 h-6 text-emerald-700" />}
                  {auditReport.qualificationVerdict === 'CONDITIONAL' && <AlertTriangle className="w-6 h-6 text-amber-700" />}
                  {auditReport.qualificationVerdict === 'DISQUALIFIED' && <XCircle className="w-6 h-6 text-rose-700" />}
                  <h3 className="text-xl font-bold tracking-tight">
                    {auditReport.qualificationVerdict === 'QUALIFIED' && (lang === 'bn' ? 'যোগ্য (উত্তীর্ণ)' : 'QUALIFIED')}
                    {auditReport.qualificationVerdict === 'CONDITIONAL' && (lang === 'bn' ? 'শর্তসাপেক্ষ' : 'CONDITIONAL')}
                    {auditReport.qualificationVerdict === 'DISQUALIFIED' && (lang === 'bn' ? 'অযোগ্য (বাতিল ঝুঁকি)' : 'DISQUALIFIED')}
                  </h3>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-300/60 text-xs">
                <span className="font-semibold">{auditReport.passedTests}/{auditReport.totalTests}</span> {lang === 'bn' ? 'টেস্ট সফল' : 'assertions passed'}
                {auditReport.criticalIssuesCount > 0 && (
                  <span className="text-rose-700 font-semibold block mt-0.5">
                    · {auditReport.criticalIssuesCount} {lang === 'bn' ? 'গুরুত্বপূর্ণ ঘাটতি' : 'critical blockers'}
                  </span>
                )}
              </div>
            </div>

            {/* Overall Score */}
            <div className="p-4 bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                {lang === 'bn' ? 'সামগ্রিক স্কোর' : 'OVERALL BID SCORE'}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {auditReport.overallScore}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 mt-3">
                <div 
                  className={`h-1.5 transition-all duration-500 ${
                    auditReport.overallScore >= 80 ? 'bg-emerald-600' : auditReport.overallScore >= 50 ? 'bg-amber-500' : 'bg-rose-600'
                  }`}
                  style={{ width: `${auditReport.overallScore}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 block mt-2">
                {lang === 'bn' ? 'পাস মার্ক: ৮০ বা তদূর্ধ্ব' : 'Benchmark qualification threshold: 80+'}
              </span>
            </div>

            {/* Sub-Metric 1: Docs & Compliance */}
            <div className="p-4 bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                {lang === 'bn' ? 'নথি ও কারিগরি মান' : 'DOCS & TECHNICAL'}
              </span>
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">{lang === 'bn' ? 'নথিপত্র নির্ভরযোগ্যতা' : 'Document Completeness'}</span>
                  <span className="font-mono font-semibold text-slate-900">{auditReport.documentationScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{lang === 'bn' ? 'কারিগরি শর্ত সম্মতি' : 'Clause Compliance'}</span>
                  <span className="font-mono font-semibold text-slate-900">{auditReport.complianceRatioScore}%</span>
                </div>
              </div>
            </div>

            {/* Sub-Metric 2: Financial Sanity */}
            <div className="p-4 bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                {lang === 'bn' ? 'আর্থিক পরামিতি' : 'FINANCIAL SANITY'}
              </span>
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">{lang === 'bn' ? 'প্রত্যাশিত মুনাফা' : 'Blended Margin'}</span>
                  <span className={`font-mono font-semibold ${boqSummary.blendedMarginPercent < 8 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {boqSummary.blendedMarginPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{lang === 'bn' ? 'ক্লায়েন্ট বাজেট ব্যত্যয়' : 'Budget Variance'}</span>
                  <span className={`font-mono font-semibold ${boqSummary.isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {boqSummary.budgetVariancePercent > 0 ? `+${boqSummary.budgetVariancePercent.toFixed(1)}%` : `${boqSummary.budgetVariancePercent.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Test Execution Terminal Logs */}
          <div className="bg-slate-950 text-slate-200 p-3.5 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                {lang === 'bn' ? 'রিয়েলটাইম টেস্ট কনসোল লগ' : 'Real-Time Test Execution Console'}
              </span>
              <span className="text-[10px] text-slate-500">OXLINT / BID-EVAL-V2</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {logs.map((line, idx) => (
                <div key={idx} className="leading-relaxed">
                  {line}
                </div>
              ))}
              {isRunning && (
                <div className="text-slate-500 animate-pulse">Running test assertions...</div>
              )}
            </div>
          </div>

          {/* Test Assertions Filter & List */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-950 text-sm">
                  {lang === 'bn' ? 'পরীক্ষামূলক মানদণ্ড ও যাচাই ফলাফল' : 'Detailed Test Criteria & Audit Assertions'}
                </h4>
                <span className="text-xs text-slate-500">({filteredCheckItems.length})</span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1">
                {(['all', 'failed', 'warning', 'passed'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`text-xs px-2.5 py-1 border transition-colors ${
                      filterCategory === cat
                        ? 'bg-slate-900 text-white border-slate-900 font-medium'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'all' && (lang === 'bn' ? 'সকল' : 'All')}
                    {cat === 'failed' && (lang === 'bn' ? 'ঘাটতি / ফেল' : 'Failed')}
                    {cat === 'warning' && (lang === 'bn' ? 'সতর্কতা' : 'Warnings')}
                    {cat === 'passed' && (lang === 'bn' ? 'উত্তীর্ণ' : 'Passed')}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Assertions */}
            <div className="space-y-3">
              {filteredCheckItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border transition-colors ${
                    item.status === 'failed'
                      ? 'bg-rose-50/60 border-rose-300'
                      : item.status === 'warning'
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {item.status === 'passed' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                        {item.status === 'warning' && (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        )}
                        {item.status === 'failed' && (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-slate-950 text-sm">
                            {lang === 'bn' ? item.nameBn : item.nameEn}
                          </h5>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 uppercase ${
                            item.status === 'passed'
                              ? 'text-emerald-800 bg-emerald-100'
                              : item.status === 'warning'
                              ? 'text-amber-800 bg-amber-100'
                              : 'text-rose-800 bg-rose-100'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1">
                          {lang === 'bn' ? item.descriptionBn : item.descriptionEn}
                        </p>
                        
                        {/* Recommendation */}
                        <div className="mt-2.5 p-2 bg-white/80 border border-slate-200/80 text-xs text-slate-600">
                          <span className="font-semibold text-slate-900">
                            {lang === 'bn' ? 'সুপারিশ: ' : 'Recommendation: '}
                          </span>
                          {lang === 'bn' ? item.recommendationBn : item.recommendationEn}
                        </div>
                      </div>
                    </div>

                    {/* Quick Fix CTA if item is failing/warning */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {item.id === 'chk-doc-mandatory' && item.status === 'failed' && onQuickFixDoc && (
                        <button
                          onClick={() => {
                            const missing = tender.documents.find(d => d.isMandatory && (d.status === 'missing' || d.status === 'expired'));
                            if (missing) onQuickFixDoc(missing.id);
                          }}
                          className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs px-2.5 py-1.5 font-medium transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'নথি ঠিক করুন' : 'Fix Document'}</span>
                        </button>
                      )}

                      {item.id === 'chk-comp-clauses' && item.status === 'failed' && onQuickFixClause && (
                        <button
                          onClick={() => {
                            const nonComp = tender.complianceClauses.find(c => c.status === 'non_compliant');
                            if (nonComp) onQuickFixClause(nonComp.id);
                          }}
                          className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs px-2.5 py-1.5 font-medium transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'শর্ত পূরণ করুন' : 'Resolve Clause'}</span>
                        </button>
                      )}

                      {item.id === 'chk-sec-earnest' && item.status === 'failed' && onQuickFixDoc && (
                        <button
                          onClick={() => {
                            const bg = tender.documents.find(d => d.title.toLowerCase().includes('guarantee') || d.titleBn?.includes('জামানত'));
                            if (bg) onQuickFixDoc(bg.id);
                          }}
                          className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs px-2.5 py-1.5 font-medium transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'বিজি যোগ করুন' : 'Upload BG'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {lang === 'bn' ? (
              <span>ই-জিপি সরকারি ক্রয়বিধি (PPR-2008) ও আন্তর্জাতিক দরপত্র মানদণ্ডে পরীক্ষিত</span>
            ) : (
              <span>Evaluated in compliance with PPR-2008 Public Procurement Rules & FIDIC standards</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copySummary}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium py-1.5 px-3 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'অডিট কপি করুন' : 'Copy Report')}</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-1.5 px-4 transition-colors"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
