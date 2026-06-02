import Image from "next/image";
import {
  Check,
  ChevronRight,
  Clipboard,
  Clock3,
  Heart,
  MapPinned,
  Navigation,
  Paperclip,
  Search,
  Send,
  Share2,
  Ticket,
} from "lucide-react";
import type { ReactNode } from "react";
import type { SushiMenuItem } from "../../data/menu";
import {
  getAppContent,
  getAssetById,
  getAssetsByFolder,
  getFeaturedAssets,
  getItemById,
  getMasterChefsOmakaseExperience,
  getMenuItems,
} from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import { formatCurrency } from "../../lib/format-utils";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { GuestProfile } from "../profile/types";

interface ExperienceViewProps {
  favorites: SushiMenuItem[];
  profile: GuestProfile;
  onAddToCart: (item: SushiMenuItem) => void;
  onNavigate: (view: AppView) => void;
  onSelectItem: (item: SushiMenuItem) => void;
  showNotice: (message: string, tone?: "success" | "error" | "info") => void;
}

interface OfferItem {
  title: string;
  copy: string;
  meta: string;
  icon?: string;
  image?: string;
  badge?: string;
}

const appContent = getAppContent();
const featuredAssets = getFeaturedAssets();
const iconAssets = getSushiIconAssets();
const menuItems = getMenuItems();
const omakaseExperience = getMasterChefsOmakaseExperience();
const ambienceAssets = getAssetsByFolder("ambience");
const editorialAssets = getAssetsByFolder("editorial");
const appetizerAssets = getAssetsByFolder("omakase/appetizers");
const dessertAssets = getAssetsByFolder("omakase/desserts");
const specialtyAssets = getAssetsByFolder("omakase/specialties");

const locations = [
  { name: "Sushi Bliss - Downtown", address: "123 Sakura Way", city: "San Francisco, CA 94107", distance: "0.8 mi", hours: "Mon-Sun: 11:00 AM - 10:00 PM", image: ambienceAssets[0]?.publicUrl },
  { name: "Sushi Bliss - Marina", address: "215 Coastal Dr", city: "San Francisco, CA 94123", distance: "2.3 mi", hours: "Mon-Sun: 11:00 AM - 10:30 PM", image: ambienceAssets[1]?.publicUrl },
  { name: "Sushi Bliss - Japantown", address: "567 Nihonmachi St", city: "San Francisco, CA 94115", distance: "3.1 mi", hours: "Mon-Sun: 11:00 AM - 10:00 PM", image: ambienceAssets[2]?.publicUrl },
  { name: "Sushi Bliss - Sunset", address: "789 Sunset Blvd", city: "San Francisco, CA 94122", distance: "4.7 mi", hours: "Mon-Sun: 11:30 AM - 10:30 PM", image: ambienceAssets[3]?.publicUrl },
];

const offers: OfferItem[] = [
  { title: "Seasonal Omakase Experience", copy: "A curated journey of seasonal flavors by Chef Hiroshi Tanaka.", meta: "Limited time only", badge: "25% Off", image: getItemById("otoro-nigiri")?.image.publicUrl },
  { title: "Loyalty Bonus", copy: "Earn 2X points on all dine-in orders this month.", meta: "Valid until May 31, 2024", badge: "2X Points", icon: iconAssets.flower },
  { title: "Free Delivery", copy: "Enjoy free delivery on orders over $45.", meta: "Code: FREESUSHI", badge: "Delivery", icon: iconAssets.delivery },
  { title: "Chef's Special: 15% Off", copy: "Get 15% off Chef's Specials menu for a limited time.", meta: "Valid until May 26, 2024", image: getItemById("dragon-roll")?.image.publicUrl, icon: iconAssets.chefHat },
  { title: "Birthday Treat", copy: "Celebrate your day with 20% off your entire dine-in bill.", meta: "Valid 7 days before and after birthday", badge: "20% Off", icon: iconAssets.gift },
];

