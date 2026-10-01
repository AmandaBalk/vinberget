import "./style.css";
import heroImg from "./assets/hero.png";
import brandLogoImg from "./assets/Logga_vinberget_mellan_transparent.png";
import { loadSiteContent } from "./content";
import type { PageId, PriceRow, Producer, SiteContent } from "./types";

interface Route {
  page: PageId;
  producerSlug?: string;
  producerSort?: "name" | "origin";
}

const appElement = document.querySelector<HTMLDivElement>("#app");
if (!appElement) {
  throw new Error("App root element was not found.");
}

const appRoot = appElement;
const navItems: Array<{ id: PageId; label: string; path: string }> = [
  { id: "hem", label: "Hem", path: "/hem" },
  { id: "om-oss", label: "Om oss", path: "/om-oss" },
  { id: "vinproducenter", label: "Våra producenter", path: "/vinproducenter" },
  { id: "restauranger", label: "Restaurangkund", path: "/restauranger" },
  { id: "privatkund", label: "Privatkund", path: "/privatkund" },
];

const NEWSLETTER_HIDE_UNTIL_KEY = "vinberget-newsletter-hide-until";
const NEWSLETTER_DELAY_MS = 6000;
const NEWSLETTER_HIDE_DAYS = 7;
const AGE_VERIFIED_SESSION_KEY = "vinberget-age-verified-session";

let newsletterTimer: number | undefined;
let mobileNavKeydownHandler: ((event: KeyboardEvent) => void) | null = null;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeUrl(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  if (/^(https?:)?\/\//.test(value) || value.startsWith("/")) {
    return value;
  }

  return fallback;
}

function toMailto(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.startsWith("mailto:") ? trimmed : `mailto:${trimmed}`;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  const shortened = value.slice(0, maxLength);
  const lastSpace = shortened.lastIndexOf(" ");

  if (lastSpace <= 0) {
    return `${shortened.trim()}...`;
  }

  return `${shortened.slice(0, lastSpace).trim()}...`;
}

function shuffleCopy<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function decodePathPart(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function routeFromLocation(pathname: string, search: string): Route {
  const normalized = pathname === "/" ? "/hem" : pathname;
  const parts = normalized.split("/").filter(Boolean);
  const query = new URLSearchParams(search);
  const producerSort = query.get("sort") === "origin" ? "origin" : "name";

  if (parts[0] === "vinproducenter" && parts[1]) {
    return { page: "vinproducenter", producerSlug: decodePathPart(parts[1]) };
  }

  switch (parts[0]) {
    case "hem":
    case "om-oss":
    case "vinproducenter":
    case "restauranger":
    case "privatkund":
      return parts[0] === "vinproducenter"
        ? { page: parts[0], producerSort }
        : { page: parts[0] };
    default:
      return { page: "hem" };
  }
}

function updateMeta(route: Route, content: SiteContent): void {
  const baseTitle = content.siteName;
  const titleByPage: Record<PageId, string> = {
    hem: `${baseTitle}`,
    "om-oss": `Om oss | ${baseTitle}`,
    vinproducenter: `Vinproducenter | ${baseTitle}`,
    restauranger: `Restauranger | ${baseTitle}`,
    privatkund: `Privatkund | ${baseTitle}`,
  };

  let description =
    "Vinberget Vinhandel presenterar producenter, prislistor och information för restauranger och privatkunder.";
  if (route.page === "om-oss") {
    description = content.about.body;
  }

  if (route.page === "vinproducenter") {
    if (route.producerSlug) {
      const producer = content.producers.find(
        (item) => item.slug === route.producerSlug,
      );
      if (producer) {
        document.title = `${producer.name} | ${baseTitle}`;
        description = producer.intro;
      } else {
        document.title = titleByPage.vinproducenter;
        description = "Läs mer om Vinbergets producenter.";
      }
    } else {
      description = "Läs mer om Vinbergets producenter och deras viner.";
    }
  }

  if (route.page === "restauranger") {
    description = content.restaurants.intro;
  }

  if (route.page === "privatkund") {
    description = content.privateCustomers.intro;
  }

  if (!route.producerSlug || route.page !== "vinproducenter") {
    document.title = titleByPage[route.page];
  }

  const metaDescription = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );
  if (metaDescription) {
    metaDescription.content = description.slice(0, 200);
  }

  let canonicalLink = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    document.head.append(canonicalLink);
  }
  canonicalLink.href = `${window.location.origin}${window.location.pathname}`;
}

function formatBottleSize(value?: string | null): string {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    return "";
  }

  const numericSize = normalized.match(/^(\d+)(?:\s*ml)?$/i)?.[1];
  return numericSize ? `${numericSize} ML` : normalized.toUpperCase();
}

function formatPrice(value?: string): string {
  const normalized = value?.trim() ?? "";
  const numericPrice = normalized.match(/^(\d+)(?:\s*kr)?$/i)?.[1];
  return numericPrice ? `${numericPrice} kr` : normalized;
}

function priceLabel(row: PriceRow): string {
  if (row.isSoldOut) {
    return "Slutsåld";
  }

  if (row.isAllocated) {
    return "Allokering";
  }

  return formatPrice(row.price);
}

