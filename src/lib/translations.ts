// ============================================================================
// RxGuard — Multilingual Translation Dictionary
// Supports English, Hindi (हिन्दी), and Spanish (Español) for health equity.
// ============================================================================

export type Language = "en" | "hi" | "es";

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  statelessBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  dropRxLabel: string;
  dropLabLabel: string;
  dragDropHint: string;
  cameraHint: string;
  analyzeBtn: string;
  sampleCaseTitle: string;
  sampleCaseA: string;
  sampleCaseADesc: string;
  sampleCaseB: string;
  sampleCaseBDesc: string;
  newAnalysis: string;
  printCard: string;
  calendarExport: string;
  fhirExport: string;
  listenVoice: string;
  stopVoice: string;
  sourceDocBtn: string;
  severityCritical: string;
  severityWarning: string;
  severityInfo: string;
  pillRoutineTitle: string;
  morningSlot: string;
  afternoonSlot: string;
  nightSlot: string;
  labAnalysisTitle: string;
  doctorQuestionsTitle: string;
  disclaimerText: string;
  pathwayTitle: string;
  overviewTitle: string;
  riskHigh: string;
  riskAttention: string;
  riskRoutine: string;
  statCritical: string;
  statWarnings: string;
  statAbnormal: string;
  statMeds: string;
  pwMedicine: string;
  pwLab: string;
  pwOutcome: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: "RxGuard",
    tagline: "Prescription & Lab Safety Decoder",
    statelessBadge: "100% Stateless & Private",
    heroTitle: "Decode Your Prescription & Lab Report",
    heroSubtitle: "Upload your documents to catch medication conflicts, understand your lab results, and get a clear daily pill schedule.",
    dropRxLabel: "Prescription",
    dropLabLabel: "Diagnostic Lab Report",
    dragDropHint: "Drag & drop or click to browse",
    cameraHint: "Photo / Camera",
    analyzeBtn: "Analyze My Documents",
    sampleCaseTitle: "Or evaluate interactive sample cases",
    sampleCaseA: "Case A: Renal-NSAID Conflict",
    sampleCaseADesc: "Elevated Creatinine + Ibuprofen prescription. Catches a critical kidney safety risk.",
    sampleCaseB: "Case B: Routine Multi-Med Panel",
    sampleCaseBDesc: "4 common medications + blood panel. Demonstrates routine analysis with mild warnings.",
    newAnalysis: "New Analysis",
    printCard: "Print Patient Card",
    calendarExport: "Add to Calendar (.ics)",
    fhirExport: "Export FHIR JSON",
    listenVoice: "Listen (Speech)",
    stopVoice: "Stop Audio",
    sourceDocBtn: "Inspect Source Documents",
    severityCritical: "CRITICAL SAFETY RISK",
    severityWarning: "CLINICAL WARNING",
    severityInfo: "CLINICAL INFO",
    pillRoutineTitle: "Daily Pill Schedule",
    morningSlot: "Morning Routine",
    afternoonSlot: "Afternoon Routine",
    nightSlot: "Night Routine",
    labAnalysisTitle: "Biomarker Range Gauge",
    doctorQuestionsTitle: "Doctor Follow-Up Questions",
    disclaimerText: "Medical Disclaimer: RxGuard is an informational tool only and does not replace professional medical advice, diagnosis, or treatment. Always consult your doctor or pharmacist.",
    pathwayTitle: "Clinical Contraindication Pathway Graph",
    overviewTitle: "Patient Assessment Overview",
    riskHigh: "High Safety Risk Detected",
    riskAttention: "Requires Attention",
    riskRoutine: "Routine Profile",
    statCritical: "Critical",
    statWarnings: "Warnings",
    statAbnormal: "Abnormal labs",
    statMeds: "Medications",
    pwMedicine: "Medicine",
    pwLab: "Related lab",
    pwOutcome: "Potential outcome",
  },
  hi: {
    appName: "RxGuard",
    tagline: "पर्चे और लैब रिपोर्ट सुरक्षा विश्लेषक",
    statelessBadge: "100% सुरक्षित और गोपनीय",
    heroTitle: "अपना पर्चा और रक्त रिपोर्ट समझें",
    heroSubtitle: "दवाओं के दुष्प्रभाव से बचने, लैब रिपोर्ट समझने और दैनिक दवा समय सारिणी पाने के लिए दस्तावेज़ अपलोड करें।",
    dropRxLabel: "डॉक्टर का पर्चा",
    dropLabLabel: "लैब टेस्ट रिपोर्ट",
    dragDropHint: "यहाँ खींचें या फ़ाइल चुनें",
    cameraHint: "कैमरा / फोटो",
    analyzeBtn: "सुरक्षा जांच शुरू करें",
    sampleCaseTitle: "या नमूना मामलों का परीक्षण करें",
    sampleCaseA: "मामला अ: किडनी और दर्द निवारक संघर्ष",
    sampleCaseADesc: "बढ़ा हुआ क्रिएटिनिन + इबुप्रोफेन। किडनी को गंभीर खतरे से बचाता है।",
    sampleCaseB: "मामला ब: नियमित बहु-दवा पैनल",
    sampleCaseBDesc: "4 नियमित दवाएं + रक्त रिपोर्ट। सामान्य दैनिक दवा प्रबंधन।",
    newAnalysis: "नया विश्लेषण",
    printCard: "रोगी कार्ड प्रिंट करें",
    calendarExport: "कैलेंडर में जोड़ें (.ics)",
    fhirExport: "FHIR JSON निर्यात",
    listenVoice: "आवाज़ में सुनें",
    stopVoice: "आवाज़ रोकें",
    sourceDocBtn: "मूल दस्तावेज़ देखें",
    severityCritical: "गंभीर सुरक्षा चेतावनी",
    severityWarning: "सावधानी चेतावनी",
    severityInfo: "जानकारी",
    pillRoutineTitle: "दैनिक दवा समय सारिणी",
    morningSlot: "सुबह की दवाएं",
    afternoonSlot: "दोपहर की दवाएं",
    nightSlot: "रात की दवाएं",
    labAnalysisTitle: "बायोमार्कर्स और लैब परिणाम",
    doctorQuestionsTitle: "डॉक्टर से पूछने योग्य सवाल",
    disclaimerText: "चिकित्सा अस्वीकरण: RxGuard केवल सूचनात्मक सहायता के लिए है और पेशेवर चिकित्सकीय सलाह का विकल्प नहीं है। दवा बदलने से पहले डॉक्टर से संपर्क करें।",
    pathwayTitle: "दवा-अंग प्रतिकूल प्रभाव तंत्र",
    overviewTitle: "रोगी मूल्यांकन सारांश",
    riskHigh: "उच्च सुरक्षा जोखिम मिला",
    riskAttention: "ध्यान देने की ज़रूरत",
    riskRoutine: "सामान्य प्रोफ़ाइल",
    statCritical: "गंभीर",
    statWarnings: "चेतावनी",
    statAbnormal: "असामान्य जाँचें",
    statMeds: "दवाएं",
    pwMedicine: "दवा",
    pwLab: "संबंधित जाँच",
    pwOutcome: "संभावित परिणाम",
  },
  es: {
    appName: "RxGuard",
    tagline: "Decodificador de Recetas y Análisis de Laboratorio",
    statelessBadge: "100% Sin Estado y Privado",
    heroTitle: "Descifre su Receta y Reporte de Laboratorio",
    heroSubtitle: "Suba sus documentos para detectar contraindicaciones, entender sus análisis y obtener un horario diario claro de píldoras.",
    dropRxLabel: "Receta Médica",
    dropLabLabel: "Reporte de Laboratorio",
    dragDropHint: "Arrastre o haga clic para seleccionar",
    cameraHint: "Foto / Cámara",
    analyzeBtn: "Analizar Mis Documentos",
    sampleCaseTitle: "O pruebe casos de muestra interactivos",
    sampleCaseA: "Caso A: Conflicto Renal-AINE",
    sampleCaseADesc: "Creatinina elevada + Ibuprofeno recetado. Detecta riesgo renal crítico.",
    sampleCaseB: "Caso B: Panel Rutinario de Medicamentos",
    sampleCaseBDesc: "4 medicamentos comunes + análisis de sangre. Muestra rutina con alertas leves.",
    newAnalysis: "Nuevo Análisis",
    printCard: "Imprimir Tarjeta de Paciente",
    calendarExport: "Agregar a Calendario (.ics)",
    fhirExport: "Exportar FHIR JSON",
    listenVoice: "Escuchar (Voz)",
    stopVoice: "Detener Voz",
    sourceDocBtn: "Ver Documentos Originales",
    severityCritical: "RIESGO CRÍTICO DE SEGURIDAD",
    severityWarning: "ADVERTENCIA CLÍNICA",
    severityInfo: "INFORMACIÓN",
    pillRoutineTitle: "Horario Diario de Medicación",
    morningSlot: "Rutina Matutina",
    afternoonSlot: "Rutina Vespertina",
    nightSlot: "Rutina Nocturna",
    labAnalysisTitle: "Análisis de Biomarcadores",
    doctorQuestionsTitle: "Preguntas para su Médico",
    disclaimerText: "Aviso Médico: RxGuard es una herramienta puramente informativa y no reemplaza el consejo médico profesional. Consulte a su médico antes de realizar cambios.",
    pathwayTitle: "Gráfico de Vía Fisiológica de Contraindicación",
    overviewTitle: "Resumen de Evaluación del Paciente",
    riskHigh: "Riesgo de Seguridad Alto Detectado",
    riskAttention: "Requiere Atención",
    riskRoutine: "Perfil Rutinario",
    statCritical: "Críticas",
    statWarnings: "Advertencias",
    statAbnormal: "Análisis anormales",
    statMeds: "Medicamentos",
    pwMedicine: "Medicamento",
    pwLab: "Análisis relacionado",
    pwOutcome: "Posible resultado",
  },
};
