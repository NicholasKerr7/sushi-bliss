import type { LucideIcon } from "lucide-react";

export type AppView =
  | "home"
  | "menu"
  | "orderOnline"
  | "reservations"
  | "reservationDetails"
  | "orders"
  | "profile"
  | "personalInformation"
  | "accountSettings"
  | "privacySecurity"
  | "notifications"
  | "help"
  | "supportChat"
  | "faq"
  | "locations"
  | "locationDetails"
  | "offers"
  | "offerDetails"
  | "referral"
  | "giftExperience"
  | "giftCheckout"
  | "giftConfirmation"
  | "favorites"
  | "recentlyViewed"
  | "omakase"
  | "loyalty"
  | "about"
  | "contact"
  | "pairings";

export interface NavItem {
  key: AppView;
  label: string;
  icon: LucideIcon;
  assetIcon?: string;
  id?: string;
  target?: AppView;
}
