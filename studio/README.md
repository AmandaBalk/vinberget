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

- siteSettings
- producer
- restaurant
- restaurantPrice
- privatePage
- privatePrice
