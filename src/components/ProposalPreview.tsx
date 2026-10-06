import React from 'react';
import { Printer, Download, CheckCircle2, Shield, FileText } from 'lucide-react';
import { Language, TenderProposal } from '../types/tender';
import { calculateBOQSummary, runTenderAudit } from '../utils/tenderAuditor';

interface ProposalPreviewProps {
  tender: TenderProposal;
  lang: Language;
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  tender,
  lang,
}) => {
  const boqSummary = calculateBOQSummary(tender);
  const audit = runTenderAudit(tender);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Print Action Banner */}
      <div className="bg-white p-4 border border-slate-200 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-semibold text-slate-900">
            {lang === 'bn' ? 'অফিসিয়াল দরপত্র প্রস্তাবনা প্রিভিউ ও প্রিন্ট লেআউট' : 'Official Tender Proposal Bid Document (Print Ready)'}
          </span>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-1.5 px-3.5 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'প্রিন্ট বা পিডিএফ সেভ করুন' : 'Print / Save as PDF'}</span>
        </button>
      </div>

      {/* Printable Formal Document Sheet */}
      <div className="bg-white border border-slate-300 p-8 sm:p-12 text-slate-900 space-y-8 max-w-4xl mx-auto shadow-sm printable-document">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div>
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
              FORM PG4-1: TECHNICAL & FINANCIAL PROPOSAL
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
              BID PROPOSAL SUBMISSION
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {tender.title}
            </p>
          </div>

          <div className="text-right text-xs font-mono space-y-1">
            <div><span className="text-slate-500">REF NO:</span> <span className="font-bold">{tender.referenceNumber}</span></div>
            <div><span className="text-slate-500">DATE:</span> {new Date().toLocaleDateString('en-GB')}</div>
            <div><span className="text-slate-500">CURRENCY:</span> {tender.currency}</div>
          </div>
        </div>

        {/* Entity / Addressee */}
        <div className="text-xs space-y-1 text-slate-700 bg-slate-50 p-4 border border-slate-200">
          <p className="font-bold text-slate-900 uppercase">To: The Procuring Entity / Tender Evaluation Committee</p>
          <p className="font-semibold">{tender.clientName}</p>
          <p>Government of Bangladesh / Public Sector Procurement Division</p>
          <p className="mt-2 text-slate-600">
            Subject: Official Bid Proposal and Technical Responsiveness Submission for Package <span className="font-mono font-semibold">{tender.referenceNumber}</span>.
          </p>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold tracking-tight text-slate-950 uppercase border-b border-slate-200 pb-1">
            1. Executive Summary & Statement of Understanding
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {tender.executiveSummary}
          </p>
        </div>

        {/* 2. Technical Scope & Architecture */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold tracking-tight text-slate-950 uppercase border-b border-slate-200 pb-1">
            2. Scope of Work & Technical Implementation Architecture
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {tender.technicalScope}
          </p>
        </div>

        {/* 3. Financial Schedule & Grand BOQ Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold tracking-tight text-slate-950 uppercase border-b border-slate-200 pb-1">
            3. Financial Bid Schedule & Summary of Quantities (BOQ)
          </h2>
          
          <table className="w-full text-left border-collapse text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-800">
                <th className="p-2 font-mono">Code</th>
                <th className="p-2">Description</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Unit Price</th>
                <th className="p-2 text-right">Total ({tender.currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tender.boqItems.map((item) => {
                const lineTotal = item.quantity * item.unitCost * (1 + (item.overheadPercent + item.vatPercent + item.marginPercent) / 100);
                return (
                  <tr key={item.id}>
                    <td className="p-2 font-mono text-slate-700">{item.itemCode}</td>
                    <td className="p-2 font-medium text-slate-900">{item.description}</td>
                    <td className="p-2 text-right font-mono">{item.quantity} {item.unit}</td>
                    <td className="p-2 text-right font-mono">{item.unitCost.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono font-semibold">{Math.round(lineTotal).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-900 font-bold text-slate-950">
                <td colSpan={4} className="p-2.5 uppercase text-right">
                  Grand Total Inclusive of VAT, AIT & Overhead:
                </td>
                <td className="p-2.5 text-right font-mono text-sm">
                  {tender.currency} {boqSummary.totalBidPrice.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 4. Earnest Money & Tender Security Declaration */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold tracking-tight text-slate-950 uppercase border-b border-slate-200 pb-1">
            4. Tender Security & Earnest Money Declaration
          </h2>
          <div className="bg-slate-50 p-3 border border-slate-200 text-xs text-slate-800 space-y-1">
            <p>
              <span className="font-semibold">Security Amount: </span>
              {tender.currency} {tender.earnestMoneyAmount.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Bank Guarantee Ref: </span>
              {tender.bankGuaranteeDetails}
            </p>
            <p className="text-slate-600 italic">
              Original irrevocable and unconditional bank guarantee attached in separate sealed volume as stipulated in tender conditions.
            </p>
          </div>
        </div>

        {/* 5. Key Personnel & Lead Architects */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold tracking-tight text-slate-950 uppercase border-b border-slate-200 pb-1">
            5. Key Technical Personnel Roster
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {tender.personnel.map((p) => (
              <div key={p.id} className="p-2 border border-slate-200 bg-slate-50">
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className="text-slate-700">{p.role} · {p.yearsOfExp} Yrs Exp</p>
                <p className="text-slate-500 font-mono text-[11px]">{p.certifications.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures & Seal Block */}
        <div className="pt-12 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="border-b border-slate-400 w-48 h-12 mb-2 flex items-end">
              <span className="font-mono text-[11px] text-slate-400">[Digital Seal Verified]</span>
            </div>
            <p className="font-bold text-slate-900">Authorized Bidder Representative</p>
            <p className="text-slate-600">Managing Director / Lead Partner</p>
            <p className="text-slate-500 font-mono mt-1">NID & TIN Certified</p>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="border-b border-slate-400 w-48 h-12 mb-2 flex items-end justify-end">
              <span className="font-mono text-[11px] text-slate-400">[Corporate Seal]</span>
            </div>
            <p className="font-bold text-slate-900">Enterprise Bid Response Secretariat</p>
            <p className="text-slate-600">Commercial & Legal Division</p>
            <p className="text-slate-500 font-mono mt-1">PPR-2008 Standard Format</p>
          </div>
        </div>
      </div>
    </div>
  );
};
