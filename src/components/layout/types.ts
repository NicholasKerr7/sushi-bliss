import type { LucideIcon } from "lucide-react";

export type AppView =
  | "home"
  | "menu"
  | "orderOnline"
  | "reservations"
  | "reservationReview"
  | "reservationDetails"
  | "reservationConfirmation"
  | "modifyReservation"
  | "cancelReservation"
  | "orders"
  | "orderTracking"
  | "profile"
  | "personalInformation"
  | "accountSettings"
  | "savedAddresses"
  | "addAddress"
  | "paymentMethods"
  | "addCard"
  | "dietaryPreferences"
  | "privacySecurity"
  | "notifications"
  | "notificationDetail"
  | "reservationHistory"
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
  | "omakasePackageReview"
  | "loyalty"
  | "memberPass"
  | "about"
  | "aboutStory"
  | "chefsTeam"
  | "sourcing"
  | "atmosphere"
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
