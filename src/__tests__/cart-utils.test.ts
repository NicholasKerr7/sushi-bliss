import { describe, expect, it } from "vitest";
import { sushiMenuData } from "../data/menu";
import { calculateCartTotals, DEFAULT_TAX_RATE } from "../lib/cart-utils";

const sampleCart = [sushiMenuData[0], sushiMenuData[1]]; // salmon + tuna

function round(value: number) {
  return Number(value.toFixed(2));
}

describe("calculateCartTotals", () => {
  it("computes totals without promo", () => {
    const totals = calculateCartTotals({ cart: sampleCart, appliedPromo: null, tipPercent: 20, taxRate: 0.1 });
    const expectedSubtotal = sushiMenuData[0].price + sushiMenuData[1].price;
    expect(round(totals.subtotal)).toBe(round(expectedSubtotal));
    const taxable = expectedSubtotal;
    expect(round(totals.tax)).toBe(round(taxable * 0.1));
    expect(round(totals.tip)).toBe(round(taxable * 0.2));
    expect(round(totals.grandTotal)).toBe(round(taxable * 1.3));
  });

  it("applies WELCOME10 promo", () => {
    const totals = calculateCartTotals({ cart: sampleCart, appliedPromo: "WELCOME10", tipPercent: 0, taxRate: 0 });
    const subtotal = sushiMenuData[0].price + sushiMenuData[1].price;
    const expectedDiscount = Math.min(subtotal * 0.1, 10);
    expect(round(totals.promoDiscount)).toBe(round(expectedDiscount));
    expect(round(totals.grandTotal)).toBe(round(subtotal - expectedDiscount));
  });

  it("applies FREEROLL promo with cap", () => {
    const totals = calculateCartTotals({ cart: [sushiMenuData[0]], appliedPromo: "freeroll", tipPercent: 0, taxRate: 0 });
    const subtotal = sushiMenuData[0].price;
    const expectedDiscount = Math.min(6, subtotal);
    expect(round(totals.promoDiscount)).toBe(round(expectedDiscount));
    expect(round(totals.grandTotal)).toBe(round(Math.max(0, subtotal - expectedDiscount)));
  });

  it("uses default tax rate when none provided", () => {
    const totals = calculateCartTotals({ cart: sampleCart, appliedPromo: null, tipPercent: 0 });
    const subtotal = sushiMenuData[0].price + sushiMenuData[1].price;
    expect(round(totals.tax)).toBe(round(subtotal * DEFAULT_TAX_RATE));
  });
});