function renderPriceTable(
  rows: PriceRow[],
  showProducer = true,
  showColumnLabels = true,
  showWineColumnLabel = true,
): string {
  if (rows.length === 0) {
    return '<p class="empty-state">Prislista publiceras inom kort.</p>';
  }

  const initialVisible = 5;
  const step = 5;
  const hasShowMore = rows.length > initialVisible;

  const tableRows = rows
    .map((row, index) => {
      const wineTitle = `${row.wine}${row.vintage ? ` ${row.vintage}` : ""}`;
      const isHidden = hasShowMore && index >= initialVisible;
      const hiddenAttribute = isHidden ? " hidden" : "";

      return `
      <tr data-wine-name="${escapeHtml(wineTitle)}"${hiddenAttribute}>
        <th scope="row" class="price-table__wine"><span class="price-cell-text">${escapeHtml(wineTitle)}</span></th>
        ${showProducer ? `<td class="price-table__producer"><span class="price-cell-text">${escapeHtml(row.producer)}</span></td>` : ""}
        <td class="price-table__bottle"><span class="price-cell-text">${escapeHtml(formatBottleSize(row.bottle))}</span></td>
        <td class="price-table__price"><span class="price-cell-text">${escapeHtml(priceLabel(row))}</span></td>
        <td class="price-table__notes"><span class="price-cell-text">${row.notes ? escapeHtml(row.notes) : ""}</span></td>
      </tr>
    `;
    })
    .join("");

  const mobileItems = rows
    .map((row, index) => {
      const wineTitle = `${row.wine}${row.vintage ? ` ${row.vintage}` : ""}`;
      const metaParts = showProducer ? [row.producer] : [];
      const isHidden = hasShowMore && index >= initialVisible;
      const hiddenAttribute = isHidden ? " hidden" : "";

      if (row.bottle) {
        metaParts.push(formatBottleSize(row.bottle));
      }

      return `
      <li class="price-item" data-wine-name="${escapeHtml(wineTitle)}"${hiddenAttribute}>
        <div class="price-item__top">
          <h3 class="price-item__wine">${escapeHtml(wineTitle)}</h3>
          <p class="price-item__price">${escapeHtml(priceLabel(row))}</p>
        </div>
        <p class="price-item__meta">${escapeHtml(metaParts.join(" • "))}</p>
        ${row.notes ? `<p class="price-item__notes">${escapeHtml(row.notes)}</p>` : ""}
      </li>
    `;
    })
    .join("");

  return `
    <div class="price-list-wrap${hasShowMore ? " price-list-wrap--has-fade" : ""}" data-price-list data-visible-count="${initialVisible}" data-step="${step}">
      <div class="price-table-wrap" aria-label="Prislista">
        <table class="price-table">
          <thead${showColumnLabels ? "" : ' class="sr-only"'}>
            <tr>
              <th scope="col"${showWineColumnLabel ? "" : ' class="sr-only"'}>Vin</th>
              ${showProducer ? '<th scope="col">Producent</th>' : ""}
              <th scope="col">Flaska</th>
              <th scope="col">Pris</th>
              <th scope="col">Notering</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
      <ul class="price-list price-list--mobile" aria-label="Prislista">
        ${mobileItems}
      </ul>
      ${
        hasShowMore
          ? '<button type="button" class="price-list__more" data-show-more-prices>Visa fler</button>'
          : ""
      }
    </div>
  `;
}

function renderProducerPriceList(
  rows: PriceRow[],
  producers: Producer[],
): string {
  if (rows.length === 0) {
    return '<p class="empty-state">Prislista publiceras inom kort.</p>';
  }

  const groupedRows = new Map<string, PriceRow[]>();

  rows.forEach((row) => {
    const producerKey = row.producer.trim().toLocaleLowerCase("sv");
    const producerRows = groupedRows.get(producerKey) ?? [];
    producerRows.push(row);
    groupedRows.set(producerKey, producerRows);
  });

  const groups = Array.from(groupedRows, ([producerKey, wines]) => {
    const producer = producers.find(
      (item) => item.name.trim().toLocaleLowerCase("sv") === producerKey,
    );
    const origin = producer?.origin || "";
    const name = producer?.name ?? wines[0].producer.trim();
    const uniqueWines = new Map<string, PriceRow>();

    for (const wine of wines) {
      const normalizedWine = {
        ...wine,
        producer: name,
        wine: wine.wine.trim(),
      };
      const duplicateKey = JSON.stringify([
        normalizedWine.wine.toLocaleLowerCase("sv"),
        normalizedWine.vintage?.trim().toLocaleLowerCase("sv"),
        normalizedWine.bottle?.trim(),
        normalizedWine.price?.trim().toLocaleLowerCase("sv"),
        normalizedWine.isSoldOut,
        normalizedWine.isAllocated,
        normalizedWine.wineColor,
        normalizedWine.notes?.trim(),
      ]);

      if (!uniqueWines.has(duplicateKey)) {
        uniqueWines.set(duplicateKey, normalizedWine);
      }
    }

    return {
      name,
      origin,
      wines: [...uniqueWines.values()].sort((left, right) =>
        left.wine.localeCompare(right.wine, "sv", { sensitivity: "base" }),
      ),
    };
  }).sort((left, right) =>
    left.name.localeCompare(right.name, "sv", { sensitivity: "base" }),
  );

  const producerGroups = groups
    .map((group) => {
      const redWines = group.wines.filter((wine) => wine.wineColor === "Rött");
      const whiteWines = group.wines.filter(
        (wine) => wine.wineColor === "Vitt",
      );
      const uncategorizedWines = group.wines.filter(
        (wine) => wine.wineColor !== "Rött" && wine.wineColor !== "Vitt",
      );
      const renderWineColorGroup = (title: string, wines: PriceRow[]) => {
        if (wines.length === 0) {
          return "";
        }

        return `
              <section class="producer-wine-group__category">
                <h4 class="producer-wine-group__category-title">${escapeHtml(title)}</h4>
                ${renderPriceTable(wines, false, false)}
              </section>
            `;
      };

      return `
    <section class="producer-wine-group">
      <h3 class="producer-wine-group__heading">
        <span class="producer-wine-group__name">${escapeHtml(group.name)}</span>
        ${group.origin ? `<span class="producer-wine-group__origin">${escapeHtml(group.origin)}</span>` : ""}
      </h3>
      <div class="producer-wine-group__list">
        <div class="price-table-wrap producer-wine-group__shared-header" aria-hidden="true">
          <table class="price-table">
            <thead>
              <tr>
                <th scope="col" class="price-table__wine">Vin</th>
                <th scope="col" class="price-table__bottle">Flaska</th>
                <th scope="col" class="price-table__price">Pris</th>
                <th scope="col" class="price-table__notes">Notering</th>
              </tr>
            </thead>
          </table>
        </div>
        ${renderWineColorGroup("Rött", redWines)}
        ${renderWineColorGroup("Vitt", whiteWines)}
        ${uncategorizedWines.length > 0 ? renderPriceTable(uncategorizedWines, false, false) : ""}
      </div>
    </section>
  `;
    })
    .join("");

  return `<div class="producer-wine-list">${producerGroups}</div>`;
}

