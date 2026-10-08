import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageObject } from "@sanity/image-url";
import type { SiteContent } from "./types";

const sanityProjectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const sanityDataset = import.meta.env.VITE_SANITY_DATASET;
const sanityApiVersion =
  import.meta.env.VITE_SANITY_API_VERSION ?? "2026-09-01";
const CONTENT_CACHE_TTL_MS = 2 * 60 * 1000;
const CONTENT_CACHE_KEY = `vinberget-content-cache:${sanityProjectId ?? "none"}:${sanityDataset ?? "none"}:hotspot-v1`;
const imageUrlBuilder =
  sanityProjectId && sanityDataset
    ? createImageUrlBuilder({
        projectId: sanityProjectId,
        dataset: sanityDataset,
      })
    : null;

export function getSanityImageUrl(
  image: SanityImageObject | undefined,
  width: number,
  height: number,
): string | undefined {
  if (!image?.asset || !imageUrlBuilder) {
    return undefined;
  }

  return imageUrlBuilder
    .image(image)
    .width(width)
    .height(height)
    .auto("format")
    .url();
}

type SiteSettingsQuery = Partial<SiteContent> & {
  producersIntro?: string;
  restaurantsIntro?: string;
  restaurantsPriceIntro?: string;
};

const fallbackContent: SiteContent = {
  siteName: "Vinberget Vinhandel",
  tagline: "",
  heroText: "",
  homeImageUrl: "",
  producersTitle: "Vinproducenter",
  producersIntro: "",
  footer: {
    email: "",
    instagramUrl: "",
    linkedinUrl: "",
  },
  about: {
    title: "Om oss",
    body: "",
  },
  restaurantsIntro: "",
  producers: [],
  restaurants: {
    pageTitle: "För restaurangkunder",
    contactPrompt: "För beställning av viner,",
    contactLinkLabel: "kontakta oss",
    priceIntro: "",
    intro: "",
    partnersTitle: "Våra restaurangkunder",
    partners: [],
    priceListTitle: "Prislista restaurang",
    priceList: [],
  },
  privateCustomers: {
    intro: "",
    orderSteps: [],
    priceListTitle: "Privatkund beställning",
    priceList: [],
  },
  newsletter: {
    title: "Nyhetsbrev",
    text: "",
    ctaLabel: "Anmäl dig till nyhetsbrev",
  },
};

type SanityContentBundle = {
  site?: SiteSettingsQuery;
  restaurantsPriceIntro?: string;
  restaurantsIntro?: string;
  restaurantPage?: Pick<
    SiteContent["restaurants"],
    "pageTitle" | "contactPrompt" | "contactLinkLabel"
  >;
  producerPage?: Pick<SiteContent, "producersTitle" | "producersIntro">;
  producers?: SiteContent["producers"];
  restaurants?: SiteContent["restaurants"]["partners"];
  restaurantPrices?: SiteContent["restaurants"]["priceList"];
  privatePrices?: SiteContent["privateCustomers"]["priceList"];
  privateInfo?: Partial<SiteContent["privateCustomers"]>;
};

const contentBundleQuery = encodeURIComponent(`{
  "site": {
    "siteName": coalesce(*[_type == "homePage"][0].siteName, *[_type == "siteSettings"][0].siteName),
    "tagline": coalesce(*[_type == "homePage"][0].tagline, *[_type == "siteSettings"][0].tagline),
    "heroText": coalesce(*[_type == "homePage"][0].heroText, *[_type == "siteSettings"][0].heroText),
    "homeImageUrl": coalesce(*[_type == "homePage"][0].homeImage.asset->url, *[_type == "siteSettings"][0].homeImage.asset->url),
    "footer": {
      "email": coalesce(*[_type == "contactPage"][0].email, *[_type == "siteSettings"][0].footerEmail, ""),
      "instagramUrl": coalesce(*[_type == "contactPage"][0].instagramUrl, *[_type == "siteSettings"][0].footerInstagramUrl, ""),
      "linkedinUrl": coalesce(*[_type == "contactPage"][0].linkedinUrl, *[_type == "siteSettings"][0].footerLinkedinUrl, "")
    },
    "about": {
      "title": coalesce(*[_type == "aboutPage"][0].title, *[_type == "siteSettings"][0].aboutTitle, "Om oss"),
      "body": coalesce(*[_type == "aboutPage"][0].body, *[_type == "siteSettings"][0].aboutBody, ""),
      "imageUrl": coalesce(*[_type == "aboutPage"][0].image.asset->url, *[_type == "siteSettings"][0].aboutImage.asset->url)
    },
    "newsletter": {
      "title": coalesce(*[_type == "contactPage"][0].newsletterTitle, *[_type == "siteSettings"][0].newsletterTitle, "Nyhetsbrev"),
      "text": coalesce(*[_type == "contactPage"][0].newsletterText, *[_type == "siteSettings"][0].newsletterText, ""),
      "ctaLabel": coalesce(*[_type == "contactPage"][0].newsletterCtaLabel, *[_type == "siteSettings"][0].newsletterCtaLabel, "Anmäl dig till nyhetsbrev"),
      "embedUrl": coalesce(*[_type == "contactPage"][0].newsletterEmbedUrl, *[_type == "siteSettings"][0].newsletterEmbedUrl)
    }
  },
  "restaurantPage": {
    "pageTitle": coalesce(*[_type == "restaurantPage"][0].pageTitle, "För restaurangkunder"),
    "contactPrompt": coalesce(*[_type == "restaurantPage"][0].contactPrompt, "För beställning av viner,"),
    "contactLinkLabel": coalesce(*[_type == "restaurantPage"][0].contactLinkLabel, "kontakta oss")
  },
  "producerPage": {
    "producersTitle": coalesce(*[_type == "producerPage"][0].pageTitle, "Vinproducenter"),
    "producersIntro": coalesce(*[_type == "producerPage"][0].intro, *[_type == "siteSettings"][0].producersIntro, "Välj en producent för att läsa mer om vingård, källare och viner.")
  },
  "restaurantsPriceIntro": coalesce(*[_type == "restaurantPage"][0].priceIntro, *[_type == "siteSettings"][0].restaurantsPriceIntro),
  "restaurantsIntro": coalesce(*[_type == "restaurantPage"][0].intro, *[_type == "siteSettings"][0].restaurantsIntro),
  "producers": *[_type == "producer"]|order(name asc){
    "slug": slug.current,
    name,
    origin,
    "overviewImageUrl": overviewImage.asset->url,
    "overviewImage": overviewImage{asset, crop, hotspot},
    "heroImageUrl": heroImage.asset->url,
    "heroImage": heroImage{asset, crop, hotspot},
    imageCaption,
    "additionalImages": additionalImages[]{
      "image": image{asset, crop, hotspot},
      "url": image.asset->url,
      caption
    },
    intro,
    vineyard,
    cellar,
    wines
  },
  "restaurants": *[_type == "restaurant"]|order(name asc){
    name,
    city,
    description
  },
  "restaurantPrices": *[_type == "restaurantPrice"]|order(producer asc, wine asc){
    producer,
    wine,
    vintage,
    wineColor,
    bottle,
    price,
    isSoldOut,
    isAllocated,
    notes
  },
  "privatePrices": *[_type == "privatePrice"]|order(producer asc, wine asc){
    producer,
    wine,
    vintage,
    wineColor,
    bottle,
    price,
    isSoldOut,
    isAllocated,
    notes
  },
  "privateInfo": *[_type == "privatePage"][0]{
    intro,
    orderSteps,
    priceListTitle
  }
}`);

