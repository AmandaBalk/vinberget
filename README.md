# Vinberget

Frontend för Vinberget Vinhandel samt Sanity Studio i `studio/`.

## Deployment

### Loopia hosting

1. Kör `npm run build` lokalt.
2. Ladda upp innehållet i `dist/` till din Loopia-hosting.
3. Peka domänen till den uppladdade webbplatsen enligt Loopias vanliga publiceringsflöde.
4. Inga egna Mailchimp-nycklar eller backend-funktioner behöver hanteras efter lansering.

### Mailchimp signup

Nyhetsbrevspopupen skickar e-postadresser direkt till Mailchimps inbäddade formulär.
Det finns ingen egen backend eller API-nyckel att underhålla efter lansering.

### Lokal utveckling

1. Kör `npm run build` för att verifiera frontendbygget.
2. Testa formuläret i webbläsaren och verifiera sedan att kontakten dyker upp i Mailchimp Audience.