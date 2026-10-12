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
- winesFormatted (Portable Text: rubriker, fet/kursiv text och listor; gammal wines-text visas som reserv)

5. restaurantPage
- priceIntro (text)
- intro (text)
- Restaurangpris-PDF genereras vid nedladdning från aktuella rader i Google Sheet

6. restaurant
- name (string)
- city (string)
- description (text)

7. Prislistor
- Hanteras i Google Sheet och hämtas via Netlify Function.
- Restaurangpris och privatpris ligger i samma rad; tomt pris utesluter vinet ur den listan.

8. privatePage
- intro (text)
- orderSteps (array av string)
- priceListTitle (string)

9. contactPage
- email (string)
- instagramUrl (url)
- linkedinUrl (url)
- newsletterTitle (string)
- newsletterText (text)
- newsletterCtaLabel (string)
- newsletterEmbedUrl (url)

10. siteSettings (legacy, migreras till sidodokumenten)
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
- /#/restauranger (Våra restauranger, sortering efter namn/ort)
- /#/restaurangkund (restaurangprislista och PDF)
- /#/privatkund

## Krav som redan ar implementerade

- 20+ modal med Ja/Nej och lokal lagring av val.
- Accordion-sektioner pa producentsidor (SEO-vanlig HTML med details/summary).
- Prislistor utan sok/filter men med tydlig tabellstruktur.
- Fallback-data visas automatiskt om Sanity-variabler saknas.
