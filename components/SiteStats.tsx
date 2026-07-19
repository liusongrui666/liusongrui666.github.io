import { FileText, FolderTree, Hash, Clock } from "lucide-react";
import type { SiteStats } from "@/lib/notes";

export default function SiteStats({ stats }: { stats: SiteStats }) {
  const items = [
    {
      icon: FileText,
      label: "笔记",
      value: stats.totalNotes,
    },
    {
      icon: FolderTree,
      label: "分类",
      value: stats.totalCategories,
    },
    {
      icon: Hash,
      label: "标签",
      value: stats.totalTags,
    },
    {
      icon: Clock,
      label: "总阅读",
      value: `${stats.totalReadingTime} 分钟`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="p-4 rounded-lg border border-border bg-card text-center"
        >
          <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-2" />
          <div className="text-2xl font-bold text-white mb-1">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}
