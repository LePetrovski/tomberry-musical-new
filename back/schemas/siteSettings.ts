import { defineType, defineField, defineArrayMember } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Réglages globaux",
  type: "document",
  fields: [
    defineField({
      name: "socialLinks",
      title: "Réseaux sociaux",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          title: "Réseau social",
          fields: [
            defineField({
              name: "name",
              title: "Nom",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "icon",
              title: "Icône",
              type: "image",
              validation: (rule) => rule.required(),
              fields: [
                defineField({
                  name: "alt",
                  type: "string",
                  title: "Texte alternatif",
                }),
              ],
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "name",
              media: "icon",
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Réglages globaux",
    }),
  },
});
