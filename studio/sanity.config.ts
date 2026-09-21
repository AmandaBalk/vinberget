import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import type { StructureResolver } from "sanity/desk";

import {
  privatePage,
  privatePrice,
  producer,
  restaurant,
  restaurantPrice,
  siteSettings,
} from "./schemas";

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ?? "replace-with-your-project-id";
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";
const singletonTypes = new Set(["siteSettings", "privatePage"]);

const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Webbplatsinnehåll (Start, Om oss, Footer)")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.listItem()
        .title("Privatkundssida")
        .id("privatePage")
        .child(
          S.document().schemaType("privatePage").documentId("privatePage-main"),
        ),
      ...S.documentTypeListItems().filter(
        (listItem) => !singletonTypes.has(listItem.getId() ?? ""),
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
      siteSettings,
      producer,
      restaurant,
      restaurantPrice,
      privatePage,
      privatePrice,
    ],
  },
});
