"use client";

import { Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const STEPS = ["Reading documents", "Extracting medicines", "Checking interactions", "Building schedule"];

export default function LoadingAnalysis() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p < STEPS.length - 1 ? p + 1 : p)), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6 animate-fade-in" role="status" aria-live="polite">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin motion-reduce:animate-none" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800">Analyzing Your Documents</h2>
      <ol className="space-y-2.5 w-full max-w-xs">
        {STEPS.map((label, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={label} className={`flex items-center gap-3 text-sm ${done || current ? "text-gray-800" : "text-gray-400"}`}>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                  done ? "bg-emerald-600 border-emerald-600 text-white" : current ? "border-emerald-500 text-emerald-600" : "border-gray-300"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" aria-hidden /> : current ? <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
              </span>
              <span className={current ? "font-semibold" : ""}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
