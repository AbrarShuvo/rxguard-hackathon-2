import { describe, it, expect } from "vitest";
import { parseDosageShorthand } from "@/lib/clinical-rules";

describe("Medical Dosage Shorthand Parser", () => {
  it("correctly parses 1-0-1 PC pattern into morning and night with after meals", () => {
    const result = parseDosageShorthand("1-0-1 PC");
    expect(result.schedule.morning).toBe(true);
    expect(result.schedule.afternoon).toBe(false);
    expect(result.schedule.night).toBe(true);
    expect(result.foodInstruction).toContain("after meals");
    expect(result.isAsNeeded).toBe(false);
  });

  it("correctly parses 1-1-1 AC pattern into morning, afternoon, and night before meals", () => {
    const result = parseDosageShorthand("1-1-1 AC");
    expect(result.schedule.morning).toBe(true);
    expect(result.schedule.afternoon).toBe(true);
    expect(result.schedule.night).toBe(true);
    expect(result.foodInstruction).toContain("before meals");
  });

  it("correctly parses BD (twice daily) as morning and night", () => {
    const result = parseDosageShorthand("BD PC");
    expect(result.schedule.morning).toBe(true);
    expect(result.schedule.night).toBe(true);
  });

  it("correctly parses TID (three times daily) as morning, afternoon, night", () => {
    const result = parseDosageShorthand("TID");
    expect(result.schedule.morning).toBe(true);
    expect(result.schedule.afternoon).toBe(true);
    expect(result.schedule.night).toBe(true);
  });

  it("correctly parses 0-0-1 HS as night only bedtime dose", () => {
    const result = parseDosageShorthand("0-0-1 HS");
    expect(result.schedule.morning).toBe(false);
    expect(result.schedule.afternoon).toBe(false);
    expect(result.schedule.night).toBe(true);
    expect(result.foodInstruction).toContain("bedtime");
  });

  it("flags PRN and SOS shorthand as as-needed medication", () => {
    const result = parseDosageShorthand("1 tab SOS for severe headache");
    expect(result.isAsNeeded).toBe(true);
    expect(result.foodInstruction).toContain("only when needed");
  });

  it("identifies once-weekly dosing protocols (e.g. Vitamin D3)", () => {
    const result = parseDosageShorthand("Once weekly with breakfast");
    expect(result.isOnceWeekly).toBe(true);
    expect(result.schedule.morning).toBe(true);
    expect(result.foodInstruction).toContain("once weekly");
  });
});
