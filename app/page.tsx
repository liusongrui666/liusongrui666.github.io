import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code,
  Database,
  Cpu,
  ChevronDown,
  Sparkles,
  Clock,
} from "lucide-react";
import NoteListItem from "@/components/NoteListItem";
import TagCloud from "@/components/TagCloud";
import SiteStats from "@/components/SiteStats";
import {
  CATEGORY_META,
  getAllCategories,
  getAllTags,
  getCategoryStats,
  getRecentNotes,
  getSiteStats,
} from "@/lib/notes";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  cpp: Cpu,
  linux: Code,
  algorithm: BookOpen,
  database: Database,
};

export default function Home() {
  const stats = getCategoryStats();
  const categories = getAllCategories();
  const recentNotes = getRecentNotes(4);
  const tags = getAllTags();
  const siteStats = getSiteStats();
  const totalNotes = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto animate-slide-up">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl" />
              <div className="relative w-28 h-28 rounded-full border-2 border-white/20 bg-card p-1">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">W</span>
                </div>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground mb-6">
            <Sparkles className="w-3 h-3" />
            <span>持续学习 · 不断进步</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">你好，我是</span>
            <br />
            <span className="text-white">开发者</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            一名热爱技术的开发者，在这里记录我的学习旅程。
            <br className="hidden sm:block" />
            分享 C++、Linux、算法与数据库的学习笔记和项目实践。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/notes"
              className="group flex items-center space-x-2 px-8 py-4 bg-white text-black rounded-lg font-medium transition-all duration-300 hover:bg-gray-200 hover:scale-105"
            >
              <span>浏览笔记</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/projects"
              className="group flex items-center space-x-2 px-8 py-4 border border-border rounded-lg font-medium transition-all duration-300 hover:border-border-hover hover:bg-card"
            >
              <span>查看项目</span>
            </Link>
          </div>

          {/* 分类快捷入口 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {categories.map((slug, index) => {
              const meta = CATEGORY_META[slug];
              const Icon = categoryIcons[slug] || BookOpen;
              const count = stats[slug] || 0;
              return (
                <Link
                  key={slug}
                  href={`/notes/${slug}`}
                  className="group p-5 rounded-xl border border-border bg-card card-hover"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-medium text-white">{meta.name}</h3>
                  <p className="text-xs text-muted mt-1">{count} 篇</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted" />
        </div>
      </section>

      {/* 站点统计 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <SiteStats stats={siteStats} />
        </div>
      </section>

      {/* 最新笔记 */}
      {recentNotes.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
                  最新笔记
                </h2>
                <p className="text-muted-foreground text-sm">最新更新的学习记录</p>
              </div>
              <Link
                href="/notes"
                className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                查看全部
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentNotes.map((note) => (
                <NoteListItem key={`${note.category}-${note.slug}`} note={note} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 三大方向 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
              三个学习方向
            </h2>
            <p className="text-muted-foreground text-sm">
              围绕系统能力、算法能力、工程能力构建知识体系
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card card-hover">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">系统基础</h3>
              <p className="text-muted-foreground text-sm">
                C++ 语言、Linux 系统编程、Shell 脚本，夯实工程基础。
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card card-hover">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">算法能力</h3>
              <p className="text-muted-foreground text-sm">
                数据结构、经典算法、LeetCode 题解，培养计算思维。
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card card-hover">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">数据存储</h3>
              <p className="text-muted-foreground text-sm">
                MySQL 索引、Redis 缓存、数据库设计与优化。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 标签云 */}
      {tags.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
                  热门标签
                </h2>
                <p className="text-muted-foreground text-sm">按笔记数量排序</p>
              </div>
            </div>
            <TagCloud tags={tags} />
          </div>
        </section>
      )}

      <footer className="py-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted text-sm">
              © 2026 My Website. Built with Next.js & Tailwind CSS.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                共 {totalNotes} 篇笔记
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
