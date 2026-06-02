import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";
import type { FilterCategory, SushiMenuItem } from "../../data/menu";
import { getSushiIconAssets } from "../../data/icon-assets";
import { getAppContent, getBrand, getFeaturedAssets, getItemById, getReservationExperiences } from "../../data/selectors";
import { formatCurrency } from "../../lib/format-utils";
import type { Reservation } from "../../lib/reservation-utils";

interface HomeViewProps {
  activeCategory: FilterCategory;
  featuredItems: SushiMenuItem[];
  loyaltyPoints: number;
  query: string;
  reservations: Reservation[];
  onAddToCart: (item: SushiMenuItem) => void;
  onCategoryChange: (category: FilterCategory) => void;
  onNavigate: (view: AppView) => void;
  onQueryChange: (query: string) => void;
  onSelectItem: (item: SushiMenuItem) => void;
}

const brand = getBrand();
const featuredAssets = getFeaturedAssets();
const reservationExperiences = getReservationExperiences();
const appContent = getAppContent();
const icons = getSushiIconAssets();

const categoryTabs: Array<{ category: FilterCategory; icon?: string; label: string }> = [
  { category: "Nigiri", icon: icons.nigiri, label: "Nigiri" },
  { category: "Rolls", icon: icons.menu, label: "Rolls" },
  { category: "Sashimi", icon: icons.sashimi, label: "Sashimi" },
  { category: "Chef Specials", icon: icons.crown, label: "Chef Specials" },
];

/** Selects a preferred home item while preserving a safe featured fallback. */
function getHomeItem(id: string, featuredItems: SushiMenuItem[], fallbackIndex = 0): SushiMenuItem {
  return getItemById(id) ?? featuredItems[fallbackIndex] ?? featuredItems[0];
}

/** Renders the screenshot-matched mobile and desktop home layouts. */
export function HomeView({
  activeCategory,
  featuredItems,
  loyaltyPoints,
  query,
  reservations,
  onAddToCart,
  onCategoryChange,
  onNavigate,
  onQueryChange,
  onSelectItem,
}: HomeViewProps) {
  const heroItem = getHomeItem("otoro-nigiri", featuredItems);
  const featuredCards = [
    heroItem,
    getHomeItem("spicy-tuna-roll", featuredItems, 1),
    getHomeItem("dragon-roll", featuredItems, 2),
    getHomeItem("salmon-sashimi", featuredItems, 3),
  ];
  const desktopCards = featuredCards;
  const specialItem = getHomeItem("truffle-wagyu-nigiri", featuredItems, 4);
  const memberItem = getHomeItem("ikura-gunkan", featuredItems, 5);
  const upcoming = reservations[0];
  const progressValue = Math.min(loyaltyPoints, appContent.member.maxTierPoints);

  return (
    <>
      <MobileHomeView
        activeCategory={activeCategory}
        featuredCards={featuredCards}
        heroItem={heroItem}
        loyaltyPoints={loyaltyPoints}
        memberItem={memberItem}
        progressValue={progressValue}
        query={query}
        onAddToCart={onAddToCart}
        onCategoryChange={onCategoryChange}
        onNavigate={onNavigate}
        onQueryChange={onQueryChange}
        onSelectItem={onSelectItem}
      />
      <DesktopHomeView
        desktopCards={desktopCards}
        heroItem={heroItem}
        memberItem={memberItem}
        specialItem={specialItem}
        upcoming={upcoming}
        onAddToCart={onAddToCart}
        onNavigate={onNavigate}
        onSelectItem={onSelectItem}
      />
    </>
  );
}

interface MobileHomeViewProps {
  activeCategory: FilterCategory;
  featuredCards: SushiMenuItem[];
  heroItem: SushiMenuItem;
  loyaltyPoints: number;
  memberItem: SushiMenuItem;
  progressValue: number;
  query: string;
  onAddToCart: (item: SushiMenuItem) => void;
  onCategoryChange: (category: FilterCategory) => void;
  onNavigate: (view: AppView) => void;
  onQueryChange: (query: string) => void;
  onSelectItem: (item: SushiMenuItem) => void;
}

