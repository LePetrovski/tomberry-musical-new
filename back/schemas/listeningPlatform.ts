export const LISTENING_PLATFORM_OPTIONS = [
  { title: "YouTube", value: "youtube" },
  { title: "SoundCloud", value: "soundcloud" },
  { title: "Apple Podcasts", value: "apple_podcasts" },
  { title: "Deezer", value: "deezer" },
  { title: "Podcast Addict", value: "podcast_addict" },
  { title: "RSS / Flux", value: "rss" },
] as const;

export type ListeningPlatformId = (typeof LISTENING_PLATFORM_OPTIONS)[number]["value"];
