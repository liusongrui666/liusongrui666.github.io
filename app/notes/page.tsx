import Link from "next/link";
import { BookOpen, Cpu, Code, Database, ArrowRight } from "lucide-react";

const noteCategories = [
  {
    name: "C++",
    icon: Cpu,
    href: "/notes/cpp",
    description: "C++ 编程语言学习笔记，包括语法、STL、面向对象等",
    count: 0,
  },
  {
    name: "Linux",
    icon: Code,
    href: "/notes/linux",
    description: "Linux 系统使用、命令行、Shell 脚本等相关笔记",
    count: 0,
  },
  {
    name: "算法",
    icon: BookOpen,
    href: "/notes/algorithm",
    description: "数据结构与算法学习，包括LeetCode题解",
    count: 0,
  },
  {
    name: "数据库",
    icon: Database,
    href: "/notes/database",
    description: "MySQL、Redis 等数据库相关知识笔记",
    count: 0,
  },
];

export default function NotesPage() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            学习笔记
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            记录学习过程中的知识点、心得与总结，持续更新中...
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {noteCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={category.href}
                className="group p-6 rounded-xl border border-border bg-card card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-white transition-all group-hover:translate-x-1" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <div className="flex items-center text-sm text-muted">
                  <span>{category.count} 篇笔记</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 p-8 rounded-xl border border-dashed border-border text-center">
          <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">笔记正在整理中</h3>
          <p className="text-muted-foreground">
            后续会在这里逐步添加各类学习笔记，敬请期待！
          </p>
        </div>
      </div>
    </div>
  );
}
