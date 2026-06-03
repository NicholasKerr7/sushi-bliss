import type { SushiMenuItem } from "../data/menu";

export const DEFAULT_TAX_RATE = 0.08875;
export const SUPPORTED_PROMO_CODES = ["welcome10", "freeroll"] as const;

export type SupportedPromoCode = (typeof SUPPORTED_PROMO_CODES)[number];

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

/** Normalizes user-entered promo codes before validation or totals are calculated. */
export function normalizePromoCode(promo: string | null | undefined): string {
  return promo?.trim().toLowerCase() ?? "";
}

/** Converts unsafe or negative numeric inputs into safe non-negative money values. */
function getSafeNumber(value: number | undefined, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

/** Checks whether a promo code is supported by checkout pricing. */
export function isSupportedPromoCode(promo: string | null | undefined): promo is SupportedPromoCode {
  return SUPPORTED_PROMO_CODES.includes(normalizePromoCode(promo) as SupportedPromoCode);
}

/** Applies supported promo codes to a cart subtotal. */
export function getPromoDiscount(subtotal: number, promo: string | null): number {
  const safeSubtotal = getSafeNumber(subtotal);
  const code = normalizePromoCode(promo);
  if (code === "welcome10") {
    return Math.min(safeSubtotal * 0.1, 10);
  }
  if (code === "freeroll") {
    return Math.min(6, safeSubtotal);
  }
  return 0;
}

/** Calculates subtotal, discounts, tax, tip, and grand total for checkout. */
export function calculateCartTotals({
  cart,
  appliedPromo,
  tipPercent,
  taxRate = DEFAULT_TAX_RATE,
}: CartTotalsInput): CartTotals {
  const subtotal = cart.reduce((sum, item) => sum + getSafeNumber(item?.price), 0);
  const promoDiscount = Math.min(getPromoDiscount(subtotal, appliedPromo), subtotal);
  const taxable = Math.max(0, subtotal - promoDiscount);
  const tax = taxable * getSafeNumber(taxRate, DEFAULT_TAX_RATE);
  const tip = taxable * (getSafeNumber(tipPercent) / 100);
  const grandTotal = taxable + tax + tip;
  return {
    subtotal,
    promoDiscount,
    tax,
    tip,
    grandTotal,
  };
}

/** Groups repeated cart entries into quantity rows for cart and receipts. */
export function groupCartItems(cart: SushiMenuItem[]): GroupedCartItem[] {
  const map = new Map<string, GroupedCartItem>();
  for (const item of cart) {
    const current = map.get(item.id);
    map.set(item.id, {
      item,
      qty: (current?.qty ?? 0) + 1,
    });
  }
  return Array.from(map.values());
}
