type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function BlogSearchInput({ value, onChange }: Props) {
  return (
    <label className="block w-full">
      <span className="mb-2 block text-sm font-medium text-primary-200">Rechercher un article</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Un titre, un compositeur, une musique…"
        className="ff-command-field h-12 w-full min-w-0 px-4 text-[16px] outline-none transition-colors motion-reduce:transition-none"
      />
    </label>
  );
}
