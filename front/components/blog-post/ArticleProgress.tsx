"use client";

import { useEffect, useState } from "react";
import { readingProgress } from "@/lib/blog/reading";
import styles from "./BlogPost.module.css";

export function ArticleProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      setProgress(readingProgress(rect.top, rect.height, window.innerHeight));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(target);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Capturing load also covers images above the reading body that move its top edge.
    document.addEventListener("load", schedule, true);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("load", schedule, true);
    };
  }, [targetId]);

  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-label="Progression de lecture"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div className={styles.progressFill} style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
}
