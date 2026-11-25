"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, Camera } from "lucide-react";

interface DropZoneProps {
  label: string;
  /** Big, plain instruction shown in the empty state ("Drop your prescription here"). */
  bigLabel?: string;
  icon: React.ReactNode;
  accept: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  step?: string;
  hint?: string;
}

export default function DropZone({
  label,
  bigLabel,
  icon,
  accept,
  file,
  onFileSelect,
  step,
  hint,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null;
      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFileSelect(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onFileSelect]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        upload-card ${isDragOver ? "is-drag dropzone-hot" : ""}
        relative flex flex-col items-center justify-center
        w-full min-h-[220px] sm:min-h-[230px] rounded-3xl border-2 border-dashed
        transition-all duration-200 cursor-pointer group
        ${
          file
            ? "border-emerald-300 bg-emerald-50/50 backdrop-blur-md shadow-lg shadow-emerald-600/10"
            : isDragOver
            ? "border-emerald-500 bg-emerald-50/70 backdrop-blur-md scale-[1.01]"
            : "glass-panel border-[#0B5F51]/25 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-600/10 hover:-translate-y-0.5"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />

      {file ? (
        /* ── File Selected State ── */
        <div className="flex flex-col items-center gap-2 px-4 py-3">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 animate-pop-in">
            <FileText className="w-6 h-6" />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#F4FBF6]/80 backdrop-blur-sm text-emerald-600 shadow ring-1 ring-emerald-100 text-[10px] font-black">✓</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[#12312A] max-w-[200px] truncate">
              {file.name}
            </p>
            <p className="text-xs text-[#5A7268]">{formatSize(file.size)}</p>
          </div>
          <button
            onClick={handleRemove}
            className="flex items-center gap-1 text-xs text-[#A44A3A] hover:text-[#8C3B2E] transition-colors mt-1"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="flex flex-col items-center gap-3 px-4 py-6">
          {step && (
            <span className="eyebrow rounded-full bg-[#0B1F1B] px-2.5 py-1 text-white shadow-sm">{step}</span>
          )}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E3F2E9] to-[#EFFAF3] flex items-center justify-center ring-1 ring-[#0B5F51]/15 group-hover:from-emerald-100 group-hover:to-teal-50 group-hover:ring-emerald-200 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-200 shadow-sm">
            {icon}
          </div>
          <div className="text-center">
            <p className="font-display text-lg sm:text-xl font-extrabold text-[#0B1F1B] leading-tight">{bigLabel ?? label}</p>
            <p className="text-xs sm:text-sm text-[#5A7268] mt-1.5">
              {hint ?? "Drag & drop or click to browse"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#7A938A]">
            <span className="flex items-center gap-1">
              <Upload className="w-3 h-3" /> Image / PDF
            </span>
            <span className="text-[#9DB3A8]">|</span>
            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3" /> Camera
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
