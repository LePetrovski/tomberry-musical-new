import { defineField, defineType } from "sanity";

const internalLinkValidation = (value: string | undefined) => {
  if (!value || value.startsWith("/") || /^https?:\/\//.test(value)) {
    return true;
  }

  return "Saisissez un chemin interne commençant par / ou une URL complète.";
};

export const homepage = defineType({
  name: "homepage",
  title: "Page d’accueil",
  type: "document",
  initialValue: {
    asideLabel: "À propos",
    asideEyebrow: "Podcast",
    asideTitle: "Le Tomberry Musical",
    asideTagline: "Le podcast sur la musique de jeux vidéo",
    asideDescription:
      "Le Tomberry Musical est un podcast francophone dédié à la musique de jeux vidéo : bandes originales, compositeurs, coulisses et culture VGM. Chaque épisode explore les bandes originales, les compositeurs et les histoires derrière les musiques qui font vibrer les jeux.",
    asidePrimaryLink: {
      label: "Écouter les épisodes",
      href: "/podcasts",
    },
    asideSecondaryLink: {
      label: "Lire le blog",
      href: "/blog",
    },
  },
  fields: [
    defineField({
      name: "asideLabel",
      title: "Libellé de l’onglet",
      description: "Texte vertical qui permet d’ouvrir le volet.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "asideEyebrow",
      title: "Surtitre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "asideTitle",
      title: "Titre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "asideTagline",
      title: "Accroche",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "asideDescription",
      title: "Description",
      type: "text",
      rows: 6,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "asidePrimaryLink",
      title: "Premier lien",
      type: "object",
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: "label",
          title: "Libellé",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "href",
          title: "Destination",
          description: "Exemple : /podcasts ou https://exemple.fr",
          type: "string",
          validation: (rule) => rule.required().custom(internalLinkValidation),
        }),
      ],
    }),
    defineField({
      name: "asideSecondaryLink",
      title: "Second lien",
      type: "object",
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: "label",
          title: "Libellé",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "href",
          title: "Destination",
          description: "Exemple : /blog ou https://exemple.fr",
          type: "string",
          validation: (rule) => rule.required().custom(internalLinkValidation),
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Page d’accueil" }),
  },
});
