"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground hover:bg-card hover:border-border-hover transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      返回上一页
    </button>
  );
}
