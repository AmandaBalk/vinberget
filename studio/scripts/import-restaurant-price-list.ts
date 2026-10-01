import { createRequire } from "node:module";

Object.assign(globalThis, { require: createRequire(import.meta.url) });

type PriceEntry = {
  producer: string;
  region: string;
  wine: string;
  vintage: string;
  bottle: string;
  price: string;
  notes?: string;
};

const entries: PriceEntry[] = [];

function add(
  producer: string,
  region: string,
  wine: string,
  vintage: string,
  price: string,
  bottle = "750",
  notes?: string,
) {
  entries.push({ producer, region, wine, vintage, bottle, price, notes });
}

const loersch = "Weingut Loersch";
const loerschRegion = "Mosel / Leiwen";
add(loersch, loerschRegion, "Blauschiefer Riesling", "2024", "149");
add(
  loersch,
  loerschRegion,
  "Trittenheimer Apotheke Vogelsang",
  "2023",
  "199",
  "750",
  "*",
);
add(
  loersch,
  loerschRegion,
  "Trittenheimer Apotheke Jungheld GG",
  "2022",
  "Slutsåld",
  "750",
  "*",
);
add(loersch, loerschRegion, "Glimmerschiefer Feinherb", "2023", "Slutsåld");
add(loersch, loerschRegion, "Trittenheimer Apotheke Kabinett", "2024", "169");
add(loersch, loerschRegion, "Trittenheimer Apotheke Auslese", "2023", "259");
add(
  loersch,
  loerschRegion,
  "Trittenheimer Apotheke Alte Reben Auslese",
  "2023",
  "229",
  "375",
);
add(
  loersch,
  loerschRegion,
  "Trittenheimer Apotheke Trockenbeerenauslese",
  "2011",
  "1199",
  "375",
);

const tim = "Weingut Tim Röttgerding";
const timRegion = "Mosel / Winningen";
add(tim, timRegion, "Riesling", "2023", "189");
add(tim, timRegion, "Winninger Riesling", "2023", "249");
add(tim, timRegion, "Winninger Röttgen Riesling", "2022", "349");
add(tim, timRegion, "Winninger Röttgen Riesling", "2023", "349");
add(tim, timRegion, "Spätburgunder", "2022", "249");
add(tim, timRegion, "Riesling Kabinett", "2023", "179");

const prinz = "Weingut Prinz";
const prinzRegion = "Rheingau / Hallgarten";
add(
  prinz,
  prinzRegion,
  "Hallgartener Riesling Trocken 'Tradition'",
  "2023",
  "Slutsåld",
);
add(prinz, prinzRegion, "Schönhell Riesling Trocken GG", "2021", "339");
add(prinz, prinzRegion, "Hallgartener Hendelberg Spätburgunder", "2020", "299");

const forey = "Domaine Forey Père et Fils";
const foreyRegion = "Bourgogne / Vosne-Romanée";
add(
  forey,
  foreyRegion,
  "Bourgogne Passetoutgrain",
  "2023",
  "189",
  "750",
  "Rött",
);
add(
  forey,
  foreyRegion,
  "Bourgogne Passetoutgrain",
  "2024",
  "189",
  "750",
  "Rött",
);
add(
  forey,
  foreyRegion,
  "Bourgogne Cote d'Or Rouge",
  "2023",
  "Slutsåld",
  "750",
  "Rött",
);
add(
  forey,
  foreyRegion,
  "Bourgogne Cote d'Or Rouge",
  "2024",
  "259",
  "750",
  "Rött",
);
add(
  forey,
  foreyRegion,
  "Savigny-les-Beaune 'Ez Connardises'",
  "2024",
  "295",
  "750",
  "Rött",
);
add(forey, foreyRegion, "Morey-St-Denis", "2014", "595", "750", "Rött");
add(forey, foreyRegion, "Morey-St-Denis", "2023", "395", "750", "Rött");
add(forey, foreyRegion, "Morey-St-Denis", "2024", "395", "750", "Rött");
add(forey, foreyRegion, "Nuits-St-Georges", "2022", "Slutsåld", "750", "Rött");
add(forey, foreyRegion, "Nuits-St-Georges", "2023", "Slutsåld", "750", "Rött");
add(forey, foreyRegion, "Nuits-St-Georges", "2024", "495", "750", "Rött");
add(
  forey,
  foreyRegion,
  "Gevrey-Chambertin 'La Justice'",
  "2023",
  "595",
  "750",
  "Rött",
);
add(
  forey,
  foreyRegion,
  "Gevrey-Chambertin 'La Justice'",
  "2024",
  "595",
  "750",
  "Rött",
);
add(forey, foreyRegion, "Vosne-Romanée", "2023", "695", "750", "Rött");
add(forey, foreyRegion, "Vosne-Romanée", "2024", "695", "750", "Rött");
add(
  forey,
  foreyRegion,
  "Vosne-Romanée 1er cru 'Les Petits Monts'",
  "2013",
  "Allokering",
  "750",
  "Rött",
);
add(
  forey,
  foreyRegion,
  "Vosne-Romanée 1er cru 'Les Petits Monts'",
  "2021",
  "Allokering",
  "750",
  "Rött",
);
add(
  forey,
  foreyRegion,
  "Vosne-Romanée 1er cru 'Les Petits Monts'",
  "2023",
  "Slutsåld",
  "750",
  "Rött",
);
add(
  forey,
  foreyRegion,
  "Vosne-Romanée 1er cru 'Les Petits Monts'",
  "2024",
  "Allokering",
  "750",
  "Rött",
);
add(
  forey,
  foreyRegion,
  "Vosne-Romanée 1er cru 'Les Gaudichots'",
  "2022",
  "Allokering",
  "750",
  "Rött",
);
add(
  forey,
  foreyRegion,
  "Vosne-Romanée 1er cru 'Les Gaudichots'",
  "2024",
  "Allokering",
  "750",
  "Rött",
);
for (const vintage of ["2021", "2022", "2023", "2024"]) {
  add(
    forey,
    foreyRegion,
    "Échezeaux Grand Cru",
    vintage,
    "Allokering",
    "750",
    "Rött",
  );
}
for (const vintage of ["2022", "2023", "2024"]) {
  add(
    forey,
    foreyRegion,
    "Clos Vougeot Grand Cru",
    vintage,
    "Allokering",
    "750",
    "Rött",
  );
}
add(
  forey,
  foreyRegion,
  "Bourgogne Cote d'Or blanc",
  "2023",
  "235",
  "750",
  "Vitt",
);
add(
  forey,
  foreyRegion,
  "Bourgogne Cote d'Or blanc",
  "2024",
  "235",
  "750",
  "Vitt",
);
add(
  forey,
  foreyRegion,
  "Savigny les Beaune 1er Cru 'Les Vergelesses'",
  "2023",
  "475",
  "750",
  "Vitt",
);
add(
  forey,
  foreyRegion,
  "Savigny les Beaune 1er Cru 'Les Vergelesses'",
  "2024",
  "475",
  "750",
  "Vitt",
);

