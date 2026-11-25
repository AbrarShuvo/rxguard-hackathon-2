"use client";

import { ShieldAlert, ArrowRight, FlaskConical, Pill, Activity } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { SAMPLE_CASE_A } from "@/lib/sample-data";

/* Bento preview of the real Case A dashboard — static, clearly labelled
   as a preview of the sample case, with one button that runs it live. */

export default function DashboardPreview({ onRun }: { onRun: () => void }) {
  const r = SAMPLE_CASE_A;
  const critical = r.safety_alerts.filter((a) => a.severity === "CRITICAL").length;
  const warnings = r.safety_alerts.filter((a) => a.severity === "WARNING").length;
  const abnormal = r.lab_markers.filter((m) => m.status !== "NORMAL").length;

  return (
    <section aria-label="Dashboard preview" className="pt-2">
      <Reveal>
        <div className="text-center space-y-2 pb-6">
          <p className="eyebrow text-emerald-700">The verdict view</p>
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-[#0B1F1B]">
            This is what the answer looks like.
          </h2>
          <p className="text-sm text-[#5A7268] max-w-lg mx-auto">
            A triage queue, not a wall of text. The worst flag sits on top, with one clear action each.
            Preview of sample Case A — run it live to use it.
          </p>
        </div>
      </Reveal>

      <Reveal from="up">
        <div className="overflow-hidden rounded-3xl border border-[#0B5F51]/15 bg-[#F4FBF6]/80 shadow-2xl shadow-[#0B1F1B]/15">
          {/* Mini verdict bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[#8C3B2E] px-5 py-5 text-white">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F4FBF6]/15 ring-1 ring-white/30">
              <ShieldAlert className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#F6E9E4]">Preview · Case A verdict</p>
              <p className="font-display text-lg font-black leading-tight">STOP — Ibuprofen vs. your kidneys</p>
              <p className="text-xs text-[#F6E9E4]/90">Do NOT take Ibuprofen until you speak with your doctor.</p>
            </div>
            <div className="flex gap-2 text-center">
              {[
                { n: critical, l: "Critical" },
                { n: warnings, l: "Warning" },
                { n: abnormal, l: "Abnormal labs" },
                { n: r.medications.length, l: "Medicines" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-[#F4FBF6]/10 px-3 py-2 ring-1 ring-white/20">
                  <p className="text-lg font-black leading-none tabular-nums">{s.n}</p>
                  <p className="mt-1 text-[10px] font-semibold text-[#F6E9E4]">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bento rows */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5">
            <div className="rounded-2xl border border-[#A44A3A]/25 bg-[#F6E9E4]/70 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#8C3B2E]">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Triage · Critical
              </p>
              <p className="mt-2 text-sm font-bold leading-snug text-[#0B1F1B]">NSAID prescribed with impaired kidney function</p>
              <p className="mt-1 text-xs text-[#3D5A50]">Creatinine 1.8 · eGFR 52 — kidneys already stressed.</p>
            </div>
            <div className="rounded-2xl border border-[#0B5F51]/15 bg-[#EFFAF3]/70 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#2C4A42]">
                <Activity className="h-3.5 w-3.5" aria-hidden /> Pathway
              </p>
              <p className="mt-2 text-sm font-bold leading-snug text-[#0B1F1B]">Ibuprofen → less kidney blood flow → acute kidney injury</p>
              <p className="mt-1 text-xs text-[#3D5A50]">Drug → lab → harm, traced step by step.</p>
            </div>
            <div className="rounded-2xl border border-[#0B5F51]/15 bg-[#EFFAF3]/70 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#2C4A42]">
                <Pill className="h-3.5 w-3.5" aria-hidden /> Today&apos;s plan
              </p>
              <p className="mt-2 text-sm font-bold leading-snug text-[#0B1F1B]">Ibuprofen on HOLD · Metformin + Atorvastatin as planned</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-[#3D5A50]">
                <FlaskConical className="h-3 w-3" aria-hidden /> 4 of 5 labs out of range
              </p>
            </div>
          </div>

          <div className="border-t border-[#0B5F51]/10 px-4 sm:px-5 py-4">
            <button
              type="button"
              onClick={onRun}
              className="btn-primary pressable group inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white"
            >
              Run Case A live — see the full dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
