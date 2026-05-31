import rawData from "../../public/assets/data/data.json";
import rawAssetManifest from "../../public/assets/data/asset-manifest.json";
import type {
  AssetRef,
  AppContent,
  BrandData,
  Chef,
  FeaturedAssets,
  MasterChefsOmakaseExperience,
  MenuCategory,
  MenuItem,
  SakePairing,
  SushiData,
  TextureProfile,
} from "./types";

interface RawAsset {
  filePath?: string;
  publicUrl?: string;
}

interface RawPairing {
  id: string;
  menuItemId: string;
  menuName: string;
  sakeName: string;
  sakeSlug: string;
  image: RawAsset;
}

interface RawMenuItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  price: number;
  description: string;
  ingredients: string;
  chefNote: string;
  texture: string;
  image: RawAsset | null;
  standaloneImageMissing?: boolean;
  pairingImageFallback?: RawAsset | null;
  ingredientImage?: RawAsset | null;
  sakePairing: RawPairing;
}

interface RawChef {
  id: string;
  name: string;
  position: string;
  appetizer: string;
  dessert: string;
  specialty: string;
  sashimi: string;
  sushi: string;
  about: string;
  standingImage: RawAsset;
  platingImage: RawAsset;
  profileImage?: RawAsset | null;
}

interface RawSushiData {
  brand: BrandData;
  appContent: AppContent;
  featuredAssets: FeaturedAssets;
  masterChefsOmakaseExperience: MasterChefsOmakaseExperience;
  menu: RawMenuItem[];
  chefs: RawChef[];
  pairings: RawPairing[];
}

const data = rawData as RawSushiData;

const categoryLabels: Record<string, MenuCategory> = {
  gunkan: "Gunkan",
  nigiri: "Nigiri",
  oshizushi: "Maki",
  rolls: "Rolls",
  sashimi: "Sashimi",
  sushi: "Nigiri",
  temaki: "Temaki",
  vegetarian: "Vegetarian",
};

const tagLabels: Record<string, MenuCategory> = {
  classic: "Classic",
  colorful: "Premium",
  crispy: "Hot",
  "chef-special": "Chef Specials",
  hot: "Hot",
  popular: "Popular",
  premium: "Premium",
  sashimi: "Sashimi",
  special: "Chef Specials",
  vegetarian: "Vegetarian",
};

const fallbackHero = "/assets/editorial/hero-otoro-nigiri-no-red-moon.webp";

/** Converts raw package asset records into safe public image references. */
function assetFrom(raw: RawAsset | null | undefined, fallback = fallbackHero): AssetRef {
  return {
    filePath: raw?.filePath,
    publicUrl: raw?.publicUrl ?? fallback,
  };
}

/** Removes duplicate category labels while preserving their source order. */
function uniqueCategories(categories: MenuCategory[]): MenuCategory[] {
  return Array.from(new Set(categories));
}

/** Splits comma-delimited ingredient text into display-ready ingredient labels. */
function normalizeIngredients(value: string): string[] {
  return value
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);
}

/** Chooses the most useful badge to show on menu cards. */
function getDisplayTag(tags: string[], categoryLabel: MenuCategory): string | undefined {
  if (tags.includes("chef-special") || tags.includes("special")) return "Chef's Special";
  if (tags.includes("premium")) return "Premium";
  if (tags.includes("hot")) return "Hot";
  if (tags.includes("popular")) return "Popular";
  if (tags.includes("vegetarian")) return "Vegetarian";
  if (tags.includes("classic")) return "Classic";
  return categoryLabel;
}

/** Derives a lightweight mock rating from source menu tags. */
function getRating(tags: string[]): number {
  if (tags.includes("chef-special")) return 5;
  if (tags.includes("premium")) return 4.9;
  if (tags.includes("popular")) return 4.8;
  if (tags.includes("special")) return 4.8;
  if (tags.includes("hot")) return 4.7;
  return 4.6;
}

