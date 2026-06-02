import { buildReservationDays, occasionOptions, seatingOptions } from "../lib/reservation-utils";
import { loadSushiData } from "./loadSushiData";
import type {
  AssetRef,
  AssetManifestEntry,
  Chef,
  FilterCategory,
  MenuCategory,
  MenuItem,
  ReservationExperience,
  Reward,
  SakePairing,
} from "./types";

const data = loadSushiData();

/** Returns static brand metadata and logo assets from the normalized data set. */
export function getBrand() {
  return data.brand;
}

/** Returns shared app copy used across dashboard, profile, contact, and reservation cards. */
export function getAppContent() {
  return data.appContent;
}

/** Returns curated hero, ambience, sake, chef, and specialty asset groups. */
export function getFeaturedAssets() {
  return data.featuredAssets;
}

/** Returns the dedicated chef-course asset set for the Master Chefs Omakase Experience. */
export function getMasterChefsOmakaseExperience() {
  return data.masterChefsOmakaseExperience;
}

/** Finds all manifest assets in a package folder such as menu, icons, or ambience. */
export function getAssetsByFolder(folder: string): AssetManifestEntry[] {
  return data.assets.filter((asset) => asset.folder === folder);
}

/** Finds a single manifest asset by stable generated asset id. */
export function getAssetById(id: string): AssetManifestEntry | undefined {
  const matches = data.assets.filter((asset) => asset.id === id);
  return matches.find((asset) => asset.folder.includes("/")) ?? matches[0];
}

/** Returns all normalized menu items. */
export function getMenuItems(): MenuItem[] {
  return data.menu;
}

/** Returns the highest-value featured menu cards for home and recommendations. */
export function getFeaturedItems(limit = 8): MenuItem[] {
  return data.menu
    .filter((item) =>
      item.categories.some((category) => ["Chef Specials", "Premium", "Popular"].includes(category))
    )
    .slice(0, limit);
}

/** Filters menu items by visible category tab. */
export function getItemsByCategory(category: FilterCategory): MenuItem[] {
  if (category === "All") return getMenuItems();
  return data.menu.filter((item) => item.categories.includes(category));
}

/** Finds one normalized menu item by id. */
export function getItemById(id: string): MenuItem | undefined {
  return data.menu.find((item) => item.id === id);
}

/** Returns the sake pairing attached to a menu item id. */
export function getPairingByMenuItemId(id: string): SakePairing | undefined {
  return data.pairings.find((pairing) => pairing.menuItemId === id);
}

/** Returns every generated sake pairing from menu data. */
export function getPairings(): SakePairing[] {
  return data.pairings;
}

/** Returns all chef records from structured data. */
export function getChefs(): Chef[] {
  return data.chefs;
}

/** Finds a chef by id. */
export function getChefById(id: string): Chef | undefined {
  return data.chefs.find((chef) => chef.id === id);
}

/** Builds related menu recommendations around category and shared pairings. */
export function getRelatedItems(itemId: string, limit = 4): MenuItem[] {
  const source = getItemById(itemId);
  if (!source) return getFeaturedItems(limit);
  return data.menu
    .filter((item) => item.id !== source.id)
    .map((item) => ({
      item,
      score:
        item.categories.filter((category) => source.categories.includes(category)).length * 10 +
        (item.sakePairing.sakeSlug === source.sakePairing.sakeSlug ? 3 : 0) +
        item.rating,
    }))
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price)
    .slice(0, limit)
    .map(({ item }) => item);
}

/** Returns available reservation days, seating, occasions, and experience cards. */
export function getReservationOptions() {
  return {
    days: buildReservationDays(),
    seatingOptions,
    occasionOptions,
    experiences: getReservationExperiences(),
  };
}

/** Maps ambience assets into the reservation experiences shown in booking flows. */
export function getReservationExperiences(): ReservationExperience[] {
  const ambience = data.featuredAssets.ambience;
  const getImage = (index: number): AssetRef => ambience[index] ?? data.featuredAssets.heroSushi;
  const getExperienceImage = (experienceId: string, fallbackIndex: number): AssetRef =>
    ambience.find((asset) => asset.experienceId === experienceId) ?? getImage(fallbackIndex);
  return [
    {
      id: "main-dining-room",
      title: "Main Dining Room",
      description: "Lantern-lit tables with a calm view of the room.",
      image: getExperienceImage("main-dining-room", 0),
    },
    {
      id: "sushi-bar",
      title: "Sushi Bar",
      description: "A close view of knife work, plating, and service rhythm.",
      image: getExperienceImage("sushi-bar", 1),
    },
    {
      id: "chef-counter",
      title: "Chef's Counter",
      description: "An intimate omakase counter with direct chef pacing.",
      image: getExperienceImage("chef-counter", 2),
      premium: true,
    },
    {
      id: "lantern-terrace",
      title: "Outdoor Lantern Terrace",
      description: "Seasonal open-air seating under warm garden light.",
      image: getExperienceImage("lantern-terrace", 3),
    },
  ];
}

/** Builds loyalty reward cards from menu and sake assets. */
export function getRewards(): Reward[] {
  const byId = (id: string) => getItemById(id)?.image ?? data.featuredAssets.heroSushi;
  const misoSoupIcon = getAssetById("miso-soup-icon")?.publicUrl ?? "/assets/icons/miso-soup-icon.png";
  return [
    {
      id: "miso-soup",
      title: "Miso Soup",
      points: 500,
      description: "A warm opening bowl for your next visit.",
      image: { publicUrl: misoSoupIcon },
      value: "Complimentary",
    },
    {
      id: "spicy-tuna-roll",
      title: "Spicy Tuna Roll",
      points: 1000,
      description: "A guest-favorite roll redeemed at checkout.",
      image: byId("spicy-tuna-roll"),
      value: "Complimentary",
    },
    {
      id: "chef-omakase",
      title: "Chef's Omakase",
      points: 2000,
      description: "A rotating chef tasting reward.",
      image: byId("deluxe-toro-caviar-nigiri"),
      value: "$30 value",
    },
    {
      id: "premium-sake-pairing",
      title: "Premium Sake Pairing",
      points: 3500,
      description: "Curated pairing for two pieces.",
      image: data.featuredAssets.sakeSets[0] ?? data.featuredAssets.heroSushi,
      value: "Complimentary",
    },
  ];
}

/** Returns a representative item for category art and preview modules. */
export function getCategoryFeature(category: MenuCategory): MenuItem | undefined {
  return data.menu.find((item) => item.categories.includes(category));
}
