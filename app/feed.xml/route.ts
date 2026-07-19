import { getAllNotes } from "@/lib/notes";
import { getAllProjects } from "@/lib/projects";
import { getAllSnippets } from "@/lib/snippets";

export const dynamic = "force-static";
export const revalidate = 3600; // 1 小时重新生成

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://liusr.cc.cd";
const SITE_TITLE = "刘松睿 · 个人学习网站";
const SITE_DESCRIPTION =
  "分享 C++、Linux、算法与数据库的学习笔记，记录项目实践，沉淀思考。";
const AUTHOR = "刘松睿";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  category?: string;
  guid: string;
}

export async function GET() {
  // 聚合所有内容：笔记（按日期）+ 项目（按开始日期）+ 代码片段
  const notes = getAllNotes();
  const projects = getAllProjects();
  const snippets = getAllSnippets();

  const items: FeedItem[] = [];

  for (const n of notes) {
    items.push({
      title: `[笔记] ${n.title}`,
      link: `${SITE_URL}/notes/${n.category}/${n.slug}`,
      description: n.description || n.title,
      pubDate: new Date(n.date).toUTCString(),
      category: n.category,
      guid: `note-${n.category}-${n.slug}`,
    });
  }

  for (const p of projects) {
    items.push({
      title: `[项目] ${p.title}`,
      link: `${SITE_URL}/projects/${p.slug}`,
      description: p.description,
      pubDate: new Date(p.startDate).toUTCString(),
      category: p.status,
      guid: `project-${p.slug}`,
    });
  }

  for (const s of snippets) {
    items.push({
      title: `[代码片段] ${s.title}`,
      link: `${SITE_URL}/snippets/${s.slug}`,
      description: s.description || `${s.language} 代码片段`,
      pubDate: new Date(s.updatedAt || s.createdAt).toUTCString(),
      category: s.language,
      guid: `snippet-${s.slug}`,
    });
  }

  // 按发布日期倒序，取最近 30 条
  items.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
  const top = items.slice(0, 30);

  const lastBuildDate = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <copyright>© ${new Date().getFullYear()} ${AUTHOR}</copyright>
    <managingEditor>${AUTHOR}</managingEditor>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js Personal Site</generator>
${top
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="false">${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <description>${escapeXml(item.description)}</description>
      ${item.category ? `<category>${escapeXml(item.category)}</category>` : ""}
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
