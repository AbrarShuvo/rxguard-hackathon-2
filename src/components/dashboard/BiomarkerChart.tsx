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
      <div className="pb-5 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900">
          Lab Biomarkers
        </h2>
        <p className="print-hide text-xs text-slate-500 mt-0.5">
          Values mapped against diagnostic reference intervals
        </p>

        {/* Filter tabs — quiet segmented control */}
        <div className="relative flex w-full items-center bg-slate-100 p-1 rounded-xl text-xs font-medium no-print mt-4">
          <span aria-hidden className="tab-pill" style={{ "--tabs": 3, "--i": ["all", "abnormal", "normal"].indexOf(filterType) } as React.CSSProperties} />
          <button
            onClick={() => setFilterType("all")}
            className={`relative z-10 flex-1 min-h-11 px-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              filterType === "all" ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All ({markers.length})
          </button>
          <button
            onClick={() => setFilterType("abnormal")}
            className={`relative z-10 flex-1 min-h-11 px-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              filterType === "abnormal" ? "text-red-700 font-bold" : "text-slate-500 hover:text-red-700"
            }`}
          >
            Abnormal ({abnormalCount})
          </button>
          <button
            onClick={() => setFilterType("normal")}
            className={`relative z-10 flex-1 min-h-11 px-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              filterType === "normal" ? "text-emerald-700 font-bold" : "text-slate-500 hover:text-emerald-700"
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
              <div className={`${isNormal ? "print-hide " : ""}py-5 ${i > 0 ? "border-t border-slate-100" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {getOrganLabel(marker.test_name)}
                      {marker.confidence !== "high" && (
                        <span className="ml-2 normal-case font-semibold text-amber-700">Review OCR</span>
                      )}
                    </p>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {marker.test_name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Reference:{" "}
                      <span className="font-semibold text-slate-600 tabular-nums">
                        {marker.reference_range} {marker.unit}
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className={`text-2xl font-bold tabular-nums ${isHigh ? "text-red-600" : isLow ? "text-amber-600" : "text-slate-900"}`}>
                        {marker.value}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {marker.unit}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                        isHigh
                          ? "bg-red-50 text-red-700"
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
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>LOW</span>
                    <span>Normal range</span>
                    <span>HIGH</span>
                  </div>
                  <div className="lab-bar lab-bar--slim w-full bg-slate-100 rounded-full overflow-hidden flex relative">
                    <div className="animate-bar-fill w-[25%] bg-amber-300/80" title="Low zone" />
                    <div className="animate-bar-fill w-[50%] bg-emerald-400/80" title="Normal zone" style={{ animationDelay: "80ms" }} />
                    <div className="animate-bar-fill w-[25%] bg-red-400/80" title="High zone" style={{ animationDelay: "160ms" }} />
                    <div
                      className={`lab-marker marker-in absolute -top-[2px] -bottom-[2px] w-3.5 rounded-full border-2 border-white ${
                        isHigh
                          ? "bg-red-600 left-[85%]"
                          : isLow
                          ? "bg-amber-500 left-[12%]"
                          : "bg-emerald-600 left-[50%]"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Single reading · no trend history yet</p>
                </div>

                {/* Plain-language interpretation — plain text, no box */}
                <p className="print-hide text-xs text-slate-500 mt-3 leading-relaxed">
                  <span className="font-bold text-slate-700">What this means: </span>
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