/** Converts descriptive texture copy into numeric UI meter values. */
function textureProfile(texture: string, tags: string[]): TextureProfile {
  const words = texture.toLowerCase();
  return {
    fatty: words.includes("fatty") || words.includes("buttery") || words.includes("marbled") ? 92 : 48,
    tender: words.includes("tender") || words.includes("soft") || words.includes("silky") ? 88 : 58,
    umami: words.includes("umami") || words.includes("savory") || tags.includes("hot") ? 86 : 66,
    crisp: words.includes("crisp") || words.includes("fresh") || words.includes("snappy") ? 78 : 42,
    sweet: words.includes("sweet") || words.includes("creamy") ? 72 : 38,
    smoky: words.includes("smoky") || words.includes("seared") || words.includes("glazed") ? 84 : 32,
    bright: words.includes("bright") || words.includes("clean") || words.includes("fresh") ? 82 : 50,
  };
}

/** Generates consistent sake pairing copy from item tags and texture language. */
function pairingNarrative(item: RawMenuItem): Pick<SakePairing, "whyItWorks" | "flavorNotes" | "serveTemperature"> {
  const tags = item.tags;
  const texture = item.texture.toLowerCase();
  if (tags.includes("hot") || texture.includes("smoky")) {
    return {
      whyItWorks: `${item.sakePairing.sakeName} keeps the finish clean against smoke, glaze, and spice.`,
      flavorNotes: ["dry rice", "warm umami", "clean finish"],
      serveTemperature: "Slightly chilled",
    };
  }
  if (tags.includes("premium") || tags.includes("chef-special")) {
    return {
      whyItWorks: `${item.sakePairing.sakeName} adds polish and minerality without hiding the premium cut.`,
      flavorNotes: ["silky body", "stone fruit", "mineral lift"],
      serveTemperature: "Chilled",
    };
  }
  if (tags.includes("vegetarian")) {
    return {
      whyItWorks: `${item.sakePairing.sakeName} brightens the garden notes while staying soft on rice and nori.`,
      flavorNotes: ["fresh melon", "light grain", "gentle acidity"],
      serveTemperature: "Cool",
    };
  }
  return {
    whyItWorks: `${item.sakePairing.sakeName} balances the bite with clarity, acidity, and quiet umami.`,
    flavorNotes: ["clean rice", "subtle fruit", "soft umami"],
    serveTemperature: "Chilled",
  };
}

/** Normalizes raw sake pairing records and attaches generated narrative fields. */
function normalizePairing(item: RawMenuItem): SakePairing {
  return {
    ...item.sakePairing,
    image: assetFrom(item.sakePairing.image),
    ...pairingNarrative(item),
  };
}

/** Normalizes raw menu records into the single app-wide menu item shape. */
function normalizeMenuItem(item: RawMenuItem): MenuItem {
  const categoryLabel = categoryLabels[item.category] ?? "Chef Specials";
  const categories = uniqueCategories([
    categoryLabel,
    ...item.tags.map((tag) => tagLabels[tag]).filter((category): category is MenuCategory => Boolean(category)),
  ]);
  const image = assetFrom(item.image ?? item.pairingImageFallback ?? item.sakePairing.image);

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    categoryLabel,
    categories,
    tags: item.tags,
    price: item.price,
    description: item.description,
    ingredients: normalizeIngredients(item.ingredients),
    chefNote: item.chefNote,
    texture: item.texture,
    textureProfile: textureProfile(item.texture, item.tags),
    image,
    ingredientImage: item.ingredientImage ? assetFrom(item.ingredientImage) : null,
    sakePairing: normalizePairing(item),
    tag: getDisplayTag(item.tags, categoryLabel),
    rating: getRating(item.tags),
    standaloneImageMissing: Boolean(item.standaloneImageMissing),
  };
}

/** Normalizes chef image references while preserving chef metadata. */
function normalizeChef(chef: RawChef): Chef {
  return {
    ...chef,
    standingImage: assetFrom(chef.standingImage),
    platingImage: assetFrom(chef.platingImage),
    profileImage: chef.profileImage ? assetFrom(chef.profileImage) : null,
  };
}

const menu = data.menu.map(normalizeMenuItem);

/** Normalized Sushi Bliss data loaded once for client selectors. */
export const sushiData: SushiData = {
  brand: data.brand,
  appContent: data.appContent,
  featuredAssets: data.featuredAssets,
  masterChefsOmakaseExperience: data.masterChefsOmakaseExperience,
  menu,
  chefs: data.chefs.map(normalizeChef),
  pairings: menu.map((item) => item.sakePairing),
  assets: rawAssetManifest,
};

/** Returns the normalized static data object used by selectors. */
export function loadSushiData(): SushiData {
  return sushiData;
}