async function sanityFetch<T>(query: string): Promise<T> {
  const endpoint = `https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/data/query/${sanityDataset}?query=${query}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Sanity request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { result: T };
  return payload.result;
}

function hasSanityConfig(): boolean {
  return Boolean(sanityProjectId && sanityDataset);
}

function readCachedContent(): SiteContent | null {
  try {
    const raw = window.localStorage.getItem(CONTENT_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      expiresAt?: number;
      content?: SiteContent;
    };

    if (!parsed.expiresAt || !parsed.content) {
      return null;
    }

    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(CONTENT_CACHE_KEY);
      return null;
    }

    return parsed.content;
  } catch {
    return null;
  }
}

function writeCachedContent(content: SiteContent): void {
  try {
    const payload = {
      expiresAt: Date.now() + CONTENT_CACHE_TTL_MS,
      content,
    };

    window.localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore cache write errors (private mode/storage limits).
  }
}

export async function loadSiteContent(): Promise<SiteContent> {
  if (!hasSanityConfig()) {
    return fallbackContent;
  }

  const cachedContent = readCachedContent();
  if (cachedContent) {
    return cachedContent;
  }

  try {
    const bundle = await sanityFetch<SanityContentBundle>(contentBundleQuery);
    const site = bundle.site ?? {};
    const producers = bundle.producers ?? [];
    const restaurants = bundle.restaurants ?? [];
    const restaurantPrices = bundle.restaurantPrices ?? [];
    const privatePrices = bundle.privatePrices ?? [];
    const privateInfo = bundle.privateInfo ?? {};

    const mergedContent: SiteContent = {
      ...fallbackContent,
      ...site,
      footer: {
        ...fallbackContent.footer,
        ...(site as Partial<SiteContent>)?.footer,
      },
      producersTitle:
        bundle.producerPage?.producersTitle ?? fallbackContent.producersTitle,
      producersIntro:
        bundle.producerPage?.producersIntro ??
        site.producersIntro ??
        fallbackContent.producersIntro,
      producers: producers.length > 0 ? producers : [],
      restaurants: {
        ...fallbackContent.restaurants,
        ...bundle.restaurantPage,
        priceIntro:
          bundle.restaurantsPriceIntro ??
          site.restaurantsPriceIntro ??
          fallbackContent.restaurants.priceIntro,
        intro:
          bundle.restaurantsIntro ??
          site.restaurantsIntro ??
          fallbackContent.restaurants.intro,
        partners: restaurants.length > 0 ? restaurants : [],
        priceList: restaurantPrices.length > 0 ? restaurantPrices : [],
      },
      privateCustomers: {
        ...fallbackContent.privateCustomers,
        ...privateInfo,
        priceList: privatePrices.length > 0 ? privatePrices : [],
      },
    };

    writeCachedContent(mergedContent);
    return mergedContent;
  } catch (error) {
    console.warn(
      "Using fallback content because Sanity could not be loaded.",
      error,
    );

    const staleCache = readCachedContent();
    if (staleCache) {
      return staleCache;
    }

    return fallbackContent;
  }
}
