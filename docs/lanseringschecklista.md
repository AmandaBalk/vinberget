# Lanseringschecklista

## Före innehållslås

1. Alla fem huvudsidor är ifyllda och visuellt godkända.
2. Alla texter är språkgranskade och har korrekt å, ä, ö.
3. Alla bilder är optimerade och har relevant alt-text.

## CMS-kontroll

1. Kunden kan logga in i Sanity med eget konto.
2. Kunden kan skapa, redigera och publicera:
   - en producent
   - en restaurangkund
   - en prisrad
3. Nyhetsbrevspopup skickar till Mailchimp utan egen backend.

## Funktionell kontroll

1. Åldersverifieringen visas vid nytt besök (ny fliksession).
2. Nyhetsbrevspopup visas på startsidan efter fördröjning.
3. Alla länkar i meny och innehåll fungerar.
4. Tomlägen visas snyggt om listor är tomma.

## SEO och tillgänglighet

1. Sidtitel uppdateras per sida.
2. Meta-beskrivning uppdateras per sida.
3. Rubrikhierarki är konsekvent.
4. Tabeller har rubriker och beskrivning för hjälpmedel.

## Deploy

1. Produktion pekar till rätt Loopia-hosting.
2. Inga backend-miljövariabler krävs för nyhetsbrevet.
3. Slutlig domän och SSL är verifierade.
4. Snabb rollback-plan är dokumenterad.

## Loopia-setup

1. Kör `npm run build` och ladda upp `dist/` till Loopia.
2. Verifiera att sajten fungerar på den slutliga domänen.
3. Testa att en riktig e-postadress dyker upp som kontakt i Mailchimp efter submit.

## Efter lansering

1. Kunden gör ett redaktörstest på egen hand.
2. Kunden bekräftar att allt går att uppdatera utan utvecklare.
3. Slutlig överlämning av access och ägarskap är klar.
