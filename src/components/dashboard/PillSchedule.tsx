"use client";

import { useState } from "react";
import { Sun, Sunset, Moon, CalendarDays, HelpCircle, Utensils, CheckCircle, Circle, OctagonAlert } from "lucide-react";
import { Medication, SafetyAlert } from "@/types/analysis";

interface PillScheduleProps {
  medications: Medication[];
  alerts?: SafetyAlert[];
}

type SlotId = "morning" | "afternoon" | "night";

const NON_DAILY = /weekly|once a week|per week|every week|\bprn\b|\bsos\b|as needed|alternate day|every other day|monthly/i;
const DURATION = /[×x]\s*(\d+\s*(?:days?|weeks?|months?))|for\s+(\d+\s*(?:days?|weeks?|months?))/i;
const EXTENDED_NAME = /\b(ER|XR|SR|CR|XL|XT)\b|extended/i;

const isNonDaily = (m: Medication) =>
  NON_DAILY.test(`${m.raw_dosage} ${m.food_instruction} ${m.special_instructions ?? ""}`);

const isHeld = (m: Medication, alerts: SafetyAlert[]) => {
  const name = m.name.toLowerCase();
  const generic = (m.generic_name || "").toLowerCase();
  return alerts.some((a) => {
    if (a.severity !== "CRITICAL" || !a.related_medication) return false;
    const rel = a.related_medication.toLowerCase();
    if (rel.length < 3) return false;
    return rel.includes(name) || name.includes(rel) || (generic.length >= 3 && rel.includes(generic));
  });
};

const courseLength = (m: Medication) => {
  if (m.course_duration) return m.course_duration;
  const match = m.raw_dosage.match(DURATION);
  return match ? (match[1] || match[2]).trim() : null;
};

const cleanInstructions = (m: Medication) => {
  const text = m.special_instructions?.trim();
  if (!text) return "";
  if (EXTENDED_NAME.test(`${m.name} ${m.generic_name}`)) return text;
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => !/extended[- ]release/i.test(s))
    .join(" ")
    .trim();
};

const SLOTS: { id: SlotId; title: string; time: string; tab: string; iconBg: string; icon: React.ReactNode }[] = [
  { id: "morning", title: "Morning Routine", time: "8:00 AM - 10:00 AM", tab: "☀️ Morning", iconBg: "bg-amber-50", icon: <Sun className="w-4 h-4 text-amber-500" /> },
  { id: "afternoon", title: "Afternoon Routine", time: "1:00 PM - 2:00 PM", tab: "🌤️ Afternoon", iconBg: "bg-orange-50", icon: <Sunset className="w-4 h-4 text-orange-500" /> },
  { id: "night", title: "Night Routine", time: "8:00 PM - 10:00 PM", tab: "🌙 Night", iconBg: "bg-indigo-50", icon: <Moon className="w-4 h-4 text-indigo-500" /> },
];

