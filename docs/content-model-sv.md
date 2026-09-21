# Innehallsmodell for Vinberget

Detta dokument matchar implementationen i frontend och ar underlag for Sanity-schema.

## Dokumenttyper

1. siteSettings
- siteName (string)
- tagline (string)
- heroText (text)
- restaurantsIntro (text)
- aboutTitle (string)
- aboutBody (text)
- aboutImage (image)
- newsletterTitle (string)
- newsletterText (text)
- newsletterCtaLabel (string)
- newsletterEmbedUrl (url, Mailchimp-formulärets action-URL)

2. producer
- name (string)
- slug (slug, unik)
- heroImage (image)
- intro (text)
- vineyard (text)
- cellar (text)
- wines (text)

3. restaurant
- name (string)
- city (string)
- description (text)

4. restaurantPrice
- producer (string)
- region (string)
- wine (string)
- vintage (string)
- bottle (string)
- price (string)
- notes (string)

5. privatePage
- intro (text)
- orderSteps (array av string)
- priceListTitle (string)

6. privatePrice
- producer (string)
- region (string)
- wine (string)
- vintage (string)
- bottle (string)
- price (string)
- notes (string)

## Frontend-rutter

- /#/hem
- /#/om-oss
- /#/vinproducenter
- /#/vinproducenter/:slug
- /#/restauranger
- /#/privatkund

## Krav som redan ar implementerade

- 20+ modal med Ja/Nej och lokal lagring av val.
- Accordion-sektioner pa producentsidor (SEO-vanlig HTML med details/summary).
- Prislistor utan sok/filter men med tydlig tabellstruktur.
- Fallback-data visas automatiskt om Sanity-variabler saknas.
