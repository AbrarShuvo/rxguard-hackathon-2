"use client";

import { Info } from "lucide-react";

export default function Disclaimer() {
  return (
    <footer className="w-full border-t border-amber-200 bg-amber-50/70 py-3 px-4 no-print">
      <div className="max-w-5xl mx-auto flex items-start gap-2 text-xs text-amber-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          <strong>Medical Disclaimer:</strong> RxGuard is an informational tool
          only and does <strong>not</strong> replace professional medical advice,
          diagnosis, or treatment. Always consult your doctor or pharmacist
          before making changes to your medications. Uploaded files are processed
          entirely in memory and are <strong>never stored</strong> on any server.
        </p>
      </div>
    </footer>
  );
}