export default function PillSchedule({ medications, alerts = [] }: PillScheduleProps) {
  const [takenMap, setTakenMap] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"all" | SlotId>("all");

  const daily = medications.filter((m) => !isNonDaily(m));
  const periodic = medications.filter(isNonDaily);

  const slotMeds = (id: SlotId) => daily.filter((m) => m.schedule[id]);
  const activeSlots = SLOTS.filter((s) => slotMeds(s.id).length > 0);

  // Countable doses exclude medicines on hold
  const countable = activeSlots.flatMap((s) =>
    slotMeds(s.id)
      .filter((m) => !isHeld(m, alerts))
      .map((m) => `${s.id}-${m.name}`)
  );
  const totalDoses = countable.length;
  const takenCount = countable.filter((k) => takenMap[k]).length;
  const percent = totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 0;

  const toggle = (key: string) => setTakenMap((p) => ({ ...p, [key]: !p[key] }));
  const currentFilter = filter !== "all" && !activeSlots.some((s) => s.id === filter) ? "all" : filter;

  const renderMed = (med: Medication, key: string, countsTowardAdherence: boolean) => {
    const held = isHeld(med, alerts);
    const taken = !held && countsTowardAdherence && !!takenMap[key];
    const duration = courseLength(med);
    const instructions = cleanInstructions(med);
    const interactive = !held && countsTowardAdherence;

    return (
      <div
        key={key}
        role={interactive ? "checkbox" : undefined}
        aria-checked={interactive ? taken : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? () => toggle(key) : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggle(key);
                }
              }
            : undefined
        }
        className={`p-3.5 rounded-xl border-2 transition-all select-none space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
          interactive ? "cursor-pointer" : ""
        } ${
          held
            ? "bg-red-50/60 border-red-400"
            : taken
            ? "bg-emerald-50/50 border-emerald-300 opacity-80"
            : "bg-gray-50 border-gray-200 hover:border-emerald-300"
        }`}
      >
        {held && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-800 bg-red-100 border border-red-300 rounded-lg px-2 py-1">
            <OctagonAlert className="w-3.5 h-3.5 shrink-0" aria-hidden />
            Hold — ask your doctor first
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            {interactive &&
              (taken ? (
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 fill-emerald-600 text-white" aria-hidden />
              ) : (
                <Circle className="w-4 h-4 mt-0.5 shrink-0 text-gray-300" aria-hidden />
              ))}
            <div className="min-w-0">
              <h4 className={`text-sm font-bold leading-tight ${taken ? "line-through text-gray-400" : "text-gray-900"}`}>
                {med.name}
              </h4>
              <p className="text-[11px] text-gray-500 font-medium">
                {med.generic_name} • <span className="text-gray-400">{med.drug_class}</span>
              </p>
            </div>
          </div>

          {med.confidence !== "high" && (
            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <HelpCircle className="w-2.5 h-2.5" aria-hidden />
              Verify handwriting
            </span>
          )}
        </div>

        <p className={`print-hide text-xs text-gray-600 italic ${interactive ? "pl-6" : ""}`}>&ldquo;{med.purpose}&rdquo;</p>

        <div className={`flex flex-wrap items-center gap-2 text-[11px] ${interactive ? "pl-6" : ""}`}>
          <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
            <Utensils className="w-3 h-3" aria-hidden />
            {med.food_instruction}
          </span>
          {duration && (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <CalendarDays className="w-3 h-3" aria-hidden />× {duration}
            </span>
          )}
          <span className="print-hide font-mono text-gray-500 bg-gray-200/60 px-1.5 py-0.5 rounded text-[10px]">
            Shorthand: {med.raw_dosage}
          </span>
          {taken && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-auto">
              ✓ Taken
            </span>
          )}
        </div>

        {instructions && (
          <p className={`print-hide text-[11px] text-blue-700 bg-blue-50/70 p-2 rounded-lg border border-blue-100 ${interactive ? "ml-6" : ""}`}>
            💡 {instructions}
          </p>
        )}
      </div>
    );
  };

  const card = (title: string, sub: string, icon: React.ReactNode, iconBg: string, count: number, children: React.ReactNode) => (
    <div className="bg-white rounded-2xl p-5 card-surface space-y-3">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <p className="text-[11px] text-gray-500">{sub}</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
          {count} {count === 1 ? "pill" : "pills"}
        </span>
      </div>
      <div className="space-y-3 pt-1">{children}</div>
    </div>
  );

  const tabCls = (active: boolean) =>
    `relative z-10 flex-1 min-h-11 px-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
      active ? "text-gray-900 font-bold" : "hover:text-gray-900"
    }`;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 card-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span>💊</span> Daily Pill Timeline
          </h2>
          <p className="print-hide text-xs text-gray-500">Tap a pill card to log the dose as taken</p>
        </div>
        <div className="print-hide flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-gray-800 tabular-nums">
              {takenCount} of {totalDoses} Taken
            </span>
            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 tabular-nums">
            {percent}%
          </span>
        </div>
      </div>

      {activeSlots.length > 1 && (
        <div className="relative flex items-center bg-gray-100 p-1 rounded-xl text-xs font-medium text-gray-600 no-print" role="tablist">
          <span aria-hidden className="tab-pill" style={{ "--tabs": activeSlots.length + 1, "--i": currentFilter === "all" ? 0 : 1 + activeSlots.findIndex((x) => x.id === currentFilter) } as React.CSSProperties} />
          <button type="button" className={tabCls(currentFilter === "all")} onClick={() => setFilter("all")}>
            All ({activeSlots.reduce((n, s) => n + slotMeds(s.id).length, 0)})
          </button>
          {activeSlots.map((s) => (
            <button key={s.id} type="button" className={tabCls(currentFilter === s.id)} onClick={() => setFilter(s.id)}>
              {s.tab} ({slotMeds(s.id).length})
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {activeSlots
          .filter((s) => currentFilter === "all" || currentFilter === s.id)
          .map((s) => {
            const meds = slotMeds(s.id);
            return (
              <div key={s.id}>
                {card(s.title, s.time, s.icon, s.iconBg, meds.length, meds.map((m) => renderMed(m, `${s.id}-${m.name}`, true)))}
              </div>
            );
          })}

        {periodic.length > 0 &&
          currentFilter === "all" &&
          card(
            "Weekly / As-needed",
            "Not part of the daily routine",
            <CalendarDays className="w-4 h-4 text-blue-500" />,
            "bg-blue-50",
            periodic.length,
            periodic.map((m) => renderMed(m, `periodic-${m.name}`, false))
          )}
      </div>
    </div>
  );
}
