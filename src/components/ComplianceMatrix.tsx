import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Award, 
  Plus, 
  Search, 
  Filter,
  Check,
  ShieldAlert
} from 'lucide-react';
import { ComplianceClause, ComplianceStatus, Language, TenderProposal } from '../types/tender';

interface ComplianceMatrixProps {
  tender: TenderProposal;
  lang: Language;
  onUpdateClauses: (clauses: ComplianceClause[]) => void;
}

export const ComplianceMatrix: React.FC<ComplianceMatrixProps> = ({
  tender,
  lang,
  onUpdateClauses,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newClause, setNewClause] = useState<Partial<ComplianceClause>>({
    clauseNumber: '',
    title: '',
    rfpRequirement: '',
    status: 'compliant',
    proposedSolution: '',
    isMandatory: true,
  });

  const total = tender.complianceClauses.length;
  const compliantCount = tender.complianceClauses.filter(
    (c) => c.status === 'compliant' || c.status === 'exceeds'
  ).length;
  const nonCompliantCount = tender.complianceClauses.filter(
    (c) => c.status === 'non_compliant'
  ).length;
  const partialCount = tender.complianceClauses.filter(
    (c) => c.status === 'partially_compliant'
  ).length;

  const complianceRate = total > 0 ? Math.round((compliantCount / total) * 100) : 100;

  const handleStatusChange = (id: string, newStatus: ComplianceStatus) => {
    const updated = tender.complianceClauses.map((c) => {
      if (c.id === id) {
        return { ...c, status: newStatus };
      }
      return c;
    });
    onUpdateClauses(updated);
  };

  const handleAddClause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClause.clauseNumber || !newClause.title) return;

    const created: ComplianceClause = {
      id: `cl-${Date.now()}`,
      clauseNumber: newClause.clauseNumber || 'Sec 0.0',
      title: newClause.title || '',
      rfpRequirement: newClause.rfpRequirement || '',
      status: (newClause.status as ComplianceStatus) || 'compliant',
      proposedSolution: newClause.proposedSolution || '',
      isMandatory: newClause.isMandatory ?? true,
    };

    onUpdateClauses([...tender.complianceClauses, created]);
    setNewClause({
      clauseNumber: '',
      title: '',
      rfpRequirement: '',
      status: 'compliant',
      proposedSolution: '',
      isMandatory: true,
    });
    setIsAdding(false);
  };

  const filtered = tender.complianceClauses.filter((clause) => {
    const matchesSearch =
      clause.clauseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.rfpRequirement.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return clause.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Compliance Overview Gauge */}
      <div className="bg-white p-5 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            {lang === 'bn' ? 'কারিগরি শর্ত সম্মতি অনুপাত' : 'Technical RFP Compliance Index'}
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-extrabold font-mono text-slate-900">{complianceRate}%</span>
            <span className="text-xs text-slate-500">
              ({compliantCount} / {total} {lang === 'bn' ? 'শর্ত অনুমোদিত' : 'clauses satisfied'})
            </span>
          </div>
          <div className="w-64 sm:w-80 bg-slate-200 h-2 mt-2">
            <div
              className={`h-2 transition-all ${
                complianceRate === 100 ? 'bg-emerald-600' : complianceRate >= 80 ? 'bg-amber-500' : 'bg-rose-600'
              }`}
              style={{ width: `${complianceRate}%` }}
            />
          </div>
        </div>

        {/* Breakdown counters */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-slate-700">
            <span className="text-emerald-700 font-bold text-sm block">{compliantCount}</span>
            <span>{lang === 'bn' ? 'পূর্ণ সম্মতি' : 'Compliant'}</span>
          </div>
          <div className="text-slate-700">
            <span className="text-amber-600 font-bold text-sm block">{partialCount}</span>
            <span>{lang === 'bn' ? 'আংশিক' : 'Deviations'}</span>
          </div>
          <div className="text-slate-700">
            <span className="text-rose-600 font-bold text-sm block">{nonCompliantCount}</span>
            <span>{lang === 'bn' ? 'অসঙ্গতি' : 'Non-Comp'}</span>
          </div>
        </div>
      </div>

      {nonCompliantCount > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            {lang === 'bn'
              ? `সতর্কতা: ${nonCompliantCount}টি আবশ্যিক শর্তে অসঙ্গতি রয়েছে! দরপত্র মূল্যায়ন কমিটি কর্তৃক সরাসরি বাতিল হওয়া ঠেকাতে এগুলো সংশোধন করুন।`
              : `Warning: ${nonCompliantCount} clause(s) marked Non-Compliant. Public tenders fail technical responsiveness with unresolved deviations.`}
          </span>
        </div>
      )}

      {/* Filter and Add Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'bn' ? 'ধারা বা কিওয়ার্ড খুঁজুন...' : 'Search clause number or spec...'}
              className="w-full bg-white border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 text-xs py-1.5 px-2.5 text-slate-700 focus:outline-none"
          >
            <option value="all">{lang === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
            <option value="compliant">{lang === 'bn' ? 'সম্মতি' : 'Compliant'}</option>
            <option value="partially_compliant">{lang === 'bn' ? 'আংশিক বিচ্যুতি' : 'Partial'}</option>
            <option value="non_compliant">{lang === 'bn' ? 'অসম্মতি' : 'Non-Compliant'}</option>
            <option value="exceeds">{lang === 'bn' ? 'উন্নত' : 'Exceeds Spec'}</option>
          </select>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-1.5 px-3 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'নতুন শর্ত যোগ করুন' : 'Add Clause'}</span>
        </button>
      </div>

      {/* Add Clause Form */}
      {isAdding && (
        <form onSubmit={handleAddClause} className="bg-slate-50 p-4 border border-slate-300 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-900 uppercase tracking-wider">
              {lang === 'bn' ? 'নতুন কারিগরি শর্ত এন্ট্রি' : 'New RFP Compliance Specification Clause'}
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-500 hover:text-slate-800"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'ধারা নম্বর (Clause No)' : 'Clause Number'}</label>
              <input
                type="text"
                required
                value={newClause.clauseNumber}
                onChange={(e) => setNewClause({ ...newClause, clauseNumber: e.target.value })}
                placeholder="e.g. Sec 4.5.1"
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'শিরোনাম' : 'Title'}</label>
              <input
                type="text"
                required
                value={newClause.title}
                onChange={(e) => setNewClause({ ...newClause, title: e.target.value })}
                placeholder="e.g. End-to-End Encryption Protocol"
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</label>
              <select
                value={newClause.status}
                onChange={(e) => setNewClause({ ...newClause, status: e.target.value as ComplianceStatus })}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5"
              >
                <option value="compliant">Compliant</option>
                <option value="exceeds">Exceeds Spec</option>
                <option value="partially_compliant">Partially Compliant</option>
                <option value="non_compliant">Non-Compliant</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'ক্লায়েন্টের আরএফপি শর্ত' : 'Client RFP Requirement Statement'}</label>
            <textarea
              rows={2}
              value={newClause.rfpRequirement}
              onChange={(e) => setNewClause({ ...newClause, rfpRequirement: e.target.value })}
              placeholder="Verbatim text from tender specifications..."
              className="w-full bg-white border border-slate-300 p-2"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'প্রস্তাবিত সমাধান ও বাস্তবায়ন পদ্ধতি' : 'Bidder Proposed Technical Solution'}</label>
            <textarea
              rows={2}
              value={newClause.proposedSolution}
              onChange={(e) => setNewClause({ ...newClause, proposedSolution: e.target.value })}
              placeholder="How the technical proposal conforms with architecture..."
              className="w-full bg-white border border-slate-300 p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-1.5 px-4"
            >
              {lang === 'bn' ? 'শর্ত যুক্ত করুন' : 'Add Clause'}
            </button>
          </div>
        </form>
      )}

      {/* Clauses List */}
      <div className="space-y-3">
        {filtered.map((clause) => (
          <div
            key={clause.id}
            className={`bg-white p-4 border transition-colors ${
              clause.status === 'non_compliant'
                ? 'border-rose-300 bg-rose-50/20'
                : clause.status === 'partially_compliant'
                ? 'border-amber-300 bg-amber-50/20'
                : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 border border-slate-200">
                    {clause.clauseNumber}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-950">{clause.title}</h4>
                  {clause.isMandatory && (
                    <span className="text-[10px] font-mono text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2">
                      MANDATORY
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs space-y-1.5">
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-800">RFP Spec: </span>
                    {clause.rfpRequirement}
                  </p>
                  <p className="text-slate-800 bg-slate-50 p-2 border border-slate-100">
                    <span className="font-semibold text-slate-900">Bidder Response: </span>
                    {clause.proposedSolution}
                  </p>
                  {clause.deviationNote && (
                    <p className="text-amber-800 text-[11px] italic">
                      <span className="font-semibold">Deviation Note: </span>
                      {clause.deviationNote}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Switcher Toggle */}
              <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Set Status:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStatusChange(clause.id, 'compliant')}
                    className={`text-xs px-2 py-1 border transition-colors ${
                      clause.status === 'compliant'
                        ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Mark Compliant"
                  >
                    Compliant
                  </button>
                  <button
                    onClick={() => handleStatusChange(clause.id, 'partially_compliant')}
                    className={`text-xs px-2 py-1 border transition-colors ${
                      clause.status === 'partially_compliant'
                        ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Mark Partial / Deviation"
                  >
                    Partial
                  </button>
                  <button
                    onClick={() => handleStatusChange(clause.id, 'non_compliant')}
                    className={`text-xs px-2 py-1 border transition-colors ${
                      clause.status === 'non_compliant'
                        ? 'bg-rose-700 text-white border-rose-700 font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Mark Non-Compliant"
                  >
                    Non-Comp
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