/** Renders the omakase landing page from the mobile/tablet references. */
export function OmakaseExperienceView({ onNavigate }: Pick<ExperienceViewProps, "onNavigate">) {
  const chefImage = getAssetById("sushi-bliss-master-chef-team")?.publicUrl ?? ambienceAssets[0]?.publicUrl ?? featuredAssets.heroSushi.publicUrl;
  const previewCourses = [
    { title: "Appetizer", copy: "Seasonal amuse-bouche", image: appetizerAssets[0]?.publicUrl },
    { title: "Sashimi", copy: "Prime selection of the day", image: editorialAssets[0]?.publicUrl },
    { title: "Chef's Signature", copy: "Nigiri masterpiece", image: specialtyAssets[0]?.publicUrl },
    { title: "Specialty", copy: "Hot course creation", image: specialtyAssets[1]?.publicUrl },
    { title: "Dessert", copy: "Japanese sweet finish", image: dessertAssets[0]?.publicUrl },
  ];

  return (
    <ExperienceFrame onBack={() => onNavigate("home")}>
      <section className="relative -mx-4 min-h-[640px] overflow-hidden px-4 pb-8 pt-28 sm:-mx-6 sm:px-6 md:mx-0 md:min-h-[520px] md:rounded-[28px] md:border md:border-[var(--sb-border)] lg:pt-24">
        <Image src={chefImage} alt="" fill sizes="100vw" className="object-cover object-center opacity-72" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/94 via-black/62 to-black/20" />
        <div className="sb-wave-pattern absolute bottom-0 left-0 h-56 w-96 opacity-18" />
        <div className="relative z-10 max-w-3xl">
          <div className="hidden max-w-3xl grid-cols-[1fr_84px] gap-3 md:grid">
            <Input placeholder="Search sushi, rolls, or dishes..." className="h-16 rounded-[14px] border-[var(--sb-border)] bg-black/42 text-white" />
            <button type="button" aria-label="Filter" className="grid h-16 place-items-center rounded-[14px] border border-[var(--sb-border)] bg-black/42">
              {iconAssets.settings ? <AssetIcon src={iconAssets.settings} size={32} /> : null}
            </button>
          </div>
          <p className="mt-10 text-2xl uppercase tracking-[0.12em] text-[var(--sb-gold)]">The Art Of</p>
          <h1 className="editorial-title mt-2 text-[58px] leading-[0.9] text-white sm:text-[74px] md:text-[88px]">
            Omakase
            <span className="block text-[var(--sb-red-bright)]">The Chef&apos;s Journey</span>
          </h1>
          <p className="mt-5 max-w-lg text-xl leading-8 text-[var(--sb-gold)]">Trust the Chef. Surrender to Excellence.</p>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/78">An intimate culinary journey, crafted in the moment with precision, passion, and the finest seasonal ingredients.</p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center md:mx-auto md:max-w-3xl">
        {[
          { icon: iconAssets.profile, title: "Chef-led Experience" },
          { icon: iconAssets.about, title: "Seasonal & Exclusive" },
          { icon: iconAssets.dining, title: "Limited Seats" },
        ].map((item) => (
          <div key={item.title} className="border-r border-[var(--sb-border)] px-2 last:border-r-0">
            {item.icon ? <AssetIcon src={item.icon} size={44} className="mx-auto" /> : null}
            <p className="mt-3 text-sm uppercase tracking-[0.12em] text-white">{item.title}</p>
          </div>
        ))}
      </section>

      <section>
        <ExperienceSectionHeading title="Experience Preview" action="View Full Menu" onAction={() => onNavigate("menu")} />
        <div className="-mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
          {previewCourses.map((course, index) => (
            <article key={course.title} className={`w-[190px] shrink-0 overflow-hidden rounded-[16px] border bg-black/48 ${index === 0 ? "border-[var(--sb-red-bright)] shadow-[0_0_24px_var(--sb-red-glow)]" : "border-[var(--sb-border)]"}`}>
              <div className="relative h-36">
                <Image src={course.image ?? featuredAssets.heroSushi.publicUrl} alt="" fill sizes="190px" className="object-cover" />
                <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-[var(--sb-red-bright)] bg-black/60 text-xs text-[var(--sb-gold)]">{index + 1}</span>
              </div>
              <div className="p-3">
                <h3 className="editorial-title text-lg uppercase text-white">{course.title}</h3>
                <p className="mt-1 text-xs text-[var(--sb-muted)]">{course.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="luxury-panel relative overflow-hidden p-5">
        <Image src={getItemById("otoro-nigiri")?.image.publicUrl ?? featuredAssets.heroSushi.publicUrl} alt="" fill sizes="100vw" className="object-cover opacity-36" />
        <div className="relative z-10 grid gap-4 md:grid-cols-[1fr_360px] md:items-center">
          <div className="space-y-3">
            {["Personalized chef interaction", "Premium seasonal ingredients", "Traditional Edomae techniques"].map((highlight) => (
              <p key={highlight} className="flex items-center gap-3 text-lg text-white/82">
                {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={28} /> : null}
                {highlight}
              </p>
            ))}
          </div>
        </div>
      </section>

      <Button className="red-glow-button h-16 rounded-[16px] text-base uppercase tracking-[0.18em]" onClick={() => onNavigate("omakasePackageReview")}>
        Choose Experience
        <ChevronRight className="ml-3 h-5 w-5" />
      </Button>
      <button type="button" onClick={() => onNavigate("reservations")} className="mx-auto flex items-center justify-center gap-3 text-lg uppercase tracking-[0.08em] text-[var(--sb-gold)]">
        {iconAssets.calendar ? <AssetIcon src={iconAssets.calendar} size={28} /> : null}
        Reserve For A Special Occasion
      </button>
    </ExperienceFrame>
  );
}

/** Renders the promotions and offers index from the screenshots. */
export function OffersView({ onNavigate }: Pick<ExperienceViewProps, "onNavigate">) {
  return (
    <ExperienceFrame>
      <header className="pt-8">
        <h1 className="editorial-title text-[44px] leading-none text-white md:text-[64px]">
          Promotions <span className="text-[var(--sb-red-bright)]">& Offers</span>
        </h1>
        <p className="mt-4 text-xl text-[var(--sb-gold)]">Exclusive offers crafted to elevate your experience.</p>
      </header>
      <SegmentedTabs labels={["All", "Dining", "Delivery", "Loyalty"]} />
      <section>
        <ExperienceSectionHeading title="Featured Offers" icon={iconAssets.gift} />
        <button type="button" onClick={() => onNavigate("offerDetails")} className="relative mt-4 block min-h-[260px] w-full overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/50 p-5 text-left">
          <Image src={getItemById("otoro-nigiri")?.image.publicUrl ?? featuredAssets.heroSushi.publicUrl} alt="" fill sizes="100vw" className="object-cover opacity-62" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/54 to-transparent" />
          <div className="relative z-10 max-w-md">
            <span className="rounded-full bg-[var(--sb-red)] px-3 py-1 text-xs uppercase text-white">Featured</span>
            <h2 className="editorial-title mt-4 text-4xl uppercase text-white">Seasonal Omakase Experience</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--sb-muted)]">A curated journey of seasonal flavors by Chef Hiroshi Tanaka.</p>
            <span className="mt-5 inline-flex rounded-xl bg-[var(--sb-red)] px-5 py-3 uppercase tracking-[0.14em] text-white">Reserve Now</span>
          </div>
          <span className="absolute right-5 top-5 rounded-2xl border border-[var(--sb-border)] bg-black/58 px-5 py-4 text-center text-3xl text-[var(--sb-gold)]">25%<span className="block text-sm uppercase">Off</span></span>
        </button>
      </section>
      <section className="space-y-3">
        <ExperienceSectionHeading title="All Offers" icon={iconAssets.gift} />
        {offers.slice(1).map((offer) => (
          <OfferRow key={offer.title} offer={offer} onClick={() => onNavigate("offerDetails")} />
        ))}
      </section>
    </ExperienceFrame>
  );
}

/** Renders the full offer detail view with redeem instructions. */
export function OfferDetailsView({ onNavigate }: Pick<ExperienceViewProps, "onNavigate">) {
  return (
    <ExperienceFrame onBack={() => onNavigate("offers")} centerBrand>
      <section className="relative -mx-4 min-h-[420px] overflow-hidden px-4 pb-8 pt-28 sm:-mx-6 sm:px-6 md:mx-0 md:rounded-[28px] md:border md:border-[var(--sb-border)]">
        <Image src={getItemById("deluxe-toro-caviar-nigiri")?.image.publicUrl ?? featuredAssets.heroSushi.publicUrl} alt="" fill sizes="100vw" className="object-cover opacity-78" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/42 to-black/16" />
        <div className="relative z-10 max-w-3xl">
          <span className="rounded-full border border-[var(--sb-border)] bg-black/48 px-5 py-2 text-sm uppercase tracking-[0.16em] text-[var(--sb-gold)]">Exclusive Offer</span>
          <h1 className="editorial-title mt-36 text-[48px] leading-none text-white md:text-[72px]">
            Spring Omakase
            <span className="block text-[var(--sb-red-bright)]">Experience</span>
          </h1>
          <p className="mt-5 max-w-xl text-xl uppercase tracking-[0.08em] text-[var(--sb-gold)]">A seasonal journey of precision & harmony.</p>
        </div>
        <span className="absolute bottom-10 right-8 grid h-36 w-36 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/58 text-center text-[var(--sb-gold)]">
          <span><span className="block text-xs uppercase">Limited Time Only</span><span className="mt-2 block text-4xl text-[var(--sb-red-bright)]">20%</span><span className="uppercase">Off</span></span>
        </span>
      </section>
      <section className="grid gap-4 rounded-[18px] border border-[var(--sb-border)] bg-black/44 p-5 md:grid-cols-2">
        <OfferCodeMetric icon={iconAssets.gift} label="Offer Code" value="OMAKASE20" />
        <OfferCodeMetric icon={iconAssets.calendar} label="Valid Until" value="May 31, 2024\n11:59 PM JST" />
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          ["12-Course Omakase", "Seasonal Selection", iconAssets.gift],
          ["Welcome Sake Pairing", "Complimentary", iconAssets.dining],
          ["Chef's Special Amuse Bouche", "Exclusively for You", iconAssets.crown],
        ].map(([title, copy, icon]) => (
          <div key={String(title)} className="rounded-[18px] border border-[var(--sb-border)] bg-black/36 p-4 text-center">
            {typeof icon === "string" ? <AssetIcon src={icon} size={38} className="mx-auto" /> : null}
            <h3 className="mt-3 editorial-title text-lg uppercase text-white">{title}</h3>
            <p className="mt-2 text-sm text-[var(--sb-muted)]">{copy}</p>
          </div>
        ))}
      </section>
      <section className="luxury-panel p-5">
        <h2 className="text-sm uppercase tracking-[0.22em] text-[var(--sb-gold)]">How To Redeem</h2>
        <div className="mt-4 space-y-3 text-base leading-7 text-white/78">
          {["Tap Redeem Offer to reserve your omakase experience.", "Apply code OMAKASE20 at checkout.", "Enjoy 20% off your omakase experience."].map((step, index) => (
            <p key={step} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]">{index + 1}</span>{step}</p>
          ))}
        </div>
      </section>
      <Button className="red-glow-button h-16 rounded-[16px] text-base uppercase tracking-[0.18em]" onClick={() => onNavigate("reservations")}>
        {iconAssets.gift ? <AssetIcon src={iconAssets.gift} size={28} className="mr-3" /> : null}
        Redeem Offer
      </Button>
    </ExperienceFrame>
  );
}

