import { describe, it, expect } from "vitest";
import {
  runDeterministicSafetyAudit,
  CLINICAL_REFERENCE_RANGES,
} from "@/lib/clinical-rules";
import { Medication, LabMarker } from "@/types/analysis";

describe("Deterministic Clinical Safety Rule Engine", () => {
  it("flags CRITICAL alert when an NSAID is prescribed with elevated Serum Creatinine", () => {
    const meds: Medication[] = [
      {
        name: "Ibuprofen 400mg",
        generic_name: "Ibuprofen",
        drug_class: "NSAID",
        purpose: "Pain relief",
        raw_dosage: "1-0-1 PC",
        schedule: { morning: true, afternoon: false, night: true },
        food_instruction: "Take after meals",
        confidence: "high",
      },
    ];

    const labs: LabMarker[] = [
      {
        test_name: "Serum Creatinine",
        value: 1.8,
        unit: "mg/dL",
        reference_range: "0.7 - 1.3",
        status: "HIGH",
        plain_meaning: "Reduced kidney filtration",
        confidence: "high",
      },
      {
        test_name: "eGFR",
        value: 52,
        unit: "mL/min/1.73m²",
        reference_range: "90 - 120",
        status: "LOW",
        plain_meaning: "Kidney filtration rate reduced",
        confidence: "high",
      },
    ];

    const alerts = runDeterministicSafetyAudit(meds, labs);
    expect(alerts.length).toBeGreaterThanOrEqual(1);

    const renalAlert = alerts.find((a) => a.severity === "CRITICAL" && a.type === "DRUG_LAB");
    expect(renalAlert).toBeDefined();
    expect(renalAlert?.title).toContain("Ibuprofen 400mg Contraindicated with Renal Impairment");
    expect(renalAlert?.explanation).toContain("prostaglandins");
  });

  it("flags CRITICAL alert when Metformin is prescribed with eGFR < 30 (Lactic Acidosis)", () => {
    const meds: Medication[] = [
      {
        name: "Metformin 500mg",
        generic_name: "Metformin",
        drug_class: "Biguanide",
        purpose: "Blood sugar control",
        raw_dosage: "1-0-1 PC",
        schedule: { morning: true, afternoon: false, night: true },
        food_instruction: "Take after meals",
        confidence: "high",
      },
    ];

    const labs: LabMarker[] = [
      {
        test_name: "eGFR",
        value: 26,
        unit: "mL/min/1.73m²",
        reference_range: "90 - 120",
        status: "LOW",
        plain_meaning: "Severely decreased kidney function",
        confidence: "high",
      },
    ];

    const alerts = runDeterministicSafetyAudit(meds, labs);
    const metforminCritical = alerts.find(
      (a) => a.severity === "CRITICAL" && a.title.includes("Metformin Contraindicated at eGFR < 30")
    );
    expect(metforminCritical).toBeDefined();
    expect(metforminCritical?.explanation).toContain("lactic acidosis");
  });

  it("flags WARNING when Metformin eGFR is between 30 and 45", () => {
    const meds: Medication[] = [
      {
        name: "Metformin 500mg",
        generic_name: "Metformin",
        drug_class: "Biguanide",
        purpose: "Blood sugar control",
        raw_dosage: "1-0-1 PC",
        schedule: { morning: true, afternoon: false, night: true },
        food_instruction: "Take after meals",
        confidence: "high",
      },
    ];

    const labs: LabMarker[] = [
      {
        test_name: "eGFR",
        value: 38,
        unit: "mL/min/1.73m²",
        reference_range: "90 - 120",
        status: "LOW",
        plain_meaning: "Moderately reduced kidney function",
        confidence: "high",
      },
    ];

    const alerts = runDeterministicSafetyAudit(meds, labs);
    const warningAlert = alerts.find(
      (a) => a.severity === "WARNING" && a.title.includes("Metformin Dose Reduction Required")
    );
    expect(warningAlert).toBeDefined();
  });

  it("flags WARNING when duplicate NSAIDs are concurrently prescribed", () => {
    const meds: Medication[] = [
      {
        name: "Ibuprofen 400mg",
        generic_name: "Ibuprofen",
        drug_class: "NSAID",
        purpose: "Pain relief",
        raw_dosage: "1-0-1",
        schedule: { morning: true, afternoon: false, night: true },
        food_instruction: "After food",
        confidence: "high",
      },
      {
        name: "Naproxen 250mg",
        generic_name: "Naproxen",
        drug_class: "NSAID",
        purpose: "Joint pain",
        raw_dosage: "1-0-0",
        schedule: { morning: true, afternoon: false, night: false },
        food_instruction: "After food",
        confidence: "high",
      },
    ];

    const alerts = runDeterministicSafetyAudit(meds, []);
    const dupAlert = alerts.find(
      (a) => a.type === "DRUG_DRUG" && a.title.includes("Duplicate NSAID")
    );
    expect(dupAlert).toBeDefined();
    expect(dupAlert?.severity).toBe("WARNING");
  });

  it("has valid reference ranges configured for clinical biomarkers", () => {
    expect(CLINICAL_REFERENCE_RANGES.creatinine.max).toBe(1.3);
    expect(CLINICAL_REFERENCE_RANGES.egfr.min).toBe(90);
    expect(CLINICAL_REFERENCE_RANGES.potassium.max).toBe(5.0);
  });
});
