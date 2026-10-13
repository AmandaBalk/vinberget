import { jsPDF } from "jspdf";
import brandLogoDataUrl from "./assets/Logga_vinberget_mellan_transparent.png?inline";
import type { PriceRow, PriceSortOrder, Producer } from "./types";

const ink: [number, number, number] = [48, 44, 39];
const olive: [number, number, number] = [116, 105, 69];
const muted: [number, number, number] = [126, 119, 106];
const rule: [number, number, number] = [220, 214, 201];

function priceText(row: PriceRow): string {
  if (row.isSoldOut) {
    return "Slutsåld";
  }
  if (row.isAllocated) {
    return "Allokering";
  }
  const price = row.price?.trim() ?? "";
  return /^\d+$/.test(price) ? `${price} kr` : price;
}

function comparePriceRows(
  left: PriceRow,
  right: PriceRow,
  sortOrder: PriceSortOrder,
): number {
  if (sortOrder === "alphabetical") {
    const byName = left.wine.localeCompare(right.wine, "sv", {
      sensitivity: "base",
    });
    if (byName !== 0) {
      return byName;
    }
  }

  const leftPrice = left.price
    ? Number(left.price.replace(",", "."))
    : Infinity;
  const rightPrice = right.price
    ? Number(right.price.replace(",", "."))
    : Infinity;
  if (leftPrice !== rightPrice) {
    return leftPrice - rightPrice;
  }
  return left.wine.localeCompare(right.wine, "sv", { sensitivity: "base" });
}

function bottleText(value?: string | null): string {
  const normalized = value?.trim() ?? "";
  const size = normalized.match(/^(\d+)(?:\s*ml)?$/i)?.[1];
  return size ? `${size} ml` : normalized;
}

function pdfText(value: string): string {
  return value
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("…", "...");
}

function capitalize(value: string): string {
  return value ? `${value[0].toLocaleUpperCase("sv")}${value.slice(1)}` : value;
}

