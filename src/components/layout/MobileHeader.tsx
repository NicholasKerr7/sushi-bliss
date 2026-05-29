import Image from "next/image";
import { Bell, Menu, ShoppingCart } from "lucide-react";
import type { BrandData } from "../../data/types";
import { AssetIcon } from "../icons/AssetIcon";

interface MobileHeaderProps {
  brand: BrandData;
  cartCount: number;
  iconUrls: {
    bell?: string;
    cart?: string;
    menu?: string;
  };
  onCartClick: () => void;
}

/** Renders the compact mobile header for secondary app screens. */
export function MobileHeader({ brand, cartCount, iconUrls, onCartClick }: MobileHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-3 lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src={brand.assets.icon.publicUrl} alt="" width={40} height={40} className="rounded-full" />
          <span className="editorial-title text-sm leading-[0.95] tracking-[0.32em] text-white">
            Sushi
            <br />
            Bliss
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] bg-black/40 text-[var(--sb-gold)] backdrop-blur-xl"
          >
            {iconUrls.bell ? <AssetIcon src={iconUrls.bell} size={21} /> : <Bell className="h-4 w-4" />}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--sb-red-bright)]" />
          </button>
          <button
            type="button"
            onClick={onCartClick}
            aria-label="Open cart"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] bg-black/40 text-[var(--sb-gold)] backdrop-blur-xl"
          >
            {iconUrls.cart ? <AssetIcon src={iconUrls.cart} size={22} /> : <ShoppingCart className="h-4 w-4" />}
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--sb-red)] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] bg-black/40 text-[var(--sb-gold)] backdrop-blur-xl"
          >
            {iconUrls.menu ? <AssetIcon src={iconUrls.menu} size={21} /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
