import { defineType, defineField } from "sanity";

export const page = defineType({
    name: "page",
    title: "Page",
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
            title: "Description (SEO)",
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
            name: "body",
            title: "Contenu",
            type: "blockContent",
            validation: (rule) => rule.required(),
        }),
    ],
    preview: {
        select: {
            title: "title",
            subtitle: "slug.current",
            media: "coverImage",
        },
    },
});
