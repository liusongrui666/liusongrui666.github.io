"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import ImportDialog from "./ImportDialog";

export default function ImportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-card-hover hover:border-border-hover text-sm font-medium transition-colors"
      >
        <Upload className="w-4 h-4" />
        导入笔记
      </button>

      <ImportDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
