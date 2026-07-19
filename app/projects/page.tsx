import Link from "next/link";
import { ArrowRight, FolderGit2, Star, Github, ExternalLink } from "lucide-react";
import { getAllProjects } from "@/lib/projects";

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: "进行中", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  maintained: { label: "维护中", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  archived: { label: "已归档", color: "bg-white/5 text-muted-foreground border-border" },
  wip: { label: "开发中", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function ProjectsPage() {
  const projects = getAllProjects();
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            项目
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-4">
            个人项目与实践作品，记录技术成长历程。
          </p>
          <div className="flex items-center gap-6 text-sm text-muted">
            <span>共 {projects.length} 个项目</span>
            <span>·</span>
            <span>持续更新中</span>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-border text-center">
            <FolderGit2 className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无项目</h3>
            <p className="text-muted-foreground text-sm">
              在 <code className="px-1.5 py-0.5 rounded bg-white/10 text-white">content/projects/</code> 下创建目录并添加 <code className="px-1.5 py-0.5 rounded bg-white/10 text-white">index.md</code> 即可
            </p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4 inline-flex items-center gap-1.5">
                  <Star className="w-3 h-3" />
                  精选项目
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featured.map((p) => (
                    <ProjectCard key={p.slug} project={p} featured />
                  ))}
                </div>
              </section>
            )}

            {others.length > 0 && (
              <section>
                {featured.length > 0 && (
                  <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
                    其他项目
                  </h2>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  {others.map((p) => (
                    <ProjectCard key={p.slug} project={p} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project: p,
  featured,
}: {
  project: import("@/lib/projects").ProjectSummary;
  featured?: boolean;
}) {
  const status = STATUS_META[p.status] || STATUS_META.active;
  return (
    <Link
      href={`/projects/${p.slug}`}
      className={`group block p-6 rounded-xl border border-border bg-card card-hover ${
        featured ? "" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${status.color}`}>
          {status.label}
        </span>
        <ArrowRight className="w-4 h-4 text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>

      <h3 className={`font-semibold text-white mb-2 ${featured ? "text-xl" : "text-lg"}`}>
        {p.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {p.description}
      </p>

      {p.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {p.techStack.slice(0, featured ? 6 : 4).map((t) => (
            <span
              key={t}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground"
            >
              {t}
            </span>
          ))}
          {p.techStack.length > (featured ? 6 : 4) && (
            <span className="text-[10px] text-muted-foreground">
              +{p.techStack.length - (featured ? 6 : 4)}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          {formatDate(p.startDate)}
          {p.endDate ? ` - ${formatDate(p.endDate)}` : " - 至今"}
        </span>
        <div className="flex items-center gap-2">
          {p.links.filter((l) => l.type === "repo").length > 0 && (
            <Github className="w-3 h-3" />
          )}
          {p.links.filter((l) => l.type === "demo").length > 0 && (
            <ExternalLink className="w-3 h-3" />
          )}
        </div>
      </div>
    </Link>
  );
}