function linkifySystembolagetText(value: string): string {
  const escaped = escapeHtml(value);
  const systembolagetPattern = /(?:www\.)?systembolaget\.se/g;
  const systembolagetHref = "https://www.systembolaget.se";
  const systembolagetText = "systembolaget.se";

  return escaped.replace(
    systembolagetPattern,
    () =>
      `<a href="${systembolagetHref}" class="inline-anchor" target="_blank" rel="noreferrer">${systembolagetText}</a>`,
  );
}

type MailchimpJsonpResponse = {
  result?: string;
  msg?: string;
};

let mailchimpJsonpCounter = 0;

function mailchimpMessageText(message: string | undefined): string {
  if (!message) {
    return "";
  }

  const scratch = document.createElement("div");
  scratch.innerHTML = message;
  return (scratch.textContent || scratch.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
}

function mailchimpJsonpEndpoint(actionUrl: string): URL {
  const endpoint = new URL(actionUrl);
  endpoint.pathname = endpoint.pathname.replace(
    "/subscribe/post",
    "/subscribe/post-json",
  );
  endpoint.searchParams.delete("c");
  return endpoint;
}

function subscribeToMailchimp(
  actionUrl: string,
  email: string,
): Promise<MailchimpJsonpResponse> {
  return new Promise((resolve, reject) => {
    const callbackName = `__mailchimpJsonpCallback_${Date.now()}_${mailchimpJsonpCounter++}`;
    const endpoint = mailchimpJsonpEndpoint(actionUrl);

    endpoint.searchParams.set("EMAIL", email);
    endpoint.searchParams.set("MERGE0", email);
    endpoint.searchParams.set("c", callbackName);

    const callbackWindow = window as unknown as Record<string, unknown>;
    const script = document.createElement("script");
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Mailchimp timeout"));
    }, 15000);

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      script.remove();
      delete callbackWindow[callbackName];
    };

    callbackWindow[callbackName] = (response: MailchimpJsonpResponse) => {
      cleanup();
      resolve(response || {});
    };

    script.src = endpoint.toString();
    script.async = true;
    script.onerror = () => {
      cleanup();
      reject(new Error("Mailchimp request failed"));
    };

    document.body.append(script);
  });
}

function renderHome(content: SiteContent): string {
  const featuredProducers = shuffleCopy(content.producers)
    .slice(0, 3)
    .map(
      (producer) => `
      <li class="home-featured-card">
        <a class="home-featured-card__link" href="/vinproducenter/${encodeURIComponent(producer.slug)}">
          <h3>${escapeHtml(producer.name)}</h3>
          <p>${escapeHtml(truncateText(producer.intro || "Läs mer om producenten.", 135))}</p>
          <span class="home-featured-card__cta">Läs producentprofil</span>
        </a>
      </li>
    `,
    )
    .join("");

  const featuredProducerMarkup = featuredProducers
    ? `
      <section class="home-featured reveal">
        <div class="home-featured__head">
          <h2 class="home-featured__title">Några av våra producenter</h2>
            <a class="text-link" href="/vinproducenter">Se alla producenter</a>
        </div>
        <ul class="home-featured__grid">${featuredProducers}</ul>
      </section>
    `
    : "";

  return `
    <section class="hero-panel hero-panel--home reveal">
      ${content.homeImageUrl ? `<img class="home-hero-image" src="${safeUrl(content.homeImageUrl, "")}" alt="${escapeHtml(content.siteName)}" />` : ""}
      <div class="home-hero-main">
        <h1>${escapeHtml(content.tagline)}</h1>
        <p class="lead">${escapeHtml(content.heroText)}</p>
      </div>
    </section>
    ${featuredProducerMarkup}
  `;
}

function removeNewsletterPopup(): void {
  document.querySelector(".newsletter-popup")?.remove();
  document.querySelector(".newsletter-backdrop")?.remove();
}

