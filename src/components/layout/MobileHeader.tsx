import { Bell, ShoppingCart } from "lucide-react";
import type { BrandData } from "../../data/types";
import { AssetIcon } from "../icons/AssetIcon";

interface MobileHeaderProps {
  brand: BrandData;
  cartCount: number;
  iconUrls: {
    bell?: string;
    cart?: string;
  };
  onCartClick: () => void;
  onNotificationsClick: () => void;
}

/** Renders the compact mobile header for secondary app screens. */
export function MobileHeader({ brand, cartCount, iconUrls, onCartClick, onNotificationsClick }: MobileHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-3 xl:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AssetIcon src={brand.assets.icon.publicUrl} size={48} className="rounded-full" />
          <span className="editorial-title text-[17px] leading-[0.95] tracking-[0.32em] text-white">
            Sushi
            <br />
            Bliss
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCartClick}
            aria-label="Open cart"
            className="relative grid h-12 w-12 place-items-center rounded-full border border-[var(--sb-border)] bg-black/44 text-[var(--sb-gold)] backdrop-blur-xl"
          >
            {iconUrls.cart ? <AssetIcon src={iconUrls.cart} size={26} /> : <ShoppingCart className="h-5 w-5" />}
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--sb-red)] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={onNotificationsClick}
            aria-label="Notifications"
            className="relative grid h-12 w-12 place-items-center rounded-full border border-[var(--sb-border)] bg-black/44 text-[var(--sb-gold)] backdrop-blur-xl"
          >
            {iconUrls.bell ? <AssetIcon src={iconUrls.bell} size={25} /> : <Bell className="h-5 w-5" />}
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-[var(--sb-red-bright)]" />
          </button>
        </div>
      </div>
    </header>
  );
}
