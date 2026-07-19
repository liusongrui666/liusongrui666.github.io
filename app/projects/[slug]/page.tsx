import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Calendar,
  Github,
  ExternalLink,
  FileText,
  Link as LinkIcon,
} from "lucide-react";
import Markdown from "@/components/Markdown";
import { getAllProjectSlugs, getProject } from "@/lib/projects";

interface ProjectPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = getProject(params.slug);
  if (!project) return { title: "未找到项目" };
  const ogUrl = `/api/og?type=project&title=${encodeURIComponent(project.title)}&subtitle=${encodeURIComponent(
    project.description
  )}`;
  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: `/projects/${params.slug}`,
    },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.description,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      images: [ogUrl],
    },
  };
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: "进行中", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  maintained: { label: "维护中", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  archived: { label: "已归档", color: "bg-white/5 text-muted-foreground border-border" },
  wip: { label: "开发中", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
};

const LINK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  repo: Github,
  demo: ExternalLink,
  docs: FileText,
  other: LinkIcon,
};

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = getProject(params.slug);
  if (!project) notFound();

  const status = STATUS_META[project.status] || STATUS_META.active;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/projects"
          className="inline-flex items-center text-muted hover:text-white transition-colors mb-6 text-sm group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          返回项目列表
        </Link>

        <header className="mb-10 pb-8 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${status.color}`}
            >
              {status.label}
            </span>
            {project.featured && (
              <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-300">
                ⭐ 精选
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {project.title}
          </h1>

          {project.description && (
            <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-5 text-sm text-muted mb-5">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(project.startDate)}
              {project.endDate ? ` - ${formatDate(project.endDate)}` : " - 至今"}
            </span>
          </div>

          {/* 技术栈 */}
          {project.techStack.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                技术栈
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-foreground border border-border"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 链接 */}
          {project.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.links.map((link, i) => {
                const Icon = LINK_ICONS[link.type || "other"] || LinkIcon;
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-card-hover hover:border-border-hover transition-colors text-sm"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                  </a>
                );
              })}
            </div>
          )}
        </header>

        {/* 项目描述 Markdown */}
        {project.content && (
          <article>
            <Markdown content={project.content} />
          </article>
        )}
      </div>
    </div>
  );
}
