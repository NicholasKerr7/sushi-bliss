export interface AssetRef {
  filePath?: string;
  id?: string;
  publicUrl: string;
  role?: string;
  title?: string;
  experienceId?: string;
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

export interface OmakaseCourseItem {
  title: string;
  image: AssetRef;
}

export interface MasterChefOmakaseCourse {
  chefId: string;
  sequence: number;
  appetizer: OmakaseCourseItem;
  specialty: OmakaseCourseItem;
  dessert: OmakaseCourseItem;
}

export interface MasterChefsOmakaseExperience {
  id: string;
  title: string;
  description: string;
  assetFolders: {
    appetizers: string;
    specialties: string;
    desserts: string;
  };
  courses: MasterChefOmakaseCourse[];
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

export interface AppMemberContent {
  name: string;
  email: string;
  phone: string;
  tier: string;
  nextTier: string;
  points: number;
  pointsToNextTier: number;
  maxTierPoints: number;
  avatarChefId: string;
  address: string;
  deliveryAddress: string;
  dietary: string;
  marketingOptIn: boolean;
}

export interface AppLocationContent {
  label: string;
  city: string;
  country: string;
  street: string;
  postalLine: string;
  phone: string;
  email: string;
}

export interface AppHoursContent {
  days: string;
  service: string;
  lastOrder: string;
}

export interface AppReservationContent {
  weekday: string;
  day: string;
  month: string;
  time: string;
  guests: number;
  alternateGuests: number;
  table: string;
}

export interface AppRecentOrderContent {
  title: string;
  itemId: string;
  placedAtLabel: string;
  total: number;
  status: string;
}

export interface AppBenefitContent {
  id: string;
  title: string;
  copy: string;
  icon: string;
}

export interface AppContent {
  member: AppMemberContent;
  location: AppLocationContent;
  hours: AppHoursContent;
  reservation: AppReservationContent;
  recentOrder: AppRecentOrderContent;
  benefits: AppBenefitContent[];
}

export interface SushiData {
  brand: BrandData;
  appContent: AppContent;
  featuredAssets: FeaturedAssets;
  masterChefsOmakaseExperience: MasterChefsOmakaseExperience;
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
