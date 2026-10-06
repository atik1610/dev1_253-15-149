import React, { useState } from 'react';
import { X, Plus, Sparkles, Building2, Calendar, DollarSign, FileSpreadsheet } from 'lucide-react';
import { Language, TenderProposal } from '../types/tender';

interface NewTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onCreateTender: (newTender: TenderProposal) => void;
}

export const NewTenderModal: React.FC<NewTenderModalProps> = ({
  isOpen,
  onClose,
  lang,
  onCreateTender,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    titleBn: '',
    referenceNumber: '',
    clientName: '',
    clientType: 'Government' as const,
    currency: 'BDT' as const,
    submissionDeadline: '2026-11-30T14:00',
    estimatedBudgetCeiling: 25000000,
    earnestMoneyAmount: 500000,
    executiveSummary: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.referenceNumber) return;

    const created: TenderProposal = {
      id: `tender-${Date.now()}`,
      title: formData.title,
      titleBn: formData.titleBn || formData.title,
      referenceNumber: formData.referenceNumber,
      clientName: formData.clientName || 'General Directorate',
      clientType: formData.clientType,
      currency: formData.currency,
      submissionDeadline: new Date(formData.submissionDeadline).toISOString(),
      estimatedBudgetCeiling: Number(formData.estimatedBudgetCeiling) || 20000000,
      status: 'draft',
      executiveSummary: formData.executiveSummary || 'Comprehensive turnkey proposal conforming to tender terms.',
      technicalScope: 'Technical solution architecture and deployment specifications.',
      earnestMoneyAmount: Number(formData.earnestMoneyAmount) || 500000,
      bankGuaranteeDetails: 'Bank Guarantee in preparation.',
      boqItems: [
        {
          id: `boq-${Date.now()}-1`,
          itemCode: 'PKG-01',
          description: 'Primary System Infrastructure & Software Licenses',
          category: 'Software',
          unit: 'Lot',
          quantity: 1,
          unitCost: Math.round(Number(formData.estimatedBudgetCeiling) * 0.55),
          vatPercent: 7.5,
          overheadPercent: 5.0,
          marginPercent: 14.0,
        },
        {
          id: `boq-${Date.now()}-2`,
          itemCode: 'SRV-02',
          description: 'Deployment Engineering, Testing & 1-Year Maintenance',
          category: 'Services',
          unit: 'Package',
          quantity: 1,
          unitCost: Math.round(Number(formData.estimatedBudgetCeiling) * 0.25),
          vatPercent: 5.0,
          overheadPercent: 5.0,
          marginPercent: 15.0,
        },
      ],
      complianceClauses: [
        {
          id: `cl-${Date.now()}-1`,
          clauseNumber: 'Sec 1.0',
          title: 'General Eligibility & Technical Standard',
          rfpRequirement: 'Bidder must possess active manufacturer authorization and valid tax compliance.',
          status: 'compliant',
          proposedSolution: 'All criteria satisfied with certified proofs attached.',
          isMandatory: true,
        },
      ],
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          title: 'Trade License & Legal Incorporation',
          titleBn: 'হালনাগাদ ট্রেড লাইসেন্স ও নিবন্ধন',
          category: 'Legal',
          isMandatory: true,
          status: 'verified',
          fileName: 'Trade_License_Current.pdf',
        },
        {
          id: `doc-${Date.now()}-2`,
          title: 'Tax Clearance Certificate (TIN/NBR)',
          titleBn: 'টিআইএন ও কর সনদ',
          category: 'Financial',
          isMandatory: true,
          status: 'verified',
          fileName: 'TIN_Tax_Clearance.pdf',
        },
        {
          id: `doc-${Date.now()}-3`,
          title: 'Tender Security Earnest Money Bank Guarantee',
          titleBn: 'দরপত্র জামানতের ব্যাংক গ্যারান্টি',
          category: 'Financial',
          isMandatory: true,
          status: 'missing',
          notes: 'Required for submission qualification.',
        },
      ],
      personnel: [
        {
          id: `p-${Date.now()}-1`,
          name: 'Lead Project Manager',
          role: 'Project Director (PMP)',
          yearsOfExp: 10,
          certifications: ['PMP', 'Scrum Master'],
          allocatedCommitment: '100% Dedicated',
        },
      ],
      milestones: [
        {
          id: `m-${Date.now()}-1`,
          title: 'Inception & Deployment Phase',
          durationWeeks: 8,
          deliverables: 'Deliverables verified and accepted',
          completionPercent: 0,
        },
      ],
      notes: 'Initial draft tender.',
    };

    onCreateTender(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl border border-slate-300 shadow-2xl flex flex-col">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">
              {lang === 'bn' ? 'নতুন দরপত্র প্রস্তাবনা তৈরি করুন' : 'Create New Tender Bid Proposal'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'bn' ? 'দরপত্রের শিরোনাম (English)' : 'Tender Title (English)'}
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Enterprise Cloud Infrastructure Package"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'bn' ? 'দরপত্র রেফারেন্স নম্বর' : 'Reference / Tender ID'}
              </label>
              <input
                type="text"
                required
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="e.g. ICTD-2026-PKG-09"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'bn' ? 'ক্লায়েন্ট বা ক্রয়কারী সংস্থা' : 'Procuring Entity / Client'}
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Ministry of ICT"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'bn' ? 'সংস্থার ধরণ' : 'Client Sector'}
              </label>
              <select
                value={formData.clientType}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900"
              >
                <option value="Government">Government (e-GP)</option>
                <option value="Autonomous">Autonomous / Utility</option>
                <option value="Corporate">Corporate / Bank</option>
                <option value="International">International</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'bn' ? 'মুদ্রা (Currency)' : 'Currency'}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 font-mono"
              >
                <option value="BDT">BDT (Bangladeshi Taka)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'bn' ? 'অনুমোদিত সর্বোচ্চ বাজেট সীমা' : 'Estimated Budget Ceiling'}
              </label>
              <input
                type="number"
                value={formData.estimatedBudgetCeiling}
                onChange={(e) => setFormData({ ...formData, estimatedBudgetCeiling: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'bn' ? 'দরপত্র জামানত / আর্নেস্ট মানি' : 'Earnest Money Deposit (BG)'}
              </label>
              <input
                type="number"
                value={formData.earnestMoneyAmount}
                onChange={(e) => setFormData({ ...formData, earnestMoneyAmount: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {lang === 'bn' ? 'দাখিলের সময়সীমা' : 'Submission Deadline'}
            </label>
            <input
              type="datetime-local"
              value={formData.submissionDeadline}
              onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {lang === 'bn' ? 'সারসংক্ষেপ (Executive Summary)' : 'Executive Summary'}
            </label>
            <textarea
              rows={2}
              value={formData.executiveSummary}
              onChange={(e) => setFormData({ ...formData, executiveSummary: e.target.value })}
              placeholder="High-level project scope..."
              className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2"
            >
              {lang === 'bn' ? 'দরপত্র তৈরি করুন' : 'Create Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
