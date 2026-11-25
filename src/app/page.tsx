"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ClipboardList,
  FlaskConical,
  Search,
  ArrowLeft,
  Printer,
  Calendar,
  FileCode,
  Eye,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  Languages,
  Timer,
  FileSearch,
  CalendarCheck,
  TriangleAlert,
  ScanLine,
  HeartPulse,
  Stethoscope,
  Pill,
} from "lucide-react";
import Header from "@/components/shared/Header";
import Disclaimer from "@/components/shared/Disclaimer";
import DropZone from "@/components/upload/DropZone";
import SampleCaseButtons from "@/components/upload/SampleCaseButtons";
import LoadingAnalysis from "@/components/shared/LoadingAnalysis";
import { Reveal, CountUp, ScrollProgress } from "@/components/shared/Reveal";
import CaseStack from "@/components/landing/CaseStack";
import DashboardPreview from "@/components/landing/DashboardPreview";
import AlertBanner from "@/components/dashboard/AlertBanner";
import PatientSummary from "@/components/dashboard/PatientSummary";
import PillSchedule from "@/components/dashboard/PillSchedule";
import BiomarkerChart from "@/components/dashboard/BiomarkerChart";
import DoctorQuestions from "@/components/dashboard/DoctorQuestions";
import ContraindicationPathway from "@/components/dashboard/ContraindicationPathway";
import SourceDocumentModal from "@/components/dashboard/SourceDocumentModal";
import ApiKeyModal from "@/components/shared/ApiKeyModal";
import { AnalysisResult } from "@/types/analysis";
import { getLocalizedSample } from "@/lib/sample-data-i18n";
import { generateFhirBundle } from "@/lib/fhir-export";
import { generateMedicationCalendarIcs } from "@/lib/calendar-export";
import { Language, TRANSLATIONS } from "@/lib/translations";

type AppState = "upload" | "loading" | "results" | "error";
type TranslateStatus = "idle" | "loading" | "ok" | "failed";

// In-memory only: key = hash(result JSON) + language
const TRANSLATION_CACHE = new Map<string, AnalysisResult>();
const hashKey = (r: AnalysisResult, lang: string) => {
  const str = JSON.stringify(r);
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return `${h}:${str.length}:${lang}`;
};

