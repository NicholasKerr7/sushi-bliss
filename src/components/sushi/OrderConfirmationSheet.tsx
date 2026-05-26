import { CheckCircle2, Clock3, MapPin, ReceiptText, ShoppingBag, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { groupCartItems } from "../../lib/cart-utils";
import type { OrderHistoryEntry } from "../../lib/order-utils";

interface OrderConfirmationSheetProps {
  order: OrderHistoryEntry;
  onClose: () => void;
  onViewHistory: () => void;
}

function formatClockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

/** Shows the post-payment receipt, ETA, and next actions so checkout ends with confidence. */
export function OrderConfirmationSheet({ order, onClose, onViewHistory }: OrderConfirmationSheetProps) {
  const groupedItems = groupCartItems(order.items);
  const fulfillmentLabel = order.type === "Delivery" ? "Arrives around" : "Ready around";
  const fulfillmentDetail =
    order.type === "Delivery"
      ? order.deliveryAddress || "Delivery address saved to your profile"
      : "Sushi Bliss counter pickup";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end bg-black/75 backdrop-blur-sm sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-confirmation-title"
    >
      <motion.section
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 36, opacity: 0 }}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[34px] border border-white/15 bg-brand-midnight/95 p-4 text-white shadow-[0_-20px_80px_rgba(0,0,0,0.7)] sm:max-w-3xl sm:rounded-[34px] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-50">
              <CheckCircle2 className="h-4 w-4" />
              Order Confirmed
            </div>
            <h2 id="order-confirmation-title" className="mt-4 text-3xl font-semibold leading-tight">
              {order.confirmationCode}
            </h2>
            <p className="mt-2 text-sm text-white/65">
              Paid with {order.method} for {order.customerName}. We sent this order to the kitchen.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order confirmation"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              <Clock3 className="h-4 w-4" />
              {fulfillmentLabel}
            </p>
            <p className="mt-2 text-2xl font-semibold">{formatClockTime(order.fulfillmentTime)}</p>
            <p className="mt-1 text-xs text-white/55">{order.etaMinutes} min estimate</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              <ShoppingBag className="h-4 w-4" />
              Method
            </p>
            <p className="mt-2 text-lg font-semibold">{order.type}</p>
            <p className="mt-1 text-xs text-white/55">{fulfillmentDetail}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              <ReceiptText className="h-4 w-4" />
              Total
            </p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(order.total)}</p>
            <p className="mt-1 text-xs text-white/55">{groupedItems.length} unique items</p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.34em] text-white/50">Kitchen Timeline</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {["Received", "Preparing", order.type === "Delivery" ? "Packed" : "Ready", order.type].map((stage, index) => (
              <div key={stage} className="rounded-2xl border border-white/10 bg-black/15 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-rose-300 text-brand-ink">
                  {index + 1}
                </span>
                <p className="mt-3 text-sm font-semibold">{stage}</p>
                <p className="mt-1 text-xs text-white/55">
                  {index === 0 ? "Kitchen has it" : index === 1 ? "Chef starts next" : index === 2 ? fulfillmentLabel : "Guest handoff"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.34em] text-white/50">Receipt</p>
            <div className="mt-3 space-y-2">
              {groupedItems.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-white/55">Qty {qty}</p>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.price * qty)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.34em] text-white/50">Breakdown</p>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <span>Promo</span>
                  <span>- {formatCurrency(order.promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              {order.tip > 0 && (
                <div className="flex justify-between">
                  <span>Tip</span>
                  <span>{formatCurrency(order.tip)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold text-white">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-3 text-sm text-white/70">
              <p className="flex items-center gap-2 font-semibold text-white">
                <MapPin className="h-4 w-4" />
                Handoff
              </p>
              <p className="mt-1">{fulfillmentDetail}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1 rounded-2xl border-0 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 py-3 text-base font-semibold text-white shadow-glow"
            onClick={onClose}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Keep Browsing
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-2xl border-white/20 bg-white/5 py-3 text-base font-semibold text-white hover:bg-white/10"
            onClick={onViewHistory}
          >
            View Order History
          </Button>
        </div>
      </motion.section>
    </motion.div>
  );
}
