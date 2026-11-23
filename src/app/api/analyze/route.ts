import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, SYSTEM_PROMPT, geminiResponseSchema } from "@/lib/gemini";
import { analyzeWithClaude } from "@/lib/claude";
import { analyzeWithOpenRouter } from "@/lib/openrouter";
import { AnalysisResultSchema } from "@/lib/schema";
import { SAMPLE_CASE_A, SAMPLE_CASE_B } from "@/lib/sample-data";
import { runDeterministicSafetyAudit } from "@/lib/clinical-rules";
import { AnalyzeRequest, AnalysisResult } from "@/types/analysis";

export const maxDuration = 60; // Allow up to 60s for multimodal vision reasoning

function cleanKey(raw?: string | null): string {
  if (!raw) return "";
  let k = raw.trim();
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1).trim();
  }
  if (k.toLowerCase().startsWith("bearer ")) {
    k = k.slice(7).trim();
  }
  return k;
}

export async function GET() {
  const anthropicKey = cleanKey(process.env.ANTHROPIC_API_KEY);
  const openRouterKey = cleanKey(process.env.OPENROUTER_API_KEY);
  const geminiKey = cleanKey(process.env.GEMINI_API_KEY);

  const isOpenRouter = !!openRouterKey || anthropicKey.startsWith("sk-or-");
  const isAnthropic = !isOpenRouter && anthropicKey.startsWith("sk-ant-");
  const isGemini = !isOpenRouter && !isAnthropic && !!geminiKey;

  const provider = isOpenRouter
    ? "openrouter-claude-sonnet-5.5"
    : isAnthropic
    ? "claude-sonnet-5.5"
    : isGemini
    ? "gemini-3.8-flash"
    : null;

  return NextResponse.json({
    hasServerKey: !!(anthropicKey || openRouterKey || geminiKey),
    provider,
    keyType: isOpenRouter ? "openrouter" : isAnthropic ? "anthropic" : isGemini ? "gemini" : "none",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json();

    // 1. One-click sample cases interceptor (instant response for judges without needing API key)
    if (body.isSampleCase === "A") {
      return NextResponse.json({ success: true, data: SAMPLE_CASE_A, source: "sample_case_a" });
    }
    if (body.isSampleCase === "B") {
      return NextResponse.json({ success: true, data: SAMPLE_CASE_B, source: "sample_case_b" });
    }

    const { prescriptionFile, prescriptionMimeType, labReportFile, labReportMimeType } = body;

    if (!prescriptionFile && !labReportFile) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload at least one document (prescription or lab report).",
        },
        { status: 400 }
      );
    }

    const clientProvidedKey = cleanKey(
      body.apiKey ||
      req.headers.get("x-api-key") ||
      req.headers.get("x-gemini-api-key")
    );

    const serverAnthropicKey = cleanKey(process.env.ANTHROPIC_API_KEY);
    const serverOpenRouterKey = cleanKey(process.env.OPENROUTER_API_KEY);
    const serverGeminiKey = cleanKey(process.env.GEMINI_API_KEY);

    // Pick active key prioritizing explicit client input, then server env vars
    const activeKey =
      clientProvidedKey ||
      serverOpenRouterKey ||
      serverAnthropicKey ||
      serverGeminiKey ||
      "";

    if (!activeKey) {
      return NextResponse.json(
        {
          success: false,
          error: "No AI API key found. Please enter your Claude/OpenRouter or Gemini API key via the 'Set API Key' button or add ANTHROPIC_API_KEY in Vercel.",
        },
        { status: 400 }
      );
    }

    const rxBase64 = prescriptionFile
      ? prescriptionFile.includes(",")
        ? prescriptionFile.split(",")[1]
        : prescriptionFile
      : undefined;

    const labBase64 = labReportFile
      ? labReportFile.includes(",")
        ? labReportFile.split(",")[1]
        : labReportFile
      : undefined;

    let rawJson: any;
    let providerSource = "claude";

    // ── ROUTING DECISION ──────────────────────────────────────────────────
    // A) If key starts with "sk-or-", it is definitely an OpenRouter key
    const isOpenRouterKey = activeKey.startsWith("sk-or-") || (!!serverOpenRouterKey && !clientProvidedKey);

    // B) If key starts with "sk-ant-", it is an Anthropic Claude key
    const isAnthropicKey = activeKey.startsWith("sk-ant-") || (!isOpenRouterKey && !!serverAnthropicKey && !activeKey.startsWith("AIza"));

    // C) If key starts with "AIza", it is a Google Gemini key
    const isGeminiKey = activeKey.startsWith("AIza") || (!isOpenRouterKey && !isAnthropicKey && !!serverGeminiKey);

    if (isOpenRouterKey) {
      // ── ROUTE 1: OpenRouter ─────────────────────────────────────────────
      providerSource = "openrouter-sonnet-5.5";
      rawJson = await analyzeWithOpenRouter({
        apiKey: activeKey,
        prescriptionBase64: rxBase64,
        prescriptionMime: prescriptionMimeType,
        labReportBase64: labBase64,
        labReportMime: labReportMimeType,
      });
    } else if (isAnthropicKey) {
      // ── ROUTE 2: Direct Anthropic (with automatic OpenRouter fallback) ──
      try {
        providerSource = "claude-sonnet-5.5";
        rawJson = await analyzeWithClaude({
          apiKey: activeKey,
          prescriptionBase64: rxBase64,
          prescriptionMime: prescriptionMimeType,
          labReportBase64: labBase64,
          labReportMime: labReportMimeType,
        });
      } catch (anthropicErr: any) {
        console.warn("Direct Anthropic call failed, testing OpenRouter fallback:", anthropicErr?.message);
        try {
          providerSource = "openrouter-claude-fallback";
          rawJson = await analyzeWithOpenRouter({
            apiKey: activeKey,
            prescriptionBase64: rxBase64,
            prescriptionMime: prescriptionMimeType,
            labReportBase64: labBase64,
            labReportMime: labReportMimeType,
          });
        } catch (openRouterErr: any) {
          console.error("Both Anthropic and OpenRouter endpoints failed:", {
            anthropic: anthropicErr?.message,
            openrouter: openRouterErr?.message,
          });
          // Throw the primary Anthropic error since it's an sk-ant key
          throw anthropicErr;
        }
      }
    } else if (isGeminiKey || serverGeminiKey) {
      // ── ROUTE 3: Google Gemini ──────────────────────────────────────────
      providerSource = "gemini-3.8-flash";
      const ai = getGeminiClient(activeKey || serverGeminiKey);
      const parts: any[] = [];

      let instructionNote = "";
      if (prescriptionFile && labReportFile) {
        instructionNote = "The user has uploaded BOTH a prescription and a lab report. Perform full cross-document safety and contraindication analysis.";
      } else if (prescriptionFile) {
        instructionNote = "The user uploaded ONLY a prescription. Extract medications, decode schedule shorthand, and flag general drug warnings. Leave lab_markers as empty array [].";
      } else {
        instructionNote = "The user uploaded ONLY a lab report. Extract lab biomarkers, reference ranges, and interpret out-of-range values. Leave medications as empty array [].";
      }

      parts.push({
        text: `${SYSTEM_PROMPT}\n\nTask Context: ${instructionNote}\n\nAnalyze the attached document(s) carefully and output the structured JSON according to the schema.`,
      });

      if (rxBase64) {
        parts.push({
          inlineData: {
            mimeType: prescriptionMimeType || "image/jpeg",
            data: rxBase64,
          },
        });
        parts.push({ text: "Above is the Prescription Document." });
      }

      if (labBase64) {
        parts.push({
          inlineData: {
            mimeType: labReportMimeType || "image/jpeg",
            data: labBase64,
          },
        });
        parts.push({ text: "Above is the Diagnostic Lab Report Document." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json",
          responseSchema: geminiResponseSchema as any,
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No output text received from model.");
      }

      rawJson = JSON.parse(responseText);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Unrecognized API key format. Claude keys start with 'sk-ant-', OpenRouter keys start with 'sk-or-', and Gemini keys start with 'AIza'.",
        },
        { status: 400 }
      );
    }

    // Server-side Zod validation ensures frontend stability
    const validationResult = AnalysisResultSchema.safeParse(rawJson);
    const parsedData: AnalysisResult = validationResult.success ? validationResult.data : rawJson;

    // ── DUAL-ENGINE CLINICAL SAFETY AUDIT ──────────────────────────────────
    try {
      const deterministicAlerts = runDeterministicSafetyAudit(
        parsedData.medications || [],
        parsedData.lab_markers || []
      );

      for (const alert of deterministicAlerts) {
        const alreadyExists = parsedData.safety_alerts.some((a) =>
          a.title.toLowerCase().includes(alert.title.toLowerCase().slice(0, 15))
        );
        if (!alreadyExists) {
          parsedData.safety_alerts.unshift(alert);
        }
      }

      if (parsedData.safety_alerts.some((a) => a.severity === "CRITICAL")) {
        parsedData.overall_risk_level = "CRITICAL";
      }
    } catch (auditErr) {
      console.warn("Deterministic safety audit warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      source: providerSource,
    });
  } catch (error: any) {
    console.error("Error in /api/analyze:", error);

    const errMsg = error?.message || "";
    const isAuthError =
      error?.status === 401 ||
      errMsg.includes("invalid x-api-key") ||
      errMsg.includes("authentication_error") ||
      errMsg.includes("401 Authentication Error") ||
      errMsg.includes("API_KEY_INVALID") ||
      errMsg.includes("Invalid API key");

    let message = errMsg || "An unexpected error occurred during document analysis.";
    if (isAuthError) {
      message =
        "AI Authentication Error: The API key configured in Vercel or entered in the UI was rejected by the provider (401).\n\n" +
        "• Anthropic Direct: Keys from console.anthropic.com start with 'sk-ant-api03-...'. Make sure active credits are added to Plans & Billing on Anthropic Console.\n" +
        "• OpenRouter: Keys from openrouter.ai/keys start with 'sk-or-v1-...'. If your credits are on OpenRouter, create an API key at openrouter.ai/keys and set OPENROUTER_API_KEY in Vercel (or paste it in the UI).\n" +
        "• Google Gemini: Keys from aistudio.google.com start with 'AIza...'.";
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
