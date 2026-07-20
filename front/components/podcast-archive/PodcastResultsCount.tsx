type Props = {
  count: number;
  noun: "épisode" | "apparition";
};

export function PodcastResultsCount({ count, noun }: Props) {
  const plural = count !== 1;

  return (
    <p className="text-sm text-secondary-500">
      {count} {noun}
      {plural ? "s" : ""} trouvé{plural ? "s" : ""}
    </p>
  );
}
