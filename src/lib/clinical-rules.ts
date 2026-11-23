// ============================================================================
// RxGuard — Deterministic Clinical Rule Engine
// Dual-layer safety: Evaluates clinical contraindications deterministically
// alongside Gemini multimodal extraction for defense-in-depth.
// ============================================================================

import { Medication, LabMarker, SafetyAlert, MedicationSchedule } from "@/types/analysis";

// Recognized NSAIDs
export const NSAID_LIST = [
  "ibuprofen",
  "naproxen",
  "diclofenac",
  "ketorolac",
  "meloxicam",
  "celecoxib",
  "indomethacin",
  "piroxicam",
  "etoricoxib",
  "aspirin",
  "mefenamic acid",
];

// Recognized Statins
export const STATIN_LIST = [
  "atorvastatin",
  "rosuvastatin",
  "simvastatin",
  "pravastatin",
  "lovastatin",
  "pitavastatin",
];

// Recognized Biguanides
export const BIGUANIDE_LIST = ["metformin", "glucophage"];

// Recognized ACE Inhibitors and ARBs
export const RAAS_INHIBITORS = [
  "lisinopril",
  "enalapril",
  "ramipril",
  "losartan",
  "valsartan",
  "telmisartan",
  "candesartan",
];

// Recognized Blood Thinners / Anticoagulants
export const ANTICOAGULANT_LIST = [
  "warfarin",
  "apixaban",
  "rivaroxaban",
  "dabigatran",
  "clopidogrel",
  "heparin",
];

/**
 * Standard reference ranges for deterministic validation
 */
export const CLINICAL_REFERENCE_RANGES: Record<
  string,
  { min: number; max: number; unit: string; criticalHigh?: number; criticalLow?: number }
> = {
  creatinine: { min: 0.7, max: 1.3, unit: "mg/dL", criticalHigh: 2.0 },
  egfr: { min: 90, max: 120, unit: "mL/min/1.73m²", criticalLow: 30 },
  bun: { min: 7, max: 20, unit: "mg/dL", criticalHigh: 35 },
  fasting_glucose: { min: 70, max: 100, unit: "mg/dL", criticalHigh: 180, criticalLow: 54 },
  hba1c: { min: 4.0, max: 5.6, unit: "%", criticalHigh: 9.0 },
  potassium: { min: 3.5, max: 5.0, unit: "mEq/L", criticalHigh: 5.5, criticalLow: 3.0 },
  sodium: { min: 135, max: 145, unit: "mEq/L", criticalHigh: 155, criticalLow: 125 },
  alt: { min: 7, max: 56, unit: "U/L", criticalHigh: 150 },
  ast: { min: 10, max: 40, unit: "U/L", criticalHigh: 150 },
  hemoglobin_male: { min: 13.8, max: 17.2, unit: "g/dL", criticalLow: 8.0 },
  hemoglobin_female: { min: 12.1, max: 15.1, unit: "g/dL", criticalLow: 8.0 },
  platelets: { min: 150000, max: 450000, unit: "/uL", criticalLow: 50000 },
  total_cholesterol: { min: 125, max: 200, unit: "mg/dL" },
  ldl_cholesterol: { min: 50, max: 100, unit: "mg/dL" },
  hdl_cholesterol: { min: 40, max: 60, unit: "mg/dL" },
};

/**
 * Parses Latin / Clinical dosage shorthand into structured schedule
 */
