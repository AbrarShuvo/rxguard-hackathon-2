"use client";

import { Check, Loader2, ScanLine, Pill, FlaskConical, ShieldCheck, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";

const STEPS = [
  { label: "Reading documents", sub: "Scanning handwriting & lab tables", icon: ScanLine },
  { label: "Extracting medicines", sub: "Doses, frequencies & instructions", icon: Pill },
  { label: "Checking interactions", sub: "Cross-checking every drug vs every lab", icon: FlaskConical },
  { label: "Building your plan", sub: "Daily schedule, alerts & questions", icon: CalendarDays },
];

export default function LoadingAnalysis() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p < STEPS.length - 1 ? p + 1 : p)), 2200);
    return () => clearInterval(id);
  }, []);

  const progress = Math.round(((active + 0.6) / STEPS.length) * 100);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center py-10 gap-7 animate-fade-in" role="status" aria-live="polite">
      {/* Animated scanner orb */}
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-emerald-400/20 blur-xl animate-blob" aria-hidden />
        <div className="relative w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30 animate-float overflow-hidden">
          <ShieldCheck className="w-10 h-10" />
          <span className="absolute left-2 right-2 h-0.5 rounded bg-white/70 blur-[1px] animate-[scanLine_2.2s_ease-in-out_infinite] motion-reduce:animate-none" aria-hidden />
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-emerald-100">
          <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin motion-reduce:animate-none" aria-hidden />
        </span>
      </div>

      <div className="text-center space-y-1.5">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-gray-900">Analyzing your documents</h2>
        <p className="text-sm text-gray-500">Vision AI is reading your prescription and lab report together — nothing is stored.</p>
      </div>

      {/* Progress chips — Upload → Parse → Verdict */}
      <div className="flex items-center gap-1.5" aria-hidden>
        {[
          { label: "Upload", state: "done" as const },
          { label: "Parse", state: active >= 2 ? ("done" as const) : ("current" as const) },
          { label: "Verdict", state: active >= 3 ? ("current" as const) : ("todo" as const) },
        ].map((chip, i) => (
          <span key={chip.label} className="flex items-center gap-1.5">
            <span className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wide ${chip.state === "done" ? "bg-emerald-600 text-white" : chip.state === "current" ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300" : "bg-gray-100 text-gray-400"}`}>
              {chip.state === "done" ? "✓ " : ""}{chip.label}
            </span>
            {i < 2 && <span className="text-gray-300">→</span>}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-2">
          <span>{STEPS[active]?.label}…</span>
          <span className="tabular-nums text-emerald-700">{progress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Staged steps */}
      <ol className="w-full space-y-2">
        {STEPS.map((step, i) => {
          const done = i < active;
          const current = i === active;
          const Icon = step.icon;
          return (
            <li
              key={step.label}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ${
                current
                  ? "border-emerald-300 bg-emerald-50/70 shadow-sm shadow-emerald-600/10 scale-[1.01]"
                  : done
                  ? "border-gray-100 bg-white/70"
                  : "border-gray-100 bg-white/40 opacity-60"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                  done
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : current
                    ? "bg-white border-emerald-400 text-emerald-600 shadow-sm"
                    : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                {done ? (
                  <Check className="w-4.5 h-4.5 animate-check-pop" aria-hidden />
                ) : current ? (
                  <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden />
                ) : (
                  <Icon className="w-4 h-4" aria-hidden />
                )}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-semibold ${done || current ? "text-gray-900" : "text-gray-500"}`}>{step.label}</span>
                <span className="block truncate text-xs text-gray-500">{step.sub}</span>
              </span>
              {current && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-700 animate-soft-pulse">Working</span>}
              {done && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-600">Done</span>}
            </li>
          );
        })}
      </ol>

      {/* Skeleton preview of the dashboard to come — scan line sweeps it */}
      <div className="w-full space-y-2" aria-hidden>
        <div className="scan-sweep h-16 rounded-2xl border border-gray-100 bg-white/70 p-3">
          <div className="h-3 w-2/3 rounded-full animate-shimmer" />
          <div className="mt-2.5 h-3 w-1/2 rounded-full animate-shimmer" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-xl border border-gray-100 bg-white/60 p-2">
              <div className="h-2.5 w-3/4 rounded-full animate-shimmer" />
              <div className="mt-2 h-2.5 w-1/2 rounded-full animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
