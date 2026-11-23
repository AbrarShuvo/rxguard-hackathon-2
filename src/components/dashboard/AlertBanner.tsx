"use client";

import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
} from "lucide-react";
import { SafetyAlert } from "@/types/analysis";

interface AlertBannerProps {
  alerts: SafetyAlert[];
}

const severityConfig = {
  CRITICAL: {
    bg: "bg-red-50",
    border: "border-red-300",
    icon: ShieldAlert,
    iconColor: "text-red-600",
    titleColor: "text-red-800",
    textColor: "text-red-700",
    badgeBg: "bg-red-600",
    animate: "animate-pulse-alert",
  },
  WARNING: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    titleColor: "text-amber-800",
    textColor: "text-amber-700",
    badgeBg: "bg-amber-500",
    animate: "",
  },
  INFO: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
    iconColor: "text-blue-500",
    titleColor: "text-blue-800",
    textColor: "text-blue-700",
    badgeBg: "bg-blue-500",
    animate: "",
  },
};

export default function AlertBanner({ alerts }: AlertBannerProps) {
  // Sort: CRITICAL first, then WARNING, then INFO
  const sorted = [...alerts].sort((a, b) => {
    const order = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="space-y-3 stagger-children">
      {sorted.map((alert, i) => {
        const config = severityConfig[alert.severity];
        const Icon = config.icon;

        return (
          <div
            key={i}
            className={`rounded-xl border-2 ${config.border} ${config.bg} p-4 ${config.animate}`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${config.badgeBg} text-white px-2 py-0.5 rounded-full severity-${alert.severity.toLowerCase()}`}
                  >
                    {alert.severity}
                  </span>
                  {alert.type !== "GENERAL" && (
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {alert.type.replace("_", "-")}
                    </span>
                  )}
                </div>
                <h3 className={`text-sm font-bold ${config.titleColor}`}>
                  {alert.title}
                </h3>
                <p className={`print-hide text-xs ${config.textColor} mt-1 leading-relaxed`}>
                  {alert.explanation}
                </p>
                <div className="mt-2 flex items-start gap-1.5">
                  <AlertCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${config.iconColor}`} />
                  <p className={`text-xs font-medium ${config.titleColor}`}>
                    {alert.action}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
