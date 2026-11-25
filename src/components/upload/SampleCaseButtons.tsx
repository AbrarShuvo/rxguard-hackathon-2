"use client";

import { AlertTriangle, Pill, ArrowRight, Clock3, FlaskConical } from "lucide-react";

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
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-gray-300" />
        <span className="eyebrow text-gray-400">
          No files handy? Try a sample case
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-300 to-gray-300" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Case A: Critical Renal-NSAID Conflict */}
        <button
          onClick={() => onSelect("A")}
          disabled={disabled}
          className="sample-card sample-card--red group relative overflow-hidden flex flex-col gap-2.5 p-4 rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50/80 to-white hover:bg-red-50 text-left min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm shadow-red-600/40">
            <AlertTriangle className="h-3 w-3" /> Critical
          </span>
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="font-display text-[15px] font-extrabold text-red-900 leading-tight pr-16">
              Case A: Renal-NSAID Conflict
            </p>
          </div>
          <p className="text-xs text-red-800/80 leading-relaxed">
            Elevated creatinine + Ibuprofen prescription. Watch RxGuard catch a critical kidney safety risk.
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-700"><Pill className="h-3 w-3" /> Ibuprofen 400mg</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-700"><FlaskConical className="h-3 w-3" /> Creatinine 1.8</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-700"><Clock3 className="h-3 w-3" /> 90 sec demo</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 mt-0.5">
            Run this case <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </button>

        {/* Case B: Routine Multi-Medication */}
        <button
          onClick={() => onSelect("B")}
          disabled={disabled}
          className="sample-card sample-card--blue group relative overflow-hidden flex flex-col gap-2.5 p-4 rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/80 to-white hover:bg-blue-50 text-left min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm shadow-blue-600/40">
            <Pill className="h-3 w-3" /> Routine
          </span>
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 group-hover:rotate-6 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <p className="font-display text-[15px] font-extrabold text-blue-900 leading-tight pr-16">
              Case B: Routine Multi-Med Panel
            </p>
          </div>
          <p className="text-xs text-blue-800/80 leading-relaxed">
            4 common medications + blood panel. See a calm, routine analysis with mild warnings and a weekly dose.
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700"><Pill className="h-3 w-3" /> 4 medications</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700"><FlaskConical className="h-3 w-3" /> Lipid panel</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700"><Clock3 className="h-3 w-3" /> 90 sec demo</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 mt-0.5">
            Run this case <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      </div>
    </div>
  );
}
