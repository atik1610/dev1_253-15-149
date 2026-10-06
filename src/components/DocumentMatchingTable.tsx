import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  FileText, 
  Paperclip, 
  X, 
  Clock, 
  ShieldAlert, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { 
  DocumentStatus, 
  Language, 
  RequirementMatch, 
  RequirementStatusResult, 
  TenderHeader, 
  UploadedFileItem 
} from '../types/tenderPackage';

interface DocumentMatchingTableProps {
  tender: TenderHeader;
  statusResults: RequirementStatusResult[];
  uploadedFiles: UploadedFileItem[];
  matches: Record<string, RequirementMatch>;
  onUpdateMatch: (requirementId: string, fileId?: string, expiryDate?: string) => void;
  lang: Language;
}

export const DocumentMatchingTable: React.FC<DocumentMatchingTableProps> = ({
  tender,
  statusResults,
  uploadedFiles,
  matches,
  onUpdateMatch,
  lang,
}) => {
  // Collect currently used file IDs to enforce 1-to-1 match constraint (Task 4.3)
  const usedFileIds = new Set(
    Object.values(matches)
      .map((m) => m.fileId)
      .filter(Boolean) as string[]
  );

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'OK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            OK
          </span>
        );
      case 'Missing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-2 py-0.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            {lang === 'bn' ? 'অনুপস্থিত (Missing)' : 'Missing'}
          </span>
        );
      case 'Expiry date needed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {lang === 'bn' ? 'মেয়াদ প্রয়োজন' : 'Expiry Needed'}
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-2 py-0.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            {lang === 'bn' ? 'মেয়াদ উত্তীর্ণ (Expired)' : 'Expired'}
          </span>
        );
      case 'Not provided':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-300 px-2 py-0.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            {lang === 'bn' ? 'দেওয়া হয়নি (ঐচ্ছিক)' : 'Not provided'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-950 text-sm">
            {lang === 'bn' ? 'নথিপত্র যাচাই ও ম্যাচিং শিডিউল' : 'Required Documents Matching & Verification Matrix'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'bn' 
              ? 'দরপত্রের ক্রম (Order) অনুযায়ী প্রতিটি আবশ্যিক নথির সাথে সঠিক পিডিএফ ফাইল সংযুক্ত করুন।'
              : 'Match uploaded PDFs to required items in strict tender order (1-to-1 constraint enforced).'}
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500">
          Submission Deadline: <span className="font-bold text-slate-900">{tender.submission_deadline}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3 w-12 text-center font-mono">Order</th>
              <th className="py-2.5 px-3 w-16 font-mono">ID</th>
              <th className="py-2.5 px-4 min-w-[200px]">Document Title</th>
              <th className="py-2.5 px-2 w-24">Type</th>
              <th className="py-2.5 px-3 min-w-[240px]">Matched PDF File</th>
              <th className="py-2.5 px-3 min-w-[170px]">Expiry Date</th>
              <th className="py-2.5 px-3 min-w-[140px]">Status (Sec 5)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {statusResults.map((item) => {
              const req = item.requirement;
              const match = matches[req.id];
              const isMatched = Boolean(match?.fileId);

              return (
                <tr 
                  key={req.id} 
                  className={`hover:bg-slate-50/70 transition-colors ${
                    item.blocksPackage ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Order */}
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5">
                      {req.order}
                    </span>
                  </td>

                  {/* ID */}
                  <td className="py-3 px-3 font-mono font-medium text-slate-700">
                    {req.id}
                  </td>

                  {/* Title */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 text-xs">
                      {lang === 'bn' ? req.title_bn : req.title_en}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {lang === 'bn' ? req.title_en : req.title_bn}
                    </div>
                  </td>

                  {/* Mandatory / Optional */}
                  <td className="py-3 px-2">
                    {req.mandatory ? (
                      <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.2">
                        REQUIRED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2">
                        OPTIONAL
                      </span>
                    )}
                  </td>

                  {/* Matched File Dropdown (Task 4.3) */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label={`Match file for ${req.title_en}`}
                        value={match?.fileId || ''}
                        onChange={(e) => {
                          const fileId = e.target.value || undefined;
                          onUpdateMatch(req.id, fileId, match?.expiryDate);
                        }}
                        className={`w-full bg-white border text-xs py-1.5 px-2.5 truncate focus:outline-none focus:ring-1 ${
                          isMatched
                            ? 'border-emerald-300 text-slate-900 font-medium'
                            : 'border-slate-300 text-slate-500'
                        }`}
                      >
                        <option value="">-- {lang === 'bn' ? 'ফাইল সিলেক্ট করুন' : 'Select PDF File'} --</option>
                        {uploadedFiles.map((file) => {
                          const isAssignedToOther = usedFileIds.has(file.id) && match?.fileId !== file.id;
                          return (
                            <option
                              key={file.id}
                              value={file.id}
                              disabled={isAssignedToOther || file.isDuplicate || file.isCorrupt}
                            >
                              {file.name} ({file.pageCount} pgs)
                              {file.isDuplicate ? ' [DUPLICATE]' : ''}
                              {file.isCorrupt ? ' [DAMAGED]' : ''}
                              {isAssignedToOther ? ' [ALREADY MATCHED]' : ''}
                            </option>
                          );
                        })}
                      </select>

                      {isMatched && (
                        <button
                          onClick={() => onUpdateMatch(req.id, undefined, match?.expiryDate)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title={lang === 'bn' ? 'ম্যাচ বাতিল করুন' : 'Undo Match'}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {item.matchedFile && (
                      <span className="text-[10px] text-slate-500 block mt-1">
                        📄 {item.matchedFile.pageCount} {lang === 'bn' ? 'পৃষ্ঠা' : 'pages'} · {(item.matchedFile.size / 1024).toFixed(0)} KB
                      </span>
                    )}
                  </td>

                  {/* Expiry Date (Task 4.4) */}
                  <td className="py-3 px-3">
                    {req.has_expiry ? (
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="date"
                            aria-label={`Expiry date for ${req.title_en}`}
                            value={match?.expiryDate || ''}
                            disabled={!isMatched}
                            onChange={(e) => {
                              onUpdateMatch(req.id, match?.fileId, e.target.value);
                            }}
                            className={`w-full bg-white border text-xs px-2 py-1 font-mono focus:outline-none ${
                              !isMatched 
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                : item.status === 'Expired'
                                ? 'border-rose-400 bg-rose-50 text-rose-900 font-bold'
                                : item.status === 'Expiry date needed'
                                ? 'border-amber-400 bg-amber-50'
                                : 'border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        {/* Quick date shortcuts for convenience */}
                        {isMatched && (
                          <div className="flex items-center gap-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date(tender.submission_deadline);
                                d.setFullYear(d.getFullYear() + 1);
                                onUpdateMatch(req.id, match?.fileId, d.toISOString().split('T')[0]);
                              }}
                              className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.2 border border-slate-200"
                            >
                              +1 Yr
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateMatch(req.id, match?.fileId, tender.submission_deadline);
                              }}
                              className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.2 border border-slate-200"
                              title="Set to exact submission deadline (valid according to rule)"
                            >
                              = Deadline
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400 italic">
                        Not Applicable
                      </span>
                    )}
                  </td>

                  {/* Status (Task 4.5 & Section 5) */}
                  <td className="py-3 px-3">
                    <div>
                      {getStatusBadge(item.status)}
                      <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
                        {lang === 'bn' ? item.statusMessageBn : item.statusMessageEn}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
