"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, CheckCircle2 } from "lucide-react";
import { LabMarker } from "@/types/analysis";
import { Reveal } from "@/components/shared/Reveal";

interface BiomarkerChartProps {
  markers: LabMarker[];
}

export default function BiomarkerChart({ markers }: BiomarkerChartProps) {
  const [filterType, setFilterType] = useState<"all" | "abnormal" | "normal">("all");

  const abnormalCount = markers.filter((m) => m.status === "HIGH" || m.status === "LOW").length;

  const filteredMarkers = markers.filter((m) => {
    if (filterType === "abnormal") return m.status === "HIGH" || m.status === "LOW";
    if (filterType === "normal") return m.status === "NORMAL";
    return true;
  });

  const getOrganLabel = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("creatinine") || lower.includes("egfr") || lower.includes("bun") || lower.includes("urea")) return "Renal Function";
    if (lower.includes("glucose") || lower.includes("hba1c") || lower.includes("sugar")) return "Metabolic / Glycemic";
    if (lower.includes("cholesterol") || lower.includes("ldl") || lower.includes("hdl") || lower.includes("triglyceride")) return "Cardiovascular / Lipid";
    if (lower.includes("alt") || lower.includes("ast") || lower.includes("bilirubin")) return "Hepatic / Liver";
    return "General Hematology";
  };

  return (
    <div className="dash-card p-6 sm:p-8">
      <div className="pb-5 border-b border-[#0B5F51]/10">
        <h2 className="text-lg font-bold text-[#0B1F1B]">
          Your lab results
        </h2>
        <p className="print-hide text-xs text-[#5A7268] mt-0.5">
          Your numbers, next to the healthy range
        </p>

        {/* Filter tabs — quiet segmented control */}
        <div className="relative flex w-full items-center bg-[#E3F2E9] p-1 rounded-xl text-xs font-medium no-print mt-4">
          <span aria-hidden className="tab-pill" style={{ "--tabs": 3, "--i": ["all", "abnormal", "normal"].indexOf(filterType) } as React.CSSProperties} />
          <button
            onClick={() => setFilterType("all")}
            className={`relative z-10 flex-1 min-h-11 px-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              filterType === "all" ? "text-[#0B1F1B] font-bold" : "text-[#5A7268] hover:text-[#0B1F1B]"
            }`}
          >
            All ({markers.length})
          </button>
          <button
            onClick={() => setFilterType("abnormal")}
            className={`relative z-10 flex-1 min-h-11 px-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              filterType === "abnormal" ? "text-[#8C3B2E] font-bold" : "text-[#5A7268] hover:text-[#8C3B2E]"
            }`}
          >
            Abnormal ({abnormalCount})
          </button>
          <button
            onClick={() => setFilterType("normal")}
            className={`relative z-10 flex-1 min-h-11 px-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              filterType === "normal" ? "text-emerald-700 font-bold" : "text-[#5A7268] hover:text-emerald-700"
            }`}
          >
            Normal ({markers.length - abnormalCount})
          </button>
        </div>
      </div>

      {/* Rows separated by hairlines — no per-card gradients or borders */}
      <div>
        {filteredMarkers.map((marker, i) => {
          const isHigh = marker.status === "HIGH";
          const isLow = marker.status === "LOW";
          const isNormal = marker.status === "NORMAL";

          return (
            <Reveal key={i} from="left" delay={i * 70}>
              <div className={`${isNormal ? "print-hide " : ""}py-5 ${i > 0 ? "border-t border-[#0B5F51]/10" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A938A]">
                      {getOrganLabel(marker.test_name)}
                      {marker.confidence !== "high" && (
                        <span className="ml-2 normal-case font-semibold text-amber-700">Review OCR</span>
                      )}
                    </p>
                    <h4 className="text-sm font-bold text-[#0B1F1B] mt-1">
                      {marker.test_name}
                    </h4>
                    <p className="text-xs text-[#5A7268] mt-0.5">
                      Reference:{" "}
                      <span className="font-semibold text-[#3D5A50] tabular-nums">
                        {marker.reference_range} {marker.unit}
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className={`text-2xl font-bold tabular-nums ${isHigh ? "text-[#A44A3A]" : isLow ? "text-amber-600" : "text-[#0B1F1B]"}`}>
                        {marker.value}
                      </span>
                      <span className="text-xs text-[#7A938A] font-medium">
                        {marker.unit}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                        isHigh
                          ? "bg-[#F6E9E4] text-[#8C3B2E]"
                          : isLow
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {isHigh && <ArrowUpRight className="w-3 h-3" />}
                      {isLow && <ArrowDownRight className="w-3 h-3" />}
                      {isNormal && <CheckCircle2 className="w-3 h-3" />}
                      {marker.status}
                    </span>
                  </div>
                </div>

                {/* One slim range bar — wipes in left to right */}
                <div className="print-hide mt-4 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-[#7A938A] font-medium">
                    <span>LOW</span>
                    <span>Normal range</span>
                    <span>HIGH</span>
                  </div>
                  <div className="lab-bar lab-bar--slim w-full bg-[#E3F2E9] rounded-full overflow-hidden flex relative">
                    <div className="animate-bar-fill w-[25%] bg-amber-300/80" title="Low zone" />
                    <div className="animate-bar-fill w-[50%] bg-emerald-400/80" title="Normal zone" style={{ animationDelay: "80ms" }} />
                    <div className="animate-bar-fill w-[25%] bg-[#C07A66]/70" title="High zone" style={{ animationDelay: "160ms" }} />
                    <div
                      className={`lab-marker marker-in absolute -top-[2px] -bottom-[2px] w-3.5 rounded-full border-2 border-[#F4FBF6] ${
                        isHigh
                          ? "bg-[#A44A3A] left-[85%]"
                          : isLow
                          ? "bg-amber-500 left-[12%]"
                          : "bg-emerald-600 left-[50%]"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-[#7A938A]">Single reading · no trend history yet</p>
                </div>

                {/* Plain-language interpretation — plain text, no box */}
                <p className="print-hide text-xs text-[#5A7268] mt-3 leading-relaxed">
                  <span className="font-bold text-[#2C4A42]">What this means: </span>
                  {marker.plain_meaning}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
