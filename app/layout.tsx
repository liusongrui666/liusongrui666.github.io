import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "个人网站",
  description: "我的学习笔记、项目展示和个人简历",
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
