"use client";

import { MessageSquareCheck, Copy, Check } from "lucide-react";
import { useState } from "react";

interface DoctorQuestionsProps {
  questions: string[];
}

export default function DoctorQuestions({ questions }: DoctorQuestionsProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 card-surface space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>🩺</span> Doctor Follow-Up Questions
        </h2>
        <span className="text-[11px] text-gray-400 font-medium">
          Ready to ask your physician
        </span>
      </div>

      <p className="text-xs text-gray-500">
        Based on your extracted markers and medications, here are priority questions to ask at your next appointment:
      </p>

      <div className="space-y-2 pt-1">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 px-3 py-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-emerald-50/30 hover:border-emerald-200 transition-colors group"
          >
            <div className="flex flex-1 min-w-0 items-center gap-2.5">
              <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                {idx + 1}
              </span>
              <p className="text-xs text-gray-800 leading-relaxed font-medium">
                {q}
              </p>
            </div>

            <button
              onClick={() => handleCopy(q, idx)}
              title="Copy question"
              aria-label="Copy question"
              className="print-hide shrink-0 -my-3 -mr-1 min-h-11 min-w-11 flex items-center justify-center rounded-md text-gray-700 hover:text-emerald-700 hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {copiedIdx === idx ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-90 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
