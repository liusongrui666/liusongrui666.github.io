"use client";

import { useState } from "react";
import { Plus, Github, Copy, Check, X, ExternalLink } from "lucide-react";

const REPO = "liusongrui666/liusongrui666.github.io";
const BRANCH = "main";

type FileType = "note" | "project" | "snippet";

interface NewFileButtonProps {
  type: FileType;
  defaultCategory?: string;
  variant?: "default" | "primary";
  className?: string;
}

const CATEGORY_OPTIONS = [
  { value: "cpp", label: "C / C++" },
  { value: "linux", label: "Linux" },
  { value: "algorithm", label: "算法" },
  { value: "database", label: "数据库" },
];

const LANGUAGE_OPTIONS = [
  "python",
  "cpp",
  "javascript",
  "typescript",
  "bash",
  "sql",
  "go",
  "rust",
  "java",
];

function buildNoteTemplate(category: string, slug: string, title: string, tags: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `---
title: ${title || "新笔记标题"}
description: 简短描述
date: ${today}
tags: [${tags}]
category: ${category}
slug: ${slug}
---

# 标题

从这里开始写正文。

## 小节

正文内容...
`;
}

function buildProjectTemplate(slug: string, title: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `---
title: ${title || "项目名称"}
description: 一句话描述
status: wip               # active | maintained | archived | wip
featured: false
startDate: ${today}
endDate:                   # 留空表示"至今"
techStack: []
tags: []
links: []
---

# 项目介绍

从这里写项目背景、目标、过程。
`;
}

function buildSnippetTemplate(slug: string, title: string, language: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `---
title: ${title || "代码片段标题"}
description: 一句话说明
language: ${language}
tags: []
createdAt: ${today}
updatedAt: ${today}
---

\`\`\`${language}
// 第一个代码块会自动作为"主代码"展示
\`\`\`

## 说明

用法、复杂度、注意事项等。
`;
}

function buildPath(type: FileType, category: string, slug: string): string {
  if (type === "note") return `content/notes/${category}/${slug}.md`;
  if (type === "project") return `content/projects/${slug}/index.md`;
  return `content/snippets/${slug}.md`;
}

function buildContent(type: FileType, category: string, slug: string, title: string, tags: string, language: string): string {
  if (type === "note") return buildNoteTemplate(category, slug, title, tags);
  if (type === "project") return buildProjectTemplate(slug, title);
  return buildSnippetTemplate(slug, title, language);
}

export default function NewFileButton({
  type,
  defaultCategory,
  variant = "default",
  className = "",
}: NewFileButtonProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(defaultCategory || CATEGORY_OPTIONS[0].value);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("python");
  const [copied, setCopied] = useState(false);

  const labelMap: Record<FileType, string> = {
    note: "新建笔记",
    project: "新建项目",
    snippet: "新建片段",
  };

  const path = slug.trim()
    ? buildPath(type, category, slug.trim())
    : buildPath(type, category, "your-slug");
  const content = buildContent(type, category, slug.trim() || "your-slug", title, tags, language);

  function openGitHub() {
    if (!slug.trim()) return;
    const url = `https://github.com/${REPO}/new/${BRANCH}?filename=${encodeURIComponent(
      path
    )}&value=${encodeURIComponent(content)}`;
    window.open(url, "_blank");
  }

  function copyTemplate() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "primary"
            ? `inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors ${className}`
            : `inline-flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:border-white hover:text-white transition-colors ${className}`
        }
      >
        <Plus className="w-4 h-4" />
        {labelMap[type]}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {labelMap[type]}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              填好后会跳转到 GitHub 创建新文件，模板已自动填好。
            </p>

            <div className="space-y-4">
              {type === "note" && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    分类
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-border bg-background text-white text-sm"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {type === "snippet" && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    语言
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-border bg-background text-white text-sm"
                  >
                    {LANGUAGE_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  文件名（slug）
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-")
                        .replace(/^-|-$/g, "")
                    )
                  }
                  placeholder="my-note"
                  className="w-full px-3 py-2 rounded border border-border bg-background text-white text-sm font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                  {path}
                </p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  标题（可选，留空则用文件名）
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={type === "project" ? "我的项目" : "新笔记标题"}
                  className="w-full px-3 py-2 rounded border border-border bg-background text-white text-sm"
                />
              </div>

              {type === "note" && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    标签（可选，逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tag1, tag2"
                    className="w-full px-3 py-2 rounded border border-border bg-background text-white text-sm"
                  />
                </div>
              )}
            </div>

            {/* 预览 */}
            <div className="mt-5">
              <div className="text-xs text-muted-foreground mb-1.5">
                模板预览
              </div>
              <pre className="p-3 rounded border border-border bg-background text-xs text-muted-foreground overflow-x-auto max-h-48 font-mono">
                {content}
              </pre>
            </div>

            {/* 操作按钮 */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openGitHub}
                disabled={!slug.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github className="w-4 h-4" />
                在 GitHub 创建
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={copyTemplate}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:border-white hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制模板
                  </>
                )}
              </button>
              <span className="text-xs text-muted-foreground ml-auto">
                本地：保存到 <code className="text-white">{path}</code>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
