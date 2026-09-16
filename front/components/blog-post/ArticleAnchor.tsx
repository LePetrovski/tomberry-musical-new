"use client";

import type { ReactNode, MouseEvent } from "react";

export function ArticleAnchor({ id, className, children }: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    window.history.pushState(null, "", `#${encodeURIComponent(id)}`);
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
  }

  return <a href={`#${encodeURIComponent(id)}`} className={className} onClick={navigate}>{children}</a>;
}
