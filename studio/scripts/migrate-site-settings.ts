import { createRequire } from "node:module";

Object.assign(globalThis, { require: createRequire(import.meta.url) });

async function migrateSiteSettings() {
  const { getCliClient } = await import("@sanity/cli");
  const client = getCliClient({
    apiVersion: "2026-09-01",
    useCdn: false,
  });

  const legacySettings = await client.fetch('*[_type == "siteSettings"][0]');

  if (!legacySettings) {
    throw new Error("No legacy siteSettings document was found to migrate.");
  }

  const documents = [
    {
      _id: "homePage-main",
      _type: "homePage",
      siteName: legacySettings.siteName,
      tagline: legacySettings.tagline,
      heroText: legacySettings.heroText,
      homeImage: legacySettings.homeImage,
    },
    {
      _id: "aboutPage-main",
      _type: "aboutPage",
      title: legacySettings.aboutTitle,
      body: legacySettings.aboutBody,
      image: legacySettings.aboutImage,
    },
    {
      _id: "producerPage-main",
      _type: "producerPage",
      intro: legacySettings.producersIntro,
    },
    {
      _id: "restaurantPage-main",
      _type: "restaurantPage",
      priceIntro: legacySettings.restaurantsPriceIntro,
      intro: legacySettings.restaurantsIntro,
    },
    {
      _id: "contactPage-main",
      _type: "contactPage",
      email: legacySettings.footerEmail,
      instagramUrl: legacySettings.footerInstagramUrl,
      linkedinUrl: legacySettings.footerLinkedinUrl,
      newsletterTitle: legacySettings.newsletterTitle,
      newsletterText: legacySettings.newsletterText,
      newsletterCtaLabel: legacySettings.newsletterCtaLabel,
      newsletterEmbedUrl: legacySettings.newsletterEmbedUrl,
    },
  ];

  const ids = documents.map((document) => document._id);
  const existingIds = await client.fetch("*[_id in $ids]._id", { ids });

  if (existingIds.length > 0) {
    if (existingIds.length === documents.length) {
      console.log("Page documents already exist; nothing was changed.");
      return;
    }

    throw new Error(
      `Migration stopped to avoid overwriting existing page documents: ${existingIds.join(", ")}`,
    );
  }

  const transaction = client.transaction();
  for (const document of documents) {
    transaction.createIfNotExists(document);
  }

  await transaction.commit();
  console.log(
    `Migrated ${documents.length} page documents. The legacy document was kept.`,
  );
}

migrateSiteSettings().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
