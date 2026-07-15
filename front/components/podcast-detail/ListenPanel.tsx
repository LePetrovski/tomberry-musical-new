"use client";

import { useMemo, useState } from "react";
import type { Podcast } from "@/lib/sanity/types";
import {
  getListeningOptions,
  type EmbeddedPlayer,
} from "@/lib/podcast/listening-options";
import { DownloadEpisodeButton } from "./DownloadEpisodeButton";

type Props = {
  podcast: Podcast;
};

function PlayerTabs({
  players,
  activeId,
  onSelect,
}: {
  players: EmbeddedPlayer[];
  activeId: string;
  onSelect: (id: EmbeddedPlayer["id"]) => void;
}) {
  if (players.length <= 1) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {players.map((player) => (
        <button
          key={player.id}
          type="button"
          onClick={() => onSelect(player.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition cursor-pointer ${
            activeId === player.id
              ? "bg-secondary-500 text-primary-500"
              : "bg-secondary-500/10 text-secondary-900 hover:bg-secondary-500/20"
          }`}
        >
          {player.label}
        </button>
      ))}
    </div>
  );
}

function EmbeddedPlayerView({ player }: { player: EmbeddedPlayer }) {
  if (player.id === "youtube" && player.embedHtml) {
    return (
      <div
        className="relative aspect-video w-full overflow-hidden rounded-2xl bg-secondary-900 [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
        dangerouslySetInnerHTML={{ __html: player.embedHtml }}
      />
    );
  }

  if (player.id === "soundcloud") {
    const src = player.embedUrl;
    if (!src) {
      if (player.embedHtml) {
        return (
          <div
            className="w-full overflow-hidden rounded-2xl [&_iframe]:h-[166px] [&_iframe]:w-full [&_iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: player.embedHtml }}
          />
        );
      }
      return null;
    }

    return (
      <div className="w-full overflow-hidden rounded-2xl">
        <iframe
          title={`SoundCloud — ${player.label}`}
          src={src}
          className="h-[166px] w-full border-0"
          allow="autoplay"
        />
      </div>
    );
  }

  return null;
}

export function ListenPanel({ podcast }: Props) {
  const { embeddedPlayers, externalLinks, canDownload } = useMemo(
    () => getListeningOptions(podcast),
    [podcast],
  );

  const [activePlayerId, setActivePlayerId] = useState<EmbeddedPlayer["id"] | null>(
    embeddedPlayers[0]?.id ?? null,
  );

  const activePlayer =
    embeddedPlayers.find((player) => player.id === activePlayerId) ?? embeddedPlayers[0] ?? null;
  const hasContent = embeddedPlayers.length > 0 || externalLinks.length > 0 || canDownload;

  if (!hasContent) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-secondary-600">
        Aucun mode d&apos;écoute disponible pour cet épisode.
      </div>
    );
  }

  return (
    <aside className="space-y-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 min-w-0 overflow-hidden">
      {embeddedPlayers.length > 0 && activePlayer && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-secondary-700">Écouter ici</h2>
          <PlayerTabs
            players={embeddedPlayers}
            activeId={activePlayer.id}
            onSelect={setActivePlayerId}
          />
          <EmbeddedPlayerView player={activePlayer} />
        </section>
      )}

      {externalLinks.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-secondary-700">Écouter ailleurs</h2>
          <div className="flex flex-wrap gap-2">
            {externalLinks.map((link) => (
              <a
                key={`${link.id}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-secondary-500/25 bg-primary-500 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:border-secondary-500 hover:bg-secondary-500 hover:text-primary-500"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      )}

      {canDownload && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-secondary-700">Télécharger</h2>
          <DownloadEpisodeButton slug={podcast.slug} title={podcast.title} />
        </section>
      )}
    </aside>
  );
}
