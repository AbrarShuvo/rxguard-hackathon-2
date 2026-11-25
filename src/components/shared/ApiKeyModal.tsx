"use client";

import { useState, useEffect } from "react";
import { Key, X, ExternalLink, Check, Eye, EyeOff } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  onKeySaved,
}: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("rxguard_gemini_api_key") || "";
      setKeyInput(stored);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = keyInput.trim();
    if (typeof window !== "undefined") {
      if (trimmed) {
        localStorage.setItem("rxguard_gemini_api_key", trimmed);
      } else {
        localStorage.removeItem("rxguard_gemini_api_key");
      }
    }
    onKeySaved(trimmed);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setKeyInput("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("rxguard_gemini_api_key");
    }
    onKeySaved("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04120E]/60 backdrop-blur-xs animate-fade-in no-print">
      <div className="relative w-full max-w-md bg-[#F4FBF6] rounded-3xl shadow-2xl overflow-hidden border border-[#0B5F51]/15 animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#0B5F51]/15 bg-[#EFFAF3]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1F1B]">
                AI Vision API Key Configuration
              </h3>
              <p className="text-[11px] text-[#5A7268]">
                Supports Anthropic Claude &amp; Google Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7A938A] hover:text-[#2C4A42] hover:bg-[#CDE7D8]/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-[#3D5A50] leading-relaxed">
            RxGuard uses <strong>Anthropic Claude Sonnet 5.5</strong>, <strong>OpenRouter</strong>, or <strong>Google Gemini</strong> to decode handwritten prescriptions and lab biomarkers.
            Your key is kept securely in your browser memory and never stored in any database.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#2C4A42] flex justify-between items-center">
              <span>API Key (Claude, OpenRouter, or Gemini)</span>
              <span className="text-[11px] text-[#7A938A]">sk-ant-..., sk-or-..., or AIza...</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                placeholder="sk-ant-..., sk-or-..., or AIzaSy..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2.5 pr-9 border border-[#0B5F51]/25 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A938A] hover:text-[#3D5A50]"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
            <p className="font-semibold">💡 No key right now?</p>
            <p>
              You can test the full end-to-end clinical workflow without a key by clicking the <strong>Sample Cases (Case A &amp; Case B)</strong> on the home screen!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-3 border-t border-[#0B5F51]/15 bg-[#EFFAF3] flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-[#5A7268] hover:text-red-600 transition-colors"
          >
            Clear Key
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[#3D5A50] hover:bg-[#CDE7D8]/60 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                "Save Key"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
