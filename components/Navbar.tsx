"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Menu, X, Rss } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SearchBox from "./SearchBox";

const navItems = [
  { name: "首页", href: "/" },
  { name: "笔记", href: "/notes" },
  { name: "项目", href: "/projects" },
  { name: "片段", href: "/snippets" },
  { name: "路线", href: "/roadmap" },
  { name: "活动", href: "/activity" },
  { name: "关于", href: "/about" },
  { name: "简历", href: "/resume" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 路由切换时关闭菜单
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // 点击外部关闭
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setMobileMenuOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [mobileMenuOpen]);

  // 打开时锁定 body 滚动
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center space-x-2 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-black font-bold text-sm">W</span>
            </div>
            <span className="font-semibold text-lg hidden sm:block">
              My Website
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <SearchBox />

            <a
              href="/feed.xml"
              target="_blank"
              rel="alternate"
              className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="RSS 订阅"
              title="RSS 订阅"
            >
              <Rss className="w-5 h-5" />
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>

            <button
              ref={buttonRef}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden py-4 border-t border-border animate-fade-in"
          >
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "text-white bg-white/10"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
