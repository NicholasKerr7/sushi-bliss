# Sushi Bliss Redesign Map

Date: 2026-05-28

## Visual Direction

The final pass follows the screenshot system: black stone backgrounds, glass panels, warm lantern light, gold borders, deep red CTAs, smoke overlays, editorial headings, premium sushi photography, and compact mobile commerce cards.

## Screenshot Role Mapping

- Home: `timeless-sushi-dining-experience-ui.png`, `chatgpt-image-may-25-2026-08-35-21-pm-1.png`
- Menu and product browsing: `sushi-bliss-ui-mockup-design.png`, `luxury-sushi-app-with-elegant-ui.png`
- Ordering and cart: `sushi-bliss-ordering-interface-mockup.png`, `sushi-bliss-checkout-experience.png`, `sushi-bliss-checkout-experience-2.png`
- Confirmation and tracking: `sushi-bliss-order-confirmation-design.png`, `sushi-bliss-order-tracking-interface.png`
- Reservations: `sushi-bliss-reservation-interface-mockups.png`
- Profile and loyalty: `sushi-bliss-user-interface-design.png`, `sushi-bliss-loyalty-dashboard-concept.png`
- About and contact: `elegant-sushi-bliss-website-mockup.png`, `sushi-bliss-contact-page-design.png`

## Implementation Map

- Data foundation: `src/data/types.ts`, `src/data/loadSushiData.ts`, `src/data/selectors.ts`, `src/data/menu.ts`
- Visual system: `src/styles/tokens.css`, `src/styles/effects.css`, `src/styles/animations.css`, `src/app/globals.css`
- App shell: `src/components/layout/*`
- Main app experience: `src/components/SushiApp.tsx`
- Shared flows: `src/components/sushi/*`, `src/lib/*`

## Pragmatic Route Decision

The repo currently ships as one client app in a single Next route. This sprint keeps that flow to avoid breaking cart/reservation/order state, but rebuilds the experience as native-feeling app views inside a reusable shell. The resulting structure can be split into App Router pages later because the data layer and section components are now separated from hardcoded menu content.