/** Builds the compact iPhone-style home screen from the attached reference. */
function MobileHomeView({
  activeCategory,
  featuredCards,
  heroItem,
  loyaltyPoints,
  memberItem,
  progressValue,
  query,
  onAddToCart,
  onCategoryChange,
  onNavigate,
  onQueryChange,
  onSelectItem,
}: MobileHomeViewProps) {
  return (
    <section className="mobile-home-surface relative min-h-screen overflow-hidden bg-black px-5 pb-8 pt-3 md:hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_5%,rgba(184,20,20,0.28),transparent_26%),radial-gradient(circle_at_92%_18%,rgba(202,164,93,0.1),transparent_26%),linear-gradient(180deg,#080504_0%,#050505_42%,#050505_100%)]" />
        <div className="sb-wave-pattern absolute left-0 top-[42%] h-36 w-full opacity-18" />
      </div>

      <div className="relative z-10 mx-auto max-w-[430px]">
        <MobileHomeHeader />
        <MobileSearchBar
          query={query}
          onFilterClick={() => onNavigate("menu")}
          onQueryChange={onQueryChange}
          onSubmit={() => onNavigate("menu")}
        />
        <MobileHeroCard heroItem={heroItem} onSelectItem={onSelectItem} />
        <CategoryRail activeCategory={activeCategory} onCategoryChange={onCategoryChange} onNavigate={onNavigate} />
        <FeaturedMenuRail items={featuredCards} onAddToCart={onAddToCart} onNavigate={onNavigate} onSelectItem={onSelectItem} />
        <QuickActionGrid onNavigate={onNavigate} />
        <MemberCard item={memberItem} loyaltyPoints={loyaltyPoints} progressValue={progressValue} onNavigate={onNavigate} />
      </div>
    </section>
  );
}

/** Places the Sushi Bliss mark and notification control exactly at mobile top. */
function MobileHomeHeader() {
  return (
    <header className="mt-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src={brand.assets.icon.publicUrl} alt="Sushi Bliss" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
        <span className="editorial-title text-[18px] leading-[0.95] tracking-[0.34em] text-white">
          Sushi
          <br />
          Bliss
        </span>
      </div>
      <button
        type="button"
        aria-label="Notifications"
        className="relative grid h-[52px] w-[52px] place-items-center rounded-full border border-[var(--sb-border)] bg-black/52 shadow-[0_0_28px_rgba(202,164,93,0.12)] backdrop-blur-xl"
      >
        {icons.bell ? <AssetIcon src={icons.bell} size={28} /> : null}
        <span className="absolute right-3 top-2.5 h-2.5 w-2.5 rounded-full bg-[var(--sb-red-bright)]" />
      </button>
    </header>
  );
}

interface MobileSearchBarProps {
  query: string;
  onFilterClick: () => void;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
}

/** Provides the search and filter row shown above the mobile hero image. */
function MobileSearchBar({ query, onFilterClick, onQueryChange, onSubmit }: MobileSearchBarProps) {
  return (
    <form
      className="mt-6 grid grid-cols-[1fr_56px] gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="flex h-14 items-center gap-3 rounded-[14px] border border-[var(--sb-border)] bg-black/52 px-4 backdrop-blur-xl">
        {icons.search ? <AssetIcon src={icons.search} size={23} /> : null}
        <span className="sr-only">Search sushi, rolls, or dishes</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search sushi, rolls, or dishes..."
          className="h-full w-full bg-transparent text-[15px] text-white outline-none placeholder:text-[var(--sb-muted)]"
        />
      </label>
      <button
        type="button"
        aria-label="Open filters"
        onClick={onFilterClick}
        className="grid h-14 w-14 place-items-center rounded-[14px] border border-[var(--sb-border)] bg-black/52 backdrop-blur-xl transition active:scale-95"
      >
        {icons.settings ? <AssetIcon src={icons.settings} size={27} /> : null}
      </button>
    </form>
  );
}

interface MobileHeroCardProps {
  heroItem: SushiMenuItem;
  onSelectItem: (item: SushiMenuItem) => void;
}

