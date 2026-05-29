import Image from "next/image";
import { Bell, ChevronDown, ShoppingCart } from "lucide-react";
import type { AppView, NavItem } from "./types";
import type { BrandData } from "../../data/types";
import { AssetIcon } from "../icons/AssetIcon";

interface DesktopHeaderProps {
  brand: BrandData;
  navItems: NavItem[];
  activeView: AppView;
  cartCount: number;
  iconUrls: {
    bell?: string;
    cart?: string;
  };
  profileName: string;
  profileImage: string;
  onNavigate: (view: AppView) => void;
  onCartClick: () => void;
}

/** Renders the glass desktop navigation bar from the reference dashboard. */
export function DesktopHeader({
  brand,
  navItems,
  activeView,
  cartCount,
  iconUrls,
  profileName,
  profileImage,
  onNavigate,
  onCartClick,
}: DesktopHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 hidden px-6 pt-5 lg:block">
      <div className="luxury-panel mx-auto flex h-[76px] w-full max-w-[1680px] items-center gap-8 rounded-[26px] px-6">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex min-w-[180px] items-center gap-3 text-left text-white transition hover:text-[var(--sb-gold)]"
        >
          <Image src={brand.assets.icon.publicUrl} alt="" width={44} height={44} className="rounded-full" />
          <span className="editorial-title text-lg leading-[0.95] tracking-[0.34em]">
            Sushi
            <br />
            Bliss
          </span>
        </button>
        <nav className="flex flex-1 items-center justify-center gap-1">
          {navItems.map((item) => {
            const targetView = item.target ?? item.key;
            const isActive = activeView === targetView;
            return (
              <button
                key={item.id ?? `${item.key}-${item.label}`}
                type="button"
                onClick={() => onNavigate(targetView)}
                className={`relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
                  isActive ? "text-[var(--sb-red-bright)]" : "text-white/78 hover:text-[var(--sb-gold)]"
                }`}
              >
                {item.label}
                {isActive ? (
                  <span className="absolute inset-x-4 -bottom-1 h-px bg-[var(--sb-red-bright)] shadow-[0_0_18px_var(--sb-red-glow)]" />
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCartClick}
            aria-label="Open cart"
            className="relative grid h-11 w-11 place-items-center rounded-2xl border border-[var(--sb-border)] bg-white/[0.04] text-[var(--sb-gold)] transition hover:border-[var(--sb-gold)] hover:bg-white/[0.08]"
          >
            {iconUrls.cart ? <AssetIcon src={iconUrls.cart} size={25} /> : <ShoppingCart className="h-5 w-5" />}
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--sb-red)] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
          aria-label="Notifications"
          className="relative grid h-11 w-11 place-items-center rounded-2xl border border-[var(--sb-border)] bg-white/[0.04] text-[var(--sb-gold)]"
        >
            {iconUrls.bell ? <AssetIcon src={iconUrls.bell} size={24} /> : <Bell className="h-5 w-5" />}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--sb-red-bright)]" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="flex items-center gap-3 rounded-2xl border border-[var(--sb-border)] bg-white/[0.04] px-3 py-2 text-left transition hover:border-[var(--sb-gold)]"
          >
            <Image src={profileImage} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            <span className="hidden xl:block">
              <span className="block text-sm font-semibold text-white">{profileName}</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[var(--sb-muted)]">Bliss member</span>
            </span>
            <ChevronDown className="h-4 w-4 text-[var(--sb-gold)]" />
          </button>
        </div>
      </div>
    </header>
  );
}
