"use client";

import { useState } from "react";
import { Sun, Sunset, Moon, CalendarDays, HelpCircle, Utensils, CheckCircle2, Circle, OctagonAlert, Pill } from "lucide-react";
import { Medication, SafetyAlert } from "@/types/analysis";
import { Reveal } from "@/components/shared/Reveal";

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
  { id: "morning", title: "Morning Routine", time: "8:00 AM - 10:00 AM", tab: "Morning", iconBg: "bg-amber-50", icon: <Sun className="w-4 h-4 text-amber-500" /> },
  { id: "afternoon", title: "Afternoon Routine", time: "1:00 PM - 2:00 PM", tab: "Afternoon", iconBg: "bg-orange-50", icon: <Sunset className="w-4 h-4 text-orange-500" /> },
  { id: "night", title: "Night Routine", time: "8:00 PM - 10:00 PM", tab: "Night", iconBg: "bg-indigo-50", icon: <Moon className="w-4 h-4 text-indigo-500" /> },
];

const slotIcon = (id: SlotId) =>
  id === "morning" ? <Sun className="w-4 h-4 text-amber-500" /> : id === "afternoon" ? <Sunset className="w-4 h-4 text-orange-500" /> : <Moon className="w-4 h-4 text-indigo-500" />;

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
        className={`p-4 rounded-xl border transition-all duration-200 select-none space-y-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
          interactive ? "cursor-pointer" : ""
        } ${
          held
            ? "border-red-200 bg-white"
            : taken
            ? "bg-emerald-50/60 border-emerald-200"
            : "bg-white border-slate-200 hover:border-slate-300"
        } ${taken ? "animate-check-pop" : ""}`}
      >
        {held && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-1 uppercase tracking-wide">
            <OctagonAlert className="w-3.5 h-3.5 shrink-0" aria-hidden />
            Hold — ask your doctor first
          </span>
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            {interactive &&
              (taken ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <Circle className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" aria-hidden />
              ))}
            <div className="min-w-0">
              <h4 className={`text-sm font-bold leading-tight ${taken ? "line-through text-slate-400" : "text-slate-900"}`}>
                {med.name}
              </h4>
              <p className="text-[11px] text-slate-500">
                {med.generic_name} • <span className="text-slate-400">{med.drug_class}</span>
              </p>
            </div>
          </div>

          {med.confidence !== "high" && (
            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
              <HelpCircle className="w-2.5 h-2.5" />
              Verify handwriting
            </span>
          )}
        </div>

        <p className={`print-hide text-xs text-slate-500 italic ${interactive ? "pl-6" : ""}`}>&ldquo;{med.purpose}&rdquo;</p>

        <div className={`flex flex-wrap items-center gap-2 text-[11px] ${interactive ? "pl-6" : ""}`}>
          <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
            <Utensils className="w-3 h-3" aria-hidden />
            {med.food_instruction}
          </span>
          {duration && (
            <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              <CalendarDays className="w-3 h-3" aria-hidden />× {duration}
            </span>
          )}
          <span className="print-hide font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded text-[10px]">
            {med.raw_dosage}
          </span>
          {taken && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto">
              Taken
            </span>
          )}
        </div>

        {instructions && (
          <p className={`print-hide text-[11px] text-slate-500 leading-relaxed ${interactive ? "ml-6" : ""}`}>
            {instructions}
          </p>
        )}
      </div>
    );
  };

  const card = (title: string, sub: string, icon: React.ReactNode, iconBg: string, count: number, children: React.ReactNode) => (
    <div className="dash-card p-5 sm:p-6 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-500">{sub}</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
          {count} {count === 1 ? "pill" : "pills"}
        </span>
      </div>
      <div className="space-y-3 pt-1">{children}</div>
    </div>
  );

  const tabCls = (active: boolean) =>
    `relative z-10 flex-1 min-h-11 px-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
      active ? "text-slate-900 font-bold" : "hover:text-slate-900"
    }`;

  return (
    <div className="space-y-5">
      {/* Calm white header — title left, adherence right, no dark gradient */}
      <div className="dash-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600" aria-hidden>
              <Pill className="w-4.5 h-4.5" />
            </span>
            Daily Pill Timeline
          </h2>
          <p className="print-hide text-xs text-slate-500 mt-1">Tap a pill card to log the dose as taken</p>
        </div>
        <div className="print-hide flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0" role="img" aria-label={`${takenCount} of ${totalDoses} doses taken`}>
            <svg className="sev-ring h-14 w-14" viewBox="0 0 56 56">
              <circle className="ring-track" cx="28" cy="28" r="24" />
              <circle className="ring-value" cx="28" cy="28" r="24" stroke="#059669" strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 * (1 - percent / 100)} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900 tabular-nums">{percent}%</span>
          </div>
          <div>
            <span className="block text-sm font-bold text-slate-900 tabular-nums">{takenCount} of {totalDoses} taken</span>
            <span className="block text-[11px] text-slate-500">{totalDoses - takenCount} dose{totalDoses - takenCount === 1 ? "" : "s"} left today</span>
          </div>
        </div>
      </div>

      {/* Unified day timeline — quiet chips, HOLD in plain red text */}
      <div className="day-strip no-print flex gap-2 overflow-x-auto pb-1" aria-label="Today's doses in order">
        {activeSlots.flatMap((s) =>
          slotMeds(s.id).map((m) => {
            const held = isHeld(m, alerts);
            const key = `${s.id}-${m.name}`;
            const taken = !held && !!takenMap[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => !held && toggle(key)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  held
                    ? "border-red-200 bg-white"
                    : taken
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.id === "morning" ? "bg-amber-50" : s.id === "afternoon" ? "bg-orange-50" : "bg-indigo-50"}`} aria-hidden>
                  {slotIcon(s.id)}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.id} · {s.time.split(" - ")[0]}</span>
                  <span className={`block truncate text-xs font-bold ${taken ? "text-slate-400 line-through" : "text-slate-900"}`}>{m.name}</span>
                  <span className={`block text-[10px] font-semibold ${held ? "text-red-600" : taken ? "text-emerald-700" : "text-slate-500"}`}>
                    {held ? "Hold — ask doctor first" : taken ? "Taken" : "Tap to log taken"}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      {activeSlots.length > 1 && (
        <div className="relative flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-500 no-print" role="tablist">
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

      <div className="space-y-4">
        {activeSlots
          .filter((s) => currentFilter === "all" || currentFilter === s.id)
          .map((s, i) => {
            const meds = slotMeds(s.id);
            return (
              <Reveal key={s.id} from="left" delay={i * 100}>
                {card(s.title, s.time, s.icon, s.iconBg, meds.length, meds.map((m) => renderMed(m, `${s.id}-${m.name}`, true)))}
              </Reveal>
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
