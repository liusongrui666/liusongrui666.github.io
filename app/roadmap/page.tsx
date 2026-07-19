import Link from "next/link";
import { CheckCircle2, Clock, Circle, ArrowRight, Map } from "lucide-react";
import {
  ROADMAP_NODES,
  ROADMAP_GROUPS,
  getRoadmapStats,
  type RoadmapNode,
} from "@/lib/roadmap";

const STATUS_META: Record<
  RoadmapNode["status"],
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string; bg: string }
> = {
  completed: {
    icon: CheckCircle2,
    label: "已完成",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
  },
  "in-progress": {
    icon: Clock,
    label: "学习中",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
  },
  planned: {
    icon: Circle,
    label: "计划中",
    color: "text-muted-foreground",
    bg: "bg-white/5 border-border",
  },
};

export default function RoadmapPage() {
  const stats = getRoadmapStats();

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground mb-4">
            <Map className="w-3 h-3" />
            <span>学习路线图</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            我的学习路径
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            系统化梳理 C++、Linux、算法、数据库、工程能力等学习方向，跟踪每个阶段的学习进度。
          </p>

          {/* 进度总览 */}
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.percent}%
                </div>
                <div className="text-sm text-muted-foreground">
                  已完成 {stats.completed} / {stats.total} 个学习节点
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="inline-flex items-center gap-1.5 text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {stats.completed} 已完成
                </span>
                <span className="inline-flex items-center gap-1.5 text-yellow-400">
                  <Clock className="w-3.5 h-3.5" />
                  {stats.inProgress} 学习中
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Circle className="w-3.5 h-3.5" />
                  {stats.planned} 计划中
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-1000"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 五大方向 */}
        <div className="space-y-10">
          {ROADMAP_GROUPS.map((group) => {
            const nodes = ROADMAP_NODES.filter((n) => n.group === group.id);
            if (nodes.length === 0) return null;
            const completedInGroup = nodes.filter(
              (n) => n.status === "completed"
            ).length;

            return (
              <section key={group.id}>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {group.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                  <span className="text-sm text-muted">
                    {completedInGroup} / {nodes.length}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {nodes.map((node) => {
                    const meta = STATUS_META[node.status];
                    const Icon = meta.icon;
                    const firstNote = node.noteSlugs?.[0];
                    return (
                      <div
                        key={node.id}
                        className={`group relative p-5 rounded-xl border ${meta.bg} transition-all`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg ${meta.bg}`}>
                            <Icon className={`w-4 h-4 ${meta.color}`} />
                          </div>
                          <span className={`text-[10px] font-medium uppercase tracking-wider ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-1.5">
                          {node.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {node.description}
                        </p>

                        {node.dependsOn && node.dependsOn.length > 0 && (
                          <div className="text-xs text-muted-foreground mb-3">
                            <span className="inline-flex items-center gap-1">
                              依赖：
                              {node.dependsOn.map((depId, i) => {
                                const dep = ROADMAP_NODES.find(
                                  (n) => n.id === depId
                                );
                                if (!dep) return null;
                                return (
                                  <span key={depId}>
                                    {i > 0 && "、"}
                                    {dep.title}
                                  </span>
                                );
                              })}
                            </span>
                          </div>
                        )}

                        {node.noteSlugs && node.noteSlugs.length > 0 && firstNote && (
                          <Link
                            href={`/notes/${node.group === "language" ? "cpp" : node.group === "system" ? "linux" : node.group === "algorithm" ? "algorithm" : "database"}/${firstNote}`}
                            className="inline-flex items-center gap-1 text-xs text-white hover:underline"
                          >
                            查看相关笔记
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
