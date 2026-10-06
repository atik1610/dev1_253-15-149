import React, { useRef, useState } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Copy, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Sparkles, 
  FileWarning, 
  ShieldCheck,
  X
} from 'lucide-react';
import { Language, UploadedFileItem } from '../types/tenderPackage';
import { PDFDocument } from 'pdf-lib';
import { computeFileHash } from '../utils/samplePackData';

interface UploadedFilesManagerProps {
  files: UploadedFileItem[];
  onAddFiles: (newFiles: UploadedFileItem[]) => void;
  onRemoveFile: (fileId: string) => void;
  onAutoMatch: () => void;
  onLoadDemoFiles: () => void;
  isLoadingDemo: boolean;
  lang: Language;
}

export const UploadedFilesManager: React.FC<UploadedFilesManagerProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onAutoMatch,
  onLoadDemoFiles,
  isLoadingDemo,
  lang,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File): Promise<UploadedFileItem | null> => {
    // 4.2: If a file is not a PDF, reject it and show a clear message
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage(
        lang === 'bn'
          ? `"${file.name}" ফাইলটি প্রত্যাখ্যাত: শুধুমাত্র PDF ফাইল গ্রহণযোগ্য!`
          : `File "${file.name}" rejected: Only PDF files are permitted!`
      );
      return null;
    }

    try {
      const buffer = await file.arrayBuffer();
      const hash = await computeFileHash(buffer);

      // Check pages with pdf-lib, handle damaged/encrypted safely
      let pageCount = 1;
      let isCorrupt = false;
      let corruptMsg = undefined;

      try {
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        pageCount = pdfDoc.getPageCount();
      } catch (err: any) {
        isCorrupt = true;
        corruptMsg = err?.message?.includes('password')
          ? 'Password protected PDF'
          : 'Damaged or unreadable PDF structure';
      }

      // Check if duplicate of already uploaded file
      const existingSame = files.find((f) => f.hash === hash);

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        pageCount,
        hash,
        isDuplicate: Boolean(existingSame),
        duplicateOfName: existingSame ? existingSame.name : undefined,
        isCorrupt,
        errorMessage: corruptMsg,
        buffer,
        uploadedAt: new Date().toLocaleTimeString(),
      };
    } catch (err: any) {
      setErrorMessage(`Error processing ${file.name}: ${err?.message || 'Unknown error'}`);
      return null;
    }
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);
    setIsProcessing(true);

    const newItems: UploadedFileItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const item = await processFile(fileList[i]);
      if (item) {
        newItems.push(item);
      }
    }

    // Also check for duplicates within the newly uploaded batch
    const allHashes: Record<string, string> = {};
    files.forEach((f) => {
      allHashes[f.hash] = f.name;
    });

    newItems.forEach((item) => {
      if (allHashes[item.hash]) {
        item.isDuplicate = true;
        item.duplicateOfName = allHashes[item.hash];
      } else {
        allHashes[item.hash] = item.name;
      }
    });

    onAddFiles(newItems);
    setIsProcessing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalPages = files.reduce((acc, f) => acc + (f.isCorrupt ? 0 : f.pageCount), 0);
  const duplicateCount = files.filter((f) => f.isDuplicate).length;

  return (
    <div className="bg-white border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-950 text-sm">
              {lang === 'bn' ? 'আপলোডকৃত পিডিএফ ফাইল ভল্ট' : 'Uploaded PDF Files Repository'}
            </h3>
            <span className="text-xs font-mono bg-slate-100 border border-slate-300 px-2 py-0.5 text-slate-700">
              {files.length} {lang === 'bn' ? 'টি ফাইল' : 'files'} · {totalPages} {lang === 'bn' ? 'পৃষ্ঠা' : 'pages'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'bn' 
              ? 'একাধিক পিডিএফ ফাইল ড্র্যাগ অ্যান্ড ড্রপ করুন। ডুপ্লিকেট ফাইল স্বয়ংক্রিয়ভাবে শনাক্ত হবে।'
              : 'Upload multiple PDFs at once. Content duplicates are flagged by cryptographic hash.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Load Sample Demo PDFs */}
          <button
            type="button"
            onClick={onLoadDemoFiles}
            disabled={isLoadingDemo}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-1.5 px-3 border border-slate-300 transition-colors"
            title="Load realistic sample PDFs to test matching and duplicate checks immediately"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{isLoadingDemo ? (lang === 'bn' ? 'লোডিং...' : 'Loading...') : (lang === 'bn' ? 'ডেমো ফাইল লোড করুন' : 'Load Demo Files')}</span>
          </button>

          {/* Bonus Auto Match */}
          <button
            type="button"
            onClick={onAutoMatch}
            disabled={files.length === 0}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold py-1.5 px-3 transition-colors"
            title="Automatically match files based on keyword and name similarity"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? 'অটো-ম্যাচ (Auto Match)' : 'Auto-Match Files'}</span>
          </button>
        </div>
      </div>

      {/* Error alert if non-PDF rejected */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Duplicate warning banner */}
      {duplicateCount > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {lang === 'bn'
              ? `সতর্কতা: ${duplicateCount}টি ডুপ্লিকেট ফাইল শনাক্ত হয়েছে (একই কন্টেন্ট)। এগুলোকে ভিন্ন নথিতে যুক্ত করা যাবে না (রুল ৪.৬)।`
              : `Warning: ${duplicateCount} duplicate file(s) detected with identical SHA-256 hash. Rule 4.6 prohibits matching duplicates.`}
          </span>
        </div>
      )}

      {/* Drag & Drop Upload Dropzone */}
      <label 
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors"
      >
        <Upload className="w-7 h-7 text-slate-400 mb-2" />
        <span className="text-xs font-bold text-slate-800">
          {isProcessing ? (lang === 'bn' ? 'ফাইল বিশ্লেষণ হচ্ছে...' : 'Processing PDFs...') : (lang === 'bn' ? 'পিডিএফ ফাইল ড্রপ করুন বা ব্রাউজ করতে ক্লিক করুন' : 'Drop multiple PDF files here, or click to browse')}
        </span>
        <span className="text-[11px] text-slate-500 mt-1">
          {lang === 'bn' ? 'শুধুমাত্র .pdf ফাইল গ্রহণযোগ্য (সর্বোচ্চ ৩০টি ফাইল, ৫০ মেগাবাইট)' : 'PDF format only, up to 30 files & 50MB (Client-side processed)'}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </label>

      {/* Uploaded Files Table */}
      {files.length > 0 && (
        <div className="border border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-2 px-3 min-w-[200px]">File Name</th>
                <th className="py-2 px-3 text-right">Pages</th>
                <th className="py-2 px-3 text-right">Size</th>
                <th className="py-2 px-3">Content Hash / Integrity</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {files.map((file) => (
                <tr 
                  key={file.id} 
                  className={`hover:bg-slate-50/70 ${
                    file.isDuplicate ? 'bg-amber-50/30' : file.isCorrupt ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </span>
                      {file.isDuplicate && (
                        <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2">
                          DUPLICATE OF {file.duplicateOfName || 'ANOTHER FILE'}
                        </span>
                      )}
                      {file.isCorrupt && (
                        <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-100 border border-rose-300 px-1.5 py-0.2">
                          {file.errorMessage || 'CORRUPT PDF'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                    {file.isCorrupt ? '-' : `${file.pageCount} pgs`}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    {(file.size / 1024).toFixed(0)} KB
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                    SHA256: {file.hash.substring(0, 12)}...
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title={lang === 'bn' ? 'ফাইল মুছুন' : 'Remove File'}
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
  );
};