/** Renders the mobile-first editorial hero from the primary home reference. */
function MobileHeroCard({ heroItem, onSelectItem }: MobileHeroCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelectItem(heroItem)}
      className="relative mt-7 block min-h-[322px] w-full overflow-hidden rounded-[2px] text-left"
    >
      <Image src={heroItem.image.publicUrl} alt={heroItem.name} fill priority sizes="430px" className="object-cover object-[58%_70%]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.34)_42%,rgba(0,0,0,0.78)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/55 to-transparent" />
      <div className="sb-wave-pattern absolute bottom-10 left-0 h-36 w-48 opacity-32" />
      <div className="relative z-10 flex min-h-[322px] flex-col justify-start px-1 py-8">
        <h1 className="editorial-title max-w-[340px] text-[32px] leading-[1.08] text-white">
            Japanese Artistry.
            <span className="block text-[var(--sb-red-bright)]">Timeless Bliss.</span>
        </h1>
        <p className="mt-3 text-[15px] font-medium tracking-[0.04em] text-[var(--sb-gold)]">Authentic. Refined. Unforgettable.</p>
      </div>
    </button>
  );
}

interface CategoryRailProps {
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
  onNavigate: (view: AppView) => void;
}

/** Matches the segmented category selector in the mobile screenshot. */
function CategoryRail({ activeCategory, onCategoryChange, onNavigate }: CategoryRailProps) {
  return (
    <div className="mt-4 grid grid-cols-4 rounded-[18px] border border-[var(--sb-border)] bg-black/72 p-1 shadow-[0_18px_42px_rgba(0,0,0,0.42)] backdrop-blur-xl">
      {categoryTabs.map(({ category, icon, label }) => {
        const active = activeCategory === category || (activeCategory === "All" && category === "Nigiri");
        return (
          <button
            key={category}
            type="button"
            onClick={() => {
              onCategoryChange(category);
              onNavigate("menu");
            }}
            className={`flex min-h-[70px] min-w-0 flex-col items-center justify-center gap-1 rounded-[15px] text-[11px] uppercase transition ${
              active
                ? "border border-[var(--sb-red-bright)] bg-[var(--sb-red)]/28 text-[var(--sb-red-bright)] shadow-[0_0_28px_var(--sb-red-glow)]"
                : "border border-transparent text-white/78 hover:text-[var(--sb-gold)]"
            }`}
          >
            {icon ? <AssetIcon src={icon} size={25} className={active ? "brightness-125" : "opacity-82 grayscale"} /> : null}
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface FeaturedMenuRailProps {
  items: SushiMenuItem[];
  onAddToCart: (item: SushiMenuItem) => void;
  onNavigate: (view: AppView) => void;
  onSelectItem: (item: SushiMenuItem) => void;
}

/** Shows the three-card featured menu row from the mobile home design. */
function FeaturedMenuRail({ items, onAddToCart, onNavigate, onSelectItem }: FeaturedMenuRailProps) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="editorial-title text-[20px] tracking-[0.12em] text-[var(--sb-gold)]">Featured Menu</h2>
        <button
          type="button"
          onClick={() => onNavigate("menu")}
          className="flex items-center gap-1 text-[15px] font-medium text-[var(--sb-red-bright)]"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {items.map((item, index) => (
          <HomeMenuCard
            key={item.id}
            badge={index === 0 ? "Hot" : index === 1 ? "Popular" : index === 2 ? "Chef's Specials" : "Sashimi"}
            className={index > 2 ? "hidden" : ""}
            item={item}
            onAddToCart={onAddToCart}
            onSelectItem={onSelectItem}
          />
        ))}
      </div>
    </section>
  );
}

interface HomeMenuCardProps {
  badge: string;
  className?: string;
  item: SushiMenuItem;
  onAddToCart: (item: SushiMenuItem) => void;
  onSelectItem: (item: SushiMenuItem) => void;
}

/** Renders a compact product card with a separate add-to-cart control. */
function HomeMenuCard({ badge, className = "", item, onAddToCart, onSelectItem }: HomeMenuCardProps) {
  return (
    <article className={`relative min-w-0 overflow-hidden rounded-[14px] border border-[var(--sb-border)] bg-black/62 ${className}`}>
      <span className="absolute left-0 top-0 z-10 rounded-br-[12px] bg-[var(--sb-red)]/86 px-2 py-1 text-[10px] uppercase text-white">{badge}</span>
      <button type="button" onClick={() => onSelectItem(item)} className="block w-full text-left">
        <div className="relative h-[86px] md:h-[160px]">
          <Image src={item.image.publicUrl} alt={item.name} fill sizes="130px" className="pointer-events-none object-cover" />
        </div>
        <div className="p-3">
          <h3 className="editorial-title truncate text-[14px] text-white md:text-lg">{item.name}</h3>
          <p className="mt-1 line-clamp-2 min-h-9 text-[11px] leading-[17px] text-white/68 md:text-sm md:leading-6">{item.ingredients.slice(0, 3).join(", ")}</p>
          <p className="mt-3 text-[17px] text-[var(--sb-gold)] md:text-xl">{formatCurrency(item.price)}</p>
        </div>
      </button>
      <button
        type="button"
        aria-label={`Add ${item.name} to cart`}
        onClick={() => onAddToCart(item)}
        className="absolute bottom-3 right-3 z-20 grid h-8 w-8 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/50 transition active:scale-95 md:h-10 md:w-10"
      >
        {icons.plus ? <AssetIcon src={icons.plus} size={22} /> : null}
      </button>
    </article>
  );
}

interface QuickActionGridProps {
  onNavigate: (view: AppView) => void;
}

/** Displays the paired reservation and ordering CTAs from the mobile screenshot. */
function QuickActionGrid({ onNavigate }: QuickActionGridProps) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onNavigate("reservations")}
        className="red-glow-button flex min-h-[82px] items-center gap-3 rounded-[18px] px-4 text-left uppercase tracking-[0.12em] text-white"
      >
        {icons.calendar ? <AssetIcon src={icons.calendar} size={34} /> : null}
        <span>
          <span className="editorial-title block text-[15px]">Reserve a Table</span>
          <span className="mt-1 block text-[11px] normal-case tracking-normal text-white/75">Unforgettable dining awaits</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onNavigate("orderOnline")}
        className="flex min-h-[82px] items-center gap-3 rounded-[18px] border border-[var(--sb-border-strong)] bg-black/58 px-4 text-left uppercase tracking-[0.12em] text-[var(--sb-gold)] shadow-[0_0_24px_rgba(202,164,93,0.12)] transition active:scale-[0.99]"
      >
        {icons.bag ? <AssetIcon src={icons.bag} size={34} /> : null}
        <span>
          <span className="editorial-title block text-[15px]">Order Now</span>
          <span className="mt-1 block text-[11px] normal-case tracking-normal text-white/75">Sushi delivered to you</span>
        </span>
      </button>
    </div>
  );
}

