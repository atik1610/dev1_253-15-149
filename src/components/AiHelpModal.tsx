import React, { useState } from 'react';
import { X, Sparkles, Bot, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Language, RequirementStatusResult, TenderHeader } from '../types/tenderPackage';

interface AiHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  tender: TenderHeader;
  statusResults: RequirementStatusResult[];
  lang: Language;
}

export const AiHelpModal: React.FC<AiHelpModalProps> = ({
  isOpen,
  onClose,
  tender,
  statusResults,
  lang,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAiAnalysis = async (customPrompt?: string) => {
    setLoading(true);
    setResponse(null);

    const keyToUse = apiKey.trim() || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

    try {
      if (!keyToUse) {
        // Fallback rule-based intelligent analysis if no key provided
        const blocking = statusResults.filter((s) => s.blocksPackage);
        const ok = statusResults.filter((s) => s.status === 'OK');
        const simulated = `**Tender Document Compliance Summary (Rule Engine Analysis):**

- **Tender ID:** ${tender.tender_id} (${tender.title})
- **Procuring Entity:** ${tender.procuring_entity}
- **Bidder:** ${tender.bidder}
- **Submission Deadline:** ${tender.submission_deadline}

**Status Assessment:**
- Total Requirements: ${statusResults.length}
- Verified & OK: ${ok.length}
- Blocking Deficits: ${blocking.length}

${blocking.length > 0 ? `**Actionable Recommendations:**\n` + blocking.map((b) => `1. **${b.requirement.title_en}:** Status is "${b.status}". ${b.statusMessageEn}`).join('\n') : `✅ **Perfect Submission Dossier:** All mandatory documents are satisfied with valid expiration dates.`}

*(Tip: Enter a Gemini API Key above to run live generative multimodal tender document audits!)*`;

        setTimeout(() => {
          setResponse(simulated);
          setLoading(false);
        }, 500);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: keyToUse });
      const promptText = customPrompt || prompt || `Analyze this tender submission package and find any procurement risks, missing documents, or deadline expiration issues:
Tender ID: ${tender.tender_id}
Title: ${tender.title}
Entity: ${tender.procuring_entity}
Deadline: ${tender.submission_deadline}

Documents:
${statusResults.map((s) => `- [Order ${s.requirement.order}] ${s.requirement.title_en}: Status=${s.status}, MatchedFile=${s.matchedFile?.name || 'None'}, Expiry=${s.expiryDate || 'N/A'}`).join('\n')}`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
      });

      setResponse(aiRes.text || 'Analysis completed with no remarks.');
    } catch (err: any) {
      setResponse(`AI request error: ${err?.message || 'Check API key or network connection.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl border border-slate-300 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">
              {lang === 'bn' ? 'এআই টেন্ডার অডিটর (Bonus AI Assistant)' : 'AI Tender Auditor & Assistant (Gemini API)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* API Key Input */}
          <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
            <label className="block text-slate-700 font-semibold">
              {lang === 'bn' ? 'জেমিনাই এপিআই কী (Optional API Key):' : 'Gemini API Key (Rulebook Section 5.5):'}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (Leave empty for built-in rule-based analysis)"
              className="w-full bg-white border border-slate-300 px-3 py-1.5 font-mono text-xs focus:outline-none"
            />
            <p className="text-[10px] text-slate-500">
              Your key remains client-side only in your browser.
            </p>
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleRunAiAnalysis('Perform a strict procurement audit for this tender and list any missing or expired documents.')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-1 font-medium transition-colors"
            >
              🔍 {lang === 'bn' ? 'কমপ্লায়েন্স অডিট চালান' : 'Run Full Compliance Audit'}
            </button>
            <button
              onClick={() => handleRunAiAnalysis('Verify expiry dates against the submission deadline and identify risk factors.')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-1 font-medium transition-colors"
            >
              📅 {lang === 'bn' ? 'মেয়াদ ও ডেডলাইন ঝুঁকি যাচাই' : 'Verify Expiry vs Deadline'}
            </button>
          </div>

          {/* Output Display */}
          {loading && (
            <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
              <span>Analyzing tender requirements and document matches...</span>
            </div>
          )}

          {response && !loading && (
            <div className="p-4 bg-slate-50 border border-slate-300 text-slate-800 space-y-2 whitespace-pre-line leading-relaxed">
              {response}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 text-xs"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
