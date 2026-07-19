import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  Clock,
} from "lucide-react";
import { getAllCategories, getCategoryStats, getSiteStats } from "@/lib/notes";
import { CATEGORY_META } from "@/lib/categories";
import { getAllActivity } from "@/lib/activity";

// ============= 在此配置首页内容 =============
const hero = {
  greeting: "你好，我是",
  name: "你的名字",
  title: "个人网站",
  description:
    "这是你的个人网站，在这里记录学习、分享想法、沉淀思考。\n开始之前，请编辑 app/page.tsx 顶部的内容。",
  ctaPrimary: { label: "浏览笔记", href: "/notes" },
  ctaSecondary: { label: "查看项目", href: "/projects" },
};
// ==========================================

export default function Home() {
  const stats = getCategoryStats();
  const categories = getAllCategories();
  const siteStats = getSiteStats();
  const totalNotes = Object.values(stats).reduce((a, b) => a + b, 0);
  const activity = getAllActivity();
  const today = new Date().toISOString().slice(0, 10);
  const todayLogged = activity[today] ? true : false;

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
                  <span className="text-5xl font-bold text-white">
                    {hero.name.slice(0, 1) || "?"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground mb-6">
            <Sparkles className="w-3 h-3" />
            <span>持续记录 · 不断进步</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">{hero.greeting}</span>
            <br />
            <span className="text-white">{hero.name}</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed whitespace-pre-line">
            {hero.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href={hero.ctaPrimary.href}
              className="group flex items-center space-x-2 px-8 py-4 bg-white text-black rounded-lg font-medium transition-all duration-300 hover:bg-gray-200 hover:scale-105"
            >
              <span>{hero.ctaPrimary.label}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={hero.ctaSecondary.href}
              className="group flex items-center space-x-2 px-8 py-4 border border-border rounded-lg font-medium transition-all duration-300 hover:border-border-hover hover:bg-card"
            >
              <span>{hero.ctaSecondary.label}</span>
            </Link>
          </div>

          {/* 分类快捷入口 */}
          {categories.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {categories.map((slug, index) => {
                const meta = CATEGORY_META[slug];
                const count = stats[slug] || 0;
                return (
                  <Link
                    key={slug}
                    href={`/notes/${slug}`}
                    className="group p-5 rounded-xl border border-border bg-card card-hover"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h3 className="font-medium text-white">
                      {meta?.name || slug}
                    </h3>
                    <p className="text-xs text-muted mt-1">{count} 篇</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted" />
        </div>
      </section>

      {/* 今日打卡提示 */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="text-white">今日：</span>
            {todayLogged ? (
              <span className="text-green-400">✓ 已记录活动</span>
            ) : (
              <span>还没记录 · </span>
            )}
            <Link
              href="/activity"
              className="text-white hover:underline ml-1"
            >
              去 /activity 打卡 →
            </Link>
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              共 {totalNotes} 篇笔记
            </span>
            <span className="inline-flex items-center gap-1.5">
              {siteStats.totalTags} 个标签
            </span>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted text-sm">
              © 2026 Personal Site. Built with Next.js & Tailwind CSS.
            </p>
            <p className="text-xs text-muted">
              编辑 <code className="text-white">app/page.tsx</code> 自定义
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