export function createRestaurantPricePdf(
  rows: PriceRow[],
  producers: Producer[],
  sortOrder: PriceSortOrder = "price",
): jsPDF | null {
  if (rows.length === 0) {
    return null;
  }

  const document = new jsPDF({
    format: "a4",
    unit: "mm",
    orientation: "portrait",
  });
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const margin = 17;
  const groups = new Map<string, PriceRow[]>();

  for (const row of rows) {
    const key = row.producer.trim();
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }

  const sortedGroups = [...groups.entries()].sort(([left], [right]) =>
    left.localeCompare(right, "sv", { sensitivity: "base" }),
  );

  document.setProperties({
    title: "Vinberget - Restaurangprislista",
    subject: "Aktuell restaurangprislista, priser exklusive moms",
    author: "Vinberget Vinhandel",
  });

  document.setFont("times", "normal");
  document.addImage(brandLogoDataUrl, "PNG", (pageWidth - 73) / 2, 61, 73, 41);
  document.setTextColor(...ink);
  document.setFontSize(12);
  document.text("Prislista", pageWidth / 2, 123, {
    align: "center",
  });
  document.setFont("helvetica", "normal");
  document.setFontSize(9);
  document.setTextColor(...muted);
  document.text(
    capitalize(
      new Intl.DateTimeFormat("sv-SE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    ),
    pageWidth / 2,
    130,
    { align: "center" },
  );
  document.setTextColor(...olive);
  document.setFont("helvetica", "bold");
  document.setFontSize(8);
  document.text("RESTAURANG", pageWidth / 2, 138, { align: "center" });
  document.setTextColor(...muted);
  document.setFont("helvetica", "normal");
  document.setFontSize(8);
  document.text("Samtliga priser exklusive moms", pageWidth / 2, 145, {
    align: "center",
  });

  document.addPage();
  let cursorY = 27;
  const drawRunningHeader = () => {
    document.setTextColor(...olive);
    document.setFont("helvetica", "bold");
    document.setFontSize(7);
    document.text("VINBERGET VINHANDEL", margin, 14);
    document.setFont("helvetica", "normal");
    document.setTextColor(...muted);
    document.text("Restaurangprislista", pageWidth - margin, 14, {
      align: "right",
    });
    document.setDrawColor(...rule);
    document.setLineWidth(0.22);
    document.line(margin, 18, pageWidth - margin, 18);
  };
  const startContentPage = () => {
    document.addPage();
    drawRunningHeader();
    cursorY = 27;
  };
  drawRunningHeader();

  const drawLeaderRow = (row: PriceRow) => {
    const wineName = `${row.wine}${row.vintage ? ` ${row.vintage}` : ""}${row.bottle ? `, ${bottleText(row.bottle)}` : ""}`;
    const price = pdfText(priceText(row));
    const rightX = pageWidth - margin;
    const priceWidth = document.getTextWidth(price);
    const maxWineWidth = rightX - margin - priceWidth - 8;
    let wineFontSize = 8.2;
    document.setFont("helvetica", "normal");
    while (
      wineFontSize > 6.2 &&
      (document.setFontSize(wineFontSize),
      document.getTextWidth(pdfText(wineName)) > maxWineWidth)
    ) {
      wineFontSize -= 0.25;
    }

    document.setFontSize(wineFontSize);
    const safeWineName = pdfText(wineName);
    const wineWidth = document.getTextWidth(safeWineName);
    const leaderStart = margin + wineWidth + 1.5;
    const leaderEnd = rightX - priceWidth - 2;
    const dotWidth = Math.max(document.getTextWidth("."), 0.55);
    const dotCount = Math.max(
      0,
      Math.floor((leaderEnd - leaderStart) / dotWidth),
    );

    document.setTextColor(...ink);
    document.text(safeWineName, margin, cursorY);
    if (dotCount > 0) {
      document.setTextColor(...muted);
      document.text(".".repeat(dotCount), leaderStart, cursorY);
    }
    document.setFont("helvetica", "bold");
    document.setTextColor(...olive);
    document.text(price, rightX, cursorY, { align: "right" });
    cursorY += 4.6;

    if (row.notes?.trim()) {
      document.setFont("helvetica", "italic");
      document.setFontSize(7);
      document.setTextColor(...muted);
      const noteLines = document.splitTextToSize(
        pdfText(row.notes.trim()),
        rightX - margin - 4,
      );
      document.text(noteLines, margin + 2, cursorY);
      cursorY += noteLines.length * 3.2 + 1;
    }
  };

  for (const [producerName, producerRows] of sortedGroups) {
    const producer = producers.find(
      (item) =>
        item.name.trim().toLocaleLowerCase("sv") ===
        producerName.toLocaleLowerCase("sv"),
    );
    const displayName = producer?.name ?? producerName;
    const orderedRows = [...producerRows].sort((left, right) =>
      comparePriceRows(left, right, sortOrder),
    );
    const categories: Array<[string, PriceRow[]]> = [];
    const sparklingWines = orderedRows.filter(
      (row) => row.wineColor === "Mousserande",
    );
    const whiteWines = orderedRows.filter((row) => row.wineColor === "Vitt");
    const roseWines = orderedRows.filter((row) => row.wineColor === "Rosé");
    const redWines = orderedRows.filter((row) => row.wineColor === "Rött");
    const otherWines = orderedRows.filter(
      (row) =>
        !["Mousserande", "Vitt", "Rosé", "Rött"].includes(row.wineColor ?? ""),
    );
    if (sparklingWines.length > 0) {
      categories.push(["Mousserande", sparklingWines]);
    }
    if (whiteWines.length > 0) {
      categories.push(["Vitt", whiteWines]);
    }
    if (roseWines.length > 0) {
      categories.push(["Rosé", roseWines]);
    }
    if (redWines.length > 0) {
      categories.push(["Rött", redWines]);
    }
    if (otherWines.length > 0) {
      categories.push(["Övrigt", otherWines]);
    }

    if (cursorY + 14 > pageHeight - 22) {
      startContentPage();
    }

    document.setTextColor(...ink);
    document.setFont("helvetica", "bold");
    document.setFontSize(9);
    const producerLabel = pdfText(displayName.toLocaleUpperCase("sv"));
    document.text(producerLabel, margin, cursorY);
    let headingX = margin + document.getTextWidth(producerLabel) + 1.5;
    if (producer?.origin) {
      document.setFont("helvetica", "normal");
      document.setFontSize(8);
      document.setTextColor(...muted);
      const originLabel = `/ ${pdfText(producer.origin.toLocaleUpperCase("sv"))}`;
      document.text(originLabel, headingX, cursorY);
    }
    cursorY += 4.5;

    for (const [category, categoryRows] of categories) {
      if (cursorY > pageHeight - 24) {
        startContentPage();
      }

      if (category !== "Övrigt") {
        document.setFont("helvetica", "bold");
        document.setFontSize(7.5);
        document.setTextColor(...olive);
        document.text(category.toLocaleUpperCase("sv"), margin, cursorY);
        cursorY += 3.5;
      }

      for (const row of categoryRows) {
        if (cursorY > pageHeight - 23) {
          startContentPage();
        }
        drawLeaderRow(row);
      }
      cursorY += 2;
    }
    cursorY += 4;
  }

  const pageCount = document.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page);
    if (page > 1) {
      drawRunningHeader();
    }
    document.setDrawColor(...rule);
    document.setLineWidth(0.25);
    document.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    document.setFont("helvetica", "normal");
    document.setFontSize(8);
    document.setTextColor(...muted);
    document.text("Samtliga priser exklusive moms", margin, pageHeight - 9);
    document.text(
      `${page} / ${pageCount}`,
      pageWidth - margin,
      pageHeight - 9,
      {
        align: "right",
      },
    );
  }

  return document;
}

export function downloadRestaurantPricePdf(
  rows: PriceRow[],
  producers: Producer[],
  sortOrder: PriceSortOrder = "price",
): void {
  const document = createRestaurantPricePdf(rows, producers, sortOrder);
  if (!document) {
    return;
  }

  const today = new Intl.DateTimeFormat("sv-SE").format(new Date());
  document.save(`vinberget-restaurang-prislista-${today}.pdf`);
}
