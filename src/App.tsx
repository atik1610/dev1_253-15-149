/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Languages, 
  Download, 
  Upload, 
  FileCode, 
  Sparkles, 
  Stamp, 
  FileSpreadsheet, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Building2, 
  HelpCircle,
  Play,
  FileArchive,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { 
  Language, 
  RequirementsFile, 
  RequirementMatch, 
  SealConfig, 
  UploadedFileItem 
} from './types/tenderPackage';
import { OFFICIAL_SAMPLE_REQUIREMENTS, generateDemoPdfs } from './utils/samplePackData';
import { checkPackageEligibility } from './utils/statusChecker';
import { autoMatchFiles } from './utils/autoMatcher';
import { DocumentMatchingTable } from './components/DocumentMatchingTable';
import { UploadedFilesManager } from './components/UploadedFilesManager';
import { PackageGenerationBar } from './components/PackageGenerationBar';
import { RequirementsLoaderModal } from './components/RequirementsLoaderModal';
import { SealSignatureModal } from './components/SealSignatureModal';
import { AiHelpModal } from './components/AiHelpModal';
import { exportProjectState } from './utils/projectState';
import { downloadProjectZip } from './utils/zipDownloader';

export default function App() {
  const [lang, setLang] = useState<Language>('bn'); // Default to Bangla as per user request
  const [requirementsData, setRequirementsData] = useState<RequirementsFile>(() => {
    const saved = localStorage.getItem('tb_req_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return OFFICIAL_SAMPLE_REQUIREMENTS;
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [matches, setMatches] = useState<Record<string, RequirementMatch>>(() => {
    const saved = localStorage.getItem('tb_matches_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  const [sealConfig, setSealConfig] = useState<SealConfig>({
    hasSeal: false,
    placement: 'cover',
    position: 'bottom-right',
    scale: 1,
  });

  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [isSealModalOpen, setIsSealModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [zipToast, setZipToast] = useState<string | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('tb_req_data', JSON.stringify(requirementsData));
  }, [requirementsData]);

  useEffect(() => {
    localStorage.setItem('tb_matches_data', JSON.stringify(matches));
  }, [matches]);

  // Compute live Section 5 Status Rules & eligibility
  const { 
    results: statusResults, 
    canGenerate, 
    blockingIssues,
    okCount,
    missingCount,
    expiredCount,
    expiryNeededCount
  } = checkPackageEligibility(
    requirementsData.requirements,
    requirementsData.tender,
    matches,
    uploadedFiles
  );

  // Load demo PDFs with 1 click
  const handleLoadDemoPdfs = async () => {
    setIsLoadingDemo(true);
    try {
      const demoFiles = await generateDemoPdfs();
      setUploadedFiles(demoFiles);

      // Auto-match initially for a great user experience
      const initialMatches = autoMatchFiles(
        requirementsData.requirements,
        demoFiles,
        {}
      );

      // Pre-set some realistic valid expiry dates for demo items that have expiry
      const withDates: Record<string, RequirementMatch> = { ...initialMatches };
      requirementsData.requirements.forEach((req) => {
        if (req.has_expiry && withDates[req.id]?.fileId) {
          // Set to next year (well after 2026-10-20 deadline)
          withDates[req.id].expiryDate = '2027-06-30';
        }
      });

      setMatches(withDates);
    } catch (e: any) {
      alert(`Error loading demo files: ${e?.message}`);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleUpdateMatch = (requirementId: string, fileId?: string, expiryDate?: string) => {
    setMatches((prev) => ({
      ...prev,
      [requirementId]: {
        requirementId,
        fileId,
        expiryDate: expiryDate !== undefined ? expiryDate : prev[requirementId]?.expiryDate,
      },
    }));
  };

  const handleAutoMatch = () => {
    const updated = autoMatchFiles(requirementsData.requirements, uploadedFiles, matches);
    setMatches(updated);
  };

  const handleAddFiles = (newFiles: UploadedFileItem[]) => {
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    // Remove matches pointing to this file
    setMatches((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((reqId) => {
        if (updated[reqId].fileId === fileId) {
          updated[reqId] = { ...updated[reqId], fileId: undefined };
        }
      });
      return updated;
    });
  };

  const handleReset = () => {
    if (window.confirm(lang === 'bn' ? 'সব ডেটা মুছে রিসেট করতে চান?' : 'Reset all files and matches to initial state?')) {
      localStorage.removeItem('tb_req_data');
      localStorage.removeItem('tb_matches_data');
      setRequirementsData(OFFICIAL_SAMPLE_REQUIREMENTS);
      setUploadedFiles([]);
      setMatches({});
    }
  };

  const handleExportProject = () => {
    exportProjectState(requirementsData, matches, uploadedFiles, sealConfig);
  };

  const handleDownloadZipPackage = async () => {
    setZipToast(lang === 'bn' ? 'জিপ ফাইল প্রস্তুত হচ্ছে...' : 'Preparing project ZIP...');
    try {
      await downloadProjectZip((msg) => setZipToast(msg));
      setTimeout(() => setZipToast(null), 3500);
    } catch {
      setZipToast('Failed to download ZIP');
      setTimeout(() => setZipToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Main Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-950 text-white flex items-center justify-center font-bold font-mono tracking-tight shadow-xs">
                <span className="text-amber-400 text-base">TB</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-950 text-base tracking-tight">
                    TenderBuilder
                  </span>
                  <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2">
                    AI DEVFEST
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-none hidden md:block">
                  {lang === 'bn' 
                    ? 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার ও স্বয়ংক্রিয় অডিট প্ল্যাটফর্ম' 
                    : 'Tender Document Package Builder (Rules 4.1 - 6.4 Compliant)'}
                </p>
              </div>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex items-center gap-2">
              {/* Load requirements.json (Task 4.1) */}
              <button
                onClick={() => setIsReqModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-300 py-1.5 px-2.5 transition-colors"
                title="Load custom requirements.json or sample pack"
              >
                <FileCode className="w-3.5 h-3.5 text-slate-600" />
                <span className="font-semibold">{lang === 'bn' ? 'requirements.json' : 'Load JSON'}</span>
              </button>

              {/* Bonus: Save / Export Project State */}
              <button
                onClick={handleExportProject}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-300 py-1.5 px-2.5 transition-colors"
                title="Save and backup current project state (Bonus Task 7)"
              >
                <Save className="w-3.5 h-3.5 text-slate-600" />
                <span>{lang === 'bn' ? 'সেভ প্রজেক্ট' : 'Save Work'}</span>
              </button>

              {/* Bonus: AI Assistant */}
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-300 py-1.5 px-2.5 transition-colors"
                title="AI compliance assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-semibold">{lang === 'bn' ? 'AI অডিট' : 'AI Help'}</span>
              </button>

              {/* Download Project Source Code ZIP */}
              <button
                onClick={handleDownloadZipPackage}
                className="inline-flex items-center gap-1.5 text-xs text-slate-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 py-1.5 px-2.5 font-semibold transition-colors"
                title="Download full project source code ZIP"
              >
                <Download className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'ZIP ডাউনলোড' : 'Download ZIP'}</span>
              </button>

              {/* Two Languages Switcher (Task 4.9) */}
              <button
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 py-1.5 px-2.5 transition-colors"
                title="Toggle between English and Bangla (Task 4.9)"
              >
                <Languages className="w-3.5 h-3.5 text-slate-600" />
                <span className="font-mono uppercase">{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="text-slate-400 hover:text-slate-700 p-1.5"
                title="Reset data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {zipToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 border border-slate-700 shadow-2xl flex items-center gap-3 text-xs animate-in fade-in">
          <Download className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{zipToast}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Section 4.1: Tender Details Banner */}
        <div className="bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5">
                  TENDER ID: {requirementsData.tender.tender_id}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? 'ক্রয়কারী সংস্থা: ' : 'Procuring Entity: '}
                  <span className="text-slate-900 font-semibold">{requirementsData.tender.procuring_entity}</span>
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? 'দরদাতা: ' : 'Bidder: '}
                  <span className="text-slate-900 font-semibold">{requirementsData.tender.bidder}</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                {requirementsData.tender.title}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono">
                <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-2.5 py-1 text-amber-950 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  {lang === 'bn' ? 'দাখিলের সময়সীমা (Deadline): ' : 'Submission Deadline: '}
                  {requirementsData.tender.submission_deadline}
                </span>
                <span className="text-slate-500">
                  {requirementsData.requirements.length} {lang === 'bn' ? 'টি প্রয়োজনীয় শর্তাবলী' : 'total requirements listed'}
                </span>
              </div>
            </div>

            {/* Live Status Indicators (Section 5 Summary) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-slate-50 border border-slate-200 px-3 py-2 text-center min-w-[75px]">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">OK (Valid)</span>
                <span className="text-base font-bold font-mono text-emerald-700">{okCount}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 px-3 py-2 text-center min-w-[75px]">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Missing</span>
                <span className={`text-base font-bold font-mono ${missingCount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                  {missingCount}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 px-3 py-2 text-center min-w-[75px]">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Expired</span>
                <span className={`text-base font-bold font-mono ${expiredCount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                  {expiredCount}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 px-3 py-2 text-center min-w-[75px]">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Needs Date</span>
                <span className={`text-base font-bold font-mono ${expiryNeededCount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                  {expiryNeededCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Task 4.2 & 4.6: Uploaded Files Vault & Duplicate Detector */}
        <UploadedFilesManager
          files={uploadedFiles}
          onAddFiles={handleAddFiles}
          onRemoveFile={handleRemoveFile}
          onAutoMatch={handleAutoMatch}
          onLoadDemoFiles={handleLoadDemoPdfs}
          isLoadingDemo={isLoadingDemo}
          lang={lang}
        />

        {/* Task 4.3, 4.4, 4.5: Document Matching Table & Section 5 Statuses */}
        <DocumentMatchingTable
          tender={requirementsData.tender}
          statusResults={statusResults}
          uploadedFiles={uploadedFiles}
          matches={matches}
          onUpdateMatch={handleUpdateMatch}
          lang={lang}
        />

        {/* Task 4.7 & 4.8: Package Generator & Rules 6.1-6.4 PDF Assembler */}
        <PackageGenerationBar
          tender={requirementsData.tender}
          statusResults={statusResults}
          canGenerate={canGenerate}
          blockingIssues={blockingIssues}
          sealConfig={sealConfig}
          onOpenSealModal={() => setIsSealModalOpen(true)}
          lang={lang}
        />
      </main>

      {/* Modal: Load requirements.json (Task 4.1) */}
      <RequirementsLoaderModal
        isOpen={isReqModalOpen}
        onClose={() => setIsReqModalOpen(false)}
        onLoadRequirements={(data) => {
          setRequirementsData(data);
          setMatches({}); // Reset matches for new tender
        }}
        lang={lang}
      />

      {/* Modal: Official Seal / Signature (Bonus Task 7) */}
      <SealSignatureModal
        isOpen={isSealModalOpen}
        onClose={() => setIsSealModalOpen(false)}
        config={sealConfig}
        onChangeConfig={setSealConfig}
        lang={lang}
      />

      {/* Modal: AI Help Assistant (Bonus Task 7) */}
      <AiHelpModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        tender={requirementsData.tender}
        statusResults={statusResults}
        lang={lang}
      />
    </div>
  );
}
