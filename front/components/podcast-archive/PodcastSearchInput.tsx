type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
};

export function PodcastSearchInput({
  value,
  onChange,
  placeholder = "Rechercher un épisode…",
  label = "Rechercher un épisode",
}: Props) {
  return (
    <label className="relative w-full sm:max-w-sm">
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-secondary-900 outline-none transition placeholder:text-secondary-500 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20"
      />
    </label>
  );
}
