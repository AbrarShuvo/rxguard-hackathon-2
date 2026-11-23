import { describe, it, expect } from "vitest";
import { AnalysisResultSchema } from "@/lib/schema";
import { SAMPLE_CASE_A, SAMPLE_CASE_B } from "@/lib/sample-data";

describe("Zod AnalysisResult Schema Validation", () => {
  it("successfully validates Sample Case A against schema", () => {
    const parseResult = AnalysisResultSchema.safeParse(SAMPLE_CASE_A);
    expect(parseResult.success).toBe(true);
  });

  it("successfully validates Sample Case B against schema", () => {
    const parseResult = AnalysisResultSchema.safeParse(SAMPLE_CASE_B);
    expect(parseResult.success).toBe(true);
  });

  it("rejects an invalid risk level", () => {
    const invalidCase = {
      ...SAMPLE_CASE_A,
      overall_risk_level: "EXTREME_DANGER", // Invalid enum
    };
    const parseResult = AnalysisResultSchema.safeParse(invalidCase);
    expect(parseResult.success).toBe(false);
  });

  it("enforces medication schedule booleans", () => {
    const invalidCase = {
      ...SAMPLE_CASE_A,
      medications: [
        {
          ...SAMPLE_CASE_A.medications[0],
          schedule: { morning: "yes", afternoon: false, night: true }, // morning is not boolean
        },
      ],
    };
    const parseResult = AnalysisResultSchema.safeParse(invalidCase);
    expect(parseResult.success).toBe(false);
  });
});
