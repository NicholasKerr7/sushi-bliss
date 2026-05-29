export interface AssetRef {
  filePath?: string;
  publicUrl: string;
}

export const menuCategories = [
  "Nigiri",
  "Sashimi",
  "Rolls",
  "Gunkan",
  "Maki",
  "Temaki",
  "Chef Specials",
  "Vegetarian",
  "Appetizers",
  "Desserts",
  "Drinks",
  "Popular",
  "Premium",
  "Hot",
  "Classic",
] as const;

export const filterCategories = ["All", ...menuCategories] as const;

export type MenuCategory = (typeof menuCategories)[number];
export type FilterCategory = (typeof filterCategories)[number];

export interface TextureProfile {
  fatty?: number;
  tender?: number;
  umami?: number;
  crisp?: number;
  sweet?: number;
  smoky?: number;
  bright?: number;
}

export interface SakePairing {
  id: string;
  menuItemId: string;
  menuName: string;
  sakeName: string;
  sakeSlug: string;
  image: AssetRef;
  whyItWorks: string;
  flavorNotes: string[];
  serveTemperature: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: MenuCategory;
  categories: MenuCategory[];
  tags: string[];
  price: number;
  description: string;
  ingredients: string[];
  chefNote: string;
  texture: string;
  textureProfile: TextureProfile;
  image: AssetRef;
  ingredientImage?: AssetRef | null;
  sakePairing: SakePairing;
  tag?: string;
  rating: number;
  standaloneImageMissing?: boolean;
}

export type SushiMenuItem = MenuItem;

export interface Chef {
  id: string;
  name: string;
  position: string;
  appetizer: string;
  dessert: string;
  specialty: string;
  sashimi: string;
  sushi: string;
  about: string;
  standingImage: AssetRef;
  platingImage: AssetRef;
  profileImage?: AssetRef | null;
}

export interface BrandData {
  name: string;
  tagline: string;
  assets: {
    logo: AssetRef;
    icon: AssetRef;
    floralEmblem: AssetRef;
    secondaryMark: AssetRef;
  };
}

export interface FeaturedAssets {
  heroSushi: AssetRef;
  sakeSets: AssetRef[];
  ambience: AssetRef[];
  screensToRedesignFrom: unknown[];
}

export interface Reward {
  id: string;
  title: string;
  points: number;
  description: string;
  image: AssetRef;
  value: string;
}

export interface ReservationExperience {
  id: string;
  title: string;
  description: string;
  image: AssetRef;
  premium?: boolean;
}

export interface SushiData {
  brand: BrandData;
  featuredAssets: FeaturedAssets;
  menu: MenuItem[];
  chefs: Chef[];
  pairings: SakePairing[];
  assets: AssetManifestEntry[];
}

export interface AssetManifestEntry extends AssetRef {
  id: string;
  fileName: string;
  folder: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
}
