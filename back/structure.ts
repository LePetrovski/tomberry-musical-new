import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenu")
    .items([
      S.listItem()
        .title("Réglages globaux")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
      S.listItem()
        .title("Page d’accueil")
        .id("homepage")
        .child(
          S.document()
            .schemaType("homepage")
            .documentId("homepage"),
        ),
      S.divider(),
      S.listItem()
        .title("Podcasts")
        .child(
          S.list()
            .title("Podcasts")
            .items([
              S.documentTypeListItem("podcast").title("Épisodes"),
              S.documentTypeListItem("podcastCategory").title("Catégories"),
              S.documentTypeListItem("guestAppearance").title(
                "Apparitions invitées",
              ),
              S.documentTypeListItem("compilation").title("Compilations"),
            ]),
        ),
      S.listItem()
        .title("Blog")
        .child(
          S.list()
            .title("Blog")
            .items([
              S.documentTypeListItem("post").title("Articles"),
              S.documentTypeListItem("postCategory").title("Catégories"),
            ]),
        ),
      S.documentTypeListItem("page").title("Pages"),
    ]);