interface MemberCardProps {
  item: SushiMenuItem;
  loyaltyPoints: number;
  progressValue: number;
  onNavigate: (view: AppView) => void;
}

/** Renders the Bliss member card with progress and food photography. */
function MemberCard({ item, loyaltyPoints, progressValue, onNavigate }: MemberCardProps) {
  return (
    <section className="relative mt-5 overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/62 p-4">
      <Image src={item.image.publicUrl} alt="" width={120} height={92} className="pointer-events-none absolute bottom-0 right-0 h-24 w-32 object-cover opacity-95" />
      <div className="relative z-10 flex gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/34">
          {icons.flower ? <AssetIcon src={icons.flower} size={42} /> : null}
        </div>
        <div className="min-w-0 flex-1 pr-16">
          <div className="flex items-center gap-3">
            <h2 className="editorial-title text-[16px] text-white">Bliss Member</h2>
            <span className="rounded-full bg-[var(--sb-gold)] px-2 py-0.5 text-[10px] font-bold uppercase text-black">Gold</span>
          </div>
          <p className="mt-2 text-[13px] text-white/78">
            {loyaltyPoints.toLocaleString()} pts <span className="text-[var(--sb-gold)]">•</span> {appContent.member.pointsToNextTier.toLocaleString()} pts to {appContent.member.nextTier}
          </p>
          <progress className="mt-3 h-2 w-full" value={progressValue} max={appContent.member.maxTierPoints} />
          <button type="button" onClick={() => onNavigate("loyalty")} className="mt-3 flex items-center gap-1 text-[13px] text-[var(--sb-gold)]">
            View Benefits
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

interface DesktopHomeViewProps {
  desktopCards: SushiMenuItem[];
  heroItem: SushiMenuItem;
  memberItem: SushiMenuItem;
  specialItem: SushiMenuItem;
  upcoming: Reservation | undefined;
  onAddToCart: (item: SushiMenuItem) => void;
  onNavigate: (view: AppView) => void;
  onSelectItem: (item: SushiMenuItem) => void;
}

/** Provides the tablet-only header used by the dashboard-style home screen. */
function TabletHomeTopBar({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  return (
    <header className="mb-4 hidden items-center justify-between gap-5 rounded-[18px] border border-[var(--sb-border)] bg-black/44 px-5 py-4 backdrop-blur-xl md:flex xl:hidden">
      <div className="flex items-center gap-4">
        <Image src={brand.assets.icon.publicUrl} alt="Sushi Bliss" width={64} height={64} className="h-16 w-16 rounded-full" />
        <span className="editorial-title text-xl leading-[0.95] tracking-[0.34em] text-white">
          Sushi
          <br />
          Bliss
        </span>
      </div>
      <label className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-full border border-[var(--sb-border)] bg-black/46 px-5">
        {icons.search ? <AssetIcon src={icons.search} size={24} /> : null}
        <span className="sr-only">Search dishes, rolls, or more</span>
        <input placeholder="Search dishes, rolls, or more..." className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--sb-muted)]" />
      </label>
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Notifications" className="relative grid h-12 w-12 place-items-center rounded-full border border-[var(--sb-border)] bg-black/44">
          {icons.bell ? <AssetIcon src={icons.bell} size={27} /> : null}
          <span className="absolute right-2 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--sb-red)] px-1 text-[10px] font-bold text-white">2</span>
        </button>
        <button type="button" onClick={() => onNavigate("orders")} aria-label="Open orders" className="relative grid h-12 w-12 place-items-center rounded-full border border-[var(--sb-border)] bg-black/44">
          {icons.cart ? <AssetIcon src={icons.cart} size={27} /> : null}
          <span className="absolute right-2 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--sb-red)] px-1 text-[10px] font-bold text-white">4</span>
        </button>
      </div>
    </header>
  );
}

/** Builds the wide dashboard-style home screen from the desktop reference. */
function DesktopHomeView({ desktopCards, heroItem, memberItem, specialItem, upcoming, onAddToCart, onNavigate, onSelectItem }: DesktopHomeViewProps) {
  const reservationExperience = reservationExperiences[0];

  return (
    <section className="desktop-home-surface hidden space-y-3 md:block">
      <TabletHomeTopBar onNavigate={onNavigate} />
      <div className="overflow-hidden rounded-[20px] border border-[var(--sb-border)] bg-black/68 shadow-[0_30px_110px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        <section className="relative min-h-[343px] overflow-hidden border-b border-[var(--sb-border)] px-8 py-8 xl:px-20">
          <Image src={featuredAssets.heroSushi.publicUrl} alt={heroItem.name} fill priority sizes="1200px" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.62)_34%,rgba(0,0,0,0.18)_72%,rgba(0,0,0,0.8)_100%)]" />
          <div className="relative z-10 grid min-h-[280px] grid-cols-1 gap-8 xl:grid-cols-[1fr_280px]">
            <div className="flex flex-col justify-center">
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--sb-gold)]">Timeless Japanese Artistry.</p>
              <h1 className="editorial-title mt-3 text-[64px] leading-[0.9] text-white lg:text-[80px]">
                Sushi
                <span className="block text-[var(--sb-red-bright)]">Bliss</span>
              </h1>
              <p className="mt-4 max-w-sm text-lg leading-7 text-white/78">An unforgettable dining experience where tradition meets perfection.</p>
              <div className="mt-7 flex gap-4">
                <Button className="red-glow-button h-12 w-[205px] rounded-[10px] text-xs uppercase tracking-[0.16em]" onClick={() => onNavigate("reservations")}>
                  Reserve a Table
                  <ChevronRight className="ml-3 h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-12 w-[175px] rounded-[10px] border-[var(--sb-border)] bg-black/42 text-xs uppercase tracking-[0.16em] text-[var(--sb-gold)]" onClick={() => onNavigate("orderOnline")}>
                  Order Now
                  {icons.bag ? <AssetIcon src={icons.bag} size={20} className="ml-3" /> : null}
                </Button>
              </div>
              <div className="mt-6 flex gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <span key={index} className={`h-2 w-2 rounded-full ${index === 0 ? "bg-[var(--sb-red-bright)]" : "bg-white/24"}`} />
                ))}
              </div>
            </div>
            <div className="hidden xl:block">
              <DesktopInfoCard onNavigate={onNavigate} />
            </div>
          </div>
        </section>

        <div className="grid gap-3 p-3 lg:grid-cols-[1.12fr_0.88fr]">
          <section className="rounded-[14px] border border-[var(--sb-border)] bg-black/42 p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-3 text-lg uppercase tracking-[0.12em] text-white">
                {icons.flower ? <AssetIcon src={icons.flower} size={24} /> : null}
                Featured Menu
              </h2>
              <button type="button" onClick={() => onNavigate("menu")} className="flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-[var(--sb-gold)]">
                View Full Menu
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-6">
              {desktopCards.map((item, index) => (
                <HomeMenuCard key={item.id} badge={index === 0 ? "Nigiri" : index === 1 ? "Hot" : index === 2 ? "Special" : "Sashimi"} item={item} onAddToCart={onAddToCart} onSelectItem={onSelectItem} />
              ))}
            </div>
          </section>

          <DesktopReservationCard upcoming={upcoming} experienceTitle={reservationExperience?.title ?? "Sushi Bliss Downtown"} onNavigate={onNavigate} />
          <DesktopChefSpecial item={specialItem} onNavigate={onNavigate} onSelectItem={onSelectItem} />
          <DesktopRecentOrder item={memberItem} onNavigate={onNavigate} />
        </div>
        <DesktopBenefitsStrip />
      </div>
    </section>
  );
}

