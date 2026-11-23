// ============================================================
// RxGuard — Sample Datasets for One-Click Judge Demos
// Case A: Critical Renal-NSAID Conflict (the "wow" demo)
// Case B: Routine Multi-Medication Prescription & Blood Panel
// ============================================================

import { AnalysisResult } from "@/types/analysis";

export const SAMPLE_CASE_A: AnalysisResult = {
  patient_summary:
    "Your prescription contains 3 medications including a painkiller (Ibuprofen) and a diabetes medicine (Metformin). Your lab report reveals your kidneys are under stress with elevated creatinine and reduced filtration, which creates a critical safety concern with one of your prescribed medicines.",
  overall_risk_level: "CRITICAL",
  medications: [
    {
      name: "Ibuprofen 400mg",
      generic_name: "Ibuprofen",
      drug_class: "NSAID",
      purpose: "Reduces pain and swelling in joints and muscles",
      raw_dosage: "1-0-1 PC",
      course_duration: "5 days",
      schedule: { morning: true, afternoon: false, night: true },
      food_instruction: "Take after meals",
      special_instructions: "Take with a full glass of water. Do not lie down for 10 minutes after taking.",
      confidence: "high",
    },
    {
      name: "Metformin 500mg",
      generic_name: "Metformin",
      drug_class: "Biguanide",
      purpose: "Helps control blood sugar levels in Type 2 diabetes",
      raw_dosage: "1-0-1 PC",
      schedule: { morning: true, afternoon: false, night: true },
      food_instruction: "Take after meals",
      special_instructions: "Swallow whole. Do not crush or chew extended-release tablets.",
      confidence: "high",
    },
    {
      name: "Atorvastatin 10mg",
      generic_name: "Atorvastatin",
      drug_class: "Statin",
      purpose: "Lowers bad cholesterol and protects your heart",
      raw_dosage: "0-0-1 HS",
      schedule: { morning: false, afternoon: false, night: true },
      food_instruction: "Take after dinner at bedtime",
      special_instructions: "Avoid consuming large amounts of grapefruit juice while taking this medication.",
      confidence: "high",
    },
  ],
  lab_markers: [
    {
      test_name: "Serum Creatinine",
      value: 1.8,
      unit: "mg/dL",
      reference_range: "0.7 - 1.3",
      status: "HIGH",
      plain_meaning:
        "Your kidneys are not filtering waste as efficiently as they should. Normal levels are below 1.3 mg/dL.",
      confidence: "high",
    },
    {
      test_name: "eGFR (Estimated Kidney Filtration)",
      value: 52,
      unit: "mL/min/1.73m²",
      reference_range: "90 - 120",
      status: "LOW",
      plain_meaning:
        "Your kidney filtration rate is moderately reduced. Values below 60 indicate reduced kidney function.",
      confidence: "high",
    },
    {
      test_name: "Blood Urea Nitrogen (BUN)",
      value: 28,
      unit: "mg/dL",
      reference_range: "7 - 20",
      status: "HIGH",
      plain_meaning:
        "Confirms your kidneys are working harder than normal to clear waste products from your blood.",
      confidence: "high",
    },
    {
      test_name: "Fasting Blood Glucose",
      value: 142,
      unit: "mg/dL",
      reference_range: "70 - 100",
      status: "HIGH",
      plain_meaning:
        "Your blood sugar is above the normal range. Your Metformin is prescribed to help manage this.",
      confidence: "high",
    },
    {
      test_name: "Hemoglobin",
      value: 13.8,
      unit: "g/dL",
      reference_range: "13.0 - 17.0",
      status: "NORMAL",
      plain_meaning:
        "Your red blood cell count is healthy. No signs of anemia.",
      confidence: "high",
    },
  ],
  safety_alerts: [
    {
      severity: "CRITICAL",
      type: "DRUG_LAB",
      title: "NSAID Prescribed with Impaired Kidney Function",
      explanation:
        "Ibuprofen (an NSAID painkiller) reduces blood flow to your kidneys. Your Serum Creatinine is 1.8 mg/dL (normal: 0.7-1.3) and your eGFR is 52 mL/min (normal: 90+), showing your kidneys are already stressed. Taking Ibuprofen could further damage kidney function.",
      action:
        "Do NOT take Ibuprofen until you speak with your doctor. Ask about kidney-safe pain alternatives such as Acetaminophen (Paracetamol).",
      related_medication: "Ibuprofen 400mg",
      related_lab: "Serum Creatinine (1.8 mg/dL), eGFR (52 mL/min)",
      pathway: {
        mechanism: "Reduces kidney blood flow",
        biomarker_effect: "Kidney filtration already reduced",
        outcome: "Acute kidney injury",
      },
    },
    {
      severity: "WARNING",
      type: "DRUG_LAB",
      title: "Metformin Monitoring Recommended with Reduced eGFR",
      explanation:
        "Metformin is processed by the kidneys. When eGFR drops below 45, the dose usually needs to be reduced. Your eGFR is currently 52, which is approaching this safety threshold.",
      action:
        "Ask your doctor to check whether your Metformin 500mg twice daily dose needs adjustment based on your kidney function.",
      related_medication: "Metformin 500mg",
      related_lab: "eGFR (52 mL/min)",
      pathway: {
        mechanism: "Reduced drug clearance",
        biomarker_effect: "Kidney filtration lowered",
        outcome: "Lactic acidosis risk",
      },
    },
    {
      severity: "INFO",
      type: "GENERAL",
      title: "Elevated Fasting Glucose — Review Lifestyle & Medication",
      explanation:
        "Your fasting glucose of 142 mg/dL is above the target range of 70-100 mg/dL. While Metformin helps, your doctor may suggest dietary changes or a dose review.",
      action:
        "Share this glucose reading at your next doctor visit for possible treatment fine-tuning.",
      related_medication: "Metformin 500mg",
      related_lab: "Fasting Blood Glucose (142 mg/dL)",
    },
  ],
  doctor_questions: [
    "My creatinine is 1.8 mg/dL and eGFR is 52 — is Ibuprofen safe for my kidneys, or should I switch to Paracetamol?",
    "Should my Metformin dosage be adjusted since my eGFR is getting close to the 45 threshold?",
    "How often should I have my kidney function (creatinine and eGFR) rechecked?",
    "My fasting glucose is 142 mg/dL on Metformin — do we need to modify my diet plan or dosage?",
    "Are there any specific foods, drinks, or OTC medicines I should avoid to protect my kidneys?",
  ],
  disclaimer:
    "This analysis is informational only and does not replace professional medical advice. Always consult your doctor or pharmacist before making any changes to your medications.",
};