const mergeTranslation = (r: AnalysisResult, d: any): AnalysisResult => ({
  ...r,
  patient_summary: d.summary ?? r.patient_summary,
  safety_alerts: r.safety_alerts.map((a, i) => ({ ...a, ...(d.alerts?.[i] ?? {}) })),
  lab_markers: r.lab_markers.map((m, i) => ({ ...m, plain_meaning: d.labs?.[i] ?? m.plain_meaning })),
  doctor_questions: r.doctor_questions.map((q, i) => d.questions?.[i] ?? q),
});

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [labReportFile, setLabReportFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeCaseType, setActiveCaseType] = useState<"A" | "B">("A");
  const [errorMsg, setErrorMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [hasServerKey, setHasServerKey] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sampleId, setSampleId] = useState<"A" | "B" | null>(null);
  const [tState, setTState] = useState<{ key: string; status: "ok" | "failed"; data?: AnalysisResult } | null>(null);

  const t = TRANSLATIONS[currentLang];
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Uploads in a non-English language need AI translation; samples use static data.
  const needsTranslation = appState === "results" && !!result && !sampleId && currentLang !== "en";
  const tKey = useMemo(() => (needsTranslation && result ? hashKey(result, currentLang) : null), [needsTranslation, result, currentLang]);
  const cached = tKey ? TRANSLATION_CACHE.get(tKey) : undefined;
  const tStatus: TranslateStatus = !tKey
    ? "idle"
    : cached
    ? "ok"
    : tState?.key === tKey
    ? tState.status
    : "loading";
  const translated = cached ?? (tState?.key === tKey && tState.status === "ok" ? tState.data ?? null : null);

  const displayResult: AnalysisResult | null = result
    ? sampleId
      ? getLocalizedSample(sampleId, currentLang)
      : translated ?? result
    : null;

  // Debounced (300ms) AI translation with a 15s timeout; results cached in memory only
  useEffect(() => {
    if (!tKey || !result || TRANSLATION_CACHE.has(tKey)) return;
    const ctrl = new AbortController();
    let abortTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const debounce = setTimeout(async () => {
      abortTimer = setTimeout(() => ctrl.abort(), 15000);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang: currentLang,
            apiKey: apiKey || undefined,
            payload: {
              summary: result.patient_summary,
              alerts: result.safety_alerts.map((a) => ({ title: a.title, explanation: a.explanation, action: a.action })),
              labs: result.lab_markers.map((m) => m.plain_meaning),
              questions: result.doctor_questions,
            },
          }),
          signal: ctrl.signal,
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "failed");
        const merged = mergeTranslation(result, json.data);
        TRANSLATION_CACHE.set(tKey, merged);
        if (!cancelled) setTState({ key: tKey, status: "ok", data: merged });
      } catch {
        if (!cancelled) setTState({ key: tKey, status: "failed" });
      } finally {
        if (abortTimer) clearTimeout(abortTimer);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(debounce);
      if (abortTimer) clearTimeout(abortTimer);
      ctrl.abort();
    };
  }, [tKey, result, currentLang, apiKey]);

  // Load API key from localStorage and check if server has key configured
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("rxguard_gemini_api_key");
      if (stored) setApiKey(stored);
    }

    fetch("/api/analyze")
      .then((res) => res.json())
      .then((data) => {
        if (data?.hasServerKey) {
          setHasServerKey(true);
        }
      })
      .catch(() => {});
  }, []);

  // Stop speech if state leaves results
  useEffect(() => {
    if (appState !== "results" && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [appState]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!prescriptionFile && !labReportFile) {
      setErrorMsg("Please upload at least one document.");
      return;
    }

    setAppState("loading");
    setErrorMsg("");
    setSampleId(null);

    try {
      const body: Record<string, string> = {};

      if (prescriptionFile) {
        body.prescriptionFile = await fileToBase64(prescriptionFile);
        body.prescriptionMimeType = prescriptionFile.type || "image/jpeg";
      }
      if (labReportFile) {
        body.labReportFile = await fileToBase64(labReportFile);
        body.labReportMimeType = labReportFile.type || "image/jpeg";
      }
      if (apiKey) {
        body.apiKey = apiKey.trim();
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Analysis failed.");
      }

      setResult(json.data);
      setAppState("results");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setAppState("error");
    }
  };

  const handleSampleCase = async (caseId: "A" | "B") => {
    if (prescriptionFile || labReportFile) {
      if (!window.confirm("Discard your uploaded files and load the sample case?")) return;
      setPrescriptionFile(null);
      setLabReportFile(null);
    }
    setSampleId(caseId);
    setAppState("loading");
    setErrorMsg("");
    setActiveCaseType(caseId);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSampleCase: caseId }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load sample case.");
      }

      // Brief realistic delay for judges
      await new Promise((r) => setTimeout(r, 1400));

      setResult(json.data);
      setAppState("results");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load sample case.");
      setAppState("error");
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setAppState("upload");
    setSampleId(null);
    setPrescriptionFile(null);
    setLabReportFile(null);
    setResult(null);
    setErrorMsg("");
  };

  // Calendar .ics Export Handler
  const handleExportCalendar = () => {
    if (!result || result.medications.length === 0) return;
    const icsContent = generateMedicationCalendarIcs(result.medications);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rxguard-medication-routine.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // HL7 FHIR R4 JSON Export Handler
  const handleExportFhir = () => {
    if (!result) return;
    const fhirBundle = generateFhirBundle(result);
    const jsonString = JSON.stringify(fhirBundle, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rxguard-fhir-r4-bundle.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Web Speech API Assistant for Accessibility
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!displayResult) return;

    const criticalAlerts = displayResult.safety_alerts
      .filter((a) => a.severity === "CRITICAL")
      .map((a) => `Critical Alert: ${a.title}. ${a.explanation}. Recommended action: ${a.action}`)
      .join(". ");

    const medNames = displayResult.medications.map((m) => `${m.name}, ${m.purpose}`).join(". ");

    const textToRead = `RxGuard Safety Assessment. Overall summary: ${displayResult.patient_summary}. ${
      criticalAlerts ? `High Priority Warnings: ${criticalAlerts}.` : ""
    } Scheduled medications include: ${medNames}. Please consult your physician or pharmacist before making any medication changes.`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // ── Results View ──────────────────────────────────
  if (appState === "results" && result && displayResult) {
    const btn = `pressable flex items-center gap-1.5 text-xs font-semibold px-3.5 min-h-11 rounded-full border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${focusRing}`;
    return (
      <div className="min-h-screen flex flex-col">
        <Header
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          isSpeaking={isSpeaking}
          onToggleSpeech={handleToggleSpeech}
          canSpeak={true}
          hasApiKey={hasServerKey || !!apiKey}
          onOpenApiKeyModal={() => setIsKeyModalOpen(true)}
        />

        {/* Action Toolbar */}
        <div className="w-full bg-[#F0FBEF]/55 backdrop-blur-xl sm:sticky sm:top-14 z-40 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleReset}
              className={`flex items-center gap-1.5 text-xs font-semibold text-[#2C4A42] hover:text-emerald-700 transition-colors min-h-11 px-1 rounded-lg ${focusRing}`}
            >
              <ArrowLeft className="w-4 h-4" />
              {t.newAnalysis}
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className={`${btn} bg-[#F4FBF6]/70 hover:bg-[#EFFAF3]/80 text-[#2C4A42] border-[#0B5F51]/15`}
              >
                <Eye className="w-3.5 h-3.5 text-[#5A7268]" />
                <span>{t.sourceDocBtn}</span>
              </button>
              <button
                onClick={handleExportCalendar}
                className={`${btn} bg-[#F4FBF6]/70 hover:bg-[#EFFAF3]/80 text-[#2C4A42] border-[#0B5F51]/15`}
                title="Download .ics file for Google Calendar, Apple Calendar, or Outlook"
              >
                <Calendar className="w-3.5 h-3.5 text-[#5A7268]" />
                <span className="hidden sm:inline">{t.calendarExport}</span>
                <span className="sm:hidden">.ics</span>
              </button>
              <button
                onClick={handleExportFhir}
                className={`${btn} bg-[#F4FBF6]/70 hover:bg-[#EFFAF3]/80 text-[#2C4A42] border-[#0B5F51]/15`}
                title="Export a FHIR-style JSON bundle"
              >
                <FileCode className="w-3.5 h-3.5 text-[#5A7268]" />
                <span className="hidden sm:inline">{t.fhirExport}</span>
                <span className="sm:hidden">FHIR</span>
              </button>
              <button
                onClick={() => window.print()}
                className={`${btn} bg-[#0B1F1B] hover:bg-[#12312A] text-white border-[#0B1F1B]`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printCard}</span>
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10 patient-card space-y-8">
          {/* Translation status */}
          {!sampleId && currentLang !== "en" && tStatus !== "idle" && (
            <div
              role="status"
              className={`flex items-center gap-2 text-xs rounded-xl border px-3 py-2 no-print ${
                tStatus === "failed"
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-blue-50 border-blue-200 text-blue-900"
              }`}
            >
              {tStatus === "loading" && (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
                  Translating…
                </>
              )}
              {tStatus === "ok" && "Translated by AI. Verify with your doctor."}
              {tStatus === "failed" && "Translation unavailable, showing English."}
            </div>
          )}

          {/* Verdict — enters from the left */}
          <Reveal from="left" delay={0}>
            <PatientSummary result={displayResult} lang={currentLang} />
          </Reveal>

          {displayResult.safety_alerts.length > 0 && (
            <Reveal from="left" delay={100}>
              <AlertBanner alerts={displayResult.safety_alerts} />
            </Reveal>
          )}

          {displayResult.safety_alerts.length > 0 && (
            <Reveal from="left" delay={200}>
              <ContraindicationPathway alerts={displayResult.safety_alerts} lang={currentLang} />
            </Reveal>
          )}

          {/* Pill Timeline | Lab Biomarkers */}
          <div className="print-cols grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {displayResult.medications.length > 0 && (
              <Reveal from="left" delay={300}>
                <PillSchedule medications={displayResult.medications} alerts={displayResult.safety_alerts} />
              </Reveal>
            )}
            {displayResult.lab_markers.length > 0 && (
              <Reveal from="right" delay={380}>
                <BiomarkerChart markers={displayResult.lab_markers} />
              </Reveal>
            )}
          </div>

          {displayResult.doctor_questions.length > 0 && (
            <Reveal from="left" delay={460}>
              <DoctorQuestions questions={displayResult.doctor_questions} />
            </Reveal>
          )}

          {/* Print-only sign-off */}
          <div className="hidden print:block border-t-2 border-[#0B1F1B] pt-6 mt-8 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <div>
                <p className="font-bold">RxGuard Clinical Safety Report</p>
                <p className="text-[#5A7268]">De-Identified · Generated {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[#5A7268] text-[10px]">Page 1 of 1</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4 text-xs">
              <div className="border border-[#0B5F51]/30 p-3 rounded">
                <p className="font-bold text-[#2C4A42]">Attending Physician Sign-Off:</p>
                <div className="h-10"></div>
                <p className="border-t border-[#0B5F51]/25 pt-1 text-[10px] text-[#5A7268]">Doctor Signature &amp; Date</p>
              </div>
              <div className="border border-[#0B5F51]/30 p-3 rounded">
                <p className="font-bold text-[#2C4A42]">Dispensing Pharmacist Verification:</p>
                <div className="h-10"></div>
                <p className="border-t border-[#0B5F51]/25 pt-1 text-[10px] text-[#5A7268]">Pharmacist Signature &amp; Date</p>
              </div>
            </div>
          </div>
        </main>

        {/* Single medical disclaimer */}
        <Disclaimer />

        <SourceDocumentModal isOpen={isModalOpen} onClose={closeModal} caseType={activeCaseType} />
        <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} onKeySaved={setApiKey} />
      </div>
    );
  }

  // ── Loading View ──────────────────────────────────
  if (appState === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          hasApiKey={hasServerKey || !!apiKey}
          onOpenApiKeyModal={() => setIsKeyModalOpen(true)}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <LoadingAnalysis />
        </main>
        <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} onKeySaved={setApiKey} />
      </div>
    );
  }

  // Hero headline: split into two balanced lines so the type spans the full width
  const heroWords = t.heroTitle.split(" ");
  const heroHalf = Math.ceil(heroWords.length / 2);

  // ── Upload Landing View (default) ─────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        hasApiKey={hasServerKey || !!apiKey}
        onOpenApiKeyModal={() => setIsKeyModalOpen(true)}
      />

      <main className="relative flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-hidden">
        <div className="relative w-full max-w-7xl mx-auto space-y-12">
          {/* ── HERO: upload in the middle, over the full-page gradient ── */}
          <div className="relative px-4 sm:px-8 py-6 sm:py-8">

            <div className="relative mx-auto max-w-6xl space-y-5 text-center">
            <div className="hero-fade inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B1F1B] text-white text-xs font-bold shadow-lg shadow-[#0B1F1B]/25" style={{ animationDelay: "0ms" }}>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              CODEFESTTHON 2026 · HealthTech Track
              <span className="hidden min-[480px]:inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
                <span className="text-emerald-300">No login needed</span>
              </span>
            </div>
            <h2 className="font-display text-[clamp(2.75rem,7vw,5.75rem)] font-black tracking-tight leading-[1.05] text-[#0B1F1B]">
              {[heroWords.slice(0, heroHalf), heroWords.slice(heroHalf)].map((line, li) => (
                <span key={li} className="block">
                  {line.map((word, wi) => {
                    const i = li === 0 ? wi : heroHalf + wi;
                    return (
                      <span key={wi} className="hero-word-wrap">
                        <span className={`hero-word ${i === heroWords.length - 1 ? "text-gradient-animated" : ""}`} style={{ animationDelay: `${80 + i * 55}ms` }}>
                          {word}
                        </span>{" "}
                      </span>
                    );
                  })}
                </span>
              ))}
            </h2>
            {/* One signature moment: a heartbeat line draws itself once, then stays */}
            <svg className="hero-ecg mx-auto h-7 w-64 sm:w-80" viewBox="0 0 384 32" fill="none" aria-hidden>
              <path d="M4 16 H68 L78 11 L87 21 L96 16 H138 L147 16 L156 4 L165 28 L174 16 H228 L238 11 L247 21 L256 16 H380" pathLength={600} stroke="#0d9488" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="hero-fade text-base sm:text-lg text-[#3D5A50] max-w-xl mx-auto leading-relaxed" style={{ animationDelay: "200ms" }}>
              {t.heroSubtitle}
            </p>
            </div>

            <div className="relative mx-auto mt-6 max-w-3xl space-y-6 text-center">

            {/* ── THE upload — one big action, impossible to miss ── */}
            <div className="hero-panel space-y-3 pt-2">
              <p className="eyebrow text-emerald-700">Start here — drop your reports</p>
              <div className="relative rounded-[2rem] bg-[#F4FBF6]/70 p-2 sm:p-3 ring-1 ring-emerald-200/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DropZone
                    label={t.dropRxLabel}
                    bigLabel="Drop your prescription here"
                    icon={<ClipboardList className="w-6 h-6 text-emerald-600" />}
                    accept="image/*,.pdf"
                    file={prescriptionFile}
                    onFileSelect={setPrescriptionFile}
                    step="Step 1 · Prescription"
                    hint="Photo, scan or PDF — handwriting OK"
                  />
                  <DropZone
                    label={t.dropLabLabel}
                    bigLabel="Drop your lab report here"
                    icon={<FlaskConical className="w-6 h-6 text-teal-600" />}
                    accept="image/*,.pdf"
                    file={labReportFile}
                    onFileSelect={setLabReportFile}
                    step="Step 2 · Lab report"
                    hint="Blood / pathology report, photo or PDF"
                  />
                </div>
              </div>

              {/* Error Message */}
              {(errorMsg || appState === "error") && (
                <div className="animate-pop-in p-4 rounded-2xl bg-[#F6E9E4] border border-[#A44A3A]/25 text-sm text-[#7A3327] space-y-2 shadow-sm">
                  <div className="flex items-start gap-2">
                    <span>⚠️</span>
                    <span className="flex-1 leading-relaxed">
                      {errorMsg || "Something went wrong. Please check your file format and try again."}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
                    <button
                      type="button"
                      onClick={() => setIsKeyModalOpen(true)}
                      className="px-3 min-h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      🔑 Configure Custom API Key
                    </button>
                    <span className="text-xs text-[#5A7268]">
                      or try a sample case below
                    </span>
                  </div>
                </div>
              )}

              {/* Analyze CTA Button */}
              <div className="space-y-2">
                <button
                  onClick={handleAnalyze}
                  disabled={!prescriptionFile && !labReportFile}
                  className="btn-primary group w-full py-4 sm:py-5 px-6 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base sm:text-lg disabled:cursor-not-allowed"
                >
                  <Search className="w-5 h-5" />
                  {t.analyzeBtn}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
                <p className="text-center text-xs text-[#7A938A]">
                  {!prescriptionFile && !labReportFile
                    ? "Upload at least one document above — or jump straight to a sample case below."
                    : "Ready — your files are processed in memory and never stored."}
                </p>
              </div>

              {/* Quiet sample cases — the upload is the star now */}
              <SampleCaseButtons
                onSelect={handleSampleCase}
                disabled={false}
              />
            </div>

            {/* Trust stats — count up when scrolled into view */}
            <div className="hero-fade grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-left" style={{ animationDelay: "520ms" }}>
              {[
                { icon: FileSearch, num: 2, suffix: "", big: " docs", small: "checked together", tile: "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30", iconCls: "text-white" },
                { icon: TriangleAlert, num: null, big: "Drug × Lab", small: "conflict detection", tile: "bg-[#A44A3A] text-white shadow-lg shadow-[#A44A3A]/25", iconCls: "text-white" },
                { icon: Languages, num: 3, suffix: "", big: " languages", small: "EN · हिन्दी · ES", tile: "bg-teal-600 text-white shadow-lg shadow-teal-600/30", iconCls: "text-white" },
                { icon: Timer, num: 90, suffix: "", big: " seconds", small: "to a full verdict", tile: "bg-amber-500 text-white shadow-lg shadow-amber-500/30", iconCls: "text-white" },
              ].map((x) => (
                <div key={x.big} className="card-lift rounded-2xl bg-[#F4FBF6]/90 border border-[#0B5F51]/10 px-3 py-3 shadow-sm">
                  <span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${x.tile}`}><x.icon className={`w-4 h-4 ${x.iconCls}`} aria-hidden /></span>
                  <p className="text-base font-black text-[#0B1F1B] leading-none">
                    {x.num !== null ? <CountUp to={x.num} /> : null}{x.big}
                  </p>
                  <p className="text-[11px] text-[#5A7268] mt-1 leading-tight">{x.small}</p>
                </div>
              ))}
            </div>
            </div>
          </div>

          {/* How it works — full-bleed band, alternating left/right rows */}
          <section className="-mx-4 sm:-mx-6 lg:-mx-8 border-y border-[#0B5F51]/10 bg-[#F4FBF6]/25 px-4 sm:px-6 lg:px-8 py-12">
            <div className="mx-auto max-w-7xl">
              <div className="pb-10 text-center">
                <p className="eyebrow text-emerald-700">How it works</p>
                <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-[#0B1F1B] sm:text-4xl">Three steps. One clear answer.</h2>
              </div>
              <div className="space-y-10">
            {[
              { n: "01", icon: ScanLine, title: "Drop the documents in", sub: "A photo, scan or PDF of the prescription and the lab report — handwriting OK. RxGuard reads both in memory and never stores them.", visual: "Prescription + Lab report", from: "left" as const },
              { n: "02", icon: HeartPulse, title: "Every drug meets every lab", sub: "The AI reads drug names, doses and biomarkers, then a deterministic rule engine cross-checks each medicine against each lab value — the check most tools skip.", visual: "Drug × Lab cross-check", from: "right" as const },
              { n: "03", icon: Stethoscope, title: "One plain-language verdict", sub: "STOP, CHECK or SAFE — with the reason, the one next step, a daily pill plan and questions to ask your doctor. No jargon, no login.", visual: "Verdict + daily plan", from: "left" as const },
            ].map((row) => (
              <Reveal key={row.n} from={row.from}>
                <div className={`flex flex-col ${row.from === "right" ? "sm:flex-row-reverse" : "sm:flex-row"} items-center gap-5 sm:gap-12`}>
                  <div className="flex-1 text-center sm:text-left">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1F1B] text-xs font-black text-white shadow-md">{row.n}</span>
                    <h3 className="mt-3 font-display text-2xl sm:text-3xl font-black tracking-tight text-[#0B1F1B]">{row.title}</h3>
                    <p className="mt-2 text-sm sm:text-base text-[#3D5A50] leading-relaxed max-w-xl mx-auto sm:mx-0">{row.sub}</p>
                  </div>
                  <div className="w-full sm:w-72 lg:w-80 shrink-0">
                    <div className="card-lift rounded-3xl border border-[#0B5F51]/12 bg-[#F4FBF6]/90 p-5 shadow-lg shadow-[#0B1F1B]/5 text-center">
                      <row.icon className="mx-auto h-8 w-8 text-emerald-600" aria-hidden />
                      <p className="mt-3 text-sm font-black text-[#0B1F1B]">{row.visual}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#7A938A]">Step {row.n} of 3</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
              </div>
            </div>
          </section>

          {/* Marquee ticker — drug & lab names, pause on hover */}
          <div className="marquee no-print -mx-4 sm:-mx-6 lg:-mx-8 border-y border-[#0B5F51]/10 bg-[#F4FBF6]/25 py-3" aria-hidden>
            <div className="marquee-track items-center gap-6 text-sm font-bold text-[#5A7268]">
              {[...Array(2)].map((_, dup) => (
                <span key={dup} className="flex items-center gap-6 pr-6">
                  {["Ibuprofen", "Metformin", "Atorvastatin", "Amlodipine", "Pantoprazole", "Vitamin D3", "Creatinine", "eGFR", "BUN", "Glucose", "Hemoglobin", "LDL", "HbA1c", "Cholesterol"].map((name) => (
                    <span key={`${dup}-${name}`} className="flex items-center gap-6 whitespace-nowrap">
                      <span className="font-mono">{name}</span>
                      <span className="text-[#A44A3A]">✚</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          {/* Sticky stacking case cards — scroll through the verdicts */}
          <CaseStack onSelect={handleSampleCase} />

          {/* Dashboard preview — bento glimpse of the real verdict view */}
          <DashboardPreview onRun={() => handleSampleCase("A")} />

          {/* Quiet final CTA */}
          <Reveal>
            <div className="rounded-3xl bg-[#0B1F1B]/80 backdrop-blur-sm px-6 py-10 text-center text-white shadow-2xl shadow-[#0B1F1B]/30">
              <p className="eyebrow text-emerald-300">No login · No storage · 90 seconds</p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight">Check a prescription before it&apos;s too late.</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#9DB3A8]">Drop your documents above, or run a sample case and watch the verdict land.</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSampleCase("A")}
                  className="btn-primary pressable inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white"
                >
                  <Pill className="h-4 w-4" aria-hidden /> Run Case A — the critical one
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="pressable inline-flex min-h-11 items-center gap-2 rounded-full border border-[#F4FBF6]/25 px-6 py-3 text-sm font-bold text-white hover:bg-[#F4FBF6]/10"
                >
                  Back to the upload
                </button>
              </div>
            </div>
          </Reveal>

          {/* Trust, Security & Privacy Indicators */}
          <div className="pt-3 border-t border-[#0B5F51]/10 flex flex-wrap items-center justify-center gap-2 text-xs">
            {["Zero login required", "100% in-memory processing", "FHIR-style JSON & .ics export", "Works on any phone"].map((x) => (
              <span key={x} className="inline-flex items-center gap-1.5 rounded-full bg-[#F4FBF6]/80 border border-[#0B5F51]/12 px-3 py-1.5 font-semibold text-[#3D5A50] shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {x}
              </span>
            ))}
          </div>
        </div>
      </main>

      <Disclaimer />

      {/* Gemini API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={setApiKey}
      />
    </div>
  );
}
