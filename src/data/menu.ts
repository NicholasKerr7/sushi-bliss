import { getFeaturedAssets, getMenuItems } from "./selectors";

export {
  filterCategories,
  menuCategories,
  type FilterCategory,
  type MenuCategory,
  type SushiMenuItem,
} from "./types";
export { getFeaturedAssets, getMenuItems, getPairings } from "./selectors";
export const sushiMenuData = getMenuItems();
export const heroImagesData = [
  getFeaturedAssets().heroSushi.publicUrl,
  ...getFeaturedAssets().ambience.slice(0, 2).map((asset) => asset.publicUrl),
];
