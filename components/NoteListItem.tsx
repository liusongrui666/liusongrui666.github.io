import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import type { NoteSummary } from "@/lib/notes";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function NoteListItem({ note }: { note: NoteSummary }) {
  return (
    <Link
      href={`/notes/${note.category}/${note.slug}`}
      className="group flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-card-hover hover:border-border-hover transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-white/5">
            {note.category}
          </span>
          <span className="text-xs text-muted">·</span>
          <span className="text-xs text-muted inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(note.date)}
          </span>
        </div>
        <h3 className="text-base font-medium text-white group-hover:text-white mb-1 truncate">
          {note.title}
        </h3>
        {note.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {note.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {note.readingTime} 分钟
          </span>
          {note.tags && note.tags.length > 0 && (
            <span className="truncate">
              {note.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
            </span>
          )}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted group-hover:text-white group-hover:translate-x-1 transition-all mt-1 shrink-0" />
    </Link>
  );
}
