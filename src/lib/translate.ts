// Text-only translation of the user-facing fields of an analysis result.
// Never sees drug names, doses or lab values as structured fields; only prose.
import { getGeminiClient } from "@/lib/gemini";
import { getAnthropicClient } from "@/lib/claude";

export type TranslateLang = "hi" | "es";

export interface TranslatePayload {
  summary: string;
  alerts: { title: string; explanation: string; action: string }[];
  labs: string[];
  questions: string[];
}

const LANG_NAME: Record<TranslateLang, string> = { hi: "Hindi (Devanagari)", es: "Spanish" };

export function buildPrompt(payload: TranslatePayload, lang: TranslateLang): string {
  return `Translate the string VALUES of this JSON into ${LANG_NAME[lang]} for a patient.
Rules:
- Return ONLY the JSON object, same keys, same array lengths, same order. No markdown.
- Keep drug names, doses, units, lab names and ALL numbers exactly as written (use ASCII digits, e.g. "Ibuprofen 400mg", "1.8 mg/dL", "eGFR 52").
- Do not add, remove or soften any medical warning. Simple, plain language.

${JSON.stringify(payload)}`;
}

export function parseJsonLoose(text: string): unknown {
  let t = text.trim();
  if (t.startsWith("```")) t = t.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(t);
}

type Provider = "openrouter" | "anthropic" | "gemini";

export function pickProvider(clientKey: string): { provider: Provider; key: string } | null {
  const strip = (k?: string) => (k ?? "").trim().replace(/^["']|["']$/g, "").replace(/^bearer\s+/i, "");
  const or = strip(process.env.OPENROUTER_API_KEY);
  const an = strip(process.env.ANTHROPIC_API_KEY);
  const ge = strip(process.env.GEMINI_API_KEY);
  if (or) return { provider: "openrouter", key: or };
  if (an) return an.startsWith("sk-or-") ? { provider: "openrouter", key: an } : { provider: "anthropic", key: an };
  if (ge) return { provider: "gemini", key: ge };
  const c = strip(clientKey);
  if (!c) return null;
  if (c.startsWith("sk-or-")) return { provider: "openrouter", key: c };
  if (c.startsWith("sk-ant-")) return { provider: "anthropic", key: c };
  if (c.startsWith("AIza")) return { provider: "gemini", key: c };
  return null;
}

export async function translateWithAI(
  payload: TranslatePayload,
  lang: TranslateLang,
  target: { provider: Provider; key: string }
): Promise<unknown> {
  const prompt = buildPrompt(payload, lang);

  if (target.provider === "openrouter") {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${target.key}`, "Content-Type": "application/json", "X-Title": "RxGuard" },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-5.5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
    });
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
    const json = await res.json();
    return parseJsonLoose(json?.choices?.[0]?.message?.content ?? "");
  }

  if (target.provider === "anthropic") {
    const client = getAnthropicClient(target.key);
    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });
    const block = msg.content.find((b) => b.type === "text") as { text?: string } | undefined;
    return parseJsonLoose(block?.text ?? "");
  }

  const ai = getGeminiClient(target.key);
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json", temperature: 0 },
  });
  return parseJsonLoose(response.text ?? "");
}
