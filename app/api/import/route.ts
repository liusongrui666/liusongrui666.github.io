import { NextResponse } from "next/server";
import matter from "gray-matter";
import { parseMarkdownText, writeNotesLocally } from "@/lib/import";
import { isGitHubConfigured, commitFiles } from "@/lib/github";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * 统一导入接口
 * 支持两种模式：
 *   1. multipart/form-data：
 *      - file: 单个或多个 .md / .mdx 文件，或 .zip (Notion 导出)
 *      - category: 目标分类
 *      - source: "markdown" | "notion"（不传则自动识别）
 *   2. JSON body: { markdown: string, category: string, filename: string }
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      return await handleFormData(request);
    }

    if (contentType.includes("application/json")) {
      return await handleJson(request);
    }

    return NextResponse.json(
      { error: "不支持的 Content-Type" },
      { status: 400 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "导入失败: " + (e as Error).message },
      { status: 500 }
    );
  }
}

async function handleFormData(request: Request) {
  const formData = await request.formData();
  const category = (formData.get("category") as string) || "uncategorized";
  const sourceHint = (formData.get("source") as string) || "";
  const files = formData.getAll("file") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "未提供文件" }, { status: 400 });
  }

  // 收集所有 markdown 文本
  const mdTexts: Array<{ filename: string; text: string }> = [];
  let zipBuffer: Buffer | null = null;

  for (const file of files) {
    const name = (file as File).name || "untitled";
    if (/\.(md|markdown|mdx)$/i.test(name)) {
      const text = await (file as File).text();
      mdTexts.push({ filename: name, text });
    } else if (/\.zip$/i.test(name)) {
      const ab = await (file as File).arrayBuffer();
      zipBuffer = Buffer.from(ab);
    }
  }

  const isVercel = !!process.env.VERCEL;

  // 处理 Notion zip
  if (zipBuffer) {
    const { parseNotionZip } = await import("@/lib/import");
    const result = await parseNotionZip(zipBuffer);
    return await finalizeImport({
      notes: result.notes,
      warnings: result.warnings,
      category,
      hasAssets: result.hasAssets,
      isVercel,
    });
  }

  // 处理 Markdown
  if (mdTexts.length === 0) {
    return NextResponse.json(
      { error: "未找到可导入的文件" },
      { status: 400 }
    );
  }

  const notes = mdTexts.map((m) => parseMarkdownText(m.text, m.filename));
  return await finalizeImport({
    notes,
    warnings: [],
    category,
    hasAssets: false,
    isVercel,
  });
}

async function handleJson(request: Request) {
  const body = (await request.json()) as {
    markdown?: string;
    category?: string;
    filename?: string;
  };

  if (!body.markdown || !body.filename) {
    return NextResponse.json(
      { error: "缺少 markdown 或 filename 字段" },
      { status: 400 }
    );
  }

  const note = parseMarkdownText(body.markdown, body.filename);
  const isVercel = !!process.env.VERCEL;

  return await finalizeImport({
    notes: [note],
    warnings: [],
    category: body.category || "uncategorized",
    hasAssets: false,
    isVercel,
  });
}

async function finalizeImport(params: {
  notes: import("@/lib/import").ImportNote[];
  warnings: string[];
  category: string;
  hasAssets: boolean;
  isVercel: boolean;
}) {
  const { notes, warnings, category, hasAssets, isVercel } = params;

  if (isVercel) {
    // Vercel 部署环境：通过 GitHub API 提交
    if (!isGitHubConfigured()) {
      return NextResponse.json(
        {
          error:
            "Vercel 部署环境需要配置 GITHUB_TOKEN 才能导入。请在 Vercel 项目 → Settings → Environment Variables 添加：\n- GITHUB_TOKEN (Personal Access Token with repo scope)\n- GITHUB_OWNER (liusongrui666)\n- GITHUB_REPO (liusongrui666-github-io)",
          needsGithubToken: true,
        },
        { status: 503 }
      );
    }

    const files = notes.map((n) => {
      const fm = matter.stringify(n.content, n.frontmatter);
      return {
        path: `content/notes/${category}/${n.slug}.md`,
        content: fm,
        encoding: "utf-8" as const,
      };
    });

    const result = await commitFiles(
      files,
      `feat(notes): 通过导入功能新增 ${notes.length} 篇笔记 - ${category}`
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "提交到 GitHub 失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: "github",
      count: notes.length,
      notes: notes.map((n) => ({
        slug: n.slug,
        title: n.frontmatter.title,
        url: `/notes/${category}/${n.slug}`,
      })),
      warnings,
      commitUrl: result.commitUrl,
      message: "已提交到 GitHub，Vercel 将在几秒后自动重新部署",
    });
  }

  // 本地开发：直接写入文件系统
  const { written, errors } = writeNotesLocally(category, notes);
  return NextResponse.json({
    success: errors.length === 0,
    mode: "local",
    count: written.length,
    notes: notes.map((n, i) => ({
      slug: n.slug,
      title: n.frontmatter.title,
      url: written[i] || `/notes/${category}/${n.slug}`,
    })),
    written,
    errors,
    warnings,
    message:
      written.length > 0
        ? `已写入 ${written.length} 个文件。重启 dev server 后生效。`
        : "无文件写入",
  });
}
