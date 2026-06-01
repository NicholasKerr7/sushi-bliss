import Image from "next/image";
import { ChevronRight, LocateFixed, MessageCircle, Minus, Phone, Plus } from "lucide-react";
import { getAppContent, getAssetById } from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import type { SushiMenuItem } from "../../data/menu";
import { groupCartItems } from "../../lib/cart-utils";
import { formatClockTime, formatCurrency } from "../../lib/format-utils";
import type { OrderHistoryEntry } from "../../lib/order-utils";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";

interface LiveOrderTrackingViewProps {
  order: OrderHistoryEntry | null;
  profileImage: string;
  onNavigate: (view: AppView) => void;
  onReorder: (items: SushiMenuItem[]) => void;
}

interface TrackingStage {
  label: string;
  time: string;
  icon?: string;
  active: boolean;
}

const appContent = getAppContent();
const iconAssets = getSushiIconAssets();
const trackingMap = getAssetById("live-tracking-map-card")?.publicUrl ?? getAssetById("sushi-bliss-tokyo-map-transparent")?.publicUrl;

/** Renders the dedicated live-order tracking page from the mobile and tablet references. */
export function LiveOrderTrackingView({ order, profileImage, onNavigate, onReorder }: LiveOrderTrackingViewProps) {
  if (!order) {
    return <LiveTrackingEmptyState onNavigate={onNavigate} />;
  }

  const groupedItems = groupCartItems(order.items);
  const visibleItems = groupedItems.slice(0, 5);
  const hiddenCount = Math.max(groupedItems.length - visibleItems.length, 0);
  const etaWindow = getEtaWindow(order);
  const itemCount = groupedItems.reduce((sum, row) => sum + row.qty, 0);

  return (
    <section className="mx-auto w-full max-w-[1530px] space-y-4 pt-4 md:space-y-5 md:pt-2">
      <header className="grid gap-4 md:hidden">
        <button
          type="button"
          aria-label="Back to orders"
          onClick={() => onNavigate("orders")}
          className="grid h-12 w-12 place-items-center rounded-[14px] border border-[var(--sb-border)] bg-black/46 text-[var(--sb-gold)] backdrop-blur-xl"
        >
          <ChevronRight className="h-5 w-5 rotate-180" />
        </button>
        <div className="grid grid-cols-[1fr_142px] items-start gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--sb-gold)]">Order #{order.confirmationCode}</p>
            <h1 className="editorial-title mt-3 text-[44px] leading-none text-white">On the Way</h1>
            <p className="mt-3 text-lg leading-7 text-[var(--sb-gold)]">Your sushi is on the way and almost ready to be enjoyed.</p>
          </div>
          <div className="rounded-[18px] border border-[var(--sb-border)] bg-black/48 p-4 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--sb-gold)]">ETA</p>
            <p className="mt-2 text-2xl text-white">{formatClockTime(order.fulfillmentTime)}</p>
            <p className="mt-2 text-xs text-[var(--sb-muted)]">About {order.etaMinutes} min away</p>
          </div>
        </div>
      </header>

      <header className="hidden gap-4 text-center md:grid">
        <div>
          <h1 className="editorial-title text-[42px] leading-none text-white md:text-[58px] lg:text-[68px]">Live Order Tracking</h1>
          <p className="mt-2 text-lg text-[var(--sb-gold)]">Your order is on its way.</p>
        </div>
      </header>

      <section className="luxury-panel hidden overflow-hidden p-0 md:block">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--sb-border)] px-4 py-3 md:px-7">
          <span className="rounded-full border border-[rgba(239,47,37,0.55)] bg-[var(--sb-red)]/20 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white">On The Way</span>
          <span className="text-sm text-[var(--sb-muted)]">Order #{order.confirmationCode}</span>
          <span className="text-sm text-white/72">{formatOrderDate(order.placedAt)} · {formatClockTime(order.placedAt)}</span>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr] md:p-6 xl:grid-cols-[1.1fr_1fr_1fr]">
          <TrackingMetric icon={iconAssets.bag} label="Estimated Delivery" value={etaWindow} copy={`Arriving around ${formatClockTime(order.fulfillmentTime)}`} prominent />
          <TrackingRoutePoint icon={iconAssets.flower} title={appContent.location.label} copy={`${appContent.location.street}, ${appContent.location.city}`} onClick={() => onNavigate("locationDetails")} />
          <TrackingRoutePoint icon={iconAssets.mapPin} title="Your Location" copy={order.deliveryAddress || appContent.member.deliveryAddress} />
        </div>
      </section>

      <section className="relative min-h-[300px] overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/54 md:min-h-[360px]">
        {trackingMap ? <Image src={trackingMap} alt="" fill priority sizes="100vw" className="object-cover opacity-86" /> : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/6 via-transparent to-black/34" />
        <div className="absolute bottom-5 left-5 rounded-[10px] border border-[var(--sb-border)] bg-black/62 px-4 py-2 text-xs text-[var(--sb-gold)] backdrop-blur-xl">
          Real-time updates
        </div>
        <div className="absolute right-4 top-1/2 grid -translate-y-1/2 gap-2 rounded-[14px] border border-[var(--sb-border)] bg-black/62 p-2 text-[var(--sb-gold)] backdrop-blur-xl">
          <button type="button" aria-label="Zoom in" className="grid h-10 w-10 place-items-center rounded-[10px] hover:bg-white/[0.06]"><Plus className="h-5 w-5" /></button>
          <button type="button" aria-label="Zoom out" className="grid h-10 w-10 place-items-center rounded-[10px] hover:bg-white/[0.06]"><Minus className="h-5 w-5" /></button>
          <button type="button" aria-label="Recenter map" className="grid h-10 w-10 place-items-center rounded-[10px] hover:bg-white/[0.06]"><LocateFixed className="h-5 w-5" /></button>
        </div>
      </section>

      <TrackingTimeline order={order} />

      <section className="luxury-panel grid gap-5 p-4 md:grid-cols-[1fr_1.1fr_0.8fr] md:p-6">
        <div className="grid grid-cols-[86px_1fr] gap-4">
          <Image src={profileImage} alt="" width={86} height={86} className="h-[86px] w-[86px] rounded-full border border-[var(--sb-gold)] object-cover" />
          <div>
            <p className="text-sm text-[var(--sb-gold)]">Your Courier</p>
            <h2 className="editorial-title mt-1 text-3xl text-white">Kenji Sato</h2>
            <p className="mt-2 text-sm text-[var(--sb-muted)]">4.9 · 2,431 Deliveries</p>
            <p className="mt-3 inline-flex rounded-full border border-[var(--sb-border)] px-3 py-1 text-xs text-[var(--sb-gold)]">Plate #12-34 · Scooter</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
          <Button className="red-glow-button h-14 rounded-[14px] uppercase tracking-[0.14em]">
            <Phone className="mr-2 h-4 w-4" />
            Contact Driver
          </Button>
          <Button variant="outline" className="h-14 rounded-[14px] border-[var(--sb-border)] bg-black/26 uppercase tracking-[0.14em] text-white">
            <MessageCircle className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
        <div className="rounded-[16px] border border-[var(--sb-border)] bg-black/32 p-4">
          {iconAssets.orders ? <AssetIcon src={iconAssets.orders} size={30} /> : null}
          <p className="mt-3 text-sm text-[var(--sb-gold)]">No-contact delivery</p>
          <p className="mt-1 text-sm leading-6 text-[var(--sb-muted)]">Your order will be left safely at your door.</p>
        </div>
      </section>

      <section className="luxury-panel space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--sb-gold)]">{itemCount} Items</p>
          <p className="text-xl text-[var(--sb-gold)]">{formatCurrency(order.total)}</p>
        </div>
        <div className="app-scrollbar flex gap-3 overflow-x-auto pb-1">
          {visibleItems.map(({ item, qty }) => (
            <TrackingItemCard key={item.id} item={item} qty={qty} />
          ))}
          {hiddenCount > 0 ? (
            <div className="grid min-h-[132px] w-[120px] shrink-0 place-items-center rounded-[14px] border border-[var(--sb-border)] bg-black/36 text-center text-[var(--sb-gold)]">
              +{hiddenCount}
            </div>
          ) : null}
          <button type="button" onClick={() => onNavigate("orders")} className="grid min-h-[132px] w-[180px] shrink-0 place-items-center rounded-[14px] border border-[var(--sb-border)] bg-black/36 px-4 text-center text-[var(--sb-gold)]">
            View Order Details
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Button variant="outline" className="h-14 rounded-[14px] border-[var(--sb-border)] bg-black/26 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => onReorder(order.items)}>
            Reorder
          </Button>
          <Button className="red-glow-button h-14 rounded-[14px] uppercase tracking-[0.14em]" onClick={() => onNavigate("orders")}>
            Back To Orders
          </Button>
        </div>
      </section>
    </section>
  );
}

