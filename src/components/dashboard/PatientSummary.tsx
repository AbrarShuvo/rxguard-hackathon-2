"use client";

import { ShieldCheck, ShieldAlert, AlertTriangle, OctagonAlert, OctagonX, CircleCheck } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";
import { Language, TRANSLATIONS } from "@/lib/translations";
import { CountUp } from "@/components/shared/Reveal";

interface PatientSummaryProps {
  result: AnalysisResult;
  lang?: Language;
}

/* Calm severity config — one accent colour each, no gradients. */
const riskConfig = {
  CRITICAL: {
    accent: "#A44A3A",
    accentSoft: "bg-[#F6E9E4] text-[#8C3B2E]",
    ring: "#A44A3A",
    icon: ShieldAlert,
    iconColor: "text-[#A44A3A]",
    labelKey: "riskHigh" as const,
  },
  WARNING: {
    accent: "#b45309",
    accentSoft: "bg-amber-50 text-amber-700",
    ring: "#d97706",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    labelKey: "riskAttention" as const,
  },
  LOW: {
    accent: "#047857",
    accentSoft: "bg-emerald-50 text-emerald-700",
    ring: "#059669",
    icon: ShieldCheck,
    iconColor: "text-emerald-600",
    labelKey: "riskRoutine" as const,
  },
};

const RING_C = 2 * Math.PI * 40; // r=40

export default function PatientSummary({ result, lang = "en" }: PatientSummaryProps) {
  const t = TRANSLATIONS[lang];
  const config = riskConfig[result.overall_risk_level] || riskConfig.LOW;
  const Icon = config.icon;
  const count = (sev: string) => result.safety_alerts.filter((a) => a.severity === sev).length;
  const critical = count("CRITICAL");
  const warnings = count("WARNING");
  const abnormal = result.lab_markers.filter((m) => m.status !== "NORMAL").length;
  // Ring shows the share of alerts that are critical — a visual severity gauge, not a medical score.
  const totalAlerts = result.safety_alerts.length;
  const ringFrac = totalAlerts === 0 ? 0 : result.overall_risk_level === "LOW" ? 0.08 : result.overall_risk_level === "CRITICAL" ? 1 : 0.55;

  const stats = [
    { label: t.statCritical, value: critical, tone: "text-[#A44A3A]" },
    { label: t.statWarnings, value: warnings, tone: "text-amber-600" },
    { label: t.statAbnormal, value: abnormal, tone: "text-[#0B1F1B]" },
    { label: t.statMeds, value: result.medications.length, tone: "text-[#0B1F1B]" },
  ];

  const isCritical = result.overall_risk_level === "CRITICAL";
  const isWarning = result.overall_risk_level === "WARNING";
  // STOP / CHECK / SAFE stamp — word + icon + colour, never colour alone.
  const stamp = isCritical
    ? { word: "STOP", label: "Do not take — act now", icon: OctagonX, cls: "border-[#A44A3A] text-[#A44A3A]" }
    : isWarning
    ? { word: "CHECK", label: "Review with your doctor", icon: AlertTriangle, cls: "border-amber-600 text-amber-600" }
    : { word: "SAFE", label: "No critical flags found", icon: CircleCheck, cls: "border-emerald-600 text-emerald-600" };
  const StampIcon = stamp.icon;
  // One suggested action: the top-priority alert's action, in plain words.
  const topAlert = [...result.safety_alerts].sort((a, b) => ({ CRITICAL: 0, WARNING: 1, INFO: 2 }[a.severity] - { CRITICAL: 0, WARNING: 1, INFO: 2 }[b.severity]))[0];

  return (
    <div className="dash-card relative overflow-hidden p-6 sm:p-8">
      {/* One strong accent: a single left bar, in the severity colour. */}
      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: config.accent }} aria-hidden />

      <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
        {/* Severity ring — thin, draws in left to right */}
        <div className="relative shrink-0 mx-auto sm:mx-0" aria-hidden>
          <svg className="sev-ring h-24 w-24" viewBox="0 0 96 96">
            <circle className="ring-track" cx="48" cy="48" r="40" />
            <circle
              className="ring-value ring-draw"
              cx="48"
              cy="48"
              r="40"
              stroke={config.ring}
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - ringFrac)}
              style={{ "--ring-c": RING_C } as React.CSSProperties}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon className={`h-6 w-6 ${config.iconColor}`} aria-hidden />
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 text-[#7A938A]">Risk</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0B1F1B]">
              {t.overviewTitle}
            </h2>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${config.accentSoft}`}>
              <Icon className="w-3.5 h-3.5" aria-hidden />
              {t[config.labelKey]}
            </span>
          </div>
          <p className="text-sm sm:text-[15px] leading-relaxed mt-2 text-[#3D5A50] max-w-2xl">{result.patient_summary}</p>
          {topAlert && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#EFFAF3] border-l-2 px-4 py-3 text-left" style={{ borderLeftColor: config.accent }}>
              <OctagonAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#5A7268]" aria-hidden />
              <p className="text-sm leading-relaxed text-[#2C4A42]">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A938A]">One next step</span>
                {topAlert.action}
              </p>
            </div>
          )}
        </div>

        {/* Verdict stamp — flat outline, no fill, no shadow */}
        <div className="shrink-0 mx-auto sm:mx-0 text-center">
          <div className={`inline-flex flex-col items-center gap-1 rounded-xl border-2 px-4 py-2.5 ${stamp.cls}`}>
            <StampIcon className="h-5 w-5" aria-hidden />
            <span className="text-lg font-black tracking-widest leading-none">{stamp.word}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wide opacity-70">{stamp.label}</span>
          </div>
        </div>
      </div>

      {/* Stats — plain numbers, hairline dividers, no icon tiles */}
      <dl className="mt-7 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#0B5F51]/10">
        {stats.map((s, i) => (
          <div key={s.label} className={i > 0 ? "sm:border-l sm:border-[#0B5F51]/10 sm:pl-6" : ""}>
            <dd className={`font-bold tabular-nums text-3xl leading-none ${s.tone}`}>
              <CountUp to={s.value} />
            </dd>
            <dt className="text-xs font-medium text-[#5A7268] mt-1.5">{s.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
