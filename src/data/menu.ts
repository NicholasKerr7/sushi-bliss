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
}

export const sushiMenuData: SushiMenuItem[] = [
  {
    id: 1,
    name: "Salmon Nigiri",
    price: 6.5,
    tag: "Signature",
    rating: 4.8,
    image: "/sushi/salmon-nigiri.jpg",
    categories: ["Signature", "Popular", "Chef"],
    description: "Ora King salmon brushed with yuzu soy and warm rice.",
  },
  {
    id: 2,
    name: "Tuna Roll",
    price: 8.0,
    tag: "Popular",
    rating: 4.6,
    image: "/sushi/tuna-roll.jpg",
    categories: ["Classic", "Popular"],
    description: "Lean bluefin, avocado, and crispy shallots rolled tight.",
  },
  {
    id: 3,
    name: "Dragon Roll",
    price: 12.0,
    tag: "Hot",
    rating: 4.9,
    image: "/sushi/dragon-roll.jpg",
    categories: ["Signature", "Hot", "Premium"],
    description: "Tempura shrimp, spicy mayo, and charred eel glaze.",
  },
  {
    id: 4,
    name: "Avocado Roll",
    price: 7.0,
    tag: "Vegan",
    rating: 4.2,
    image: "/sushi/avocado-roll.jpg",
    categories: ["Vegan", "Classic"],
    description: "Creamy avocado, pickled radish, and toasted sesame.",
  },
  {
    id: 5,
    name: "Rainbow Roll",
    price: 12.5,
    tag: "Popular",
    rating: 4.7,
    image: "/sushi/rainbow-roll.jpg",
    categories: ["Signature", "Popular", "Premium"],
    description: "Layered sashimi, citrus ponzu, and tobiko crunch.",
  },
  {
    id: 6,
    name: "Spicy Tuna Roll",
    price: 9.0,
    tag: "Hot",
    rating: 4.7,
    image: "/sushi/spicy-tuna.jpg",
    categories: ["Hot", "Classic"],
    description: "Gochujang-dressed tuna with chili threads and crunch.",
  },
  {
    id: 7,
    name: "Toro Nigiri",
    price: 8.5,
    tag: "Signature",
    rating: 4.9,
    image: "/sushi/toro-nigiri.jpg",
    categories: ["Signature", "Popular", "Premium", "Chef"],
    description: "Bluefin toro brushed with soy and finished with sudachi zest.",
  },
  {
    id: 8,
    name: "Hamachi Jalapeño",
    price: 11.0,
    tag: "Hot",
    rating: 4.8,
    image: "/sushi/hamachi-jalapeno.jpg",
    categories: ["Classic", "Hot", "Chef"],
    description: "Yellowtail sashimi, ponzu gel, and charred jalapeño coins.",
  },
  {
    id: 9,
    name: "Shrimp Tempura Roll",
    price: 10.5,
    tag: "Popular",
    rating: 4.6,
    image: "/sushi/shrimp-tempura-roll.jpg",
    categories: ["Classic", "Popular"],
    description: "Crispy tempura shrimp, avocado, and sweet soy lacquer.",
  },
  {
    id: 10,
    name: "Scallop Truffle Nigiri",
    price: 9.5,
    tag: "Signature",
    rating: 4.9,
    image: "/sushi/scallop-truffle.jpg",
    categories: ["Signature", "Hot", "Premium", "Chef"],
    description: "Hokkaido scallop torched with black truffle butter and sea salt.",
  },
  {
    id: 11,
    name: "Crispy Rice Spicy Tuna",
    price: 12.0,
    tag: "Hot",
    rating: 4.7,
    image: "/sushi/crispy-rice.jpg",
    categories: ["Hot", "Popular", "Chef"],
    description: "Crisped sushi rice bricks topped with spicy tuna and chive oil.",
  },
  {
    id: 12,
    name: "Garden Maki",
    price: 8.0,
    tag: "Vegan",
    rating: 4.4,
    image: "/sushi/garden-maki.jpg",
    categories: ["Vegan", "Classic"],
    description: "Shiso, cucumber, pickled carrot, and yuzu vegan mayo.",
  },
];

export const heroImagesData = [
  "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1600&q=60",
  "https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&w=1600&q=60",
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=60",
];
