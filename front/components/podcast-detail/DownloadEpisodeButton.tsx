type Props = {
  downloadUrl: string;
  title: string;
};

export function DownloadEpisodeButton({ downloadUrl, title }: Props) {
  if (!downloadUrl || !title) return null;

  return (
    <a
      href={downloadUrl}
      className="ff-command-button inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
      aria-label={`Télécharger l'épisode ${title}`}
    >
      Télécharger l&apos;épisode (MP3)
    </a>
  );
}
