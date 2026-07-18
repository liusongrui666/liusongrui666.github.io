import { User, Mail, Github, MapPin } from "lucide-react";

const skills = {
  languages: ["C++", "JavaScript", "TypeScript", "SQL"],
  technologies: ["Linux", "Git", "MySQL", "Redis", "Next.js", "Tailwind CSS"],
  tools: ["VS Code", "Vim", "Docker"],
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            关于我
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="p-6 rounded-xl border border-border bg-card sticky top-24">
              <div className="w-24 h-24 rounded-full border-2 border-white/20 bg-card p-1 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-4">开发者</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-3" />
                  <span>中国</span>
                </div>
                <a href="mailto:your@email.com" className="flex items-center text-muted-foreground hover:text-white transition-colors">
                  <Mail className="w-4 h-4 mr-3" />
                  <span>联系邮箱</span>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-white transition-colors">
                  <Github className="w-4 h-4 mr-3" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">个人简介</h3>
              <p className="text-muted-foreground leading-relaxed">
                一名热爱技术的开发者，正在持续学习和成长中。对 C++ 后端开发、Linux 系统、
                算法设计以及数据库技术有浓厚兴趣。喜欢钻研技术，乐于分享学习心得。
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">技能栈</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-muted mb-2">编程语言</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.languages.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full text-sm bg-white/10 text-white border border-white/10">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-muted mb-2">技术栈</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.technologies.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full text-sm bg-white/10 text-white border border-white/10">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-muted mb-2">开发工具</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.tools.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full text-sm bg-white/10 text-white border border-white/10">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">学习方向</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-white mr-2">→</span>
                  深入学习 C++ 后端开发技术
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">→</span>
                  掌握 Linux 系统编程与网络编程
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">→</span>
                  提升算法与数据结构能力
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">→</span>
                  学习数据库原理与优化
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
