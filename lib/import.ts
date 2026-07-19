import fs from "fs";
import path from "path";
import matter from "gray-matter";
import JSZip from "jszip";

export interface ImportNote {
  /** 文件名（不含扩展名）作为 slug */
  slug: string;
  /** Markdown 内容（不含 frontmatter） */
  content: string;
  /** 解析后的 frontmatter（可能为空） */
  frontmatter: {
    title: string;
    description?: string;
    date: string;
    tags?: string[];
  };
  /** 关联的图片资源（相对路径 -> base64 编码或 url） */
  assets: Array<{ name: string; path: string; data?: Buffer }>;
}

export interface ImportResult {
  notes: ImportNote[];
  warnings: string[];
  /** 是否有 zip 内图片资源 */
  hasAssets: boolean;
}

const NOTES_ROOT = path.join(process.cwd(), "content", "notes");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.mdx?$/, "")
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `note-${Date.now()}`;
}

function ensureUniqueSlug(slug: string, existing: Set<string>): string {
  let s = slug;
  let i = 2;
  while (existing.has(s)) {
    s = `${slug}-${i++}`;
  }
  existing.add(s);
  return s;
}

function extractTitle(content: string, filename: string): string {
  const headingMatch = /^#\s+(.+)$/m.exec(content);
  if (headingMatch) return headingMatch[1].trim();
  return filename
    .replace(/\.mdx?$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function normalizeFrontmatter(
  data: Record<string, unknown>,
  fallbackTitle: string
): ImportNote["frontmatter"] {
  const today = new Date().toISOString().slice(0, 10);
  return {
    title: (data.title as string) || fallbackTitle,
    description: (data.description as string) || undefined,
    date: data.date
      ? new Date(data.date as string).toISOString()
      : new Date().toISOString(),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : undefined,
  };
}

/**
 * 解析单个 Markdown 文本
 */
export function parseMarkdownText(
  text: string,
  filename: string
): ImportNote {
  const { data, content } = matter(text);
  const title = extractTitle(content, filename);
  return {
    slug: slugify(filename),
    content: content.trim(),
    frontmatter: normalizeFrontmatter(data, title),
    assets: [],
  };
}

/**
 * 解析 Notion 导出的 ZIP 压缩包
 * Notion 导出结构：
 *   Export-xxxxx/
 *     xxx.md
 *     xxx/                  (同名文件夹，存放图片等资源)
 *       image1.png
 *       image2.jpg
 *     yyy.md
 *     ...
 */
export async function parseNotionZip(buffer: Buffer): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(buffer);
  const warnings: string[] = [];
  const notes: ImportNote[] = [];
  const usedSlugs = new Set<string>();
  let hasAssets = false;

  // 收集所有 md/mdx 文件路径
  const mdFiles: string[] = [];
  zip.forEach((relativePath, file) => {
    if (file.dir) return;
    if (/\.(md|markdown|mdx)$/i.test(relativePath)) {
      mdFiles.push(relativePath);
    }
  });

  for (const mdPath of mdFiles) {
    // 跳过 Notion 自身的 index 等
    const baseName = path.basename(mdPath);
    if (/^index\.md$/i.test(baseName)) continue;

    try {
      const mdBuffer = await zip.file(mdPath)!.async("nodebuffer");
      let mdText = mdBuffer.toString("utf-8");

      // Notion 导出格式：YAML frontmatter 之前可能有 "Title: xxx" 注释
      // 转换 Notion 风格为标准 frontmatter
      mdText = convertNotionToMarkdown(mdText);

      const { data, content } = matter(mdText);
      const noteBaseName = baseName.replace(/\.mdx?$/i, "");
      const title = extractTitle(content, noteBaseName);

      // 查找同目录或同名文件夹下的图片资源
      const assets: ImportNote["assets"] = [];
      const noteDir = path.dirname(mdPath);
      const sameNameDir = path.join(noteDir, noteBaseName);
      const candidateDirs = [sameNameDir];

      zip.forEach((assetPath, assetFile) => {
        if (assetFile.dir) return;
        if (assetPath === mdPath) return;
        if (!/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(assetPath)) return;

        const inSameDir = path.dirname(assetPath) === noteDir;
        const inSameNameDir = path.dirname(assetPath) === sameNameDir;
        if (inSameDir || inSameNameDir || candidateDirs.some((d) => assetPath.startsWith(d + "/"))) {
          const fileName = path.basename(assetPath);
          // 暂存到内存，调用方按需处理
          assetFile.async("nodebuffer").then((buf) => {
            const a = assets.find((x) => x.path === fileName);
            if (a) a.data = buf;
          });
          assets.push({
            name: fileName,
            path: assetPath,
          });
          hasAssets = true;
        }
      });

      const slug = ensureUniqueSlug(slugify(noteBaseName), usedSlugs);
      notes.push({
        slug,
        content: content.trim(),
        frontmatter: normalizeFrontmatter(data, title),
        assets,
      });
    } catch (e) {
      warnings.push(`解析失败 ${mdPath}: ${(e as Error).message}`);
    }
  }

  return { notes, warnings, hasAssets };
}

/**
 * Notion 导出的 markdown 顶部可能有特殊元数据，转换为标准 frontmatter
 */
function convertNotionToMarkdown(text: string): string {
  // Notion 顶部常有 "Title: xxx\n\n" 格式
  const lines = text.split("\n");
  let i = 0;
  const meta: Record<string, string> = {};

  // 收集开头连续的 "Key: value" 行
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      break;
    }
    const m = /^([A-Za-z][A-Za-z0-9_\u4e00-\u9fa5]*)\s*:\s*(.+)$/.exec(line);
    if (m) {
      meta[m[1]] = m[2].trim();
      i++;
    } else {
      break;
    }
  }

  const rest = lines.slice(i).join("\n");
  const title = meta.Title || meta.title;

  if (title || Object.keys(meta).length > 0) {
    const yaml = [
      "---",
      title ? `title: ${JSON.stringify(title)}` : null,
      meta.Tags
        ? `tags: [${meta.Tags.split(",").map((t) => JSON.stringify(t.trim())).join(", ")}]`
        : null,
      meta.Author ? `author: ${JSON.stringify(meta.Author)}` : null,
      meta.Created ? `date: ${new Date(meta.Created).toISOString()}` : null,
      "---",
      "",
    ]
      .filter((x): x is string => x !== null)
      .join("\n");
    return yaml + rest;
  }

  return text;
}

/**
 * 将解析后的笔记写入 content/notes/{category}/ 目录
 * 仅在非 Vercel 环境（本地）使用
 */
export function writeNotesLocally(
  category: string,
  notes: ImportNote[]
): { written: string[]; errors: string[] } {
  const written: string[] = [];
  const errors: string[] = [];
  const dir = path.join(NOTES_ROOT, category);
  fs.mkdirSync(dir, { recursive: true });

  for (const note of notes) {
    try {
      const filePath = path.join(dir, `${note.slug}.md`);
      const fm = matter.stringify(note.content, note.frontmatter);
      fs.writeFileSync(filePath, fm, "utf-8");
      written.push(`/notes/${category}/${note.slug}`);
    } catch (e) {
      errors.push(`写入失败 ${note.slug}: ${(e as Error).message}`);
    }
  }

  return { written, errors };
}
