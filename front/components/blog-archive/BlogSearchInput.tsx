type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function BlogSearchInput({ value, onChange }: Props) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">Rechercher un article</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Rechercher un article…"
        className="h-10 w-full rounded-xl border border-secondary-500/25 bg-primary-200/80 px-3.5 text-sm text-secondary-900 outline-none transition placeholder:text-secondary-500 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20"
      />
    </label>
  );
}
