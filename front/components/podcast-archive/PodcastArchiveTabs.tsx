import { ListMusic, Mic2, Radio } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ArchiveView } from "./hooks/usePodcastFilters";

type Props = {
  selectedView: ArchiveView;
  onSelectView: (view: ArchiveView) => void;
  episodesCount: number;
  appearancesCount: number;
  compilationsCount: number;
};

export function PodcastArchiveTabs({ selectedView, onSelectView, episodesCount, appearancesCount, compilationsCount }: Props) {
  return (
    <Tabs className="max-w-full" value={selectedView} onValueChange={(value) => onSelectView(value as ArchiveView)}>
      <TabsList
        aria-label="Vue de l’archive"
        className="ff-archive-tabs grid h-auto w-full max-w-full grid-cols-3 overflow-visible rounded-xl p-1 sm:inline-flex sm:w-auto sm:justify-start"
      >
        <TabsTrigger
          value="episodes"
          className="ff-archive-tab h-11 min-w-0 rounded-lg border border-transparent bg-transparent px-0.5 text-[0.625rem] data-active:shadow-none sm:h-9 sm:px-3 sm:text-sm"
        >
          <Mic2 aria-hidden="true" className="hidden sm:block" />
          <span className="sm:hidden">Épisodes</span>
          <span className="hidden sm:inline">Mes épisodes</span>
          <span className="hidden opacity-70 sm:inline">({episodesCount})</span>
        </TabsTrigger>
        <TabsTrigger
          value="apparitions"
          className="ff-archive-tab h-11 min-w-0 rounded-lg border border-transparent bg-transparent px-0.5 text-[0.625rem] data-active:shadow-none sm:h-9 sm:px-3 sm:text-sm"
        >
          <Radio aria-hidden="true" className="hidden sm:block" />
          Apparitions <span className="hidden opacity-70 sm:inline">({appearancesCount})</span>
        </TabsTrigger>
        <TabsTrigger
          value="compilations"
          className="ff-archive-tab h-11 min-w-0 rounded-lg border border-transparent bg-transparent px-0.5 text-[0.625rem] data-active:shadow-none sm:h-9 sm:px-3 sm:text-sm"
        >
          <ListMusic aria-hidden="true" className="hidden sm:block" />
          Compilations <span className="hidden opacity-70 sm:inline">({compilationsCount})</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
