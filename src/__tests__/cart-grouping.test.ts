import { describe, expect, it } from "vitest";
import { sushiMenuData } from "../data/menu";
import { groupCartItems } from "../lib/cart-utils";

describe("groupCartItems", () => {
  it("combines identical items and tracks quantity", () => {
    const cart = [sushiMenuData[0], sushiMenuData[1], sushiMenuData[0]];
    const grouped = groupCartItems(cart);
    expect(grouped).toHaveLength(2);
    const salmon = grouped.find((entry) => entry.item.id === sushiMenuData[0].id);
    expect(salmon?.qty).toBe(2);
    const tuna = grouped.find((entry) => entry.item.id === sushiMenuData[1].id);
    expect(tuna?.qty).toBe(1);
  });

  it("returns empty array for empty cart", () => {
    expect(groupCartItems([])).toEqual([]);
  });
});