/** Renders the referral earn page with code and share actions. */
export function ReferralView({ showNotice }: Pick<ExperienceViewProps, "showNotice">) {
  return (
    <ExperienceFrame>
      <header className="pt-8 text-center">
        <h1 className="editorial-title text-[46px] leading-none text-white md:text-[68px]">Refer A <span className="text-[var(--sb-red-bright)]">Friend</span></h1>
        <div className="mx-auto mt-5 flex max-w-sm items-center gap-4">
          <span className="h-px flex-1 bg-[var(--sb-border)]" />
          {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={30} /> : null}
          <span className="h-px flex-1 bg-[var(--sb-border)]" />
        </div>
        <p className="mt-7 text-3xl uppercase tracking-[0.14em] text-[var(--sb-gold)]">Give $20, Get $20</p>
        <p className="mx-auto mt-5 max-w-2xl text-xl leading-8 text-[var(--sb-muted)]">Share the bliss. You and your friend will each receive $20 when they place their first order.</p>
      </header>
      <section className="relative mx-auto min-h-[260px] w-full max-w-4xl overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/50 p-6">
        <Image src={getItemById("otoro-nigiri")?.image.publicUrl ?? featuredAssets.heroSushi.publicUrl} alt="" fill sizes="900px" className="object-cover opacity-54" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/44 to-transparent" />
        <div className="relative z-10">
          <p className="editorial-title text-2xl tracking-[0.28em] text-white">Sushi Bliss</p>
          <p className="mt-9 text-7xl text-[var(--sb-gold)]">$20</p>
          <p className="mt-3 uppercase tracking-[0.24em] text-[var(--sb-gold)]">Gift Card</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-4xl text-center">
        <h2 className="text-xl uppercase tracking-[0.22em] text-[var(--sb-gold)]">Your Referral Code</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="rounded-[16px] border border-dashed border-[var(--sb-border-strong)] bg-black/40 py-5 text-3xl tracking-[0.3em] text-white">BLISS20</div>
          <Button variant="outline" className="h-full rounded-[16px] border-[var(--sb-border)] bg-black/35 uppercase tracking-[0.16em] text-[var(--sb-gold)]" onClick={() => showNotice("Referral code copied.", "success")}>
            <Clipboard className="mr-3 h-5 w-5" />
            Copy
          </Button>
        </div>
        <Button className="red-glow-button mt-5 h-16 w-full rounded-[16px] text-base uppercase tracking-[0.18em]" onClick={() => showNotice("Invite link ready to share.", "success")}>
          <Share2 className="mr-3 h-5 w-5" />
          Share Invite Link
        </Button>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Invite", "Share your link with a friend.", iconAssets.profile],
          ["They Order", "Your friend places their first order.", iconAssets.orders],
          ["You Both Get $20", "You and your friend each receive a $20 reward.", iconAssets.gift],
        ].map(([title, copy, icon], index) => (
          <div key={String(title)} className="text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[var(--sb-border)] bg-black/42">{typeof icon === "string" ? <AssetIcon src={icon} size={42} /> : null}</span>
            <span className="mx-auto -mt-3 grid h-8 w-8 place-items-center rounded-full bg-[var(--sb-red)] text-white">{index + 1}</span>
            <h3 className="mt-3 text-lg uppercase tracking-[0.14em] text-[var(--sb-gold)]">{title}</h3>
            <p className="mt-2 text-sm text-[var(--sb-muted)]">{copy}</p>
          </div>
        ))}
      </section>
    </ExperienceFrame>
  );
}

/** Renders the gift experience selection page. */
export function GiftExperienceView({ onNavigate }: Pick<ExperienceViewProps, "onNavigate">) {
  return (
    <ExperienceFrame onBack={() => onNavigate("profile")} centerBrand>
      <header className="text-center">
        <h1 className="editorial-title text-[40px] uppercase leading-none text-white md:text-[64px]">Gift An Experience</h1>
        <p className="mt-4 text-2xl text-[var(--sb-gold)]">Share the art of omakase.</p>
        <p className="mt-2 text-lg text-[var(--sb-muted)]">A refined experience they&apos;ll never forget.</p>
      </header>
      <section className="relative min-h-[360px] overflow-hidden rounded-[28px] p-6 text-center">
        <Image src={ambienceAssets[2]?.publicUrl ?? featuredAssets.heroSushi.publicUrl} alt="" fill sizes="100vw" className="object-cover opacity-58" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/28 to-transparent" />
        <div className="relative z-10 mx-auto mt-16 max-w-lg rounded-[22px] border border-[var(--sb-border)] bg-black/70 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <p className="editorial-title text-4xl text-[var(--sb-gold)]">Omakase Experience</p>
          <p className="mt-3 uppercase tracking-[0.18em] text-white/80">A Gift Of Excellence</p>
        </div>
      </section>
      <section>
        <ExperienceSectionHeading title="Choose Experience Value" />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["$150", "Harmony", "12 Courses"],
            ["$250", "Mastery", "16 Courses"],
            ["$350", "Legacy", "18+ Courses"],
            ["Custom", "Choose", "Amount"],
          ].map(([price, title, copy], index) => (
            <button key={title} type="button" className={`min-h-[150px] rounded-[16px] border bg-black/42 p-4 text-center ${index === 0 ? "border-[var(--sb-red-bright)] shadow-[0_0_24px_var(--sb-red-glow)]" : "border-[var(--sb-border)]"}`}>
              {index === 0 ? <span className="rounded-full bg-[var(--sb-red)] px-3 py-1 text-[10px] uppercase text-white">Popular</span> : null}
              <span className="mt-4 block text-3xl text-[var(--sb-gold)]">{price}</span>
              <span className="mt-2 block text-xl uppercase tracking-[0.12em] text-white">{title}</span>
              <span className="mt-1 block text-sm text-[var(--sb-muted)]">{copy}</span>
            </button>
          ))}
        </div>
      </section>
      <GiftRecipientForm />
      <section className="grid gap-3 md:grid-cols-2">
        <GiftMethodCard icon={iconAssets.email} title="Email" copy="Send via email" active />
        <GiftMethodCard icon={iconAssets.creditCard} title="Print" copy="Printable gift card" />
      </section>
      <Button className="red-glow-button h-16 rounded-[16px] text-base uppercase tracking-[0.18em]" onClick={() => onNavigate("giftCheckout")}>
        {iconAssets.gift ? <AssetIcon src={iconAssets.gift} size={28} className="mr-3" /> : null}
        Continue To Purchase
      </Button>
    </ExperienceFrame>
  );
}

