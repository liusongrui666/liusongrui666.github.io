import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Snippet {
  slug: string;
  title: string;
  description?: string;
  language: string;
  tags: string[];
  code: string;
  /** Markdown 解释（code 之外的部分） */
  explanation: string;
  createdAt: string;
  updatedAt: string;
}

export interface SnippetSummary {
  slug: string;
  title: string;
  description?: string;
  language: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const SNIPPETS_DIR = path.join(process.cwd(), "content", "snippets");

function ensureDir(): void {
  if (!fs.existsSync(SNIPPETS_DIR)) {
    fs.mkdirSync(SNIPPETS_DIR, { recursive: true });
  }
}

/**
 * 从 Markdown 文件解析代码片段。
 *
 * 文件格式约定（简洁模式）：
 *   ```lang title
 *   // 实际代码...
 *   ```
 *
 * 或者 frontmatter 模式（推荐）：
 *   ---
 *   title: 快排
 *   language: python
 *   tags: [算法, 排序]
 *   ---
 *
 *   说明文字...
 *
 *   ```python
 *   def quick_sort(arr):
 *       ...
 *   ```
 */
function parseSnippet(slug: string, raw: string): Snippet {
  const { data, content } = matter(raw);

  // 从内容中提取第一个 fenced code block
  const codeMatch = /```(\w+)?[^\n]*\n([\s\S]*?)```/.exec(content);
  let language = (data.language as string) || "text";
  let code = "";
  let explanation = content;

  if (codeMatch) {
    if (!data.language && codeMatch[1]) language = codeMatch[1];
    code = codeMatch[2].trim();
    // 解释 = 第一个代码块前 + 第一个代码块后
    const beforeCode = content.slice(0, codeMatch.index).trim();
    const afterCode = content.slice(codeMatch.index + codeMatch[0].length).trim();
    explanation = [beforeCode, afterCode].filter(Boolean).join("\n\n");
  }

  const now = new Date().toISOString();
  return {
    slug,
    title: (data.title as string) || slug,
    description: (data.description as string) || undefined,
    language,
    tags: (data.tags as string[]) || [],
    code,
    explanation,
    createdAt: data.createdAt
      ? new Date(data.createdAt as string).toISOString()
      : now,
    updatedAt: data.updatedAt
      ? new Date(data.updatedAt as string).toISOString()
      : now,
  };
}

export function getAllSnippets(): SnippetSummary[] {
  ensureDir();
  const files = fs
    .readdirSync(SNIPPETS_DIR)
    .filter((f) => /\.mdx?$/.test(f));
  const snippets: Snippet[] = [];
  for (const f of files) {
    const slug = f.replace(/\.mdx?$/, "");
    const raw = fs.readFileSync(path.join(SNIPPETS_DIR, f), "utf-8");
    snippets.push(parseSnippet(slug, raw));
  }
  return snippets
    .map(({ code, explanation, ...summary }) => summary)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getSnippet(slug: string): Snippet | null {
  ensureDir();
  for (const ext of [".md", ".mdx"]) {
    const p = path.join(SNIPPETS_DIR, `${slug}${ext}`);
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf-8");
      return parseSnippet(slug, raw);
    }
  }
  return null;
}

export function getAllSnippetSlugs(): string[] {
  ensureDir();
  return fs
    .readdirSync(SNIPPETS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

export function getAllSnippetLanguages(): string[] {
  const all = getAllSnippets();
  return Array.from(new Set(all.map((s) => s.language))).sort();
}

export function getAllSnippetTags(): Array<{ name: string; count: number }> {
  const all = getAllSnippets();
  const map = new Map<string, number>();
  for (const s of all) {
    for (const t of s.tags) {
      map.set(t, (map.get(t) || 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
