import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface ProjectLink {
  label: string;
  url: string;
  type?: "demo" | "repo" | "docs" | "other";
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  status: "active" | "maintained" | "archived" | "wip";
  tags: string[];
  techStack: string[];
  startDate: string;
  endDate?: string;
  featured?: boolean;
  cover?: string;
  links: ProjectLink[];
  content: string;
  readingTime: number;
}

export interface ProjectSummary {
  slug: string;
  title: string;
  description: string;
  status: Project["status"];
  tags: string[];
  techStack: string[];
  startDate: string;
  endDate?: string;
  featured?: boolean;
  cover?: string;
  links: ProjectLink[];
  readingTime: number;
}

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

function ensureDir(): void {
  if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
  }
}

function calcReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 300));
}

function readProject(slug: string): Project | null {
  const dir = path.join(PROJECTS_DIR, slug);
  const indexPath = path.join(dir, "index.md");
  if (!fs.existsSync(indexPath)) return null;

  const raw = fs.readFileSync(indexPath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: (data.title as string) || slug,
    description: (data.description as string) || "",
    status: (data.status as Project["status"]) || "active",
    tags: (data.tags as string[]) || [],
    techStack: (data.techStack as string[]) || [],
    startDate: data.startDate
      ? new Date(data.startDate as string).toISOString()
      : new Date().toISOString(),
    endDate: data.endDate
      ? new Date(data.endDate as string).toISOString()
      : undefined,
    featured: Boolean(data.featured),
    cover: (data.cover as string) || undefined,
    links: (data.links as ProjectLink[]) || [],
    content: content.trim(),
    readingTime: calcReadingTime(content),
  };
}

export function getAllProjects(): ProjectSummary[] {
  ensureDir();
  const dirs = fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !/^README/i.test(d.name))
    .map((d) => d.name);
  const projects: Project[] = [];
  for (const slug of dirs) {
    const p = readProject(slug);
    if (p) projects.push(p);
  }
  return projects
    .map(({ content, ...summary }) => summary)
    .sort((a, b) => {
      // featured 优先，然后按开始日期倒序
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
}

export function getProject(slug: string): Project | null {
  if (/^README/i.test(slug)) return null;
  return readProject(slug);
}

export function getAllProjectSlugs(): string[] {
  ensureDir();
  return fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !/^README/i.test(d.name))
    .map((d) => d.name);
}
