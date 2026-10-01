# Sanity Studio

This folder contains the editorial interface for Vinberget.

## What this gives you

- A separate CMS app where the owner can edit content without touching code.
- Structured content types for the homepage, producers, restaurants, and price lists.
- A clean path to hosting the studio at a dedicated URL.

## How to run it

1. Copy `studio/.env.example` to `studio/.env` and replace the project id.
2. Install dependencies inside the `studio` folder.
3. Start the studio with `npm run dev` from inside `studio`.

## Content types

- homePage
- aboutPage
- producerPage
- producer
- restaurantPage
- restaurant
- restaurantPrice
- privatePage
- privatePrice
- contactPage
- siteSettings (legacy, retained until migration is complete)

## Migrate existing page content

The old `siteSettings` document remains as a read fallback until the page documents are created. Sign in to Sanity CLI with an account that can edit the dataset, then run `npm run migrate:site-settings` from this folder. The migration uses the CLI's logged-in token, creates the new page documents only when none of them exist, and keeps the legacy document untouched.
