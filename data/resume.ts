// 简历数据模板 - 在此填写你的信息
// 笔记/项目数据会自动从 content/notes 和 content/projects 中聚合

// ============= 个人信息 =============
export const profile = {
  name: "你的名字",
  title: "你的职业 / 身份",
  tagline: "一句话介绍自己。",
  avatarLetter: "Y",
};

// ============= 联系方式 =============
export const contact: {
  email: string;
  location: string;
  website: string;
  github?: string;
  linkedin?: string;
  wechat?: string;
} = {
  email: "your@email.com",
  location: "所在城市",
  website: "https://yoursite.com",
  // github: "https://github.com/yourname",
  // linkedin: "",
  // wechat: "",
};

// ============= 工作经历 =============
export const experiences: Array<{
  company: string;
  role: string;
  location?: string;
  start: string; // YYYY-MM
  end: string | "至今";
  highlights: string[];
  tech?: string[];
}> = [
  // 复制下方模板填入：
  // {
  //   company: "公司名",
  //   role: "职位",
  //   location: "城市",
  //   start: "2024-07",
  //   end: "至今",
  //   highlights: [
  //     "成就 1：动词开头 + 量化指标",
  //     "成就 2：动词开头 + 量化指标",
  //   ],
  //   tech: ["技术1", "技术2"],
  // },
];

// ============= 教育经历 =============
export const education: Array<{
  school: string;
  major: string;
  degree?: string;
  start: string;
  end: string;
  highlights?: string[];
}> = [
  // {
  //   school: "学校名",
  //   major: "专业",
  //   degree: "本科 / 硕士",
  //   start: "2020-09",
  //   end: "2024-06",
  //   highlights: [
  //     "GPA 3.X/4.0",
  //     "主修课程：...",
  //   ],
  // },
];

// ============= 技能 =============
export const skills: Array<{
  category: string;
  items: Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>;
}> = [
  // {
  //   category: "编程语言",
  //   items: [
  //     { name: "C++", level: 4 },
  //   ],
  // },
];

// ============= 奖项 =============
export const awards: Array<{
  title: string;
  issuer: string;
  date: string;
  description?: string;
}> = [
  // {
  //   title: "奖项名",
  //   issuer: "颁奖机构",
  //   date: "2024-04",
  // },
];

// ============= 语言 =============
export const languages: Array<{ name: string; level: string }> = [
  // { name: "中文", level: "母语" },
  // { name: "英语", level: "CET-6" },
];
