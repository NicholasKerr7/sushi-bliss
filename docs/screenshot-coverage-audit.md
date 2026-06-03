# Screenshot Coverage Audit

Date: 2026-06-02

## Reference Inventory

- Mobile: 60 screenshots in `public/assets/screenshots/mobile`, numbered `mobile-01.png` through `mobile-60.png`.
- Tablet: 40 screenshots in `public/assets/screenshots/tablet`, named by screen role.
- Desktop: 40 screenshots in `public/assets/screenshots/desktop`, named by screen role.
- Tablet reference size: `1086x1448`.
- Desktop reference size: mostly `1672x941`, with several editorial/detail views at `1586x992`.
- Mobile reference sizes: `863x1822` and `941x1672`.
- Semantic mobile map: `docs/mobile-screenshot-map.md`.

## Breakpoint Decision

The screenshot package uses high-resolution exports, but real tablet CSS viewports start around 768px. The corrected device bands are:

- Mobile: below `768px`.
- Tablet: `768px` through `1279px`.
- Desktop: `1280px` and above.

## Covered Named Screens

The app has an implemented screen or modal surface for these tablet/desktop references:

- Home dashboard.
- Search and filter state.
- Menu overview.
- Menu category detail.
- Item detail.
- Cart.
- Checkout and checkout review.
- Orders dashboard.
- Live order tracking.
- Reservations main.
- Reservation experience selection.
- Reservation review.
- Reservation confirmation.
- Reservation history.
- Modify reservation.
- Cancel reservation.
- Omakase experience.
- Omakase package review.
- Loyalty dashboard.
- Member pass rewards.
- Profile dashboard.
- Account settings and preferences.
- Contact.
- Help center.
- FAQ article detail.
- Notifications center.
- Notification detail.
- Favorites.
- Promotions and offers.
- Offer detail.
- Referral.
- Locations.
- Location detail.
- Gift experience.
- Gift checkout.
- Gift confirmation.
- About story.
- Master chefs team.
- Sourcing ingredients.
- Restaurant atmosphere gallery.
- Welcome / entry splash.

## Follow-Up Gaps

- Item customization is now URL-addressable through `?item=...&mode=customize`, but customization choices are still lightweight item-request preferences rather than persisted cart-line metadata.
- Cart and checkout are now URL-addressable through `?panel=cart` and `?panel=checkout&step=delivery|payment|review`. The checkout substeps remain in one modal shell so they stay visually aligned with the screenshot references.

## Implementation Notes

- The default app still opens directly into home, while the screenshot welcome state is available for QA at `?view=welcome`.
