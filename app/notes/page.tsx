import Link from "next/link";
import { Cpu, Code, BookOpen, Database, ArrowRight, Clock } from "lucide-react";
import {
  CATEGORY_META,
  getAllCategories,
  getCategoryStats,
} from "@/lib/notes";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  cpp: Cpu,
  linux: Code,
  algorithm: BookOpen,
  database: Database,
};

export default function NotesPage() {
  const stats = getCategoryStats();
  const categories = getAllCategories();
  const totalNotes = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
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
          </div>
        </div>

        {totalNotes === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-border text-center">
            <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无笔记</h3>
            <p className="text-muted-foreground">在 <code className="px-1.5 py-0.5 rounded bg-white/10 text-white text-sm">content/notes/</code> 目录下添加 .md 文件即可创建笔记</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((slug) => {
              const meta = CATEGORY_META[slug];
              const Icon = categoryIcons[slug] || BookOpen;
              const count = stats[slug] || 0;
              return (
                <Link
                  key={slug}
                  href={`/notes/${slug}`}
                  className="group p-6 rounded-xl border border-border bg-card card-hover"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted group-hover:text-white transition-all group-hover:translate-x-1" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{meta.name}</h2>
                  <p className="text-muted-foreground mb-4">{meta.description}</p>
                  <div className="flex items-center text-sm text-muted gap-1">
                    <span>{count} 篇笔记</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
