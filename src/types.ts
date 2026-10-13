import type { SanityImageObject } from "@sanity/image-url";
import type { PortableTextBlock } from "@portabletext/types";

export type PageId =
  | "hem"
  | "om-oss"
  | "vinproducenter"
  | "restauranger"
  | "restaurangkund"
  | "privatkund";

export interface Producer {
  slug: string;
  name: string;
  origin?: string;
  overviewImage?: SanityImageObject;
  overviewImageUrl?: string;
  heroImage?: SanityImageObject;
  heroImageUrl?: string;
  imageCaption?: string;
  additionalImages?: Array<{
    image?: SanityImageObject;
    url?: string;
    caption?: string;
  }>;
  intro: string;
  vineyard: string;
  cellar: string;
  wines: string;
  winesFormatted?: PortableTextBlock[];
}

export interface Restaurant {
  name: string;
  city?: string;
  description: string;
}

export interface PriceRow {
  producer: string;
  wine: string;
  vintage?: string;
  wineColor?: "Mousserande" | "Vitt" | "Rosé" | "Rött";
  bottle?: string | null;
  price?: string;
  isSoldOut?: boolean;
  isAllocated?: boolean;
  notes?: string;
}

export type PriceSortOrder = "price" | "alphabetical";

export interface SiteContent {
  siteName: string;
  tagline: string;
  heroText: string;
  homeImageUrl?: string;
  producersTitle: string;
  producersIntro?: string;
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
  priceSortOrder: PriceSortOrder;
  restaurants: {
    pageTitle: string;
    contactPrompt: string;
    contactLinkLabel: string;
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
