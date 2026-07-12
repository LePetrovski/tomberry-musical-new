import { defineType, defineField, defineArrayMember } from "sanity";

const imageFields = [
  defineField({
    name: "alt",
    type: "string",
    title: "Texte alternatif",
  }),
];

export const postTextBlock = defineType({
  name: "postTextBlock",
  title: "Texte",
  type: "object",
  fields: [
    defineField({
      name: "content",
      title: "Contenu",
      type: "blockContent",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { content: "content" },
    prepare({ content }) {
      const text =
        content
          ?.flatMap((block: { children?: { text?: string }[] }) =>
            block.children?.map((child) => child.text ?? "") ?? [],
          )
          .join("")
          .slice(0, 60) ?? "";

      return {
        title: "Texte",
        subtitle: text || "Bloc texte",
      };
    },
  },
});

export const postImageBlock = defineType({
  name: "postImageBlock",
  title: "Image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: imageFields,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "fullWidth",
      title: "Pleine largeur",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "caption",
      title: "Légende",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "caption", media: "image", fullWidth: "fullWidth" },
    prepare({ title, media, fullWidth }) {
      return {
        title: title || "Image",
        subtitle: fullWidth ? "Pleine largeur" : "Largeur contenu",
        media,
      };
    },
  },
});

export const postTextImageBlock = defineType({
  name: "postTextImageBlock",
  title: "Texte + image",
  type: "object",
  fields: [
    defineField({
      name: "content",
      title: "Texte",
      type: "blockContent",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: imageFields,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "imagePosition",
      title: "Position de l'image",
      type: "string",
      options: {
        list: [
          { title: "Gauche", value: "left" },
          { title: "Droite", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "right",
    }),
  ],
  preview: {
    select: { content: "content", media: "image", imagePosition: "imagePosition" },
    prepare({ content, media, imagePosition }) {
      const text =
        content
          ?.flatMap((block: { children?: { text?: string }[] }) =>
            block.children?.map((child) => child.text ?? "") ?? [],
          )
          .join("")
          .slice(0, 40) ?? "";

      return {
        title: "Texte + image",
        subtitle: `${imagePosition === "left" ? "Image à gauche" : "Image à droite"} · ${text || "…"}`,
        media,
      };
    },
  },
});

export const postContent = defineType({
  name: "postContent",
  title: "Contenu article",
  type: "array",
  of: [
    defineArrayMember({ type: "postTextBlock" }),
    defineArrayMember({ type: "postImageBlock" }),
    defineArrayMember({ type: "postTextImageBlock" }),
  ],
});
