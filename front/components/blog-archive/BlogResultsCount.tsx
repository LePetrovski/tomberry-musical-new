type Props = {
  count: number;
};

export function BlogResultsCount({ count }: Props) {
  const plural = count !== 1;

  return (
    <p role="status" aria-live="polite" aria-atomic="true" className="text-sm! font-medium text-secondary-100">
      {count} article{plural ? "s" : ""} trouvé{plural ? "s" : ""}
    </p>
  );
}
