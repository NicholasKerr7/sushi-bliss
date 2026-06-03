import type { FilterCategory, MenuCategory, SushiMenuItem } from "../data/menu";

export const defaultHighlightCategories: MenuCategory[] = ["Premium", "Chef Specials"];

/** Normalizes list limits so callers cannot request negative or fractional item counts. */
function normalizeLimit(limit: number): number {
  return Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
}

/** Filters menu items by free-text search and the active category tab. */
export function filterMenuItems(
  items: SushiMenuItem[],
  query: string,
  activeCategory: FilterCategory
): SushiMenuItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  return items.filter((item) => {
    const searchableText = [
      item.name,
      item.description,
      item.chefNote,
      item.sakePairing.sakeName,
      item.ingredients.join(" "),
      item.categories.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = searchableText.includes(normalizedQuery);
    const matchesCategory =
      activeCategory === "All" ? true : item.categories.includes(activeCategory);
    return matchesQuery && matchesCategory;
  });
}

/** Selects the premium cards used by high-visibility rails and recommendations. */
export function getHighlightDrops(
  items: SushiMenuItem[],
  highlightCategories: MenuCategory[] = defaultHighlightCategories,
  limit = 6
): SushiMenuItem[] {
  const safeLimit = normalizeLimit(limit);
  if (safeLimit === 0) return [];

  const categories = highlightCategories.length ? highlightCategories : defaultHighlightCategories;
  return items
    .filter((item) => item.categories.some((category) => categories.includes(category)))
    .slice(0, safeLimit);
}
