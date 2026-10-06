import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Calculator, 
  TrendingUp, 
  Percent, 
  DollarSign, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { BOQItem, Language, TenderProposal } from '../types/tender';
import { calculateBOQSummary } from '../utils/tenderAuditor';

interface BOQTableProps {
  tender: TenderProposal;
  lang: Language;
  onUpdateBOQ: (newItems: BOQItem[]) => void;
}

export const BOQTable: React.FC<BOQTableProps> = ({
  tender,
  lang,
  onUpdateBOQ,
}) => {
  const [newItem, setNewItem] = useState<Partial<BOQItem>>({
    itemCode: '',
    description: '',
    category: 'Hardware',
    unit: 'Units',
    quantity: 1,
    unitCost: 100000,
    vatPercent: 7.5,
    overheadPercent: 5.0,
    marginPercent: 15.0,
  });

  const [isAdding, setIsAdding] = useState(false);
  const boqSummary = calculateBOQSummary(tender);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.description || !newItem.itemCode) return;

    const created: BOQItem = {
      id: `boq-${Date.now()}`,
      itemCode: newItem.itemCode || 'ITM-00',
      description: newItem.description || '',
      category: (newItem.category as any) || 'Hardware',
      unit: newItem.unit || 'Units',
      quantity: Number(newItem.quantity) || 1,
      unitCost: Number(newItem.unitCost) || 0,
      vatPercent: Number(newItem.vatPercent) || 7.5,
      overheadPercent: Number(newItem.overheadPercent) || 5.0,
      marginPercent: Number(newItem.marginPercent) || 15.0,
    };

    onUpdateBOQ([...tender.boqItems, created]);
    setNewItem({
      itemCode: '',
      description: '',
      category: 'Hardware',
      unit: 'Units',
      quantity: 1,
      unitCost: 100000,
      vatPercent: 7.5,
      overheadPercent: 5.0,
      marginPercent: 15.0,
    });
    setIsAdding(false);
  };

  const handleRemoveItem = (id: string) => {
    onUpdateBOQ(tender.boqItems.filter((item) => item.id !== id));
  };

  const handleUpdateItemField = (id: string, field: keyof BOQItem, value: any) => {
    const updated = tender.boqItems.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onUpdateBOQ(updated);
  };

  const exportCSV = () => {
    const headers = ['Item Code', 'Description', 'Category', 'Unit', 'Qty', 'Unit Cost', 'Base Amount', 'VAT %', 'Overhead %', 'Margin %', 'Subtotal'];
    const rows = tender.boqItems.map((item) => {
      const base = item.quantity * item.unitCost;
      const sub = base * (1 + (item.overheadPercent + item.vatPercent + item.marginPercent) / 100);
      return [
        `"${item.itemCode}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        item.category,
        item.unit,
        item.quantity,
        item.unitCost,
        base,
        item.vatPercent,
        item.overheadPercent,
        item.marginPercent,
        sub.toFixed(2),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BOQ_${tender.referenceNumber}_financials.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Base Cost */}
        <div className="bg-white p-4 border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            {lang === 'bn' ? 'মূল খরচ (ভিত্তি)' : 'Base Subtotal'}
          </span>
          <div className="mt-1 text-xl font-bold font-mono text-slate-900">
            {tender.currency} {boqSummary.baseCost.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {tender.boqItems.length} {lang === 'bn' ? 'টি আইটেম মোট' : 'line items total'}
          </span>
        </div>

        {/* Taxes & Overheads */}
        <div className="bg-white p-4 border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            {lang === 'bn' ? 'ভ্যাট ও প্রশাসনিক ব্যয়' : 'VAT & Overheads'}
          </span>
          <div className="mt-1 text-xl font-bold font-mono text-slate-900">
            {tender.currency} {(boqSummary.totalOverhead + boqSummary.totalVat).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between mt-1">
            <span>VAT: {tender.currency} {boqSummary.totalVat.toLocaleString()}</span>
            <span>Overhead: {tender.currency} {boqSummary.totalOverhead.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Margin */}
        <div className="bg-white p-4 border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            {lang === 'bn' ? 'প্রত্যাশিত মোট মুনাফা' : 'Total Profit Margin'}
          </span>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-700">
            {tender.currency} {boqSummary.totalMargin.toLocaleString()}
          </div>
          <span className={`text-[11px] font-medium block mt-1 ${boqSummary.blendedMarginPercent < 8 ? 'text-amber-600' : 'text-emerald-700'}`}>
            {lang === 'bn' ? 'গড় মার্জিন: ' : 'Blended margin: '} {boqSummary.blendedMarginPercent.toFixed(1)}%
          </span>
        </div>

        {/* Final Tender Bid Price */}
        <div className={`p-4 border ${boqSummary.isOverBudget ? 'bg-rose-50 border-rose-300' : 'bg-slate-900 text-white border-slate-900'}`}>
          <span className={`text-[11px] font-mono uppercase tracking-wider ${boqSummary.isOverBudget ? 'text-rose-700' : 'text-slate-400'}`}>
            {lang === 'bn' ? 'চূড়ান্ত দরপত্র মূল্য' : 'Grand Tender Bid Value'}
          </span>
          <div className={`mt-1 text-2xl font-extrabold font-mono ${boqSummary.isOverBudget ? 'text-rose-900' : 'text-amber-400'}`}>
            {tender.currency} {boqSummary.totalBidPrice.toLocaleString()}
          </div>
          <div className={`text-[11px] mt-1 flex justify-between ${boqSummary.isOverBudget ? 'text-rose-700 font-semibold' : 'text-slate-400'}`}>
            <span>{lang === 'bn' ? 'বাজেট সীমা: ' : 'Ceiling: '} {tender.currency} {tender.estimatedBudgetCeiling.toLocaleString()}</span>
            <span>{boqSummary.budgetVariancePercent > 0 ? `+${boqSummary.budgetVariancePercent.toFixed(1)}%` : `${boqSummary.budgetVariancePercent.toFixed(1)}%`}</span>
          </div>
        </div>
      </div>

      {boqSummary.isOverBudget && (
        <div className="p-3 bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            {lang === 'bn' 
              ? 'সতর্কতা: দরপত্রের বর্তমান মূল্য অনুমোদিত সরকারি বাজেট সীমা অতিক্রম করেছে। এটি অডিট পরীক্ষায় বাতিল হওয়ার ঝুঁকি তৈরি করবে।'
              : 'Warning: Current bid price exceeds client authorized budget allocation. This creates disqualification risk during evaluation.'}
          </span>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-950">
            {lang === 'bn' ? 'বিল অব কোয়ান্টিটিজ (বিওকিউ) স্পেসিফিকেশন' : 'Bill of Quantities (BOQ) Schedule'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">[{tender.boqItems.length} lines]</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-300 py-1.5 px-3 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সিএসভি এক্সপোর্ট' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-1.5 px-3 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'নতুন আইটেম যোগ করুন' : 'Add Line Item'}</span>
          </button>
        </div>
      </div>

      {/* Add New Line Item Form Drawer */}
      {isAdding && (
        <form onSubmit={handleAddItem} className="bg-slate-50 p-4 border border-slate-300 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              {lang === 'bn' ? 'নতুন বিওকিউ আইটেম এন্ট্রি' : 'New BOQ Line Entry'}
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'আইটেম কোড' : 'Item Code'}</label>
              <input
                type="text"
                required
                value={newItem.itemCode}
                onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
                placeholder="e.g. HW-SRV-07"
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'বিবরণ ও স্পেক' : 'Description & Specification'}</label>
              <input
                type="text"
                required
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Enterprise specification details..."
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Labor">Labor</option>
                <option value="Services">Services</option>
                <option value="Logistics">Logistics</option>
                <option value="Contingency">Contingency</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'একক (Unit)' : 'Unit'}</label>
              <input
                type="text"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'পরিমাণ (Qty)' : 'Quantity'}</label>
              <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">{lang === 'bn' ? 'একক মূল্য (Unit Cost)' : 'Unit Cost'}</label>
              <input
                type="number"
                min="0"
                value={newItem.unitCost}
                onChange={(e) => setNewItem({ ...newItem, unitCost: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">VAT (%)</label>
              <input
                type="number"
                step="0.5"
                value={newItem.vatPercent}
                onChange={(e) => setNewItem({ ...newItem, vatPercent: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Overhead (%)</label>
              <input
                type="number"
                step="0.5"
                value={newItem.overheadPercent}
                onChange={(e) => setNewItem({ ...newItem, overheadPercent: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Margin (%)</label>
              <input
                type="number"
                step="0.5"
                value={newItem.marginPercent}
                onChange={(e) => setNewItem({ ...newItem, marginPercent: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 px-2.5 py-1.5 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-1.5 px-4"
            >
              {lang === 'bn' ? 'আইটেম সংরক্ষণ করুন' : 'Save Line Item'}
            </button>
          </div>
        </form>
      )}

      {/* Primary BOQ Interactive Table */}
      <div className="border border-slate-200 overflow-x-auto bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3 font-mono text-[11px]">Code</th>
              <th className="py-2.5 px-3 min-w-[220px]">Description</th>
              <th className="py-2.5 px-2">Cat</th>
              <th className="py-2.5 px-2 text-right">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Cost</th>
              <th className="py-2.5 px-3 text-right">Base Sub</th>
              <th className="py-2.5 px-2 text-right">VAT%</th>
              <th className="py-2.5 px-2 text-right">OVH%</th>
              <th className="py-2.5 px-2 text-right">Margin%</th>
              <th className="py-2.5 px-3 text-right font-semibold">Total Price</th>
              <th className="py-2.5 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tender.boqItems.map((item) => {
              const base = item.quantity * item.unitCost;
              const ovh = base * (item.overheadPercent / 100);
              const subtotal = base + ovh;
              const vat = subtotal * (item.vatPercent / 100);
              const margin = subtotal * (item.marginPercent / 100);
              const totalLine = subtotal + vat + margin;

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                    {item.itemCode}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-medium">
                    {item.description}
                  </td>
                  <td className="py-2.5 px-2 text-slate-600">
                    <span className="text-[11px] font-mono text-slate-500 uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-800">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                    {tender.currency} {item.unitCost.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {tender.currency} {base.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                    <input
                      type="number"
                      aria-label="VAT percent"
                      value={item.vatPercent}
                      onChange={(e) => handleUpdateItemField(item.id, 'vatPercent', Number(e.target.value))}
                      className="w-12 text-right bg-slate-50 border border-slate-200 px-1 py-0.5 font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                    <input
                      type="number"
                      aria-label="Overhead percent"
                      value={item.overheadPercent}
                      onChange={(e) => handleUpdateItemField(item.id, 'overheadPercent', Number(e.target.value))}
                      className="w-12 text-right bg-slate-50 border border-slate-200 px-1 py-0.5 font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                    <input
                      type="number"
                      aria-label="Margin percent"
                      value={item.marginPercent}
                      onChange={(e) => handleUpdateItemField(item.id, 'marginPercent', Number(e.target.value))}
                      className="w-12 text-right bg-slate-50 border border-slate-200 px-1 py-0.5 font-mono text-emerald-700 font-semibold"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                    {tender.currency} {Math.round(totalLine).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
