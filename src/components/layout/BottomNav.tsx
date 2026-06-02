import type { AppView, NavItem } from "./types";
import { AssetIcon } from "../icons/AssetIcon";

interface BottomNavProps {
  items: NavItem[];
  activeView: AppView;
  floating?: boolean;
  onNavigate: (view: AppView) => void;
  tabletItems?: NavItem[];
}

const accountSubViews: AppView[] = [
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
];
const loyaltySubViews: AppView[] = [
  "loyalty",
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

/** Determines whether a nav item should be active for a nested app view. */
function isNavItemActive(key: AppView, activeView: AppView, hasDedicatedLoyaltyItem: boolean): boolean {
  if (activeView === key) return true;
  if (key === "orders" || key === "orderOnline") return orderSubViews.includes(activeView);
  if (key === "loyalty") return loyaltySubViews.includes(activeView);
  if (key === "profile") {
    return accountSubViews.includes(activeView) || (!hasDedicatedLoyaltyItem && loyaltySubViews.includes(activeView));
  }
  if (key === "reservations") return reservationSubViews.includes(activeView);
  return false;
}

/** Renders a single bottom-nav button with the packaged icon assets when available. */
function BottomNavButton({
  activeView,
  hasDedicatedLoyaltyItem,
  item,
  tablet = false,
  onNavigate,
}: {
  activeView: AppView;
  hasDedicatedLoyaltyItem: boolean;
  item: NavItem;
  tablet?: boolean;
  onNavigate: (view: AppView) => void;
}) {
  const { key, label, icon: Icon, assetIcon } = item;
  const active = isNavItemActive(key, activeView, hasDedicatedLoyaltyItem);
  const targetView = item.target ?? key;

  return (
    <button
      type="button"
      onClick={() => onNavigate(targetView)}
      className={`group flex min-w-0 flex-col items-center justify-center gap-1 transition ${
        tablet ? "min-h-[86px] border-r border-[var(--sb-border)] px-2 py-3 last:border-r-0" : "rounded-2xl px-1 py-2"
      } ${
        active
          ? tablet
            ? "text-[var(--sb-red-bright)]"
            : "bg-[var(--sb-red)]/26 text-[var(--sb-red-bright)] shadow-[0_0_26px_var(--sb-red-glow)]"
          : "text-white/50 hover:text-[var(--sb-gold)]"
      }`}
    >
      <span
        className={`grid place-items-center rounded-xl border transition ${
          tablet ? "h-9 w-9" : "h-8 w-8"
        } ${active ? "border-[var(--sb-red-bright)]" : "border-white/10"}`}
      >
        {assetIcon ? (
          <AssetIcon src={assetIcon} size={tablet ? 22 : 20} className={active ? "brightness-125" : "opacity-70 grayscale"} />
        ) : (
          <Icon className={tablet ? "h-5 w-5" : "h-4 w-4"} />
        )}
      </span>
      <span className={`${tablet ? "text-xs" : "text-[10px]"} truncate font-semibold uppercase tracking-[0.08em]`}>{label}</span>
    </button>
  );
}

/** Provides the persistent mobile tab bar shown across the ordering app. */
export function BottomNav({ items, activeView, floating = true, tabletItems = items, onNavigate }: BottomNavProps) {
  const mobileHasLoyalty = items.some((item) => item.key === "loyalty");
  const tabletHasLoyalty = tabletItems.some((item) => item.key === "loyalty");

  return (
    <nav className={`${floating ? "fixed bottom-0 left-0 right-0" : "relative"} z-50 px-4 pb-3 md:px-0 md:pb-0 xl:hidden`}>
      <div className="mobile-safe-area mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[28px] border border-[var(--sb-border)] bg-black/82 px-2 pt-2 shadow-[0_0_40px_rgba(0,0,0,0.72)] backdrop-blur-2xl md:hidden">
        {items.map((item) => (
          <BottomNavButton
            key={item.id ?? `${item.key}-${item.label}`}
            activeView={activeView}
            hasDedicatedLoyaltyItem={mobileHasLoyalty}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      <div className="mobile-safe-area hidden grid-cols-6 border-t border-[var(--sb-border)] bg-black/86 shadow-[0_-22px_70px_rgba(0,0,0,0.72)] backdrop-blur-2xl md:grid xl:hidden">
        {tabletItems.map((item) => (
          <BottomNavButton
            key={item.id ?? `${item.key}-${item.label}`}
            activeView={activeView}
            hasDedicatedLoyaltyItem={tabletHasLoyalty}
            item={item}
            tablet
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}
