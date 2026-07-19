import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Markdown from "@/components/Markdown";
import CodeBlock from "@/components/CodeBlock";
import { getAllSnippetSlugs, getSnippet } from "@/lib/snippets";

interface SnippetPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllSnippetSlugs().map((slug) => ({ slug }));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function SnippetPage({ params }: SnippetPageProps) {
  const snippet = getSnippet(params.slug);
  if (!snippet) notFound();

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/snippets"
          className="inline-flex items-center text-muted hover:text-white transition-colors mb-6 text-sm group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          返回代码片段
        </Link>

        <header className="mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted mb-3">
            <Link
              href="/snippets"
              className="hover:text-white transition-colors"
            >
              代码片段
            </Link>
            <span>/</span>
            <span className="font-mono text-xs uppercase tracking-wider">
              {snippet.language}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {snippet.title}
          </h1>

          {snippet.description && (
            <p className="text-lg text-muted-foreground mb-4">
              {snippet.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              更新于 {formatDate(snippet.updatedAt)}
            </span>
            {snippet.tags.length > 0 && (
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3.5 h-3.5" />
                {snippet.tags.map((t) => (
                  <span key={t} className="text-muted-foreground">
                    #{t}
                  </span>
                ))}
              </span>
            )}
          </div>
        </header>

        {/* 代码块 */}
        {snippet.code && (
          <CodeBlock code={snippet.code} language={snippet.language} />
        )}

        {/* 解释 */}
        {snippet.explanation && (
          <article className="mt-8">
            <Markdown content={snippet.explanation} />
          </article>
        )}
      </div>
    </div>
  );
}