interface DesktopInfoCardProps {
  onNavigate: (view: AppView) => void;
}

/** Renders the location and hours card on the desktop hero. */
function DesktopInfoCard({ onNavigate }: DesktopInfoCardProps) {
  const { hours, location } = appContent;

  return (
    <aside className="self-center rounded-[14px] border border-[var(--sb-border)] bg-black/54 p-6 backdrop-blur-xl">
      <div className="flex gap-3">
        {icons.location ? <AssetIcon src={icons.location} size={25} /> : null}
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-white">{location.city} · {location.country}</p>
          <p className="mt-2 text-sm leading-6 text-white/70">{location.street},<br />{location.postalLine}<br />{location.phone}</p>
        </div>
      </div>
      <div className="my-6 h-px bg-[var(--sb-border)]" />
      <div className="flex gap-3">
        {icons.clock ? <AssetIcon src={icons.clock} size={24} /> : null}
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-white">Hours</p>
          <p className="mt-2 text-sm leading-6 text-white/70">{hours.days}<br />{hours.service}</p>
        </div>
      </div>
      <button type="button" onClick={() => onNavigate("contact")} className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--sb-border)] text-sm uppercase tracking-[0.14em] text-[var(--sb-gold)]">
        View Details
        <ChevronRight className="h-4 w-4" />
      </button>
    </aside>
  );
}