export const SAMPLE_CASE_B: AnalysisResult = {
  patient_summary:
    "Your prescription contains 4 medications for blood pressure, acid reflux, blood sugar, and bone health. Your lab report is mostly healthy with slightly elevated LDL cholesterol, but no dangerous drug-to-lab conflicts were detected.",
  overall_risk_level: "WARNING",
  medications: [
    {
      name: "Amlodipine 5mg",
      generic_name: "Amlodipine",
      drug_class: "Calcium Channel Blocker",
      purpose: "Relaxes blood vessels to lower high blood pressure",
      raw_dosage: "1-0-0 AC",
      schedule: { morning: true, afternoon: false, night: false },
      food_instruction: "Take before breakfast",
      special_instructions: "Try to take it at the same time each morning.",
      confidence: "high",
    },
    {
      name: "Pantoprazole 40mg",
      generic_name: "Pantoprazole",
      drug_class: "Proton Pump Inhibitor (PPI)",
      purpose: "Reduces stomach acid to treat heartburn and protect the stomach",
      raw_dosage: "1-0-0 AC",
      schedule: { morning: true, afternoon: false, night: false },
      food_instruction: "Take 30 minutes before breakfast",
      special_instructions: "Swallow whole with water. Do not crush or chew.",
      confidence: "high",
    },
    {
      name: "Metformin 500mg",
      generic_name: "Metformin",
      drug_class: "Biguanide",
      purpose: "Controls blood sugar levels",
      raw_dosage: "0-0-1 PC",
      schedule: { morning: false, afternoon: false, night: true },
      food_instruction: "Take after dinner",
      special_instructions: "Take with food to minimize stomach upset.",
      confidence: "high",
    },
    {
      name: "Vitamin D3 60,000 IU",
      generic_name: "Cholecalciferol",
      drug_class: "Vitamin Supplement",
      purpose: "Strengthens bones and supports immune health",
      raw_dosage: "Once weekly PC",
      schedule: { morning: true, afternoon: false, night: false },
      food_instruction: "Take once a week after a meal containing fat (e.g., Sunday breakfast)",
      special_instructions: "Take only ONCE per week, not every day.",
      confidence: "medium",
    },
  ],
  lab_markers: [
    {
      test_name: "Total Cholesterol",
      value: 215,
      unit: "mg/dL",
      reference_range: "< 200",
      status: "HIGH",
      plain_meaning: "Your overall cholesterol is borderline high. Normal is below 200 mg/dL.",
      confidence: "high",
    },
    {
      test_name: "LDL Cholesterol",
      value: 138,
      unit: "mg/dL",
      reference_range: "< 100",
      status: "HIGH",
      plain_meaning: "Your 'bad' cholesterol is above target. A heart-healthy diet is recommended.",
      confidence: "high",
    },
    {
      test_name: "HDL Cholesterol",
      value: 48,
      unit: "mg/dL",
      reference_range: "> 40",
      status: "NORMAL",
      plain_meaning: "Your 'good' cholesterol is in a healthy range.",
      confidence: "high",
    },
    {
      test_name: "Serum Creatinine",
      value: 0.9,
      unit: "mg/dL",
      reference_range: "0.7 - 1.3",
      status: "NORMAL",
      plain_meaning: "Your kidney function is completely normal.",
      confidence: "high",
    },
    {
      test_name: "HbA1c",
      value: 6.8,
      unit: "%",
      reference_range: "< 5.7",
      status: "HIGH",
      plain_meaning: "Your 3-month average blood sugar shows fair diabetes control (target for diabetics is usually under 7.0%).",
      confidence: "high",
    },
  ],
  safety_alerts: [
    {
      severity: "WARNING",
      type: "DOSAGE",
      title: "High-Dose Vitamin D3: Take Weekly, NOT Daily",
      explanation:
        "Vitamin D3 60,000 IU is a high-dose supplement meant to be taken ONCE PER WEEK. Taking this dose daily can lead to vitamin D toxicity and calcium buildup.",
      action:
        "Pick one set day each week (e.g., every Sunday morning) to take this pill. Do not take it every day.",
      related_medication: "Vitamin D3 60,000 IU",
      pathway: {
        mechanism: "Overdose if taken daily",
        outcome: "Vitamin D toxicity / high calcium",
      },
    },
    {
      severity: "INFO",
      type: "GENERAL",
      title: "Borderline LDL Cholesterol — Discuss with Doctor",
      explanation:
        "Your LDL cholesterol is 138 mg/dL (target is below 100). Since you also have diabetes, your doctor may consider whether a cholesterol-lowering medication (statin) would be beneficial.",
      action:
        "Ask your doctor whether lifestyle changes or a low-dose statin is appropriate for your cholesterol numbers.",
      related_medication: "None currently prescribed",
      related_lab: "LDL Cholesterol (138 mg/dL)",
    },
  ],
  doctor_questions: [
    "My LDL cholesterol is 138 mg/dL — should we consider adding a cholesterol-lowering medication like a statin?",
    "Is Pantoprazole meant to be a short-term course or long-term therapy?",
    "My HbA1c is 6.8% on Metformin once daily — is this on target, or should we adjust the dose?",
    "How long should I continue the weekly Vitamin D3 60,000 IU before retesting my levels?",
  ],
  disclaimer:
    "This analysis is informational only and does not replace professional medical advice. Always consult your doctor or pharmacist before making any changes to your medications.",
};