function hideNewsletterForDays(days: number): void {
  const hideUntil = Date.now() + days * 24 * 60 * 60 * 1000;
  window.localStorage.setItem(NEWSLETTER_HIDE_UNTIL_KEY, String(hideUntil));
}

function showNewsletterPopup(content: SiteContent): void {
  if (document.querySelector(".newsletter-popup")) {
    return;
  }

  const backdrop = document.createElement("div");
  backdrop.className = "newsletter-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  const popup = document.createElement("aside");
  popup.className = "newsletter-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-label", "Nyhetsbrev");

  const newsletterForm = content.newsletter.embedUrl
    ? `
      <form class="newsletter-form" action="${escapeHtml(content.newsletter.embedUrl)}" method="post" data-newsletter="form">
        <label class="newsletter-form__field">
          <span class="newsletter-form__label">E-postadress</span>
          <input
            class="newsletter-form__input required email"
            type="email"
            name="MERGE0"
            id="MERGE0"
            placeholder="namn@exempel.se"
            autocomplete="email"
            required
          />
        </label>
        <button type="submit" class="primary-button">${escapeHtml(content.newsletter.ctaLabel)}</button>
      </form>
    `
    : `<button type="button" class="primary-button" disabled>${escapeHtml(content.newsletter.ctaLabel)}</button>`;

  popup.innerHTML = `
    <button type="button" class="newsletter-popup__close" aria-label="Stäng" data-newsletter="close">X</button>
    <h3>${escapeHtml(content.newsletter.title)}</h3>
    <p>${escapeHtml(content.newsletter.text)}</p>
    ${newsletterForm}
    <p class="newsletter-popup__status" aria-live="polite" hidden></p>
  `;

  popup.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const action = target.getAttribute("data-newsletter");

    if (action === "close") {
      hideNewsletterForDays(NEWSLETTER_HIDE_DAYS);
      removeNewsletterPopup();
      return;
    }

    const clickedCloseButton = target.closest("[data-newsletter='close']");
    if (clickedCloseButton) {
      hideNewsletterForDays(NEWSLETTER_HIDE_DAYS);
      removeNewsletterPopup();
    }
  });

  popup.addEventListener("submit", (event) => {
    event.preventDefault();

    const form = popup.querySelector<HTMLFormElement>(
      'form[data-newsletter="form"]',
    );
    const emailInput = popup.querySelector<HTMLInputElement>("#MERGE0");
    const status = popup.querySelector<HTMLElement>(
      ".newsletter-popup__status",
    );
    const submitButton = popup.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );

    if (!form || !emailInput || !emailInput.value.trim()) {
      if (status) {
        status.hidden = false;
        status.textContent = "Ange en giltig e-postadress.";
      }
      return;
    }

    const email = emailInput.value.trim();

    popup.dataset.newsletterState = "submitted";
    if (status) {
      status.hidden = false;
      status.textContent = "Registrerar din e-postadress...";
    }

    submitButton?.setAttribute("disabled", "true");

    void subscribeToMailchimp(form.action, email)
      .then((response) => {
        const result = response.result?.toLowerCase();
        const message = mailchimpMessageText(response.msg);

        if (result === "success") {
          if (status) {
            status.textContent = "Tack! Du är nu registrerad i nyhetsbrevet.";
          }

          window.setTimeout(() => {
            hideNewsletterForDays(NEWSLETTER_HIDE_DAYS);
            removeNewsletterPopup();
          }, 2000);
          return;
        }

        if (status) {
          status.textContent =
            message ||
            "Kunde inte registrera just nu. Försök igen om en stund.";
        }
      })
      .catch(() => {
        if (status) {
          status.textContent =
            "Kunde inte nå Mailchimp just nu. Kontrollera internet och försök igen.";
        }
      })
      .finally(() => {
        submitButton?.removeAttribute("disabled");
      });
  });

  document.body.append(backdrop, popup);
}

function scheduleNewsletterPopup(content: SiteContent): void {
  if (newsletterTimer) {
    window.clearTimeout(newsletterTimer);
  }

  const route = routeFromLocation(
    window.location.pathname,
    window.location.search,
  );
  if (route.page !== "hem") {
    return;
  }

  const hideUntil = Number(
    window.localStorage.getItem(NEWSLETTER_HIDE_UNTIL_KEY) ?? "0",
  );
  if (Date.now() < hideUntil) {
    return;
  }

  newsletterTimer = window.setTimeout(() => {
    if (
      routeFromLocation(window.location.pathname, window.location.search)
        .page === "hem"
    ) {
      showNewsletterPopup(content);
    }
  }, NEWSLETTER_DELAY_MS);
}

function renderAbout(content: SiteContent): string {
  return `
    <section class="producer-detail reveal">
      <div class="producer-hero producer-hero--about">
        <div class="producer-hero__media">
          <img class="producer-hero__image" src="${safeUrl(content.about.imageUrl, heroImg)}" alt="Vinberget" />
        </div>
        <div class="producer-hero__panel">
          <p class="eyebrow">Om oss</p>
          <h1>${escapeHtml(content.about.title)}</h1>
          <p>${escapeHtml(content.about.body)}</p>
        </div>
      </div>
    </section>
  `;
}