/** Renders the gift payment review screen. */
export function GiftCheckoutView({ onNavigate, profile }: Pick<ExperienceViewProps, "onNavigate" | "profile">) {
  return (
    <ExperienceFrame onBack={() => onNavigate("giftExperience")}>
      <header>
        <button type="button" onClick={() => onNavigate("giftExperience")} className="mb-5 flex items-center gap-3 text-[var(--sb-gold)]"><ChevronRight className="h-5 w-5 rotate-180" /> Back</button>
        <h1 className="editorial-title text-[38px] leading-none text-white md:text-[60px]">Gift Experience <span className="text-[var(--sb-red-bright)]">Payment</span></h1>
        <p className="mt-3 text-xl text-[var(--sb-gold)]">You&apos;re moments away from sharing an unforgettable experience.</p>
      </header>
      <section className="luxury-panel p-5">
        <ExperienceSectionHeading title="Gift Experience Summary" />
        <div className="mt-4 grid gap-5 md:grid-cols-[260px_1fr]">
          <div className="relative min-h-[160px] overflow-hidden rounded-[16px] border border-[var(--sb-border)]"><Image src={getItemById("otoro-nigiri")?.image.publicUrl ?? featuredAssets.heroSushi.publicUrl} alt="" fill sizes="260px" className="object-cover" /></div>
          <div>
            <span className="rounded-full bg-[var(--sb-red)] px-3 py-1 text-xs uppercase text-white">Most Loved</span>
            <h2 className="editorial-title mt-4 text-3xl text-white">Harmony</h2>
            <p className="mt-2 text-[var(--sb-muted)]">12 Courses · The perfect balance of flavor, texture, and artistry.</p>
            <p className="mt-5 text-2xl text-[var(--sb-gold)]">$180.00</p>
          </div>
        </div>
      </section>
      <ReviewPanel title="Recipient Details" rows={["Sarah Miller", "+1 (415) 555-0198", "sarah.miller@email.com", "May 24, 2024 · 7:00 PM"]} />
      <ReviewPanel title="Billing Details" rows={[profile.name, profile.phone, profile.email, profile.address]} />
      <section className="luxury-panel p-5">
        <ExperienceSectionHeading title="Payment Method" action="Manage" />
        <div className="mt-4 rounded-[14px] border border-[var(--sb-red-bright)] bg-black/40 p-4 shadow-[0_0_22px_var(--sb-red-glow)]">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xl text-white">Visa ···· 4242 <span className="ml-2 rounded-full border border-[var(--sb-border)] px-2 py-1 text-xs uppercase text-[var(--sb-gold)]">Default</span></p>
            <Check className="h-6 w-6 text-[var(--sb-red-bright)]" />
          </div>
        </div>
        <div className="mt-6 space-y-3 border-t border-[var(--sb-border)] pt-5">
          <SummaryRow label="Subtotal" value="$180.00" />
          <SummaryRow label="Service Fee (10%)" value="$18.00" />
          <SummaryRow label="Tax (8.875%)" value="$17.62" />
          <SummaryRow label="Total" value="$215.62" strong />
        </div>
        <Button className="red-glow-button mt-5 h-16 w-full rounded-[16px] uppercase tracking-[0.18em]" onClick={() => onNavigate("giftConfirmation")}>
          Purchase Gift
        </Button>
      </section>
    </ExperienceFrame>
  );
}

/** Renders the gift purchase confirmation page. */
export function GiftConfirmationView({ onNavigate }: Pick<ExperienceViewProps, "onNavigate">) {
  return (
    <ExperienceFrame centerBrand>
      <header className="text-center">
        <span className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/48 text-[var(--sb-gold)] shadow-[0_0_36px_rgba(202,164,93,0.25)]">
          <Check className="h-14 w-14" />
        </span>
        <h1 className="editorial-title mt-7 text-[42px] uppercase leading-none text-white md:text-[64px]">Gift Purchase <span className="block text-[var(--sb-red-bright)]">Successful</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-xl text-[var(--sb-gold)]">Your gift has been sent and will bring joy to someone special.</p>
        <p className="mx-auto mt-6 max-w-lg rounded-[16px] border border-[var(--sb-border)] bg-black/40 px-5 py-3 text-2xl tracking-[0.18em] text-white">SBGFT-2024-0524-0097</p>
      </header>
      <section className="luxury-panel mx-auto max-w-4xl p-5">
        <ExperienceSectionHeading title="Recipient" icon={iconAssets.profile} />
        <div className="mt-4 grid gap-5 md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-3xl text-white">Alex Johnson</h2>
            <p className="mt-2 text-[var(--sb-muted)]">alex.johnson@email.com<br />+1 (415) 555-0198</p>
          </div>
          <span className="grid h-16 w-16 place-items-center rounded-full border border-[var(--sb-border)]">{iconAssets.email ? <AssetIcon src={iconAssets.email} size={34} /> : null}</span>
        </div>
        <div className="gold-divider my-6" />
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="relative min-h-[130px] overflow-hidden rounded-[14px]"><Image src={featuredAssets.heroSushi.publicUrl} alt="" fill sizes="220px" className="object-cover" /></div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--sb-gold)]">Gift Package</p>
            <h3 className="editorial-title mt-2 text-3xl text-white">Bliss Harmony</h3>
            <p className="mt-2 text-lg text-[var(--sb-muted)]">12-Course Omakase Experience</p>
          </div>
        </div>
        <Button className="red-glow-button mt-6 h-14 w-full rounded-[16px] uppercase tracking-[0.18em]" onClick={() => onNavigate("profile")}>
          Share Gift
        </Button>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" className="h-12 rounded-[14px] border-[var(--sb-border)] bg-black/32 text-[var(--sb-gold)]">View Receipt</Button>
          <Button variant="outline" className="h-12 rounded-[14px] border-[var(--sb-border)] bg-black/32 text-[var(--sb-gold)]" onClick={() => onNavigate("home")}>Back To Home</Button>
        </div>
      </section>
    </ExperienceFrame>
  );
}

