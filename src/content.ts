import type { SiteContent } from "./types";

const sanityProjectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const sanityDataset = import.meta.env.VITE_SANITY_DATASET;
const sanityApiVersion =
  import.meta.env.VITE_SANITY_API_VERSION ?? "2026-09-01";
const CONTENT_CACHE_TTL_MS = 2 * 60 * 1000;
const CONTENT_CACHE_KEY = `vinberget-content-cache:${sanityProjectId ?? "none"}:${sanityDataset ?? "none"}`;

type SiteSettingsQuery = Partial<SiteContent> & {
  restaurantsIntro?: string;
  restaurantsPriceIntro?: string;
};

const fallbackContent: SiteContent = {
  siteName: "Vinberget Vinhandel",
  tagline: "",
  heroText: "",
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
  producers?: SiteContent["producers"];
  restaurants?: SiteContent["restaurants"]["partners"];
  restaurantPrices?: SiteContent["restaurants"]["priceList"];
  privatePrices?: SiteContent["privateCustomers"]["priceList"];
  privateInfo?: Partial<SiteContent["privateCustomers"]>;
};

const contentBundleQuery = encodeURIComponent(`{
  "site": *[_type == "siteSettings"][0]{
    siteName,
    tagline,
    heroText,
    restaurantsPriceIntro,
    restaurantsIntro,
    "footer": {
      "email": coalesce(footerEmail, ""),
      "instagramUrl": coalesce(footerInstagramUrl, ""),
      "linkedinUrl": coalesce(footerLinkedinUrl, "")
    },
    "about": {
      "title": coalesce(aboutTitle, "Om oss"),
      "body": coalesce(aboutBody, ""),
      "imageUrl": aboutImage.asset->url
    },
    "newsletter": {
      "title": coalesce(newsletterTitle, "Nyhetsbrev"),
      "text": coalesce(newsletterText, ""),
      "ctaLabel": coalesce(newsletterCtaLabel, "Anmäl dig till nyhetsbrev"),
      "embedUrl": newsletterEmbedUrl
    }
  },
  "producers": *[_type == "producer"]|order(name asc){
    "slug": slug.current,
    name,
    origin,
    "heroImageUrl": heroImage.asset->url,
    imageCaption,
    "additionalImages": additionalImages[]{
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
    region,
    wine,
    vintage,
    bottle,
    price,
    notes
  },
  "privatePrices": *[_type == "privatePrice"]|order(producer asc, wine asc){
    producer,
    region,
    wine,
    vintage,
    bottle,
    price,
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
      producers: producers.length > 0 ? producers : [],
      restaurants: {
        ...fallbackContent.restaurants,
        priceIntro: site.restaurantsPriceIntro ?? "",
        intro: site.restaurantsIntro ?? "",
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
