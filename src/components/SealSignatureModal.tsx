import React, { useState } from 'react';
import { X, Stamp, Upload, Check, Trash2 } from 'lucide-react';
import { Language, SealConfig } from '../types/tenderPackage';

interface SealSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SealConfig;
  onChangeConfig: (newConfig: SealConfig) => void;
  lang: Language;
}

export const SealSignatureModal: React.FC<SealSignatureModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  lang,
}) => {
  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png')) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে একটি PNG ইমেজ আপলোড করুন।' : 'Please upload a PNG image for transparency.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const dataUrl = URL.createObjectURL(file);
      onChangeConfig({
        ...config,
        hasSeal: true,
        fileName: file.name,
        imageBytes: new Uint8Array(arrayBuffer),
        imageDataUrl: dataUrl,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemove = () => {
    onChangeConfig({
      ...config,
      hasSeal: false,
      fileName: undefined,
      imageBytes: undefined,
      imageDataUrl: undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg border border-slate-300 shadow-2xl flex flex-col">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Stamp className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">
              {lang === 'bn' ? 'অফিসিয়াল সিল ও স্বাক্ষর যুক্ত করুন' : 'Official Seal / Signature Placement'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              {lang === 'bn' ? 'PNG সিল বা স্বাক্ষর ইমেজ আপলোড করুন' : 'Upload Seal / Signature Image (PNG)'}
            </label>
            
            {config.hasSeal && config.imageDataUrl ? (
              <div className="p-3 bg-slate-50 border border-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={config.imageDataUrl} 
                    alt="Seal" 
                    className="w-12 h-12 object-contain bg-white border border-slate-200 p-1" 
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">{config.fileName}</span>
                    <span className="text-[11px] text-emerald-700">✓ PNG Ready for Embedding</span>
                  </div>
                </div>
                <button
                  onClick={handleRemove}
                  className="text-rose-600 hover:text-rose-800 p-1.5"
                  title="Remove Seal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50 cursor-pointer transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  {lang === 'bn' ? 'PNG ফাইল সিলেক্ট করুন' : 'Click to Browse PNG Image'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Transparent PNG recommended</span>
                <input
                  type="file"
                  accept="image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {config.hasSeal && (
            <>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {lang === 'bn' ? 'পৃষ্ঠা নির্ধারণ (Placement)' : 'Page Placement'}
                </label>
                <select
                  value={config.placement}
                  onChange={(e) => onChangeConfig({ ...config, placement: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900"
                >
                  <option value="all">{lang === 'bn' ? 'সব পৃষ্ঠায় (All Pages)' : 'All Pages'}</option>
                  <option value="cover">{lang === 'bn' ? 'শুধুমাত্র কভার পেজে (Cover Page Only)' : 'Cover Page Only'}</option>
                  <option value="last_page">{lang === 'bn' ? 'শেষ পৃষ্ঠায় (Last Page Only)' : 'Last Page Only'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {lang === 'bn' ? 'অবস্থান (Position)' : 'Position on Page'}
                </label>
                <select
                  value={config.position}
                  onChange={(e) => onChangeConfig({ ...config, position: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-slate-900"
                >
                  <option value="bottom-right">{lang === 'bn' ? 'নিচে-ডানে (Bottom-Right)' : 'Bottom-Right'}</option>
                  <option value="bottom-left">{lang === 'bn' ? 'নিচে-বামে (Bottom-Left)' : 'Bottom-Left'}</option>
                  <option value="bottom-center">{lang === 'bn' ? 'নিচে-মাঝখানে (Bottom-Center)' : 'Bottom-Center'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {lang === 'bn' ? `আকার স্কেল: ${(config.scale * 100).toFixed(0)}%` : `Size Scale: ${(config.scale * 100).toFixed(0)}%`}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={config.scale}
                  onChange={(e) => onChangeConfig({ ...config, scale: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2"
            >
              {lang === 'bn' ? 'সম্পন্ন' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
