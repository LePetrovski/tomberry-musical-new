type Props = {
  count: number;
};

export function PodcastResultsCount({ count }: Props) {
  const plural = count !== 1;

  return (
    <p className="text-sm text-zinc-500">
      {count} épisode{plural ? "s" : ""} trouvé{plural ? "s" : ""}
    </p>
  );
}
