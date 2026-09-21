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
  tagline: "Kuraterad vinimport med fingertoppskänsla",
  heroText:
    "Vi representerar personliga producenter med tydligt ursprung och bygger långsiktiga relationer mellan vingård, restaurang och glas.",
  footer: {
    email: "kontakt@vinberget.se",
    instagramUrl: "https://www.instagram.com/",
    linkedinUrl: "https://www.linkedin.com/",
  },
  about: {
    title: "Om oss",
    body: "Vinberget Vinhandel arbetar med utvalda producenter och ett sortiment där ursprung, precision och hantverk står i centrum. Vi fokuserar på långsiktiga samarbeten med restauranger och erbjuder även privatkunder tillgång till noga utvalda viner via beställningssortimentet.",
  },
  restaurantsIntro:
    "Vi samarbetar med restauranger som söker tydliga uttryck, gastronomisk precision och personlighet i glaset.",
  producers: [
    {
      slug: "cantina-san-lorenzo",
      name: "Cantina San Lorenzo",
      origin: "Italien, Valpolicella",
      intro:
        "Familjeegendom i Valpolicella med fokus på fräschör, elegans och låg intervention.",
      vineyard:
        "Ekologisk odling på kalkrik jord med stor andel äldre stockar. Skördeuttag hålls lågt för koncentration och balans.",
      cellar:
        "Spontanjäsning i cement och äldre botti. Måttlig extraktion och varsam svavelhantering bevarar druvaromatik och textur.",
      wines:
        "Klassiska druvor med modern precision: körsbärsdriven frukt, markerad syra och silkeslena tanniner.",
    },
    {
      slug: "domaine-du-cap",
      name: "Domaine du Cap",
      origin: "Frankrike, Rhone",
      intro:
        "Liten producent i södra Rhone som arbetar biodynamiskt med gamla stockar av grenache och mourvedre.",
      vineyard:
        "Mosaik av rullsten och lera med manuellt arbete i varje rad. Fokus på jordhälsa och naturlig biodiversitet.",
      cellar:
        "Jäsning i öppna kar med delvis hela klasar. Lång lagring i neutrala fat för struktur utan tydlig ekprägel.",
      wines:
        "Mörk frukt, örter och mineralitet. Viner med djup, men alltid med sval balans.",
    },
    {
      slug: "weingut-falkenstein",
      name: "Weingut Falkenstein",
      origin: "Tyskland, Mosel",
      intro:
        "Moselproducent med rötter i branta skifferlägen och ett kompromisslöst arbete med riesling.",
      vineyard:
        "Handskörd i terrasserade vingårdar med blå och grå skiffer. Selektiv sortering i flera omgångar.",
      cellar:
        "Långsam, sval jäsning i stora gamla fuder. Restsötma används som verktyg för energi och lagringspotential.",
      wines:
        "Riesling med citrus, vit persika och stenig sälta. Hög syra och ren avslutning.",
    },
    {
      slug: "quinta-das-nuvens",
      name: "Quinta das Nuvens",
      origin: "Portugal, Douro",
      intro:
        "Douroprojekt med höghöjdslägen och fokus på transparenta fältblandningar.",
      vineyard:
        "Torra sluttningar på granit och skiffer där gamla blandade stockar ger naturligt låga skördeuttag.",
      cellar:
        "Mjuk extraktion i lagares följt av lagring i stora neutrala fat. Målet är energi framför kraft.",
      wines:
        "Mörka bär, grafit och florala inslag. Stram struktur med lång mineralisk avslutning.",
    },
  ],
  restaurants: {
    priceIntro:
      "Se våra priser för restauranger och hitta viner med tydligt ursprung, personlighet och precision för er vinlista.",
    intro:
      "Vi samarbetar med restauranger som söker tydliga uttryck, gastronomisk precision och personlighet i glaset.",
    partnersTitle: "Våra restaurangkunder",
    partners: [
      {
        name: "Exempelrestaurang A",
        city: "Stockholm",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
      {
        name: "Exempelrestaurang B",
        city: "Göteborg",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
      {
        name: "Exempelrestaurang C",
        city: "Uppsala",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
      {
        name: "Exempelrestaurang D",
        city: "Malmö",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
      {
        name: "Exempelrestaurang E",
        city: "Västerås",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
      {
        name: "Exempelrestaurang F",
        city: "Örebro",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
      {
        name: "Exempelrestaurang G",
        city: "Linköping",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
      {
        name: "Exempelrestaurang H",
        city: "Helsingborg",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
      {
        name: "Exempelrestaurang I",
        city: "Jönköping",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
      {
        name: "Exempelrestaurang J",
        city: "Norrköping",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
      {
        name: "Exempelrestaurang K",
        city: "Umeå",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
      {
        name: "Exempelrestaurang L",
        city: "Luleå",
        description: "Placeholdernamn för restauranglistans layouttest.",
      },
    ],
    priceListTitle: "Prislista restaurang",
    priceList: [
      {
        producer: "Cantina San Lorenzo",
        region: "Valpolicella",
        wine: "Valpolicella Classico Superiore",
        vintage: "2022",
        bottle: "750 ml",
        price: "198 kr",
        notes: "Körsbär, örter och mjuk struktur.",
      },
      {
        producer: "Cantina San Lorenzo",
        region: "Valpolicella",
        wine: "Ripasso della Casa",
        vintage: "2021",
        bottle: "750 ml",
        price: "239 kr",
        notes: "Djupare frukt med silkeslen tannin.",
      },
      {
        producer: "Domaine du Cap",
        region: "Södra Rhône",
        wine: "Cotes du Rhone Villages",
        vintage: "2021",
        bottle: "750 ml",
        price: "228 kr",
        notes: "Mörk frukt och örtig energi.",
      },
      {
        producer: "Domaine du Cap",
        region: "Södra Rhône",
        wine: "Les Roches Mourvedre",
        vintage: "2020",
        bottle: "750 ml",
        price: "299 kr",
        notes: "Mer koncentration, stenig längd.",
      },
      {
        producer: "Weingut Falkenstein",
        region: "Mosel",
        wine: "Riesling Kabinett Trocken",
        vintage: "2023",
        bottle: "750 ml",
        price: "215 kr",
        notes: "Skifferdriven citrus och precision.",
      },
      {
        producer: "Weingut Falkenstein",
        region: "Mosel",
        wine: "Riesling Alte Reben",
        vintage: "2022",
        bottle: "750 ml",
        price: "279 kr",
        notes: "Mogen frukt, sälta och lagringskänsla.",
      },
      {
        producer: "Quinta das Nuvens",
        region: "Douro",
        wine: "Douro Tinto Reserva",
        vintage: "2021",
        bottle: "750 ml",
        price: "259 kr",
        notes: "Grafit, mörka bär och stram kärna.",
      },
      {
        producer: "Quinta das Nuvens",
        region: "Douro",
        wine: "Field Blend Branco",
        vintage: "2023",
        bottle: "750 ml",
        price: "232 kr",
        notes: "Blommig, sval och mineralisk.",
      },
      {
        producer: "Exempelproducent A",
        region: "Loire",
        wine: "Placeholder Chenin Blanc",
        vintage: "2022",
        bottle: "750 ml",
        price: "245 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent B",
        region: "Bourgogne",
        wine: "Placeholder Pinot Noir",
        vintage: "2021",
        bottle: "750 ml",
        price: "289 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent C",
        region: "Priorat",
        wine: "Placeholder Garnacha",
        vintage: "2020",
        bottle: "750 ml",
        price: "309 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent D",
        region: "Mosel",
        wine: "Placeholder Riesling Trocken",
        vintage: "2023",
        bottle: "750 ml",
        price: "239 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent E",
        region: "Sicilien",
        wine: "Placeholder Etna Rosso",
        vintage: "2022",
        bottle: "750 ml",
        price: "279 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent F",
        region: "Rias Baixas",
        wine: "Placeholder Albarino",
        vintage: "2024",
        bottle: "750 ml",
        price: "229 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent G",
        region: "Mendoza",
        wine: "Placeholder Malbec Reserva",
        vintage: "2021",
        bottle: "750 ml",
        price: "259 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent H",
        region: "Pfalz",
        wine: "Placeholder Weissburgunder",
        vintage: "2023",
        bottle: "750 ml",
        price: "219 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent I",
        region: "Chianti Classico",
        wine: "Placeholder Sangiovese",
        vintage: "2020",
        bottle: "750 ml",
        price: "269 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent J",
        region: "Barossa Valley",
        wine: "Placeholder Shiraz",
        vintage: "2021",
        bottle: "750 ml",
        price: "299 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent K",
        region: "Jerez",
        wine: "Placeholder Fino En Rama",
        vintage: "NV",
        bottle: "750 ml",
        price: "199 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent L",
        region: "Languedoc",
        wine: "Placeholder Carignan",
        vintage: "2022",
        bottle: "750 ml",
        price: "209 kr",
        notes: "Placeholdervin för layouttest.",
      },
    ],
  },
  privateCustomers: {
    intro:
      "Alla viner i prislistan beställs via Systembolagets privatimport. Det är en funktion för viner som inte finns i någon av Systembolagets ordinarie sortiment och görs i några enkla steg på Systembolagets hemsida. Du fyller enkelt i namn på de viner du vill ha och att du vill beställa dem via oss. Vi skickar vinerna till butiken, och du hämtar ut dem.",
    orderSteps: [
      "En privatimport registrerar du genom att logga in på systembolaget.se och gå till sidan för privatimport.",
      "Välj den butik du vill hämta vinerna i.",
      "Ange Vinberget Vinhandel AB som svensk säljare.",
      "Ange namnet på det eller de viner du vill köpa från vår prislista. Du registrerar ett vin i taget och anger antal flaskor.",
      "På vår Instagram hittar du en film i highlights som visar hur du registrerar en privatimport.",
      "Hör gärna av dig till oss om du har frågor eller vill ha hjälp!",
    ],
    priceListTitle: "Privatkund beställning",
    priceList: [
      {
        producer: "Exempelproducent A",
        region: "Loire",
        wine: "Placeholder Chenin Blanc",
        vintage: "2022",
        bottle: "750 ml",
        price: "245 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent B",
        region: "Bourgogne",
        wine: "Placeholder Pinot Noir",
        vintage: "2021",
        bottle: "750 ml",
        price: "289 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent C",
        region: "Priorat",
        wine: "Placeholder Garnacha",
        vintage: "2020",
        bottle: "750 ml",
        price: "309 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent D",
        region: "Mosel",
        wine: "Placeholder Riesling Trocken",
        vintage: "2023",
        bottle: "750 ml",
        price: "229 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent E",
        region: "Sicilien",
        wine: "Placeholder Etna Rosso",
        vintage: "2022",
        bottle: "750 ml",
        price: "279 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent F",
        region: "Rias Baixas",
        wine: "Placeholder Albarino",
        vintage: "2024",
        bottle: "750 ml",
        price: "229 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent G",
        region: "Mendoza",
        wine: "Placeholder Malbec Reserva",
        vintage: "2021",
        bottle: "750 ml",
        price: "259 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent H",
        region: "Pfalz",
        wine: "Placeholder Weissburgunder",
        vintage: "2023",
        bottle: "750 ml",
        price: "219 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent I",
        region: "Chianti Classico",
        wine: "Placeholder Sangiovese",
        vintage: "2020",
        bottle: "750 ml",
        price: "269 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent J",
        region: "Barossa Valley",
        wine: "Placeholder Shiraz",
        vintage: "2021",
        bottle: "750 ml",
        price: "299 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent K",
        region: "Jerez",
        wine: "Placeholder Fino En Rama",
        vintage: "NV",
        bottle: "750 ml",
        price: "199 kr",
        notes: "Placeholdervin för layouttest.",
      },
      {
        producer: "Exempelproducent L",
        region: "Languedoc",
        wine: "Placeholder Carignan",
        vintage: "2022",
        bottle: "750 ml",
        price: "209 kr",
        notes: "Placeholdervin för layouttest.",
      },
    ],
  },
  newsletter: {
    title: "Nyhetsbrev",
    text: "Få nyheter om producenter, allokeringar och lanseringar.",
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
      producers: producers.length > 0 ? producers : fallbackContent.producers,
      restaurants: {
        ...fallbackContent.restaurants,
        priceIntro:
          site.restaurantsPriceIntro ?? fallbackContent.restaurants.priceIntro,
        intro: site.restaurantsIntro ?? fallbackContent.restaurants.intro,
        partners:
          restaurants.length > 0
            ? restaurants
            : fallbackContent.restaurants.partners,
        priceList:
          restaurantPrices.length > 0
            ? restaurantPrices
            : fallbackContent.restaurants.priceList,
      },
      privateCustomers: {
        ...fallbackContent.privateCustomers,
        ...privateInfo,
        priceList:
          privatePrices.length > 0
            ? privatePrices
            : fallbackContent.privateCustomers.priceList,
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
