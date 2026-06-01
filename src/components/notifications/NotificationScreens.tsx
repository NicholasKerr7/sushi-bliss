import Image from "next/image";
import { ChevronRight, RotateCcw, Settings } from "lucide-react";
import { useState } from "react";
import { getAppContent, getFeaturedAssets, getItemById } from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import { formatCurrency } from "../../lib/format-utils";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";

interface NotificationScreenProps {
  onNavigate: (view: AppView) => void;
}

interface SushiNotification {
  id: string;
  actionLabel: string;
  copy: string;
  icon?: string;
  read: boolean;
  target: AppView;
  time: string;
  title: string;
  type: "orders" | "reservations" | "loyalty" | "offers" | "updates";
}

const appContent = getAppContent();
const featuredAssets = getFeaturedAssets();
const iconAssets = getSushiIconAssets();
const notificationHero = getItemById("otoro-nigiri")?.image.publicUrl ?? featuredAssets.heroSushi.publicUrl;

const notifications: SushiNotification[] = [
  {
    id: "order-on-way",
    actionLabel: "View Order",
    copy: "Your order #S812345 is out for delivery and will arrive in 15 min.",
    icon: iconAssets.orders,
    read: false,
    target: "orders",
    time: "10 min ago",
    title: "Your order is on the way",
    type: "orders",
  },
  {
    id: "reservation-confirmed",
    actionLabel: "Review Reservation",
    copy: "Your reservation for May 24, 7:00 PM at Main Dining Room is confirmed.",
    icon: iconAssets.calendar,
    read: false,
    target: "reservationDetails",
    time: "1 hour ago",
    title: "Reservation confirmed",
    type: "reservations",
  },
  {
    id: "points-earned",
    actionLabel: "View Rewards",
    copy: "Nice choice! You earned 250 points from your recent order.",
    icon: iconAssets.gift,
    read: false,
    target: "loyalty",
    time: "3 hours ago",
    title: "You earned 250 points!",
    type: "loyalty",
  },
  {
    id: "exclusive-offer",
    actionLabel: "Redeem Offer",
    copy: "Enjoy 15% off your next order. Offer valid until May 31, 2024.",
    icon: iconAssets.star,
    read: false,
    target: "offerDetails",
    time: "5 hours ago",
    title: "Exclusive offer just for you",
    type: "offers",
  },
  {
    id: "order-delivered",
    actionLabel: "View Order",
    copy: "Your order #SB12344 has been delivered. Enjoy your meal!",
    icon: iconAssets.orders,
    read: true,
    target: "orders",
    time: "Yesterday, 8:12 PM",
    title: "Order delivered",
    type: "orders",
  },
  {
    id: "reservation-reminder",
    actionLabel: "View Reservation",
    copy: "Your reservation is tomorrow at 7:00 PM. We look forward to seeing you!",
    icon: iconAssets.calendar,
    read: true,
    target: "notificationDetail",
    time: "Yesterday, 5:00 PM",
    title: "Reservation reminder",
    type: "reservations",
  },
  {
    id: "welcome-bonus",
    actionLabel: "View Rewards",
    copy: "Thank you for joining Sushi Bliss. You earned 500 bonus points!",
    icon: iconAssets.gift,
    read: true,
    target: "loyalty",
    time: "May 20, 2024",
    title: "Welcome bonus awarded",
    type: "loyalty",
  },
  {
    id: "birthday-treat",
    actionLabel: "Redeemed",
    copy: "Happy Birthday, Hiroshi! Here's a treat from us: 20% off any order.",
    icon: iconAssets.star,
    read: true,
    target: "offers",
    time: "May 15, 2024",
    title: "Special birthday treat",
    type: "offers",
  },
];

/** Counts notification rows for screenshot-style filter labels. */
function countNotifications(type?: SushiNotification["type"]): number {
  return type ? notifications.filter((notification) => notification.type === type).length : notifications.length;
}

/** Returns the notification detail used by the dedicated detail screenshot. */
function getDetailNotification(): SushiNotification {
  return notifications.find((notification) => notification.id === "order-delivered") ?? notifications[0];
}

