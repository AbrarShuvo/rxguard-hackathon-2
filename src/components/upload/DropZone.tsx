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
            ? "border-emerald-300 bg-emerald-50/50 shadow-lg shadow-emerald-600/10"
            : isDragOver
            ? "border-emerald-500 bg-emerald-50 scale-[1.01]"
            : "border-gray-300 bg-white/90 hover:border-emerald-400 hover:bg-emerald-50/40 hover:shadow-lg hover:shadow-emerald-600/5 hover:-translate-y-0.5"
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
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-600 shadow ring-1 ring-emerald-100 text-[10px] font-black">✓</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-800 max-w-[200px] truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
          </div>
          <button
            onClick={handleRemove}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors mt-1"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="flex flex-col items-center gap-3 px-4 py-6">
          {step && (
            <span className="eyebrow rounded-full bg-gray-900 px-2.5 py-1 text-white shadow-sm">{step}</span>
          )}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center ring-1 ring-gray-200/80 group-hover:from-emerald-100 group-hover:to-teal-50 group-hover:ring-emerald-200 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-200 shadow-sm">
            {icon}
          </div>
          <div className="text-center">
            <p className="font-display text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">{bigLabel ?? label}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
              {hint ?? "Drag & drop or click to browse"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Upload className="w-3 h-3" /> Image / PDF
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3" /> Camera
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
