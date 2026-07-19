import Link from "next/link";
import { Hash } from "lucide-react";
import type { TagInfo } from "@/lib/notes";

interface TagCloudProps {
  tags: TagInfo[];
  limit?: number;
  showCount?: boolean;
}

export default function TagCloud({
  tags,
  limit,
  showCount = true,
}: TagCloudProps) {
  if (tags.length === 0) return null;
  const list = limit ? tags.slice(0, limit) : tags;
  const max = Math.max(...list.map((t) => t.count), 1);

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((tag) => {
        const ratio = tag.count / max;
        const size = 0.85 + ratio * 0.5; // rem
        return (
          <Link
            key={tag.name}
            href={`/tags/${encodeURIComponent(tag.name)}`}
            className="group inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-card-hover hover:border-border-hover transition-all"
            style={{ fontSize: `${size}rem` }}
          >
            <Hash className="w-3 h-3 text-muted group-hover:text-white" />
            <span className="text-foreground group-hover:text-white">
              {tag.name}
            </span>
            {showCount && (
              <span className="text-[10px] text-muted ml-0.5">
                {tag.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
