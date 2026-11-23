// ============================================================================
// RxGuard — HL7 FHIR R4 Export Engine
// Converts extracted medications, biomarkers, and contraindications into
// standard FHIR R4 JSON bundles for EHR interoperability.
// ============================================================================

import { AnalysisResult, Medication, LabMarker, SafetyAlert } from "@/types/analysis";

export function generateFhirBundle(result: AnalysisResult, patientId: string = "patient-rxguard-demo"): object {
  const timestamp = new Date().toISOString();

  const entries: any[] = [];

  // 1. Patient Resource
  entries.push({
    fullUrl: `urn:uuid:${patientId}`,
    resource: {
      resourceType: "Patient",
      id: patientId,
      meta: { profile: ["http://hl7.org/fhir/StructureDefinition/Patient"] },
      active: true,
      name: [{ use: "anonymous", text: "RxGuard De-Identified Patient" }],
    },
  });

  // 2. MedicationRequest Resources
  result.medications.forEach((med: Medication, idx: number) => {
    const medId = `med-request-${idx + 1}`;
    entries.push({
      fullUrl: `urn:uuid:${medId}`,
      resource: {
        resourceType: "MedicationRequest",
        id: medId,
        status: "active",
        intent: "order",
        subject: { reference: `urn:uuid:${patientId}` },
        authoredOn: timestamp,
        medicationCodeableConcept: {
          text: med.name,
          coding: [
            {
              system: "http://www.nlm.nih.gov/research/umls/rxnorm",
              display: med.generic_name,
            },
          ],
        },
        dosageInstruction: [
          {
            text: `${med.raw_dosage} - ${med.food_instruction}`,
            timing: {
              repeat: {
                frequency: (med.schedule.morning ? 1 : 0) + (med.schedule.afternoon ? 1 : 0) + (med.schedule.night ? 1 : 0),
                period: 1,
                periodUnit: "d",
                when: [
                  ...(med.schedule.morning ? ["MORN"] : []),
                  ...(med.schedule.afternoon ? ["AFT"] : []),
                  ...(med.schedule.night ? ["NIGHT"] : []),
                ],
              },
            },
            patientInstruction: med.purpose,
          },
        ],
      },
    });
  });

  // 3. Observation Resources for Lab Biomarkers
  const loincMap: Record<string, { code: string; display: string }> = {
    creatinine: { code: "2160-0", display: "Creatinine [Mass/volume] in Serum or Plasma" },
    egfr: { code: "33914-3", display: "Glomerular filtration rate/1.73 sq M.predicted" },
    bun: { code: "3094-0", display: "Urea nitrogen [Mass/volume] in Blood" },
    glucose: { code: "1558-6", display: "Fasting glucose [Mass/volume] in Serum or Plasma" },
    hba1c: { code: "4548-4", display: "Hemoglobin A1c/Hemoglobin.total in Blood" },
    potassium: { code: "2823-3", display: "Potassium [Moles/volume] in Serum or Plasma" },
    hemoglobin: { code: "718-7", display: "Hemoglobin [Mass/volume] in Blood" },
    cholesterol: { code: "2093-3", display: "Cholesterol [Mass/volume] in Serum or Plasma" },
    ldl: { code: "18262-6", display: "Low density lipoprotein cholesterol" },
  };

  result.lab_markers.forEach((marker: LabMarker, idx: number) => {
    const obsId = `obs-lab-${idx + 1}`;
    const lowerName = marker.test_name.toLowerCase();
    const matchedLoinc = Object.entries(loincMap).find(([k]) => lowerName.includes(k));

    entries.push({
      fullUrl: `urn:uuid:${obsId}`,
      resource: {
        resourceType: "Observation",
        id: obsId,
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "laboratory",
                display: "Laboratory",
              },
            ],
          },
        ],
        code: {
          text: marker.test_name,
          coding: matchedLoinc
            ? [
                {
                  system: "http://loinc.org",
                  code: matchedLoinc[1].code,
                  display: matchedLoinc[1].display,
                },
              ]
            : undefined,
        },
        subject: { reference: `urn:uuid:${patientId}` },
        effectiveDateTime: timestamp,
        valueQuantity: {
          value: marker.value,
          unit: marker.unit,
        },
        interpretation: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                code: marker.status === "HIGH" ? "H" : marker.status === "LOW" ? "L" : "N",
                display: marker.status === "HIGH" ? "High" : marker.status === "LOW" ? "Low" : "Normal",
              },
            ],
          },
        ],
        note: [{ text: marker.plain_meaning }],
      },
    });
  });

  // 4. DetectedIssue Resources for Safety Alerts
  result.safety_alerts.forEach((alert: SafetyAlert, idx: number) => {
    const issueId = `detected-issue-${idx + 1}`;
    entries.push({
      fullUrl: `urn:uuid:${issueId}`,
      resource: {
        resourceType: "DetectedIssue",
        id: issueId,
        status: "final",
        code: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
              code: alert.type === "DRUG_LAB" ? "DRG_LAB" : alert.type === "DRUG_DRUG" ? "DRG" : "ALRT",
              display: alert.title,
            },
          ],
          text: alert.title,
        },
        severity: alert.severity === "CRITICAL" ? "high" : alert.severity === "WARNING" ? "moderate" : "low",
        detail: alert.explanation,
        mitigation: [
          {
            action: {
              text: alert.action,
            },
          },
        ],
      },
    });
  });

  return {
    resourceType: "Bundle",
    id: `bundle-rxguard-${Date.now()}`,
    meta: {
      lastUpdated: timestamp,
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"],
    },
    type: "collection",
    total: entries.length,
    entry: entries,
  };
}
