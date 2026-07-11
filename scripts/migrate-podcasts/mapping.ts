/**
 * Mapping colonnes MySQL → champs Sanity `podcast`.
 * Ajuste les alias après `npm run migrate:podcasts:inspect`.
 */
export type MysqlPodcastRow = Record<string, unknown>;

export type PodcastMappingConfig = {
  /** Nom de la table MySQL source (ex. podcasts, episodes, wp_posts) */
  table: string;
  columns: {
    title: string[];
    slug: string[];
    description: string[];
    body: string[];
    coverImage: string[];
    episodeNumber: string[];
    duration: string[];
    audioUrl: string[];
    youtube: string[];
    embedYoutube: string[];
    soundcloud: string[];
    embedSoundcloud: string[];
    first: string[];
    second: string[];
    third: string[];
    fourth: string[];
    publishedAt: string[];
  };
};

export const defaultMapping: PodcastMappingConfig = {
  table: "template",
  columns: {
    title: ["title", "titre", "name", "nom", "post_title"],
    slug: ["slug", "permalink", "url_slug", "post_name"],
    description: [
      "description",
      "resume",
      "excerpt",
      "chapo",
      "short_description",
      "post_excerpt",
    ],
    body: [
      "body",
      "content",
      "contenu",
      "notes",
      "text",
      "post_content",
      "playlist",
      "discographie",
      "bibliographie",
    ],
    coverImage: [
      "cover_name",
      "cover_image",
      "coverImage",
      "image",
      "image_url",
      "thumbnail",
      "miniature",
      "slider_name",
      "featured_image",
    ],
    episodeNumber: [
      "episode",
      "episode_number",
      "episodeNumber",
      "numero",
      "numero_episode",
      "num_episode",
    ],
    duration: ["duration", "duree", "length", "duree_minutes"],
    audioUrl: [
      "mega",
      "gamingway",
      "audio_url",
      "audioUrl",
      "audio",
      "mp3",
      "fichier_audio",
      "file_url",
      "media_url",
    ],
    youtube: ["youtube"],
    embedYoutube: ["embedYoutube", "embed_youtube"],
    soundcloud: ["soundcloud", "soundCloud"],
    embedSoundcloud: ["embedSoundcloud", "embed_soundcloud"],
    first: ["first"],
    second: ["second"],
    third: ["third"],
    fourth: ["fourth"],
    publishedAt: [
      "updated_at",
      "published_at",
      "publishedAt",
      "date_publication",
      "publication_date",
      "created_at",
      "date",
      "post_date",
    ],
  },
};

export function pickColumn(
  row: MysqlPodcastRow,
  aliases: string[],
): unknown {
  const normalized = new Map(
    Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]),
  );

  for (const alias of aliases) {
    const value = normalized.get(alias.toLowerCase());
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
}

export function resolveMappedColumns(
  availableColumns: string[],
  config: PodcastMappingConfig = defaultMapping,
) {
  const lowerColumns = availableColumns.map((column) => column.toLowerCase());

  return Object.fromEntries(
    Object.entries(config.columns).map(([field, aliases]) => {
      const match = aliases.find((alias) =>
        lowerColumns.includes(alias.toLowerCase()),
      );
      return [field, match ?? null];
    }),
  ) as Record<keyof PodcastMappingConfig["columns"], string | null>;
}
