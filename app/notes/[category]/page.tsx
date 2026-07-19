import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import {
  CATEGORY_META,
  getAllCategories,
  getNotesByCategory,
  type NoteSummary,
} from "@/lib/notes";

interface CategoryPageProps {
  params: { category: string };
}

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category }));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const meta = CATEGORY_META[params.category];
  if (!meta) notFound();

  const notes = getNotesByCategory(params.category);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/notes"
          className="inline-flex items-center text-muted hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回笔记列表
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            {meta.name} 笔记
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {meta.description}
          </p>
          <p className="text-sm text-muted">共 {notes.length} 篇</p>
        </div>

        {notes.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-border text-center">
            <p className="text-muted-foreground">该分类下暂无笔记</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <NoteCard key={note.slug} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ note }: { note: NoteSummary }) {
  return (
    <Link
      href={`/notes/${note.category}/${note.slug}`}
      className="block p-5 rounded-xl border border-border bg-card card-hover"
    >
      <h3 className="text-lg font-semibold text-white mb-2">{note.title}</h3>
      {note.description && (
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {note.description}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(note.date)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {note.readingTime} 分钟
        </span>
        {note.tags && note.tags.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {note.tags.slice(0, 3).join(" · ")}
          </span>
        )}
      </div>
    </Link>
  );
}