interface DesktopReservationCardProps {
  experienceTitle: string;
  upcoming: Reservation | undefined;
  onNavigate: (view: AppView) => void;
}

/** Renders the desktop reservation module with a screenshot-style date block. */
function DesktopReservationCard({ experienceTitle, upcoming, onNavigate }: DesktopReservationCardProps) {
  const { location, reservation } = appContent;

  return (
    <section className="rounded-[14px] border border-[var(--sb-border)] bg-black/42 p-6">
      <h2 className="flex items-center gap-3 text-lg uppercase tracking-[0.12em] text-white">
        {icons.flower ? <AssetIcon src={icons.flower} size={24} /> : null}
        Make a Reservation
      </h2>
      <div className="mt-5 grid grid-cols-[82px_1fr_170px] overflow-hidden rounded-[10px] border border-[var(--sb-border)] bg-black/42">
        <div className="grid place-items-center border-r border-[var(--sb-border)] py-3 text-center">
          <span className="text-xs uppercase text-white/72">{reservation.weekday}</span>
          <span className="editorial-title text-3xl text-white">{reservation.day}</span>
          <span className="text-xs uppercase text-white/72">{reservation.month}</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-xl text-white">{upcoming ? new Date(upcoming.datetime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : reservation.time}</p>
          <p className="mt-2 text-sm text-white/72">{experienceTitle}<br />{location.street}, {location.city}</p>
        </div>
        <button type="button" className="border-l border-[var(--sb-border)] px-4 text-sm text-[var(--sb-gold)]">{reservation.guests} Guests</button>
      </div>
      <Button className="red-glow-button mt-3 h-11 w-full rounded-[9px] uppercase tracking-[0.14em]" onClick={() => onNavigate("reservations")}>
        Find a Table
      </Button>
      <div className="mt-4 flex items-center justify-between text-sm text-white/62">
        <span>{reservation.alternateGuests} Guests</span>
        <span>{reservation.table}</span>
        <button type="button" onClick={() => onNavigate("reservations")} className="rounded-full border border-[var(--sb-border)] px-4 py-1 text-[var(--sb-red-bright)]">Modify</button>
      </div>
    </section>
  );
}

