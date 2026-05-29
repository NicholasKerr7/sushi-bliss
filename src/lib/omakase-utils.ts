import type { MenuCategory, SushiMenuItem } from "../data/menu";

export const omakaseMoods = ["Chef's Luxe", "Bright & Clean", "Fire & Crunch", "Plant Forward"] as const;

export type OmakaseMood = (typeof omakaseMoods)[number];

const moodCategoryMap: Record<OmakaseMood, MenuCategory[]> = {
  "Chef's Luxe": ["Chef Specials", "Premium", "Nigiri"],
  "Bright & Clean": ["Sashimi", "Classic", "Popular"],
  "Fire & Crunch": ["Hot", "Rolls", "Chef Specials"],
  "Plant Forward": ["Vegetarian", "Temaki", "Classic"],
};

export interface OmakaseSet {
  mood: OmakaseMood;
  items: SushiMenuItem[];
  total: number;
  description: string;
}

const moodDescriptions: Record<OmakaseMood, string> = {
  "Chef's Luxe": "Premium cuts, chef-only favorites, and high-impact finishing touches.",
  "Bright & Clean": "Citrus, lean fish, and clean textures for a lighter set.",
  "Fire & Crunch": "Torch heat, spice, and crisp textures with a bold finish.",
  "Plant Forward": "Fresh vegan-leaning bites with enough range for a full meal.",
};

/** Builds a deterministic chef-style set so the UI can recommend a premium bundle without random churn. */
export function buildOmakaseSet(
  items: SushiMenuItem[],
  mood: OmakaseMood,
  targetCount = 4
): OmakaseSet {
  const preferredCategories = moodCategoryMap[mood];
  const scoredItems = items
    .map((item) => ({
      item,
      score:
        item.categories.filter((category) => preferredCategories.includes(category)).length * 10 +
        item.rating +
        (item.categories.includes("Chef Specials") ? 1 : 0),
    }))
    .filter(({ score }) => score >= 10)
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price);

  const selectedItems = scoredItems.slice(0, targetCount).map(({ item }) => item);
  const total = selectedItems.reduce((sum, item) => sum + item.price, 0);

  return {
    mood,
    items: selectedItems,
    total,
    description: moodDescriptions[mood],
  };
}
