import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Hash } from "lucide-react";
import NoteListItem from "@/components/NoteListItem";
import {
  CATEGORY_META,
  getAllCategories,
  getAllTags,
  getNotesByCategory,
} from "@/lib/notes";
import TagCloud from "@/components/TagCloud";

interface CategoryPageProps {
  params: { category: string };
}

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category }));
}

export function generateMetadata({ params }: CategoryPageProps) {
  const meta = CATEGORY_META[params.category];
  if (!meta) return {};
  return {
    title: `${meta.name}笔记 - 我的学习笔记`,
    description: meta.description,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const meta = CATEGORY_META[params.category];
  if (!meta) notFound();

  const notes = getNotesByCategory(params.category);

  // 统计该分类下出现过的标签
  const tagMap = new Map<string, number>();
  for (const n of notes) {
    for (const t of n.tags || []) {
      tagMap.set(t, (tagMap.get(t) || 0) + 1);
    }
  }
  const categoryTags = Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/notes"
          className="inline-flex items-center text-muted hover:text-white transition-colors mb-8 text-sm group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          返回笔记列表
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {meta.name} 笔记
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-muted-foreground">
              {notes.length} 篇
            </span>
          </div>
          <p className="text-muted-foreground">{meta.description}</p>
        </div>

        {categoryTags.length > 0 && (
          <div className="mb-10 p-5 rounded-xl border border-border bg-card">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 inline-flex items-center gap-1">
              <Hash className="w-3 h-3" />
              本分类标签
            </h3>
            <TagCloud tags={categoryTags} />
          </div>
        )}

        {notes.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-border text-center">
            <p className="text-muted-foreground">该分类下暂无笔记</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteListItem key={note.slug} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
