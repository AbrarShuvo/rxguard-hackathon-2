"use client";

import { AlertTriangle, Pill, ShieldCheck, ArrowRight, FlaskConical, Clock3 } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

/* Sticky stacking case cards — Apple-style scrollytelling, pure CSS.
   Each card pins (position: sticky) and the next one rolls over it.
   All data comes from the existing sample cases only. The third card
   is NOT a new medical case: it shows what a clean check looks like,
   drawn from Case B's normal readings, labelled as such. */

const CARDS = [
  {
    id: "A" as const,
    tone: "red",
    stamp: "STOP",
    stampLabel: "Critical — do not take",
    title: "Case A · Renal–NSAID Conflict",
    line: "Ibuprofen 400mg prescribed while the kidneys are already stressed.",
    chips: ["Ibuprofen 400mg", "Creatinine 1.8 mg/dL · HIGH", "eGFR 52 · LOW"],
    verdict: "Ibuprofen × Creatinine 1.8 → acute kidney injury risk",
    action: "Hold Ibuprofen — ask your doctor first",
    icon: AlertTriangle,
  },
  {
    id: "B" as const,
    tone: "amber",
    stamp: "CHECK",
    stampLabel: "Warning — review the dose",
    title: "Case B · Routine Multi-Med Panel",
    line: "Four everyday medicines, one weekly dose that must never be taken daily.",
    chips: ["Vitamin D3 60,000 IU · weekly", "LDL 138 · HIGH", "HbA1c 6.8% · HIGH"],
    verdict: "Weekly Vitamin D3 taken daily → toxicity risk",
    action: "Pick one set day each week — Sunday morning",
    icon: Pill,
  },
  {
    id: "B" as const,
    tone: "green",
    stamp: "SAFE",
    stampLabel: "What a clean check looks like",
    title: "Clean check · from Case B's normal readings",
    line: "Not every check finds danger. These readings from Case B came back normal — and RxGuard says so plainly.",
    chips: ["Creatinine 0.9 · NORMAL", "HDL 48 · NORMAL", "No critical flags"],
    verdict: "Kidney function normal · no drug–lab conflict on these readings",
    action: "Keep the routine — recheck at your next visit",
    icon: ShieldCheck,
  },
];

const toneCls: Record<string, { card: string; stamp: string; chip: string; btn: string }> = {
  red: {
    card: "border-[#A44A3A]/25 bg-gradient-to-br from-[#F6E9E4] via-[#F4FBF6] to-[#F4FBF6]",
    stamp: "border-[#A44A3A] text-[#A44A3A]",
    chip: "border-[#A44A3A]/25 bg-[#F4FBF6]/70 text-[#8C3B2E]",
    btn: "bg-[#A44A3A] hover:bg-[#8C3B2E] text-white",
  },
  amber: {
    card: "border-amber-200 bg-gradient-to-br from-amber-50 via-[#F4FBF6] to-[#F4FBF6]",
    stamp: "border-amber-600 text-amber-600",
    chip: "border-amber-200 bg-[#F4FBF6] text-amber-700",
    btn: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  green: {
    card: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-[#F4FBF6] to-[#F4FBF6]",
    stamp: "border-emerald-600 text-emerald-600",
    chip: "border-emerald-200 bg-[#F4FBF6] text-emerald-700",
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
};

export default function CaseStack({ onSelect }: { onSelect: (caseId: "A" | "B") => void }) {
  return (
    <section aria-label="Sample cases, step by step" className="pt-4">
      <Reveal>
        <div className="text-center space-y-2 pb-6">
          <p className="eyebrow text-emerald-700">Three verdicts · one checker</p>
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-[#0B1F1B]">
            Scroll through the cases.
            <br />
            <span className="text-gradient-animated">Feel the verdict land.</span>
          </h2>
          <p className="text-sm text-[#5A7268] max-w-md mx-auto">
            Each card pins while the next one rolls over it. Tap any card to run that case live.
          </p>
        </div>
      </Reveal>

      <div className="stack-wrap space-y-4">
        {CARDS.map((c, i) => {
          const Icon = c.icon;
          const tone = toneCls[c.tone];
          return (
            <article
              key={`${c.title}-${i}`}
              className={`stack-card relative overflow-hidden rounded-3xl border-2 ${tone.card} p-5 sm:p-7 shadow-xl shadow-[#0B1F1B]/10`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B1F1B] text-white shadow-lg">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-[#7A938A]">
                      Case {i + 1} of 3
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-black text-[#0B1F1B] leading-tight">{c.title}</h3>
                  <p className="text-sm text-[#3D5A50] leading-relaxed max-w-lg">{c.line}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.chips.map((chip) => (
                      <span key={chip} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone.chip}`}>
                        <FlaskConical className="h-3 w-3" aria-hidden />
                        {chip}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-[#0B1F1B]">
                    <span className="text-[#7A938A] font-semibold">Verdict: </span>
                    {c.verdict}
                  </p>
                  <p className="text-sm text-[#3D5A50]">
                    <span className="font-bold text-[#0B1F1B]">Next step: </span>
                    {c.action}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={`pressable mt-1 inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 ${tone.btn}`}
                  >
                    Run this case live
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                {/* Verdict stamp — word + icon + colour, never colour alone */}
                <div className="shrink-0 sm:pt-2">
                  <div className={`stamp inline-flex flex-col items-center gap-1 rounded-2xl border-[3px] px-5 py-3 ${tone.stamp} bg-[#F4FBF6]/70`}>
                    <Icon className="h-6 w-6" aria-hidden />
                    <span className="text-2xl font-black tracking-widest">{c.stamp}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{c.stampLabel}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#7A938A]">
                    <Clock3 className="h-3 w-3" aria-hidden /> 90-second demo
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
