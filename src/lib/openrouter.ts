// ============================================================================
// RxGuard — OpenRouter Vision Engine
// Supports Anthropic Claude Sonnet 5.5, Sonnet 5, Haiku 5.5 via OpenRouter API.
// ============================================================================

import { SYSTEM_PROMPT } from "@/lib/gemini";
import { AnalysisResult } from "@/types/analysis";

export async function analyzeWithOpenRouter(params: {
  apiKey: string;
  model?: string;
  prescriptionBase64?: string;
  prescriptionMime?: string;
  labReportBase64?: string;
  labReportMime?: string;
}): Promise<AnalysisResult> {
  let cleanKey = (params.apiKey || "").trim();

  // Strip wrapping quotes
  if (
    (cleanKey.startsWith('"') && cleanKey.endsWith('"')) ||
    (cleanKey.startsWith("'") && cleanKey.endsWith("'"))
  ) {
    cleanKey = cleanKey.slice(1, -1).trim();
  }

  // Strip "Bearer " prefix if accidentally included
  if (cleanKey.toLowerCase().startsWith("bearer ")) {
    cleanKey = cleanKey.slice(7).trim();
  }

  if (!cleanKey) {
    throw new Error("OpenRouter API key is empty.");
  }

  const content: any[] = [];

  if (params.prescriptionBase64) {
    const mime = params.prescriptionMime || "image/jpeg";
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${mime};base64,${params.prescriptionBase64}`,
      },
    });
    content.push({
      type: "text",
      text: "Above is the Doctor's Prescription image.",
    });
  }

  if (params.labReportBase64) {
    const mime = params.labReportMime || "image/jpeg";
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${mime};base64,${params.labReportBase64}`,
      },
    });
    content.push({
      type: "text",
      text: "Above is the Diagnostic Blood/Lab Report image.",
    });
  }

  content.push({
    type: "text",
    text: `${SYSTEM_PROMPT}\n\nTask: Analyze the attached document(s) carefully. You MUST return ONLY a valid, raw JSON object matching the schema with patient_summary, overall_risk_level, medications, lab_markers, safety_alerts, doctor_questions, and disclaimer. No markdown fences, no explanatory text, just raw JSON.`,
  });

  // Candidate cascade: Sonnet 5.5 -> Sonnet 5 -> Haiku 5.5
  const candidateModels = [
    params.model,
    process.env.OPENROUTER_MODEL,
    "anthropic/claude-sonnet-5.5",
    "anthropic/claude-sonnet-5",
    "anthropic/claude-haiku-5.5",
  ].filter(Boolean) as string[];

  let lastError: any;

  for (const model of candidateModels) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cleanKey}`,
          "HTTP-Referer": "https://rxguard.vercel.app",
          "X-Title": "RxGuard",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 401) {
          throw new Error(`OpenRouter 401 Authentication Error: ${errText}`);
        }
        throw new Error(`OpenRouter (${res.status}) on model ${model}: ${errText}`);
      }

      const json = await res.json();
      const rawText = json?.choices?.[0]?.message?.content;
      if (!rawText) {
        throw new Error(`No output content received from OpenRouter model ${model}`);
      }

      let cleanText = rawText.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.slice(7);
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.slice(3);
      }
      if (cleanText.endsWith("```")) {
        cleanText = cleanText.slice(0, -3);
      }

      return JSON.parse(cleanText.trim()) as AnalysisResult;
    } catch (err: any) {
      lastError = err;
      if (err?.message?.includes("401 Authentication Error")) {
        throw err;
      }
      console.warn(`OpenRouter model candidate ${model} failed, trying next:`, err?.message);
    }
  }

  throw lastError || new Error("OpenRouter analysis failed on all candidate models.");
}