interface DesktopChefSpecialProps {
  item: SushiMenuItem;
  onNavigate: (view: AppView) => void;
  onSelectItem: (item: SushiMenuItem) => void;
}

/** Shows the long chef special banner beneath the desktop featured menu. */
function DesktopChefSpecial({ item, onNavigate, onSelectItem }: DesktopChefSpecialProps) {
  return (
    <section className="relative overflow-hidden rounded-[14px] border border-[var(--sb-border)] bg-black/42 p-6">
      <Image src={item.image.publicUrl} alt="" fill sizes="680px" className="object-cover opacity-55" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88),rgba(0,0,0,0.4),rgba(0,0,0,0.76))]" />
      <div className="relative z-10">
        <h2 className="flex items-center gap-3 text-lg uppercase tracking-[0.12em] text-white">
          {icons.flower ? <AssetIcon src={icons.flower} size={24} /> : null}
          Chef&apos;s Special
        </h2>
        <button type="button" onClick={() => onSelectItem(item)} className="mt-4 max-w-xs text-left">
          <h3 className="text-xl text-white">{item.name}</h3>
          <p className="mt-2 text-sm leading-6 text-white/72">{item.description}</p>
          <p className="mt-4 text-lg text-[var(--sb-gold)]">{formatCurrency(item.price)}</p>
        </button>
        <button type="button" onClick={() => onNavigate("menu")} className="mt-2 flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-[var(--sb-gold)]">
          View Details
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

interface DesktopRecentOrderProps {
  item: SushiMenuItem;
  onNavigate: (view: AppView) => void;
}

/** Renders the desktop recent-order card with reorder entry point. */
function DesktopRecentOrder({ item, onNavigate }: DesktopRecentOrderProps) {
  const { recentOrder } = appContent;

  return (
    <section className="rounded-[14px] border border-[var(--sb-border)] bg-black/42 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg uppercase tracking-[0.12em] text-white">Recent Orders</h2>
        <button type="button" onClick={() => onNavigate("orders")} className="flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-[var(--sb-gold)]">
          View All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <button type="button" onClick={() => onNavigate("orders")} className="mt-5 grid w-full grid-cols-[128px_1fr_auto] items-center gap-5 rounded-[10px] border border-[var(--sb-border)] bg-black/42 p-3 text-left">
        <div className="relative h-20 overflow-hidden rounded-[8px]">
          <Image src={item.image.publicUrl} alt="" fill sizes="128px" className="pointer-events-none object-cover" />
        </div>
        <span>
          <span className="block text-lg text-white">{recentOrder.title}</span>
          <span className="mt-1 block text-sm text-white/58">{recentOrder.placedAtLabel}</span>
          <span className="mt-1 block text-lg text-[var(--sb-gold)]">{formatCurrency(recentOrder.total)} <span className="ml-4 text-sm text-emerald-400">{recentOrder.status}</span></span>
        </span>
        <ChevronRight className="h-5 w-5 text-[var(--sb-gold)]" />
      </button>
    </section>
  );
}

/** Renders the four desktop trust badges along the bottom edge. */
function DesktopBenefitsStrip() {
  return (
    <div className="mx-3 mb-3 grid grid-cols-4 rounded-[14px] border border-[var(--sb-border)] bg-white/[0.04]">
      {appContent.benefits.map((benefit) => (
        <div key={benefit.title} className="flex items-center justify-center gap-4 border-r border-[var(--sb-border)] px-6 py-4 last:border-r-0">
          {icons[benefit.icon as keyof typeof icons] ? <AssetIcon src={icons[benefit.icon as keyof typeof icons] as string} size={32} /> : null}
          <span>
            <span className="block text-sm uppercase tracking-[0.16em] text-white/82">{benefit.title}</span>
            <span className="block text-sm text-white/58">{benefit.copy}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