function renderProducerList(
  content: SiteContent,
  producerSort: "name" | "origin",
): string {
  const producers = content.producers;

  if (producers.length === 0) {
    return `
      <section class="content-card reveal">
        <h1>${escapeHtml(content.producersTitle)}</h1>
        <p class="empty-state">Producenter publiceras inom kort.</p>
      </section>
    `;
  }

  const sortedProducers = [...producers].sort((left, right) => {
    if (producerSort === "origin") {
      const leftOrigin = (left.origin?.trim() || "Övrigt").toLocaleLowerCase(
        "sv",
      );
      const rightOrigin = (right.origin?.trim() || "Övrigt").toLocaleLowerCase(
        "sv",
      );
      const byOrigin = leftOrigin.localeCompare(rightOrigin, "sv");
      if (byOrigin !== 0) {
        return byOrigin;
      }
    }

    return left.name.localeCompare(right.name, "sv", { sensitivity: "base" });
  });

  const items = sortedProducers
    .map((producer) => {
      const overviewImageUrl = producer.overviewImageUrl;
      return `
      <li class="producer-card">
        <a class="producer-card__link${overviewImageUrl ? " producer-card__link--with-image" : ""}" href="/vinproducenter/${encodeURIComponent(producer.slug)}">
          ${overviewImageUrl ? `<span class="producer-card__image-frame"><img class="producer-card__image" src="${safeUrl(overviewImageUrl, "")}" alt="${escapeHtml(producer.name)}" loading="lazy" /></span>` : ""}
          <span class="producer-card__copy">
            <h3>${escapeHtml(producer.name)}</h3>
            ${
              producer.origin
                ? `<span class="producer-card__origin">${escapeHtml(producer.origin)}</span>`
                : ""
            }
          </span>
        </a>
      </li>
    `;
    })
    .join("");

  return `
    <section class="content-card reveal producer-overview">
      <h1>${escapeHtml(content.producersTitle)}</h1>
      <p class="lead-small">${escapeHtml(content.producersIntro || "Välj en producent för att läsa mer om vingård, källare och viner.")}</p>
      <div class="producer-toolbar" aria-label="Sortera producenter">
        <span class="producer-toolbar__label">Sortera efter</span>
        <a class="sort-link${producerSort === "name" ? " active" : ""}" href="/vinproducenter"${producerSort === "name" ? ' aria-current="true"' : ""}>Namn</a>
        <a class="sort-link${producerSort === "origin" ? " active" : ""}" href="/vinproducenter?sort=origin"${producerSort === "origin" ? ' aria-current="true"' : ""}>Land/region</a>
      </div>
      <ul class="producer-list">${items}</ul>
    </section>
  `;
}

function renderProducerPage(producer: Producer): string {
  const additionalImages = (producer.additionalImages ?? []).filter((item) =>
    Boolean(item.url),
  );
  const secondaryImage = additionalImages[0];
  const mobileGalleryImages = [
    {
      url: producer.heroImageUrl,
      caption: producer.imageCaption,
      alt: producer.name,
    },
    ...additionalImages.map((item, index) => ({
      url: item.url,
      caption: item.caption,
      alt: `${producer.name} bild ${index + 2}`,
    })),
  ];

  const producerMedia = secondaryImage
    ? `
        <div class="producer-diptych">
          <figure class="producer-diptych__primary">
            <img class="producer-hero__image producer-hero__image--primary" src="${safeUrl(producer.heroImageUrl, heroImg)}" alt="${escapeHtml(producer.name)}" />
            ${
              producer.imageCaption
                ? `<figcaption class="producer-hero__caption">${escapeHtml(producer.imageCaption)}</figcaption>`
                : ""
            }
          </figure>
          <figure class="producer-diptych__secondary">
            <img class="producer-diptych__image" src="${safeUrl(secondaryImage.url, heroImg)}" alt="${escapeHtml(`${producer.name} detalj`)}" />
            ${
              secondaryImage.caption
                ? `<figcaption class="producer-hero__caption">${escapeHtml(secondaryImage.caption)}</figcaption>`
                : ""
            }
          </figure>
        </div>
        <div class="producer-mobile-gallery" aria-label="Bilder från producenten">
          <div class="producer-mobile-gallery__track">
            ${mobileGalleryImages
              .map(
                (image) => `
                  <figure class="producer-mobile-gallery__slide">
                    <img class="producer-mobile-gallery__image" src="${safeUrl(image.url, heroImg)}" alt="${escapeHtml(image.alt)}" />
                    ${
                      image.caption
                        ? `<figcaption class="producer-hero__caption">${escapeHtml(image.caption)}</figcaption>`
                        : ""
                    }
                  </figure>
                `,
              )
              .join("")}
          </div>
        </div>
      `
    : `
        <img class="producer-hero__image producer-hero__image--primary" src="${safeUrl(producer.heroImageUrl, heroImg)}" alt="${escapeHtml(producer.name)}" />
        ${
          producer.imageCaption
            ? `<p class="producer-hero__caption">${escapeHtml(producer.imageCaption)}</p>`
            : ""
        }
      `;

  return `
    <section class="producer-detail reveal">
      <div class="producer-hero">
        <div class="producer-hero__media ${secondaryImage ? "producer-hero__media--diptych" : ""}">
          ${producerMedia}
        </div>
        <div class="producer-hero__panel">
          <p class="eyebrow">Producent</p>
          <h1>${escapeHtml(producer.name)}</h1>
          <p class="producer-hero__intro">${escapeHtml(producer.intro)}</p>
          <a class="text-link" href="/vinproducenter">Tillbaka till översikten</a>
        </div>
      </div>
      <div class="producer-sections producer-sections--accordion">
        <details class="producer-accordion">
          <summary>I vingården</summary>
          <p>${escapeHtml(producer.vineyard)}</p>
        </details>
        <details class="producer-accordion">
          <summary>I källaren</summary>
          <p>${escapeHtml(producer.cellar)}</p>
        </details>
        <details class="producer-accordion">
          <summary>Om vinerna</summary>
          <p>${escapeHtml(producer.wines)}</p>
        </details>
      </div>
    </section>
  `;
}

