import Link from "next/link";
import { Home, FileQuestion } from "lucide-react";
import BackButton from "@/components/BackButton";

export default function NotFound() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-border bg-card mb-6">
          <FileQuestion className="w-10 h-10 text-muted-foreground" />
        </div>

        <h1 className="text-7xl sm:text-8xl font-bold text-white mb-3 leading-none">
          404
        </h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
          页面走丢了
        </h2>
        <p className="text-muted-foreground mb-8">
          你访问的页面不存在，或已被移动、删除。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            回到首页
          </Link>
          <BackButton />
        </div>

        <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
          <p>
            试试访问{" "}
            <Link href="/notes" className="text-white hover:underline">
              笔记
            </Link>{" "}
            或{" "}
            <Link href="/projects" className="text-white hover:underline">
              项目
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
