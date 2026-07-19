import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { CATEGORY_META, CATEGORY_SLUGS } from "./categories";

export { CATEGORY_META, CATEGORY_SLUGS };
export type { CategoryMeta } from "./categories";

export interface NoteFrontmatter {
  title: string;
  description?: string;
  date: string;
  tags?: string[];
  category: string;
  slug: string;
}

export interface Note extends NoteFrontmatter {
  content: string;
  readingTime: number;
}

export interface NoteSummary extends NoteFrontmatter {
  readingTime: number;
}

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

function ensureNotesDir(): void {
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
  }
}

function calcReadingTime(content: string): number {
  const wordsPerMinute = 300;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function getAllMdFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllMdFiles(fullPath));
    } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

export function getAllNotes(): NoteSummary[] {
  ensureNotesDir();
  const files = getAllMdFiles(NOTES_DIR);
  const notes: NoteSummary[] = files.map((file) => {
    const raw = fs.readFileSync(file, "utf-8");
    const { data, content } = matter(raw);
    const category = path.basename(path.dirname(file));
    const slug = data.slug || path.basename(file, path.extname(file));
    return {
      title: data.title || slug,
      description: data.description || "",
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      tags: data.tags || [],
      category,
      slug,
      readingTime: calcReadingTime(content),
    };
  });

  return notes.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getNotesByCategory(category: string): NoteSummary[] {
  return getAllNotes().filter((n) => n.category === category);
}

export function getNote(category: string, slug: string): Note | null {
  const filePath = path.join(NOTES_DIR, category, `${slug}.md`);
  const mdxFilePath = path.join(NOTES_DIR, category, `${slug}.mdx`);
  let target = "";
  if (fs.existsSync(filePath)) target = filePath;
  else if (fs.existsSync(mdxFilePath)) target = mdxFilePath;
  else return null;

  const raw = fs.readFileSync(target, "utf-8");
  const { data, content } = matter(raw);
  return {
    title: data.title || slug,
    description: data.description || "",
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    tags: data.tags || [],
    category,
    slug,
    content,
    readingTime: calcReadingTime(content),
  };
}

export function getCategoryStats(): Record<string, number> {
  const all = getAllNotes();
  const stats: Record<string, number> = {};
  for (const n of all) {
    stats[n.category] = (stats[n.category] || 0) + 1;
  }
  return stats;
}

export function getAllCategories(): string[] {
  return CATEGORY_SLUGS;
}

export function searchNotes(query: string): NoteSummary[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/);

  return getAllNotes()
    .map((note) => {
      const haystack = [
        note.title,
        note.description || "",
        (note.tags || []).join(" "),
        CATEGORY_META[note.category]?.name || note.category,
      ]
        .join(" ")
        .toLowerCase();

      const score = tokens.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
      return { note, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((r) => r.note);
}

export interface TagInfo {
  name: string;
  count: number;
}

export function getAllTags(): TagInfo[] {
  const map = new Map<string, number>();
  for (const note of getAllNotes()) {
    for (const tag of note.tags || []) {
      map.set(tag, (map.get(tag) || 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getNotesByTag(tag: string): NoteSummary[] {
  return getAllNotes().filter((n) => (n.tags || []).includes(tag));
}

export function getRecentNotes(limit = 5): NoteSummary[] {
  return getAllNotes().slice(0, limit);
}

export interface AdjacentNotes {
  prev: NoteSummary | null;
  next: NoteSummary | null;
}

export function getAdjacentNotes(
  category: string,
  slug: string
): AdjacentNotes {
  const list = getNotesByCategory(category);
  const idx = list.findIndex((n) => n.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  // 按日期倒序排列后，prev 是更新的、next 是更早的
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
  };
}

export interface SiteStats {
  totalNotes: number;
  totalCategories: number;
  totalTags: number;
  totalWords: number;
  totalReadingTime: number;
}

export function getSiteStats(): SiteStats {
  const all = getAllNotes();
  let totalWords = 0;
  let totalReadingTime = 0;
  for (const note of all) {
    totalWords += note.title.length + (note.description?.length || 0);
    totalReadingTime += note.readingTime;
  }
  return {
    totalNotes: all.length,
    totalCategories: getAllCategories().length,
    totalTags: getAllTags().length,
    totalWords,
    totalReadingTime,
  };
}

/**
 * 解析笔记中的 [[slug]] 或 [[category/slug]] 链接
 * 返回去重后的引用目标列表
 */
export function extractWikiLinks(
  content: string
): Array<{ category: string; slug: string; text: string }> {
  const re = /\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g;
  const seen = new Set<string>();
  const out: Array<{ category: string; slug: string; text: string }> = [];

  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const target = m[1].trim();
    const text = (m[2] || target).trim();
    let category = "";
    let slug = target;
    if (target.includes("/")) {
      const parts = target.split("/").map((s) => s.trim());
      category = parts[0];
      slug = parts[1];
    }
    const key = `${category}/${slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ category, slug, text });
  }
  return out;
}

/**
 * 读取某篇笔记的原始 markdown 文本（用于反向链接扫描等需要 content 的场景）
 */
function readNoteContent(category: string, slug: string): string {
  const filePath = path.join(NOTES_DIR, category, `${slug}.md`);
  const mdxFilePath = path.join(NOTES_DIR, category, `${slug}.mdx`);
  let target = "";
  if (fs.existsSync(filePath)) target = filePath;
  else if (fs.existsSync(mdxFilePath)) target = mdxFilePath;
  else return "";
  try {
    return fs.readFileSync(target, "utf-8");
  } catch {
    return "";
  }
}

/**
 * 获取某篇笔记的反向链接（哪些笔记引用了它）
 * 支持 [[slug]] 和 [[category/slug]] 两种语法
 */
export function getBacklinks(
  category: string,
  slug: string
): NoteSummary[] {
  const all = getAllNotes();
  const refs: NoteSummary[] = [];

  for (const note of all) {
    if (note.category === category && note.slug === slug) continue;
    const raw = readNoteContent(note.category, note.slug);
    if (!raw) continue;
    const body = matter(raw).content;
    const links = extractWikiLinks(body);
    const isReferenced = links.some((l) => {
      // 形式1：[[slug]] - 跨分类匹配同名 slug
      // 形式2：[[category/slug]] - 精确匹配
      if (l.category) {
        return l.category === category && l.slug === slug;
      }
      return l.slug === slug;
    });
    if (isReferenced) {
      refs.push(note);
    }
  }
  return refs;
}

export interface MonthlyStat {
  month: string; // YYYY-MM
  label: string; // YYYY.MM
  count: number;
}

export function getMonthlyStats(months = 12): MonthlyStat[] {
  const all = getAllNotes();
  const map = new Map<string, number>();

  for (const note of all) {
    const d = new Date(note.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + 1);
  }

  // 生成最近 N 个月
  const result: MonthlyStat[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({
      month: key,
      label: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`,
      count: map.get(key) || 0,
    });
  }
  return result;
}

export function getCategoryDistribution(): Array<{
  category: string;
  name: string;
  count: number;
  percent: number;
}> {
  const all = getAllNotes();
  const total = all.length || 1;
  const map = new Map<string, number>();
  for (const n of all) {
    map.set(n.category, (map.get(n.category) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([category, count]) => ({
      category,
      name: CATEGORY_META[category]?.name || category,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function getStreak(): { current: number; longest: number; lastDate: string | null } {
  const all = getAllNotes();
  if (all.length === 0) return { current: 0, longest: 0, lastDate: null };

  // 收集所有有笔记的日期（YYYY-MM-DD）
  const dateSet = new Set<string>();
  for (const n of all) {
    const d = new Date(n.date);
    dateSet.add(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }

  // 当前连续打卡：从今天往回数
  let current = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (dateSet.has(key)) {
      current++;
    } else if (i > 0) {
      break;
    } else {
      // i=0 今日未发，看昨天
      continue;
    }
  }

  // 最长连续：扫描所有日期
  const dates = Array.from(dateSet)
    .map((s) => new Date(s))
    .sort((a, b) => a.getTime() - b.getTime());

  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of dates) {
    if (prev) {
      const diff = Math.round(
        (d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff === 1) {
        run++;
      } else {
        run = 1;
      }
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }

  const lastNote = all[0]; // 已按日期倒序
  return { current, longest, lastDate: lastNote?.date || null };
}
