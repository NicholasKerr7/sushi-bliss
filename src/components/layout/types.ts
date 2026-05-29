import type { LucideIcon } from "lucide-react";

export type AppView =
  | "home"
  | "menu"
  | "orderOnline"
  | "reservations"
  | "orders"
  | "profile"
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