/** Renders the screenshot-style notifications center with filters and preference switches. */
export function NotificationsCenterView({ onNavigate }: NotificationScreenProps) {
  const filterTabs = [
    { label: `All (${countNotifications()})`, type: undefined },
    { label: `Orders (${countNotifications("orders")})`, type: "orders" as const },
    { label: `Reservations (${countNotifications("reservations")})`, type: "reservations" as const },
    { label: `Loyalty (${countNotifications("loyalty")})`, type: "loyalty" as const },
    { label: `Offers (${countNotifications("offers")})`, type: "offers" as const },
  ];
  const [activeType, setActiveType] = useState<SushiNotification["type"] | undefined>();
  const visibleNotifications = activeType
    ? notifications.filter((notification) => notification.type === activeType)
    : notifications;

  return (
    <section className="space-y-5 pt-8 md:pt-2">
      <header className="luxury-panel p-6 sm:p-8">
        <h1 className="editorial-title text-[42px] leading-none text-white sm:text-[64px]">
          Notifications <span className="text-[var(--sb-red-bright)]">Center</span>
        </h1>
        <p className="mt-4 text-lg text-[var(--sb-gold)]">Stay updated on your orders, reservations, rewards, and exclusive offers.</p>
      </header>
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="luxury-panel p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {filterTabs.map((tab) => {
                const active = activeType === tab.type;
                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActiveType(tab.type)}
                    className={`h-12 rounded-[14px] border px-5 text-sm uppercase tracking-[0.12em] transition ${
                      active ? "red-glow-button border-[var(--sb-red-bright)] text-white" : "border-[var(--sb-border)] bg-black/36 text-white/78 hover:text-[var(--sb-gold)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <button type="button" className="flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-[var(--sb-gold)]">
              {iconAssets.check ? <AssetIcon src={iconAssets.check} size={22} /> : null}
              Mark All As Read
            </button>
          </div>
          <div className="mt-5 divide-y divide-[var(--sb-border)]">
            {visibleNotifications.map((notification) => (
              <NotificationCenterRow key={notification.id} notification={notification} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
        <NotificationPreferencesCard />
      </div>
    </section>
  );
}

/** Renders one notification center row with separate detail and action targets. */
function NotificationCenterRow({ notification, onNavigate }: { notification: SushiNotification; onNavigate: (view: AppView) => void }) {
  return (
    <article className="grid gap-4 py-4 lg:grid-cols-[1fr_150px_188px] lg:items-center">
      <button type="button" onClick={() => onNavigate("notificationDetail")} className="grid grid-cols-[22px_70px_1fr] items-center gap-3 text-left">
        <span className={`h-2.5 w-2.5 rounded-full ${notification.read ? "bg-white/28" : "bg-[var(--sb-red-bright)]"}`} />
        <span className={`grid h-14 w-14 place-items-center rounded-full border bg-black/42 ${notification.read ? "border-white/12 opacity-60" : "border-[var(--sb-border-strong)]"}`}>
          {notification.icon ? <AssetIcon src={notification.icon} size={30} /> : null}
        </span>
        <span>
          <span className="block text-xl text-white">{notification.title}</span>
          <span className="mt-1 line-clamp-2 block text-sm leading-6 text-[var(--sb-muted)]">{notification.copy}</span>
        </span>
      </button>
      <p className="pl-[105px] text-sm text-white/58 lg:pl-0">{notification.time}</p>
      <button
        type="button"
        onClick={() => onNavigate(notification.target)}
        className={`h-11 rounded-[12px] border px-4 text-xs uppercase tracking-[0.14em] transition ${
          notification.read
            ? "border-white/16 bg-black/24 text-white/58 hover:text-[var(--sb-gold)]"
            : "border-[rgba(239,47,37,0.58)] bg-black/24 text-[var(--sb-red-bright)] hover:bg-[var(--sb-red)]/18"
        }`}
      >
        {notification.actionLabel}
      </button>
    </article>
  );
}

/** Renders the notification preference switches shown at the side of desktop references. */
function NotificationPreferencesCard() {
  const preferenceRows = [
    { title: "Orders", copy: "Updates on your orders and deliveries.", icon: iconAssets.orders, enabled: true },
    { title: "Reservations", copy: "Confirmations, reminders, and changes.", icon: iconAssets.calendar, enabled: true },
    { title: "Loyalty & Rewards", copy: "Points updates and member perks.", icon: iconAssets.gift, enabled: true },
    { title: "Offers & Promotions", copy: "Exclusive offers and special deals.", icon: iconAssets.star, enabled: true },
    { title: "News & Events", copy: "Latest news and upcoming events.", icon: iconAssets.bell, enabled: false },
    { title: "Email Notifications", copy: appContent.member.email, icon: iconAssets.email, enabled: true },
    { title: "Push Notifications", copy: "Receive alerts on this device.", icon: iconAssets.phone, enabled: true },
  ];

  return (
    <aside className="luxury-panel h-max p-6">
      <div className="mb-5 flex items-center gap-4">
        {iconAssets.bell ? <AssetIcon src={iconAssets.bell} size={33} /> : null}
        <span>
          <h2 className="editorial-title text-xl text-[var(--sb-gold)]">Notification Preferences</h2>
          <p className="mt-1 text-sm text-[var(--sb-muted)]">Choose what you&apos;d like to hear about.</p>
        </span>
      </div>
      <div className="divide-y divide-[var(--sb-border)]">
        {preferenceRows.map((row) => (
          <NotificationPreferenceRow key={row.title} {...row} />
        ))}
      </div>
      <button type="button" className="mt-6 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[var(--sb-border)] bg-black/30 px-4 py-3 text-sm uppercase tracking-[0.14em] text-[var(--sb-gold)]">
        <Settings className="h-4 w-4" />
        Manage Preferences
      </button>
    </aside>
  );
}

/** Keeps each preference switch local while preserving accessible switch semantics. */
function NotificationPreferenceRow({ copy, enabled, icon, title }: { copy: string; enabled: boolean; icon?: string; title: string }) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  return (
    <div className="grid grid-cols-[42px_1fr_62px] items-center gap-4 py-4">
      <span className="grid h-10 w-10 place-items-center text-[var(--sb-gold)]">{icon ? <AssetIcon src={icon} size={29} /> : null}</span>
      <span>
        <span className="block text-base text-white">{title}</span>
        <span className="mt-1 block text-sm text-[var(--sb-muted)]">{copy}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isEnabled}
        onClick={() => setIsEnabled((current) => !current)}
        className={`relative h-8 w-14 rounded-full transition ${isEnabled ? "bg-[var(--sb-red-bright)]" : "bg-white/18"}`}
      >
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${isEnabled ? "right-1" : "left-1"}`} />
      </button>
    </div>
  );
}