export function parseDosageShorthand(shorthand: string): {
  schedule: MedicationSchedule;
  foodInstruction: string;
  isAsNeeded: boolean;
  isOnceWeekly: boolean;
} {
  const normalized = shorthand.trim().toUpperCase();
  const schedule: MedicationSchedule = { morning: false, afternoon: false, night: false };
  let foodInstruction = "Take with or without food";
  let isAsNeeded = false;
  let isOnceWeekly = false;

  // Meal timing
  if (normalized.includes("AC") || normalized.includes("BEFORE MEAL") || normalized.includes("BEFORE FOOD")) {
    foodInstruction = "Take before meals (on an empty stomach)";
  } else if (normalized.includes("PC") || normalized.includes("AFTER MEAL") || normalized.includes("AFTER FOOD")) {
    foodInstruction = "Take after meals (with food to reduce stomach irritation)";
  }

  // PRN / SOS
  if (normalized.includes("SOS") || normalized.includes("PRN") || normalized.includes("AS NEEDED")) {
    isAsNeeded = true;
    foodInstruction += " (Take only when needed for symptoms)";
  }

  // Weekly dosing (e.g. Vitamin D3)
  if (normalized.includes("WEEKLY") || normalized.includes("ONCE A WEEK") || normalized.includes("Q7D")) {
    isOnceWeekly = true;
    schedule.morning = true;
    return { schedule, foodInstruction: "Take once weekly with a meal containing healthy fats", isAsNeeded, isOnceWeekly };
  }

  // 1-0-1 pattern or variations
  const threePartPattern = /^(\d+)[-–/](\d+)[-–/](\d+)/;
  const match = normalized.match(threePartPattern);
  if (match) {
    const m = parseInt(match[1], 10);
    const a = parseInt(match[2], 10);
    const n = parseInt(match[3], 10);
    schedule.morning = m > 0;
    schedule.afternoon = a > 0;
    schedule.night = n > 0;
    if (normalized.includes("HS") || normalized.includes("BEDTIME") || normalized.includes("NOCTE")) {
      foodInstruction = "Take at bedtime";
    }
    return { schedule, foodInstruction, isAsNeeded, isOnceWeekly };
  }

  // Latin abbreviations
  if (normalized.includes("BD") || normalized.includes("BID") || normalized.includes("TWICE")) {
    schedule.morning = true;
    schedule.night = true;
  } else if (normalized.includes("TID") || normalized.includes("TDS") || normalized.includes("THREE TIMES")) {
    schedule.morning = true;
    schedule.afternoon = true;
    schedule.night = true;
  } else if (normalized.includes("QID") || normalized.includes("FOUR TIMES")) {
    schedule.morning = true;
    schedule.afternoon = true;
    schedule.night = true;
  } else if (normalized.includes("OD") || normalized.includes("ONCE DAILY") || normalized.includes("MANE")) {
    schedule.morning = true;
  } else if (normalized.includes("HS") || normalized.includes("NOCTE") || normalized.includes("AT BEDTIME")) {
    schedule.night = true;
    if (!foodInstruction.includes("before")) {
      foodInstruction = "Take at bedtime";
    }
  } else {
    // Default fallback
    schedule.morning = true;
  }

  return { schedule, foodInstruction, isAsNeeded, isOnceWeekly };
}

/**
 * Deterministic Cross-Document Safety Checker
 * Audits extracted medications and biomarkers against clinical guidelines.
 */
