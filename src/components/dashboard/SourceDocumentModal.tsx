"use client";

import { useEffect, useRef } from "react";
import { X, FileText } from "lucide-react";

interface SourceDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseType: "A" | "B";
}

export default function SourceDocumentModal({
  isOpen,
  onClose,
  caseType,
}: SourceDocumentModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04120E]/60 backdrop-blur-sm animate-fade-in no-print"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-doc-title"
        onClick={(e) => e.stopPropagation()}
        className="glass-panel relative w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-pop-in">
        {/* Header */}
        <div className="glass-inner flex items-center justify-between px-6 py-4 border-b border-[#0B5F51]/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 id="source-doc-title" className="text-base font-bold text-[#0B1F1B]">
                Source Document Inspection · {caseType === "A" ? "Case A (Renal-NSAID)" : "Case B (Routine Multi-Med)"}
              </h3>
              <p className="text-xs text-[#5A7268]">
                Compare original clinical documents against RxGuard's AI extraction
              </p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close document inspector"
            className="p-2.5 min-h-11 min-w-11 flex items-center justify-center rounded-lg text-[#5A7268] hover:text-[#2C4A42] hover:bg-[#CDE7D8]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Panels */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document 1: Prescription Slip */}
            <div className="border-2 border-dashed border-[#0B5F51]/25 rounded-xl p-5 bg-[#F6FCF8] shadow-inner font-serif relative">
              <div className="border-b border-[#0B5F51]/25 pb-3 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#0B1F1B] text-sm font-sans">
                      METRO HEALTH CLINIC &amp; SPECIALTY CARE
                    </h4>
                    <p className="text-[10px] text-[#5A7268] font-sans">
                      Dr. A. Sharma, MD (Internal Medicine) · Reg: #MH-88421
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#3D5A50] bg-[#E3F2E9]/55 backdrop-blur-sm px-2 py-0.5 rounded">
                    Rx #8902-B
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#3D5A50] font-sans mt-2">
                  <span>Patient: Anonymous (Age: 58 / M)</span>
                  <span>Date: 22-Nov-2026</span>
                </div>
              </div>

              <div className="text-xl font-bold font-serif text-emerald-900 mb-2">
                ℞
              </div>

              {caseType === "A" ? (
                <div className="space-y-3 font-mono text-xs text-[#12312A] leading-relaxed pl-3 border-l-2 border-emerald-400">
                  <div className="bg-[#F6E9E4]/70 p-2 rounded border border-[#A44A3A]/25">
                    <p className="font-bold text-[#7A3327]">1. Tab. Ibuprofen 400mg</p>
                    <p className="text-[11px] text-[#8C3B2E]">Sig: 1 - 0 - 1 PC × 5 days (Pain/Joints)</p>
                    <span className="text-[10px] bg-[#E5C9BE] text-[#7A3327] px-1 rounded font-sans font-bold">
                      ⚠ HIGH RISK FOR RENAL MARKERS
                    </span>
                  </div>
                  <div className="p-1.5">
                    <p className="font-bold">2. Tab. Metformin 500mg</p>
                    <p className="text-[11px] text-[#3D5A50]">Sig: 1 - 0 - 1 PC (After breakfast &amp; dinner)</p>
                  </div>
                  <div className="p-1.5">
                    <p className="font-bold">3. Tab. Atorvastatin 10mg</p>
                    <p className="text-[11px] text-[#3D5A50]">Sig: 0 - 0 - 1 HS (Bedtime)</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 font-mono text-xs text-[#12312A] leading-relaxed pl-3 border-l-2 border-emerald-400">
                  <div>
                    <p className="font-bold">1. Tab. Amlodipine 5mg</p>
                    <p className="text-[11px] text-[#3D5A50]">Sig: 1 - 0 - 0 AC (Before breakfast)</p>
                  </div>
                  <div>
                    <p className="font-bold">2. Tab. Pantoprazole 40mg</p>
                    <p className="text-[11px] text-[#3D5A50]">Sig: 1 - 0 - 0 AC (30 min before food)</p>
                  </div>
                  <div>
                    <p className="font-bold">3. Tab. Metformin 500mg</p>
                    <p className="text-[11px] text-[#3D5A50]">Sig: 0 - 0 - 1 PC (Post dinner)</p>
                  </div>
                  <div>
                    <p className="font-bold">4. Cap. Vitamin D3 60,000 IU</p>
                    <p className="text-[11px] text-blue-700 font-semibold">Sig: 1 cap ONCE WEEKLY with fatty meal</p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-3 border-t border-[#0B5F51]/15 flex justify-between items-end font-sans">
                <span className="text-[10px] text-[#7A938A]">Electronic Verification Valid</span>
                <div className="text-right">
                  <div className="font-serif italic text-sm text-[#2C4A42]">A. Sharma, M.D.</div>
                  <span className="text-[9px] text-[#7A938A]">Authorized Physician Stamp</span>
                </div>
              </div>
            </div>

            {/* Document 2: Pathology Diagnostic Lab Panel */}
            <div className="glass-inner border border-[#0B5F51]/15 rounded-xl p-5 font-sans">
              <div className="flex justify-between items-center border-b border-[#0B5F51]/15 pb-3 mb-3">
                <div>
                  <h4 className="font-bold text-[#0B1F1B] text-sm">
                    METROPOLIS PATHOLOGY &amp; LABS
                  </h4>
                  <p className="text-[10px] text-[#5A7268]">
                    NABL Accredited Diagnostics · Barcode: #LAB-40912-KFT
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50/70 backdrop-blur-sm text-emerald-700 border border-emerald-200">
                  Verified Lab Report
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#0B5F51]/15 text-[#5A7268] text-[10px] uppercase">
                      <th className="pb-1.5">Test Description</th>
                      <th className="pb-1.5">Result</th>
                      <th className="pb-1.5">Ref. Interval</th>
                      <th className="pb-1.5">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0B5F51]/10">
                    {caseType === "A" ? (
                      <>
                        <tr className="bg-[#F6E9E4]/70 font-semibold text-[#7A3327]">
                          <td className="py-1.5">Serum Creatinine</td>
                          <td className="py-1.5 font-bold">1.8 mg/dL</td>
                          <td className="py-1.5 text-[#3D5A50]">0.7 - 1.3</td>
                          <td className="py-1.5 text-[#A44A3A] font-bold">HIGH ⚠</td>
                        </tr>
                        <tr className="bg-[#F6E9E4]/50 font-semibold text-[#7A3327]">
                          <td className="py-1.5">eGFR (MDRD)</td>
                          <td className="py-1.5 font-bold">52 mL/min</td>
                          <td className="py-1.5 text-[#3D5A50]">90 - 120</td>
                          <td className="py-1.5 text-[#A44A3A] font-bold">LOW ⚠</td>
                        </tr>
                        <tr className="bg-amber-50/50 text-amber-900 font-medium">
                          <td className="py-1.5">Blood Urea Nitrogen (BUN)</td>
                          <td className="py-1.5 font-bold">28 mg/dL</td>
                          <td className="py-1.5 text-[#3D5A50]">7 - 20</td>
                          <td className="py-1.5 text-amber-600 font-bold">HIGH</td>
                        </tr>
                        <tr className="bg-amber-50/50 text-amber-900 font-medium">
                          <td className="py-1.5">Fasting Blood Sugar</td>
                          <td className="py-1.5 font-bold">142 mg/dL</td>
                          <td className="py-1.5 text-[#3D5A50]">70 - 100</td>
                          <td className="py-1.5 text-amber-600 font-bold">HIGH</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-[#2C4A42]">Hemoglobin (Hb)</td>
                          <td className="py-1.5 font-bold text-[#0B1F1B]">13.8 g/dL</td>
                          <td className="py-1.5 text-[#3D5A50]">13.0 - 17.0</td>
                          <td className="py-1.5 text-emerald-600 font-bold">NORMAL</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr className="bg-amber-50/50 text-amber-900 font-medium">
                          <td className="py-1.5">Total Cholesterol</td>
                          <td className="py-1.5 font-bold">215 mg/dL</td>
                          <td className="py-1.5 text-[#3D5A50]">&lt; 200</td>
                          <td className="py-1.5 text-amber-600 font-bold">HIGH</td>
                        </tr>
                        <tr className="bg-amber-50/50 text-amber-900 font-medium">
                          <td className="py-1.5">LDL Cholesterol</td>
                          <td className="py-1.5 font-bold">138 mg/dL</td>
                          <td className="py-1.5 text-[#3D5A50]">&lt; 100</td>
                          <td className="py-1.5 text-amber-600 font-bold">HIGH</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-[#2C4A42]">HDL Cholesterol</td>
                          <td className="py-1.5 font-bold text-[#0B1F1B]">48 mg/dL</td>
                          <td className="py-1.5 text-[#3D5A50]">&gt; 40</td>
                          <td className="py-1.5 text-emerald-600 font-bold">NORMAL</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-[#2C4A42]">Serum Creatinine</td>
                          <td className="py-1.5 font-bold text-[#0B1F1B]">0.9 mg/dL</td>
                          <td className="py-1.5 text-[#3D5A50]">0.7 - 1.3</td>
                          <td className="py-1.5 text-emerald-600 font-bold">NORMAL</td>
                        </tr>
                        <tr className="bg-amber-50/50 text-amber-900 font-medium">
                          <td className="py-1.5">HbA1c</td>
                          <td className="py-1.5 font-bold">6.8 %</td>
                          <td className="py-1.5 text-[#3D5A50]">&lt; 5.7</td>
                          <td className="py-1.5 text-amber-600 font-bold">HIGH</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-2.5 rounded-lg bg-[#EFFAF3] border border-[#0B5F51]/15 text-[11px] text-[#3D5A50]">
                🔍 <strong>RxGuard Extraction Accuracy:</strong> Biomarkers matched against reference ranges.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#0B5F51]/15 bg-[#EFFAF3] flex justify-end">
          <button
            onClick={onClose}
            type="button" className="px-4 min-h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Close Document Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
