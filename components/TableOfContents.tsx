"use client";

import { useEffect, useState } from "react";

export interface Heading {
  level: number;
  text: string;
  slug: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeSlug, setActiveSlug] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.slug))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveSlug(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="目录">
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
        本页目录
      </h3>
      <ul className="space-y-1 text-sm border-l border-border">
        {headings.map((h, i) => {
          const isActive = activeSlug === h.slug;
          return (
            <li key={i} className={h.level === 3 ? "pl-6" : "pl-3"}>
              <a
                href={`#${h.slug}`}
                className={`block py-1.5 border-l-2 -ml-px pl-2 transition-all ${
                  isActive
                    ? "text-white border-white font-medium"
                    : "text-muted-foreground border-transparent hover:text-white hover:border-white/40"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(h.slug);
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