/** Renders the desktop/tablet notification detail layout from the provided references. */
export function NotificationDetailView({ onNavigate }: NotificationScreenProps) {
  const detail = getDetailNotification();
  const orderItems = [
    { name: "Otoro Nigiri", price: 12 },
    { name: "Spicy Tuna Roll", price: 14 },
    { name: "Salmon Sashimi", price: 15 },
  ];

  return (
    <section className="space-y-5 pt-8 md:pt-2">
      <div className="grid gap-5 xl:grid-cols-[520px_1fr]">
        <aside className="luxury-panel p-5">
          <div className="flex items-center justify-between">
            <h1 className="editorial-title text-2xl text-[var(--sb-gold)]">Notifications</h1>
            <button type="button" aria-label="Notification settings" className="text-[var(--sb-gold)]">
              <Settings className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {["All 5", "Orders 2", "Rewards 2", "Updates 1"].map((label, index) => (
              <span key={label} className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] ${index === 0 ? "red-glow-button border-[var(--sb-red-bright)] text-white" : "border-[var(--sb-border)] bg-black/36 text-white/72"}`}>
                {label}
              </span>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {notifications.slice(4, 9).map((notification, index) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => onNavigate("notificationDetail")}
                className={`grid w-full grid-cols-[18px_58px_1fr_auto] items-center gap-3 rounded-[16px] border p-3 text-left transition ${
                  index === 0 ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/10 shadow-[0_0_24px_rgba(239,47,37,0.24)]" : "border-[var(--sb-border)] bg-black/30 hover:border-[var(--sb-gold)]"
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${notification.read ? "bg-white/24" : "bg-[var(--sb-red-bright)]"}`} />
                <span className="grid h-12 w-12 place-items-center rounded-[12px] border border-[var(--sb-border)] bg-black/42">
                  {notification.icon ? <AssetIcon src={notification.icon} size={28} /> : null}
                </span>
                <span>
                  <span className="block text-base text-white">{notification.title}</span>
                  <span className="mt-1 line-clamp-1 block text-xs text-[var(--sb-muted)]">{notification.copy}</span>
                </span>
                <span className="hidden text-xs text-white/54 sm:block">{notification.time}</span>
              </button>
            ))}
          </div>
          <button type="button" className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-[12px] border border-[var(--sb-border)] bg-black/34 uppercase tracking-[0.14em] text-[var(--sb-gold)]">
            {iconAssets.email ? <AssetIcon src={iconAssets.email} size={23} /> : null}
            Mark All As Read
          </button>
        </aside>

        <article className="luxury-panel p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-[82px_1fr_auto] sm:items-center">
            <span className="grid h-20 w-20 place-items-center rounded-[18px] border border-[var(--sb-border)] bg-black/42">
              {detail.icon ? <AssetIcon src={detail.icon} size={42} /> : null}
            </span>
            <span>
              <h2 className="editorial-title text-3xl text-white">{detail.title}</h2>
              <span className="mt-2 block text-sm text-[var(--sb-muted)]">Order #SB-2024-0509 • Today, 6:45 PM</span>
            </span>
            <span className="w-max rounded-full border border-emerald-500/28 bg-emerald-500/10 px-5 py-2 text-xs uppercase tracking-[0.14em] text-emerald-300">Delivered</span>
          </div>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78">
            Great news! Your order has been delivered.
            <br />
            We hope you enjoy your meal from Sushi Bliss.
          </p>
          <section className="mt-6 grid overflow-hidden rounded-[16px] border border-[var(--sb-border)] bg-black/34 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-5">
              <h3 className="editorial-title text-xl text-[var(--sb-gold)]">Order Details</h3>
              <div className="mt-4 space-y-4">
                <DetailLine label="Order Number" value="#SB-2024-0509" />
                <DetailLine label="Order Date" value="May 22, 2024 at 6:15 PM" />
                <DetailLine label="Delivery Address" value={`${appContent.member.deliveryAddress}\nTokyo, 100-0001, Japan`} />
                <DetailLine label="Delivery Time" value="Delivered at 6:45 PM" />
                <DetailLine label="Payment Method" value="Mastercard •••• 4242" />
                <DetailLine label="Total" value={formatCurrency(62.64)} />
              </div>
            </div>
            <div className="relative min-h-[260px]">
              <Image src={notificationHero} alt="" fill sizes="560px" className="object-cover" />
            </div>
          </section>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
            <section className="rounded-[16px] border border-[var(--sb-border)] bg-black/34 p-5">
              <h3 className="editorial-title text-xl text-[var(--sb-gold)]">Order Items (3)</h3>
              <div className="mt-4 space-y-3">
                {orderItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm text-white/74">
                    <span>1x {item.name}</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-[16px] border border-[var(--sb-border)] bg-black/34 p-5">
              <h3 className="editorial-title text-xl text-[var(--sb-gold)]">Need Help?</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--sb-muted)]">If you have any issues with your order, our support team is here to help.</p>
              <button type="button" onClick={() => onNavigate("supportChat")} className="mt-4 flex h-11 w-full items-center justify-center gap-3 rounded-[12px] border border-[var(--sb-border)] bg-black/30 uppercase tracking-[0.12em] text-[var(--sb-gold)]">
                Contact Support
                <ChevronRight className="h-4 w-4" />
              </button>
            </section>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Button className="red-glow-button h-14 rounded-[14px] uppercase tracking-[0.14em]" onClick={() => onNavigate("orders")}>
              View Order Details
            </Button>
            <Button variant="outline" className="h-14 rounded-[14px] border-[var(--sb-border-strong)] bg-black/30 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => onNavigate("orderOnline")}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Order Again
            </Button>
            <Button variant="outline" className="h-14 rounded-[14px] border-[var(--sb-border-strong)] bg-black/30 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => onNavigate("orders")}>
              Track Delivery
            </Button>
          </div>
        </article>
      </div>
      <NotificationBenefitsBar />
    </section>
  );
}

/** Displays one label/value row in the notification detail information card. */
function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
      <span className="text-xs uppercase tracking-[0.14em] text-[var(--sb-muted)]">{label}</span>
      <span className="whitespace-pre-line text-sm text-white">{value}</span>
    </div>
  );
}

/** Shows the bottom trust strip used below the notification detail screenshot. */
function NotificationBenefitsBar() {
  const benefits = [
    ["Premium Ingredients", "Sourced Daily", iconAssets.flower],
    ["Expert Craftsmanship", "By Master Chefs", iconAssets.chef],
    ["Authentic Experience", "Traditional. Refined.", iconAssets.profile],
    ["Exclusive Reservations", "Priority for Members", iconAssets.orders],
  ];

  return (
    <section className="luxury-panel grid gap-0 overflow-hidden p-0 md:grid-cols-2 xl:grid-cols-4">
      {benefits.map(([title, copy, icon]) => (
        <div key={title} className="flex items-center gap-4 border-b border-[var(--sb-border)] px-6 py-5 last:border-b-0 md:border-r md:last:border-r-0 xl:border-b-0">
          {typeof icon === "string" ? <AssetIcon src={icon} size={34} /> : null}
          <span>
            <span className="block text-sm uppercase tracking-[0.16em] text-white/82">{title}</span>
            <span className="block text-sm text-[var(--sb-muted)]">{copy}</span>
          </span>
        </div>
      ))}
    </section>
  );
}

