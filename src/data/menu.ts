export const menuCategories = [
  "Signature",
  "Classic",
  "Vegan",
  "Hot",
  "Popular",
  "Premium",
  "Chef",
] as const;

export const filterCategories = ["All", ...menuCategories] as const;

export type MenuCategory = (typeof menuCategories)[number];
export type FilterCategory = (typeof filterCategories)[number];

export interface SushiMenuItem {
  id: number;
  name: string;
  price: number;
  tag?: string;
  rating: number;
  image: string;
  categories: MenuCategory[];
  description: string;
  ingredients: string[];
  chefNote: string;
  pairing: string;
  texture: string;
}

const sushiImages = {
  salmonNigiri: "https://images.unsplash.com/photo-1744360515510-db7bf0f6def8?auto=format&fit=crop&w=1200&q=80",
  nigiriBoard: "https://images.unsplash.com/photo-1575872058841-955be84be5e7?auto=format&fit=crop&w=1200&q=80",
  singleNigiri: "https://images.unsplash.com/photo-1691442574585-010aea07f722?auto=format&fit=crop&w=1200&q=80",
  rollPlate: "https://images.unsplash.com/photo-1752095809329-5addd009f71d?auto=format&fit=crop&w=1200&q=80",
  dragonRoll: "https://images.unsplash.com/photo-1761315413078-1fd73894fe0e?auto=format&fit=crop&w=1200&q=80",
  platter: "https://images.unsplash.com/photo-1736885978380-8d7d9f7d7880?auto=format&fit=crop&w=1200&q=80",
  gardenRolls: "https://images.unsplash.com/photo-1550749388-736d06e9c497?auto=format&fit=crop&w=1200&q=80",
  sushiMaking: "https://images.unsplash.com/photo-1562158147-f8d6fbcd76f8?auto=format&fit=crop&w=1200&q=80",
};

