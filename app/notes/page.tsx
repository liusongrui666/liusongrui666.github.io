import Link from "next/link";
import { Cpu, Code, BookOpen, Database, ArrowRight } from "lucide-react";
import {
  CATEGORY_META,
  getAllCategories,
  getAllTags,
  getCategoryStats,
} from "@/lib/notes";
import TagCloud from "@/components/TagCloud";
import ImportButton from "@/components/ImportButton";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  cpp: Cpu,
  linux: Code,
  algorithm: BookOpen,
  database: Database,
};

export default function NotesPage() {
  const stats = getCategoryStats();
  const categories = getAllCategories();
  const tags = getAllTags();
  const totalNotes = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              学习笔记
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-4">
              记录学习过程中的知识点、心得与总结，持续更新中...
            </p>
            <div className="flex items-center gap-6 text-sm text-muted">
              <span>共 {totalNotes} 篇笔记</span>
              <span>·</span>
              <span>{categories.length} 个分类</span>
              <span>·</span>
              <span>{tags.length} 个标签</span>
            </div>
          </div>
          <ImportButton />
        </div>

        {/* 分类卡片 */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
            分类
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {categories.map((slug) => {
              const meta = CATEGORY_META[slug];
              const Icon = categoryIcons[slug] || BookOpen;
              const count = stats[slug] || 0;
              return (
                <Link
                  key={slug}
                  href={`/notes/${slug}`}
                  className="group p-5 rounded-xl border border-border bg-card card-hover"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-white/5">
                      {count}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold mb-1.5">{meta.name}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {meta.description}
                  </p>
                  <div className="mt-3 flex items-center text-xs text-muted group-hover:text-white transition-colors">
                    <span>查看全部</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 标签云 */}
        {tags.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
              所有标签
            </h2>
            <TagCloud tags={tags} limit={30} />
          </div>
        )}
      </div>
    </div>
  );
}
