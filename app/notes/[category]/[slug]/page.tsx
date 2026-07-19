import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight, ArrowUpRight } from "lucide-react";
import Markdown from "@/components/Markdown";
import ReadingProgress from "@/components/ReadingProgress";
import BackToTop from "@/components/BackToTop";
import TableOfContents from "@/components/TableOfContents";
import CodeCopyEnhancer from "@/components/CodeCopyEnhancer";
import {
  CATEGORY_META,
  getAdjacentNotes,
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
  const { prev, next } = getAdjacentNotes(params.category, params.slug);

  return (
    <>
      <ReadingProgress />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/notes/${params.category}`}
            className="inline-flex items-center text-muted hover:text-white transition-colors mb-6 text-sm group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            返回 {categoryMeta.name} 笔记
          </Link>

          <div className="grid lg:grid-cols-[1fr_240px] gap-10">
            <article className="min-w-0">
              <header className="mb-10 pb-8 border-b border-border">
                <div className="flex items-center gap-2 text-sm text-muted mb-4">
                  <Link
                    href="/notes"
                    className="hover:text-white transition-colors"
                  >
                    笔记
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/notes/${params.category}`}
                    className="hover:text-white transition-colors"
                  >
                    {categoryMeta.name}
                  </Link>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {note.title}
                </h1>

                {note.description && (
                  <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
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
                    <span className="inline-flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3.5 h-3.5" />
                      {note.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/tags/${encodeURIComponent(tag)}`}
                          className="hover:text-white transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </span>
                  )}
                </div>
              </header>

              <div className="group">
                <Markdown content={note.content} />
              </div>

              <CodeCopyEnhancer />

              {/* 上一篇 / 下一篇 */}
              {(prev || next) && (
                <nav
                  className="mt-16 pt-8 border-t border-border grid sm:grid-cols-2 gap-4"
                  aria-label="上一篇/下一篇"
                >
                  {prev ? (
                    <Link
                      href={`/notes/${prev.category}/${prev.slug}`}
                      className="group p-4 rounded-lg border border-border bg-card hover:bg-card-hover hover:border-border-hover transition-all"
                    >
                      <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3" />
                        上一篇
                      </div>
                      <div className="font-medium text-white group-hover:text-white line-clamp-1">
                        {prev.title}
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {next ? (
                    <Link
                      href={`/notes/${next.category}/${next.slug}`}
                      className="group p-4 rounded-lg border border-border bg-card hover:bg-card-hover hover:border-border-hover transition-all text-right"
                    >
                      <div className="text-xs text-muted-foreground mb-1.5 inline-flex items-center gap-1">
                        下一篇
                        <ArrowRight className="w-3 h-3" />
                      </div>
                      <div className="font-medium text-white group-hover:text-white line-clamp-1">
                        {next.title}
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}
                </nav>
              )}

              {/* 相关文章 */}
              {relatedNotes.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
                    相关笔记
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {relatedNotes.map((rel) => (
                      <Link
                        key={rel.slug}
                        href={`/notes/${rel.category}/${rel.slug}`}
                        className="group p-4 rounded-lg border border-border bg-card hover:bg-card-hover hover:border-border-hover transition-all"
                      >
                        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                          {rel.category}
                        </div>
                        <div className="text-sm font-medium text-white line-clamp-2 mb-1.5">
                          {rel.title}
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          </div>
        </div>
      </div>

      <BackToTop />
    </>
  );
}
