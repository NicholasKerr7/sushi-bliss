import { describe, expect, it } from "vitest";
import { sushiMenuData } from "../data/menu";
import { buildOmakaseSet } from "../lib/omakase-utils";

describe("buildOmakaseSet", () => {
  it("returns a deterministic chef set for the selected mood", () => {
    const set = buildOmakaseSet(sushiMenuData, "Chef's Luxe", 3);

    expect(set.mood).toBe("Chef's Luxe");
    expect(set.items).toHaveLength(3);
    expect(set.items.every((item) => item.categories.some((category) => ["Chef", "Premium", "Signature"].includes(category)))).toBe(true);
    expect(set.total).toBeGreaterThan(0);
  });

  it("honors the target count when enough dishes match", () => {
    const set = buildOmakaseSet(sushiMenuData, "Fire & Crunch", 2);

    expect(set.items).toHaveLength(2);
  });
});
