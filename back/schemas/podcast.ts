import { defineType, defineField } from "sanity";

export const podcast = defineType({
  name: "podcast",
  title: "Podcast",
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
      name: "description",
      title: "Description courte",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "coverImage",
      title: "Image de couverture",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Texte alternatif",
        }),
      ],
    }),
    defineField({
      name: "episodeNumber",
      title: "Numéro d'épisode",
      type: "number",
    }),
    defineField({
      name: "duration",
      title: "Durée",
      type: "string",
      description: "Ex. 42 min",
    }),
    defineField({
      name: "audioUrl",
      title: "URL audio",
      type: "url",
      description: "Lien vers le fichier audio ou le flux RSS",
    }),
    defineField({
      name: "publishedAt",
      title: "Date de publication",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Notes de l'épisode",
      type: "blockContent",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "episodeNumber",
      media: "coverImage",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `Épisode ${subtitle}` : undefined,
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
