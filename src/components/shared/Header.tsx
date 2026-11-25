"use client";

import { ShieldCheck, Lock, Globe, Volume2, VolumeX, Key } from "lucide-react";
import { Language } from "@/lib/translations";

interface HeaderProps {
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  isSpeaking?: boolean;
  onToggleSpeech?: () => void;
  canSpeak?: boolean;
  hasApiKey?: boolean;
  onOpenApiKeyModal?: () => void;
}

export default function Header({
  currentLang = "en",
  onLanguageChange,
  isSpeaking = false,
  onToggleSpeech,
  canSpeak = false,
  hasApiKey = false,
  onOpenApiKeyModal,
}: HeaderProps) {
  return (
    /* ROUND 11: no white bar, no divider — the header sits directly
       on the living gradient as one section with the hero. */
    <header className="app-header w-full sticky top-0 z-50 no-print backdrop-blur-xl bg-[#F0FBEF]/35">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* Logo & Clinical Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-white/40">
            <ShieldCheck className="w-6 h-6" />
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-[#0B1F1B] leading-none">
                RxGuard
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm shadow-emerald-600/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F4FBF6] animate-soft-pulse" />
                Live demo
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-[#5A7268] leading-tight mt-0.5">
              Prescription &amp; Diagnostic Lab Safety Decoder
            </p>
          </div>
        </div>

        {/* Right Tools: Language Picker, Speech Audio, Stateless Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Voice Speech Assistant Button */}
          {canSpeak && onToggleSpeech && (
            <button
              onClick={onToggleSpeech}
              title={isSpeaking ? "Stop Voice Assistant" : "Listen to Safety Report Aloud"}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 min-h-11 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isSpeaking
                  ? "bg-[#8C3B2E] text-white border-[#8C3B2E] animate-pulse"
                  : "bg-[#0B1F1B] hover:bg-[#12312A] text-white border-[#0B1F1B] shadow-lg shadow-[#0B1F1B]/20"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="hidden sm:inline">Listen Aloud</span>
                </>
              )}
            </button>
          )}

          {/* Language Selector (segmented, sliding pill) — dark pill on the gradient */}
          {onLanguageChange && (
            <div className="lang-switch relative grid grid-cols-3 bg-[#0B1F1B]/90 backdrop-blur p-0.5 rounded-xl border border-white/15 shadow-lg shadow-[#0B1F1B]/20 text-xs" role="group" aria-label="Language">
              <span
                aria-hidden
                className="lang-pill"
                style={{ transform: `translateX(${["en", "hi", "es"].indexOf(currentLang) * 100}%)` }}
              />
              {([["en", "EN"], ["hi", "हिन्दी"], ["es", "ES"]] as const).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLanguageChange(code)}
                  aria-pressed={currentLang === code}
                  className={`relative z-10 w-14 min-h-10 rounded-lg transition-colors ${
                    currentLang === code ? "text-[#0B1F1B] font-bold" : "text-[#9DB3A8] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* API Key Modal Button (Optional Developer Override) — dark pill */}
          {onOpenApiKeyModal && (
            <button
              onClick={onOpenApiKeyModal}
              title="Configure Custom AI API Key (Optional)"
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 min-h-11 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-lg shadow-[#0B1F1B]/20 ${
                hasApiKey
                  ? "bg-[#0B1F1B] text-white border-emerald-400/50 hover:bg-[#12312A]"
                  : "bg-[#0B1F1B] text-white border-[#0B1F1B] hover:bg-[#12312A]"
              }`}
            >
              <Key className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">
                {hasApiKey ? "AI Cloud Ready" : "API Key (Optional)"}
              </span>
            </button>
          )}

          {/* Privacy Badge — dark pill on the gradient */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-emerald-100 bg-[#0B1F1B]/90 backdrop-blur border border-white/15 rounded-full px-3 py-1 shadow-lg shadow-[#0B1F1B]/20">
            <Lock className="w-3 h-3 text-emerald-300" />
            <span>100% Stateless &amp; Zero DB</span>
          </div>
        </div>
      </div>
    </header>
  );
}