function renderRestaurants(content: SiteContent): string {
  const initialVisible = 10;
  const step = 10;
  const hasShowMore = content.restaurants.partners.length > initialVisible;

  const restaurants = content.restaurants.partners
    .map(
      (partner, index) => `
      <li class="restaurant-list__item" ${hasShowMore && index >= initialVisible ? "hidden" : ""}>
        <h3 class="restaurant-entry__name">${escapeHtml(partner.name)}${
          partner.city
            ? ` <span class="restaurant-entry__city">${escapeHtml(partner.city)}</span>`
            : ""
        }</h3>
        <p class="restaurant-entry__description">${escapeHtml(partner.description)}</p>
      </li>
    `,
    )
    .join("");

  const partnerContent =
    content.restaurants.partners.length > 0
      ? `
          <ul class="restaurant-list${hasShowMore ? " restaurant-list--has-fade" : ""}" data-visible-count="${initialVisible}" data-step="${step}">${restaurants}</ul>
          ${
            content.restaurants.partners.length > initialVisible
              ? `<button type="button" class="secondary-button restaurant-list__more" data-show-more-restaurants data-step="${step}">Visa fler</button>`
              : ""
          }
        `
      : '<p class="empty-state">Restaurangkunder publiceras inom kort.</p>';

  return `
    <section class="content-card content-card--wide reveal restaurants-page">
      <header class="restaurants-page__intro">
        <p class="eyebrow">Vinberget vinhandel</p>
        <h1>${escapeHtml(content.restaurants.pageTitle)}</h1>
        <p class="restaurants-page__lead">${escapeHtml(content.restaurants.priceIntro)}</p>
        <p class="restaurant-price-contact">${escapeHtml(content.restaurants.contactPrompt)} <a href="#kontakt" class="inline-anchor" data-scroll-to-contact>${escapeHtml(content.restaurants.contactLinkLabel)}</a>.</p>
      </header>
      <section class="restaurants-page__section" aria-labelledby="restaurang-prislista">
        <header class="restaurant-price-heading">
          <h2 id="restaurang-prislista">Prislista</h2>
        </header>
        ${renderProducerPriceList(content.restaurants.priceList, content.producers)}
      </section>
      <section class="restaurants-page__section restaurants-page__partners" aria-labelledby="restaurang-kunder">
        <h2 id="restaurang-kunder">${escapeHtml(content.restaurants.partnersTitle)}</h2>
        <p class="restaurant-customers-intro">${escapeHtml(content.restaurants.intro)}</p>
        ${partnerContent}
      </section>
    </section>
  `;
}

function renderPrivateCustomers(content: SiteContent): string {
  const steps = content.privateCustomers.orderSteps
    .map((step) => `<li>${linkifySystembolagetText(step)}</li>`)
    .join("");

  const stepContent =
    content.privateCustomers.orderSteps.length > 0
      ? `<ol class="order-steps">${steps}</ol>`
      : '<p class="empty-state">Beställningsinformation uppdateras inom kort.</p>';

  return `
    <section class="content-card content-card--wide reveal private-page">
      <header class="private-page__intro">
        <p class="eyebrow">Privatimport</p>
        <h1>Privatkund</h1>
        <p class="private-page__lead">${linkifySystembolagetText(content.privateCustomers.intro)}</p>
      </header>
      <section class="private-page__ordering" aria-labelledby="private-ordering-title">
        <header class="private-page__section-heading">
          <p class="eyebrow">Beställning</p>
          <h2 id="private-ordering-title">Via Systembolaget</h2>
        </header>
        ${stepContent}
      </section>
      <section class="private-page__price-section" aria-labelledby="private-price-title">
        <header class="restaurant-price-heading private-price-heading">
          <h2 id="private-price-title">${escapeHtml(content.privateCustomers.priceListTitle)}</h2>
        </header>
        ${renderProducerPriceList(content.privateCustomers.priceList, content.producers)}
      </section>
    </section>
  `;
}

function renderPage(route: Route, content: SiteContent): string {
  if (route.page === "hem") {
    return renderHome(content);
  }

  if (route.page === "om-oss") {
    return renderAbout(content);
  }

  if (route.page === "vinproducenter" && route.producerSlug) {
    const producer = content.producers.find(
      (item) => item.slug === route.producerSlug,
    );

    if (!producer) {
      return `
        <section class="content-card reveal">
          <h1>Producenten kunde inte hittas</h1>
          <p>Välj en producent från översikten.</p>
          <a class="text-link" href="/vinproducenter">Till producentlistan</a>
        </section>
      `;
    }

    return renderProducerPage(producer);
  }

  if (route.page === "vinproducenter") {
    return renderProducerList(content, route.producerSort ?? "name");
  }

  if (route.page === "restauranger") {
    return renderRestaurants(content);
  }

  return renderPrivateCustomers(content);
}