/** Shows a clear empty state if tracking is opened before an order exists. */
function LiveTrackingEmptyState({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  return (
    <section className="luxury-panel mx-auto mt-10 max-w-xl p-6 text-center">
      <h1 className="editorial-title text-4xl text-white">No Active Order</h1>
      <p className="mt-3 text-[var(--sb-muted)]">Place an order and live tracking will appear here.</p>
      <Button className="red-glow-button mt-6 h-12 rounded-[14px] px-6 uppercase tracking-[0.14em]" onClick={() => onNavigate("orderOnline")}>
        Order Now
      </Button>
    </section>
  );
}

/** Calculates the delivery range text from the persisted ETA. */
function getEtaWindow(order: OrderHistoryEntry): string {
  const low = Math.max(order.etaMinutes - 5, 10);
  return `${low}-${order.etaMinutes} min`;
}

/** Formats order dates with the compact month/day/year style used by tracking cards. */
function formatOrderDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Builds the four order stages and their display timestamps. */
function getTrackingStages(order: OrderHistoryEntry): TrackingStage[] {
  return [
    { label: "Confirmed", time: formatClockTime(order.placedAt), icon: iconAssets.check, active: true },
    { label: "Preparing", time: formatClockTime(order.placedAt + 2 * 60 * 1000), icon: iconAssets.chefHat, active: true },
    { label: order.type === "Delivery" ? "On The Way" : "Ready Soon", time: formatClockTime(order.placedAt + 14 * 60 * 1000), icon: iconAssets.delivery, active: true },
    { label: order.type === "Delivery" ? "Delivered" : "Completed", time: "Pending", icon: iconAssets.orders, active: false },
  ];
}

/** Displays one headline ETA or delivery metric in the tracking header. */
function TrackingMetric({ copy, icon, label, prominent = false, value }: { copy: string; icon?: string; label: string; prominent?: boolean; value: string }) {
  return (
    <div className="grid grid-cols-[70px_1fr] items-center gap-4 rounded-[16px] border border-[var(--sb-border)] bg-black/34 p-4">
      <span className={`grid h-16 w-16 place-items-center rounded-full border ${prominent ? "border-[var(--sb-red-bright)] shadow-[0_0_28px_var(--sb-red-glow)]" : "border-[var(--sb-border)]"}`}>
        {icon ? <AssetIcon src={icon} size={34} /> : null}
      </span>
      <span>
        <span className="block text-xs uppercase tracking-[0.16em] text-[var(--sb-muted)]">{label}</span>
        <span className={prominent ? "mt-1 block text-3xl uppercase text-[var(--sb-red-bright)]" : "mt-1 block text-xl text-white"}>{value}</span>
        <span className="mt-1 block text-sm text-[var(--sb-muted)]">{copy}</span>
      </span>
    </div>
  );
}

/** Renders one origin or destination block in the tracking header. */
function TrackingRoutePoint({ copy, icon, title, onClick }: { copy: string; icon?: string; title: string; onClick?: () => void }) {
  const content = (
    <>
      <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border)] bg-black/42">
        {icon ? <AssetIcon src={icon} size={30} /> : null}
      </span>
      <span>
        <span className="block text-lg text-white">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-[var(--sb-muted)]">{copy}</span>
      </span>
      {onClick ? <ChevronRight className="ml-auto h-5 w-5 text-[var(--sb-gold)]" /> : null}
    </>
  );

  if (!onClick) {
    return <div className="grid grid-cols-[56px_1fr] items-center gap-4 rounded-[16px] border border-[var(--sb-border)] bg-black/34 p-4">{content}</div>;
  }

  return (
    <button type="button" onClick={onClick} className="grid grid-cols-[56px_1fr_auto] items-center gap-4 rounded-[16px] border border-[var(--sb-border)] bg-black/34 p-4 text-left transition hover:border-[var(--sb-gold)]">
      {content}
    </button>
  );
}

