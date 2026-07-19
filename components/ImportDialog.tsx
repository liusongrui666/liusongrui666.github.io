"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Package,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { CATEGORY_META } from "@/lib/categories";

interface ImportResult {
  success: boolean;
  mode?: "local" | "github";
  count: number;
  notes: Array<{ slug: string; title: string; url: string }>;
  message?: string;
  error?: string;
  warnings?: string[];
  commitUrl?: string;
  needsGithubToken?: boolean;
}

const categoryOptions = Object.entries(CATEGORY_META).map(([slug, meta]) => ({
  slug,
  name: meta.name,
}));

export default function ImportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [category, setCategory] = useState("cpp");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      // 关闭时清空
      setTimeout(() => {
        setFiles([]);
        setResult(null);
        setLoading(false);
      }, 300);
    }
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const arr: File[] = [];
    for (let i = 0; i < list.length; i++) {
      const f = list.item(i);
      if (f) arr.push(f);
    }
    setFiles(arr);
  }

  async function handleImport() {
    if (files.length === 0) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("category", category);
    for (const f of files) {
      formData.append("file", f);
    }

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({
        success: false,
        count: 0,
        notes: [],
        error: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const isZip = files.some((f) => /\.zip$/i.test(f.name));
  const isMd = files.some((f) => /\.(md|markdown|mdx)$/i.test(f.name));
  const fileType = isZip ? "zip" : isMd ? "markdown" : null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">导入笔记</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-white"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 分类选择 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              目标分类
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categoryOptions.map((opt) => (
                <button
                  key={opt.slug}
                  onClick={() => setCategory(opt.slug)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    category === opt.slug
                      ? "border-white bg-white text-black"
                      : "border-border text-muted-foreground hover:border-border-hover hover:text-white"
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* 上传区 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              上传文件
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-white bg-white/5"
                  : "border-border hover:border-border-hover hover:bg-white/5"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".md,.markdown,.mdx,.zip"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              {files.length === 0 ? (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-foreground mb-1">
                    点击或拖拽文件到此处
                  </p>
                  <p className="text-xs text-muted-foreground">
                    支持 .md / .mdx（多个）或 Notion 导出的 .zip 压缩包
                  </p>
                </>
              ) : (
                <div className="space-y-2 text-left">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 text-sm"
                    >
                      {/\.zip$/i.test(f.name) ? (
                        <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="flex-1 truncate text-foreground">
                        {f.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(f.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-2 text-center">
                    点击重新选择 /{" "}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles([]);
                      }}
                      className="text-white hover:underline"
                    >
                      清空
                    </button>
                  </p>
                </div>
              )}
            </div>
            {fileType === "zip" && (
              <p className="text-xs text-muted-foreground mt-2">
                ✓ 检测到 Notion 导出压缩包，将自动解析其中的 Markdown 与图片
              </p>
            )}
          </div>

          {/* 结果 */}
          {result && (
            <div
              className={`rounded-lg border p-4 ${
                result.success
                  ? "border-white/20 bg-white/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              {result.success ? (
                <>
                  <div className="flex items-center gap-2 mb-2 text-white">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">
                      成功导入 {result.count} 篇笔记
                    </span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-2">
                    {result.notes.map((n) => (
                      <li key={n.slug} className="truncate">
                        · {n.title}
                      </li>
                    ))}
                  </ul>
                  {result.message && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {result.message}
                    </p>
                  )}
                  {result.commitUrl && (
                    <a
                      href={result.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-white hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      在 GitHub 上查看 commit
                    </a>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">导入失败</span>
                  </div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {result.error}
                  </pre>
                </>
              )}
            </div>
          )}

          {/* 操作 */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-card-hover transition-colors"
            >
              {result?.success ? "完成" : "取消"}
            </button>
            <button
              onClick={handleImport}
              disabled={files.length === 0 || loading}
              className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  导入中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  开始导入
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
