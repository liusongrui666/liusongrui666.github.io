import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight } from "lucide-react";
import Markdown from "@/components/Markdown";
import {
  CATEGORY_META,
  getAllCategories,
  getAllNotes,
  getNote,
  getNotesByCategory,
} from "@/lib/notes";
import { extractHeadings } from "@/lib/markdown";

interface NotePageProps {
  params: { category: string; slug: string };
}

export function generateStaticParams() {
  const params: Array<{ category: string; slug: string }> = [];
  for (const category of getAllCategories()) {
    const notes = getNotesByCategory(category);
    for (const note of notes) {
      params.push({ category, slug: note.slug });
    }
  }
  return params;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function NotePage({ params }: NotePageProps) {
  const categoryMeta = CATEGORY_META[params.category];
  if (!categoryMeta) notFound();

  const note = getNote(params.category, params.slug);
  if (!note) notFound();

  const allNotes = getAllNotes();
  const relatedNotes = allNotes
    .filter(
      (n) =>
        n.category === note.category &&
        n.slug !== note.slug
    )
    .slice(0, 3);

  const headings = extractHeadings(note.content);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link
          href={`/notes/${params.category}`}
          className="inline-flex items-center text-muted hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回 {categoryMeta.name} 笔记
        </Link>

        <div className="grid lg:grid-cols-[1fr_220px] gap-10">
          <article className="min-w-0">
            <header className="mb-10 pb-8 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted mb-3">
                <Link
                  href={`/notes/${params.category}`}
                  className="hover:text-white transition-colors"
                >
                  {categoryMeta.name}
                </Link>
                <span>/</span>
                <span>笔记</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                {note.title}
              </h1>

              {note.description && (
                <p className="text-lg text-muted-foreground mb-5">
                  {note.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(note.date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {note.readingTime} 分钟阅读
                </span>
                {note.tags && note.tags.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {note.tags.join(", ")}
                  </span>
                )}
              </div>
            </header>

            <Markdown content={note.content} />
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              {headings.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    目录
                  </h3>
                  <ul className="space-y-2 text-sm border-l border-border">
                    {headings.map((h, i) => (
                      <li
                        key={i}
                        className={h.level === 3 ? "pl-6" : "pl-3"}
                      >
                        <a
                          href={`#${h.slug}`}
                          className="block text-muted-foreground hover:text-white transition-colors border-l-2 border-transparent hover:border-white -ml-px pl-2"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {relatedNotes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    相关笔记
                  </h3>
                  <ul className="space-y-3">
                    {relatedNotes.map((rel) => (
                      <li key={rel.slug}>
                        <Link
                          href={`/notes/${rel.category}/${rel.slug}`}
                          className="block text-sm text-muted-foreground hover:text-white transition-colors group"
                        >
                          <span className="line-clamp-2">{rel.title}</span>
                          <ArrowRight className="inline w-3 h-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
