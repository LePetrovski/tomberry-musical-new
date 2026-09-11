import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
};

export function PodcastSearchInput({ value, onChange, placeholder = "Rechercher un épisode…", label = "Rechercher un épisode" }: Props) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">{label}</span>
      <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-secondary-500" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-full border-secondary-500/25 bg-primary-200 pl-11 pr-12 text-sm text-secondary-900 placeholder:text-secondary-500 focus-visible:border-secondary-500 focus-visible:ring-secondary-500/20"
      />
      {value ? (
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Effacer la recherche">
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </label>
  );
}
