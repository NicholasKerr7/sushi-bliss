import Image from "next/image";
import { Calendar, ChevronRight, Quote } from "lucide-react";
import {
  getAppContent,
  getAssetById,
  getAssetsByFolder,
  getChefs,
  getFeaturedAssets,
  getItemById,
  getMenuItems,
} from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import type { AssetRef, Chef, SushiMenuItem } from "../../data/types";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";

interface AboutScreenProps {
  onNavigate: (view: AppView) => void;
  onSelectItem: (item: SushiMenuItem) => void;
}

interface EditorialHeroAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

const appContent = getAppContent();
const featuredAssets = getFeaturedAssets();
const menuItems = getMenuItems();
const chefs = getChefs();
const ambienceAssets = getAssetsByFolder("ambience");
const iconAssets = getSushiIconAssets();

/** Resolves a packaged asset into a public URL with the hero image as a safe fallback. */
function assetUrl(asset: AssetRef | undefined): string {
  return asset?.publicUrl ?? featuredAssets.heroSushi.publicUrl;
}

/** Returns the required menu fallback used when an optional chef signature is unavailable. */
function getFallbackMenuItem(): SushiMenuItem {
  const fallbackItem = getItemById("otoro-nigiri") ?? menuItems[0];
  if (!fallbackItem) throw new Error("Sushi Bliss menu data is required for about screens.");
  return fallbackItem;
}

/** Finds the first menu item matching a chef's declared signature names. */
function getChefSignatureItem(chef: Chef): SushiMenuItem {
  return (
    menuItems.find((item) => item.name === chef.sushi || item.name === chef.specialty) ??
    getFallbackMenuItem()
  );
}

/** Splits page titles into white lead text and red accent text like the screenshots. */
function EditorialHero({
  actions,
  accent,
  copy,
  eyebrow,
  image,
  priority = true,
  title,
}: {
  actions?: EditorialHeroAction[];
  accent: string;
  copy: string;
  eyebrow: string;
  image: string;
  priority?: boolean;
  title: string;
}) {
  return (
    <section className="luxury-panel relative min-h-[430px] overflow-hidden p-6 sm:p-9 lg:min-h-[520px] lg:p-14">
      <Image src={image} alt="" fill priority={priority} sizes="100vw" className="object-cover opacity-74" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/94 via-black/60 to-black/10" />
      <div className="sb-wave-pattern pointer-events-none absolute left-0 top-0 h-full w-64 opacity-25" />
      <div className="smoke-overlay pointer-events-none absolute inset-0" />
      <div className="relative z-10 max-w-2xl pt-10 md:pt-16 lg:pt-4">
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--sb-gold)]">{eyebrow}</p>
        <h1 className="editorial-title mt-4 text-[44px] leading-[0.94] text-white sm:text-[64px] xl:text-[78px]">
          {title}
          <span className="block text-[var(--sb-red-bright)]">{accent}</span>
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-[var(--sb-gold)] sm:text-lg">{copy}</p>
        {actions ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant === "secondary" ? "outline" : "default"}
                className={
                  action.variant === "secondary"
                    ? "h-[52px] rounded-[12px] border-[var(--sb-border-strong)] bg-black/38 px-6 uppercase tracking-[0.16em] text-[var(--sb-gold)]"
                    : "red-glow-button h-[52px] rounded-[12px] px-6 uppercase tracking-[0.16em]"
                }
                onClick={action.onClick}
              >
                {action.label}
                <ChevronRight className="ml-3 h-4 w-4" />
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Shows the reusable desktop trust strip from the app's structured benefit data. */
function AboutBenefitsBar() {
  return (
    <section className="luxury-panel grid gap-0 overflow-hidden p-0 md:grid-cols-2 xl:grid-cols-4">
      {appContent.benefits.map((benefit) => (
        <div key={benefit.id} className="flex items-center gap-4 border-b border-[var(--sb-border)] px-6 py-5 last:border-b-0 md:border-r md:last:border-r-0 xl:border-b-0">
          {iconAssets[benefit.icon as keyof typeof iconAssets] ? (
            <AssetIcon src={iconAssets[benefit.icon as keyof typeof iconAssets] as string} size={34} />
          ) : null}
          <span>
            <span className="block text-sm uppercase tracking-[0.16em] text-white">{benefit.title}</span>
            <span className="block text-sm text-[var(--sb-muted)]">{benefit.copy}</span>
          </span>
        </div>
      ))}
    </section>
  );
}

