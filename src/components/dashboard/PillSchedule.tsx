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
  { id: "morning", title: "Morning", time: "8:00 AM - 10:00 AM", tab: "Morning", iconBg: "bg-amber-50", icon: <Sun className="w-4 h-4 text-amber-500" /> },
  { id: "afternoon", title: "Afternoon", time: "1:00 PM - 2:00 PM", tab: "Afternoon", iconBg: "bg-orange-50", icon: <Sunset className="w-4 h-4 text-orange-500" /> },
  { id: "night", title: "Night", time: "8:00 PM - 10:00 PM", tab: "Night", iconBg: "bg-[#0B5F51]/10", icon: <Moon className="w-4 h-4 text-[#0B5F51]" /> },
];

const slotIcon = (id: SlotId) =>
  id === "morning" ? <Sun className="w-4 h-4 text-amber-500" /> : id === "afternoon" ? <Sunset className="w-4 h-4 text-orange-500" /> : <Moon className="w-4 h-4 text-[#0B5F51]" />;

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
        className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 select-none space-y-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
          interactive ? "cursor-pointer" : ""
        } ${
          held
            ? "border-[#A44A3A]/30 border-l-4 border-l-[#A44A3A] bg-[#F6E9E4]/40"
            : taken
            ? "bg-emerald-50/60 border-emerald-200"
            : "bg-[#F4FBF6]/60 border-[#0B5F51]/15 hover:border-[#0B5F51]/25"
        } ${taken ? "animate-check-pop" : ""}`}
      >
        {held && (
          <div className="flex items-start gap-2.5 rounded-xl bg-[#A44A3A] px-3.5 py-2.5 text-white shadow-sm shadow-[#A44A3A]/25">
            <OctagonAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="leading-tight">
              <span className="block text-xs font-black uppercase tracking-wide">Hold — don&apos;t take this one</span>
              <span className="block text-[11px] text-[#F6E9E4] mt-0.5">Ask your doctor first before taking it again.</span>
            </p>
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            {interactive &&
              (taken ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <Circle className="w-4 h-4 mt-0.5 shrink-0 text-[#9DB3A8]" aria-hidden />
              ))}
            <div className="min-w-0">
              <h4 className={`text-base font-extrabold leading-tight ${taken ? "line-through text-[#7A938A]" : held ? "text-[#7A3327]" : "text-[#0B1F1B]"}`}>
                {med.name}
              </h4>
              {/* Dose first, big and plain — this is what you actually take */}
              <p className={`text-sm font-bold mt-0.5 ${taken ? "text-[#7A938A]" : "text-[#2C4A42]"}`}>
                {med.raw_dosage}
              </p>
              <p className="text-[11px] text-[#5A7268] mt-0.5">
                {med.generic_name} • <span className="text-[#7A938A]">{med.drug_class}</span>
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

        <p className={`print-hide text-xs text-[#5A7268] italic ${interactive ? "pl-6" : ""}`}>&ldquo;{med.purpose}&rdquo;</p>

        <div className={`flex flex-wrap items-center gap-2 text-[11px] ${interactive ? "pl-6" : ""}`}>
          <span className="inline-flex items-center gap-1 font-medium text-[#3D5A50] bg-[#EFFAF3] px-2 py-0.5 rounded-full border border-[#0B5F51]/10">
            <Utensils className="w-3 h-3" aria-hidden />
            {med.food_instruction}
          </span>
          {duration && (
            <span className="inline-flex items-center gap-1 font-medium text-[#3D5A50] bg-[#EFFAF3] px-2 py-0.5 rounded-full border border-[#0B5F51]/10">
              <CalendarDays className="w-3 h-3" aria-hidden />× {duration}
            </span>
          )}
          {taken && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto">
              Taken
            </span>
          )}
        </div>

        {instructions && (
          <p className={`print-hide text-[11px] text-[#5A7268] leading-relaxed ${interactive ? "ml-6" : ""}`}>
            {instructions}
          </p>
        )}
      </div>
    );
  };

  /* Slot card — the time is the headline, big and scannable. */
  const card = (eyebrow: string, bigTime: string, icon: React.ReactNode, iconBg: string, count: number, children: React.ReactNode) => (
    <div className="dash-card p-5 sm:p-6 space-y-3">
      <div className="flex items-center justify-between border-b border-[#0B5F51]/10 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7A938A]">{eyebrow}</p>
            <h3 className="text-2xl font-black text-[#0B1F1B] tabular-nums leading-none mt-1">{bigTime}</h3>
          </div>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#E3F2E9] text-[#5A7268]">
          {count} {count === 1 ? "pill" : "pills"}
        </span>
      </div>
      <div className="space-y-3 pt-1">{children}</div>
    </div>
  );

  const tabCls = (active: boolean) =>
    `relative z-10 flex-1 min-h-11 px-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
      active ? "text-[#0B1F1B] font-bold" : "hover:text-[#0B1F1B]"
    }`;

  return (
    <div className="space-y-5">
      {/* Calm white header — title left, adherence right, no dark gradient */}
      <div className="dash-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0B1F1B] flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600" aria-hidden>
              <Pill className="w-4.5 h-4.5" />
            </span>
            Your day, planned
          </h2>
          <p className="print-hide text-xs text-[#5A7268] mt-1">Your medicines, in the order you take them — tap a pill when you&apos;ve taken it</p>
        </div>
        <div className="print-hide flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0" role="img" aria-label={`${takenCount} of ${totalDoses} doses taken`}>
            <svg className="sev-ring h-14 w-14" viewBox="0 0 56 56">
              <circle className="ring-track" cx="28" cy="28" r="24" />
              <circle className="ring-value" cx="28" cy="28" r="24" stroke="#059669" strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 * (1 - percent / 100)} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#0B1F1B] tabular-nums">{percent}%</span>
          </div>
          <div>
            <span className="block text-sm font-bold text-[#0B1F1B] tabular-nums">{takenCount} of {totalDoses} taken</span>
            <span className="block text-[11px] text-[#5A7268]">{totalDoses - takenCount} left today</span>
          </div>
        </div>
      </div>

      {/* Today at a glance — horizontal strip, with a fade + hint so the scroll is obvious */}
      <div className="no-print">
        <div className="flex items-baseline justify-between pb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A938A]">Today at a glance</p>
          <p className="text-[11px] font-semibold text-[#7A938A]">Scroll for more →</p>
        </div>
        <div className="relative">
          <div className="day-strip flex gap-2 overflow-x-auto pb-1" aria-label="Today's doses in order">
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
                    ? "border-[#A44A3A]/25 bg-[#F4FBF6]"
                    : taken
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-[#0B5F51]/15 bg-[#F4FBF6] hover:border-[#0B5F51]/25"
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.id === "morning" ? "bg-amber-50" : s.id === "afternoon" ? "bg-orange-50" : "bg-[#0B5F51]/10"}`} aria-hidden>
                  {slotIcon(s.id)}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#7A938A]">{s.id} · {s.time.split(" - ")[0]}</span>
                  <span className={`block truncate text-xs font-bold ${taken ? "text-[#7A938A] line-through" : "text-[#0B1F1B]"}`}>{m.name}</span>
                  <span className={`block text-[10px] font-semibold ${held ? "text-[#A44A3A]" : taken ? "text-emerald-700" : "text-[#5A7268]"}`}>
                    {held ? "Hold — ask doctor first" : taken ? "Taken" : "Tap when taken"}
                  </span>
                </span>
              </button>
            );
          })
        )}
          </div>
          {/* Right-edge fade — signals there is more to scroll to */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#F0FBEF] to-transparent" aria-hidden />
        </div>
      </div>

      {activeSlots.length > 1 && (
        <div className="relative flex items-center bg-[#E3F2E9] p-1 rounded-xl text-xs font-medium text-[#5A7268] no-print" role="tablist">
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
                {card(s.title, s.time.split(" - ")[0], s.icon, s.iconBg, meds.length, meds.map((m) => renderMed(m, `${s.id}-${m.name}`, true)))}
              </Reveal>
            );
          })}

        {periodic.length > 0 &&
          currentFilter === "all" &&
          card(
            "Not every day",
            "Weekly",
            <CalendarDays className="w-4 h-4 text-[#0B5F51]" />,
            "bg-[#E3F2E9]",
            periodic.length,
            periodic.map((m) => renderMed(m, `periodic-${m.name}`, false))
          )}
      </div>
    </div>
  );
}
