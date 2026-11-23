"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, Filter } from "lucide-react";
import { LabMarker } from "@/types/analysis";

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

  const getOrganBadge = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("creatinine") || lower.includes("egfr") || lower.includes("bun") || lower.includes("urea")) {
      return { label: "Renal Function", color: "bg-purple-100 text-purple-800 border-purple-200" };
    }
    if (lower.includes("glucose") || lower.includes("hba1c") || lower.includes("sugar")) {
      return { label: "Metabolic / Glycemic", color: "bg-blue-100 text-blue-800 border-blue-200" };
    }
    if (lower.includes("cholesterol") || lower.includes("ldl") || lower.includes("hdl") || lower.includes("triglyceride")) {
      return { label: "Cardiovascular / Lipid", color: "bg-amber-100 text-amber-800 border-amber-200" };
    }
    if (lower.includes("alt") || lower.includes("ast") || lower.includes("bilirubin")) {
      return { label: "Hepatic / Liver", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    }
    return { label: "General Hematology", color: "bg-gray-100 text-gray-800 border-gray-200" };
  };

  return (
    <div className="bg-white rounded-2xl p-5 card-surface space-y-4">
      <div className="space-y-3 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span>🔬</span> Lab Biomarker Analysis &amp; Ranges
          </h2>
          <p className="print-hide text-xs text-gray-500">
            Pathology values mapped against diagnostic reference intervals
          </p>
        </div>

        {/* Filter buttons */}
        <div className="relative flex w-full items-center bg-gray-100 p-1 rounded-xl text-xs font-medium no-print">
          <span aria-hidden className="tab-pill" style={{ "--tabs": 3, "--i": ["all", "abnormal", "normal"].indexOf(filterType) } as React.CSSProperties} />
          <button
            onClick={() => setFilterType("all")}
            className={`relative z-10 flex-1 min-h-11 px-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              filterType === "all" ? "text-gray-900 font-bold" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All ({markers.length})
          </button>
          <button
            onClick={() => setFilterType("abnormal")}
            className={`relative z-10 flex-1 min-h-11 px-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              filterType === "abnormal" ? "text-red-700 font-bold" : "text-gray-500 hover:text-red-700"
            }`}
          >
            Abnormal ({abnormalCount})
          </button>
          <button
            onClick={() => setFilterType("normal")}
            className={`relative z-10 flex-1 min-h-11 px-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              filterType === "normal" ? "text-emerald-700 font-bold" : "text-gray-500 hover:text-emerald-700"
            }`}
          >
            Normal ({markers.length - abnormalCount})
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredMarkers.map((marker, i) => {
          const isHigh = marker.status === "HIGH";
          const isLow = marker.status === "LOW";
          const isNormal = marker.status === "NORMAL";
          const organ = getOrganBadge(marker.test_name);

          return (
            <div
              key={i}
              className={`${isNormal ? "print-hide " : ""}p-4 rounded-xl border transition-all ${
                isHigh
                  ? "bg-red-50/40 border-red-200 shadow-xs"
                  : isLow
                  ? "bg-amber-50/40 border-amber-200 shadow-xs"
                  : "bg-gray-50/50 border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${organ.color}`}>
                      {organ.label}
                    </span>
                    {marker.confidence !== "high" && (
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        Review OCR
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {marker.test_name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Normal Reference Interval:{" "}
                    <span className="font-semibold text-gray-700 tabular-nums">
                      {marker.reference_range} {marker.unit}
                    </span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1">
                    <span className={`text-lg font-black tabular-nums ${isHigh ? "text-red-700" : isLow ? "text-amber-700" : "text-gray-900"}`}>
                      {marker.value}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {marker.unit}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      isHigh
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : isLow
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {isHigh && <ArrowUpRight className="w-3 h-3 text-red-600" />}
                    {isLow && <ArrowDownRight className="w-3 h-3 text-amber-600" />}
                    {isNormal && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {marker.status}
                  </span>
                </div>
              </div>

              {/* Three-Zone Range Bar Visualizer */}
              <div className="print-hide mt-3 space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>LOW</span>
                  <span>NORMAL ZONE</span>
                  <span>HIGH</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden flex relative">
                  {/* Zone indicators */}
                  <div className="w-[25%] bg-amber-200/80" title="Low zone" />
                  <div className="w-[50%] bg-emerald-200/80" title="Normal zone" />
                  <div className="w-[25%] bg-red-200/80" title="High zone" />

                  {/* Pinpoint Indicator */}
                  <div
                    className={`marker-in absolute top-0 bottom-0 w-2 rounded-full shadow-md transition-all duration-300 ${
                      isHigh
                        ? "bg-red-600 left-[85%]"
                        : isLow
                        ? "bg-amber-500 left-[12%]"
                        : "bg-emerald-600 left-[50%]"
                    }`}
                  />
                </div>
              </div>

              {/* Plain language interpretation */}
              <div className="print-hide text-xs text-gray-700 mt-2.5 bg-white/90 p-2.5 rounded-lg border border-gray-100 leading-relaxed flex items-start gap-1.5">
                <span className="shrink-0 text-base">💡</span>
                <p>
                  <strong className="text-gray-900">Clinical Interpretation:</strong> {marker.plain_meaning}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
