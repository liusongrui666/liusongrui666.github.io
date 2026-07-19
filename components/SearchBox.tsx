"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, FileText, Loader2 } from "lucide-react";

interface SearchHit {
  title: string;
  description: string;
  category: string;
  categoryName: string;
  slug: string;
  date: string;
  readingTime: number;
  tags: string[];
  url: string;
}

export default function SearchBox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setHits([]);
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setHits([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setHits(data.results || []);
        setActiveIndex(0);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[activeIndex]) {
      router.push(hits[activeIndex].url);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-border text-sm text-muted-foreground hover:text-white transition-colors"
        aria-label="搜索"
      >
        <Search className="w-3.5 h-3.5" />
        <span>搜索笔记</span>
        <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-border text-muted">
          Ctrl K
        </kbd>
      </button>

      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5"
        aria-label="搜索"
      >
        <Search className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索笔记标题、标签、描述..."
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-muted-foreground"
              />
              {loading && <Loader2 className="w-4 h-4 text-muted animate-spin" />}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-white"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() === "" ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  输入关键词开始搜索
                </div>
              ) : hits.length === 0 && !loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  没有找到匹配 &quot;{query}&quot; 的笔记
                </div>
              ) : (
                <ul className="py-1">
                  {hits.map((hit, i) => (
                    <li key={hit.url}>
                      <Link
                        href={hit.url}
                        onClick={() => setOpen(false)}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                          i === activeIndex
                            ? "bg-white/10"
                            : "hover:bg-white/5"
                        }`}
                        onMouseEnter={() => setActiveIndex(i)}
                      >
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-medium text-white truncate">
                              {hit.title}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground uppercase">
                              {hit.categoryName}
                            </span>
                          </div>
                          {hit.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {hit.description}
                            </p>
                          )}
                          {hit.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {hit.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-border">↑</kbd>
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-border">↓</kbd>
                  切换
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-border">↵</kbd>
                  打开
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-border">esc</kbd>
                  关闭
                </span>
              </div>
              <span>共 {hits.length} 条结果</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
