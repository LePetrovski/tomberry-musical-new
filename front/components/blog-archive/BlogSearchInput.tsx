type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function BlogSearchInput({ value, onChange }: Props) {
  return (
    <label className="relative w-full sm:max-w-sm">
      <span className="sr-only">Rechercher un article</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Rechercher un article…"
        className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-secondary-900 outline-none transition placeholder:text-secondary-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20"
      />
    </label>
  );
}
