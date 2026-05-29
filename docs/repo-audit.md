# Sushi Bliss Repo Audit

Date: 2026-05-28

## Framework And Runtime

- Framework: Next.js 14.1.0 with the App Router in `src/app`.
- Main route: `src/app/page.tsx`, currently rendering the client app in `src/components/SushiApp.tsx`.
- Styling: Tailwind CSS 3.4 with `src/app/globals.css`, local fonts, and custom theme tokens in `tailwind.config.ts`.
- Interaction stack: React 18.2, framer-motion, lucide-react, localStorage persistence.
- Tests: Vitest unit tests via `npm test`; Playwright e2e config is present.

## Current App Shape

- The existing app is a single mobile-web client experience, not a multi-page route tree.
- Existing cart, reservation, order history, loyalty, and profile state all live in `SushiApp.tsx`.
- Utility logic exists under `src/lib/*` and is covered by unit tests.
- UI primitives are lightweight local components in `src/components/ui`.

## Keep

- Next.js App Router setup.
- Tailwind pipeline and local font loading.
- Existing reservation, order, cart, and omakase utility tests.
- Existing localStorage persistence patterns, updated for string menu IDs.

## Refactor

- Replace legacy `src/data/menu.ts` hardcoded sushi records with selectors backed by `public/assets/data/data.json`.
- Rebuild `SushiApp.tsx` into a view-based luxury app shell that keeps the current single-page flow while adding Home, Menu, Pairings, Reservations, Orders, Loyalty, Profile, About, and Contact surfaces.
- Update shared sheets/cards to the final package data model and design tokens.
- Replace neon/cyan visual language with black stone, glass, gold, red, smoke, and lantern effects.

## Replace

- Old `/assets/sushi/*` image dependency.
- Emoji-based brand marks.
- Duplicate hardcoded menu content inside components.

