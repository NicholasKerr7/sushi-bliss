import type { FilterCategory, MenuCategory, SushiMenuItem } from "../data/menu";

export const defaultHighlightCategories: MenuCategory[] = ["Premium", "Chef"];

export function filterMenuItems(
  items: SushiMenuItem[],
  query: string,
  activeCategory: FilterCategory
): SushiMenuItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(normalizedQuery);
    const matchesCategory =
      activeCategory === "All" ? true : item.categories.includes(activeCategory);
    return matchesQuery && matchesCategory;
  });
}

export function getHighlightDrops(
  items: SushiMenuItem[],
  highlightCategories: MenuCategory[] = defaultHighlightCategories,
  limit = 6
): SushiMenuItem[] {
  return items
    .filter((item) => item.categories.some((category) => highlightCategories.includes(category)))
    .slice(0, limit);
}
