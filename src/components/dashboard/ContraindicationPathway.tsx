"use client";

import { Activity, ArrowRight, ArrowDown } from "lucide-react";
import { SafetyAlert } from "@/types/analysis";
import { Language, TRANSLATIONS } from "@/lib/translations";
import { resolvePathway } from "@/lib/pathway";
import { Reveal } from "@/components/shared/Reveal";

interface ContraindicationPathwayProps {
  alerts: SafetyAlert[];
  lang?: Language;
}

/* Clean step connector — a thin hairline with a small arrow, left to right. */
const Arrow = ({ label }: { label?: string }) => (
  <div className="flex flex-row md:flex-col items-center justify-center gap-1.5 text-[#7A938A]">
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E3F2E9]">
      <ArrowRight className="hidden md:block w-4 h-4 text-[#5A7268]" aria-hidden />
      <ArrowDown className="md:hidden w-4 h-4 text-[#5A7268]" aria-hidden />
    </span>
    {label && (
      <span className="text-[10px] text-[#7A938A] text-center leading-tight max-w-[8rem]">
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
    <section aria-label="Contraindication pathway" className="dash-card p-6 sm:p-8">
      <div className="flex items-center gap-3 pb-5 border-b border-[#0B5F51]/10">
        <div className="w-10 h-10 rounded-xl bg-[#F6E9E4] text-[#A44A3A] flex items-center justify-center">
          <Activity className="w-5 h-5" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-[#0B1F1B]">
            {t.pathwayTitle}
          </h3>
          <p className="text-xs text-[#5A7268]">How each flagged medicine could cause harm — step by step</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#E3F2E9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5A7268]">Drug → Lab → Harm</span>
      </div>

      <div className="space-y-6 pt-6">
        {items.map((alert, idx) => {
          const p = resolvePathway(alert, lang);
          const hasLab = !!alert.related_lab?.trim();
          const cols = hasLab
            ? "md:grid-cols-[1fr_auto_1fr_auto_1fr]"
            : "md:grid-cols-[1fr_auto_1fr]";

          return (
            <Reveal key={idx} from="left" delay={idx * 120}>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      alert.severity === "CRITICAL" ? "bg-[#A44A3A] text-white" : "bg-amber-500 text-white"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs text-[#7A938A] font-mono">{alert.type}</span>
                </div>

                <div className={`grid grid-cols-1 ${cols} gap-3 items-center text-sm`}>
                  <div className="rounded-xl border border-[#0B5F51]/15 bg-[#F4FBF6]/60 px-4 py-3.5 text-center">
                    <span className="text-[10px] text-[#7A938A] uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E3F2E9] text-[#5A7268] text-[9px] font-bold">1</span>
                      {t.pwMedicine}
                    </span>
                    <p className="font-bold text-[#0B1F1B] mt-1 break-words">
                      {alert.related_medication || "Prescribed medicine"}
                    </p>
                  </div>

                  <Arrow label={p.mechanism} />

                  {hasLab && (
                    <>
                      <div className="rounded-xl border border-[#0B5F51]/15 bg-[#F4FBF6]/60 px-4 py-3.5 text-center">
                        <span className="text-[10px] text-[#7A938A] uppercase tracking-wider flex items-center justify-center gap-1.5">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E3F2E9] text-[#5A7268] text-[9px] font-bold">2</span>
                          {t.pwLab}
                        </span>
                        <p className="font-bold text-[#8C3B2E] mt-1 break-words tabular-nums">{alert.related_lab}</p>
                      </div>
                      <Arrow label={p.biomarkerEffect} />
                    </>
                  )}

                  <div className="rounded-xl border border-[#A44A3A]/25 bg-[#F6E9E4]/60 px-4 py-3.5 text-center">
                    <span className="text-[10px] text-[#A44A3A] uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#EFDCD3] text-[#A44A3A] text-[9px] font-bold">{hasLab ? "3" : "2"}</span>
                      {t.pwOutcome}
                    </span>
                    <p className="font-bold text-base text-[#7A3327] mt-1 break-words">{p.outcome}</p>
                  </div>
                </div>

                <p className="text-xs text-[#5A7268] leading-relaxed">
                  <span className="font-bold text-[#2C4A42]">In plain words: </span>
                  {alert.explanation}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
