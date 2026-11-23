// Hand-written Hindi / Spanish overrides for the two sample cases.
// Drug names, doses, units and numbers are copied verbatim from the English data.
import { AnalysisResult } from "@/types/analysis";
import { Language } from "@/lib/translations";
import { SAMPLE_CASE_A, SAMPLE_CASE_B } from "@/lib/sample-data";

type PathwayText = { mechanism: string; biomarker_effect?: string; outcome: string };
type Override = {
  patient_summary: string;
  alerts: { title: string; explanation: string; action: string; pathway?: PathwayText }[];
  labs: string[];
  doctor_questions: string[];
};

const A: Record<"hi" | "es", Override> = {
  hi: {
    patient_summary:
      "आपके पर्चे में 3 दवाएं हैं, जिनमें दर्द की दवा (Ibuprofen) और डायबिटीज़ की दवा (Metformin) शामिल हैं। आपकी लैब रिपोर्ट में क्रिएटिनिन बढ़ा हुआ और छनाई कम है, यानी आपकी किडनी पर दबाव है। इससे आपकी एक दवा को लेकर गंभीर सुरक्षा चिंता पैदा होती है।",
    alerts: [
      {
        title: "कमज़ोर किडनी के साथ NSAID दवा दी गई है",
        explanation:
          "Ibuprofen (NSAID दर्द निवारक) किडनी में रक्त प्रवाह घटाती है। आपका Serum Creatinine 1.8 mg/dL है (सामान्य: 0.7-1.3) और eGFR 52 mL/min है (सामान्य: 90+), यानी किडनी पहले से दबाव में है। Ibuprofen लेने से किडनी को और नुकसान हो सकता है।",
        action:
          "डॉक्टर से बात किए बिना Ibuprofen न लें। किडनी के लिए सुरक्षित विकल्प, जैसे Acetaminophen (Paracetamol), के बारे में पूछें।",
        pathway: { mechanism: "किडनी में रक्त प्रवाह घटाता है", biomarker_effect: "किडनी की छनाई पहले से कम", outcome: "तीव्र किडनी क्षति" },
      },
      {
        title: "eGFR कम होने पर Metformin की निगरानी ज़रूरी",
        explanation:
          "Metformin किडनी से बाहर निकलती है। eGFR 45 से नीचे जाने पर आमतौर पर खुराक घटानी पड़ती है। आपका eGFR अभी 52 है, जो इस सीमा के करीब है।",
        action:
          "डॉक्टर से पूछें कि आपकी किडनी की स्थिति को देखते हुए Metformin 500mg की दिन में दो बार की खुराक बदलनी चाहिए या नहीं।",
        pathway: { mechanism: "दवा का शरीर से निकलना कम", biomarker_effect: "किडनी की छनाई कम", outcome: "लैक्टिक एसिडोसिस का खतरा" },
      },
      {
        title: "फास्टिंग ग्लूकोज़ अधिक है: जीवनशैली और दवा की समीक्षा करें",
        explanation:
          "आपका फास्टिंग ग्लूकोज़ 142 mg/dL है, जो लक्ष्य सीमा 70-100 mg/dL से ऊपर है। Metformin मदद करती है, फिर भी डॉक्टर खान-पान में बदलाव या खुराक की समीक्षा सुझा सकते हैं।",
        action: "अगली मुलाक़ात में यह रीडिंग डॉक्टर को दिखाएं ताकि इलाज में ज़रूरी बदलाव हो सकें।",
      },
    ],
    labs: [
      "आपकी किडनी कचरे को उतनी अच्छी तरह नहीं छान रही जितनी उसे छाननी चाहिए। सामान्य स्तर 1.3 mg/dL से कम है।",
      "आपकी किडनी की छनाई दर मध्यम रूप से कम है। 60 से नीचे के मान किडनी की कमज़ोरी दर्शाते हैं।",
      "यह पुष्टि करता है कि आपकी किडनी खून से अपशिष्ट निकालने में सामान्य से ज़्यादा मेहनत कर रही है।",
      "आपका ब्लड शुगर सामान्य सीमा से ऊपर है। आपकी Metformin इसे नियंत्रित करने के लिए दी गई है।",
      "आपकी लाल रक्त कोशिकाओं की संख्या ठीक है। एनीमिया के कोई संकेत नहीं।",
    ],
    doctor_questions: [
      "मेरा creatinine 1.8 mg/dL और eGFR 52 है। क्या Ibuprofen मेरी किडनी के लिए सुरक्षित है, या मुझे Paracetamol लेनी चाहिए?",
      "मेरा eGFR 45 की सीमा के करीब है। क्या मेरी Metformin की खुराक बदलनी चाहिए?",
      "मुझे किडनी की जांच (creatinine और eGFR) कितने समय बाद दोबारा करानी चाहिए?",
      "Metformin लेने पर भी मेरा फास्टिंग ग्लूकोज़ 142 mg/dL है। क्या खान-पान या खुराक बदलनी होगी?",
      "किडनी की सुरक्षा के लिए मुझे कौन से खाद्य पदार्थ, पेय या बिना पर्चे की दवाएं नहीं लेनी चाहिए?",
    ],
  },
  es: {
    patient_summary:
      "Su receta contiene 3 medicamentos, entre ellos un analgésico (Ibuprofen) y un medicamento para la diabetes (Metformin). Su análisis muestra creatinina elevada y filtración reducida, lo que indica que sus riñones están bajo estrés y genera una preocupación de seguridad crítica con uno de sus medicamentos.",
    alerts: [
      {
        title: "AINE recetado con función renal deteriorada",
        explanation:
          "Ibuprofen (un analgésico AINE) reduce el flujo de sangre a los riñones. Su Serum Creatinine es 1.8 mg/dL (normal: 0.7-1.3) y su eGFR es 52 mL/min (normal: 90+), lo que muestra que sus riñones ya están estresados. Tomar Ibuprofen podría dañarlos aún más.",
        action:
          "NO tome Ibuprofen hasta hablar con su médico. Pregunte por alternativas seguras para el riñón, como Acetaminophen (Paracetamol).",
        pathway: { mechanism: "Reduce el flujo sanguíneo renal", biomarker_effect: "Filtración renal ya reducida", outcome: "Lesión renal aguda" },
      },
      {
        title: "Se recomienda vigilar Metformin con eGFR reducido",
        explanation:
          "Metformin se elimina por los riñones. Cuando el eGFR baja de 45, normalmente hay que reducir la dosis. Su eGFR actual es 52, cerca de ese límite.",
        action:
          "Pida a su médico que revise si la dosis de Metformin 500mg dos veces al día necesita ajuste según su función renal.",
        pathway: { mechanism: "Menor eliminación del fármaco", biomarker_effect: "Filtración renal disminuida", outcome: "Riesgo de acidosis láctica" },
      },
      {
        title: "Glucosa en ayunas elevada: revise estilo de vida y medicación",
        explanation:
          "Su glucosa en ayunas de 142 mg/dL supera el rango objetivo de 70-100 mg/dL. Aunque Metformin ayuda, su médico puede sugerir cambios en la dieta o revisar la dosis.",
        action: "Comparta esta lectura en su próxima consulta para ajustar el tratamiento si es necesario.",
      },
    ],
    labs: [
      "Sus riñones no están filtrando los desechos tan bien como deberían. Los niveles normales están por debajo de 1.3 mg/dL.",
      "Su tasa de filtración renal está moderadamente reducida. Valores por debajo de 60 indican función renal reducida.",
      "Confirma que sus riñones trabajan más de lo normal para eliminar desechos de la sangre.",
      "Su azúcar en sangre está por encima del rango normal. Su Metformin se receta para ayudar a controlarla.",
      "Su recuento de glóbulos rojos es saludable. No hay signos de anemia.",
    ],
    doctor_questions: [
      "Mi creatinina es 1.8 mg/dL y mi eGFR es 52. ¿Es seguro el Ibuprofen para mis riñones o debo cambiar a Paracetamol?",
      "¿Debe ajustarse mi dosis de Metformin dado que mi eGFR se acerca al límite de 45?",
      "¿Con qué frecuencia debo repetir mi análisis de función renal (creatinina y eGFR)?",
      "Mi glucosa en ayunas es 142 mg/dL con Metformin. ¿Debemos modificar mi dieta o la dosis?",
      "¿Hay alimentos, bebidas o medicamentos sin receta que deba evitar para proteger mis riñones?",
    ],
  },
};

