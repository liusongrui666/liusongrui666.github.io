import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

const categoryNames: Record<string, string> = {
  cpp: "C++",
  linux: "Linux",
  algorithm: "算法",
  database: "数据库",
};

export function generateStaticParams() {
  return [{ category: "cpp" }, { category: "linux" }, { category: "algorithm" }, { category: "database" }];
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = categoryNames[params.category] || params.category;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/notes"
          className="inline-flex items-center text-muted hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回笔记列表
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            {categoryName} 笔记
          </h1>
          <p className="text-lg text-muted-foreground">
            正在整理中...
          </p>
        </div>

        <div className="p-12 rounded-xl border border-dashed border-border text-center">
          <BookOpen className="w-16 h-16 text-muted mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-3">笔记即将发布</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {categoryName} 相关的学习笔记正在整理中，敬请期待！
          </p>
        </div>
      </div>
    </div>
  );
}
