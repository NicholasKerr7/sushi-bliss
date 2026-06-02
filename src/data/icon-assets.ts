import { getAssetById } from "./selectors";

export const sushiIconAssetIds = {
  about: "chef-crest-icon",
  alert: "gold-alert-icon",
  bag: "takeaway-bag-icon",
  bell: "notification-bell-icon",
  calendar: "calendar-icon",
  cart: "shopping-cart-icon",
  check: "check-icon",
  chef: "chef-crest-icon",
  chefHat: "chef-hat-icon",
  clock: "clock-icon",
  contact: "email-icon",
  creditCard: "credit-card-icon",
  crown: "lotus-crown-icon",
  delivery: "delivery-scooter-icon",
  dining: "dining-setting-icon",
  email: "email-icon",
  facebook: "facebook-icon",
  flower: "floral-emblem-icon",
  gift: "gift-icon",
  group: "group-icon",
  headset: "headset-icon",
  heart: "heart-icon",
  home: "home-icon",
  instagram: "instagram-icon",
  location: "map-pin-icon",
  loyalty: "gift-icon",
  mapPin: "map-pin-icon",
  menu: "sushi-menu-icon",
  menuDark: "menu-dark-icon",
  menuLight: "menu-light-icon",
  misoSoup: "miso-soup-icon",
  nigiri: "nigiri-icon",
  orders: "takeaway-bag-icon",
  phone: "phone-icon",
  plus: "plus-icon",
  profile: "user-icon",
  qr: "qr-code-icon",
  reservations: "calendar-icon",
  riderAvatar: "delivery-rider-avatar",
  sashimi: "sashimi-icon",
  search: "search-icon",
  settings: "user-settings-icon",
  share: "share-icon",
  star: "star-icon",
  ticket: "golden-ticket-icon",
  x: "x-icon",
} as const;

export type SushiIconAssetKey = keyof typeof sushiIconAssetIds;

/** Resolves every packaged transparent icon into a public URL map for app components. */
export function getSushiIconAssets(): Record<SushiIconAssetKey, string | undefined> {
  return Object.fromEntries(
    Object.entries(sushiIconAssetIds).map(([key, id]) => [key, getAssetById(id)?.publicUrl])
  ) as Record<SushiIconAssetKey, string | undefined>;
}
