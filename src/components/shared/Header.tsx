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
    <header className="app-header w-full border-b border-[color:var(--hairline)] bg-white/80 backdrop-blur-md sticky top-0 z-50 no-print">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* Logo & Clinical Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-gray-900 leading-none">
                RxGuard
              </h1>
            </div>
            <p className="hidden sm:block text-[11px] text-gray-500 leading-tight mt-0.5">
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
                  ? "bg-red-50 text-red-700 border-red-300 animate-pulse"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden sm:inline">Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Listen Aloud</span>
                </>
              )}
            </button>
          )}

          {/* Language Selector (segmented, sliding pill) */}
          {onLanguageChange && (
            <div className="lang-switch relative grid grid-cols-3 bg-gray-100/80 p-0.5 rounded-xl border border-[color:var(--hairline)] text-xs" role="group" aria-label="Language">
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
                    currentLang === code ? "text-gray-900 font-bold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* API Key Modal Button (Optional Developer Override) */}
          {onOpenApiKeyModal && (
            <button
              onClick={onOpenApiKeyModal}
              title="Configure Custom AI API Key (Optional)"
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 min-h-11 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                hasApiKey
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Key className={`w-3.5 h-3.5 ${hasApiKey ? "text-emerald-600" : "text-gray-500"}`} />
              <span className="hidden sm:inline">
                {hasApiKey ? "AI Cloud Ready" : "API Key (Optional)"}
              </span>
            </button>
          )}

          {/* Privacy Badge */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 rounded-full px-3 py-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>100% Stateless &amp; Zero DB</span>
          </div>
        </div>
      </div>
    </header>
  );
}
