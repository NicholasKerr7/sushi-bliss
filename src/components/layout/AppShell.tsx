import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";
import type { AppView, NavItem } from "./types";
import type { BrandData } from "../../data/types";

interface AppShellProps {
  brand: BrandData;
  activeView: AppView;
  cartCount: number;
  iconUrls: {
    bell?: string;
    cart?: string;
    menu?: string;
  };
  navItems: NavItem[];
  mobileNavItems: NavItem[];
  profileName: string;
  profileImage: string;
  children: ReactNode;
  onNavigate: (view: AppView) => void;
  onCartClick: () => void;
}

/** Wraps every app view with the shared cinematic background and navigation chrome. */
export function AppShell({
  brand,
  activeView,
  cartCount,
  iconUrls,
  navItems,
  mobileNavItems,
  profileName,
  profileImage,
  children,
  onNavigate,
  onCartClick,
}: AppShellProps) {
  return (
    <div className="stone-gradient relative isolate min-h-screen overflow-x-hidden text-[var(--sb-text)]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#050505_0%,#080705_46%,#040404_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(202,164,93,0.1)_1px,transparent_0)] bg-[length:96px_96px] opacity-24" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgba(184,20,20,0.16)] to-transparent" />
      </div>
      <DesktopHeader
        brand={brand}
        navItems={navItems}
        activeView={activeView}
        cartCount={cartCount}
        iconUrls={iconUrls}
        profileName={profileName}
        profileImage={profileImage}
        onNavigate={onNavigate}
        onCartClick={onCartClick}
      />
      {activeView === "home" ? null : <MobileHeader brand={brand} cartCount={cartCount} iconUrls={iconUrls} onCartClick={onCartClick} />}
      {children}
      <BottomNav items={mobileNavItems} activeView={activeView} floating={activeView !== "home"} onNavigate={onNavigate} />
    </div>
  );
}
