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
      <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary-200" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="ff-command-field h-10 pl-10 pr-10 text-sm"
      />
      {value ? (
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange("")} className="ff-command-button absolute right-1.5 top-1/2 -translate-y-1/2" aria-label="Effacer la recherche">
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </label>
  );
}