/** Renders one image card used by the story and atmosphere screenshot layouts. */
function StoryImageCard({
  copy,
  icon,
  image,
  onClick,
  priority = false,
  title,
}: {
  copy: string;
  icon?: string;
  image: string;
  onClick?: () => void;
  priority?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="luxury-panel group relative min-h-[276px] overflow-hidden p-0 text-left transition hover:border-[var(--sb-gold)]"
    >
      <Image src={image} alt="" fill priority={priority} sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover opacity-78 transition group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/94 via-black/42 to-transparent" />
      <div className="relative z-10 flex min-h-[276px] flex-col justify-end p-5">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/50">
          {icon ? <AssetIcon src={icon} size={32} /> : null}
        </span>
        <h2 className="editorial-title mt-4 text-2xl text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-white/74">{copy}</p>
      </div>
    </button>
  );
}

/** Recreates the Our Story screenshot as a full-width responsive app page. */
export function AboutStoryView({ onNavigate }: AboutScreenProps) {
  const heroImage = assetUrl(getAssetById("precision-in-sushi-preparation") ?? getAssetById("sushi-bliss-master-chef-team") ?? getAssetById("hiroshi-tanaka-head-chef-plating"));
  const storyCards = [
    {
      title: "Rooted In Heritage",
      copy: "Inspired by generations of Japanese culinary mastery, we source the finest seafood and authentic ingredients.",
      image: assetUrl(getAssetById("luxury-nigiri-with-gold-and-caviar") ?? getItemById("otoro-nigiri")?.image),
      icon: iconAssets.flower,
      target: "sourcing" as AppView,
    },
    {
      title: "Omotenashi",
      copy: "Every moment is thoughtful, personal, and unforgettable.",
      image: assetUrl(getAssetById("intimate-upscale-dining-room-setting") ?? getAssetById("moody-japanese-inspired-dining-ambiance-at-night")),
      icon: iconAssets.dining,
      target: "atmosphere" as AppView,
    },
    {
      title: "Atmosphere",
      copy: "Music, plating, lantern light, and stone detail create a serene escape.",
      image: assetUrl(getAssetById("serene-illuminated-courtyard-with-red-blossoms") ?? getAssetById("intimate-sushi-bar-dining-experience")),
      icon: iconAssets.flower,
      target: "atmosphere" as AppView,
    },
  ];

  return (
    <div className="space-y-5">
      <EditorialHero
        eyebrow="Our Story"
        title="Crafted With"
        accent="Passion. Served With Purpose."
        copy="At Sushi Bliss, we honor timeless Japanese cuisine while embracing innovation, precision, and the finest ingredients."
        image={heroImage}
      />
      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1.1fr]">
        {storyCards.map((card, index) => (
          <StoryImageCard key={card.title} {...card} priority={index === 0} onClick={() => onNavigate(card.target)} />
        ))}
        <section className="luxury-panel p-6">
          <h2 className="editorial-title text-2xl text-[var(--sb-gold)]">Experience Sushi Bliss</h2>
          <p className="mt-4 text-base leading-7 text-white/76">Join us for an unforgettable dining experience that celebrates the art of sushi.</p>
          <div className="mt-6 space-y-3">
            {["Expert chefs", "Premium ingredients", "Unforgettable moments"].map((line) => (
              <p key={line} className="flex items-center gap-3 text-white/82">
                {iconAssets.check ? <AssetIcon src={iconAssets.check} size={21} /> : null}
                {line}
              </p>
            ))}
          </div>
          <Button className="red-glow-button mt-8 h-14 w-full rounded-[14px] uppercase tracking-[0.16em]" onClick={() => onNavigate("reservations")}>
            Reserve a Table
            <ChevronRight className="ml-3 h-4 w-4" />
          </Button>
        </section>
      </section>
      <AboutBenefitsBar />
    </div>
  );
}

