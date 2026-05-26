import { describe, expect, it } from "vitest";
import { sushiMenuData } from "../data/menu";
import { buildOrderSummary, createOrderCode, getOrderEtaMinutes } from "../lib/order-utils";

describe("order utilities", () => {
  it("builds a confirmation-ready pickup order", () => {
    const order = buildOrderSummary({
      id: 123456,
      items: [sushiMenuData[0], sushiMenuData[1]],
      subtotal: 14.5,
      promoDiscount: 1.45,
      tax: 1.16,
      tip: 2,
      total: 16.21,
      method: "Credit Card",
      type: "Pickup",
      placedAt: 1_800_000,
      customerName: "Nick",
    });

    expect(order.confirmationCode).toBe("SB-123456");
    expect(order.fulfillmentTime).toBe(order.placedAt + order.etaMinutes * 60 * 1000);
    expect(order.customerName).toBe("Nick");
  });

  it("uses a longer ETA for delivery than pickup", () => {
    expect(getOrderEtaMinutes("Delivery", 3)).toBeGreaterThan(getOrderEtaMinutes("Pickup", 3));
  });

  it("formats short order ids with leading zeros", () => {
    expect(createOrderCode(42)).toBe("SB-000042");
  });
});