const B: Record<"hi" | "es", Override> = {
  hi: {
    patient_summary:
      "आपके पर्चे में ब्लड प्रेशर, एसिडिटी, ब्लड शुगर और हड्डियों के स्वास्थ्य के लिए 4 दवाएं हैं। आपकी लैब रिपोर्ट ज़्यादातर सामान्य है, बस LDL कोलेस्ट्रॉल थोड़ा बढ़ा है, और दवा और लैब के बीच कोई खतरनाक टकराव नहीं मिला।",
    alerts: [
      {
        title: "अधिक खुराक वाला Vitamin D3: हफ्ते में एक बार लें, रोज़ नहीं",
        explanation:
          "Vitamin D3 60,000 IU अधिक खुराक वाला सप्लीमेंट है, जिसे हफ्ते में सिर्फ एक बार लेना होता है। इसे रोज़ लेने से विटामिन D विषाक्तता और कैल्शियम जमा होने का खतरा है।",
        action:
          "हफ्ते का एक दिन तय करें (जैसे हर रविवार सुबह) और उसी दिन यह गोली लें। इसे रोज़ न लें।",
        pathway: { mechanism: "रोज़ लेने पर ओवरडोज़", outcome: "विटामिन D विषाक्तता / उच्च कैल्शियम" },
      },
      {
        title: "LDL कोलेस्ट्रॉल सीमा पर: डॉक्टर से चर्चा करें",
        explanation:
          "आपका LDL कोलेस्ट्रॉल 138 mg/dL है (लक्ष्य 100 से कम)। आपको डायबिटीज़ भी है, इसलिए डॉक्टर कोलेस्ट्रॉल घटाने वाली दवा (स्टैटिन) पर विचार कर सकते हैं।",
        action:
          "डॉक्टर से पूछें कि आपके कोलेस्ट्रॉल के लिए जीवनशैली में बदलाव या कम खुराक वाली स्टैटिन उचित है या नहीं।",
      },
    ],
    labs: [
      "आपका कुल कोलेस्ट्रॉल सीमा पर ऊंचा है। सामान्य 200 mg/dL से कम होता है।",
      "आपका 'खराब' कोलेस्ट्रॉल लक्ष्य से ऊपर है। हृदय के लिए अच्छा आहार सुझाया जाता है।",
      "आपका 'अच्छा' कोलेस्ट्रॉल स्वस्थ सीमा में है।",
      "आपकी किडनी का कार्य पूरी तरह सामान्य है।",
      "आपका 3 महीने का औसत ब्लड शुगर डायबिटीज़ पर ठीक नियंत्रण दिखाता है (डायबिटीज़ वालों के लिए लक्ष्य आमतौर पर 7.0% से कम)।",
    ],
    doctor_questions: [
      "मेरा LDL कोलेस्ट्रॉल 138 mg/dL है। क्या हमें स्टैटिन जैसी कोलेस्ट्रॉल घटाने वाली दवा जोड़नी चाहिए?",
      "क्या Pantoprazole कम समय के लिए है या लंबे समय तक चलेगी?",
      "Metformin दिन में एक बार लेने पर मेरा HbA1c 6.8% है। क्या यह लक्ष्य पर है, या खुराक बदलनी चाहिए?",
      "दोबारा जांच से पहले मुझे साप्ताहिक Vitamin D3 60,000 IU कितने समय तक लेनी चाहिए?",
    ],
  },
  es: {
    patient_summary:
      "Su receta contiene 4 medicamentos para la presión arterial, el reflujo ácido, el azúcar en sangre y la salud ósea. Su análisis es mayormente saludable, con el colesterol LDL ligeramente elevado, y no se detectaron conflictos peligrosos entre medicamentos y análisis.",
    alerts: [
      {
        title: "Vitamin D3 de dosis alta: tomar semanalmente, NO a diario",
        explanation:
          "Vitamin D3 60,000 IU es un suplemento de dosis alta que debe tomarse UNA VEZ POR SEMANA. Tomarlo a diario puede causar toxicidad por vitamina D y acumulación de calcio.",
        action:
          "Elija un día fijo cada semana (por ejemplo, cada domingo por la mañana) para tomar esta pastilla. No la tome todos los días.",
        pathway: { mechanism: "Sobredosis si se toma a diario", outcome: "Toxicidad por vitamina D / calcio alto" },
      },
      {
        title: "LDL límite alto: converse con su médico",
        explanation:
          "Su colesterol LDL es 138 mg/dL (el objetivo es menos de 100). Como también tiene diabetes, su médico puede evaluar un medicamento para bajar el colesterol (estatina).",
        action:
          "Pregunte a su médico si son adecuados cambios de estilo de vida o una estatina de dosis baja para su colesterol.",
      },
    ],
    labs: [
      "Su colesterol total está en el límite alto. Lo normal es menos de 200 mg/dL.",
      "Su colesterol 'malo' está por encima del objetivo. Se recomienda una dieta saludable para el corazón.",
      "Su colesterol 'bueno' está en un rango saludable.",
      "Su función renal es completamente normal.",
      "Su promedio de azúcar de 3 meses muestra un control aceptable de la diabetes (el objetivo habitual es menos de 7.0%).",
    ],
    doctor_questions: [
      "Mi colesterol LDL es 138 mg/dL. ¿Deberíamos añadir un medicamento como una estatina?",
      "¿Pantoprazole es un tratamiento corto o a largo plazo?",
      "Mi HbA1c es 6.8% con Metformin una vez al día. ¿Está en el objetivo o debemos ajustar la dosis?",
      "¿Cuánto tiempo debo continuar con Vitamin D3 60,000 IU semanal antes de repetir el análisis?",
    ],
  },
};

const OVERRIDES = { A, B };

export function getLocalizedSample(id: "A" | "B", lang: Language): AnalysisResult {
  const base = id === "A" ? SAMPLE_CASE_A : SAMPLE_CASE_B;
  if (lang === "en") return base;
  const o = OVERRIDES[id][lang];
  return {
    ...base,
    patient_summary: o.patient_summary,
    safety_alerts: base.safety_alerts.map((a, i) => {
      const t = o.alerts[i];
      if (!t) return a;
      return {
        ...a,
        title: t.title,
        explanation: t.explanation,
        action: t.action,
        pathway: a.pathway && t.pathway ? { ...a.pathway, ...t.pathway } : a.pathway,
      };
    }),
    lab_markers: base.lab_markers.map((m, i) => ({ ...m, plain_meaning: o.labs[i] ?? m.plain_meaning })),
    doctor_questions: o.doctor_questions,
  };
}
