import type { SushiMenuItem } from "../data/menu";

export type FulfillmentType = "Pickup" | "Delivery";

const DEFAULT_SERVICE_FEE = 2.5;
const DEFAULT_DELIVERY_FEE = 4;
const MONEY_EPSILON = 0.01;

export interface OrderHistoryEntry {
  id: number;
  confirmationCode: string;
  items: SushiMenuItem[];
  subtotal: number;
  promoDiscount: number;
  tax: number;
  tip: number;
  serviceFee?: number;
  deliveryFee?: number;
  total: number;
  method: string;
  type: FulfillmentType;
  ts: number;
  placedAt: number;
  etaMinutes: number;
  fulfillmentTime: number;
  deliveryAddress: string;
  customerName: string;
}

export interface BuildOrderSummaryInput {
  id: number;
  items: SushiMenuItem[];
  subtotal: number;
  promoDiscount: number;
  tax: number;
  tip: number;
  serviceFee?: number;
  deliveryFee?: number;
  total: number;
  method: string;
  type: FulfillmentType;
  placedAt: number;
  deliveryAddress?: string;
  customerName?: string;
}

interface RawOrder {
  id?: unknown;
  confirmationCode?: unknown;
  items?: unknown;
  subtotal?: unknown;
  promoDiscount?: unknown;
  tax?: unknown;
  tip?: unknown;
  serviceFee?: unknown;
  deliveryFee?: unknown;
  total?: unknown;
  method?: unknown;
  type?: unknown;
  ts?: unknown;
  placedAt?: unknown;
  etaMinutes?: unknown;
  fulfillmentTime?: unknown;
  deliveryAddress?: unknown;
  customerName?: unknown;
}

/** Checks whether a localStorage value can be treated as an order-like object. */
function isRawOrder(value: unknown): value is RawOrder {
  return typeof value === "object" && value !== null;
}

/** Reads a string value from unknown persisted data with a fallback. */
function getStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Reads a finite number from unknown persisted data with a fallback. */
function getNumberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Reads a finite non-negative currency value from unknown persisted data with a fallback. */
function getMoneyValue(value: unknown, fallback = 0): number {
  return Math.max(0, getNumberValue(value, fallback));
}

/** Normalizes unknown persisted fulfillment values into supported options. */
function getFulfillmentType(value: unknown): FulfillmentType {
  return value === "Delivery" ? "Delivery" : "Pickup";
}

/** Validates enough menu item shape to safely display a hydrated order. */
function isSushiMenuItem(value: unknown): value is SushiMenuItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<SushiMenuItem>;
  return typeof item.id === "string" && typeof item.name === "string" && typeof item.price === "number";
}

/** Recalculates an order subtotal from item rows when old entries lack one. */
function getOrderSubtotal(items: SushiMenuItem[]): number {
  return items.reduce((sum, item) => sum + Math.max(0, item.price ?? 0), 0);
}

/** Returns true when two currency values can be treated as equivalent after rounding. */
function moneyEquals(left: number, right: number): boolean {
  return Math.abs(left - right) <= MONEY_EPSILON;
}

/** Separates tax from fees when an older caller still passes all checkout fees through the tax field. */
function resolveCheckoutCharges(input: BuildOrderSummaryInput): Pick<OrderHistoryEntry, "tax" | "serviceFee" | "deliveryFee"> {
  const tax = getMoneyValue(input.tax);
  const explicitServiceFee = input.serviceFee === undefined ? undefined : getMoneyValue(input.serviceFee);
  const explicitDeliveryFee = input.deliveryFee === undefined ? undefined : getMoneyValue(input.deliveryFee);
  if (explicitServiceFee !== undefined || explicitDeliveryFee !== undefined) {
    return {
      tax,
      serviceFee: explicitServiceFee ?? 0,
      deliveryFee: explicitDeliveryFee ?? 0,
    };
  }

  const expectedServiceFee = input.items.length > 0 ? DEFAULT_SERVICE_FEE : 0;
  const expectedDeliveryFee = input.type === "Delivery" && input.items.length > 0 ? DEFAULT_DELIVERY_FEE : 0;
  const expectedFees = expectedServiceFee + expectedDeliveryFee;
  if (expectedFees <= 0 || tax < expectedFees) {
    return { tax, serviceFee: 0, deliveryFee: 0 };
  }

  const subtotal = getMoneyValue(input.subtotal);
  const promoDiscount = Math.min(getMoneyValue(input.promoDiscount), subtotal);
  const tip = getMoneyValue(input.tip);
  const total = getMoneyValue(input.total);
  const taxableSubtotal = Math.max(0, subtotal - promoDiscount);
  const chargesFromTotal = total - taxableSubtotal - tip;
  const appearsFoldedIntoTax = moneyEquals(chargesFromTotal, tax);
  if (!appearsFoldedIntoTax) {
    return { tax, serviceFee: 0, deliveryFee: 0 };
  }

  return {
    tax: Math.max(0, tax - expectedFees),
    serviceFee: expectedServiceFee,
    deliveryFee: expectedDeliveryFee,
  };
}