function renderApp(content: SiteContent): void {
  const route = routeFromLocation(
    window.location.pathname,
    window.location.search,
  );
  updateMeta(route, content);

  const navigation = navItems
    .map(
      (item) => `
        <a class="nav-link${route.page === item.id ? " active" : ""}" href="${item.path}">${escapeHtml(item.label)}</a>
      `,
    )
    .join("");

  appRoot.innerHTML = `
    <div class="background-texture"></div>
    <div class="site-shell">
      <header class="site-header">
        <a class="brand" href="/hem" aria-label="Vinberget Vinhandel">
          <img class="brand-logo" src="${brandLogoImg}" alt="${escapeHtml(content.siteName)}" />
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Öppna meny">
          <span class="nav-toggle__line"></span>
          <span class="nav-toggle__line"></span>
          <span class="nav-toggle__line"></span>
        </button>
        <nav class="site-nav" id="primary-nav">
          ${navigation}
          <a class="nav-link" href="#kontakt" data-scroll-to-contact>Kontakt</a>
        </nav>
        <button class="site-nav-backdrop" type="button" aria-label="Stäng meny"></button>
      </header>

      <main class="main-content">
        ${renderPage(route, content)}
      </main>

      <footer class="site-footer">
        <div class="footer-grid">
          <section class="footer-column" aria-label="Kontakt" id="kontakt">
            <p class="eyebrow">Kontakt</p>
            ${content.footer.email ? `<a class="footer-contact" href="${escapeHtml(toMailto(content.footer.email))}">${escapeHtml(content.footer.email)}</a>` : ""}
            <div class="footer-social">
              ${content.footer.instagramUrl ? `<a class="footer-link" href="${escapeHtml(content.footer.instagramUrl)}" target="_blank" rel="noreferrer">Instagram</a>` : ""}
              ${content.footer.linkedinUrl ? `<a class="footer-link" href="${escapeHtml(content.footer.linkedinUrl)}" target="_blank" rel="noreferrer">LinkedIn</a>` : ""}
            </div>
          </section>
        </div>
      </footer>
    </div>
  `;

  enableMobileNav();
  enablePriceListShowMore();
  enableRestaurantShowMore();
  enableSingleOpenProducerAccordion();
  enableContactAnchorScroll();
}

function enableMobileNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
  const nav = document.querySelector<HTMLElement>("#primary-nav");
  const header = document.querySelector<HTMLElement>(".site-header");
  const backdrop =
    document.querySelector<HTMLButtonElement>(".site-nav-backdrop");

  if (!toggle || !nav || !header || !backdrop) {
    return;
  }

  const setOpen = (isOpen: boolean) => {
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Stäng meny" : "Öppna meny");
    header.classList.toggle("site-header--menu-open", isOpen);
    nav.classList.toggle("site-nav--open", isOpen);
    backdrop.classList.toggle("site-nav-backdrop--open", isOpen);
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest(".nav-link")) {
      setOpen(false);
    }
  });
  backdrop.addEventListener("click", () => setOpen(false));

  if (mobileNavKeydownHandler) {
    window.removeEventListener("keydown", mobileNavKeydownHandler);
  }
  mobileNavKeydownHandler = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  };
  window.addEventListener("keydown", mobileNavKeydownHandler);
}

function enablePriceListShowMore(): void {
  document
    .querySelectorAll<HTMLButtonElement>("[data-show-more-prices]")
    .forEach((button) => {
      const container = button.closest<HTMLElement>("[data-price-list]");
      if (!container) {
        return;
      }

      const desktopRows = Array.from(
        container.querySelectorAll<HTMLTableRowElement>(
          ".price-table tbody tr",
        ),
      );
      const mobileRows = Array.from(
        container.querySelectorAll<HTMLLIElement>(".price-item"),
      );
      const rowCount = Math.max(desktopRows.length, mobileRows.length);
      const step = Number(container.dataset.step ?? "5");
      let visibleCount = Number(container.dataset.visibleCount ?? "5");

      const applyState = () => {
        desktopRows.forEach((row, index) => {
          row.hidden = index >= visibleCount;
        });
        mobileRows.forEach((row, index) => {
          row.hidden = index >= visibleCount;
        });
        const isComplete = visibleCount >= rowCount;
        button.hidden = isComplete;
        button.disabled = isComplete;
        if (!isComplete) {
          button.textContent = "Visa fler";
        }
        container.classList.toggle("price-list-wrap--has-fade", !isComplete);
      };

      applyState();
      button.addEventListener("click", () => {
        visibleCount = Math.min(visibleCount + step, rowCount);
        applyState();
      });
    });
}

function lockForUnderage(): void {
  window.sessionStorage.setItem(AGE_VERIFIED_SESSION_KEY, "no");
  document.body.innerHTML = `
    <main class="age-denied">
      <div>
        <p class="eyebrow">Ålderskontroll</p>
        <h1>Du behöver vara över 20 år för att besöka sidan.</h1>
        <p>Kontakta oss gärna om du har frågor.</p>
      </div>
    </main>
  `;
}

function showAgeGate(content?: SiteContent): boolean {
  if (document.querySelector(".age-gate")) {
    return true;
  }

  if (window.sessionStorage.getItem(AGE_VERIFIED_SESSION_KEY) === "yes") {
    return false;
  }

  const gate = document.createElement("div");
  gate.className = "age-gate";
  gate.innerHTML = `
    <div class="age-gate__dialog" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <h2 id="age-gate-title">Är du över 20 år?</h2>
      <p class="age-gate__text">Denna hemsida riktar sig till dig som fyllt 20 år. Genom att fortsätta bekräftar du att du uppfyller detta krav.</p>
      <div class="age-gate__actions">
        <button type="button" data-age="yes" class="primary-button">Ja, jag är över 20</button>
        <button type="button" data-age="no" class="secondary-button">Nej</button>
      </div>
    </div>
  `;

  gate.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const choice = target.getAttribute("data-age");

    if (choice === "yes") {
      window.sessionStorage.setItem(AGE_VERIFIED_SESSION_KEY, "yes");
      gate.remove();
      if (content) {
        scheduleNewsletterPopup(content);
      }
      return;
    }

    if (choice === "no") {
      lockForUnderage();
    }
  });

  document.body.append(gate);
  return true;
}

