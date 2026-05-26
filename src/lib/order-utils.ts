import type { SushiMenuItem } from "../data/menu";

export type FulfillmentType = "Pickup" | "Delivery";

export interface OrderHistoryEntry {
  id: number;
  confirmationCode: string;
  items: SushiMenuItem[];
  subtotal: number;
  promoDiscount: number;
  tax: number;
  tip: number;
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

function isRawOrder(value: unknown): value is RawOrder {
  return typeof value === "object" && value !== null;
}

function getStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getNumberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getFulfillmentType(value: unknown): FulfillmentType {
  return value === "Delivery" ? "Delivery" : "Pickup";
}

function isSushiMenuItem(value: unknown): value is SushiMenuItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<SushiMenuItem>;
  return typeof item.id === "number" && typeof item.name === "string" && typeof item.price === "number";
}

function getOrderSubtotal(items: SushiMenuItem[]): number {
  return items.reduce((sum, item) => sum + (item.price ?? 0), 0);
}

export function createOrderCode(id: number): string {
  return `SB-${String(id).slice(-6).padStart(6, "0")}`;
}

export function getOrderEtaMinutes(type: FulfillmentType, itemCount: number): number {
  const baseMinutes = type === "Delivery" ? 32 : 18;
  return baseMinutes + Math.min(itemCount, 8) * 2;
}

export function buildOrderSummary(input: BuildOrderSummaryInput): OrderHistoryEntry {
  const etaMinutes = getOrderEtaMinutes(input.type, input.items.length);
  return {
    id: input.id,
    confirmationCode: createOrderCode(input.id),
    items: input.items,
    subtotal: input.subtotal,
    promoDiscount: input.promoDiscount,
    tax: input.tax,
    tip: input.tip,
    total: input.total,
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
      const subtotal = getNumberValue(rawOrder.subtotal, getOrderSubtotal(items));
      const etaMinutes = getNumberValue(rawOrder.etaMinutes, getOrderEtaMinutes(type, items.length));

      return {
        id,
        confirmationCode: getStringValue(rawOrder.confirmationCode, createOrderCode(id)),
        items,
        subtotal,
        promoDiscount: getNumberValue(rawOrder.promoDiscount, 0),
        tax: getNumberValue(rawOrder.tax, 0),
        tip: getNumberValue(rawOrder.tip, 0),
        total: getNumberValue(rawOrder.total, subtotal),
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