/** Renders a chef card with the chef portrait and data-backed signature dish. */
function ChefTeamCard({ chef, onSelectItem }: { chef: Chef; onSelectItem: (item: SushiMenuItem) => void }) {
  const signatureItem = getChefSignatureItem(chef);

  return (
    <article className="luxury-panel overflow-hidden p-4">
      <div className="relative min-h-[280px] overflow-hidden rounded-[18px] border border-[var(--sb-border)]">
        <Image src={chef.standingImage.publicUrl} alt={`${chef.name} portrait`} fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/94 via-black/24 to-transparent" />
        <span className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-[var(--sb-border)] bg-black/48">
          {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={27} /> : null}
        </span>
        <div className="absolute bottom-5 left-5 right-5">
          <h2 className="text-2xl text-white">{chef.name}</h2>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{chef.position}</p>
        </div>
      </div>
      <p className="mt-5 min-h-[76px] text-sm leading-6 text-[var(--sb-muted)]">{chef.about}</p>
      <div className="mt-5 rounded-[16px] border border-[var(--sb-border)] bg-black/42 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">Specialty</p>
        <button type="button" onClick={() => onSelectItem(signatureItem)} className="mt-3 grid w-full grid-cols-[98px_1fr] items-center gap-4 text-left">
          <span className="relative h-20 overflow-hidden rounded-[12px] border border-[var(--sb-border)]">
            <Image src={signatureItem.image.publicUrl} alt="" fill sizes="98px" className="object-cover" />
          </span>
          <span>
            <span className="block text-lg text-white">{signatureItem.name}</span>
            <span className="mt-1 line-clamp-2 block text-sm text-[var(--sb-muted)]">{signatureItem.description}</span>
          </span>
        </button>
      </div>
    </article>
  );
}

/** Recreates the Master Chefs team page with data-backed chef cards. */
export function ChefsTeamView({ onNavigate, onSelectItem }: AboutScreenProps) {
  return (
    <div className="space-y-5">
      <EditorialHero
        eyebrow="Masters Of Their Craft"
        title="The Art Behind"
        accent="Every Bite."
        copy="Our master chefs blend time-honored Japanese techniques with modern precision to create unforgettable sushi experiences."
        image={assetUrl(getAssetById("sushi-bliss-master-chef-team"))}
        actions={[
          { label: "Meet The Team", onClick: () => onNavigate("chefsTeam") },
          { label: "Reserve Experience", onClick: () => onNavigate("reservations"), variant: "secondary" },
        ]}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {chefs.map((chef) => (
          <ChefTeamCard key={chef.id} chef={chef} onSelectItem={onSelectItem} />
        ))}
      </section>
      <section className="luxury-panel grid gap-5 p-5 lg:grid-cols-[1fr_1fr_1fr_320px]">
        {[
          ["Expert Craftsmanship", "Decades of experience and unwavering dedication.", iconAssets.chef],
          ["Premium Ingredients", "Sourced daily for the finest quality.", iconAssets.flower],
          ["Japanese Tradition", "Honoring time-tested techniques with modern innovation.", iconAssets.dining],
        ].map(([title, copy, icon]) => (
          <div key={title} className="flex items-center gap-4 border-b border-[var(--sb-border)] pb-4 last:border-b-0 lg:border-b-0 lg:border-r lg:pb-0 lg:last:border-r-0">
            {typeof icon === "string" ? <AssetIcon src={icon} size={38} /> : null}
            <span>
              <span className="block text-sm uppercase tracking-[0.16em] text-white">{title}</span>
              <span className="mt-1 block text-sm leading-6 text-[var(--sb-muted)]">{copy}</span>
            </span>
          </div>
        ))}
        <Button className="red-glow-button h-14 rounded-[14px] uppercase tracking-[0.16em]" onClick={() => onNavigate("reservations")}>
          Reserve Your Experience
          <Calendar className="ml-3 h-4 w-4" />
        </Button>
      </section>
    </div>
  );
}

