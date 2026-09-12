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
        className="h-auto max-w-full justify-start overflow-x-auto rounded-xl border border-secondary-500/15 bg-primary-500/75 p-1 sm:w-auto"
      >
        <TabsTrigger
          value="episodes"
          className="h-9 rounded-lg px-3 text-secondary-700 data-active:bg-secondary-500 data-active:text-primary-500 data-active:shadow-none"
        >
          <Mic2 aria-hidden="true" />
          Mes épisodes <span className="opacity-70">({episodesCount})</span>
        </TabsTrigger>
        <TabsTrigger
          value="apparitions"
          className="h-9 rounded-lg px-3 text-secondary-700 data-active:bg-secondary-500 data-active:text-primary-500 data-active:shadow-none"
        >
          <Radio aria-hidden="true" />
          Apparitions <span className="opacity-70">({appearancesCount})</span>
        </TabsTrigger>
        <TabsTrigger
          value="compilations"
          className="h-9 rounded-lg px-3 text-secondary-700 data-active:bg-secondary-500 data-active:text-primary-500 data-active:shadow-none"
        >
          <ListMusic aria-hidden="true" />
          Compilations <span className="opacity-70">({compilationsCount})</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
