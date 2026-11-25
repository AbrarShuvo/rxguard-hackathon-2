"use client";

import { Copy, Check, ClipboardCopy, MessageSquareText } from "lucide-react";
import { useState } from "react";

interface DoctorQuestionsProps {
  questions: string[];
}

export default function DoctorQuestions({ questions }: DoctorQuestionsProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(questions.map((q, i) => `${i + 1}. ${q}`).join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="dash-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#0B5F51]/10">
        <h2 className="font-display text-lg font-bold text-[#0B1F1B] flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F2E9] text-[#3D5A50]" aria-hidden>
            <MessageSquareText className="h-4.5 w-4.5" />
          </span>
          Questions for your doctor
        </h2>
        <button
          onClick={handleCopyAll}
          className="print-hide inline-flex items-center gap-1.5 rounded-full border border-[#0B5F51]/15 bg-[#F4FBF6] px-3 py-1.5 text-[11px] font-semibold text-[#3D5A50] hover:border-[#0B5F51]/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {copiedAll ? <><Check className="h-3.5 w-3.5 text-emerald-600" /> Copied all</> : <><ClipboardCopy className="h-3.5 w-3.5" /> Copy all</>}
        </button>
      </div>

      <p className="text-xs text-[#5A7268] mt-4">
        Take these to your next visit — they come from your own medicines and lab results.
      </p>

      <div className="pt-2">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between gap-3 py-3.5 ${idx > 0 ? "border-t border-[#0B5F51]/10" : ""} ${copiedIdx === idx ? "bg-emerald-50/60 -mx-2 px-2 rounded-lg" : ""}`}
          >
            <div className="flex flex-1 min-w-0 items-center gap-3">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#E3F2E9] text-[#3D5A50] text-[11px] font-bold">
                {idx + 1}
              </span>
              <p className="text-sm text-[#2C4A42] leading-relaxed">
                {q}
              </p>
            </div>

            <button
              onClick={() => handleCopy(q, idx)}
              title="Copy question"
              aria-label="Copy question"
              className="print-hide shrink-0 min-h-9 min-w-9 flex items-center justify-center rounded-lg text-[#7A938A] hover:text-[#2C4A42] hover:bg-[#E3F2E9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {copiedIdx === idx ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