/** Renders saved dish and experience favorites. */
export function FavoritesView({ favorites, onAddToCart, onNavigate, onSelectItem }: Pick<ExperienceViewProps, "favorites" | "onAddToCart" | "onNavigate" | "onSelectItem">) {
  const savedItems = favorites.length ? favorites : menuItems.filter((item) => ["otoro-nigiri", "uni-gunkan", "dragon-roll"].includes(item.id));

  return (
    <ExperienceFrame>
      <header className="pt-8">
        <h1 className="editorial-title text-[44px] leading-none text-white md:text-[64px]">Saved <span className="text-[var(--sb-red-bright)]">Favorites</span></h1>
        <p className="mt-4 text-xl text-[var(--sb-gold)]">Your personally saved dishes and experiences.</p>
      </header>
      <SegmentedTabs labels={[`All Favorites (${savedItems.length + 2})`, "Dishes", "Experiences"]} />
      <section className="space-y-3">
        <ExperienceSectionHeading title="Saved Dishes" icon={iconAssets.nigiri} action="6 items" />
        {savedItems.slice(0, 4).map((item) => (
          <SavedItemRow key={item.id} item={item} onAddToCart={onAddToCart} onSelectItem={onSelectItem} />
        ))}
      </section>
      <section className="space-y-3">
        <ExperienceSectionHeading title="Saved Experiences" icon={iconAssets.gift} action="2 items" />
        <SavedExperienceRow title="Omakase Experience" copy="Chef's Signature Journey" image={ambienceAssets[1]?.publicUrl} onClick={() => onNavigate("omakase")} />
        <SavedExperienceRow title="Premium Sake Pairing" copy="Elevate your omakase" image={featuredAssets.sakeSets[0]?.publicUrl} onClick={() => onNavigate("pairings")} />
      </section>
      <section className="luxury-panel grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-center gap-4">
          <Heart className="h-10 w-10 text-[var(--sb-red-bright)]" />
          <div>
            <h2 className="text-2xl text-white">Love something new?</h2>
            <p className="text-[var(--sb-gold)]">Explore our menu and add more favorites.</p>
          </div>
        </div>
        <Button className="red-glow-button rounded-[14px] px-8" onClick={() => onNavigate("menu")}>Explore Menu</Button>
      </section>
    </ExperienceFrame>
  );
}

/** Renders a recently viewed list from deterministic menu data. */
export function RecentlyViewedView({ onNavigate, onSelectItem }: Pick<ExperienceViewProps, "onNavigate" | "onSelectItem">) {
  const viewedItems = ["otoro-nigiri", "spicy-tuna-roll", "salmon-nigiri", "uni-gunkan"].map((id) => getItemById(id)).filter((item): item is SushiMenuItem => Boolean(item));

  return (
    <ExperienceFrame>
      <header className="pt-8">
        <h1 className="editorial-title text-[44px] leading-none text-white md:text-[64px]">Recently <span className="text-[var(--sb-red-bright)]">Viewed</span></h1>
        <p className="mt-4 text-xl text-[var(--sb-gold)]">Your recently viewed dishes and experiences.</p>
      </header>
      <section className="space-y-3">
        <ExperienceSectionHeading title="Today" />
        {viewedItems.slice(0, 3).map((item, index) => (
          <ViewedItemRow key={item.id} item={item} time={["9:32 PM", "8:15 PM", "6:47 PM"][index]} onSelectItem={onSelectItem} />
        ))}
      </section>
      <section className="space-y-3">
        <ExperienceSectionHeading title="Earlier" />
        <SavedExperienceRow title="Harmony Omakase" copy="12 Courses · 180 min" image={ambienceAssets[1]?.publicUrl} onClick={() => onNavigate("omakase")} />
        {viewedItems.slice(3).map((item) => <ViewedItemRow key={item.id} item={item} time="May 23 at 8:42 PM" onSelectItem={onSelectItem} />)}
      </section>
    </ExperienceFrame>
  );
}

/** Renders restaurant location search and list. */
export function LocationsView({ onNavigate }: Pick<ExperienceViewProps, "onNavigate">) {
  return (
    <ExperienceFrame>
      <header className="pt-8">
        <h1 className="editorial-title text-[48px] leading-none text-white md:text-[72px]">Restaurant <span className="block text-[var(--sb-red-bright)]">Locations</span></h1>
        <p className="mt-4 text-xl text-[var(--sb-gold)]">Find a Sushi Bliss restaurant near you.</p>
      </header>
      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <label className="grid h-16 grid-cols-[56px_1fr] items-center rounded-[14px] border border-[var(--sb-border)] bg-black/46 px-4">
          <Search className="h-7 w-7 text-[var(--sb-gold)]" />
          <Input placeholder="Search by city, ZIP code, or address..." className="border-0 bg-transparent px-0 text-lg text-white shadow-none focus-visible:ring-0" />
        </label>
        <button type="button" className="flex h-16 items-center justify-center gap-3 rounded-[14px] border border-[var(--sb-border)] bg-black/46 text-[var(--sb-gold)]">{iconAssets.settings ? <AssetIcon src={iconAssets.settings} size={28} /> : null} Filter</button>
      </div>
      <section className="space-y-3">
        {locations.map((location) => (
          <button key={location.name} type="button" onClick={() => onNavigate("locationDetails")} className="grid w-full overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/46 text-left md:grid-cols-[320px_1fr_auto]">
            <span className="relative min-h-[180px]"><Image src={location.image ?? featuredAssets.heroSushi.publicUrl} alt="" fill sizes="320px" className="object-cover" /></span>
            <span className="p-5">
              <span className="editorial-title block text-3xl text-white">{location.name}</span>
              <span className="mt-3 flex gap-3 text-[var(--sb-muted)]">{iconAssets.mapPin ? <AssetIcon src={iconAssets.mapPin} size={22} /> : null}<span>{location.address}<br />{location.city}</span></span>
              <span className="mt-3 flex gap-3 text-[var(--sb-gold)]">{iconAssets.clock ? <AssetIcon src={iconAssets.clock} size={22} /> : null}{location.hours}</span>
            </span>
            <span className="flex items-center gap-3 p-5 text-[var(--sb-red-bright)]">{location.distance}<ChevronRight className="h-5 w-5 text-[var(--sb-gold)]" /></span>
          </button>
        ))}
      </section>
      <Button className="red-glow-button h-16 rounded-[16px] uppercase tracking-[0.18em]" onClick={() => onNavigate("locationDetails")}>
        <MapPinned className="mr-3 h-5 w-5" />
        View On Map
      </Button>
    </ExperienceFrame>
  );
}

