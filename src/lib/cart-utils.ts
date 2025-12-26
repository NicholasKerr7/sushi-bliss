import type { SushiMenuItem } from "../data/menu";

export const DEFAULT_TAX_RATE = 0.08875;

export interface CartTotalsInput {
  cart: SushiMenuItem[];
  appliedPromo: string | null;
  tipPercent: number;
  taxRate?: number;
}

export interface CartTotals {
  subtotal: number;
  promoDiscount: number;
  tax: number;
  tip: number;
  grandTotal: number;
}

export interface GroupedCartItem {
  item: SushiMenuItem;
  qty: number;
}

function getPromoDiscount(subtotal: number, promo: string | null): number {
  if (!promo) return 0;
  const code = promo.toLowerCase();
  if (code === "welcome10") {
    return Math.min(subtotal * 0.1, 10);
  }
  if (code === "freeroll") {
    return Math.min(6, subtotal);
  }
  return 0;
}

export function calculateCartTotals({
  cart,
  appliedPromo,
  tipPercent,
  taxRate = DEFAULT_TAX_RATE,
}: CartTotalsInput): CartTotals {
  const subtotal = cart.reduce((sum, item) => sum + (item?.price ?? 0), 0);
  const promoDiscount = getPromoDiscount(subtotal, appliedPromo);
  const taxable = Math.max(0, subtotal - promoDiscount);
  const tax = taxable * taxRate;
  const tip = taxable * (tipPercent / 100);
  const grandTotal = taxable + tax + tip;
  return {
    subtotal,
    promoDiscount,
    tax,
    tip,
    grandTotal,
  };
}

export function groupCartItems(cart: SushiMenuItem[]): GroupedCartItem[] {
  const map = new Map<number, GroupedCartItem>();
  for (const item of cart) {
    const current = map.get(item.id);
    map.set(item.id, {
      item,
      qty: (current?.qty ?? 0) + 1,
    });
  }
  return Array.from(map.values());
}
