import Link from "next/link";
import {
  FileText,
  FolderTree,
  Hash,
  Clock,
  TrendingUp,
  Flame,
  Activity,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import {
  getAllNotes,
  getCategoryDistribution,
  getMonthlyStats,
  getSiteStats,
  getStreak,
  type NoteSummary,
} from "@/lib/notes";

const CATEGORY_COLORS: Record<string, string> = {
  cpp: "bg-blue-400",
  linux: "bg-green-400",
  algorithm: "bg-purple-400",
  database: "bg-orange-400",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const stats = getSiteStats();
  const distribution = getCategoryDistribution();
  const monthly = getMonthlyStats(12);
  const streak = getStreak();
  const recent = getAllNotes().slice(0, 6);
  const maxMonth = Math.max(...monthly.map((m) => m.count), 1);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground mb-4">
            <Activity className="w-3 h-3" />
            <span>实时统计</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-white">
            学习仪表盘
          </h1>
          <p className="text-muted-foreground">
            持续学习的可视化数据，记录每一份努力。
          </p>
        </div>

        {/* 核心指标 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            icon={FileText}
            label="笔记总数"
            value={stats.totalNotes.toString()}
            sub="持续更新"
          />
          <StatCard
            icon={Clock}
            label="累计阅读"
            value={`${stats.totalReadingTime}m`}
            sub="总阅读时长"
          />
          <StatCard
            icon={Hash}
            label="标签数"
            value={stats.totalTags.toString()}
            sub="知识维度"
          />
          <StatCard
            icon={Flame}
            label="当前连续"
            value={`${streak.current} 天`}
            sub={`最长 ${streak.longest} 天`}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* 月度趋势图 */}
          <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-white inline-flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  月度发文趋势
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">最近 12 个月</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {monthly.reduce((a, b) => a + b.count, 0)}
                </div>
                <div className="text-[10px] text-muted-foreground">累计笔记</div>
              </div>
            </div>

            <div className="flex items-end gap-1.5 h-40">
              {monthly.map((m) => {
                const h = (m.count / maxMonth) * 100;
                return (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center gap-1.5 group"
                  >
                    <div className="relative w-full flex-1 flex items-end">
                      <div
                        className="w-full bg-white/80 group-hover:bg-white rounded-t transition-all"
                        style={{
                          height: `${Math.max(h, m.count > 0 ? 4 : 0)}%`,
                        }}
                        title={`${m.label}: ${m.count} 篇`}
                      />
                      {m.count > 0 && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          {m.count}
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {m.label.slice(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 分类分布 */}
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-white mb-1 inline-flex items-center gap-2">
              <FolderTree className="w-4 h-4" />
              分类分布
            </h2>
            <p className="text-xs text-muted-foreground mb-5">各分类笔记占比</p>

            <div className="space-y-3">
              {distribution.map((d) => (
                <div key={d.category}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-foreground">{d.name}</span>
                    <span className="text-muted-foreground font-mono">
                      {d.count} ({d.percent}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full ${
                        CATEGORY_COLORS[d.category] || "bg-white/60"
                      } transition-all`}
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最近笔记 + 学习日历 */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white inline-flex items-center gap-2">
                <FileText className="w-4 h-4" />
                最近发布
              </h2>
              <Link
                href="/notes"
                className="text-xs text-muted-foreground hover:text-white inline-flex items-center gap-1"
              >
                查看全部
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <ul className="space-y-1">
              {recent.map((n) => (
                <RecentItem key={`${n.category}-${n.slug}`} note={n} />
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-white mb-1 inline-flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              活跃日历
            </h2>
            <p className="text-xs text-muted-foreground mb-5">最近 12 周活跃度</p>
            <ActivityGrid />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground/70 mt-1">{sub}</div>
    </div>
  );
}

function RecentItem({ note }: { note: NoteSummary }) {
  return (
    <li>
      <Link
        href={`/notes/${note.category}/${note.slug}`}
        className="group flex items-center gap-3 py-2 px-2 -mx-2 rounded hover:bg-white/5 transition-colors"
      >
        <div className="text-[10px] font-mono text-muted-foreground shrink-0 w-20">
          {formatDate(note.date).slice(5)}
        </div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground shrink-0 w-12">
          {note.category}
        </div>
        <div className="flex-1 text-sm text-foreground group-hover:text-white truncate">
          {note.title}
        </div>
        <ArrowUpRight className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </li>
  );
}

function ActivityGrid() {
  // 12 列 x 7 行的网格，每格代表一周
  const weeks = 12;
  const all = getAllNotes();
  const dateSet = new Set<string>();
  for (const n of all) {
    const d = new Date(n.date);
    dateSet.add(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }

  // 从今天开始往前 12 周
  const today = new Date();
  const cells: Array<{ date: string; count: number }> = [];
  const totalDays = weeks * 7;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    cells.push({ date: key, count: dateSet.has(key) ? 1 : 0 });
  }

  return (
    <div className="grid grid-cols-12 gap-1">
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={w} className="flex flex-col gap-1">
          {Array.from({ length: 7 }).map((_, d) => {
            const idx = w * 7 + d;
            const cell = cells[idx];
            if (!cell) return <div key={d} className="aspect-square" />;
            return (
              <div
                key={d}
                title={cell.date}
                className={`aspect-square rounded-sm ${
                  cell.count > 0
                    ? "bg-white"
                    : "bg-white/5"
                }`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