/** Renders one location's map, hours, access, and loyalty detail. */
export function LocationDetailsView({ onNavigate }: Pick<ExperienceViewProps, "onNavigate">) {
  const mapAsset = getAssetById("sushi-bliss-tokyo-map-transparent")?.publicUrl;

  return (
    <ExperienceFrame onBack={() => onNavigate("locations")}>
      <header className="text-center">
        <h1 className="editorial-title text-[36px] uppercase tracking-[0.16em] text-white md:text-[56px]">Location Details</h1>
      </header>
      <section className="relative min-h-[320px] overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/48">
        {mapAsset ? <Image src={mapAsset} alt="" fill sizes="100vw" className="object-cover opacity-75" /> : null}
        <div className="absolute inset-0 bg-black/22" />
        <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[var(--sb-red-bright)] bg-black/68 shadow-[0_0_32px_var(--sb-red-glow)]">
          {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={44} /> : null}
        </span>
      </section>
      <section className="luxury-panel overflow-hidden p-0">
        <div className="relative min-h-[220px] p-6">
          <Image src={featuredAssets.heroSushi.publicUrl} alt="" fill sizes="100vw" className="object-cover opacity-40" />
          <div className="relative z-10 max-w-lg">
            <h2 className="editorial-title text-4xl uppercase text-[var(--sb-gold)]">Sushi Bliss Downtown</h2>
            <p className="mt-5 flex gap-3 text-lg text-white/82">{iconAssets.mapPin ? <AssetIcon src={iconAssets.mapPin} size={26} /> : null}<span>1234 Robson Street<br />Vancouver, BC V6E 1C5<br />Canada</span></p>
          </div>
        </div>
        <div className="divide-y divide-[var(--sb-border)] p-5">
          <LocationDetailLine icon={iconAssets.clock} label="Opening Hours" value="Mon - Sun" detail="11:00 AM - 10:00 PM" />
          <LocationDetailLine icon={iconAssets.check} label="Access" value="Wheelchair accessible" detail="Street-level entrance" />
          <LocationDetailLine icon={iconAssets.location} label="Parking" value="Paid street parking available" detail="EasyPark & PayByPhone accepted" />
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        <Button className="red-glow-button h-16 rounded-[16px] uppercase tracking-[0.16em]"><Navigation className="mr-3 h-5 w-5" />Get Directions</Button>
        <Button variant="outline" className="h-16 rounded-[16px] border-[var(--sb-border-strong)] bg-black/35 uppercase tracking-[0.16em] text-[var(--sb-gold)]">{iconAssets.phone ? <AssetIcon src={iconAssets.phone} size={28} className="mr-3" /> : null}Call</Button>
      </section>
    </ExperienceFrame>
  );
}

/** Renders the FAQ/help center page. */
export function HelpCenterView({ onNavigate }: Pick<ExperienceViewProps, "onNavigate">) {
  const questions = [
    "How do I make a reservation?",
    "What is Sushi Bliss's delivery radius?",
    "Do you accommodate allergies or dietary restrictions?",
    "How do I cancel or modify my reservation?",
    "How do loyalty points work?",
    "Do you offer private dining or special events?",
  ];

  return (
    <ExperienceFrame>
      <section className="relative -mx-4 min-h-[340px] overflow-hidden px-4 pt-28 sm:-mx-6 sm:px-6 md:mx-0 md:rounded-[28px] md:border md:border-[var(--sb-border)]">
        <Image src={featuredAssets.heroSushi.publicUrl} alt="" fill sizes="100vw" className="object-cover object-right opacity-66" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/72 to-transparent" />
        <div className="relative z-10 max-w-lg">
          <h1 className="editorial-title text-[46px] uppercase text-white md:text-[72px]">Help Center</h1>
          <p className="mt-4 text-xl leading-8 text-[var(--sb-gold)]">We&apos;re here to help. Find answers to common questions below.</p>
        </div>
      </section>
      <label className="grid h-16 grid-cols-[56px_1fr] items-center rounded-[14px] border border-[var(--sb-border)] bg-black/46 px-4">
        <Search className="h-7 w-7 text-[var(--sb-gold)]" />
        <Input placeholder="Search for help topics..." className="border-0 bg-transparent px-0 text-lg text-white shadow-none focus-visible:ring-0" />
      </label>
      <section className="space-y-3">
        <ExperienceSectionHeading title="Frequently Asked Questions" />
        {questions.map((question, index) => (
          <button key={question} type="button" onClick={() => (index === 3 ? onNavigate("faq") : undefined)} className="grid min-h-[92px] w-full grid-cols-[72px_1fr_auto] items-center gap-4 rounded-[16px] border border-[var(--sb-border)] bg-black/46 p-4 text-left">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border)]">{index === 1 && iconAssets.delivery ? <AssetIcon src={iconAssets.delivery} size={30} /> : iconAssets.calendar ? <AssetIcon src={iconAssets.calendar} size={30} /> : null}</span>
            <span className="text-xl text-white">{question}</span>
            <ChevronRight className="h-5 w-5 rotate-90 text-[var(--sb-gold)]" />
          </button>
        ))}
      </section>
      <section className="luxury-panel grid gap-4 p-5 md:grid-cols-[180px_1fr] md:items-center">
        {iconAssets.headset ? <AssetIcon src={iconAssets.headset} size={88} className="mx-auto" /> : null}
        <div>
          <h2 className="editorial-title text-2xl uppercase text-white">Still Need Help?</h2>
          <p className="mt-2 text-lg text-[var(--sb-gold)]">Our support team is ready to assist you.</p>
          <Button className="red-glow-button mt-4 h-14 rounded-[16px] px-8 uppercase tracking-[0.16em]" onClick={() => onNavigate("supportChat")}>Send Us A Message</Button>
        </div>
      </section>
    </ExperienceFrame>
  );
}

/** Renders the FAQ article detail page. */
export function FaqArticleView({ onNavigate }: Pick<ExperienceViewProps, "onNavigate">) {
  return (
    <ExperienceFrame onBack={() => onNavigate("help")} centerBrand>
      <header>
        <h1 className="editorial-title text-[52px] uppercase text-white">FAQ</h1>
        <p className="mt-3 text-xl text-[var(--sb-gold)]">Find answers to common questions.</p>
      </header>
      <label className="grid h-16 grid-cols-[56px_1fr] items-center rounded-[14px] border border-[var(--sb-border)] bg-black/46 px-4">
        <Search className="h-7 w-7 text-[var(--sb-gold)]" />
        <Input placeholder="Search for help articles..." className="border-0 bg-transparent px-0 text-lg text-white shadow-none focus-visible:ring-0" />
      </label>
      <SegmentedTabs labels={["Reservations", "Orders & Delivery", "Account", "Payments", "Loyalty"]} />
      <article className="luxury-panel p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="editorial-title text-3xl text-[var(--sb-gold)]">How do I change or cancel a reservation?</h2>
          <ChevronRight className="h-5 w-5 -rotate-90 text-[var(--sb-red-bright)]" />
        </div>
        <div className="mt-5 rounded-[16px] border border-[var(--sb-border)] bg-black/30 p-5 text-lg leading-8 text-white/78">
          <p>You can change or cancel your reservation easily from the app.</p>
          {["Go to Reservations in the bottom menu.", "Select your upcoming reservation.", "Tap Modify to change the time or date, or Cancel Reservation to cancel."].map((step, index) => (
            <p key={step} className="mt-4 flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]">{index + 1}</span>{step}</p>
          ))}
          <div className="gold-divider my-5" />
          <p>Please note that cancellations made less than <span className="text-[var(--sb-gold)]">2 hours</span> before your reservation time may be subject to our late cancellation policy.</p>
          <Button className="red-glow-button mt-5 h-14 w-full rounded-[14px] uppercase tracking-[0.16em]" onClick={() => onNavigate("supportChat")}>Contact Support</Button>
        </div>
      </article>
    </ExperienceFrame>
  );
}

