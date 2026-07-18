import Link from "next/link";
import { ArrowRight, BookOpen, Code, Database, Cpu, ChevronDown } from "lucide-react";

const categories = [
  { name: "C++", icon: Cpu, href: "/notes/cpp" },
  { name: "Linux", icon: Code, href: "/notes/linux" },
  { name: "算法", icon: BookOpen, href: "/notes/algorithm" },
  { name: "数据库", icon: Database, href: "/notes/database" },
];

export default function Home() {
  return (
    <div className="pt-16">
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto animate-slide-up">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-2 border-white/20 bg-card p-1">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">W</span>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">你好，我是</span>
            <br />
            <span className="text-white">开发者</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            一名热爱技术的开发者，在这里记录我的学习旅程。
            <br className="hidden sm:block" />
            分享 C++、Linux、算法与数据库的学习笔记和项目实践。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/notes"
              className="group flex items-center space-x-2 px-8 py-4 bg-white text-black rounded-lg font-medium transition-all duration-300 hover:bg-gray-200 hover:scale-105"
            >
              <span>浏览笔记</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/projects"
              className="group flex items-center space-x-2 px-8 py-4 border border-border rounded-lg font-medium transition-all duration-300 hover:border-border-hover hover:bg-card"
            >
              <span>查看项目</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group p-5 rounded-xl border border-border bg-card card-hover"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-medium text-white">{category.name}</h3>
                  <p className="text-sm text-muted mt-1">查看笔记</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted" />
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              持续学习，不断进步
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              记录每一个技术成长的瞬间，分享知识与经验
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card card-hover">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">学习笔记</h3>
              <p className="text-muted-foreground">
                整理 C++、Linux、算法、数据库等技术方向的学习心得与知识总结。
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card card-hover">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">项目实践</h3>
              <p className="text-muted-foreground">
                展示个人项目作品，记录开发过程中的思考与成长。
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card card-hover">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">技术沉淀</h3>
              <p className="text-muted-foreground">
                积累技术经验，形成自己的知识体系，持续精进技术能力。
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted text-sm">
              © 2026 My Website. Built with Next.js & Tailwind CSS.
            </p>
            <div className="flex items-center space-x-6">
              <Link href="/notes" className="text-muted hover:text-white transition-colors text-sm">
                笔记
              </Link>
              <Link href="/projects" className="text-muted hover:text-white transition-colors text-sm">
                项目
              </Link>
              <Link href="/about" className="text-muted hover:text-white transition-colors text-sm">
                关于
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
