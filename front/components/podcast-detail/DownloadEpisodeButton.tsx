type Props = {
  slug: string;
  title: string;
};

export function DownloadEpisodeButton({ slug, title }: Props) {
  if (!slug || !title) return null;

  return (
    <>
    {slug && title && (
    <a
      href={`/api/podcasts/${slug}/download`}
      download
      className="inline-flex w-full items-center justify-center rounded-full border border-secondary-500 bg-secondary-500 px-5 py-3 text-sm font-medium text-primary-500 transition-colors hover:bg-secondary-700 hover:border-secondary-700"
      aria-label={`Télécharger l'épisode ${title}`}
    >
      Télécharger l&apos;épisode (MP3)
    </a>
    )}
    </>
  );
}
