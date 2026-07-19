/**
 * 学习路线图 - 模板
 * 在此编辑你的学习目标/进度。
 * 节点状态：completed | in-progress | planned
 * 通过 dependsOn 定义依赖关系
 */

export type NodeStatus = "completed" | "in-progress" | "planned";

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: NodeStatus;
  /** 关联的笔记 slug（自动计算完成度时用） */
  noteSlugs?: string[];
  tags?: string[];
  /** 前置节点 id 列表 */
  dependsOn?: string[];
  /** 节点分组（与 ROADMAP_GROUPS 对应） */
  group: "language" | "system" | "algorithm" | "database" | "engineering";
}

export interface RoadmapGroup {
  id: RoadmapNode["group"];
  name: string;
  description: string;
  color: string;
}

export const ROADMAP_GROUPS: RoadmapGroup[] = [
  // 复制下方模板按需添加分组：
  // {
  //   id: "language",
  //   name: "分组名",
  //   description: "一句话说明",
  //   color: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  // },
];

export const ROADMAP_NODES: RoadmapNode[] = [
  // 复制下方模板按需添加节点：
  // {
  //   id: "node-id",
  //   title: "节点标题",
  //   description: "简短描述",
  //   status: "planned",
  //   noteSlugs: [],
  //   tags: ["标签"],
  //   dependsOn: [],
  //   group: "language",
  // },
];

export interface RoadmapStats {
  total: number;
  completed: number;
  inProgress: number;
  planned: number;
  percent: number;
}

export function getRoadmapStats(): RoadmapStats {
  const total = ROADMAP_NODES.length;
  const completed = ROADMAP_NODES.filter((n) => n.status === "completed").length;
  const inProgress = ROADMAP_NODES.filter(
    (n) => n.status === "in-progress"
  ).length;
  const planned = ROADMAP_NODES.filter((n) => n.status === "planned").length;
  return {
    total,
    completed,
    inProgress,
    planned,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
