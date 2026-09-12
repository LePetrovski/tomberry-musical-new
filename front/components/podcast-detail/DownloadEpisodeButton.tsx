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
      className="ff-command-button inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
      aria-label={`Télécharger l'épisode ${title}`}
    >
      Télécharger l&apos;épisode (MP3)
    </a>
    )}
    </>
  );
}
