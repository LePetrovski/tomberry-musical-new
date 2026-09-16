import { PageWrapper } from "@/components/PageWrapper";
import { CurtainLink } from "@/components/navigation/CurtainLink";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <PageWrapper>
      <section
        aria-labelledby="not-found-title"
        className={`ff-menu-window ff-archive-window ${styles.panel}`}
      >
        <div className={styles.codeColumn}>
          <p className={styles.code}>
            <span className="sr-only">Erreur </span>404
          </p>
        </div>

        <div className={styles.content}>
          <h1 id="not-found-title" className={styles.title}>
            Page introuvable
          </h1>
          <p className={styles.description}>
            Cette page n’existe pas ou a été déplacée.
          </p>

          <nav aria-label="Continuer la navigation" className={styles.navigation}>
            <CurtainLink href="/" className={styles.homeLink}>
              Retour à l’accueil
            </CurtainLink>
            <div className={styles.secondaryLinks}>
              <CurtainLink href="/podcasts" className={styles.secondaryLink}>
                Explorer les podcasts
              </CurtainLink>
              <CurtainLink href="/blog" className={styles.secondaryLink}>
                Lire le blog
              </CurtainLink>
            </div>
          </nav>
        </div>
      </section>
    </PageWrapper>
  );
}
