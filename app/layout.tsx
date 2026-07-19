import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

const SITE_URL = "https://liusr.cc.cd";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "刘松睿 · 个人学习网站",
    template: "%s · 刘松睿",
  },
  description:
    "分享 C++、Linux、算法与数据库的学习笔记，记录项目实践，沉淀思考。",
  keywords: ["C++", "Linux", "算法", "数据库", "学习笔记", "个人博客"],
  authors: [{ name: "刘松睿" }],
  creator: "刘松睿",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: "刘松睿 · RSS 订阅" },
      ],
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "刘松睿 · 个人学习网站",
    title: "刘松睿 · 个人学习网站",
    description:
      "分享 C++、Linux、算法与数据库的学习笔记，记录项目实践，沉淀思考。",
    images: [
      {
        url: "/api/og?title=刘松睿&subtitle=C++ · Linux · 算法 · 数据库&type=home",
        width: 1200,
        height: 630,
        alt: "刘松睿 · 个人学习网站",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "刘松睿 · 个人学习网站",
    description:
      "分享 C++、Linux、算法与数据库的学习笔记，记录项目实践，沉淀思考。",
    images: ["/api/og?title=刘松睿&subtitle=C++ · Linux · 算法 · 数据库&type=home"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-background antialiased font-mono">
        <div className="relative min-h-screen bg-grid">
          <Navbar />
          <main className="relative">{children}</main>
        </div>
      </body>
    </html>
  );
}

