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
    defineField({
      name: "reviewLinks",
      title: "Liens pour laisser un avis",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "reviewLink",
          fields: [
            defineField({
              name: "platform",
              title: "Plateforme",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              title: "Libellé du bouton",
              type: "string",
              validation: (rule) => rule.required(),
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
              title: "platform",
              subtitle: "url",
            },
          },
        }),
      ],
    }),
    defineField({
      name: "featuredLinks",
      title: "Liens mis en avant",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "featuredLink",
          fields: [
            defineField({
              name: "group",
              title: "Groupe",
              type: "string",
              options: {
                list: [
                  { title: "Écriture", value: "writing" },
                  { title: "Réseaux", value: "social" },
                  { title: "Projets", value: "projects" },
                ],
                layout: "dropdown",
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              title: "Libellé",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description courte",
              type: "string",
            }),
          ],
          preview: {
            select: {
              title: "label",
              subtitle: "group",
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
