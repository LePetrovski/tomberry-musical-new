"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import styles from "./BlogPost.module.css";

const subscribe = () => () => {};
const supportsShare = () => typeof navigator.share === "function";
const serverSnapshot = () => false;

export function ArticleShare({ title, url }: { title: string; url: string }) {
  const canShare = useSyncExternalStore(subscribe, supportsShare, serverSnapshot);
  const [status, setStatus] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (manualCopy) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [manualCopy]);

  async function copyLink() {
    setBusy(true);
    setStatus("");
    try {
      await navigator.clipboard.writeText(url);
      setManualCopy(false);
      setStatus("Lien copié !");
    } catch {
      setManualCopy(true);
      setStatus("Copiez le lien ci-dessous pour partager l’article.");
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    setBusy(true);
    setStatus("");
    try {
      await navigator.share({ title, url });
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        setStatus("Le partage n’a pas pu s’ouvrir. Vous pouvez copier le lien.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.share}>
      <div className={styles.shareButtons}>
        {canShare ? (
          <button type="button" onClick={share} disabled={busy} className={`ff-command-button ${styles.action}`}>
            <Share2 aria-hidden="true" className="size-4" /> Partager
          </button>
        ) : null}
        <button type="button" onClick={copyLink} disabled={busy} className={`ff-command-button ${styles.action}`}>
          {status === "Lien copié !" ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
          Copier le lien
        </button>
      </div>
      <p role="status" aria-live="polite" className={styles.shareStatus}>{status}</p>
      {manualCopy ? (
        <label className={styles.manualCopy}>
          Lien de l’article
          <input ref={inputRef} readOnly value={url} onFocus={(event) => event.target.select()} className="ff-command-field" />
        </label>
      ) : null}
    </div>
  );
}
