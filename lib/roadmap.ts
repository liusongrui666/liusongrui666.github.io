/**
 * 学习路线图 - 数据驱动
 * 每个节点定义主题、状态、关联笔记和依赖关系
 */

export type NodeStatus = "completed" | "in-progress" | "planned";

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: NodeStatus;
  /** 关联的笔记 slug（用于判断状态） */
  noteSlugs?: string[];
  tags?: string[];
  /** 前置节点 id 列表（要解锁此节点需先完成这些） */
  dependsOn?: string[];
  /** 节点重要性，用于分组显示 */
  group: "language" | "system" | "algorithm" | "database" | "engineering";
}

export interface RoadmapGroup {
  id: RoadmapNode["group"];
  name: string;
  description: string;
  color: string;
}

export const ROADMAP_GROUPS: RoadmapGroup[] = [
  {
    id: "language",
    name: "编程语言",
    description: "C/C++ 基础与进阶",
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  },
  {
    id: "system",
    name: "系统基础",
    description: "Linux、操作系统、网络",
    color: "from-green-500/20 to-green-500/5 border-green-500/30",
  },
  {
    id: "algorithm",
    name: "算法能力",
    description: "数据结构与算法",
    color: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
  },
  {
    id: "database",
    name: "数据存储",
    description: "数据库与缓存",
    color: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
  },
  {
    id: "engineering",
    name: "工程能力",
    description: "工具链、Git、CI/CD",
    color: "from-pink-500/20 to-pink-500/5 border-pink-500/30",
  },
];

export const ROADMAP_NODES: RoadmapNode[] = [
  // 编程语言
  {
    id: "cpp-basics",
    title: "C++ 基础",
    description: "变量、循环、函数、指针、引用",
    status: "completed",
    noteSlugs: ["smart-pointers"],
    tags: ["C++"],
    group: "language",
  },
  {
    id: "cpp-advanced",
    title: "C++ 进阶",
    description: "模板、移动语义、RAII、智能指针",
    status: "completed",
    noteSlugs: ["smart-pointers", "move-semantics"],
    tags: ["C++", "智能指针", "移动语义"],
    dependsOn: ["cpp-basics"],
    group: "language",
  },
  {
    id: "cpp-stl",
    title: "STL 标准库",
    description: "容器、迭代器、算法",
    status: "in-progress",
    noteSlugs: [],
    tags: ["C++", "STL"],
    dependsOn: ["cpp-basics"],
    group: "language",
  },

  // 系统基础
  {
    id: "linux-commands",
    title: "Linux 命令",
    description: "常用命令、文件系统、权限管理",
    status: "completed",
    noteSlugs: ["common-commands"],
    tags: ["Linux", "命令行"],
    group: "system",
  },
  {
    id: "linux-shell",
    title: "Shell 脚本",
    description: "Bash 编程、自动化",
    status: "completed",
    noteSlugs: ["shell-scripting"],
    tags: ["Linux", "Shell"],
    dependsOn: ["linux-commands"],
    group: "system",
  },
  {
    id: "linux-system",
    title: "系统编程",
    description: "进程、线程、信号、IPC",
    status: "planned",
    noteSlugs: [],
    tags: ["Linux", "系统编程"],
    dependsOn: ["linux-commands", "cpp-advanced"],
    group: "system",
  },
  {
    id: "linux-network",
    title: "网络编程",
    description: "Socket、TCP/IP、HTTP",
    status: "planned",
    noteSlugs: [],
    tags: ["Linux", "网络"],
    dependsOn: ["linux-system"],
    group: "system",
  },

  // 算法能力
  {
    id: "algo-basic",
    title: "基础数据结构",
    description: "数组、链表、栈、队列、哈希表",
    status: "completed",
    noteSlugs: [],
    tags: ["算法", "数据结构"],
    group: "algorithm",
  },
  {
    id: "algo-sorting",
    title: "排序算法",
    description: "十大经典排序、时间空间复杂度",
    status: "completed",
    noteSlugs: ["sorting-algorithms"],
    tags: ["算法", "排序"],
    dependsOn: ["algo-basic"],
    group: "algorithm",
  },
  {
    id: "algo-dp",
    title: "动态规划",
    description: "状态转移方程、空间优化",
    status: "completed",
    noteSlugs: ["dynamic-programming"],
    tags: ["算法", "动态规划"],
    dependsOn: ["algo-basic"],
    group: "algorithm",
  },
  {
    id: "algo-graph",
    title: "图算法",
    description: "BFS、DFS、最短路、最小生成树",
    status: "planned",
    noteSlugs: [],
    tags: ["算法", "图"],
    dependsOn: ["algo-dp"],
    group: "algorithm",
  },

  // 数据存储
  {
    id: "db-sql",
    title: "SQL 基础",
    description: "SELECT、JOIN、索引、事务",
    status: "completed",
    noteSlugs: ["mysql-index"],
    tags: ["MySQL", "数据库"],
    group: "database",
  },
  {
    id: "db-nosql",
    title: "NoSQL",
    description: "Redis 缓存、键值数据库",
    status: "completed",
    noteSlugs: ["redis-persistence"],
    tags: ["Redis", "数据库"],
    dependsOn: ["db-sql"],
    group: "database",
  },
  {
    id: "db-design",
    title: "数据库设计",
    description: "范式、ER 图、分库分表",
    status: "planned",
    noteSlugs: [],
    tags: ["数据库", "设计"],
    dependsOn: ["db-sql"],
    group: "database",
  },

  // 工程能力
  {
    id: "git",
    title: "Git 版本控制",
    description: "分支、合并、rebase、工作流",
    status: "completed",
    noteSlugs: [],
    tags: ["Git"],
    group: "engineering",
  },
  {
    id: "docker",
    title: "Docker 容器化",
    description: "镜像、容器、Dockerfile、Compose",
    status: "planned",
    noteSlugs: [],
    tags: ["Docker"],
    dependsOn: ["linux-commands"],
    group: "engineering",
  },
  {
    id: "ci-cd",
    title: "CI/CD",
    description: "GitHub Actions、自动化测试与部署",
    status: "planned",
    noteSlugs: [],
    tags: ["CI/CD"],
    dependsOn: ["git", "docker"],
    group: "engineering",
  },
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
  const inProgress = ROADMAP_NODES.filter((n) => n.status === "in-progress").length;
  const planned = ROADMAP_NODES.filter((n) => n.status === "planned").length;
  return {
    total,
    completed,
    inProgress,
    planned,
    percent: Math.round((completed / total) * 100),
  };
}
