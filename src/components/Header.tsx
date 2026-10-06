import React from 'react';
import { 
  FileCheck2, 
  PlayCircle, 
  Printer, 
  Languages, 
  Plus, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle,
  Building2,
  ChevronDown,
  RotateCcw,
  Download
} from 'lucide-react';
import { Language, TenderProposal } from '../types/tender';
import { runTenderAudit } from '../utils/tenderAuditor';

interface HeaderProps {
  tenders: TenderProposal[];
  activeTender: TenderProposal;
  onSelectTender: (id: string) => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenTestModal: () => void;
  onOpenNewTender: () => void;
  onResetDemoData: () => void;
  onPrintProposal: () => void;
  onDownloadZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tenders,
  activeTender,
  onSelectTender,
  lang,
  onToggleLang,
  onOpenTestModal,
  onOpenNewTender,
  onResetDemoData,
  onPrintProposal,
  onDownloadZip,
}) => {
  const audit = runTenderAudit(activeTender);

  const getVerdictBadge = () => {
    if (audit.qualificationVerdict === 'QUALIFIED') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          {lang === 'bn' ? 'যোগ্য (উত্তীর্ণ)' : 'QUALIFIED'} · {audit.overallScore}%
        </span>
      );
    }
    if (audit.qualificationVerdict === 'CONDITIONAL') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          {lang === 'bn' ? 'শর্তসাপেক্ষ' : 'CONDITIONAL'} · {audit.overallScore}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-300 px-2.5 py-1">
        <XCircle className="w-3.5 h-3.5 text-rose-700" />
        {lang === 'bn' ? 'অযোগ্য (ঘাটতি)' : 'DISQUALIFIED'} · {audit.overallScore}%
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 text-white flex items-center justify-center font-bold tracking-tight">
              <span className="text-amber-400 font-mono text-base">TB</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-950 tracking-tight text-base">TenderBuilder</span>
                <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  v2.6 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none hidden md:block">
                {lang === 'bn' ? 'বি-টু-বি দরপত্র প্রস্তুতি ও অডিট প্ল্যাটফর্ম' : 'B2B Bid Management & Qualification Suite'}
              </p>
            </div>
          </div>

          {/* Active Tender Selector */}
          <div className="flex items-center gap-2 max-w-xs sm:max-w-md">
            <div className="relative">
              <select
                aria-label={lang === 'bn' ? 'দরপত্র নির্বাচন করুন' : 'Select tender proposal'}
                value={activeTender.id}
                onChange={(e) => onSelectTender(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs sm:text-sm font-medium py-2 pl-3 pr-8 truncate max-w-[200px] sm:max-w-[280px] focus:outline-none focus:ring-1 focus:ring-slate-950"
              >
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.referenceNumber}] {t.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="hidden lg:block">
              {getVerdictBadge()}
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2">
            {/* Primary Action: Run Product / Tender Test */}
            <button
              onClick={onOpenTestModal}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium py-2 px-3.5 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
              title={lang === 'bn' ? 'এই দরপত্রটি টেস্ট ও অডিট করুন' : 'Test and audit this tender proposal'}
            >
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">{lang === 'bn' ? 'টেন্ডার টেস্ট করুন' : 'Test Tender'}</span>
            </button>

            {/* Download Project ZIP */}
            <button
              onClick={onDownloadZip}
              className="inline-flex items-center gap-1.5 text-xs text-slate-800 hover:text-slate-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 py-2 px-3 font-semibold transition-colors"
              title={lang === 'bn' ? 'সম্পূর্ণ প্রজেক্টের ZIP ফাইল ডাউনলোড করুন' : 'Download Complete Project Source Code (.ZIP)'}
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>{lang === 'bn' ? 'ZIP ডাউনলোড' : 'Download ZIP'}</span>
            </button>

            {/* Print / Export */}
            <button
              onClick={onPrintProposal}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 py-2 px-3 transition-colors"
              title={lang === 'bn' ? 'প্রস্তাবনা প্রিন্ট বা পিডিএফ করুন' : 'Print or Export Proposal'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-300 py-2 px-2.5 transition-colors"
              title="Toggle Language (English / বাংলা)"
            >
              <Languages className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono uppercase">{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Create New Tender */}
            <button
              onClick={onOpenNewTender}
              className="hidden md:inline-flex items-center gap-1 text-xs text-slate-700 hover:text-slate-950 border border-slate-300 py-2 px-2.5 hover:bg-slate-50"
              title={lang === 'bn' ? 'নতুন দরপত্র তৈরি করুন' : 'New Tender'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নতুন' : 'New'}</span>
            </button>

            {/* Reset Demo */}
            <button
              onClick={onResetDemoData}
              className="text-slate-400 hover:text-slate-700 p-2 border border-transparent hover:border-slate-200"
              title={lang === 'bn' ? 'ডেমো ডেটা রিসেট করুন' : 'Reset demo data'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
