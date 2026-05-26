import { describe, expect, it } from "vitest";
import { sushiMenuData } from "../data/menu";
import { defaultHighlightCategories, filterMenuItems, getHighlightDrops } from "../lib/menu-utils";
import type { FilterCategory } from "../data/menu";

describe("filterMenuItems", () => {
  it("matches query regardless of case", () => {
    const result = filterMenuItems(sushiMenuData, "salMon nigiri", "All");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Salmon Nigiri");
  });

  it("filters by category when not All", () => {
    const result = filterMenuItems(sushiMenuData, "", "Vegan");
    expect(result.every((item) => item.categories.includes("Vegan"))).toBe(true);
  });

  it("combines query and category filters", () => {
    const result = filterMenuItems(sushiMenuData, "roll", "Popular" as FilterCategory);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.name.toLowerCase().includes("roll"))).toBe(true);
    expect(result.every((item) => item.categories.includes("Popular"))).toBe(true);
  });
});

describe("getHighlightDrops", () => {
  it("returns only items belonging to highlight categories", () => {
    const drops = getHighlightDrops(sushiMenuData, defaultHighlightCategories);
    expect(drops.length).toBeGreaterThan(0);
    expect(drops.every((item) => item.categories.some((category) => defaultHighlightCategories.includes(category)))).toBe(
      true
    );
  });

  it("respects the limit argument", () => {
    const drops = getHighlightDrops(sushiMenuData, defaultHighlightCategories, 2);
    expect(drops).toHaveLength(2);
  });
});