/** Builds the ingredient grid from packaged ingredient and editorial imagery. */
function getSourcingCards() {
  return [
    {
      title: "Premium Fish",
      copy: "Sustainably sourced seafood, selected for peak freshness and flavor.",
      source: "Toyosu Market, Japan",
      image: assetUrl(getAssetById("sashimi-slice-with-chopsticks-in-hand") ?? getAssetById("sourcing-bluefin-tuna-on-ice")),
      icon: iconAssets.sashimi,
    },
    {
      title: "Japanese Rice",
      copy: "Koshihikari rice, perfectly seasoned to enhance every bite.",
      source: "Niigata Prefecture, Japan",
      image: assetUrl(getAssetById("steaming-bowl-of-rice-on-rustic-surface") ?? getAssetById("premium-sushi-preparation-still-life")),
      icon: iconAssets.dining,
    },
    {
      title: "Wasabi",
      copy: "Authentic wasabi, freshly grated for clean heat and aroma.",
      source: "Shizuoka, Japan",
      image: assetUrl(getAssetById("wasabi-root-on-wooden-tray") ?? getAssetById("premium-ingredients-wasabi-herbs")),
      icon: iconAssets.flower,
    },
    {
      title: "Nori Seaweed",
      copy: "Crisp, umami-rich nori sourced from pristine coastal waters.",
      source: "Ariake Sea, Japan",
      image: assetUrl(getAssetById("stack-of-nori-on-dark-plate") ?? getAssetById("premium-sushi-preparation-still-life")),
      icon: iconAssets.star,
    },
    {
      title: "Soy Sauce",
      copy: "Artisanal soy sauce brewed with tradition for depth and balance.",
      source: "Yamakawa, Japan",
      image: assetUrl(getAssetById("minimalist-ceramic-still-life-with-sake-carafe") ?? getAssetById("sake-vase-set-rounded-ceramic")),
      icon: iconAssets.gift,
    },
    {
      title: "Sustainability",
      copy: "Responsible suppliers who share our commitment to the planet.",
      source: "Responsible sourcing",
      image: assetUrl(getAssetById("nurturing-new-life-from-soil")),
      icon: iconAssets.check,
    },
  ];
}

