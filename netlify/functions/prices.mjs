const spreadsheetId = "1NVyeqXCgH_TpI4uMBjDQlzK-3cQekkUWcBY9ghxFFhY";
const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=0`;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim())) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim())) {
      rows.push(row);
    }
  }

  return rows;
}

function normalizeHeader(value) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLocaleLowerCase("sv")
    .replace(/\s+/g, " ");
}

function normalizeWineColor(value) {
  const color = value.trim().toLocaleLowerCase("sv");
  if (["rött", "röd", "r"].includes(color)) {
    return "Rött";
  }
  if (["vitt", "vit", "v"].includes(color)) {
    return "Vitt";
  }
  return undefined;
}

function toPriceRow(values, headers, audience) {
  const get = (header) => values[headers.get(header)]?.trim() ?? "";
  const producer = get("producent");
  const wine = get("vin");
  const priceValue = get(
    audience === "restaurant" ? "restaurangpris (kr)" : "privatpris (kr)",
  );

  if (!producer || !wine || !priceValue) {
    return null;
  }

  const status = priceValue.toLocaleLowerCase("sv");
  const row = {
    producer,
    wine,
    vintage: get("årgång") || undefined,
    wineColor: normalizeWineColor(get("vintyp")),
    bottle: get("flaska (ml)") || undefined,
    notes: get("notering") || undefined,
  };

  if (status === "slutsåld") {
    return { ...row, isSoldOut: true };
  }
  if (status === "allokering") {
    return { ...row, isAllocated: true };
  }

  const normalizedPrice = priceValue.replace(/\s|kr/gi, "").replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(normalizedPrice)) {
    return null;
  }

  return { ...row, price: normalizedPrice };
}

export async function handler(event) {
  const audience = event.queryStringParameters?.audience;
  if (audience !== "restaurant" && audience !== "private") {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "audience must be restaurant or private" }),
    };
  }

  try {
    const response = await fetch(csvUrl, {
      headers: { accept: "text/csv" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      throw new Error(`Google Sheets returned ${response.status}`);
    }

    const rows = parseCsv(await response.text());
    const headerRow = rows.shift();
    if (!headerRow) {
      throw new Error("Google Sheet has no header row");
    }

    const headers = new Map(
      headerRow.map((header, index) => [normalizeHeader(header), index]),
    );
    const requiredHeaders = [
      "producent",
      "vin",
      "årgång",
      "vintyp",
      "flaska (ml)",
      "restaurangpris (kr)",
      "privatpris (kr)",
      "notering",
    ];
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.has(header),
    );
    if (missingHeaders.length) {
      throw new Error(
        `Google Sheet is missing columns: ${missingHeaders.join(", ")}`,
      );
    }

    const prices = rows
      .map((values) => toPriceRow(values, headers, audience))
      .filter(Boolean);

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control":
          "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
      },
      body: JSON.stringify({ prices }),
    };
  } catch (error) {
    console.error("Could not load prices from Google Sheets", error);
    return {
      statusCode: 502,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
      body: JSON.stringify({ error: "Could not load the price list" }),
    };
  }
}
