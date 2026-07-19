import type { Metadata } from "next";
import Link from "next/link";
import { Activity, TrendingUp, Flame, Clock, Hash } from "lucide-react";
import Heatmap from "@/components/Heatmap";
import ActivityLogger from "@/components/ActivityLogger";
import {
  getAllActivity,
  getCurrentStreak,
  getLongestStreak,
  getMonthStats,
  getTotalStats,
  type ActivityEntry,
} from "@/lib/activity";

export const metadata: Metadata = {
  title: "活动追踪",
  description: "记录每天的学习/活动情况，可视化展示连续打卡和总投入。",
};

export default function ActivityPage() {
  const activity = getAllActivity();
  const currentStreak = getCurrentStreak(activity);
  const longestStreak = getLongestStreak(activity);
  const monthStats = getMonthStats(activity);
  const totalStats = getTotalStats(activity);

  // 最近 7 条
  const recent: Array<{ date: string; entry: ActivityEntry }> = Object.entries(
    activity
  )
    .map(([date, entry]) => ({ date, entry }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  // 进展分析
  const last7Days = Object.entries(activity)
    .filter(([d]) => {
      const date = new Date(d);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    });
  const prev7Days = Object.entries(activity).filter(([d]) => {
    const date = new Date(d);
    const now = new Date();
    return date >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14) &&
      date < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  });
  const trend =
    prev7Days.length === 0
      ? null
      : Math.round(
          ((last7Days.length - prev7Days.length) / prev7Days.length) * 100
        );

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-white flex items-center gap-3">
            <Activity className="w-10 h-10" />
            活动追踪
          </h1>
          <p className="text-muted-foreground">
            每天花一分钟记录，活动数据全部存于{" "}
            <code className="text-white">data/activity.json</code>
            ，修改后推送即生效。
          </p>
        </div>

        {/* 顶部 3 个统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="连续打卡"
            value={`${currentStreak}`}
            unit="天"
            accent="text-orange-400"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="历史最长"
            value={`${longestStreak}`}
            unit="天"
            accent="text-blue-400"
          />
          <StatCard
            icon={<Hash className="w-5 h-5" />}
            label="本月记录"
            value={`${monthStats.days}`}
            unit={`天 / ${monthStats.count} 次`}
            accent="text-green-400"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="总时长"
            value={`${totalStats.totalMinutes}`}
            unit="分钟"
            accent="text-purple-400"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧：热力图 + 进展分析 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 热力图 */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  最近 {Math.ceil(16 / 4)} 个月
                </h2>
                <span className="text-xs text-muted-foreground">
                  鼠标悬停查看详情
                </span>
              </div>
              <div className="overflow-x-auto">
                <Heatmap data={activity} weeks={16} />
              </div>
            </div>

            {/* 进展分析 */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                进展分析
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-white font-mono">
                    {last7Days.length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    近 7 天
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-white font-mono">
                    {prev7Days.length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    上一个 7 天
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div
                    className={`text-2xl font-bold font-mono ${
                      trend === null
                        ? "text-muted-foreground"
                        : trend > 0
                        ? "text-green-400"
                        : trend < 0
                        ? "text-red-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {trend === null
                      ? "—"
                      : `${trend > 0 ? "+" : ""}${trend}%`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    同比变化
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {trend === null
                  ? "📊 数据不足以分析趋势，至少需要记录两周。"
                  : trend > 0
                  ? `🔥 干得不错！本周比上周多 ${trend}%。`
                  : trend < 0
                  ? `📉 这周比上周少了 ${Math.abs(trend)}%，别灰心，坚持就是胜利。`
                  : "📊 这周和上周一样，继续保持节奏。"}
              </p>
            </div>

            {/* 最近记录 */}
            {recent.length > 0 && (
              <div className="p-5 rounded-xl border border-border bg-card">
                <h2 className="text-base font-semibold text-white mb-4">
                  最近记录
                </h2>
                <ul className="space-y-2">
                  {recent.map(({ date, entry }) => (
                    <li
                      key={date}
                      className="flex flex-wrap items-baseline gap-3 py-2 px-3 rounded border border-border bg-white/5"
                    >
                      <span className="font-mono text-xs text-muted-foreground">
                        {date}
                      </span>
                      <span className="text-sm text-white">
                        {entry.count} 次 · {entry.minutes} 分钟
                      </span>
                      {entry.note && (
                        <span className="text-xs text-muted-foreground line-clamp-1 flex-1 min-w-0">
                          {entry.note}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 右侧：记录表单 + 说明 */}
          <div className="space-y-6">
            <ActivityLogger />

            <div className="p-5 rounded-xl border border-border bg-card space-y-3">
              <h3 className="font-semibold text-white text-sm">📝 使用方法</h3>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
                <li>用上方表单记录今天的活动，点"存到本地"或"复制 JSON"</li>
                <li>
                  打开 <code className="text-white">data/activity.json</code>
                </li>
                <li>把 JSON 片段粘贴进去（删掉示例行）</li>
                <li>
                  <code className="text-white">git add</code> ·{" "}
                  <code className="text-white">commit</code> ·{" "}
                  <code className="text-white">push</code>
                </li>
                <li>Vercel 自动部署，新数据就生效了</li>
              </ol>
            </div>

            {totalStats.totalDays === 0 && (
              <Link
                href="/feed.xml"
                className="block p-5 rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground hover:border-white transition-colors"
              >
                📡 也可以用 RSS 订阅 →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  accent: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <div className={`flex items-center gap-1.5 text-xs mb-2 ${accent}`}>
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-white font-mono">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
