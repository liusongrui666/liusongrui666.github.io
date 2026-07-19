// 简历数据：可在此维护个人静态信息（教育/工作/技能/项目）
// 笔记/项目数据会自动从 lib/notes 和 lib/projects 中聚合

export interface ContactInfo {
  email: string;
  location: string;
  website: string;
  github?: string;
  linkedin?: string;
  wechat?: string;
}

export interface Experience {
  company: string;
  role: string;
  location?: string;
  start: string; // YYYY-MM
  end: string | "至今"; // YYYY-MM 或 "至今"
  highlights: string[]; // 关键成就，用动词开头
  tech?: string[];
}

export interface Education {
  school: string;
  major: string;
  degree?: string;
  start: string;
  end: string;
  highlights?: string[];
}

export interface Award {
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export const profile = {
  name: "刘松睿",
  title: "后端 / 系统开发学习者",
  tagline:
    "一名热爱系统编程与开源的开发者，在 C++/Linux/算法/数据库 方向持续学习并构建项目。",
  avatarLetter: "L",
};

export const contact: ContactInfo = {
  email: "liusr@example.com",
  location: "中国",
  website: "https://liusr.cc.cd",
  github: "https://github.com/liusongrui666",
  // linkedin: "https://linkedin.com/in/xxx",
  // wechat: "your-wechat",
};

export const experiences: Experience[] = [
  // 留空数组 = 暂无工作经历，将自动隐藏"工作经历"模块
  // 示例：
  // {
  //   company: "某科技公司",
  //   role: "后端实习生",
  //   location: "北京",
  //   start: "2025-07",
  //   end: "至今",
  //   highlights: [
  //     "独立负责 X 服务的 Go 微服务开发与上线，覆盖日均 10w+ 请求",
  //     "通过索引优化将核心接口 P99 从 800ms 降至 120ms",
  //   ],
  //   tech: ["Go", "gRPC", "MySQL", "Redis"],
  // },
];

export const education: Education[] = [
  {
    school: "某某大学",
    major: "计算机科学与技术",
    degree: "本科",
    start: "2022-09",
    end: "2026-06",
    highlights: [
      "GPA 3.7/4.0（前 10%）",
      "主修课程：数据结构、操作系统、计算机网络、数据库系统",
    ],
  },
];

export const skills: {
  category: string;
  items: Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>;
}[] = [
  {
    category: "编程语言",
    items: [
      { name: "C/C++", level: 4 },
      { name: "Python", level: 4 },
      { name: "TypeScript", level: 3 },
      { name: "Go", level: 3 },
      { name: "Bash", level: 3 },
    ],
  },
  {
    category: "系统与基础设施",
    items: [
      { name: "Linux", level: 4 },
      { name: "Shell 脚本", level: 3 },
      { name: "Docker", level: 3 },
      { name: "Nginx", level: 2 },
    ],
  },
  {
    category: "数据库与存储",
    items: [
      { name: "MySQL", level: 4 },
      { name: "Redis", level: 3 },
      { name: "SQL 优化", level: 3 },
    ],
  },
  {
    category: "前端 / Web",
    items: [
      { name: "Next.js", level: 3 },
      { name: "React", level: 3 },
      { name: "Tailwind CSS", level: 3 },
    ],
  },
  {
    category: "工具与方法",
    items: [
      { name: "Git", level: 4 },
      { name: "Vim", level: 3 },
      { name: "Markdown / Obsidian", level: 4 },
    ],
  },
];

export const awards: Award[] = [
  // {
  //   title: "蓝桥杯 C/C++ 省赛一等奖",
  //   issuer: "工业和信息化部人才交流中心",
  //   date: "2024-04",
  // },
];

export const languages = [
  { name: "中文", level: "母语" },
  { name: "英语", level: "CET-6，能阅读技术文档" },
];
