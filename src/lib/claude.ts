// ============================================================================
// RxGuard — Anthropic Claude Vision Engine
// Multimodal prescription & lab report extraction using Claude 3.5 Sonnet / Haiku
// with guaranteed structured JSON output via Tool Calling.
// ============================================================================

import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/gemini";
import { AnalysisResult } from "@/types/analysis";

export function getAnthropicClient(apiKeyOverride?: string) {
  let apiKey = (apiKeyOverride || process.env.ANTHROPIC_API_KEY || "").trim();

  // Strip potential wrapping quotes if copied from terminal or .env
  if (
    (apiKey.startsWith('"') && apiKey.endsWith('"')) ||
    (apiKey.startsWith("'") && apiKey.endsWith("'"))
  ) {
    apiKey = apiKey.slice(1, -1).trim();
  }

  // Strip accidental "Bearer " prefix if copied from HTTP headers
  if (apiKey.toLowerCase().startsWith("bearer ")) {
    apiKey = apiKey.slice(7).trim();
  }

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }
  return new Anthropic({ apiKey });
}

export const CLAUDE_JSON_SCHEMA = {
  name: "record_rxguard_analysis",
  description: "Record the structured extraction of medications, lab markers, and safety alerts from medical documents.",
  input_schema: {
    type: "object" as const,
    properties: {
      patient_summary: {
        type: "string",
        description: "Plain-language 2-3 sentence overview of overall findings",
      },
      overall_risk_level: {
        type: "string",
        enum: ["CRITICAL", "WARNING", "LOW"],
        description: "Overall risk severity level",
      },
      medications: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            generic_name: { type: "string" },
            drug_class: { type: "string" },
            purpose: { type: "string" },
            raw_dosage: { type: "string" },
            schedule: {
              type: "object",
              properties: {
                morning: { type: "boolean" },
                afternoon: { type: "boolean" },
                night: { type: "boolean" },
              },
              required: ["morning", "afternoon", "night"],
            },
            food_instruction: { type: "string" },
            special_instructions: { type: "string" },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
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
        type: "array",
        items: {
          type: "object",
          properties: {
            test_name: { type: "string" },
            value: { type: "number" },
            unit: { type: "string" },
            reference_range: { type: "string" },
            status: { type: "string", enum: ["HIGH", "LOW", "NORMAL"] },
            plain_meaning: { type: "string" },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
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
        type: "array",
        items: {
          type: "object",
          properties: {
            severity: { type: "string", enum: ["CRITICAL", "WARNING", "INFO"] },
            type: { type: "string", enum: ["DRUG_LAB", "DRUG_DRUG", "DOSAGE", "GENERAL"] },
            title: { type: "string" },
            explanation: { type: "string" },
            action: { type: "string" },
            related_medication: { type: "string" },
            related_lab: { type: "string" },
          },
          required: ["severity", "type", "title", "explanation", "action"],
        },
      },
      doctor_questions: {
        type: "array",
        items: { type: "string" },
      },
      disclaimer: { type: "string" },
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
  },
};

export async function analyzeWithClaude(params: {
  apiKey?: string;
  model?: string;
  prescriptionBase64?: string;
  prescriptionMime?: string;
  labReportBase64?: string;
  labReportMime?: string;
}): Promise<AnalysisResult> {
  const client = getAnthropicClient(params.apiKey);

  // Model cascade: user-selected/env model -> Sonnet 5.5 -> Sonnet 5 -> Haiku 5.5
  const candidateModels = [
    params.model,
    process.env.ANTHROPIC_MODEL,
    "claude-sonnet-5-5",
    "claude-sonnet-5",
    "claude-haiku-5-5",
  ].filter(Boolean) as string[];

  const content: any[] = [];

  if (params.prescriptionBase64) {
    const mime = (params.prescriptionMime || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mime,
        data: params.prescriptionBase64,
      },
    });
    content.push({
      type: "text",
      text: "Above is the Doctor's Prescription image.",
    });
  }

  if (params.labReportBase64) {
    const mime = (params.labReportMime || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mime,
        data: params.labReportBase64,
      },
    });
    content.push({
      type: "text",
      text: "Above is the Diagnostic Blood/Lab Report image.",
    });
  }

  content.push({
    type: "text",
    text: "Extract all medications, dosage shorthand, lab biomarkers, and perform cross-document safety contraindication analysis. Call the record_rxguard_analysis tool with the structured results.",
  });

  let lastError: any;
  for (const model of candidateModels) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: [CLAUDE_JSON_SCHEMA as any],
        tool_choice: { type: "tool", name: "record_rxguard_analysis" },
        messages: [
          {
            role: "user",
            content: content,
          },
        ],
      });

      const toolUseBlock = response.content.find((block) => block.type === "tool_use") as any;
      if (toolUseBlock && toolUseBlock.input) {
        return toolUseBlock.input as AnalysisResult;
      }
    } catch (err: any) {
      lastError = err;
      // If authentication error (401 invalid key), switching models won't help, fail fast
      if (err?.status === 401 || err?.message?.includes("invalid x-api-key")) {
        throw err;
      }
      console.warn(`Claude model ${model} failed, trying next candidate:`, err?.message);
    }
  }

  throw lastError || new Error("Claude did not return structured analysis data.");
}
