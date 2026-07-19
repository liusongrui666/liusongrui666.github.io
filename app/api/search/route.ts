import { NextResponse } from "next/server";
import { searchNotes, type NoteSummary } from "@/lib/notes";

export const dynamic = "force-dynamic";

interface SearchResult {
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

function toResult(note: NoteSummary): SearchResult {
  return {
    title: note.title,
    description: note.description || "",
    category: note.category,
    categoryName: note.category,
    slug: note.slug,
    date: note.date,
    readingTime: note.readingTime,
    tags: note.tags || [],
    url: `/notes/${note.category}/${note.slug}`,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ query: q, count: 0, results: [] });
  }

  const matched = searchNotes(q);
  const results = matched.map(toResult);

  return NextResponse.json({
    query: q,
    count: results.length,
    results,
  });
}
