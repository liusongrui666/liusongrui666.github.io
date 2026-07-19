"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Settings, Github, Loader2 } from "lucide-react";

declare global {
  interface Window {
    giscus?: (...args: unknown[]) => void;
  }
}

interface CommentsProps {
  /** 用作 giscus term 的标识 */
  term: string;
  /** 页面标题，会显示在评论区 */
  title: string;
}

/**
 * Giscus 评论组件
 *
 * 启用步骤（推荐）：
 *   1. 打开 https://giscus.app/zh-CN
 *   2. 按指引选择你的 GitHub 仓库（需要开启 Discussions）
 *   3. 复制 repo / repoId / category / categoryId
 *   4. 在 Vercel 项目 → Settings → Environment Variables 添加：
 *      - NEXT_PUBLIC_GISCUS_REPO=liusongrui666/liusongrui666.github.io
 *      - NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxxx
 *      - NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
 *      - NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxxx
 *   5. 重新部署
 *
 * 未配置时会显示引导卡片，不影响页面布局
 */
export default function Comments({ term, title }: CommentsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);

  const repo =
    process.env.NEXT_PUBLIC_GISCUS_REPO || "liusongrui666/liusongrui666.github.io";
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "General";
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  useEffect(() => {
    setConfigured(Boolean(repoId && categoryId));
  }, [repoId, categoryId]);

  useEffect(() => {
    if (!configured || !ref.current) return;

    // 清理旧实例
    ref.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId!);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId!);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", term);
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "dark");
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("data-loading", "lazy");

    ref.current.appendChild(script);

    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [configured, repo, repoId, category, categoryId, term]);

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4 inline-flex items-center gap-1.5">
        <MessageCircle className="w-3.5 h-3.5" />
        评论
      </h2>

      {configured === null ? (
        <div className="p-6 rounded-xl border border-border bg-card text-center text-muted-foreground text-sm">
          <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
          加载中...
        </div>
      ) : configured ? (
        <div ref={ref} className="rounded-xl border border-border bg-card p-4 min-h-[200px]" />
      ) : (
        <div className="p-6 rounded-xl border border-dashed border-border bg-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white mb-1">评论系统未启用</h3>
              <p className="text-sm text-muted-foreground mb-3">
                基于 <a href="https://giscus.app/zh-CN" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">Giscus</a>（GitHub Discussions）实现，零后端、免维护。
              </p>
              <div className="text-xs text-muted-foreground space-y-1 mb-3">
                <p>启用步骤：</p>
                <ol className="list-decimal list-inside space-y-0.5 pl-1">
                  <li>在 GitHub 仓库开启 Discussions 功能</li>
                  <li>访问 <a href="https://giscus.app/zh-CN" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">giscus.app</a> 获取配置</li>
                  <li>在 Vercel 项目添加 4 个环境变量：<br />
                    <code className="px-1 py-0.5 rounded bg-white/10 text-white">NEXT_PUBLIC_GISCUS_REPO</code>、
                    <code className="px-1 py-0.5 rounded bg-white/10 text-white">_REPO_ID</code>、
                    <code className="px-1 py-0.5 rounded bg-white/10 text-white">_CATEGORY</code>、
                    <code className="px-1 py-0.5 rounded bg-white/10 text-white">_CATEGORY_ID</code>
                  </li>
                  <li>重新部署</li>
                </ol>
              </div>
              <a
                href="https://giscus.app/zh-CN"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-card-hover text-sm text-foreground transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                去配置 Giscus
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
