import { NextRequest, NextResponse } from "next/server";
import { pickProvider, translateWithAI, TranslatePayload, TranslateLang } from "@/lib/translate";

export const maxDuration = 30;

const MAX_BYTES = 100_000;
const str = (v: unknown, max = 4000): v is string => typeof v === "string" && v.length <= max;

function validatePayload(p: any): p is TranslatePayload {
  return (
    p &&
    str(p.summary) &&
    Array.isArray(p.alerts) && p.alerts.length <= 30 &&
    p.alerts.every((a: any) => a && str(a.title) && str(a.explanation) && str(a.action)) &&
    Array.isArray(p.labs) && p.labs.length <= 60 && p.labs.every((x: unknown) => str(x)) &&
    Array.isArray(p.questions) && p.questions.length <= 30 && p.questions.every((x: unknown) => str(x))
  );
}

// Keep the English text if any number from it is missing in the translation.
const numbers = (s: string) => s.match(/\d+(?:[.,]\d+)?/g) ?? [];
const safe = (en: string, tr: unknown): string =>
  typeof tr === "string" && tr.trim() && numbers(en).every((n) => tr.includes(n)) ? tr : en;

export async function POST(req: NextRequest) {
  if (!(req.headers.get("content-type") || "").includes("application/json")) {
    return NextResponse.json({ success: false, error: "Expected application/json" }, { status: 415 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BYTES) {
    return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const lang = body?.lang as TranslateLang;
  if (lang !== "hi" && lang !== "es") {
    return NextResponse.json({ success: false, error: "Unsupported language" }, { status: 400 });
  }
  const payload = body?.payload;
  if (!validatePayload(payload)) {
    return NextResponse.json({ success: false, error: "Invalid payload shape" }, { status: 400 });
  }

  const target = pickProvider(typeof body.apiKey === "string" ? body.apiKey : "");
  if (!target) {
    return NextResponse.json({ success: false, error: "No AI key configured" }, { status: 503 });
  }

  try {
    const out: any = await translateWithAI(payload, lang, target);
    const ok =
      out &&
      Array.isArray(out.alerts) && out.alerts.length === payload.alerts.length &&
      Array.isArray(out.labs) && out.labs.length === payload.labs.length &&
      Array.isArray(out.questions) && out.questions.length === payload.questions.length;
    if (!ok) {
      return NextResponse.json({ success: false, error: "Translation shape mismatch" }, { status: 422 });
    }

    const data: TranslatePayload = {
      summary: safe(payload.summary, out.summary),
      alerts: payload.alerts.map((a, i) => ({
        title: safe(a.title, out.alerts[i]?.title),
        explanation: safe(a.explanation, out.alerts[i]?.explanation),
        action: safe(a.action, out.alerts[i]?.action),
      })),
      labs: payload.labs.map((l, i) => safe(l, out.labs[i])),
      questions: payload.questions.map((q, i) => safe(q, out.questions[i])),
    };
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("translate failed:", err?.message);
    return NextResponse.json({ success: false, error: "Translation failed" }, { status: 502 });
  }
}
