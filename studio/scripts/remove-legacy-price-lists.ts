import { createRequire } from "node:module";

Object.assign(globalThis, { require: createRequire(import.meta.url) });

async function removeLegacyPriceLists() {
  const { getCliClient } = await import("@sanity/cli");
  const client = getCliClient({
    apiVersion: "2026-09-01",
    useCdn: false,
  });
  const types = ["restaurantPrice", "privatePrice"];
  const documents = await client.fetch<Array<{ _id: string; _type: string }>>(
    '*[_type in $types]{_id, _type}',
    { types },
  );

  if (documents.length === 0) {
    console.log("No legacy price-list documents found.");
    return;
  }

  const counts = documents.reduce<Record<string, number>>((result, document) => {
    result[document._type] = (result[document._type] ?? 0) + 1;
    return result;
  }, {});
  console.log("Deleting legacy price-list documents:", counts);

  const transaction = client.transaction();
  for (const document of documents) {
    transaction.delete(document._id);
  }
  await transaction.commit();

  const remaining = await client.fetch<number>(
    'count(*[_type in $types])',
    { types },
  );
  if (remaining > 0) {
    throw new Error(`Price-list cleanup left ${remaining} documents behind.`);
  }

  console.log("All legacy price-list documents were removed.");
}

removeLegacyPriceLists().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});