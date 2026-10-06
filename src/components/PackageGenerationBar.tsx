import React, { useState } from 'react';
import { 
  Download, 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle2, 
  Stamp, 
  FileSpreadsheet, 
  Sparkles,
  Loader2,
  BookOpen
} from 'lucide-react';
import { Language, RequirementStatusResult, SealConfig, TenderHeader } from '../types/tenderPackage';
import { buildTenderPackagePdf } from '../utils/pdfPackageBuilder';
import { exportChecklistCsv } from '../utils/csvExporter';

interface PackageGenerationBarProps {
  tender: TenderHeader;
  statusResults: RequirementStatusResult[];
  canGenerate: boolean;
  blockingIssues: string[];
  sealConfig: SealConfig;
  onOpenSealModal: () => void;
  lang: Language;
}

export const PackageGenerationBar: React.FC<PackageGenerationBarProps> = ({
  tender,
  statusResults,
  canGenerate,
  blockingIssues,
  sealConfig,
  onOpenSealModal,
  lang,
}) => {
  const [includeIndex, setIncludeIndex] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState<{ fileName: string; pages: number } | null>(null);

  const handleGenerateAndDownload = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setGeneratedSuccess(null);

    try {
      const result = await buildTenderPackagePdf(tender, statusResults, {
        includeIndexPage: includeIndex,
        sealConfig: sealConfig.hasSeal ? sealConfig : undefined,
      });

      // Trigger instant browser download as <tender_id>_Package.pdf (Rule 4.8)
      const blob = new Blob([result.pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setGeneratedSuccess({ fileName: result.fileName, pages: result.totalPages });
    } catch (err: any) {
      alert(`Error building PDF: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCsv = () => {
    exportChecklistCsv(tender, statusResults);
  };

  const okCount = statusResults.filter((s) => s.status === 'OK').length;
  const totalMandatory = statusResults.filter((s) => s.requirement.mandatory).length;

  return (
    <div className="bg-slate-900 text-white p-5 border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Status & Readiness info */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
              TASK 4.7 & 4.8: COMBINED SUBMISSION PACKAGE
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs font-mono text-slate-300">
              Target: <span className="text-amber-400 font-bold">{tender.tender_id}_Package.pdf</span>
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {canGenerate ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <h3 className="text-base font-bold tracking-tight text-white">
                  {lang === 'bn' ? 'দরপত্র প্যাকেজ তৈরির জন্য সম্পূর্ণ প্রস্তুত' : 'All Required Documents Verified & Ready'}
                </h3>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <h3 className="text-base font-bold tracking-tight text-white">
                  {lang === 'bn' 
                    ? `প্যাকেজ তৈরির আগে ${blockingIssues.length}টি সমস্যার সমাধান প্রয়োজন` 
                    : `${blockingIssues.length} Blocking Issue(s) Must Be Resolved`}
                </h3>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {canGenerate
              ? (lang === 'bn' 
                  ? `কভার পেজ (রুল ৬.১), মূল ফাইলসমূহ (রুল ৬.২) এবং পেজ ফুটার "<tender_id> | Page X of Y" (রুল ৬.৩) সহ একক পিডিএফ তৈরি হবে।`
                  : `Generates official PDF with Cover Page, sorted documents, and "<tender_id> | Page X of Y" footers.`)
              : (lang === 'bn' 
                  ? 'রুল ৪.৭ অনুযায়ী কোনো ব্লকিং সমস্যা (Missing, Expiry date needed, Expired বা ডুপ্লিকেট) থাকা পর্যন্ত বোতাম নিষ্ক্রিয় থাকবে।'
                  : 'Rule 4.7: Generate button remains strictly disabled while any blocking status exists.')}
          </p>
        </div>

        {/* Right Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bonus: Seal / Signature Config */}
          <button
            type="button"
            onClick={onOpenSealModal}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border transition-colors ${
              sealConfig.hasSeal
                ? 'bg-amber-950 text-amber-300 border-amber-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Configure official company stamp or signature overlay"
          >
            <Stamp className="w-3.5 h-3.5 text-amber-400" />
            <span>{sealConfig.hasSeal ? (lang === 'bn' ? 'সিল যুক্ত আছে ✓' : 'Seal Active ✓') : (lang === 'bn' ? 'সিল/স্বাক্ষর' : 'Seal/Signature')}</span>
          </button>

          {/* Bonus: CSV Export */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 border border-slate-700 transition-colors"
            title="Export verification checklist as CSV/Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'bn' ? 'চেকলিস্ট CSV' : 'Export CSV'}</span>
          </button>

          {/* Primary Action: Generate Package */}
          <button
            type="button"
            onClick={handleGenerateAndDownload}
            disabled={!canGenerate || isGenerating}
            className={`inline-flex items-center gap-2 text-xs font-bold py-2.5 px-5 shadow-sm transition-colors ${
              canGenerate && !isGenerating
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
            title={canGenerate ? 'Download final tender package PDF' : 'Fix blocking issues to enable'}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {isGenerating
                ? (lang === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Assembling PDF...')
                : (lang === 'bn' ? 'চূড়ান্ত প্যাকেজ ডাউনলোড করুন' : 'Generate & Download Package')}
            </span>
          </button>
        </div>
      </div>

      {/* Bonus Task Option: Index Page Toggle */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeIndex}
            onChange={(e) => setIncludeIndex(e.target.checked)}
            className="w-4 h-4 rounded-none accent-emerald-500"
          />
          <span className="text-slate-300">
            {lang === 'bn'
              ? 'সূচিপত্র পৃষ্ঠা যুক্ত করুন (Bonus: Include Table of Contents / Document Index Page)'
              : 'Include Table of Contents / Index page after cover showing page numbers (Bonus Task 7)'}
          </span>
        </label>

        <span className="text-[11px] font-mono text-slate-500">
          Included: {okCount} verified files | Mandatory: {totalMandatory}
        </span>
      </div>

      {/* If blocking issues exist, display exact reasons (Rule 4.7 requirement) */}
      {!canGenerate && blockingIssues.length > 0 && (
        <div className="bg-rose-950/60 border border-rose-800/80 p-3.5 text-xs text-rose-200 space-y-1">
          <span className="font-bold text-rose-300 block uppercase tracking-wider text-[11px]">
            {lang === 'bn' ? 'ব্লকিং সমস্যার তালিকা (Package Generation Blockers):' : 'Package Generation Blockers (Must resolve):'}
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-rose-200">
            {blockingIssues.map((issue, idx) => (
              <li key={idx} className="leading-relaxed">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success notification banner */}
      {generatedSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-700 p-3 text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === 'bn' 
                ? `প্যাকেজ সফলভাবে তৈরি হয়েছে: ${generatedSuccess.fileName} (মোট ${generatedSuccess.pages} পৃষ্ঠা)`
                : `Package generated successfully: ${generatedSuccess.fileName} (${generatedSuccess.pages} total pages)`}
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">DOWNLOAD COMPLETE</span>
        </div>
      )}
    </div>
  );
};