/** Creates a short customer-facing order confirmation code. */
export function createOrderCode(id: number): string {
  return `SB-${String(id).slice(-6).padStart(6, "0")}`;
}

/** Estimates fulfillment time from order type and item count. */
export function getOrderEtaMinutes(type: FulfillmentType, itemCount: number): number {
  const baseMinutes = type === "Delivery" ? 32 : 18;
  return baseMinutes + Math.min(Math.max(0, itemCount), 8) * 2;
}

/** Builds the persisted order summary after checkout succeeds. */
export function buildOrderSummary(input: BuildOrderSummaryInput): OrderHistoryEntry {
  const etaMinutes = getOrderEtaMinutes(input.type, input.items.length);
  const charges = resolveCheckoutCharges(input);
  const subtotal = getMoneyValue(input.subtotal);

  return {
    id: input.id,
    confirmationCode: createOrderCode(input.id),
    items: input.items,
    subtotal,
    promoDiscount: Math.min(getMoneyValue(input.promoDiscount), subtotal),
    tax: charges.tax,
    tip: getMoneyValue(input.tip),
    serviceFee: charges.serviceFee,
    deliveryFee: charges.deliveryFee,
    total: getMoneyValue(input.total, subtotal),
    method: input.method,
    type: input.type,
    ts: input.placedAt,
    placedAt: input.placedAt,
    etaMinutes,
    fulfillmentTime: input.placedAt + etaMinutes * 60 * 1000,
    deliveryAddress: input.deliveryAddress ?? "",
    customerName: input.customerName?.trim() || "Guest",
  };
}

/** Converts older saved order entries into the richer order-confirmation shape used by the current UI. */
export function hydrateOrders(rawOrders: unknown): OrderHistoryEntry[] {
  if (!Array.isArray(rawOrders)) return [];

  return rawOrders
    .filter(isRawOrder)
    .map((rawOrder, index) => {
      const id = getNumberValue(rawOrder.id, Date.now() + index);
      const type = getFulfillmentType(rawOrder.type);
      const items = Array.isArray(rawOrder.items) ? rawOrder.items.filter(isSushiMenuItem) : [];
      const placedAt = getNumberValue(rawOrder.placedAt, getNumberValue(rawOrder.ts, id));
      const subtotal = getMoneyValue(rawOrder.subtotal, getOrderSubtotal(items));
      const etaMinutes = getNumberValue(rawOrder.etaMinutes, getOrderEtaMinutes(type, items.length));

      return {
        id,
        confirmationCode: getStringValue(rawOrder.confirmationCode, createOrderCode(id)),
        items,
        subtotal,
        promoDiscount: Math.min(getMoneyValue(rawOrder.promoDiscount), subtotal),
        tax: getMoneyValue(rawOrder.tax),
        tip: getMoneyValue(rawOrder.tip),
        serviceFee: getMoneyValue(rawOrder.serviceFee),
        deliveryFee: getMoneyValue(rawOrder.deliveryFee),
        total: getMoneyValue(rawOrder.total, subtotal),
        method: getStringValue(rawOrder.method, "Card"),
        type,
        ts: placedAt,
        placedAt,
        etaMinutes,
        fulfillmentTime: getNumberValue(rawOrder.fulfillmentTime, placedAt + etaMinutes * 60 * 1000),
        deliveryAddress: getStringValue(rawOrder.deliveryAddress),
        customerName: getStringValue(rawOrder.customerName, "Guest"),
      };
    });
}
