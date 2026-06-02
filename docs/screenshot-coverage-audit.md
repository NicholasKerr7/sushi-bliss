# Screenshot Coverage Audit

Date: 2026-06-02

## Reference Inventory

- Mobile: 60 screenshots in `public/assets/screenshots/mobile`, numbered `mobile-01.png` through `mobile-60.png`.
- Tablet: 40 screenshots in `public/assets/screenshots/tablet`, named by screen role.
- Desktop: 40 screenshots in `public/assets/screenshots/desktop`, named by screen role.
- Tablet reference size: `1086x1448`.
- Desktop reference size: mostly `1672x941`, with several editorial/detail views at `1586x992`.
- Mobile reference sizes: `863x1822` and `941x1672`.

## Breakpoint Decision

The reference tablet width is 1086px, so the app should not switch into tablet dashboard behavior at the old 768px boundary. The corrected device bands are:

- Mobile: below `900px`.
- Tablet: `900px` through `1279px`.
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

## Follow-Up Gaps

- `desktop-09-order-confirmation.png`: the current checkout flow creates an order and navigates to Orders, but there is no dedicated `orderConfirmation` app view wired into `AppView`. An older `OrderConfirmationSheet` component exists, but it is not connected to the current app flow and does not match the final screenshot system.
- `tablet-07-item-customization-add-ons.png` and `desktop-05-item-customization-add-ons.png`: the current item detail modal includes quantity, pairing, texture, and related items, but add-ons/customization are not a dedicated state with URL state.
- Cart and checkout are implemented as transient overlays. They match the screenshot concept, but they do not yet have URL state like `?cart=open` or `?checkout=review`.
- Mobile references are numbered rather than role-named in `data.json`, so strict one-to-one mobile coverage should add a semantic mobile screenshot map before future precision work.
