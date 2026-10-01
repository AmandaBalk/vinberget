# Innehallsmodell for Vinberget

Detta dokument matchar implementationen i frontend och ar underlag for Sanity-schema.

## Dokumenttyper

1. homePage
- siteName (string)
- tagline (string)
- heroText (text)
- homeImage (image)

2. aboutPage
- title (string)
- body (text)
- image (image)

3. producerPage
- intro (text)

4. producer
- name (string)
- slug (slug, unik)
- origin (string)
- overviewImage (image, frivillig, visas på producentöversikten)
- heroImage (image, visas på den enskilda producentens sida)
- intro (text)
- vineyard (text)
- cellar (text)
- wines (text)

5. restaurantPage
- priceIntro (text)
- intro (text)

6. restaurant
- name (string)
- city (string)
- description (text)

7. restaurantPrice
- producer (string)
- wine (string)
- vintage (string)
- bottle (string)
- price (string)
- notes (string)

8. privatePage
- intro (text)
- orderSteps (array av string)
- priceListTitle (string)

9. privatePrice
- producer (string)
- wine (string)
- vintage (string)
- bottle (string)
- price (string)
- notes (string)

10. contactPage
- email (string)
- instagramUrl (url)
- linkedinUrl (url)
- newsletterTitle (string)
- newsletterText (text)
- newsletterCtaLabel (string)
- newsletterEmbedUrl (url)

11. siteSettings (legacy, migreras till sidodokumenten)
- siteName (string)
- tagline (string)
- heroText (text)
- homeImage (image)
- producersIntro (text)
- restaurantsIntro (text)
- restaurantsPriceIntro (text)
- aboutTitle (string)
- aboutBody (text)
- aboutImage (image)
- footerEmail (string)
- footerInstagramUrl (url)
- footerLinkedinUrl (url)
- newsletterTitle (string)
- newsletterText (text)
- newsletterCtaLabel (string)
- newsletterEmbedUrl (url)

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
