import type { FilterCategory, MenuCategory, SushiMenuItem } from "../data/menu";

export const defaultHighlightCategories: MenuCategory[] = ["Premium", "Chef Specials"];

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
  return items
    .filter((item) => item.categories.some((category) => highlightCategories.includes(category)))
    .slice(0, limit);
}
