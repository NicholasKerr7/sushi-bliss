# Sushi Bliss Redesign Map

Date: 2026-05-31

## Visual Direction

The final pass follows only the tidy screenshot system from `sushi-bliss-final-tidy-screenshots 2.zip`: black stone backgrounds, glass panels, warm lantern light, gold borders, deep red CTAs, smoke overlays, editorial headings, premium sushi photography, and compact mobile commerce cards.

## Screenshot Role Mapping

- Home: `mobile/mobile-01.png`, `tablet/tablet-01-home-dashboard.png`, `desktop/desktop-01-home-dashboard.png`
- Menu and product browsing: `tablet/tablet-03-menu-overview.png`, `desktop/desktop-02-menu-overview.png`, `desktop/desktop-04-item-detail-otoro-nigiri.png`
- Ordering and cart: `tablet/tablet-08-cart.png`, `desktop/desktop-06-cart.png`, `desktop/desktop-07-checkout.png`
- Confirmation and tracking: `tablet/tablet-12-live-order-tracking.png`, `desktop/desktop-09-order-confirmation.png`
- Reservations: `tablet/tablet-13-reservations-main.png`, `desktop/desktop-11-reservations-main.png`
- Profile and loyalty: `tablet/tablet-26-loyalty-dashboard.png`, `desktop/desktop-19-profile-dashboard.png`
- About and contact: `tablet/tablet-39-about-our-story.png`, `desktop/desktop-21-contact.png`

## Implementation Map

- Data foundation: `src/data/types.ts`, `src/data/loadSushiData.ts`, `src/data/selectors.ts`, `src/data/menu.ts`
- Visual system: `src/styles/tokens.css`, `src/styles/effects.css`, `src/styles/animations.css`, `src/app/globals.css`
- App shell: `src/components/layout/*`
- Main app experience: `src/components/SushiApp.tsx`
- Shared flows: `src/components/sushi/*`, `src/lib/*`

## Pragmatic Route Decision

The repo currently ships as one client app in a single Next route. This sprint keeps that flow to avoid breaking cart/reservation/order state, but rebuilds the experience as native-feeling app views inside a reusable shell. The resulting structure can be split into App Router pages later because the data layer and section components are now separated from hardcoded menu content.