export function runDeterministicSafetyAudit(
  medications: Medication[],
  labMarkers: LabMarker[]
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];

  // Helper lookups
  const hasMarker = (key: string) => {
    return labMarkers.find(
      (m) =>
        m.test_name.toLowerCase().includes(key) ||
        (key === "egfr" && m.test_name.toLowerCase().includes("gfr")) ||
        (key === "creatinine" && m.test_name.toLowerCase().includes("creatinine")) ||
        (key === "glucose" && m.test_name.toLowerCase().includes("glucose"))
    );
  };

  const hasDrug = (drugs: string[]) => {
    return medications.find((m) =>
      drugs.some(
        (d) =>
          m.generic_name.toLowerCase().includes(d) ||
          m.name.toLowerCase().includes(d) ||
          m.drug_class.toLowerCase().includes(d)
      )
    );
  };

  const creatinine = hasMarker("creatinine");
  const egfr = hasMarker("egfr");
  const potassium = hasMarker("potassium");
  const alt = hasMarker("alt");
  const ast = hasMarker("ast");
  const platelets = hasMarker("platelet");

  // ── RULE 1: NSAID + Renal Impairment ─────────────────────────────────────
  const nsaidMed = hasDrug(NSAID_LIST);
  if (nsaidMed) {
    const isElevatedCreatinine = creatinine && creatinine.value > 1.3;
    const isReducedEgfr = egfr && egfr.value < 60;

    if (isElevatedCreatinine || isReducedEgfr) {
      alerts.push({
        severity: "CRITICAL",
        type: "DRUG_LAB",
        title: `CRITICAL: ${nsaidMed.name} Contraindicated with Renal Impairment`,
        explanation: `${nsaidMed.name} is an NSAID that inhibits renal prostaglandins, reducing blood flow to kidney glomeruli. Your lab indicates kidney stress (Creatinine: ${creatinine?.value ?? "elevated"} ${creatinine?.unit ?? ""}, eGFR: ${egfr?.value ?? "low"} ${egfr?.unit ?? ""}). This combination carries high risk of acute kidney injury (AKI).`,
        action:
          "Withhold this medication immediately until consulting your prescribing physician or nephrologist. Inquire about kidney-safe analgesics such as Acetaminophen/Paracetamol or topical formulations.",
        related_medication: nsaidMed.name,
        related_lab: `${creatinine ? `Creatinine (${creatinine.value} ${creatinine.unit})` : ""} ${egfr ? `eGFR (${egfr.value} ${egfr.unit})` : ""}`.trim(),
      });
    }
  }

  // ── RULE 2: Metformin + eGFR Thresholds ──────────────────────────────────
  const metforminMed = hasDrug(BIGUANIDE_LIST);
  if (metforminMed && egfr) {
    if (egfr.value < 30) {
      alerts.push({
        severity: "CRITICAL",
        type: "DRUG_LAB",
        title: `CRITICAL: Metformin Contraindicated at eGFR < 30`,
        explanation: `Your eGFR is ${egfr.value} ${egfr.unit}. Metformin is strictly contraindicated at eGFR below 30 mL/min/1.73m² due to severe risk of fatal lactic acidosis.`,
        action: "Cease Metformin and contact your endocrinologist/physician immediately for alternative glycemic management.",
        related_medication: metforminMed.name,
        related_lab: `eGFR: ${egfr.value} ${egfr.unit}`,
      });
    } else if (egfr.value < 45) {
      alerts.push({
        severity: "WARNING",
        type: "DRUG_LAB",
        title: `WARNING: Metformin Dose Reduction Required for eGFR 30–44`,
        explanation: `Your eGFR is ${egfr.value} ${egfr.unit}. Guidelines (KDIGO/ADA) recommend maximum 1000mg daily of Metformin and frequent renal monitoring when eGFR is between 30 and 45.`,
        action: "Request your physician recalculate your Metformin dose and schedule repeat renal testing in 3 months.",
        related_medication: metforminMed.name,
        related_lab: `eGFR: ${egfr.value} ${egfr.unit}`,
      });
    }
  }

  // ── RULE 3: RAAS Inhibitors + Hyperkalemia ──────────────────────────────
  const raasMed = hasDrug(RAAS_INHIBITORS);
  if (raasMed && potassium && potassium.value > 5.2) {
    alerts.push({
      severity: "CRITICAL",
      type: "DRUG_LAB",
      title: `CRITICAL: Hyperkalemia with RAAS Inhibitor (${raasMed.name})`,
      explanation: `Your Serum Potassium is elevated at ${potassium.value} ${potassium.unit} (normal is 3.5–5.0). ${raasMed.name} decreases potassium excretion, increasing risk of life-threatening cardiac arrhythmias.`,
      action: "Seek urgent medical evaluation. Avoid high-potassium foods and salt substitutes containing potassium chloride.",
      related_medication: raasMed.name,
      related_lab: `Potassium: ${potassium.value} ${potassium.unit}`,
    });
  }

  // ── RULE 4: Statins + Transaminitis (Liver Inflammation) ─────────────────
  const statinMed = hasDrug(STATIN_LIST);
  if (statinMed && ((alt && alt.value > 120) || (ast && ast.value > 120))) {
    alerts.push({
      severity: "WARNING",
      type: "DRUG_LAB",
      title: `WARNING: Elevated Liver Transaminases with Statin (${statinMed.name})`,
      explanation: `Your liver enzymes are notably elevated (ALT: ${alt?.value ?? "N/A"}, AST: ${ast?.value ?? "N/A"}). Statins can exacerbate hepatic inflammation.`,
      action: "Contact your physician to evaluate liver function panel and consider statin dose holiday or alternative lipid therapy.",
      related_medication: statinMed.name,
      related_lab: `ALT/AST`,
    });
  }

  // ── RULE 5: Anticoagulant + Low Platelets ────────────────────────────────
  const anticoagulantMed = hasDrug(ANTICOAGULANT_LIST);
  if (anticoagulantMed && platelets && platelets.value < 80000) {
    alerts.push({
      severity: "CRITICAL",
      type: "DRUG_LAB",
      title: `CRITICAL: Thrombocytopenia with Blood Thinner (${anticoagulantMed.name})`,
      explanation: `Your platelet count is critically low at ${platelets.value} ${platelets.unit}. Concomitant use of ${anticoagulantMed.name} severely elevates the risk of spontaneous hemorrhages.`,
      action: "Immediate medical assessment required. Watch for unexplained bruising, petechiae, or gastrointestinal bleeding.",
      related_medication: anticoagulantMed.name,
      related_lab: `Platelets: ${platelets.value} ${platelets.unit}`,
    });
  }

  // ── RULE 6: Drug-Drug Duplication (Two NSAIDs or Two Statins) ────────────
  const nsaidsFound = medications.filter((m) =>
    NSAID_LIST.some((d) => m.generic_name.toLowerCase().includes(d) || m.name.toLowerCase().includes(d))
  );
  if (nsaidsFound.length > 1) {
    alerts.push({
      severity: "WARNING",
      type: "DRUG_DRUG",
      title: "WARNING: Duplicate NSAID Painkiller Therapy Detected",
      explanation: `Multiple NSAIDs (${nsaidsFound.map((m) => m.name).join(", ")}) are concurrently prescribed. Dual NSAID therapy doubles gastric ulceration and renal toxicity risk without improving analgesia.`,
      action: "Ask your physician or pharmacist to consolidate to a single appropriate analgesic.",
    });
  }

  return alerts;
}
