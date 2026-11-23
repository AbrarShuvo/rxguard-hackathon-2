"use client";

import { AlertTriangle, Pill } from "lucide-react";

interface SampleCaseButtonsProps {
  onSelect: (caseId: "A" | "B") => void;
  disabled: boolean;
}

export default function SampleCaseButtons({
  onSelect,
  disabled,
}: SampleCaseButtonsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          or try a sample case
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Case A: Critical Renal-NSAID Conflict */}
        <button
          onClick={() => onSelect("A")}
          disabled={disabled}
          className="sample-card sample-card--red group flex items-start gap-3 p-3.5 rounded-xl border-2 border-red-200 bg-red-50/50 hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-left min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="shrink-0 w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
            <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">
              Case A: Renal-NSAID Conflict
            </p>
            <p className="text-xs text-red-600/80 mt-0.5 leading-relaxed">
              Elevated Creatinine + Ibuprofen prescription. Catches a critical
              kidney safety risk.
            </p>
          </div>
        </button>

        {/* Case B: Routine Multi-Medication */}
        <button
          onClick={() => onSelect("B")}
          disabled={disabled}
          className="sample-card sample-card--blue group flex items-start gap-3 p-3.5 rounded-xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-left min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Pill className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">
              Case B: Routine Multi-Med Panel
            </p>
            <p className="text-xs text-blue-600/80 mt-0.5 leading-relaxed">
              4 common medications + blood panel. Demonstrates routine analysis
              with mild warnings.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
