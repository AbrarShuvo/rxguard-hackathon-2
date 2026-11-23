import { SafetyAlert } from "@/types/analysis";
import { Language } from "@/lib/translations";

export interface ResolvedPathway {
  mechanism: string;
  biomarkerEffect?: string;
  outcome: string;
}

type Labels = { mechanism: string; biomarkerEffect?: string; outcome: string };
type Rule = {
  test: (text: string, alert: SafetyAlert) => boolean;
  labels: Record<Language, Labels>;
};

const RULES: Rule[] = [
  {
    test: (t) => /ibuprofen|nsaid|naproxen|diclofenac|ketorolac/.test(t) && /creatinine|egfr|kidney|renal|bun/.test(t),
    labels: {
      en: { mechanism: "Reduces kidney blood flow", biomarkerEffect: "Kidney filtration already reduced", outcome: "Acute kidney injury" },
      hi: { mechanism: "किडनी में रक्त प्रवाह घटाता है", biomarkerEffect: "किडनी की छनाई पहले से कम", outcome: "तीव्र किडनी क्षति" },
      es: { mechanism: "Reduce el flujo sanguíneo renal", biomarkerEffect: "Filtración renal ya reducida", outcome: "Lesión renal aguda" },
    },
  },
  {
    test: (t) => /metformin/.test(t) && /egfr|creatinine|kidney|renal/.test(t),
    labels: {
      en: { mechanism: "Reduced drug clearance", biomarkerEffect: "Kidney filtration lowered", outcome: "Lactic acidosis risk" },
      hi: { mechanism: "दवा का शरीर से निकलना कम", biomarkerEffect: "किडनी की छनाई कम", outcome: "लैक्टिक एसिडोसिस का खतरा" },
      es: { mechanism: "Menor eliminación del fármaco", biomarkerEffect: "Filtración renal disminuida", outcome: "Riesgo de acidosis láctica" },
    },
  },
  {
    test: (_t, a) => a.type === "DOSAGE",
    labels: {
      en: { mechanism: "Overdose if taken daily", outcome: "Vitamin D toxicity / high calcium" },
      hi: { mechanism: "रोज़ लेने पर ओवरडोज़", outcome: "विटामिन D विषाक्तता / उच्च कैल्शियम" },
      es: { mechanism: "Sobredosis si se toma a diario", outcome: "Toxicidad por vitamina D / calcio alto" },
    },
  },
  {
    test: (_t, a) => a.type === "DRUG_DRUG",
    labels: {
      en: { mechanism: "Drugs interact", outcome: "Increased side-effect risk" },
      hi: { mechanism: "दवाओं का आपसी प्रभाव", outcome: "दुष्प्रभाव का बढ़ा खतरा" },
      es: { mechanism: "Los fármacos interactúan", outcome: "Mayor riesgo de efectos secundarios" },
    },
  },
];

const GENERIC: Record<Language, Labels> = {
  en: { mechanism: "Potential interaction", outcome: "Needs clinical review" },
  hi: { mechanism: "संभावित अंतःक्रिया", outcome: "चिकित्सकीय समीक्षा आवश्यक" },
  es: { mechanism: "Posible interacción", outcome: "Requiere revisión clínica" },
};

export function resolvePathway(alert: SafetyAlert, lang: Language = "en"): ResolvedPathway {
  if (alert.pathway?.mechanism && alert.pathway?.outcome) {
    return {
      mechanism: alert.pathway.mechanism,
      biomarkerEffect: alert.pathway.biomarker_effect,
      outcome: alert.pathway.outcome,
    };
  }
  const text = `${alert.related_medication ?? ""} ${alert.related_lab ?? ""} ${alert.title}`.toLowerCase();
  const rule = RULES.find((r) => r.test(text, alert));
  const l = (rule?.labels ?? GENERIC)[lang];
  return { mechanism: l.mechanism, biomarkerEffect: l.biomarkerEffect, outcome: l.outcome };
}