/** Draws the responsive status rail for confirmed, preparing, route, and delivery states. */
function TrackingTimeline({ order }: { order: OrderHistoryEntry }) {
  const stages = getTrackingStages(order);

  return (
    <section className="luxury-panel grid grid-cols-4 gap-1 p-4 md:p-6">
      {stages.map((stage, index) => (
        <div key={stage.label} className="relative text-center">
          {index > 0 ? <span className={`absolute right-1/2 top-7 h-px w-full ${stage.active ? "bg-[var(--sb-red-bright)]" : "bg-white/16"}`} /> : null}
          <span className={`relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-full border bg-black/72 ${stage.active ? "border-[var(--sb-red-bright)] shadow-[0_0_20px_var(--sb-red-glow)]" : "border-white/18"}`}>
            {stage.icon ? <AssetIcon src={stage.icon} size={28} /> : null}
          </span>
          <span className={`mt-3 block text-xs uppercase tracking-[0.08em] md:text-sm ${stage.active ? "text-[var(--sb-red-bright)]" : "text-[var(--sb-muted)]"}`}>{stage.label}</span>
          <span className="mt-1 block text-xs text-[var(--sb-muted)]">{stage.time}</span>
        </div>
      ))}
    </section>
  );
}

/** Shows one grouped item thumbnail inside the tracking order summary rail. */
function TrackingItemCard({ item, qty }: { item: SushiMenuItem; qty: number }) {
  return (
    <article className="relative w-[120px] shrink-0 overflow-hidden rounded-[14px] border border-[var(--sb-border)] bg-black/40">
      <div className="relative h-[92px]">
        <Image src={item.image.publicUrl} alt="" fill sizes="120px" className="object-cover" />
        <span className="absolute left-2 top-2 grid h-6 min-w-6 place-items-center rounded-full border border-[var(--sb-border)] bg-black/70 px-1 text-xs text-[var(--sb-gold)]">{qty}</span>
      </div>
      <p className="truncate px-3 py-2 text-sm text-white">{item.name}</p>
    </article>
  );
}
