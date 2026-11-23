"use client";

import { Activity, ArrowRight, ArrowDown } from "lucide-react";
import { SafetyAlert } from "@/types/analysis";
import { Language, TRANSLATIONS } from "@/lib/translations";
import { resolvePathway } from "@/lib/pathway";

interface ContraindicationPathwayProps {
  alerts: SafetyAlert[];
  lang?: Language;
}

const Arrow = ({ label }: { label?: string }) => (
  <div className="flex flex-row md:flex-col items-center justify-center gap-1.5 md:gap-0 text-slate-400">
    <ArrowRight className="hidden md:block w-4 h-4 text-red-400" aria-hidden />
    <ArrowDown className="md:hidden w-4 h-4 text-red-400" aria-hidden />
    {label && (
      <span className="text-[10px] text-slate-300 text-center font-mono leading-tight max-w-[8rem]">
        {label}
      </span>
    )}
  </div>
);

export default function ContraindicationPathway({ alerts, lang = "en" }: ContraindicationPathwayProps) {
  const items = alerts.filter((a) => a.severity === "CRITICAL" || a.severity === "WARNING");
  if (items.length === 0) return null;
  const t = TRANSLATIONS[lang];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm border border-slate-700 space-y-4 no-print">
      <div className="flex items-center gap-2.5 border-b border-slate-700/80 pb-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white">
            {t.pathwayTitle}
          </h3>
          <p className="text-[11px] text-slate-400">How each flagged medicine could lead to harm</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((alert, idx) => {
          const p = resolvePathway(alert, lang);
          const hasLab = !!alert.related_lab?.trim();
          const cols = hasLab
            ? "md:grid-cols-[1fr_auto_1fr_auto_1fr]"
            : "md:grid-cols-[1fr_auto_1fr]";

          return (
            <div key={idx} className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    alert.severity === "CRITICAL" ? "bg-red-500 text-white" : "bg-amber-500 text-slate-900"
                  }`}
                >
                  {alert.severity}
                </span>
                <span className="text-xs text-slate-400 font-mono">{alert.type}</span>
              </div>

              <div className={`grid grid-cols-1 ${cols} gap-2 items-stretch text-xs`}>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{t.pwMedicine}</span>
                  <p className="font-bold text-emerald-400 break-words">
                    {alert.related_medication || "Prescribed medicine"}
                  </p>
                </div>

                <Arrow label={p.mechanism} />

                {hasLab && (
                  <>
                    <div className="p-3 rounded-lg bg-slate-900 border border-red-900/50 text-center space-y-1">
                      <span className="text-[10px] text-red-400 uppercase font-mono">{t.pwLab}</span>
                      <p className="font-bold text-red-300 break-words tabular-nums">{alert.related_lab}</p>
                    </div>
                    <Arrow label={p.biomarkerEffect} />
                  </>
                )}

                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-center space-y-1">
                  <span className="text-[10px] text-red-300 uppercase font-mono">{t.pwOutcome}</span>
                  <p className="font-bold text-red-200 break-words">{p.outcome}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 bg-slate-900/70 p-2.5 rounded-lg border border-slate-700/60 leading-relaxed">
                <span className="font-bold text-red-400">Why: </span>
                {alert.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
