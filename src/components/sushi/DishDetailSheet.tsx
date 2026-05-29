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
        className="luxury-panel max-h-[92vh] w-full overflow-y-auto rounded-t-[34px] p-4 text-white shadow-[0_-20px_80px_rgba(0,0,0,0.7)] sm:max-w-3xl sm:rounded-[34px] sm:p-5"
      >
        <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-72 overflow-hidden rounded-[24px] border border-[var(--sb-border)] bg-black/30">
            <Image
              src={item.image.publicUrl}
              alt={item.name}
              fill
              sizes="(min-width: 768px) 360px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--sb-border)] bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--sb-gold)] backdrop-blur-xl">
                <Sparkles className="h-3 w-3" />
                {item.tag ?? "Chef"}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--sb-gold)]">Dish Profile</p>
                <h2 id="dish-detail-title" className="editorial-title mt-1 text-3xl leading-tight text-white">
                  {item.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">{item.chefNote}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dish details"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--sb-border)] bg-white/[0.03] text-[var(--sb-gold)] transition hover:border-[var(--sb-gold)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--sb-muted)]">Price</p>
                <p className="mt-1 text-lg font-semibold text-[var(--sb-gold)]">${item.price.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--sb-muted)]">Texture</p>
                <p className="mt-1 text-sm font-semibold">{item.texture}</p>
              </div>
              <div className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--sb-muted)]">Rating</p>
                <p className="mt-1 text-lg font-semibold">{item.rating.toFixed(1)} / 5</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--sb-gold)]">Ingredients</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--sb-border)] bg-white/[0.03] px-3 py-1 text-xs text-[var(--sb-muted)]"
                  >
                    <Leaf className="h-3 w-3 text-[var(--sb-gold)]" />
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-[var(--sb-border)] bg-black/35 p-4 text-sm text-[var(--sb-muted)]">
              <span className="font-semibold">Pairing:</span> {item.sakePairing.sakeName}
            </div>
            <Button
              className="red-glow-button mt-5 rounded-2xl py-3 text-base font-semibold"
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
