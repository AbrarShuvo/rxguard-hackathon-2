// ============================================================
// RxGuard — Core Analysis Types
// Shared between API route, Gemini schema, and UI components
// ============================================================

export interface MedicationSchedule {
  morning: boolean;
  afternoon: boolean;
  night: boolean;
}

export interface Medication {
  name: string;
  generic_name: string;
  drug_class: string;
  purpose: string;
  raw_dosage: string;
  schedule: MedicationSchedule;
  food_instruction: string;
  special_instructions?: string;
  course_duration?: string;
  confidence: "high" | "medium" | "low";
}

export interface AlertPathway {
  biomarker_effect?: string;
  mechanism: string;
  outcome: string;
}

export interface LabMarker {
  test_name: string;
  value: number;
  unit: string;
  reference_range: string;
  status: "HIGH" | "LOW" | "NORMAL";
  plain_meaning: string;
  confidence: "high" | "medium" | "low";
}

export type AlertSeverity = "CRITICAL" | "WARNING" | "INFO";
export type AlertType = "DRUG_LAB" | "DRUG_DRUG" | "DOSAGE" | "GENERAL";

export interface SafetyAlert {
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  explanation: string;
  action: string;
  related_medication?: string;
  related_lab?: string;
  pathway?: AlertPathway;
}

export interface AnalysisResult {
  patient_summary: string;
  overall_risk_level: "CRITICAL" | "WARNING" | "LOW";
  medications: Medication[];
  lab_markers: LabMarker[];
  safety_alerts: SafetyAlert[];
  doctor_questions: string[];
  disclaimer: string;
}

// Upload payload sent from frontend to API
export interface AnalyzeRequest {
  prescriptionFile?: string; // base64
  prescriptionMimeType?: string;
  labReportFile?: string; // base64
  labReportMimeType?: string;
  isSampleCase?: "A" | "B";
  apiKey?: string;
}
