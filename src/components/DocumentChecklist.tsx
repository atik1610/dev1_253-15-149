import React, { useState } from 'react';
import { 
  FileCheck, 
  AlertCircle, 
  FileText, 
  Plus, 
  Upload, 
  Check, 
  X, 
  Clock, 
  ShieldCheck,
  FileWarning
} from 'lucide-react';
import { Language, RequiredDocument, TenderProposal } from '../types/tender';

interface DocumentChecklistProps {
  tender: TenderProposal;
  lang: Language;
  onUpdateDocuments: (documents: RequiredDocument[]) => void;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  tender,
  lang,
  onUpdateDocuments,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newDoc, setNewDoc] = useState<Partial<RequiredDocument>>({
    title: '',
    titleBn: '',
    category: 'Legal',
    isMandatory: true,
    status: 'uploaded',
    fileName: '',
  });

  const mandatory = tender.documents.filter((d) => d.isMandatory);
  const verified = mandatory.filter((d) => d.status === 'verified').length;
  const missing = mandatory.filter((d) => d.status === 'missing' || d.status === 'expired').length;

  const handleStatusChange = (id: string, status: RequiredDocument['status']) => {
    const updated = tender.documents.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          status,
          fileName: status !== 'missing' ? (d.fileName || `${d.title.replace(/\s+/g, '_')}_Signed.pdf`) : undefined,
        };
      }
      return d;
    });
    onUpdateDocuments(updated);
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title) return;

    const created: RequiredDocument = {
      id: `doc-${Date.now()}`,
      title: newDoc.title || '',
      titleBn: newDoc.titleBn || newDoc.title || '',
      category: (newDoc.category as any) || 'Legal',
      isMandatory: newDoc.isMandatory ?? true,
      status: (newDoc.status as any) || 'verified',
      fileName: newDoc.fileName || `${newDoc.title?.replace(/\s+/g, '_')}.pdf`,
    };

    onUpdateDocuments([...tender.documents, created]);
    setNewDoc({
      title: '',
      titleBn: '',
      category: 'Legal',
      isMandatory: true,
      status: 'uploaded',
      fileName: '',
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Document Completeness Banner */}
      <div className="bg-white p-5 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            {lang === 'bn' ? 'নথিপত্র যাচাই সূচক' : 'Statutory Document Verification'}
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {verified} / {mandatory.length}
            </span>
            <span className="text-xs text-slate-500">
              {lang === 'bn' ? 'বাধ্যতামূলক নথি যাচাই সম্পন্ন' : 'mandatory documents verified'}
            </span>
          </div>
          <div className="w-64 sm:w-80 bg-slate-200 h-2 mt-2">
            <div
              className={`h-2 transition-all ${
                missing === 0 ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
              style={{ width: `${(verified / (mandatory.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-1.5 px-3 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'নতুন নথি যুক্ত করুন' : 'Add Document Requirement'}</span>
        </button>
      </div>

      {missing > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
          <FileWarning className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            {lang === 'bn'
              ? `সতর্কতা: ${missing}টি আবশ্যকীয় নথি অনুপস্থিত বা মেয়াদোত্তীর্ণ! দরপত্র মূল্যায়ন কমিটি এগুলো ছাড়া দরপত্র সরাসরি অযোগ্য ঘোষণা করবে।`
              : `Warning: ${missing} mandatory document(s) are missing or expired! This triggers automatic disqualification at tender opening.`}
          </span>
        </div>
      )}

      {/* Add Document Form */}
      {isAdding && (
        <form onSubmit={handleAddDoc} className="bg-slate-50 p-4 border border-slate-300 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-900 uppercase tracking-wider">
              {lang === 'bn' ? 'নতুন নথির প্রয়োজনীয়তা যোগ' : 'Add Required Document'}
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-500 hover:text-slate-800"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'নথির নাম (English)' : 'Document Title (English)'}</label>
              <input
                type="text"
                required
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                placeholder="e.g. ISO 9001 Certificate"
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'নথির নাম (বাংলা)' : 'Document Title (Bengali)'}</label>
              <input
                type="text"
                value={newDoc.titleBn}
                onChange={(e) => setNewDoc({ ...newDoc, titleBn: e.target.value })}
                placeholder="e.g. ট্রেড লাইসেন্স"
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
              <select
                value={newDoc.category}
                onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as any })}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5"
              >
                <option value="Legal">Legal</option>
                <option value="Financial">Financial</option>
                <option value="Technical">Technical</option>
                <option value="Experience">Experience</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newDoc.isMandatory}
                onChange={(e) => setNewDoc({ ...newDoc, isMandatory: e.target.checked })}
                className="w-3.5 h-3.5"
              />
              <span className="text-slate-700 font-medium">
                {lang === 'bn' ? 'আবশ্যকীয় নথি (Mandatory Requirement)' : 'Mark as Mandatory Criteria'}
              </span>
            </label>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-1.5 px-4"
            >
              {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Document'}
            </button>
          </div>
        </form>
      )}

      {/* Document Items Grid/List */}
      <div className="space-y-3">
        {tender.documents.map((doc) => (
          <div
            key={doc.id}
            className={`bg-white p-4 border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              doc.status === 'missing' || doc.status === 'expired'
                ? 'border-rose-300 bg-rose-50/20'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {doc.status === 'verified' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                {doc.status === 'uploaded' && <FileCheck className="w-5 h-5 text-sky-600" />}
                {doc.status === 'missing' && <X className="w-5 h-5 text-rose-600" />}
                {doc.status === 'expired' && <Clock className="w-5 h-5 text-amber-600" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-950">
                    {lang === 'bn' ? doc.titleBn || doc.title : doc.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-100 px-1.5 py-0.2 border border-slate-200">
                    {doc.category}
                  </span>
                  {doc.isMandatory && (
                    <span className="text-[10px] font-mono text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2">
                      REQUIRED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                  {doc.fileName ? (
                    <span className="font-mono text-slate-700">📄 {doc.fileName}</span>
                  ) : (
                    <span className="text-rose-600 italic">{lang === 'bn' ? 'নথি আপলোড করা হয়নি' : 'No file attached'}</span>
                  )}

                  {doc.expiryDate && (
                    <span className="text-slate-500">
                      {lang === 'bn' ? 'মেয়াদ: ' : 'Exp: '} {doc.expiryDate}
                    </span>
                  )}

                  {doc.notes && (
                    <span className="text-slate-500 italic">· {doc.notes}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">Status:</span>
              <button
                onClick={() => handleStatusChange(doc.id, 'verified')}
                className={`text-xs px-2.5 py-1 border transition-colors ${
                  doc.status === 'verified'
                    ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Mark Verified"
              >
                {lang === 'bn' ? 'যাচাইকৃত' : 'Verified'}
              </button>
              <button
                onClick={() => handleStatusChange(doc.id, 'uploaded')}
                className={`text-xs px-2.5 py-1 border transition-colors ${
                  doc.status === 'uploaded'
                    ? 'bg-sky-700 text-white border-sky-700 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Mark Uploaded"
              >
                {lang === 'bn' ? 'আপলোড' : 'Uploaded'}
              </button>
              <button
                onClick={() => handleStatusChange(doc.id, 'missing')}
                className={`text-xs px-2.5 py-1 border transition-colors ${
                  doc.status === 'missing'
                    ? 'bg-rose-700 text-white border-rose-700 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Mark Missing"
              >
                {lang === 'bn' ? 'অনুপস্থিত' : 'Missing'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
