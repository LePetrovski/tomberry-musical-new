import type { ArticleHeading } from "@/lib/blog/reading";
import { ArticleAnchor } from "./ArticleAnchor";
import styles from "./BlogPost.module.css";

export function ArticleContents({ headings }: { headings: ArticleHeading[] }) {
  if (headings.length < 2) return null;
  return (
    <details className={`ff-menu-window ff-archive-window ${styles.contents}`}>
      <summary>Dans cet article <span className={styles.sectionCount}>{headings.length} sections</span></summary>
      <nav aria-label="Sommaire de l’article">
        <ol>
          {headings.map((heading) => (
            <li key={heading.id} className={heading.level === 3 ? styles.subheading : undefined}>
              <ArticleAnchor id={heading.id}>{heading.text}</ArticleAnchor>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
