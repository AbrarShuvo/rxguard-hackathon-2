"use client";

import { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { SafetyAlert } from "@/types/analysis";
import { Reveal } from "@/components/shared/Reveal";

/* Calm severity config — one flat accent per severity, white cards. */
const severityConfig = {
  CRITICAL: {
    bar: "bg-[#A44A3A]",
    iconWrap: "bg-[#F6E9E4]/70 backdrop-blur-sm text-[#A44A3A]",
    icon: ShieldAlert,
    badge: "bg-[#A44A3A] text-white",
    titleColor: "text-[#0B1F1B]",
    textColor: "text-[#3D5A50]",
    actionColor: "text-[#8C3B2E]",
  },
  WARNING: {
    bar: "bg-amber-500",
    iconWrap: "bg-amber-50/70 backdrop-blur-sm text-amber-600",
    icon: AlertTriangle,
    badge: "bg-amber-500 text-white",
    titleColor: "text-[#0B1F1B]",
    textColor: "text-[#3D5A50]",
    actionColor: "text-amber-700",
  },
  INFO: {
    bar: "bg-sky-500",
    iconWrap: "bg-sky-50 text-sky-600",
    icon: Info,
    badge: "bg-sky-500 text-white",
    titleColor: "text-[#0B1F1B]",
    textColor: "text-[#3D5A50]",
    actionColor: "text-sky-700",
  },
};

export default function AlertBanner({ alerts }: SafetyAlertProps) {
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "WARNING" | "INFO">("ALL");
  const sorted = [...alerts].sort((a, b) => {
    const order = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    return order[a.severity] - order[b.severity];
  });
  const visible = filter === "ALL" ? sorted : sorted.filter((a) => a.severity === filter);
  const counts = {
    ALL: sorted.length,
    CRITICAL: sorted.filter((a) => a.severity === "CRITICAL").length,
    WARNING: sorted.filter((a) => a.severity === "WARNING").length,
    INFO: sorted.filter((a) => a.severity === "INFO").length,
  };

  return (
    <section aria-label="Safety alerts" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-[#0B1F1B] flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-[#A44A3A]" aria-hidden />
          What needs your attention
        </h2>
        <span className="glass-inner rounded-full px-2.5 py-1 text-xs font-semibold text-[#5A7268] tabular-nums shadow-sm ring-1 ring-[#0B1F1B]/5">
          {sorted.length} {sorted.length === 1 ? "thing to know" : "things to know"} · worst first
        </span>
      </div>

      {/* Filter pills — quiet, one dark active state */}
      <div className="flex flex-wrap gap-2 no-print" role="group" aria-label="Filter alerts by severity">
        {(["ALL", "CRITICAL", "WARNING", "INFO"] as const).map((f) => (
          <button
            key={f}
            type="button"
            data-active={filter === f}
            onClick={() => setFilter(f)}
            className="triage-pill inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#0B5F51]/15 bg-[#F4FBF6]/55 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-[#3D5A50]"
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((alert, i) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <Reveal key={`${alert.severity}-${i}`} from="left" delay={i * 90}>
              <article className="dash-card relative overflow-hidden p-5 sm:p-6">
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${config.bar}`} aria-hidden />
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${config.iconWrap}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${config.badge} px-2 py-0.5 rounded-full`}>
                        {alert.severity}
                      </span>
                      <span className="text-[11px] font-medium text-[#7A938A]">
                        Alert {i + 1} of {sorted.length}
                        {alert.type !== "GENERAL" ? ` · ${alert.type.replace("_", "-")}` : ""}
                      </span>
                    </div>
                    <h3 className={`font-display text-base font-bold ${config.titleColor}`}>{alert.title}</h3>
                    <p className={`print-hide text-sm ${config.textColor} mt-1 leading-relaxed`}>{alert.explanation}</p>
                    <div className="mt-4 pt-3 flex items-start gap-2 border-t border-[#0B5F51]/10">
                      <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${config.actionColor}`} aria-hidden />
                      <p className="text-sm leading-relaxed text-[#2C4A42]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A938A] mr-1.5">What to do</span>
                        {alert.action}
                      </p>
                      <ArrowRight className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-[#9DB3A8]" aria-hidden />
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

interface SafetyAlertProps {
  alerts: SafetyAlert[];
}
