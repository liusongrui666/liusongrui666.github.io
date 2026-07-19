"use client";

import { useEffect } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeCopyEnhancer() {
  useEffect(() => {
    const containers = document.querySelectorAll<HTMLPreElement>(
      ".markdown-body pre"
    );
    const cleanups: Array<() => void> = [];

    containers.forEach((pre) => {
      if (pre.dataset.copyEnhanced === "1") return;
      pre.dataset.copyEnhanced = "1";
      pre.style.position = "relative";

      const button = document.createElement("button");
      button.className =
        "absolute top-2 right-2 p-1.5 rounded-md border border-border bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors opacity-0 group-hover:opacity-100";
      button.setAttribute("aria-label", "复制代码");
      button.innerHTML =
        '<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

      const handleEnter = () => {
        button.style.opacity = "1";
      };
      const handleLeave = () => {
        button.style.opacity = "0";
      };
      pre.addEventListener("mouseenter", handleEnter);
      pre.addEventListener("mouseleave", handleLeave);

      button.addEventListener("click", async () => {
        const code = pre.querySelector("code");
        const text = code ? code.innerText : pre.innerText;
        try {
          await navigator.clipboard.writeText(text);
          button.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
          button.classList.add("text-green-400", "border-green-400/40");
          setTimeout(() => {
            button.innerHTML =
              '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
            button.classList.remove("text-green-400", "border-green-400/40");
          }, 1500);
        } catch {
          // 忽略
        }
      });

      pre.appendChild(button);
      cleanups.push(() => {
        pre.removeEventListener("mouseenter", handleEnter);
        pre.removeEventListener("mouseleave", handleLeave);
        button.remove();
      });
    });

    return () => {
      cleanups.forEach((c) => c());
    };
  }, []);

  return null;
}
