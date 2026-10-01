import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import type { StructureResolver } from "sanity/desk";

import {
  aboutPage,
  contactPage,
  homePage,
  privatePage,
  privatePrice,
  producerPage,
  producer,
  restaurant,
  restaurantPage,
  restaurantPrice,
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

const structure: StructureResolver = async (S, context) => {
  const client = context.getClient({ apiVersion: "2026-09-01" });
  const [producerDocuments, restaurantPriceProducers, privatePriceProducers] =
    await Promise.all([
      client.fetch<Array<{ name: string; origin?: string }>>(
        '*[_type == "producer" && defined(name)]|order(name asc){name, origin}',
      ),
      client.fetch<string[]>(
        'array::unique(*[_type == "restaurantPrice" && defined(producer)].producer)',
      ),
      client.fetch<string[]>(
        'array::unique(*[_type == "privatePrice" && defined(producer)].producer)',
      ),
    ]);

  const createProducerItems = (
    schemaType: "restaurantPrice" | "privatePrice",
    templateId: string,
    priceListProducers: string[],
  ) => {
    const producerMap = new Map<string, { name: string; origin?: string }>();

    for (const producerDocument of producerDocuments) {
      producerMap.set(
        producerDocument.name.trim().toLocaleLowerCase("sv"),
        producerDocument,
      );
    }

    for (const producerName of priceListProducers) {
      if (!producerName?.trim()) {
        continue;
      }

      const key = producerName.trim().toLocaleLowerCase("sv");
      if (!producerMap.has(key)) {
        producerMap.set(key, { name: producerName.trim() });
      }
    }

    return [...producerMap.values()]
      .sort((left, right) => left.name.localeCompare(right.name, "sv"))
      .map((producerDocument) =>
        S.listItem()
          .title(
            producerDocument.origin
              ? `${producerDocument.name} · ${producerDocument.origin}`
              : producerDocument.name,
          )
          .id(
            `${schemaType}-${producerDocument.name
              .toLocaleLowerCase("sv")
              .replace(/[^a-z0-9]+/g, "-")}`,
          )
          .child(() =>
            S.documentList()
              .title(producerDocument.name)
              .schemaType(schemaType)
              .filter("_type == $type && producer == $producerName")
              .params({ type: schemaType, producerName: producerDocument.name })
              .defaultOrdering([{ field: "wine", direction: "asc" }])
              .initialValueTemplates([
                S.initialValueTemplateItem(templateId, {
                  producerName: producerDocument.name,
                }),
              ]),
          ),
      );
  };

  return S.list()
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
              S.listItem()
                .title("Prislista")
                .id("restaurantPriceList")
                .child(
                  S.list()
                    .title("Prislista restaurang")
                    .items(
                      createProducerItems(
                        "restaurantPrice",
                        "restaurantPriceByProducer",
                        restaurantPriceProducers,
                      ),
                    ),
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
              S.listItem()
                .title("Prislista")
                .id("privatePriceList")
                .child(
                  S.list()
                    .title("Prislista privatkund")
                    .items(
                      createProducerItems(
                        "privatePrice",
                        "privatePriceByProducer",
                        privatePriceProducers,
                      ),
                    ),
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
};

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
    templates: (previousTemplates) => [
      ...previousTemplates,
      {
        id: "restaurantPriceByProducer",
        title: "Restaurangvin",
        schemaType: "restaurantPrice",
        parameters: [
          { name: "producerName", title: "Producent", type: "string" },
        ],
        value: ({ producerName }) => ({ producer: producerName }),
      },
      {
        id: "privatePriceByProducer",
        title: "Privatvin",
        schemaType: "privatePrice",
        parameters: [
          { name: "producerName", title: "Producent", type: "string" },
        ],
        value: ({ producerName }) => ({ producer: producerName }),
      },
    ],
    types: [
      homePage,
      aboutPage,
      producerPage,
      restaurantPage,
      contactPage,
      siteSettings,
      producer,
      restaurant,
      restaurantPrice,
      privatePage,
      privatePrice,
    ],
  },
});
