import type { AppView, NavItem } from "./types";
import { AssetIcon } from "../icons/AssetIcon";

interface BottomNavProps {
  items: NavItem[];
  activeView: AppView;
  floating?: boolean;
  onNavigate: (view: AppView) => void;
}

const profileSubViews: AppView[] = [
  "loyalty",
  "contact",
  "about",
  "aboutStory",
  "chefsTeam",
  "sourcing",
  "atmosphere",
  "pairings",
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
  "help",
  "supportChat",
  "faq",
  "offers",
  "offerDetails",
  "referral",
  "giftExperience",
  "giftCheckout",
  "giftConfirmation",
  "favorites",
  "recentlyViewed",
  "reservationHistory",
  "memberPass",
];

const reservationSubViews: AppView[] = [
  "reservationReview",
  "reservationDetails",
  "reservationConfirmation",
  "modifyReservation",
  "cancelReservation",
  "omakase",
  "omakasePackageReview",
];
const orderSubViews: AppView[] = ["orders", "orderOnline", "orderTracking"];

/** Provides the persistent mobile tab bar shown across the ordering app. */
export function BottomNav({ items, activeView, floating = true, onNavigate }: BottomNavProps) {
  return (
    <nav className={`${floating ? "fixed bottom-0 left-0 right-0" : "relative"} z-50 px-4 pb-3 lg:hidden`}>
      <div className="mobile-safe-area mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[28px] border border-[var(--sb-border)] bg-black/82 px-2 pt-2 shadow-[0_0_40px_rgba(0,0,0,0.72)] backdrop-blur-2xl">
        {items.map(({ key, label, icon: Icon, assetIcon }) => {
          const active =
            activeView === key ||
            (key === "orders" && orderSubViews.includes(activeView)) ||
            (key === "profile" && profileSubViews.includes(activeView)) ||
            (key === "reservations" && reservationSubViews.includes(activeView));
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              className={`group flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
                active
                  ? "bg-[var(--sb-red)]/26 text-[var(--sb-red-bright)] shadow-[0_0_26px_var(--sb-red-glow)]"
                  : "text-white/50 hover:text-[var(--sb-gold)]"
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-xl border transition ${
                  active ? "border-[var(--sb-red-bright)]" : "border-white/10"
                }`}
              >
                {assetIcon ? (
                  <AssetIcon src={assetIcon} size={20} className={active ? "brightness-125" : "opacity-70 grayscale"} />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </span>
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
