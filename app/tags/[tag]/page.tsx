import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Hash } from "lucide-react";
import { getAllTags, getNotesByTag } from "@/lib/notes";
import NoteListItem from "@/components/NoteListItem";

interface TagPageProps {
  params: { tag: string };
}

export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: encodeURIComponent(t.name) }));
}

export function generateMetadata({ params }: TagPageProps) {
  return {
    title: `#${decodeURIComponent(params.tag)} - 标签`,
    description: `所有包含 #${decodeURIComponent(params.tag)} 标签的笔记`,
  };
}

export default function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const notes = getNotesByTag(tag);
  if (notes.length === 0) notFound();

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/notes"
          className="inline-flex items-center text-muted hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回笔记列表
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Hash className="w-8 h-8 text-white" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {tag}
            </h1>
          </div>
          <p className="text-muted-foreground">
            共 <span className="text-white font-medium">{notes.length}</span> 篇笔记包含此标签
          </p>
        </div>

        <div className="space-y-3">
          {notes.map((note) => (
            <NoteListItem key={`${note.category}-${note.slug}`} note={note} />
          ))}
        </div>
      </div>
    </div>
  );
}
