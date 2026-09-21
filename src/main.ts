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
  { id: "hem", label: "Hem", path: "#/hem" },
  { id: "om-oss", label: "Om oss", path: "#/om-oss" },
  { id: "vinproducenter", label: "Vinproducenter", path: "#/vinproducenter" },
  { id: "restauranger", label: "Restauranger", path: "#/restauranger" },
  { id: "privatkund", label: "Privatkund", path: "#/privatkund" },
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

function decodeHashPart(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function routeFromHash(hash: string): Route {
  const normalized = hash.replace(/^#/, "") || "/hem";
  const [pathPart, queryString = ""] = normalized.split("?");
  const parts = pathPart.split("/").filter(Boolean);
  const query = new URLSearchParams(queryString);
  const producerSort = query.get("sort") === "origin" ? "origin" : "name";

  if (parts[0] === "vinproducenter" && parts[1]) {
    return { page: "vinproducenter", producerSlug: decodeHashPart(parts[1]) };
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
}

function renderPriceTable(rows: PriceRow[]): string {
  if (rows.length === 0) {
    return '<p class="empty-state">Prislista publiceras inom kort.</p>';
  }

  const initialVisible = 10;
  const step = 10;
  const hasShowMore = rows.length > initialVisible;

  const tableRows = rows
    .map((row, index) => {
      const wineTitle = `${row.wine}${row.vintage ? ` ${row.vintage}` : ""}`;
      const isHidden = hasShowMore && index >= initialVisible;
      const hiddenAttribute = isHidden ? " hidden" : "";

      return `
      <tr${hiddenAttribute}>
        <th scope="row" class="price-table__wine"><span class="price-cell-text">${escapeHtml(wineTitle)}</span></th>
        <td class="price-table__producer"><span class="price-cell-text">${escapeHtml(row.producer)}</span></td>
        <td class="price-table__region"><span class="price-cell-text">${row.region ? escapeHtml(row.region) : ""}</span></td>
        <td class="price-table__bottle"><span class="price-cell-text">${escapeHtml(row.bottle.toUpperCase())}</span></td>
        <td class="price-table__price"><span class="price-cell-text">${escapeHtml(row.price)}</span></td>
        <td class="price-table__notes"><span class="price-cell-text">${row.notes ? escapeHtml(row.notes) : ""}</span></td>
      </tr>
    `;
    })
    .join("");

  const mobileItems = rows
    .map((row, index) => {
      const wineTitle = `${row.wine}${row.vintage ? ` ${row.vintage}` : ""}`;
      const metaParts = [row.producer];
      const isHidden = hasShowMore && index >= initialVisible;
      const hiddenAttribute = isHidden ? " hidden" : "";

      if (row.region) {
        metaParts.push(row.region);
      }

      if (row.bottle) {
        metaParts.push(row.bottle.toUpperCase());
      }

      return `
      <li class="price-item"${hiddenAttribute}>
        <div class="price-item__top">
          <h3 class="price-item__wine">${escapeHtml(wineTitle)}</h3>
          <p class="price-item__price">${escapeHtml(row.price)}</p>
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
          <thead>
            <tr>
              <th scope="col">Vin</th>
              <th scope="col">Producent</th>
              <th scope="col">Region</th>
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
          ? '<button type="button" class="secondary-button price-list__more" data-show-more-prices>Visa mer</button>'
          : ""
      }
    </div>
  `;
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
        <a class="home-featured-card__link" href="#/vinproducenter/${encodeURIComponent(producer.slug)}">
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
            <a class="text-link" href="#/vinproducenter">Se alla producenter</a>
        </div>
        <ul class="home-featured__grid">${featuredProducers}</ul>
      </section>
    `
    : "";

  const partnerNames = shuffleCopy(content.restaurants.partners)
    .slice(0, 4)
    .map((partner) => {
      const location = partner.city ? `, ${escapeHtml(partner.city)}` : "";
      return `<li>${escapeHtml(partner.name)}${location}</li>`;
    })
    .join("");

  const socialProofMarkup = partnerNames
    ? `
      <section class="home-proof reveal" aria-label="Utvalda restaurangkunder">
        <p class="eyebrow">I urval hos</p>
        <ul class="home-proof__list">${partnerNames}</ul>
      </section>
    `
    : "";

  return `
    <section class="hero-panel hero-panel--home reveal">
      <div class="home-hero-main">
        <p class="eyebrow">VINBERGET VINHANDEL</p>
        <h1>${escapeHtml(content.tagline)}</h1>
        <p class="lead">${escapeHtml(content.heroText)}</p>
        <div class="home-actions">
          <a class="primary-button" href="#/vinproducenter">Se producenter</a>
          <a class="secondary-button" href="#/om-oss">Om oss</a>
        </div>
        <nav class="home-quick-nav" aria-label="Snabbval">
          <a class="home-quick-nav__link" href="#/restauranger">För restauranger</a>
          <a class="home-quick-nav__link" href="#/privatkund">För privatkund</a>
        </nav>
      </div>
    </section>
    ${socialProofMarkup}
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

  const route = routeFromHash(window.location.hash);
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
    if (routeFromHash(window.location.hash).page === "hem") {
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
        <h1>Vinproducenter</h1>
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
    .map(
      (producer) => `
      <li class="producer-card">
        <a class="producer-card__link" href="#/vinproducenter/${encodeURIComponent(producer.slug)}">
          <h3>${escapeHtml(producer.name)}</h3>
          ${
            producer.origin
              ? `<p class="producer-card__origin">${escapeHtml(producer.origin)}</p>`
              : ""
          }
          <p>${escapeHtml(truncateText(producer.intro, 190))}</p>
          <span class="producer-card__cta">Läs producentprofil</span>
        </a>
      </li>
    `,
    )
    .join("");

  return `
    <section class="content-card reveal producer-overview">
      <h1>Vinproducenter</h1>
      <p class="lead-small">Välj en producent för att läsa mer om vingård, källare och viner.</p>
      <div class="producer-toolbar" aria-label="Sortering">
        ${
          producerSort === "origin"
            ? `
              <p class="producer-toolbar__status">Sorterar efter <span>Land/Region</span></p>
              <a class="sort-clear-link" href="#/vinproducenter" aria-label="Återgå till standardsortering">× Återgå</a>
            `
            : `
              <p class="producer-toolbar__status">
                Sortera efter
                <a class="sort-link sort-link--inline" href="#/vinproducenter?sort=origin">Land/Region</a>
              </p>
            `
        }
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
          <a class="text-link" href="#/vinproducenter">Tillbaka till översikten</a>
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
      <h1>Restauranger</h1>
      <p>${escapeHtml(content.restaurants.priceIntro)}</p>
      <p class="restaurant-price-contact">För beställning av viner, <a href="#kontakt" class="inline-anchor" data-scroll-to-contact>kontakta oss</a>.</p>
      <h2 id="restaurang-prislista">${escapeHtml(content.restaurants.priceListTitle)}</h2>
      ${renderPriceTable(content.restaurants.priceList)}
      <h2 id="restaurang-kunder">${escapeHtml(content.restaurants.partnersTitle)}</h2>
      <p class="restaurant-customers-intro">${escapeHtml(content.restaurants.intro)}</p>
      ${partnerContent}
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
      <h1>Privatkund</h1>
      <p>${linkifySystembolagetText(content.privateCustomers.intro)}</p>
      <h2>Beställning via Systembolaget</h2>
      ${stepContent}
      <h2>${escapeHtml(content.privateCustomers.priceListTitle)}</h2>
      ${renderPriceTable(content.privateCustomers.priceList)}
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
          <a class="text-link" href="#/vinproducenter">Till producentlistan</a>
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
  const route = routeFromHash(window.location.hash);
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
        <a class="brand" href="#/hem" aria-label="Vinberget Vinhandel">
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
    const isOpen = toggle.getAttribute("aria-expanded") !== "true";
    setOpen(isOpen);
  });

  nav.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest(".nav-link")) {
      setOpen(false);
    }
  });

  backdrop.addEventListener("click", () => {
    setOpen(false);
  });

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
  const button = document.querySelector<HTMLButtonElement>(
    "[data-show-more-prices]",
  );
  const list = document.querySelector<HTMLUListElement>(".price-list");

  if (!button || !list) {
    return;
  }

  const step = Number(button.dataset.step ?? "10");
  const items = Array.from(
    list.querySelectorAll<HTMLLIElement>(".price-list__item"),
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

function ensureDefaultRoute(): void {
  if (!window.location.hash) {
    window.location.replace("#/hem");
  }
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
  ensureDefaultRoute();

  const content = await loadSiteContent();
  renderApp(content);
  const ageGateActive = showAgeGate(content);
  if (!ageGateActive) {
    scheduleNewsletterPopup(content);
  }

  window.addEventListener("hashchange", () => {
    renderApp(content);
    const ageGateActiveOnHashChange = showAgeGate(content);
    if (!ageGateActiveOnHashChange) {
      scheduleNewsletterPopup(content);
    }
  });
}

void init();
