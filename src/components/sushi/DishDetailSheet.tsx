import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf, ShoppingCart, Sparkles, X } from "lucide-react";
import { Button } from "../ui/button";
import type { SushiMenuItem } from "../../data/menu";

interface DishDetailSheetProps {
  item: SushiMenuItem;
  onClose: () => void;
  onAddToCart: (item: SushiMenuItem, origin: DOMRect | null) => void;
}

/** Presents the premium dish story and ordering action without forcing users into checkout. */
export function DishDetailSheet({ item, onClose, onAddToCart }: DishDetailSheetProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[65] flex items-end bg-black/70 backdrop-blur-sm sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-detail-title"
    >
      <motion.section
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 36, opacity: 0 }}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[34px] border border-white/15 bg-brand-midnight/95 p-4 text-white shadow-[0_-20px_80px_rgba(0,0,0,0.7)] sm:max-w-3xl sm:rounded-[34px] sm:p-5"
      >
        <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-72 overflow-hidden rounded-[28px] border border-white/15 bg-black/30">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(min-width: 768px) 360px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] backdrop-blur-xl">
                <Sparkles className="h-3 w-3" />
                {item.tag ?? "Chef"}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.36em] text-white/50">Dish Profile</p>
                <h2 id="dish-detail-title" className="mt-1 text-3xl font-semibold leading-tight">
                  {item.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/70">{item.chefNote}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dish details"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Price</p>
                <p className="mt-1 text-lg font-semibold">${item.price.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Texture</p>
                <p className="mt-1 text-sm font-semibold">{item.texture}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Rating</p>
                <p className="mt-1 text-lg font-semibold">{item.rating.toFixed(1)} / 5</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.34em] text-white/50">Ingredients</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75"
                  >
                    <Leaf className="h-3 w-3 text-emerald-200" />
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
              <span className="font-semibold">Pairing:</span> {item.pairing}
            </div>
            <Button
              className="mt-5 rounded-2xl border-0 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 py-3 text-base font-semibold text-white shadow-glow"
              onClick={() => onAddToCart(item, null)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
