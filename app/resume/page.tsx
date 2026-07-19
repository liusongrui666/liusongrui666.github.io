import type { Metadata } from "next";
import {
  Mail,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Download,
} from "lucide-react";
import PrintButton from "@/components/PrintButton";
import {
  profile,
  contact,
  experiences,
  education,
  skills,
  awards,
  languages,
} from "@/data/resume";
import { getAllNotes, getAllTags, getSiteStats } from "@/lib/notes";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: `${profile.name} · 简历`,
  description: `${profile.name} 的个人简历 - ${profile.title}`,
  alternates: {
    canonical: "/resume",
  },
};

function formatPeriod(start: string, end: string | "至今"): string {
  return `${start} → ${end}`;
}

function skillDots(level: number): string {
  return "●".repeat(level) + "○".repeat(5 - level);
}

export default function ResumePage() {
  // 自动从笔记/项目聚合真实数据
  const notes = getAllNotes();
  const projects = getAllProjects();
  const tags = getAllTags();
  const stats = getSiteStats();

  // 按分类聚合笔记（用于简历中"高产出方向"）
  const categoryCount = notes.reduce<Record<string, number>>((acc, n) => {
    acc[n.category] = (acc[n.category] || 0) + 1;
    return acc;
  }, {});

  // Top 6 标签
  const topTags = tags.slice(0, 6).map((t) => t.name);

  // 精选项目（featured 优先 + 最多 3 个）
  const featuredProjects = projects
    .filter((p) => p.featured)
    .slice(0, 3)
    .concat(projects.filter((p) => !p.featured).slice(0, 3))
    .slice(0, 3);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 print:pt-0 print:px-0">
      <div className="max-w-4xl mx-auto">
        {/* 顶部操作栏（不打印） */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-white transition-colors"
          >
            ← 返回首页
          </a>
          <div className="flex items-center gap-2">
            <PrintButton />
            <a
              href="/api/resume-pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-md hover:border-white transition-colors"
              title="下载 PDF 副本（需配置 Vercel 部署）"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </a>
          </div>
        </div>

        {/* 简历主体 - A4 风格 */}
        <article
          id="resume-content"
          className="bg-card border border-border rounded-lg p-8 sm:p-12 print:border-0 print:rounded-none print:p-0 print:bg-white print:text-black shadow-2xl"
        >
          {/* Header */}
          <header className="border-b border-border pb-6 mb-6 print:border-gray-300">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white/20 bg-white/5 flex items-center justify-center print:border-gray-300 print:bg-gray-100 flex-shrink-0">
                <span className="text-3xl sm:text-4xl font-bold text-white print:text-black">
                  {profile.avatarLetter}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-white print:text-black mb-1">
                  {profile.name}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground print:text-gray-700 mb-3">
                  {profile.title}
                </p>
                <p className="text-sm text-muted-foreground print:text-gray-700 leading-relaxed">
                  {profile.tagline}
                </p>
              </div>
            </div>

            {/* 联系方式 */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-sm text-muted-foreground print:text-gray-700">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-1.5 hover:text-white print:hover:text-black"
              >
                <Mail className="w-3.5 h-3.5" />
                {contact.email}
              </a>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {contact.location}
              </span>
              <a
                href={contact.website}
                className="inline-flex items-center gap-1.5 hover:text-white print:hover:text-black"
              >
                <Globe className="w-3.5 h-3.5" />
                {contact.website.replace(/^https?:\/\//, "")}
              </a>
              {contact.github && (
                <a
                  href={contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white print:hover:text-black"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </a>
              )}
              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white print:hover:text-black"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              )}
            </div>
          </header>

          {/* 工作经历 */}
          {experiences.length > 0 && (
            <ResumeSection title="工作经历">
              <div className="space-y-5">
                {experiences.map((exp, i) => (
                  <div key={i}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-white print:text-black">
                        {exp.role} · {exp.company}
                      </h3>
                      <span className="text-xs text-muted-foreground print:text-gray-600 font-mono">
                        {formatPeriod(exp.start, exp.end)}
                        {exp.location ? ` · ${exp.location}` : ""}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground print:text-gray-700 mt-2">
                      {exp.highlights.map((h, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-white print:text-black mt-0.5">
                            ▸
                          </span>
                          <span className="flex-1">{h}</span>
                        </li>
                      ))}
                    </ul>
                    {exp.tech && exp.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {exp.tech.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 border border-border rounded text-muted-foreground print:border-gray-300 print:text-gray-600"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ResumeSection>
          )}

          {/* 教育经历 */}
          {education.length > 0 && (
            <ResumeSection title="教育经历">
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={i}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-white print:text-black">
                        {edu.school} · {edu.major}
                        {edu.degree && (
                          <span className="text-muted-foreground print:text-gray-600 font-normal ml-2">
                            ({edu.degree})
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-muted-foreground print:text-gray-600 font-mono">
                        {formatPeriod(edu.start, edu.end)}
                      </span>
                    </div>
                    {edu.highlights && (
                      <ul className="space-y-1 text-sm text-muted-foreground print:text-gray-700">
                        {edu.highlights.map((h, j) => (
                          <li key={j} className="flex gap-2">
                            <span className="text-white print:text-black mt-0.5">
                              ▸
                            </span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </ResumeSection>
          )}

          {/* 精选项目 - 自动从 content/projects 聚合 */}
          {featuredProjects.length > 0 && (
            <ResumeSection title="精选项目">
              <div className="space-y-4">
                {featuredProjects.map((p) => (
                  <div key={p.slug}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-white print:text-black">
                        <a
                          href={`/projects/${p.slug}`}
                          className="hover:underline print:no-underline"
                        >
                          {p.title}
                        </a>
                      </h3>
                      <span className="text-xs text-muted-foreground print:text-gray-600 font-mono">
                        {p.startDate.slice(0, 7)}
                        {p.endDate ? ` → ${p.endDate.slice(0, 7)}` : " → 至今"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground print:text-gray-700 mb-2 leading-relaxed">
                      {p.description}
                    </p>
                    {p.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.techStack.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 border border-border rounded text-muted-foreground print:border-gray-300 print:text-gray-600"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ResumeSection>
          )}

          {/* 技能 */}
          <ResumeSection title="技能">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {skills.map((cat) => (
                <div key={cat.category}>
                  <h4 className="text-xs font-semibold text-white print:text-black uppercase tracking-wider mb-2">
                    {cat.category}
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground print:text-gray-700">
                    {cat.items.map((item) => (
                      <li
                        key={item.name}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>{item.name}</span>
                        <span
                          className="text-xs text-white print:text-black tracking-widest"
                          title={`Level ${item.level}/5`}
                        >
                          {skillDots(item.level)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ResumeSection>

          {/* 笔记与开源（自动聚合） */}
          <ResumeSection title="笔记与开源">
            <div className="grid sm:grid-cols-4 gap-4 mb-4">
              <ResumeStat label="学习笔记" value={`${stats.totalNotes}`} />
              <ResumeStat
                label="累计阅读量"
                value={`${stats.totalReadingTime} 分钟`}
              />
              <ResumeStat label="分类" value={`${stats.totalCategories}`} />
              <ResumeStat label="标签" value={`${stats.totalTags}`} />
            </div>
            {topTags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground print:text-gray-600 mb-2">
                  主要关注方向：
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(categoryCount).map(([cat, count]) => (
                    <span
                      key={cat}
                      className="text-xs px-2 py-0.5 border border-border rounded text-white print:border-gray-300 print:text-black"
                    >
                      {cat} · {count}
                    </span>
                  ))}
                  {topTags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 bg-white/10 rounded text-white print:bg-gray-200 print:text-black"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </ResumeSection>

          {/* 奖项 */}
          {awards.length > 0 && (
            <ResumeSection title="奖项与证书">
              <ul className="space-y-2 text-sm text-muted-foreground print:text-gray-700">
                {awards.map((a, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-2">
                    <span className="text-white print:text-black">▸</span>
                    <span className="font-medium text-white print:text-black">
                      {a.title}
                    </span>
                    <span>· {a.issuer}</span>
                    <span className="text-xs text-muted-foreground print:text-gray-600 font-mono ml-auto">
                      {a.date}
                    </span>
                  </li>
                ))}
              </ul>
            </ResumeSection>
          )}

          {/* 语言 */}
          {languages.length > 0 && (
            <ResumeSection title="语言能力">
              <ul className="space-y-1 text-sm text-muted-foreground print:text-gray-700">
                {languages.map((l, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-white print:text-black">▸</span>
                    <span className="font-medium text-white print:text-black">
                      {l.name}
                    </span>
                    <span>· {l.level}</span>
                  </li>
                ))}
              </ul>
            </ResumeSection>
          )}

          {/* Footer */}
          <footer className="mt-8 pt-4 border-t border-border print:border-gray-300 text-center text-xs text-muted-foreground print:text-gray-500">
            简历由 {contact.website.replace(/^https?:\/\//, "")}{" "}
            自动生成 · 最近更新：{new Date().toISOString().slice(0, 10)}
          </footer>
        </article>
      </div>
    </div>
  );
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold text-white print:text-black uppercase tracking-widest mb-3 pb-1.5 border-b border-border print:border-gray-300">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ResumeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 border border-border rounded print:border-gray-300">
      <div className="text-2xl font-bold text-white print:text-black font-mono">
        {value}
      </div>
      <div className="text-xs text-muted-foreground print:text-gray-600 mt-1">
        {label}
      </div>
    </div>
  );
}
