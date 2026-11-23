// ============================================================
// RxGuard — Zod Validation Schema
// Validates Gemini's JSON output on the server
// ============================================================

import { z } from "zod";

export const MedicationScheduleSchema = z.object({
  morning: z.boolean(),
  afternoon: z.boolean(),
  night: z.boolean(),
});

export const MedicationSchema = z.object({
  name: z.string(),
  generic_name: z.string(),
  drug_class: z.string(),
  purpose: z.string(),
  raw_dosage: z.string(),
  schedule: MedicationScheduleSchema,
  food_instruction: z.string(),
  special_instructions: z.string().optional().default(""),
  confidence: z.enum(["high", "medium", "low"]),
});

export const LabMarkerSchema = z.object({
  test_name: z.string(),
  value: z.number(),
  unit: z.string(),
  reference_range: z.string(),
  status: z.enum(["HIGH", "LOW", "NORMAL"]),
  plain_meaning: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

export const SafetyAlertSchema = z.object({
  severity: z.enum(["CRITICAL", "WARNING", "INFO"]),
  type: z.enum(["DRUG_LAB", "DRUG_DRUG", "DOSAGE", "GENERAL"]),
  title: z.string(),
  explanation: z.string(),
  action: z.string(),
  related_medication: z.string().optional().default(""),
  related_lab: z.string().optional().default(""),
});

export const AnalysisResultSchema = z.object({
  patient_summary: z.string(),
  overall_risk_level: z.enum(["CRITICAL", "WARNING", "LOW"]),
  medications: z.array(MedicationSchema),
  lab_markers: z.array(LabMarkerSchema),
  safety_alerts: z.array(SafetyAlertSchema),
  doctor_questions: z.array(z.string()),
  disclaimer: z.string(),
});
