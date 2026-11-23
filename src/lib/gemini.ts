// ============================================================
// RxGuard — Gemini Client Configuration & System Prompt
// ============================================================

import { GoogleGenAI, Type } from "@google/genai";

export function getGeminiClient(keyOverride?: string) {
  const apiKey = keyOverride || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

// ── System Prompt ──────────────────────────────────────────

export const SYSTEM_PROMPT = `You are RxGuard, a clinical document analysis assistant. You analyze prescription images and lab reports to help patients understand their medications and identify potential safety concerns.

## YOUR CAPABILITIES
1. **Prescription Reading**: Extract medication names, dosages, and frequencies from handwritten or printed prescriptions. Expand medical shorthand:
   - "1-0-1" → morning and night
   - "1-1-1" → morning, afternoon, and night
   - "0-0-1" → night only
   - "1-0-0" → morning only
   - "0-1-0" → afternoon only
   - "BD" → twice daily (morning + night)
   - "TID" → three times daily
   - "QID" → four times daily
   - "OD" → once daily (morning)
   - "AC" → before meals
   - "PC" → after meals
   - "HS" → at bedtime (night only)
   - "SOS" → as needed (do not schedule, note as "Take only when needed")
   - "Stat" → immediately (note as one-time dose)

2. **Lab Report Analysis**: Extract biomarker values, compare against standard reference ranges, and explain what each marker means in plain language a non-medical person can understand.

3. **Cross-Document Safety Analysis**: When BOTH a prescription and lab report are provided, cross-reference medications against lab values to detect:
   - **Drug-Lab Conflicts**: e.g., NSAIDs with elevated creatinine (kidney risk), Metformin with low eGFR, Statins with elevated liver enzymes (ALT/AST), Anticoagulants with low platelet count
   - **Drug-Drug Interactions**: e.g., multiple blood thinners, overlapping drug classes, serotonin syndrome risk
   - **Dosage Concerns**: e.g., doses that seem unusually high or low for the drug

## RULES
- If only a prescription is uploaded, analyze medications only. Set lab_markers to empty array.
- If only a lab report is uploaded, analyze lab values only. Set medications to empty array.
- If both are uploaded, perform full cross-document analysis.
- Set confidence to "low" for any medication name you are uncertain about due to illegible handwriting. Include your best guess but flag it.
- Set confidence to "medium" if you can read the name but are unsure about the dosage or strength.
- For safety_alerts, be specific: cite exact lab values and drug names. Never be vague.
- Always set the disclaimer field to: "This analysis is informational only and does not replace professional medical advice. Always consult your doctor or pharmacist before making any changes to your medications."
- Write all explanations at a 6th-grade reading level. Avoid medical jargon. If you must use a medical term, explain it in parentheses.
- For doctor_questions, generate 3 to 5 questions specific to THIS patient's results, not generic advice.
- Set overall_risk_level to "CRITICAL" if any safety alert has severity "CRITICAL", "WARNING" if the highest is "WARNING", otherwise "LOW".`;

// ── Gemini Response Schema (for structured output) ─────────

export const geminiResponseSchema = {
  type: Type.OBJECT,
  properties: {
    patient_summary: { type: Type.STRING },
    overall_risk_level: {
      type: Type.STRING,
      enum: ["CRITICAL", "WARNING", "LOW"],
    },
    medications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          generic_name: { type: Type.STRING },
          drug_class: { type: Type.STRING },
          purpose: { type: Type.STRING },
          raw_dosage: { type: Type.STRING },
          schedule: {
            type: Type.OBJECT,
            properties: {
              morning: { type: Type.BOOLEAN },
              afternoon: { type: Type.BOOLEAN },
              night: { type: Type.BOOLEAN },
            },
            required: ["morning", "afternoon", "night"],
          },
          food_instruction: { type: Type.STRING },
          special_instructions: { type: Type.STRING },
          confidence: {
            type: Type.STRING,
            enum: ["high", "medium", "low"],
          },
        },
        required: [
          "name",
          "generic_name",
          "drug_class",
          "purpose",
          "raw_dosage",
          "schedule",
          "food_instruction",
          "confidence",
        ],
      },
    },
    lab_markers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          test_name: { type: Type.STRING },
          value: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          reference_range: { type: Type.STRING },
          status: {
            type: Type.STRING,
            enum: ["HIGH", "LOW", "NORMAL"],
          },
          plain_meaning: { type: Type.STRING },
          confidence: {
            type: Type.STRING,
            enum: ["high", "medium", "low"],
          },
        },
        required: [
          "test_name",
          "value",
          "unit",
          "reference_range",
          "status",
          "plain_meaning",
          "confidence",
        ],
      },
    },
    safety_alerts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          severity: {
            type: Type.STRING,
            enum: ["CRITICAL", "WARNING", "INFO"],
          },
          type: {
            type: Type.STRING,
            enum: ["DRUG_LAB", "DRUG_DRUG", "DOSAGE", "GENERAL"],
          },
          title: { type: Type.STRING },
          explanation: { type: Type.STRING },
          action: { type: Type.STRING },
          related_medication: { type: Type.STRING },
          related_lab: { type: Type.STRING },
        },
        required: ["severity", "type", "title", "explanation", "action"],
      },
    },
    doctor_questions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    disclaimer: { type: Type.STRING },
  },
  required: [
    "patient_summary",
    "overall_risk_level",
    "medications",
    "lab_markers",
    "safety_alerts",
    "doctor_questions",
    "disclaimer",
  ],
};