export const sushiMenuData: SushiMenuItem[] = [
  {
    id: 1,
    name: "Salmon Nigiri",
    price: 6.5,
    tag: "Signature",
    rating: 4.8,
    image: sushiImages.salmonNigiri,
    categories: ["Signature", "Popular", "Chef"],
    description: "Ora King salmon brushed with yuzu soy and warm rice.",
    ingredients: ["Ora King salmon", "Yuzu soy", "Warm koshihikari rice", "Sudachi zest"],
    chefNote: "Best eaten in one bite while the rice is still warm.",
    pairing: "Junmai ginjo or sparkling yuzu tea",
    texture: "Silky, citrus-bright",
  },
  {
    id: 2,
    name: "Tuna Roll",
    price: 8.0,
    tag: "Popular",
    rating: 4.6,
    image: sushiImages.rollPlate,
    categories: ["Classic", "Popular"],
    description: "Lean bluefin, avocado, and crispy shallots rolled tight.",
    ingredients: ["Bluefin tuna", "Avocado", "Crispy shallot", "Nori"],
    chefNote: "A clean classic with a little crunch for contrast.",
    pairing: "Cold green tea",
    texture: "Lean, crisp, clean",
  },
  {
    id: 3,
    name: "Dragon Roll",
    price: 12.0,
    tag: "Hot",
    rating: 4.9,
    image: sushiImages.dragonRoll,
    categories: ["Signature", "Hot", "Premium"],
    description: "Tempura shrimp, spicy mayo, and charred eel glaze.",
    ingredients: ["Tempura shrimp", "Avocado", "Spicy mayo", "Charred eel glaze"],
    chefNote: "Torch-finished so the glaze lands smoky, not sweet.",
    pairing: "Dry sake or ginger lime soda",
    texture: "Crisp, creamy, smoky",
  },
  {
    id: 4,
    name: "Avocado Roll",
    price: 7.0,
    tag: "Vegan",
    rating: 4.2,
    image: sushiImages.gardenRolls,
    categories: ["Vegan", "Classic"],
    description: "Creamy avocado, pickled radish, and toasted sesame.",
    ingredients: ["Avocado", "Pickled radish", "Sesame", "Seasoned rice"],
    chefNote: "Built simple so the avocado reads rich and clean.",
    pairing: "Jasmine iced tea",
    texture: "Creamy, bright, nutty",
  },
  {
    id: 5,
    name: "Rainbow Roll",
    price: 12.5,
    tag: "Popular",
    rating: 4.7,
    image: sushiImages.platter,
    categories: ["Signature", "Popular", "Premium"],
    description: "Layered sashimi, citrus ponzu, and tobiko crunch.",
    ingredients: ["Tuna", "Salmon", "Hamachi", "Citrus ponzu", "Tobiko"],
    chefNote: "The house showpiece when you want range in one roll.",
    pairing: "Crisp lager or cucumber soda",
    texture: "Layered, juicy, popping",
  },
  {
    id: 6,
    name: "Spicy Tuna Roll",
    price: 9.0,
    tag: "Hot",
    rating: 4.7,
    image: sushiImages.rollPlate,
    categories: ["Hot", "Classic"],
    description: "Gochujang-dressed tuna with chili threads and crunch.",
    ingredients: ["Tuna", "Gochujang", "Chili threads", "Tempura crunch"],
    chefNote: "Balanced heat first, lingering spice second.",
    pairing: "Yuzu lager",
    texture: "Spicy, plush, crunchy",
  },
  {
    id: 7,
    name: "Toro Nigiri",
    price: 8.5,
    tag: "Signature",
    rating: 4.9,
    image: sushiImages.nigiriBoard,
    categories: ["Signature", "Popular", "Premium", "Chef"],
    description: "Bluefin toro brushed with soy and finished with sudachi zest.",
    ingredients: ["Bluefin toro", "Aged soy", "Sudachi", "Warm rice"],
    chefNote: "Let it rest on the tongue before the rice separates.",
    pairing: "Daiginjo sake",
    texture: "Buttery, rich, clean",
  },
  {
    id: 8,
    name: "Hamachi Jalapeño",
    price: 11.0,
    tag: "Hot",
    rating: 4.8,
    image: sushiImages.singleNigiri,
    categories: ["Classic", "Hot", "Chef"],
    description: "Yellowtail sashimi, ponzu gel, and charred jalapeño coins.",
    ingredients: ["Hamachi", "Ponzu gel", "Charred jalapeno", "Micro cilantro"],
    chefNote: "A chilled bite with a sharp pepper finish.",
    pairing: "Mineral sake or lime soda",
    texture: "Cool, sharp, supple",
  },
  {
    id: 9,
    name: "Shrimp Tempura Roll",
    price: 10.5,
    tag: "Popular",
    rating: 4.6,
    image: sushiImages.dragonRoll,
    categories: ["Classic", "Popular"],
    description: "Crispy tempura shrimp, avocado, and sweet soy lacquer.",
    ingredients: ["Tempura shrimp", "Avocado", "Sweet soy", "Sesame"],
    chefNote: "The comfort roll: hot crunch against cool avocado.",
    pairing: "Roasted barley tea",
    texture: "Crispy, creamy, savory",
  },
  {
    id: 10,
    name: "Scallop Truffle Nigiri",
    price: 9.5,
    tag: "Signature",
    rating: 4.9,
    image: sushiImages.nigiriBoard,
    categories: ["Signature", "Hot", "Premium", "Chef"],
    description: "Hokkaido scallop torched with black truffle butter and sea salt.",
    ingredients: ["Hokkaido scallop", "Truffle butter", "Sea salt", "Chive oil"],
    chefNote: "Light torching unlocks sweetness without losing the scallop snap.",
    pairing: "Champagne or sparkling mineral water",
    texture: "Sweet, tender, aromatic",
  },
  {
    id: 11,
    name: "Crispy Rice Spicy Tuna",
    price: 12.0,
    tag: "Hot",
    rating: 4.7,
    image: sushiImages.sushiMaking,
    categories: ["Hot", "Popular", "Chef"],
    description: "Crisped sushi rice bricks topped with spicy tuna and chive oil.",
    ingredients: ["Crispy rice", "Spicy tuna", "Chive oil", "Togarashi"],
    chefNote: "Eat immediately while the rice edges are still crackling.",
    pairing: "Highball",
    texture: "Crackly, spicy, lush",
  },
  {
    id: 12,
    name: "Garden Maki",
    price: 8.0,
    tag: "Vegan",
    rating: 4.4,
    image: sushiImages.gardenRolls,
    categories: ["Vegan", "Classic"],
    description: "Shiso, cucumber, pickled carrot, and yuzu vegan mayo.",
    ingredients: ["Shiso", "Cucumber", "Pickled carrot", "Yuzu vegan mayo"],
    chefNote: "Designed to taste fresh rather than like a substitution.",
    pairing: "Cold sencha",
    texture: "Garden-fresh, crisp, aromatic",
  },
];

export const heroImagesData = [
  sushiImages.platter,
  "/sushi/salmon-nigiri.jpg",
  sushiImages.nigiriBoard,
];
