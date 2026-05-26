import Image from "next/image";
import type { MouseEvent } from "react";
import { Check, Info, ShoppingCart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import type { SushiMenuItem } from "../../data/menu";

interface MenuItemCardProps {
  item: SushiMenuItem;
  quantity: number;
  justAdded: boolean;
  onAddToCart: (item: SushiMenuItem, origin: DOMRect | null) => void;
  onDecreaseQuantity: (id: number) => void;
  onIncreaseQuantity: (id: number) => void;
  onViewDetails: (item: SushiMenuItem) => void;
}

/** Renders one premium menu tile with ordering controls and enough detail to make the dish feel considered. */
export function MenuItemCard({
  item,
  quantity,
  justAdded,
  onAddToCart,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onViewDetails,
}: MenuItemCardProps) {
  const handleAddClick = (event: MouseEvent<HTMLButtonElement>) => {
    onAddToCart(item, event.currentTarget.getBoundingClientRect());
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="group relative overflow-hidden rounded-[28px] border border-white/15 bg-white/5 text-white backdrop-blur-2xl premium-edge">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-rose-500/10" />
        </div>
        {item.tag && (
          <span className="pointer-events-none absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.3em]">
            <Sparkles className="h-3 w-3" />
            {item.tag}
          </span>
        )}
        <div className="relative z-0 mx-5 mt-5 h-52 overflow-hidden rounded-[22px] border border-white/15 bg-black/30">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
            className="pointer-events-none object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 text-xs text-white/80">
            <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 backdrop-blur-xl">
              {item.texture}
            </span>
            <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 font-semibold backdrop-blur-xl">
              {item.rating.toFixed(1)} / 5
            </span>
          </div>
        </div>
        <CardContent className="relative z-10 flex flex-col gap-4 p-6 text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-white/50">Chef Selection</p>
              <h3 className="text-xl font-semibold">{item.name}</h3>
            </div>
            <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold">
              ${item.price.toFixed(2)}
            </span>
          </div>
          <p className="text-sm leading-6 text-white/70">{item.description}</p>
          <div className="flex flex-wrap gap-2">
            {item.ingredients.slice(0, 3).map((ingredient) => (
              <span
                key={ingredient}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60"
              >
                {ingredient}
              </span>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/70">
            <span className="font-semibold text-white/85">Pairs with:</span> {item.pairing}
          </div>
          <div className="flex items-center justify-between text-sm text-white/80">
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition hover:border-white/35 hover:bg-white/10"
            >
              <Info className="h-4 w-4" />
              Details
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Decrease ${item.name} quantity`}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/5 text-lg text-white transition hover:bg-white/10 active:scale-95"
                onClick={() => onDecreaseQuantity(item.id)}
              >
                -
              </button>
              <span className="min-w-[2ch] text-base font-semibold">{quantity}</span>
              <button
                type="button"
                aria-label={`Increase ${item.name} quantity`}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/5 text-lg text-white transition hover:bg-white/10 active:scale-95"
                onClick={() => onIncreaseQuantity(item.id)}
              >
                +
              </button>
            </div>
          </div>
          <Button
            className="group relative mt-1 w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 py-3 text-base font-semibold text-white shadow-glow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={handleAddClick}
            disabled={justAdded}
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
            <span className="relative inline-flex items-center justify-center gap-2">
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Add {quantity} to Cart
                </>
              )}
            </span>
          </Button>
        </CardContent>
      </Card>
    </motion.article>
  );
}
