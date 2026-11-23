"use client";

import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";
import { Language, TRANSLATIONS } from "@/lib/translations";

interface PatientSummaryProps {
  result: AnalysisResult;
  lang?: Language;
}

const riskConfig = {
  CRITICAL: {
    wrap: "border-red-300 bg-red-50/60",
    hero: "hero-card--critical",
    badge: "bg-red-100 text-red-800 border-red-300",
    icon: ShieldAlert,
    iconColor: "text-red-600",
    labelKey: "riskHigh" as const,
  },
  WARNING: {
    wrap: "border-amber-300 bg-amber-50/60",
    hero: "hero-card--warning",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    labelKey: "riskAttention" as const,
  },
  LOW: {
    wrap: "border-emerald-300 bg-emerald-50/60",
    hero: "hero-card--low",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: ShieldCheck,
    iconColor: "text-emerald-600",
    labelKey: "riskRoutine" as const,
  },
};

export default function PatientSummary({ result, lang = "en" }: PatientSummaryProps) {
  const t = TRANSLATIONS[lang];
  const config = riskConfig[result.overall_risk_level] || riskConfig.LOW;
  const Icon = config.icon;
  const count = (sev: string) => result.safety_alerts.filter((a) => a.severity === sev).length;
  const stats = [
    { label: t.statCritical, value: count("CRITICAL"), color: "text-red-700" },
    { label: t.statWarnings, value: count("WARNING"), color: "text-amber-700" },
    { label: t.statAbnormal, value: result.lab_markers.filter((m) => m.status !== "NORMAL").length, color: "text-purple-700" },
    { label: t.statMeds, value: result.medications.length, color: "text-gray-900" },
  ];

  return (
    <div className={`rounded-2xl p-5 border-2 shadow-sm space-y-4 hero-card ${config.hero} ${config.wrap}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>📋</span> {t.overviewTitle}
        </h2>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.badge}`}>
          <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} aria-hidden />
          {t[config.labelKey]}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{result.patient_summary}</p>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white/80 border border-gray-200 px-3 py-2 text-center">
            <dd className={`stat-num font-black tabular-nums ${s.color}`} style={{ "--n": s.value } as React.CSSProperties}>{s.value}</dd>
            <dt className="text-[11px] text-gray-500 font-medium">{s.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
