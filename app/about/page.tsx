import { User, Mail, Github, MapPin } from "lucide-react";

// ============= 在此填写你的信息 =============
const profile = {
  name: "你的名字",
  location: "所在城市",
  bio: "在这里用一两句话介绍自己。",
  email: "your@email.com",
  github: "https://github.com/yourname",
};

const skills = {
  languages: [""] as string[],
  technologies: [""] as string[],
  tools: [""] as string[],
};

const directions: string[] = [];
// ============================================

export default function AboutPage() {
  const hasSkill = (arr: string[]) => arr.filter((s) => s.trim());
  const langs = hasSkill(skills.languages);
  const techs = hasSkill(skills.technologies);
  const tools = hasSkill(skills.tools);
  const dirs = directions.filter((d) => d.trim());

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            关于我
          </h1>
          <p className="text-sm text-muted-foreground">
            编辑 <code className="text-white">app/about/page.tsx</code> 顶部
            的 <code className="text-white">profile</code> /
            <code className="text-white">skills</code> /
            <code className="text-white">directions</code> 来填充内容。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 左侧：头像 + 联系方式 */}
          <div className="md:col-span-1">
            <div className="p-6 rounded-xl border border-border bg-card sticky top-24">
              <div className="w-24 h-24 rounded-full border-2 border-white/20 bg-card p-1 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-4">
                {profile.name}
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-3" />
                  <span>{profile.location}</span>
                </div>
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center text-muted-foreground hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-3" />
                    <span>{profile.email}</span>
                  </a>
                )}
                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-muted-foreground hover:text-white transition-colors"
                  >
                    <Github className="w-4 h-4 mr-3" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：简介 + 技能 + 方向 */}
          <div className="md:col-span-2 space-y-8">
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">个人简介</h3>
              <p className="text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {(langs.length > 0 || techs.length > 0 || tools.length > 0) && (
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="text-lg font-semibold mb-4">技能栈</h3>
                <div className="space-y-4">
                  {langs.length > 0 && (
                    <div>
                      <h4 className="text-sm text-muted mb-2">编程语言</h4>
                      <div className="flex flex-wrap gap-2">
                        {langs.map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1 rounded-full text-sm bg-white/10 text-white border border-white/10"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {techs.length > 0 && (
                    <div>
                      <h4 className="text-sm text-muted mb-2">技术栈</h4>
                      <div className="flex flex-wrap gap-2">
                        {techs.map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1 rounded-full text-sm bg-white/10 text-white border border-white/10"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {tools.length > 0 && (
                    <div>
                      <h4 className="text-sm text-muted mb-2">开发工具</h4>
                      <div className="flex flex-wrap gap-2">
                        {tools.map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1 rounded-full text-sm bg-white/10 text-white border border-white/10"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {dirs.length > 0 && (
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="text-lg font-semibold mb-4">学习方向</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {dirs.map((d, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-white mr-2">→</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