/** Recreates the premium sourcing screenshot using one consistent structured asset set. */
export function SourcingIngredientsView({ onNavigate }: AboutScreenProps) {
  const chef = chefs[0];

  return (
    <div className="space-y-5">
      <EditorialHero
        eyebrow="Crafted With Purpose"
        title="Premium Ingredients."
        accent="Trusted Sourcing."
        copy="Exceptional dining begins with exceptional ingredients. We source the world's finest while honoring sustainability and integrity."
        image={assetUrl(getAssetById("luxury-sushi-platter-on-marble-surface") ?? getAssetById("premium-sushi-preparation-still-life"))}
        actions={[{ label: "Meet Our Chef", onClick: () => onNavigate("chefsTeam"), variant: "secondary" }]}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {getSourcingCards().map((card) => (
          <article key={card.title} className="luxury-panel overflow-hidden p-0">
            <div className="relative h-48">
              <Image src={card.image} alt="" fill sizes="(min-width: 1280px) 16vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            </div>
            <div className="p-4">
              <h2 className="flex items-center gap-3 text-sm uppercase tracking-[0.14em] text-white">
                {card.icon ? <AssetIcon src={card.icon} size={27} /> : null}
                {card.title}
              </h2>
              <p className="mt-4 min-h-[82px] text-sm leading-6 text-[var(--sb-muted)]">{card.copy}</p>
              <div className="mt-4 flex items-center gap-2 border-t border-[var(--sb-border)] pt-4 text-sm text-[var(--sb-gold)]">
                {iconAssets.mapPin ? <AssetIcon src={iconAssets.mapPin} size={20} /> : null}
                {card.source}
              </div>
            </div>
          </article>
        ))}
      </section>
      <section className="luxury-panel grid gap-6 p-6 lg:grid-cols-[0.95fr_1px_1fr]">
        <div className="grid gap-5 sm:grid-cols-[150px_1fr] sm:items-center">
          <Image src={chef.profileImage?.publicUrl ?? chef.standingImage.publicUrl} alt="" width={150} height={150} className="h-[150px] w-[150px] rounded-full border border-[var(--sb-border-strong)] object-cover" />
          <blockquote>
            <Quote className="h-10 w-10 text-[var(--sb-red-bright)]" />
            <p className="mt-2 text-xl leading-8 text-white">Great sushi starts long before it reaches your plate. We honor every ingredient, every season, and every connection that brings us here.</p>
            <footer className="mt-4 text-lg text-[var(--sb-gold)]">- Chef {chef.name}</footer>
          </blockquote>
        </div>
        <div className="hidden bg-[var(--sb-border)] lg:block" />
        <div className="flex flex-col justify-center">
          <h2 className="editorial-title text-2xl text-[var(--sb-gold)]">Our Commitment</h2>
          <p className="mt-4 text-base leading-7 text-[var(--sb-muted)]">From ocean to table, we commit to quality, transparency, and respect for our guests and partners.</p>
          <Button variant="outline" className="mt-6 h-12 w-max rounded-[12px] border-[var(--sb-border-strong)] bg-black/30 px-5 uppercase tracking-[0.16em] text-[var(--sb-gold)]" onClick={() => onNavigate("aboutStory")}>
            Learn More About Us
            <ChevronRight className="ml-3 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

/** Builds the atmosphere gallery tiles from ambience assets and stable captions. */
function getAtmosphereCards() {
  return [
    {
      title: "Sushi Bar",
      copy: "Front Row Excellence",
      image: assetUrl(getAssetById("elegant-sushi-bar-with-amber-lighting") ?? getAssetById("elegant-sushi-bar-ambience-at-night")),
      icon: iconAssets.flower,
    },
    {
      title: "Private Dining",
      copy: "Intimate & Exclusive",
      image: assetUrl(getAssetById("intimate-upscale-dining-room-setting") ?? getAssetById("moody-japanese-inspired-dining-ambiance-at-night")),
      icon: iconAssets.dining,
    },
    {
      title: "Ambience",
      copy: "Timeless Atmosphere",
      image: assetUrl(getAssetById("serene-illuminated-courtyard-with-red-blossoms") ?? getAssetById("rooftop-dining-in-a-japanese-haven")),
      icon: iconAssets.flower,
    },
    {
      title: "Chef's Counter",
      copy: "Crafted with Passion",
      image: assetUrl(getAssetById("precision-in-sushi-preparation") ?? getAssetById("sushi-bliss-master-chef-team")),
      icon: iconAssets.chef,
    },
    {
      title: "Dining Room",
      copy: "Elegant & Comfortable",
      image: assetUrl(getAssetById("elegant-japanese-inspired-dining-room-interior") ?? getAssetById("intimate-sushi-bar-dining-experience")),
      icon: iconAssets.profile,
    },
  ];
}

/** Recreates the atmosphere/gallery screenshot with a wide hero and image mosaic. */
export function AtmosphereGalleryView({ onNavigate }: AboutScreenProps) {
  return (
    <div className="space-y-5">
      <EditorialHero
        eyebrow="Experience Sushi Bliss"
        title="Our"
        accent="Atmosphere"
        copy="Step into a world where timeless Japanese tradition meets modern elegance. Every detail is designed to create unforgettable moments."
        image={assetUrl(getAssetById("luxurious-japanese-teppanyaki-dining-room") ?? ambienceAssets[0])}
      />
      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1.9fr]">
        {getAtmosphereCards().map((card, index) => (
          <StoryImageCard key={card.title} {...card} priority={index === 0} onClick={() => (index < 2 ? onNavigate("reservations") : onNavigate("aboutStory"))} />
        ))}
        <section className="luxury-panel relative overflow-hidden p-6 xl:col-span-1">
          <Image src={assetUrl(getItemById("otoro-nigiri")?.image)} alt="" fill sizes="640px" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/70 to-black/24" />
          <div className="relative z-10">
            <h2 className="editorial-title text-2xl text-[var(--sb-gold)]">What To Expect</h2>
            <div className="mt-6 space-y-5">
              {[
                ["Authentic Japanese Hospitality", "Warm service, refined attention to detail.", iconAssets.group],
                ["Premium Ingredients", "Sourced daily, of the highest quality.", iconAssets.flower],
                ["Artful Presentation", "Every dish is a masterpiece.", iconAssets.chef],
                ["Unforgettable Moments", "Designed for connection and celebration.", iconAssets.gift],
              ].map(([title, copy, icon]) => (
                <div key={title} className="flex gap-4">
                  {typeof icon === "string" ? <AssetIcon src={icon} size={29} /> : null}
                  <span>
                    <span className="block text-base text-white">{title}</span>
                    <span className="block text-sm text-[var(--sb-muted)]">{copy}</span>
                  </span>
                </div>
              ))}
            </div>
            <Button className="red-glow-button mt-8 h-14 w-full rounded-[14px] uppercase tracking-[0.16em]" onClick={() => onNavigate("reservations")}>
              Reserve Experience
              <ChevronRight className="ml-3 h-4 w-4" />
            </Button>
          </div>
        </section>
      </section>
    </div>
  );
}
