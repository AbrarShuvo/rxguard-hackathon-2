"use client";

import { AlertTriangle, Pill, ArrowRight } from "lucide-react";

interface SampleCaseButtonsProps {
  onSelect: (caseId: "A" | "B") => void;
  disabled: boolean;
}

/*
 * ROUND 12 — punchy, not quiet: the sample cases are real
 * buttons now, in the same CTA button language as the rest of
 * the site (btn-danger for the critical Case A, btn-amber for
 * the routine Case B). Bigger, bolder, with a coloured icon
 * tile and a sliding arrow — they invite a tap instead of
 * whispering underneath the upload.
 */
export default function SampleCaseButtons({
  onSelect,
  disabled,
}: SampleCaseButtonsProps) {
  return (
    <div className="w-full pt-2">
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#7A938A]">
          No files handy?
        </span>
        <button
          type="button"
          onClick={() => onSelect("A")}
          disabled={disabled}
          className="btn-danger group inline-flex min-h-12 items-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold text-white shadow-xl"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
            <AlertTriangle className="h-4 w-4" aria-hidden />
          </span>
          Try Case A — critical kidney risk
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onSelect("B")}
          disabled={disabled}
          className="btn-amber group inline-flex min-h-12 items-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold text-white shadow-xl"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
            <Pill className="h-4 w-4" aria-hidden />
          </span>
          Try Case B — routine check
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </button>
      </div>
    </div>
  );
}
