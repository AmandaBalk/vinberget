import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import type { StructureResolver } from "sanity/desk";

import {
  aboutPage,
  contactPage,
  homePage,
  privatePage,
  producerPage,
  producer,
  restaurant,
  restaurantPage,
  siteSettings,
} from "./schemas";

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ?? "replace-with-your-project-id";
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";
const singletonTypes = new Set([
  "aboutPage",
  "contactPage",
  "homePage",
  "privatePage",
  "producerPage",
  "restaurantPage",
  "siteSettings",
]);

const structure: StructureResolver = (S) =>
  S.list()
    .title("Sidor på webbplatsen")
    .items([
      S.listItem()
        .title("Hem")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage-main")),
      S.listItem()
        .title("Om oss")
        .id("aboutPage")
        .child(
          S.document().schemaType("aboutPage").documentId("aboutPage-main"),
        ),
      S.listItem()
        .title("Våra producenter")
        .id("producerPage")
        .child(
          S.list()
            .title("Våra producenter")
            .items([
              S.listItem()
                .title("Sidtitel och introduktion")
                .id("producerPageContent")
                .child(
                  S.document()
                    .schemaType("producerPage")
                    .documentId("producerPage-main"),
                ),
              S.documentTypeListItem("producer").title("Producenter"),
            ]),
        ),
      S.listItem()
        .title("Restaurangkund")
        .id("restaurantPage")
        .child(
          S.list()
            .title("Restaurangkund")
            .items([
              S.listItem()
                .title("Sidtitel och introduktion")
                .id("restaurantPageContent")
                .child(
                  S.document()
                    .schemaType("restaurantPage")
                    .documentId("restaurantPage-main"),
                ),
              S.documentTypeListItem("restaurant").title("Restaurangkunder"),
            ]),
        ),
      S.listItem()
        .title("Privatkund")
        .id("privatePage")
        .child(
          S.list()
            .title("Privatkund")
            .items([
              S.listItem()
                .title("Sidinnehåll")
                .id("privatePageContent")
                .child(
                  S.document()
                    .schemaType("privatePage")
                    .documentId("privatePage-main"),
                ),
            ]),
        ),
      S.listItem()
        .title("Kontakt")
        .id("contactPage")
        .child(
          S.document().schemaType("contactPage").documentId("contactPage-main"),
        ),
    ]);

export default defineConfig({
  name: "vinberget-studio",
  title: "Vinberget Studio",
  projectId,
  dataset,
  plugins: [deskTool({ structure }), visionTool()],
  document: {
    actions: (previousActions, context) =>
      singletonTypes.has(context.schemaType)
        ? previousActions.filter(
            ({ action }) =>
              action === "publish" ||
              action === "discardChanges" ||
              action === "restore",
          )
        : previousActions,
    newDocumentOptions: (previousOptions, context) =>
      context.creationContext.type === "global"
        ? previousOptions.filter(
            (option) => !singletonTypes.has(option.templateId),
          )
        : previousOptions,
  },
  schema: {
    types: [
      homePage,
      aboutPage,
      producerPage,
      restaurantPage,
      contactPage,
      siteSettings,
      producer,
      restaurant,
      privatePage,
    ],
  },
});
