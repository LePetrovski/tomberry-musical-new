import type { ListeningPlatformId, Podcast } from "@/lib/sanity/types";
import { extractIframeSrc, getSoundCloudEmbedUrl } from "@/lib/soundcloud";

export const PLATFORM_LABELS: Record<ListeningPlatformId, string> = {
  youtube: "YouTube",
  soundcloud: "SoundCloud",
  apple_podcasts: "Apple Podcasts",
  deezer: "Deezer",
  podcast_addict: "Podcast Addict",
  rss: "RSS",
};

export type EmbeddedPlayer = {
  id: "youtube" | "soundcloud";
  label: string;
  embedHtml?: string;
  embedUrl?: string;
};

export type ExternalPlatformLink = {
  id: ListeningPlatformId;
  label: string;
  url: string;
};

export type ListeningOptions = {
  embeddedPlayers: EmbeddedPlayer[];
  externalLinks: ExternalPlatformLink[];
  canDownload: boolean;
};

function addExternalLink(
  links: ExternalPlatformLink[],
  seen: Set<string>,
  id: ListeningPlatformId,
  url?: string,
) {
  if (!url || seen.has(id)) return;
  seen.add(id);
  links.push({ id, label: PLATFORM_LABELS[id], url });
}

export function getListeningOptions(podcast: Podcast): ListeningOptions {
  const embeddedPlayers: EmbeddedPlayer[] = [];
  const externalLinks: ExternalPlatformLink[] = [];
  const seenExternal = new Set<string>();

  if (podcast.embedYoutube) {
    embeddedPlayers.push({
      id: "youtube",
      label: PLATFORM_LABELS.youtube,
      embedHtml: podcast.embedYoutube,
    });
  }

  const soundcloudEmbedUrl = getSoundCloudEmbedUrl(
    podcast.soundcloud,
    podcast.embedSoundcloud,
    { autoplay: false },
  );

  if (podcast.embedSoundcloud) {
    embeddedPlayers.push({
      id: "soundcloud",
      label: PLATFORM_LABELS.soundcloud,
      embedHtml: podcast.embedSoundcloud,
      embedUrl: soundcloudEmbedUrl ?? undefined,
    });
  } else if (soundcloudEmbedUrl) {
    embeddedPlayers.push({
      id: "soundcloud",
      label: PLATFORM_LABELS.soundcloud,
      embedUrl: soundcloudEmbedUrl,
    });
  }

  addExternalLink(externalLinks, seenExternal, "youtube", podcast.youtube);
  addExternalLink(externalLinks, seenExternal, "soundcloud", podcast.soundcloud);

  for (const entry of podcast.listeningPlatforms ?? []) {
    addExternalLink(externalLinks, seenExternal, entry.platform, entry.url);
  }

  const canDownload = Boolean(podcast.audioFile?.asset?.url);

  return { embeddedPlayers, externalLinks, canDownload };
}

export function buildEpisodeDownloadFilename(podcast: Podcast) {
  const episodePart = podcast.episodeNumber ? `ep${podcast.episodeNumber}` : podcast.slug;
  const original = podcast.audioFile?.asset?.originalFilename;
  if (original) return original;

  return `tomberry-${episodePart}.mp3`;
}

export function getEpisodeDownloadUrl(slug: string) {
  return `/api/podcasts/${slug}/download`;
}

export function extractYoutubeEmbedSrc(embedHtml: string) {
  return extractIframeSrc(embedHtml);
}
