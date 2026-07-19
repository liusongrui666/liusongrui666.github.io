"use client";

import { useState } from "react";
import { Save, Clock, Hash, FileText } from "lucide-react";

const STORAGE_KEY = "activity-draft";

interface TodayDraft {
  date: string;
  count: number;
  minutes: number;
  note: string;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ActivityLogger() {
  const [draft, setDraft] = useState<TodayDraft>(() => {
    if (typeof window === "undefined") {
      return { date: todayKey(), count: 1, minutes: 30, note: "" };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayKey()) return parsed;
      }
    } catch {}
    return { date: todayKey(), count: 1, minutes: 30, note: "" };
  });

  const [saved, setSaved] = useState(false);

  function update<K extends keyof TodayDraft>(key: K, value: TodayDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function saveDraft() {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function copyJSON() {
    if (typeof window === "undefined") return;
    const json = `  "${draft.date}": {\n    "count": ${draft.count},\n    "minutes": ${draft.minutes},\n    "note": "${draft.note.replace(/"/g, '\\"')}"\n  }`;
    navigator.clipboard.writeText(json);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-5 rounded-xl border border-border bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">记录今天</h3>
        <span className="text-xs text-muted-foreground font-mono">
          {draft.date}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Hash className="w-3 h-3" />
            完成数量
          </label>
          <input
            type="number"
            min={0}
            value={draft.count}
            onChange={(e) => update("count", Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded border border-border bg-background text-white font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3" />
            时长（分钟）
          </label>
          <input
            type="number"
            min={0}
            value={draft.minutes}
            onChange={(e) => update("minutes", Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded border border-border bg-background text-white font-mono"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <FileText className="w-3 h-3" />
          备注
        </label>
        <textarea
          value={draft.note}
          onChange={(e) => update("note", e.target.value)}
          placeholder="今天做了什么、卡在哪里、收获..."
          rows={3}
          className="w-full px-3 py-2 rounded border border-border bg-background text-white text-sm resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={saveDraft}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-md hover:border-white transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          存到本地（草稿）
        </button>
        <button
          type="button"
          onClick={copyJSON}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
        >
          复制 JSON 片段
        </button>
        {saved && (
          <span className="text-xs text-green-400 self-center">
            ✓ 已保存
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        草稿仅存于浏览器。要永久保存，把复制的 JSON 粘贴到{" "}
        <code className="text-white">data/activity.json</code>，然后
        <code className="text-white mx-1">git add</code>·
        <code className="text-white mx-1">commit</code>·
        <code className="text-white mx-1">push</code>。
      </p>
    </div>
  );
}
