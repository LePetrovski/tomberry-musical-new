type Props = {
  count: number;
};

export function BlogResultsCount({ count }: Props) {
  const plural = count !== 1;

  return (
    <p className="text-sm text-secondary-500">
      {count} article{plural ? "s" : ""} trouvé{plural ? "s" : ""}
    </p>
  );
}
