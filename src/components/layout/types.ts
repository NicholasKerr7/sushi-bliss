import type { LucideIcon } from "lucide-react";

/** Enumerates every routable app screen so URL state and navigation stay in sync. */
export const appViews = [
  "welcome",
  "home",
  "menu",
  "orderOnline",
  "reservations",
  "reservationReview",
  "reservationDetails",
  "reservationConfirmation",
  "modifyReservation",
  "cancelReservation",
  "orders",
  "orderTracking",
  "orderConfirmation",
  "profile",
  "personalInformation",
  "accountSettings",
  "savedAddresses",
  "addAddress",
  "paymentMethods",
  "addCard",
  "dietaryPreferences",
  "privacySecurity",
  "notifications",
  "notificationDetail",
  "reservationHistory",
  "help",
  "supportChat",
  "faq",
  "locations",
  "locationDetails",
  "offers",
  "offerDetails",
  "referral",
  "giftExperience",
  "giftCheckout",
  "giftConfirmation",
  "favorites",
  "recentlyViewed",
  "omakase",
  "omakasePackageReview",
  "loyalty",
  "memberPass",
  "about",
  "aboutStory",
  "chefsTeam",
  "sourcing",
  "atmosphere",
  "contact",
  "pairings",
] as const;

export type AppView = (typeof appViews)[number];

/** Validates app-view values read from query strings, history state, or storage. */
export function isAppView(value: string | null | undefined): value is AppView {
  return typeof value === "string" && (appViews as readonly string[]).includes(value);
}

export interface NavItem {
  key: AppView;
  label: string;
  icon: LucideIcon;
  assetIcon?: string;
  id?: string;
  target?: AppView;
}