/** Renders the support chat page with quick-help chips. */
export function SupportChatView({ onNavigate }: Pick<ExperienceViewProps, "onNavigate">) {
  const messages = [
    ["support", "Hello! Thank you for reaching out to Sushi Bliss Support. How can we assist you today?", "9:41 AM"],
    ["user", "Hi! I'd like to know the status of my order.", "9:42 AM"],
    ["support", "Of course! Please provide your order number or the phone number used for the order.", "9:42 AM"],
    ["user", "Sure, it's #SB125678", "9:43 AM"],
    ["support", "Thank you! Your order #SB125678 is currently being prepared and will be on the way in about 25 minutes.", "9:43 AM"],
  ];

  return (
    <ExperienceFrame onBack={() => onNavigate("help")}>
      <header>
        <h1 className="editorial-title text-[42px] uppercase text-[var(--sb-gold)] md:text-[64px]">Support Chat</h1>
        <p className="mt-3 text-xl text-[var(--sb-gold)]">We&apos;re here to help, 24/7</p>
      </header>
      <section className="luxury-panel flex items-center gap-4 p-4">
        <span className="relative grid h-20 w-20 place-items-center rounded-full border border-[var(--sb-border)]">{iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={46} /> : null}<span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500" /></span>
        <span><span className="block text-2xl text-white">Sushi Bliss Support</span><span className="text-[var(--sb-gold)]">Live Support</span></span>
      </section>
      <section className="space-y-5">
        {messages.map(([from, text, time], index) => (
          <div key={`${from}-${index}`} className={`flex gap-3 ${from === "user" ? "justify-end" : "justify-start"}`}>
            {from === "support" ? <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[var(--sb-border)]">{iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={34} /> : null}</span> : null}
            <div className={`max-w-[74%] rounded-[18px] border p-4 ${from === "user" ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/36" : "border-[var(--sb-border)] bg-black/48"}`}>
              <p className="text-lg leading-7 text-white">{text}</p>
              <p className="mt-2 text-sm text-[var(--sb-muted)]">{time}</p>
            </div>
          </div>
        ))}
      </section>
      <section>
        <ExperienceSectionHeading title="Quick Help" />
        <div className="mt-4 flex flex-wrap gap-3">
          {["Track Order", "Reservation Help", "Menu Info", "Payment & Refunds", "Loyalty & Rewards"].map((chip) => (
            <button key={chip} type="button" className="rounded-[14px] border border-[var(--sb-border)] bg-black/42 px-5 py-3 text-white">{chip}</button>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-[1fr_64px] gap-3">
        <label className="grid h-16 grid-cols-[1fr_50px] items-center rounded-[18px] border border-[var(--sb-border)] bg-black/46 px-4">
          <Input placeholder="Type your message..." className="border-0 bg-transparent px-0 text-lg text-white shadow-none focus-visible:ring-0" />
          <Paperclip className="h-6 w-6 text-[var(--sb-muted)]" />
        </label>
        <button type="button" aria-label="Send message" className="red-glow-button grid h-16 w-16 place-items-center rounded-full"><Send className="h-7 w-7" /></button>
      </div>
    </ExperienceFrame>
  );
}

/** Provides shared page spacing and optional back/brand controls for screenshot pages. */
function ExperienceFrame({ centerBrand = false, children, onBack }: { centerBrand?: boolean; children: ReactNode; onBack?: () => void }) {
  return (
    <div className="space-y-7 pt-8 md:pt-2">
      {(onBack || centerBrand) ? (
        <div className={`flex items-center ${centerBrand ? "justify-between" : "justify-start"}`}>
          {onBack ? (
            <button type="button" aria-label="Go back" onClick={onBack} className="grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border)] bg-black/48 text-[var(--sb-gold)] backdrop-blur-xl">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
          ) : <span className="h-14 w-14" />}
          {centerBrand ? <span className="flex items-center gap-3">{iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={48} /> : null}<span className="editorial-title text-lg tracking-[0.32em] text-white">Sushi<br />Bliss</span></span> : null}
          {centerBrand ? <span className="h-14 w-14" /> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** Displays a section title with optional action text and icon. */
function ExperienceSectionHeading({ action, icon, onAction, title }: { action?: string; icon?: string; onAction?: () => void; title: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-3 text-xl uppercase tracking-[0.12em] text-[var(--sb-gold)]">
        {icon ? <AssetIcon src={icon} size={26} /> : null}
        {title}
      </h2>
      {action ? <button type="button" onClick={onAction} className="flex items-center gap-2 text-[var(--sb-red-bright)]">{action}<ChevronRight className="h-4 w-4" /></button> : null}
    </div>
  );
}

/** Renders screenshot-like pill tabs with the first option selected. */
function SegmentedTabs({ labels }: { labels: string[] }) {
  const gridClass = labels.length === 5 ? "grid-cols-5 min-w-[720px]" : labels.length === 4 ? "grid-cols-4" : labels.length === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="overflow-x-auto">
      <div className={`grid overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/44 p-1 ${gridClass}`}>
        {labels.map((label, index) => (
          <button key={label} type="button" className={`h-12 rounded-[14px] text-sm uppercase tracking-[0.12em] ${index === 0 ? "bg-[var(--sb-red)]/42 text-white shadow-[0_0_20px_var(--sb-red-glow)]" : "text-white/70"}`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Displays one offer row in the offers index. */
function OfferRow({ offer, onClick }: { offer: OfferItem; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="grid min-h-[126px] w-full grid-cols-[76px_1fr_120px_auto] items-center gap-4 rounded-[16px] border border-[var(--sb-border)] bg-black/46 p-4 text-left">
      <span className="grid h-16 w-16 place-items-center rounded-full border border-[var(--sb-border)] bg-black/42">{offer.icon ? <AssetIcon src={offer.icon} size={34} /> : <Ticket className="h-7 w-7 text-[var(--sb-gold)]" />}</span>
      <span>
        <span className="editorial-title block text-xl uppercase text-white">{offer.title}</span>
        <span className="mt-1 block text-sm text-[var(--sb-muted)]">{offer.copy}</span>
        <span className="mt-2 block text-xs uppercase tracking-[0.14em] text-[var(--sb-gold)]">{offer.meta}</span>
      </span>
      <span className="hidden h-20 overflow-hidden rounded-xl border border-[var(--sb-border)] md:block">{offer.image ? <Image src={offer.image} alt="" width={120} height={80} className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-2xl text-[var(--sb-red-bright)]">{offer.badge}</span>}</span>
      <ChevronRight className="h-5 w-5 text-[var(--sb-gold)]" />
    </button>
  );
}

/** Displays one two-column offer metadata metric. */
function OfferCodeMetric({ icon, label, value }: { icon?: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[56px_1fr] items-center gap-4">
      <span className="grid h-12 w-12 place-items-center rounded-xl border border-[var(--sb-border)]">{icon ? <AssetIcon src={icon} size={30} /> : null}</span>
      <span><span className="block text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{label}</span><span className="mt-1 block whitespace-pre-line text-xl text-white">{value}</span></span>
    </div>
  );
}

/** Displays recipient rows for the gift selection form. */
function GiftRecipientForm() {
  return (
    <section>
      <ExperienceSectionHeading title="Recipient Details" />
      <div className="mt-4 divide-y divide-[var(--sb-border)] overflow-hidden rounded-[16px] border border-[var(--sb-border)] bg-black/42">
        {[
          [iconAssets.profile, "Recipient Name", "Alex Thompson"],
          [iconAssets.email, "Email Address", "alex.thompson@email.com"],
          [iconAssets.calendar, "Delivery Date", "Feb 14, 2025"],
        ].map(([icon, label, value]) => (
          <button key={String(label)} type="button" className="grid w-full grid-cols-[42px_1fr_auto] items-center gap-3 p-4 text-left">
            {typeof icon === "string" ? <AssetIcon src={icon} size={28} /> : null}
            <span className="text-lg text-white">{label}</span>
            <span className="text-[var(--sb-muted)]">{value}<ChevronRight className="ml-3 inline h-4 w-4 text-[var(--sb-gold)]" /></span>
          </button>
        ))}
      </div>
    </section>
  );
}

/** Displays one gift delivery method card. */
function GiftMethodCard({ active = false, copy, icon, title }: { active?: boolean; copy: string; icon?: string; title: string }) {
  return (
    <button type="button" className={`grid min-h-[92px] grid-cols-[48px_1fr_auto] items-center gap-4 rounded-[16px] border bg-black/42 p-4 text-left ${active ? "border-[var(--sb-red-bright)] shadow-[0_0_22px_var(--sb-red-glow)]" : "border-[var(--sb-border)]"}`}>
      {icon ? <AssetIcon src={icon} size={32} /> : null}
      <span><span className="block text-lg uppercase tracking-[0.12em] text-white">{title}</span><span className="text-sm text-[var(--sb-muted)]">{copy}</span></span>
      {active ? <Check className="h-6 w-6 text-[var(--sb-red-bright)]" /> : null}
    </button>
  );
}

/** Displays a boxed review panel used in the gift checkout flow. */
function ReviewPanel({ rows, title }: { rows: string[]; title: string }) {
  return (
    <section className="luxury-panel p-5">
      <ExperienceSectionHeading title={title} action="Edit" />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => <p key={row} className="rounded-xl border border-[var(--sb-border)] bg-black/30 p-3 text-[var(--sb-muted)]">{row}</p>)}
      </div>
    </section>
  );
}

/** Displays one summary line in payment/checkout panels. */
function SummaryRow({ label, strong = false, value }: { label: string; strong?: boolean; value: string }) {
  return <div className="flex justify-between gap-4"><span className={strong ? "uppercase tracking-[0.14em] text-[var(--sb-gold)]" : "text-[var(--sb-muted)]"}>{label}</span><span className={strong ? "text-3xl text-[var(--sb-gold)]" : "text-white"}>{value}</span></div>;
}

/** Displays one saved menu item row. */
function SavedItemRow({ item, onAddToCart, onSelectItem }: { item: SushiMenuItem; onAddToCart: (item: SushiMenuItem) => void; onSelectItem: (item: SushiMenuItem) => void }) {
  return (
    <article className="grid overflow-hidden rounded-[16px] border border-[var(--sb-border)] bg-black/46 md:grid-cols-[320px_1fr_220px]">
      <button type="button" onClick={() => onSelectItem(item)} className="relative min-h-[160px]"><Image src={item.image.publicUrl} alt="" fill sizes="320px" className="object-cover" /></button>
      <div className="p-5">
        <h3 className="text-2xl text-white">{item.name} <Heart className="inline h-5 w-5 fill-[var(--sb-red-bright)] text-[var(--sb-red-bright)]" /></h3>
        <p className="mt-1 text-[var(--sb-muted)]">{item.description}</p>
        <p className="mt-4 text-2xl text-[var(--sb-gold)]">{formatCurrency(item.price)}</p>
      </div>
      <div className="grid gap-3 p-5">
        <Button variant="outline" className="rounded-[14px] border-[var(--sb-border)] bg-black/30 text-[var(--sb-gold)]" onClick={() => onAddToCart(item)}>Add</Button>
        <Button variant="outline" className="rounded-[14px] border-[var(--sb-border)] bg-black/30 text-[var(--sb-gold)]" onClick={() => onSelectItem(item)}>View Details</Button>
      </div>
    </article>
  );
}

/** Displays one saved or viewed experience row. */
function SavedExperienceRow({ copy, image, onClick, title }: { copy: string; image?: string; onClick: () => void; title: string }) {
  return (
    <button type="button" onClick={onClick} className="grid w-full overflow-hidden rounded-[16px] border border-[var(--sb-border)] bg-black/46 text-left md:grid-cols-[320px_1fr_220px]">
      <span className="relative min-h-[140px]"><Image src={image ?? featuredAssets.heroSushi.publicUrl} alt="" fill sizes="320px" className="object-cover" /></span>
      <span className="p-5"><span className="block text-2xl text-white">{title} <Heart className="inline h-5 w-5 fill-[var(--sb-red-bright)] text-[var(--sb-red-bright)]" /></span><span className="mt-2 block text-[var(--sb-muted)]">{copy}</span><span className="mt-3 inline-block rounded-full border border-[var(--sb-border)] px-3 py-1 text-xs uppercase text-[var(--sb-gold)]">Most Loved</span></span>
      <span className="flex items-center justify-end p-5"><span className="rounded-[14px] border border-[var(--sb-border)] px-5 py-3 text-[var(--sb-gold)]">View Details</span></span>
    </button>
  );
}

/** Displays one recently viewed item row. */
function ViewedItemRow({ item, onSelectItem, time }: { item: SushiMenuItem; onSelectItem: (item: SushiMenuItem) => void; time: string }) {
  return (
    <article className="grid overflow-hidden rounded-[16px] border border-[var(--sb-border)] bg-black/46 md:grid-cols-[320px_1fr_220px]">
      <button type="button" onClick={() => onSelectItem(item)} className="relative min-h-[150px]"><Image src={item.image.publicUrl} alt="" fill sizes="320px" className="object-cover" /></button>
      <div className="p-5">
        <span className="rounded-full bg-[var(--sb-red)] px-3 py-1 text-xs uppercase text-white">Dish</span>
        <h3 className="mt-3 text-2xl text-white">{item.name}</h3>
        <p className="mt-1 text-[var(--sb-muted)]">{item.description}</p>
        <p className="mt-2 text-xl text-[var(--sb-gold)]">{formatCurrency(item.price)}</p>
        <p className="mt-2 flex items-center gap-2 text-sm text-[var(--sb-muted)]"><Clock3 className="h-4 w-4" /> Viewed at {time}</p>
      </div>
      <div className="grid gap-3 p-5">
        <Button variant="outline" className="rounded-[14px] border-[var(--sb-border)] bg-black/30 text-[var(--sb-gold)]" onClick={() => onSelectItem(item)}>View Again</Button>
      </div>
    </article>
  );
}

/** Displays one location details line with icon and detail copy. */
function LocationDetailLine({ detail, icon, label, value }: { detail: string; icon?: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[70px_1fr_1fr] gap-4 py-4">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--sb-border)]">{icon ? <AssetIcon src={icon} size={32} /> : null}</span>
      <span><span className="block text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{label}</span><span className="mt-1 block text-white">{value}</span></span>
      <span className="text-[var(--sb-muted)]">{detail}</span>
    </div>
  );
}
