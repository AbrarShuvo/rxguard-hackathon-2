"use client";

import { AlertTriangle, Pill, ArrowRight } from "lucide-react";

interface SampleCaseButtonsProps {
  onSelect: (caseId: "A" | "B") => void;
  disabled: boolean;
}

/*
 * Deliberately quiet: the upload is the star now. Sample cases are a
 * single small row — two slim buttons, no big cards, no competing
 * colours — so a first-time visitor never wonders where to start.
 */
export default function SampleCaseButtons({
  onSelect,
  disabled,
}: SampleCaseButtonsProps) {
  return (
    <div className="w-full pt-1">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-semibold text-[#7A938A]">No files handy?</span>
        <button
          onClick={() => onSelect("A")}
          disabled={disabled}
          className="group inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#A44A3A]/25 bg-[#F6E9E4]/70 px-3.5 py-2 text-xs font-bold text-[#8C3B2E] transition-all hover:bg-[#F6E9E4] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          Try Case A — critical kidney risk
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
        <button
          onClick={() => onSelect("B")}
          disabled={disabled}
          className="group inline-flex min-h-10 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/70 px-3.5 py-2 text-xs font-bold text-amber-700 transition-all hover:bg-amber-50 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pill className="h-3.5 w-3.5" aria-hidden />
          Try Case B — routine check
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
