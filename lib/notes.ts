import fs from "fs";
import path from "path";
import matter from "gray-matter";

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

export const CATEGORY_META: Record<
  string,
  { name: string; description: string; order: number }
> = {
  cpp: {
    name: "C++",
    description: "C++ 编程语言学习笔记，包括语法、STL、面向对象等",
    order: 1,
  },
  linux: {
    name: "Linux",
    description: "Linux 系统使用、命令行、Shell 脚本等相关笔记",
    order: 2,
  },
  algorithm: {
    name: "算法",
    description: "数据结构与算法学习，包括 LeetCode 题解",
    order: 3,
  },
  database: {
    name: "数据库",
    description: "MySQL、Redis 等数据库相关知识笔记",
    order: 4,
  },
};

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
  return Object.keys(CATEGORY_META).sort(
    (a, b) => CATEGORY_META[a].order - CATEGORY_META[b].order
  );
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