const bernard = "Domaine Bernard-Bonin";
add(
  bernard,
  "Bourgogne / Meursault",
  "Samtliga viner",
  "",
  "Allokering",
  "750",
  "Samtliga viner på allokering. Kontakta oss för mer information.",
);

const perseval = "Champagne Perseval-Farge";
const persevalRegion = "Champagne / Chamery";
add(perseval, persevalRegion, "C. de Réserve 1er cru", "NV", "359");
add(perseval, persevalRegion, "C. de Pinots 1er cru", "NV", "389");
add(perseval, persevalRegion, "C. de Chardonnay 1er cru", "NV", "439");
add(
  perseval,
  persevalRegion,
  "Parcellaire 'La Pucelle' 1er cru",
  "NV",
  "Slutsåld",
);
add(
  perseval,
  persevalRegion,
  "Parcellaire 'Les Goulats' 1er cru",
  "NV",
  "849",
  "750",
  "*",
);
add(perseval, persevalRegion, "198 Millésime 1er cru", "2006", "799");

const cadgal = "Cadgal";
const cadgalRegion = "Piemonte / Valdivilla";
add(cadgal, cadgalRegion, "Moscato d'Asti Lumine DOCG", "2024", "159");
add(cadgal, cadgalRegion, "Canelli Moscato Sant'ilario DOCG", "2023", "209");
add(cadgal, cadgalRegion, "Moscato d'Asti Vigna Vecchia DOCG", "2018", "349");

add(
  "Weingut Jüngling",
  "Mosel / Neumagen-Drohn",
  "Rosengärtchen Beerenauslese",
  "2013",
  "499",
);

async function importRestaurantPriceList() {
  const { getCliClient } = await import("@sanity/cli");
  const client = getCliClient({
    apiVersion: "2026-09-01",
    useCdn: false,
  });

  const documents = entries.map((entry, index) => {
    const wineFields = Object.fromEntries(
      Object.entries(entry).filter(([key]) => key !== "region"),
    );

    return {
      _id: `restaurantPrice-list-2026-${String(index + 1).padStart(3, "0")}`,
      _type: "restaurantPrice",
      ...wineFields,
      isSoldOut: entry.price.toLowerCase() === "slutsåld",
      isAllocated: entry.price.toLowerCase() === "allokering",
      price: /^(slutsåld|allokering)$/i.test(entry.price) ? "" : entry.price,
    };
  });
  const ids = documents.map((document) => document._id);
  const existingIds = await client.fetch("*[_id in $ids]._id", { ids });
  const existingIdSet = new Set(existingIds);
  const missing = documents.filter(
    (document) => !existingIdSet.has(document._id),
  );

  if (missing.length === 0) {
    console.log(`All ${documents.length} supplied wine rows already exist.`);
    return;
  }

  const transaction = client.transaction();
  for (const document of missing) {
    transaction.createIfNotExists(document);
  }

  await transaction.commit();
  console.log(
    `Imported ${missing.length} of ${documents.length} wine rows. Existing rows were kept.`,
  );
}

importRestaurantPriceList().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
