import React, { useState } from 'react';
import { X, Upload, FileCode, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Language, RequirementsFile } from '../types/tenderPackage';
import { OFFICIAL_SAMPLE_REQUIREMENTS } from '../utils/samplePackData';

interface RequirementsLoaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRequirements: (data: RequirementsFile) => void;
  lang: Language;
}

export const RequirementsLoaderModal: React.FC<RequirementsLoaderModalProps> = ({
  isOpen,
  onClose,
  onLoadRequirements,
  lang,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        validateAndLoad(parsed);
      } catch (err: any) {
        setError(`Invalid JSON syntax: ${err?.message}`);
      }
    };
    reader.readAsText(file);
  };

  const validateAndLoad = (data: any) => {
    if (!data || !data.tender || !Array.isArray(data.requirements)) {
      setError('JSON must contain a "tender" object and a "requirements" array.');
      return;
    }
    if (!data.tender.tender_id || !data.tender.submission_deadline) {
      setError('Tender must include "tender_id" and "submission_deadline".');
      return;
    }

    onLoadRequirements(data);
    onClose();
  };

  const handleLoadOfficialSample = () => {
    onLoadRequirements(OFFICIAL_SAMPLE_REQUIREMENTS);
    onClose();
  };

  const handlePasteSubmit = () => {
    try {
      const parsed = JSON.parse(jsonText);
      validateAndLoad(parsed);
    } catch (err: any) {
      setError(`Invalid JSON syntax: ${err?.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl border border-slate-300 shadow-2xl flex flex-col">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">
              {lang === 'bn' ? 'requirements.json লোড করুন' : 'Load Tender Requirements (requirements.json)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Option 1: Official Contest Sample Pack */}
          <div className="p-4 bg-emerald-50 border border-emerald-300 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-950 block">
                {OFFICIAL_SAMPLE_REQUIREMENTS.tender.tender_id} · {OFFICIAL_SAMPLE_REQUIREMENTS.tender.title}
              </span>
              <span className="text-slate-600">
                Official AI DevFest Sample Pack (9 Requirements, Deadline: 2026-10-20)
              </span>
            </div>
            <button
              onClick={handleLoadOfficialSample}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-1.5 px-3 transition-colors"
            >
              {lang === 'bn' ? 'লোড করুন' : 'Load Official Pack'}
            </button>
          </div>

          {/* Option 2: Upload custom requirements.json file */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              {lang === 'bn' ? 'আপনার কম্পিউটার থেকে requirements.json ফাইল সিলেক্ট করুন' : 'Upload custom requirements.json file'}
            </label>
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50 cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="font-semibold text-slate-700">Click to Browse JSON file</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Option 3: Paste raw JSON */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {lang === 'bn' ? 'অথবা সরাসরি JSON কোড পেস্ট করুন' : 'Or paste raw JSON content'}
            </label>
            <textarea
              rows={4}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{ "tender": { ... }, "requirements": [ ... ] }'
              className="w-full bg-slate-50 border border-slate-300 font-mono p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="button"
              disabled={!jsonText.trim()}
              onClick={handlePasteSubmit}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold px-5 py-2"
            >
              {lang === 'bn' ? 'প্রয়োগ করুন' : 'Apply JSON'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
