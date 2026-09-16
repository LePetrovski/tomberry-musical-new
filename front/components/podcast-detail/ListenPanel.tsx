"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useId, useMemo, useState } from "react";
import type { Podcast } from "@/lib/sanity/types";
import {
  getListeningOptions,
  type InlinePlayer,
} from "@/lib/podcast/listening-options";
import { DownloadEpisodeButton } from "./DownloadEpisodeButton";
import { PodcastMp3Player } from "./PodcastMp3Player";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {
  podcast: Podcast;
};

function PlayerTabs({
  players,
  activeId,
  onSelect,
  panelId,
}: {
  players: InlinePlayer[];
  activeId: InlinePlayer["id"];
  onSelect: (id: InlinePlayer["id"]) => void;
  panelId: string;
}) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % players.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + players.length) % players.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = players.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextPlayer = players[nextIndex];
    onSelect(nextPlayer.id);
    document.getElementById(`${panelId}-tab-${nextPlayer.id}`)?.focus();
  };

  return (
    <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Lecteurs disponibles">
      {players.map((player, index) => (
        <Button
          key={player.id}
          id={`${panelId}-tab-${player.id}`}
          type="button"
          onClick={() => onSelect(player.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          role="tab"
          aria-selected={activeId === player.id}
          aria-controls={panelId}
          tabIndex={activeId === player.id ? 0 : -1}
          variant="ghost"
          size="sm"
          className="ff-command-button rounded-md"
        >
          {player.label}
        </Button>
      ))}
    </div>
  );
}

function InlinePlayerView({
  player,
  podcastTitle,
  panelId,
}: {
  player: InlinePlayer;
  podcastTitle: string;
  panelId: string;
}) {
  const accessibilityProps = {
    id: panelId,
    role: "tabpanel",
    "aria-labelledby": `${panelId}-tab-${player.id}`,
  } as const;

  if (player.id === "mp3") {
    return (
      <div {...accessibilityProps}>
        <PodcastMp3Player key={player.audioUrl} audioUrl={player.audioUrl} title={podcastTitle} />
      </div>
    );
  }

  if (player.id === "youtube") {
    return (
      <div
        {...accessibilityProps}
        className="ff-media-well relative aspect-video w-full overflow-hidden rounded-xl bg-secondary-900 [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
        dangerouslySetInnerHTML={{ __html: player.embedHtml }}
      />
    );
  }

  const src = player.embedUrl;
  if (!src) {
    if (player.embedHtml) {
      return (
        <div
          {...accessibilityProps}
          className="ff-media-well w-full overflow-hidden rounded-xl [&_iframe]:h-[166px] [&_iframe]:w-full [&_iframe]:border-0"
          dangerouslySetInnerHTML={{ __html: player.embedHtml }}
        />
      );
    }
    return null;
  }

  return (
    <div {...accessibilityProps} className="ff-media-well w-full overflow-hidden rounded-xl">
      <iframe
        title={`SoundCloud — ${player.label}`}
        src={src}
        className="h-[166px] w-full border-0"
        allow="autoplay"
      />
    </div>
  );
}

export function ListenPanel({ podcast }: Props) {
  const playerPanelId = `${useId()}-player-panel`;
  const { inlinePlayers, externalLinks, canDownload } = useMemo(
    () => getListeningOptions(podcast),
    [podcast],
  );
  const [selection, setSelection] = useState<{
    podcastSlug: string;
    playerId: InlinePlayer["id"];
  } | null>(null);

  const activePlayerId = selection?.podcastSlug === podcast.slug ? selection.playerId : null;
  const activePlayer =
    inlinePlayers.find((player) => player.id === activePlayerId) ?? inlinePlayers[0] ?? null;
  const hasContent = inlinePlayers.length > 0 || externalLinks.length > 0 || canDownload;

  if (!hasContent) {
    return (
      <div className="ff-menu-window ff-archive-window rounded-2xl p-5 text-sm text-primary-200">
        Aucun mode d&apos;écoute disponible pour cet épisode.
      </div>
    );
  }

  return (
    <Card className="ff-menu-window ff-archive-window min-w-0 gap-0 overflow-hidden rounded-2xl p-5">
      <aside className="space-y-6">
      {inlinePlayers.length > 0 && activePlayer && (
        <section>
          <p className="ff-archive-kicker text-xs font-semibold uppercase tracking-[0.16em]">Votre écoute</p>
          <h2 className="ff-archive-title mb-4 mt-1 text-2xl! font-semibold">Écouter ici</h2>
          <PlayerTabs
            players={inlinePlayers}
            activeId={activePlayer.id}
            onSelect={(playerId) => setSelection({ podcastSlug: podcast.slug, playerId })}
            panelId={playerPanelId}
          />
          <InlinePlayerView
            player={activePlayer}
            podcastTitle={podcast.title}
            panelId={playerPanelId}
          />
        </section>
      )}

      {externalLinks.length > 0 && (
        <section>
          <Separator className="mb-6 bg-primary-200/20" />
          <h2 className="mb-3 text-sm font-semibold text-primary-200">Écouter ailleurs</h2>
          <div className="flex flex-wrap gap-2">
            {externalLinks.map((link) => (
              <a
                key={`${link.id}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ff-command-button inline-flex rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      )}

      {canDownload && (
        <section>
          <Separator className="mb-6 bg-primary-200/20" />
          <h2 className="mb-3 text-sm font-semibold text-primary-200">Télécharger</h2>
          <DownloadEpisodeButton slug={podcast.slug} title={podcast.title} />
        </section>
      )}
      </aside>
    </Card>
  );
}
