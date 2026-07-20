import type { ArchiveView } from "./hooks/usePodcastFilters";

type Props = {
  selectedView: ArchiveView;
  onSelectView: (view: ArchiveView) => void;
  episodesCount: number;
  appearancesCount: number;
};

function tabButtonClass(isActive: boolean) {
  return `rounded-full px-4 py-1.5 text-sm font-medium transition cursor-pointer ${
    isActive
      ? "bg-secondary-500 text-white"
      : "border border-zinc-300 bg-white text-secondary-700 hover:border-zinc-400"
  }`;
}

export function PodcastArchiveTabs({
  selectedView,
  onSelectView,
  episodesCount,
  appearancesCount,
}: Props) {
  return (
    <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Vue de l’archive">
      <button
        type="button"
        role="tab"
        aria-selected={selectedView === "episodes"}
        onClick={() => onSelectView("episodes")}
        className={tabButtonClass(selectedView === "episodes")}
      >
        Mes épisodes
        <span className="ml-1.5 opacity-70">({episodesCount})</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={selectedView === "apparitions"}
        onClick={() => onSelectView("apparitions")}
        className={tabButtonClass(selectedView === "apparitions")}
      >
        Apparitions
        <span className="ml-1.5 opacity-70">({appearancesCount})</span>
      </button>
    </div>
  );
}
