import { defineType, defineField } from "sanity";

export const guestAppearance = defineType({
  name: "guestAppearance",
  title: "Invitation (autre podcast)",
  type: "document",
  fields: [
    defineField({
      name: "showName",
      title: "Nom du podcast / émission",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "episodeTitle",
      title: "Titre de l'épisode",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "Lien vers l'épisode",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Visuel",
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
      name: "platform",
      title: "Plateforme",
      type: "string",
      description: "Ex. YouTube, SoundCloud",
    }),
    defineField({
      name: "publishedAt",
      title: "Date de publication",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "episodeTitle",
      subtitle: "showName",
      media: "coverImage",
    },
  },
  orderings: [
    {
      title: "Date (récent)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
