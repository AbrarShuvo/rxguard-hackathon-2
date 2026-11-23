"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, Camera } from "lucide-react";

interface DropZoneProps {
  label: string;
  icon: React.ReactNode;
  accept: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export default function DropZone({
  label,
  icon,
  accept,
  file,
  onFileSelect,
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
        upload-card ${isDragOver ? "is-drag" : ""}
        relative flex flex-col items-center justify-center
        w-full min-h-[180px] rounded-xl border-2 border-dashed
        transition-all duration-200 cursor-pointer
        ${
          file
            ? "border-emerald-300 bg-emerald-50/50"
            : isDragOver
            ? "border-emerald-500 bg-emerald-50 scale-[1.01]"
            : "border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/30"
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
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600" />
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
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            {icon}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            <p className="text-xs text-gray-400 mt-1">
              Drag &amp; drop or click to browse
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
