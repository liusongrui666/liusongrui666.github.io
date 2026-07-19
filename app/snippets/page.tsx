import Link from "next/link";
import { Code2, ArrowRight, Tag } from "lucide-react";
import {
  getAllSnippets,
  getAllSnippetLanguages,
  getAllSnippetTags,
} from "@/lib/snippets";

const LANG_COLORS: Record<string, string> = {
  python: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  javascript: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  typescript: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  tsx: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  jsx: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  cpp: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  c: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  java: "bg-red-500/20 text-red-300 border-red-500/30",
  go: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  rust: "bg-orange-600/20 text-orange-300 border-orange-600/30",
  shell: "bg-green-500/20 text-green-300 border-green-500/30",
  bash: "bg-green-500/20 text-green-300 border-green-500/30",
  sql: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  html: "bg-red-500/20 text-red-300 border-red-500/30",
  css: "bg-blue-400/20 text-blue-300 border-blue-400/30",
  json: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

function getLangColor(lang: string): string {
  return LANG_COLORS[lang.toLowerCase()] || "bg-white/5 text-muted-foreground border-border";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function SnippetsPage() {
  const snippets = getAllSnippets();
  const languages = getAllSnippetLanguages();
  const tags = getAllSnippetTags();

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white inline-flex items-center gap-3">
            <Code2 className="w-10 h-10" />
            代码片段
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-4">
            日常开发中常用的代码片段，按语言和用途分类整理。
          </p>
          <div className="flex items-center gap-6 text-sm text-muted">
            <span>共 {snippets.length} 个片段</span>
            <span>·</span>
            <span>{languages.length} 种语言</span>
            <span>·</span>
            <span>{tags.length} 个标签</span>
          </div>
        </div>

        {snippets.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-border text-center">
            <Code2 className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无片段</h3>
            <p className="text-muted-foreground text-sm">
              在 <code className="px-1.5 py-0.5 rounded bg-white/10 text-white">content/snippets/</code> 下添加 .md 文件即可
            </p>
          </div>
        ) : (
          <>
            {/* 语言筛选 */}
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                按语言
              </h2>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className={`text-xs font-mono px-2.5 py-1 rounded-md border ${getLangColor(lang)}`}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* 标签 */}
            {tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 inline-flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  标签
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 20).map((t) => (
                    <span
                      key={t.name}
                      className="text-xs px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-border"
                    >
                      #{t.name} <span className="text-muted-foreground/60">{t.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 片段列表 */}
            <div className="space-y-3">
              {snippets.map((s) => (
                <Link
                  key={s.slug}
                  href={`/snippets/${s.slug}`}
                  className="group block p-5 rounded-xl border border-border bg-card card-hover"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${getLangColor(s.language)}`}
                      >
                        {s.language}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(s.updatedAt)}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    {s.title}
                  </h3>
                  {s.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {s.description}
                    </p>
                  )}
                  {s.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {s.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
