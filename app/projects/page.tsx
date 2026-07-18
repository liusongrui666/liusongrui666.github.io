import { Code, FolderOpen } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            项目展示
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            这里会展示我的个人项目作品，记录开发过程中的成长
          </p>
        </div>

        <div className="p-12 rounded-xl border border-dashed border-border text-center">
          <FolderOpen className="w-16 h-16 text-muted mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-3">项目即将上线</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            目前正在学习和积累中，后续会在这里展示我的项目作品。
            <br />
            敬请期待！
          </p>
        </div>
      </div>
    </div>
  );
}
