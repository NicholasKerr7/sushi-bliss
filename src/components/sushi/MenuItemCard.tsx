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
  onDecreaseQuantity: (id: string) => void;
  onIncreaseQuantity: (id: string) => void;
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
      <Card className="luxury-panel group relative overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-[rgba(202,164,93,0.06)]" />
        </div>
        {item.tag && (
          <span className="pointer-events-none absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-[var(--sb-border)] bg-black/55 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--sb-gold)]">
            <Sparkles className="h-3 w-3" />
            {item.tag}
          </span>
        )}
        <div className="relative z-0 mx-5 mt-5 h-52 overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/30">
          <Image
            src={item.image.publicUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
            className="pointer-events-none object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 text-xs text-white/80">
            <span className="rounded-full border border-[var(--sb-border)] bg-black/45 px-3 py-1 backdrop-blur-xl">
              {item.texture}
            </span>
            <span className="rounded-full border border-[var(--sb-border)] bg-black/45 px-3 py-1 font-semibold text-[var(--sb-gold)] backdrop-blur-xl">
              {item.rating.toFixed(1)} / 5
            </span>
          </div>
        </div>
        <CardContent className="relative z-10 flex flex-col gap-4 p-6 text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--sb-gold)]">Chef Selection</p>
              <h3 className="font-serif text-xl font-semibold">{item.name}</h3>
            </div>
            <span className="shrink-0 rounded-full border border-[var(--sb-border)] bg-black/35 px-3 py-1 text-sm font-semibold text-[var(--sb-gold)]">
              ${item.price.toFixed(2)}
            </span>
          </div>
          <p className="text-sm leading-6 text-[var(--sb-muted)]">{item.description}</p>
          <div className="flex flex-wrap gap-2">
            {item.ingredients.slice(0, 3).map((ingredient) => (
              <span
                key={ingredient}
                className="rounded-full border border-[var(--sb-border)] bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sb-muted)]"
              >
                {ingredient}
              </span>
            ))}
          </div>
          <div className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-3 text-xs text-[var(--sb-muted)]">
            <span className="font-semibold text-white">Pairs with:</span> {item.sakePairing.sakeName}
          </div>
          <div className="flex items-center justify-between text-sm text-white/80">
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--sb-border)] bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sb-gold)] transition hover:border-[var(--sb-gold)]"
            >
              <Info className="h-4 w-4" />
              Details
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Decrease ${item.name} quantity`}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border)] bg-white/[0.03] text-lg text-white transition hover:border-[var(--sb-gold)] active:scale-95"
                onClick={() => onDecreaseQuantity(item.id)}
              >
                -
              </button>
              <span className="min-w-[2ch] text-base font-semibold">{quantity}</span>
              <button
                type="button"
                aria-label={`Increase ${item.name} quantity`}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border)] bg-white/[0.03] text-lg text-white transition hover:border-[var(--sb-gold)] active:scale-95"
                onClick={() => onIncreaseQuantity(item.id)}
              >
                +
              </button>
            </div>
          </div>
          <Button
            className="red-glow-button group relative mt-1 w-full overflow-hidden rounded-2xl py-3 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
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
