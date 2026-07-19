"use client";

import { useState } from "react";

interface HeatmapProps {
  data: Record<string, { count: number; minutes: number; note: string }>;
  weeks?: number; // 显示几周
}

// GitHub / LeetCode 风格的热力图
// 每一列 = 一周，每一行 = 星期（周一到周日）
export default function Heatmap({
  data,
  weeks = 16,
}: HeatmapProps) {
  const [hover, setHover] = useState<{
    date: string;
    entry: { count: number; minutes: number; note: string } | null;
    x: number;
    y: number;
  } | null>(null);

  // 计算起始日期：weeks 周前
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // 找到本周一开始
  const dayOfWeek = (today.getDay() + 6) % 7; // 周一=0
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - dayOfWeek - (weeks - 1) * 7);

  // 生成 weeks × 7 网格
  const grid: Array<
    Array<{ date: string; entry: { count: number; minutes: number; note: string } | null } | null>
  > = [];
  const monthLabels: Array<{ col: number; label: string }> = [];
  let lastMonth = -1;

  for (let w = 0; w < weeks; w++) {
    const col: typeof grid[number] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      // 未来日期不显示
      if (date > today) {
        col.push(null);
        continue;
      }
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const entry = data[key] || null;
      col.push({ date: key, entry });

      // 记录每月第一格的位置
      if (d === 0 && date.getMonth() !== lastMonth) {
        lastMonth = date.getMonth();
        monthLabels.push({
          col: w,
          label: `${date.getMonth() + 1}月`,
        });
      }
    }
    grid.push(col);
  }

  // 根据 count 决定颜色深浅
  function colorClass(count: number | undefined): string {
    if (!count) return "bg-white/5";
    if (count === 1) return "bg-green-900/60";
    if (count === 2) return "bg-green-700/70";
    if (count <= 4) return "bg-green-500/80";
    return "bg-green-400";
  }

  return (
    <div className="relative inline-block">
      {/* 月份标签 */}
      <div
        className="grid mb-2 text-xs text-muted-foreground"
        style={{
          gridTemplateColumns: `repeat(${weeks}, 14px)`,
          gap: "3px",
          marginLeft: "20px",
        }}
      >
        {Array.from({ length: weeks }).map((_, i) => {
          const m = monthLabels.find((x) => x.col === i);
          return (
            <div key={i} className="h-3 text-[10px]">
              {m?.label || ""}
            </div>
          );
        })}
      </div>

      <div className="flex">
        {/* 星期标签 */}
        <div className="flex flex-col mr-2 text-[10px] text-muted-foreground justify-around" style={{ height: `${7 * 14 + 6 * 3}px` }}>
          <span>一</span>
          <span>三</span>
          <span>五</span>
          <span>日</span>
        </div>

        {/* 热力图网格 */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${weeks}, 14px)`,
            gridAutoRows: "14px",
            gap: "3px",
          }}
        >
          {grid.map((col, ci) =>
            col.map((cell, ri) => {
              if (!cell) {
                return (
                  <div
                    key={`${ci}-${ri}`}
                    className="w-[14px] h-[14px] rounded-sm bg-transparent"
                  />
                );
              }
              const c = cell.entry?.count || 0;
              return (
                <div
                  key={`${ci}-${ri}`}
                  className={`w-[14px] h-[14px] rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-white/40 ${colorClass(c)}`}
                  onMouseEnter={(e) => {
                    const rect = (
                      e.target as HTMLElement
                    ).getBoundingClientRect();
                    setHover({
                      date: cell.date,
                      entry: cell.entry,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Tooltip */}
      {hover && (
        <div
          className="fixed z-50 px-2.5 py-1.5 text-xs bg-black border border-border rounded shadow-xl pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{ left: hover.x, top: hover.y - 8 }}
        >
          {hover.entry ? (
            <div className="text-white">
              <div className="font-mono">{hover.date}</div>
              <div className="text-muted-foreground">
                {hover.entry.count} 次 · {hover.entry.minutes} 分钟
              </div>
              {hover.entry.note && (
                <div className="text-muted-foreground mt-0.5 max-w-[200px] truncate">
                  {hover.entry.note}
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground">
              没有记录 · {hover.date}
            </div>
          )}
        </div>
      )}

      {/* 图例 */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-3 ml-1">
        <span>少</span>
        <div className="w-[14px] h-[14px] rounded-sm bg-white/5" />
        <div className="w-[14px] h-[14px] rounded-sm bg-green-900/60" />
        <div className="w-[14px] h-[14px] rounded-sm bg-green-700/70" />
        <div className="w-[14px] h-[14px] rounded-sm bg-green-500/80" />
        <div className="w-[14px] h-[14px] rounded-sm bg-green-400" />
        <span>多</span>
      </div>
    </div>
  );
}
