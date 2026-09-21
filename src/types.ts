export type PageId =
  | "hem"
  | "om-oss"
  | "vinproducenter"
  | "restauranger"
  | "privatkund";

export interface Producer {
  slug: string;
  name: string;
  origin?: string;
  heroImageUrl?: string;
  imageCaption?: string;
  additionalImages?: Array<{
    url?: string;
    caption?: string;
  }>;
  intro: string;
  vineyard: string;
  cellar: string;
  wines: string;
}

export interface Restaurant {
  name: string;
  city?: string;
  description: string;
}

export interface PriceRow {
  producer: string;
  region?: string;
  wine: string;
  vintage?: string;
  bottle: string;
  price: string;
  notes?: string;
}

export interface SiteContent {
  siteName: string;
  tagline: string;
  heroText: string;
  restaurantsIntro?: string;
  footer: {
    email: string;
    instagramUrl: string;
    linkedinUrl: string;
  };
  about: {
    title: string;
    body: string;
    imageUrl?: string;
  };
  producers: Producer[];
  restaurants: {
    priceIntro: string;
    intro: string;
    partnersTitle: string;
    partners: Restaurant[];
    priceListTitle: string;
    priceList: PriceRow[];
  };
  privateCustomers: {
    intro: string;
    orderSteps: string[];
    priceListTitle: string;
    priceList: PriceRow[];
  };
  newsletter: {
    title: string;
    text: string;
    ctaLabel: string;
    embedUrl?: string;
  };
}