function enableRestaurantShowMore(): void {
  const button = document.querySelector<HTMLButtonElement>(
    "[data-show-more-restaurants]",
  );
  const list = document.querySelector<HTMLUListElement>(".restaurant-list");

  if (!button || !list) {
    return;
  }

  const step = Number(button.dataset.step ?? "10");
  const items = Array.from(
    list.querySelectorAll<HTMLLIElement>(".restaurant-list__item"),
  );
  let visibleCount = Number(list.dataset.visibleCount ?? "10");

  const applyState = () => {
    const isComplete = visibleCount >= items.length;
    items.forEach((item, index) => {
      item.hidden = index >= visibleCount;
    });

    button.hidden = isComplete;
    button.disabled = isComplete;
  };

  applyState();

  button.addEventListener("click", () => {
    visibleCount = Math.min(visibleCount + step, items.length);
    applyState();
  });
}

function isInternalNavigableLink(anchor: HTMLAnchorElement): boolean {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
    return false;
  }

  return anchor.origin === window.location.origin;
}

function enableInternalLinkNavigation(onNavigate: () => void): void {
  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor || !isInternalNavigableLink(anchor)) {
      return;
    }

    event.preventDefault();
    const destination = anchor.pathname + anchor.search;
    if (destination !== window.location.pathname + window.location.search) {
      window.history.pushState({}, "", destination);
    }
    onNavigate();
  });

  window.addEventListener("popstate", onNavigate);
}

function animateProducerAccordion(
  accordion: HTMLDetailsElement,
  shouldOpen: boolean,
): void {
  if (accordion.dataset.animating === "true") {
    return;
  }

  const startHeight = accordion.offsetHeight;
  let endHeight = startHeight;

  if (shouldOpen) {
    accordion.open = true;
    endHeight = accordion.offsetHeight;
  } else {
    accordion.open = false;
    endHeight = accordion.offsetHeight;
    accordion.open = true;
  }

  if (Math.abs(endHeight - startHeight) < 1) {
    accordion.open = shouldOpen;
    return;
  }

  accordion.dataset.animating = "true";
  accordion.style.overflow = "hidden";
  accordion.style.height = `${startHeight}px`;
  accordion.getBoundingClientRect();
  accordion.style.transition = "height 260ms cubic-bezier(0.22, 1, 0.36, 1)";
  accordion.style.height = `${endHeight}px`;

  const onEnd = (event: TransitionEvent) => {
    if (event.propertyName !== "height") {
      return;
    }

    accordion.style.removeProperty("height");
    accordion.style.removeProperty("overflow");
    accordion.style.removeProperty("transition");
    accordion.open = shouldOpen;
    accordion.dataset.animating = "false";
    accordion.removeEventListener("transitionend", onEnd);
  };

  accordion.addEventListener("transitionend", onEnd);
}

function enableSingleOpenProducerAccordion(): void {
  const accordions = document.querySelectorAll<HTMLDetailsElement>(
    ".producer-sections--accordion .producer-accordion",
  );
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  accordions.forEach((accordion) => {
    const summary = accordion.querySelector("summary");
    if (!summary) {
      return;
    }

    summary.addEventListener("click", (event) => {
      event.preventDefault();

      if (accordion.dataset.animating === "true") {
        return;
      }

      const shouldOpen = !accordion.open;

      if (shouldOpen) {
        accordions.forEach((otherAccordion) => {
          if (otherAccordion === accordion || !otherAccordion.open) {
            return;
          }

          if (reduceMotion) {
            otherAccordion.open = false;
            return;
          }

          animateProducerAccordion(otherAccordion, false);
        });
      }

      if (reduceMotion) {
        accordion.open = shouldOpen;
      } else {
        animateProducerAccordion(accordion, shouldOpen);
      }
    });
  });

  // Ensure no more than one accordion starts open at the same time.
  let foundOpen = false;
  accordions.forEach((accordion) => {
    if (!accordion.open) {
      return;
    }

    if (!foundOpen) {
      foundOpen = true;
      return;
    }

    accordion.open = false;
  });
}

function enableContactAnchorScroll(): void {
  const target = document.querySelector<HTMLElement>("#kontakt");
  if (!target) {
    return;
  }

  const links = document.querySelectorAll<HTMLAnchorElement>(
    "[data-scroll-to-contact]",
  );

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

async function init(): Promise<void> {
  appRoot.innerHTML = '<p class="loading">Laddar innehåll...</p>';

  const content = await loadSiteContent();
  renderApp(content);
  const ageGateActive = showAgeGate(content);
  if (!ageGateActive) {
    scheduleNewsletterPopup(content);
  }

  enableInternalLinkNavigation(() => {
    renderApp(content);
    const ageGateActiveOnNavigate = showAgeGate(content);
    if (!ageGateActiveOnNavigate) {
      scheduleNewsletterPopup(content);
    }
  });
}

void init();
