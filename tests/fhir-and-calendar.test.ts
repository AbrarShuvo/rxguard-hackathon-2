import { describe, it, expect } from "vitest";
import { generateFhirBundle } from "@/lib/fhir-export";
import { generateMedicationCalendarIcs } from "@/lib/calendar-export";
import { SAMPLE_CASE_A, SAMPLE_CASE_B } from "@/lib/sample-data";

describe("HL7 FHIR R4 Bundle Generator", () => {
  it("generates a compliant FHIR R4 Bundle from Sample Case A", () => {
    const bundle: any = generateFhirBundle(SAMPLE_CASE_A, "patient-test-1");

    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("collection");
    expect(bundle.entry.length).toBeGreaterThan(0);

    // Verify Patient resource exists
    const patientEntry = bundle.entry.find((e: any) => e.resource.resourceType === "Patient");
    expect(patientEntry).toBeDefined();

    // Verify MedicationRequest resources exist with correct timing
    const medEntries = bundle.entry.filter((e: any) => e.resource.resourceType === "MedicationRequest");
    expect(medEntries.length).toBe(SAMPLE_CASE_A.medications.length);

    const ibuprofenMed = medEntries.find((e: any) =>
      e.resource.medicationCodeableConcept.text.includes("Ibuprofen")
    );
    expect(ibuprofenMed).toBeDefined();
    expect(ibuprofenMed.resource.status).toBe("active");

    // Verify Observation resources with LOINC codes
    const obsEntries = bundle.entry.filter((e: any) => e.resource.resourceType === "Observation");
    expect(obsEntries.length).toBe(SAMPLE_CASE_A.lab_markers.length);

    const creatinineObs = obsEntries.find((e: any) =>
      e.resource.code.text.includes("Creatinine")
    );
    expect(creatinineObs).toBeDefined();
    expect(creatinineObs.resource.valueQuantity.value).toBe(1.8);
    expect(creatinineObs.resource.code.coding[0].system).toBe("http://loinc.org");

    // Verify DetectedIssue resources for safety contraindications
    const issueEntries = bundle.entry.filter((e: any) => e.resource.resourceType === "DetectedIssue");
    expect(issueEntries.length).toBe(SAMPLE_CASE_A.safety_alerts.length);
    expect(issueEntries[0].resource.severity).toBe("high");
  });
});

describe("iCalendar (.ics) Routine Exporter", () => {
  it("generates valid .ics calendar content with morning and night events", () => {
    const ics = generateMedicationCalendarIcs(SAMPLE_CASE_A.medications);

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//RxGuard");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:💊 RxGuard: Morning Medications");
    expect(ics).toContain("SUMMARY:💊 RxGuard: Night Medications");
    expect(ics).toContain("RRULE:FREQ=DAILY;INTERVAL=1");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("handles empty medication schedule gracefully", () => {
    const ics = generateMedicationCalendarIcs([]);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).not.toContain("BEGIN:VEVENT");
  });
});
