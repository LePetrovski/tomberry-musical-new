import { defineArrayMember, defineField, defineType } from "sanity";

function parseTimecode(value: string) {
  if (!/^\d+:[0-5]\d$/.test(value) && !/^\d+:[0-5]\d:[0-5]\d$/.test(value)) {
    return null;
  }

  const parts = value.split(":");
  const numbers = parts.map(Number);
  const seconds = numbers.at(-1) ?? 0;
  const minutes = numbers.at(-2) ?? 0;
  const hours = numbers.length === 3 ? numbers[0] : 0;

  return hours * 3600 + minutes * 60 + seconds;
}

export const compilation = defineType({
  name: "compilation",
  title: "Compilation",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Affiche / pochette",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Texte alternatif",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "introduction",
      title: "Présentation courte",
      description:
        "Texte facultatif pour présenter la thématique ou le choix de la personne invitée.",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Gras", value: "strong" },
              { title: "Italique", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Lien",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) =>
                      rule.required().uri({ scheme: ["http", "https"] }),
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: "curatorName",
      title: "Curateur / curatrice",
      description: "Nom facultatif de la personne ayant composé la sélection.",
      type: "string",
    }),
    defineField({
      name: "audioFile",
      title: "Fichier audio (MP3)",
      type: "file",
      options: { accept: "audio/mpeg,audio/mp3,.mp3" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tracks",
      title: "Playlist",
      description:
        "Les pistes doivent être saisies dans l'ordre de lecture avec un temps MM:SS ou HH:MM:SS.",
      type: "array",
      of: [
        defineArrayMember({
          name: "compilationTrack",
          title: "Piste",
          type: "object",
          fields: [
            defineField({
              name: "timecode",
              title: "Temps",
              description: "Ex. 03:42 ou 1:03:42",
              type: "string",
              validation: (rule) =>
                rule.required().custom((value) => {
                  if (!value) return true;
                  return parseTimecode(value) === null
                    ? "Utilisez le format MM:SS ou HH:MM:SS."
                    : true;
                }),
            }),
            defineField({
              name: "artist",
              title: "Artiste",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "title",
              title: "Titre",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "externalLink",
              title: "Lien externe",
              description: "Lien facultatif vers Bandcamp ou une autre plateforme.",
              type: "object",
              fields: [
                defineField({
                  name: "label",
                  title: "Libellé",
                  description: "Ex. Bandcamp",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "url",
                  title: "URL",
                  type: "url",
                  validation: (rule) =>
                    rule.required().uri({ scheme: ["http", "https"] }),
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: "title",
              artist: "artist",
              timecode: "timecode",
            },
            prepare({ title, artist, timecode }) {
              return {
                title: `${timecode ?? "--:--"} — ${title ?? "Sans titre"}`,
                subtitle: artist,
              };
            },
          },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .custom((tracks) => {
            if (!Array.isArray(tracks)) return true;

            let previousTime = -1;
            for (const track of tracks) {
              const timecode =
                typeof track === "object" && track !== null && "timecode" in track
                  ? String(track.timecode ?? "")
                  : "";
              const currentTime = parseTimecode(timecode);
              if (currentTime === null) continue;
              if (currentTime <= previousTime) {
                return "Les temps doivent être uniques et strictement croissants.";
              }
              previousTime = currentTime;
            }

            return true;
          }),
    }),
    defineField({
      name: "publishedAt",
      title: "Date de publication",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "curatorName",
      media: "coverImage",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `Sélection de ${subtitle}` : "Compilation",
        media,
      };
    },
  },
  orderings: [
    {
      title: "Date de publication (récent)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
