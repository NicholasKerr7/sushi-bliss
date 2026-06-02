import Image from "next/image";
import { Check, ChevronRight, Clock3, ReceiptText, RotateCcw, ShoppingBag } from "lucide-react";
import { getAppContent, getFeaturedAssets } from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import type { SushiMenuItem } from "../../data/menu";
import { groupCartItems } from "../../lib/cart-utils";
import { formatClockTime, formatCurrency } from "../../lib/format-utils";
import type { OrderHistoryEntry } from "../../lib/order-utils";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";

interface OrderConfirmationViewProps {
  order: OrderHistoryEntry | null;
  onNavigate: (view: AppView) => void;
  onReorder: (items: SushiMenuItem[]) => void;
}

interface ConfirmationStage {
  label: string;
  copy: string;
  active: boolean;
}

const appContent = getAppContent();
const featuredAssets = getFeaturedAssets();
const iconAssets = getSushiIconAssets();

/** Renders the dedicated post-checkout confirmation page from the final screenshot set. */
export function OrderConfirmationView({ order, onNavigate, onReorder }: OrderConfirmationViewProps) {
  if (!order) {
    return <OrderConfirmationEmptyState onNavigate={onNavigate} />;
  }

  const groupedItems = groupCartItems(order.items);
  const heroItem = order.items[0];
  const heroImage = heroItem?.image.publicUrl ?? featuredAssets.heroSushi.publicUrl;
  const rewardPoints = Math.max(0, Math.round(order.total * 10));
  const handoffLabel = order.type === "Delivery" ? "Estimated Delivery" : "Estimated Ready";

  return (
    <section className="mx-auto w-full max-w-[1540px] space-y-5 pt-4 md:pt-2">
      <header className="luxury-panel relative min-h-[260px] overflow-hidden p-5 md:min-h-[340px] md:p-8 xl:p-10">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover opacity-48" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94),rgba(0,0,0,0.66),rgba(0,0,0,0.28))]" />
        <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_340px] md:items-center xl:grid-cols-[1fr_430px]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--sb-border-strong)] bg-black/52 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[var(--sb-gold)]">
              {iconAssets.check ? <AssetIcon src={iconAssets.check} size={18} /> : <Check className="h-4 w-4" />}
              Order Confirmed
            </span>
            <h1 className="editorial-title mt-5 text-[44px] uppercase leading-none text-white md:text-[68px]">
              Thank You
              <span className="block text-[var(--sb-red-bright)]">{order.confirmationCode}</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--sb-gold)] md:text-lg">
              Your order has been sent to the kitchen. We will keep the timing, quality check, and handoff details ready for you.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button className="red-glow-button h-12 rounded-[14px] px-6 uppercase tracking-[0.14em]" onClick={() => onNavigate("orderTracking")}>
                Track Order
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-12 rounded-[14px] border-[var(--sb-border)] bg-black/38 px-6 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => onNavigate("orders")}>
                View Orders
              </Button>
            </div>
          </div>
          <aside className="rounded-[18px] border border-[var(--sb-border)] bg-black/58 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{handoffLabel}</p>
            <p className="mt-2 text-4xl text-white">{formatClockTime(order.fulfillmentTime)}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">
              {order.type === "Delivery" ? order.deliveryAddress || appContent.member.deliveryAddress : "Sushi Bliss counter pickup"}
            </p>
            <div className="gold-divider my-5" />
            <p className="text-sm text-[var(--sb-muted)]">Paid with <span className="text-white">{order.method}</span></p>
            <p className="mt-2 text-sm text-[var(--sb-muted)]">Rewards earned <span className="text-[var(--sb-gold)]">{rewardPoints.toLocaleString()} pts</span></p>
          </aside>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <section className="luxury-panel p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <SectionTitle icon={iconAssets.orders} title="Kitchen Timeline" />
              <span className="rounded-full border border-[var(--sb-border)] bg-black/38 px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--sb-gold)]">
                {order.type}
              </span>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {getConfirmationStages(order).map((stage, index) => (
                <ConfirmationStageCard key={stage.label} index={index + 1} stage={stage} />
              ))}
            </div>
          </section>

          <section className="luxury-panel p-5 md:p-6">
            <SectionTitle icon={iconAssets.menu} title="Items Ordered" />
            <div className="mt-5 divide-y divide-[var(--sb-border)] overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/34">
              {groupedItems.map(({ item, qty }) => (
                <article key={item.id} className="grid grid-cols-[86px_1fr_auto] items-center gap-4 p-4">
                  <div className="relative h-20 overflow-hidden rounded-[12px] border border-[var(--sb-border)] bg-black/40">
                    <Image src={item.image.publicUrl} alt="" fill sizes="86px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg text-white">{item.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--sb-muted)]">{item.description}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--sb-gold)]">Qty {qty}</p>
                  </div>
                  <span className="text-lg text-[var(--sb-gold)]">{formatCurrency(item.price * qty)}</span>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="luxury-panel p-5 md:p-6">
            <SectionTitle icon={iconAssets.creditCard} title="Payment Summary" />
            <div className="mt-5 space-y-3 text-sm text-[var(--sb-muted)]">
              <SummaryLine label="Subtotal" value={formatCurrency(order.subtotal)} />
              {order.promoDiscount > 0 ? <SummaryLine label="Promo" value={`- ${formatCurrency(order.promoDiscount)}`} /> : null}
              <SummaryLine label="Tax and fees" value={formatCurrency(order.tax)} />
              {order.tip > 0 ? <SummaryLine label="Tip" value={formatCurrency(order.tip)} /> : null}
              <div className="gold-divider" />
              <SummaryLine label="Total Paid" value={formatCurrency(order.total)} strong />
            </div>
          </section>

          <section className="luxury-panel p-5 md:p-6">
            <SectionTitle icon={iconAssets.loyalty} title="Member Rewards" />
            <p className="mt-4 text-4xl text-[var(--sb-gold)]">{rewardPoints.toLocaleString()} pts</p>
            <p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">
              Points were added to your Bliss Member account. Keep earning toward exclusive omakase rewards.
            </p>
            <Button variant="outline" className="mt-5 h-12 w-full rounded-[14px] border-[var(--sb-border)] bg-black/26 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => onNavigate("loyalty")}>
              View Rewards
            </Button>
          </section>

          <section className="luxury-panel p-5 md:p-6">
            <SectionTitle icon={iconAssets.cart} title="Next Action" />
            <div className="mt-5 grid gap-3">
              <Button className="red-glow-button h-12 rounded-[14px] uppercase tracking-[0.14em]" onClick={() => onNavigate("orderTracking")}>
                <Clock3 className="mr-2 h-4 w-4" />
                Track Order
              </Button>
              <Button variant="outline" className="h-12 rounded-[14px] border-[var(--sb-border)] bg-black/26 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => onReorder(order.items)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reorder
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

/** Shows a safe empty state when the confirmation route is opened without an order. */
function OrderConfirmationEmptyState({ onNavigate }: Pick<OrderConfirmationViewProps, "onNavigate">) {
  return (
    <section className="luxury-panel mx-auto mt-10 max-w-xl p-6 text-center">
      <ReceiptText className="mx-auto h-10 w-10 text-[var(--sb-gold)]" />
      <h1 className="editorial-title mt-4 text-4xl text-white">No Confirmed Order</h1>
      <p className="mt-3 text-[var(--sb-muted)]">Place an order and the confirmation receipt will appear here.</p>
      <Button className="red-glow-button mt-6 h-12 rounded-[14px] px-6 uppercase tracking-[0.14em]" onClick={() => onNavigate("orderOnline")}>
        Order Now
      </Button>
    </section>
  );
}

/** Creates the four progress states shown on the order confirmation receipt. */
function getConfirmationStages(order: OrderHistoryEntry): ConfirmationStage[] {
  return [
    { label: "Order Received", copy: `Confirmed at ${formatClockTime(order.placedAt)}`, active: true },
    { label: "Chef Preparing", copy: "Knife work and warm courses begin next.", active: true },
    { label: "Quality Check", copy: "The team reviews packaging and presentation.", active: true },
    { label: order.type === "Delivery" ? "Out for Delivery" : "Ready for Pickup", copy: `Estimated ${formatClockTime(order.fulfillmentTime)}`, active: false },
  ];
}

/** Renders one stage in the confirmation timeline. */
function ConfirmationStageCard({ index, stage }: { index: number; stage: ConfirmationStage }) {
  return (
    <article className={`rounded-[16px] border p-4 ${stage.active ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/18" : "border-[var(--sb-border)] bg-black/34"}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-full border ${stage.active ? "border-[var(--sb-red-bright)] text-[var(--sb-red-bright)]" : "border-[var(--sb-border)] text-[var(--sb-gold)]"}`}>
        {index}
      </span>
      <h2 className="mt-4 text-lg text-white">{stage.label}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">{stage.copy}</p>
    </article>
  );
}

/** Renders a small icon-led section heading used across confirmation panels. */
function SectionTitle({ icon, title }: { icon?: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] bg-black/36">
        {icon ? <AssetIcon src={icon} size={24} /> : <ShoppingBag className="h-4 w-4 text-[var(--sb-gold)]" />}
      </span>
      <h2 className="editorial-title text-xl text-white">{title}</h2>
    </div>
  );
}

/** Displays one payment summary line with optional emphasis for final totals. */
function SummaryLine({ label, strong = false, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-lg text-white" : ""}`}>
      <span>{label}</span>
      <span className={strong ? "text-[var(--sb-gold)]" : "text-white"}>{value}</span>
    </div>
  );
}
