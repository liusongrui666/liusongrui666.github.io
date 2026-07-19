"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-md hover:border-white transition-colors"
    >
      <Printer className="w-3.5 h-3.5" />
      打印 / 存为 PDF
    </button>
  );
}
