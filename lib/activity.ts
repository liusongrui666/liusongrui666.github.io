import fs from "fs";
import path from "path";

export interface ActivityEntry {
  count: number;
  minutes: number;
  note: string;
}

export type ActivityMap = Record<string, ActivityEntry>;

const ACTIVITY_FILE = path.join(process.cwd(), "data", "activity.json");

/**
 * 读取所有活动记录
 * 返回的 map 形如：{ "2026-07-19": { count, minutes, note } }
 */
export function getAllActivity(): ActivityMap {
  if (!fs.existsSync(ACTIVITY_FILE)) return {};
  try {
    const raw = fs.readFileSync(ACTIVITY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ActivityMap & {
      _doc?: string;
      _format?: string;
      _example?: string;
    };
    // 过滤掉 _doc / _format / _example 这些元字段
    const out: ActivityMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (k.startsWith("_")) continue;
      if (v && typeof v === "object" && "count" in v) {
        out[k] = v as ActivityEntry;
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** 获取指定月份的活动记录（按日期排序） */
export function getActivityInRange(
  startISO: string,
  endISO: string
): ActivityMap {
  const all = getAllActivity();
  const out: ActivityMap = {};
  for (const [date, entry] of Object.entries(all)) {
    if (date >= startISO && date <= endISO) {
      out[date] = entry;
    }
  }
  return out;
}

/** 当前连续打卡天数（从今天往回数） */
export function getCurrentStreak(activity: ActivityMap): number {
  const dates = Object.keys(activity).sort().reverse();
  if (dates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (activity[key]) {
      streak++;
    } else if (i > 0) {
      break;
    }
    // i=0 今日未打卡不算断，但 streak 也不增加
  }
  return streak;
}

/** 历史最长连续 */
export function getLongestStreak(activity: ActivityMap): number {
  const dates = Object.keys(activity).sort();
  if (dates.length === 0) return 0;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const cur = new Date(dates[i]);
    const diff = Math.round(
      (cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  return longest;
}

/** 本月已记录的天数 / 总 count / 总 minutes */
export function getMonthStats(activity: ActivityMap): {
  days: number;
  count: number;
  minutes: number;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let days = 0;
  let count = 0;
  let minutes = 0;
  for (const [date, entry] of Object.entries(activity)) {
    const d = new Date(date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      days++;
      count += entry.count || 0;
      minutes += entry.minutes || 0;
    }
  }
  return { days, count, minutes };
}

/** 全局统计 */
export function getTotalStats(activity: ActivityMap): {
  totalDays: number;
  totalCount: number;
  totalMinutes: number;
} {
  let totalCount = 0;
  let totalMinutes = 0;
  for (const entry of Object.values(activity)) {
    totalCount += entry.count || 0;
    totalMinutes += entry.minutes || 0;
  }
  return {
    totalDays: Object.keys(activity).length,
    totalCount,
    totalMinutes,
  };
}

/** 工具：把日期转 YYYY-MM-DD */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 获取最近 N 天的活动（含未记录的日期） */
export function getRecentDays(
  days: number
): Array<{ date: string; entry: ActivityEntry | null }> {
  const activity = getAllActivity();
  const out: Array<{ date: string; entry: ActivityEntry | null }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toDateKey(d);
    out.push({ date: key, entry: activity[key] || null });
  }
  return out;
}
