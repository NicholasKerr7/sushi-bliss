import Image from "next/image";
import { Check, ChevronRight, ShieldCheck } from "lucide-react";
import {
  getAssetById,
  getAssetsByFolder,
  getFeaturedAssets,
  getItemById,
  getMasterChefsOmakaseExperience,
} from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import { formatCurrency } from "../../lib/format-utils";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";

interface OmakasePackageReviewViewProps {
  onNavigate: (view: AppView) => void;
}

interface OmakasePackageOption {
  badge?: string;
  copy: string;
  courseCount: string;
  id: string;
  image: string;
  pricePerGuest: number;
  title: string;
}

interface OmakaseCoursePreview {
  copy: string;
  image: string;
  sequence: number;
  title: string;
}

interface OmakaseReviewPricing {
  experienceSubtotal: number;
  itemizedServiceFee?: number;
  itemizedTaxAndFees: number;
  pointsEarned: number;
  sakePairingTotal: number;
  total: number;
}

const featuredAssets = getFeaturedAssets();
const iconAssets = getSushiIconAssets();
const masterExperience = getMasterChefsOmakaseExperience();
const ambienceAssets = getAssetsByFolder("ambience");
const heroImage = getItemById("otoro-nigiri")?.image.publicUrl ?? featuredAssets.heroSushi.publicUrl;
const chefCounterImage =
  ambienceAssets.find((asset) => asset.experienceId === "chef-counter")?.publicUrl ??
  ambienceAssets[1]?.publicUrl ??
  heroImage;
const sakePairingImage = featuredAssets.sakeSets[0]?.publicUrl ?? getAssetById("premium-sake-pairing")?.publicUrl ?? heroImage;

/** Renders the screenshot-driven omakase package review across phone, tablet, and desktop. */
export function OmakasePackageReviewView({ onNavigate }: OmakasePackageReviewViewProps) {
  const packages = getOmakasePackageOptions();
  const selectedPackage = packages[0];
  const coursePreview = getOmakaseCoursePreview();
  const desktopPricing = getDesktopOmakasePricing(selectedPackage);
  const reviewPricing = getTabletReviewPricing();

  return (
    <section className="mx-auto w-full max-w-[1680px] space-y-5 pt-4 md:pt-2">
      <div className="xl:hidden">
        <TabletOmakasePackageReview
          coursePreview={coursePreview}
          onNavigate={onNavigate}
          pricing={reviewPricing}
        />
      </div>
      <div className="hidden xl:block">
        <DesktopOmakasePackageReview
          onNavigate={onNavigate}
          packages={packages}
          pricing={desktopPricing}
          selectedPackage={selectedPackage}
        />
      </div>
    </section>
  );
}

/** Builds the omakase package choices from the app's normalized menu and omakase assets. */
function getOmakasePackageOptions(): OmakasePackageOption[] {
  const firstCourse = masterExperience.courses[0];
  const secondCourse = masterExperience.courses[1];
  const thirdCourse = masterExperience.courses[2];

  return [
    {
      id: "bliss",
      title: "Bliss",
      courseCount: "8 Courses",
      copy: "Our signature omakase featuring premium seasonal selections.",
      pricePerGuest: 120,
      badge: "Most Popular",
      image: getItemById("otoro-nigiri")?.image.publicUrl ?? firstCourse?.specialty.image.publicUrl ?? heroImage,
    },
    {
      id: "harmony",
      title: "Harmony",
      courseCount: "10 Courses",
      copy: "An elevated experience with rare ingredients and refined techniques.",
      pricePerGuest: 160,
      image: firstCourse?.appetizer.image.publicUrl ?? getItemById("salmon-nigiri")?.image.publicUrl ?? heroImage,
    },
    {
      id: "mastery",
      title: "Mastery",
      courseCount: "12 Courses",
      copy: "A masterful journey of exquisite sushi and intricate flavors.",
      pricePerGuest: 220,
      image: thirdCourse?.specialty.image.publicUrl ?? getItemById("uni-gunkan")?.image.publicUrl ?? heroImage,
    },
    {
      id: "legacy",
      title: "Legacy",
      courseCount: "16+ Courses",
      copy: "The ultimate omakase experience. Exclusive, rare, unforgettable.",
      pricePerGuest: 350,
      image: getItemById("truffle-wagyu-nigiri")?.image.publicUrl ?? secondCourse?.specialty.image.publicUrl ?? heroImage,
    },
  ];
}

/** Builds the eight-course preview sequence shown in the package review screenshots. */
function getOmakaseCoursePreview(): OmakaseCoursePreview[] {
  const firstCourse = masterExperience.courses[0];
  const secondCourse = masterExperience.courses[1];
  const thirdCourse = masterExperience.courses[2];
  const fourthCourse = masterExperience.courses[3];

  return [
    {
      sequence: 1,
      title: "Seasonal Appetizer",
      copy: "Chef's seasonal appetizer to begin your journey",
      image: fourthCourse?.appetizer.image.publicUrl ?? firstCourse?.appetizer.image.publicUrl ?? heroImage,
    },
    {
      sequence: 2,
      title: "Sashimi Selection",
      copy: "Premium sashimi, expertly sourced",
      image: firstCourse?.specialty.image.publicUrl ?? getItemById("salmon-sashimi")?.image.publicUrl ?? heroImage,
    },
    {
      sequence: 3,
      title: "Nigiri Course",
      copy: "A curated selection of signature nigiri",
      image: getItemById("salmon-nigiri")?.image.publicUrl ?? heroImage,
    },
    {
      sequence: 4,
      title: "Seasonal Specialty",
      copy: "Chef's special seasonal creation",
      image: thirdCourse?.specialty.image.publicUrl ?? heroImage,
    },
    {
      sequence: 5,
      title: "Grilled Course",
      copy: "Artisan grilled item of the day",
      image: getItemById("unagi-nigiri")?.image.publicUrl ?? secondCourse?.specialty.image.publicUrl ?? heroImage,
    },
    {
      sequence: 6,
      title: "Warm Dish",
      copy: "Comforting warm dish to enhance the experience",
      image: secondCourse?.appetizer.image.publicUrl ?? heroImage,
    },
    {
      sequence: 7,
      title: "Hand Roll",
      copy: "Fresh hand roll, crafted to order",
      image: getItemById("salmon-avocado-temaki")?.image.publicUrl ?? heroImage,
    },
    {
      sequence: 8,
      title: "Dessert",
      copy: "Seasonal dessert to conclude",
      image: firstCourse?.dessert.image.publicUrl ?? fourthCourse?.dessert.image.publicUrl ?? heroImage,
    },
  ];
}

/** Recreates the desktop reference's selected Bliss package pricing. */
function getDesktopOmakasePricing(selectedPackage: OmakasePackageOption): OmakaseReviewPricing {
  const guests = 2;
  const experienceSubtotal = selectedPackage.pricePerGuest * guests;
  const itemizedServiceFee = 24;
  const sakePairingTotal = 60;
  const itemizedTaxAndFees = 22.56;
  const total = experienceSubtotal + itemizedServiceFee + sakePairingTotal + itemizedTaxAndFees;

  return {
    experienceSubtotal,
    itemizedServiceFee,
    itemizedTaxAndFees,
    pointsEarned: Math.round(total),
    sakePairingTotal,
    total,
  };
}

/** Recreates the tablet package review's chef counter summary pricing. */
function getTabletReviewPricing(): OmakaseReviewPricing {
  const experienceSubtotal = 360;
  const sakePairingTotal = 60;
  const itemizedTaxAndFees = 35.2;
  const total = experienceSubtotal + sakePairingTotal + itemizedTaxAndFees;

  return {
    experienceSubtotal,
    itemizedTaxAndFees,
    pointsEarned: Math.round(total),
    sakePairingTotal,
    total,
  };
}

/** Renders the desktop package picker and fixed review column. */
function DesktopOmakasePackageReview({
  onNavigate,
  packages,
  pricing,
  selectedPackage,
}: {
  onNavigate: (view: AppView) => void;
  packages: OmakasePackageOption[];
  pricing: OmakaseReviewPricing;
  selectedPackage: OmakasePackageOption;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_468px]">
      <div className="space-y-5">
        <DesktopOmakaseHero onNavigate={onNavigate} />
        <section className="luxury-panel relative overflow-hidden p-5">
          <Image src={heroImage} alt="" fill sizes="1100px" className="object-cover object-right opacity-28" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/72 to-black/28" />
          <div className="relative z-10">
            <h2 className="text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">Choose Your Omakase Package</h2>
            <p className="mt-2 text-sm text-[var(--sb-muted)]">Each experience is crafted by our master chefs, showcasing the art of Edomae sushi.</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-4">
              {packages.map((packageOption) => (
                <OmakasePackageCard key={packageOption.id} packageOption={packageOption} selected={packageOption.id === selectedPackage.id} />
              ))}
            </div>
            <AllPackagesInclude />
          </div>
        </section>
      </div>

      <DesktopReviewSidebar
        onNavigate={onNavigate}
        pricing={pricing}
        selectedPackage={selectedPackage}
      />
    </div>
  );
}

/** Renders the desktop page heading area from the package review screenshot. */
function DesktopOmakaseHero({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  return (
    <header className="relative min-h-[150px] overflow-hidden rounded-[24px] border border-transparent px-1 py-4">
      <Image src={heroImage} alt="" fill sizes="1100px" className="object-cover object-right opacity-26" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/76 to-transparent" />
      <div className="relative z-10">
        <button type="button" onClick={() => onNavigate("reservations")} className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.14em] text-[var(--sb-gold)]">
          <ChevronRight className="h-5 w-5 rotate-180" />
          Reservations
        </button>
        <h1 className="editorial-title mt-5 text-[62px] uppercase leading-none text-white">
          Omakase <span className="text-[var(--sb-red-bright)]">Experience</span>
        </h1>
        <p className="mt-4 text-xl text-[var(--sb-gold)]">An unforgettable journey of precision, passion, and the finest seasonal ingredients.</p>
      </div>
    </header>
  );
}

/** Renders one selectable package option with screenshot-matched imagery and price treatment. */
function OmakasePackageCard({ packageOption, selected }: { packageOption: OmakasePackageOption; selected: boolean }) {
  return (
    <article
      className={`relative min-h-[400px] overflow-hidden rounded-[18px] border bg-black/50 shadow-[0_20px_54px_rgba(0,0,0,0.42)] ${
        selected ? "border-[var(--sb-gold)] shadow-[0_0_28px_rgba(202,164,93,0.2)]" : "border-[var(--sb-border)]"
      }`}
    >
      <div className="relative h-40">
        <Image src={packageOption.image} alt="" fill sizes="260px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/78 to-transparent" />
        {packageOption.badge ? (
          <span className="absolute left-0 top-0 rounded-br-[14px] bg-[var(--sb-red)] px-4 py-2 text-xs uppercase tracking-[0.08em] text-white">
            {packageOption.badge}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-[260px] flex-col items-center p-5 text-center">
        <h3 className="editorial-title text-3xl text-[var(--sb-gold)]">{packageOption.title}</h3>
        <p className="mt-2 text-sm uppercase tracking-[0.16em] text-white">
          <span className="mr-3 text-[var(--sb-gold-soft)]">-</span>
          {packageOption.courseCount}
          <span className="ml-3 text-[var(--sb-gold-soft)]">-</span>
        </p>
        <p className="mt-5 min-h-[72px] text-sm leading-6 text-[var(--sb-muted)]">{packageOption.copy}</p>
        <p className="mt-auto text-3xl text-[var(--sb-gold)]">{formatCurrency(packageOption.pricePerGuest)}</p>
        <p className="text-sm text-[var(--sb-muted)]">per guest</p>
        <span
          className={`mt-5 grid h-8 w-8 place-items-center rounded-full border ${
            selected ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)] text-white shadow-[0_0_20px_var(--sb-red-glow)]" : "border-[var(--sb-gold)] text-[var(--sb-gold)]"
          }`}
        >
          {selected ? <Check className="h-4 w-4" /> : null}
        </span>
      </div>
    </article>
  );
}

/** Renders the package inclusions strip shared by the screenshot layouts. */
function AllPackagesInclude() {
  const inclusions = [
    { icon: iconAssets.chefHat, label: "Chef's Seasonal Selection" },
    { icon: iconAssets.flower, label: "Premium Ingredients" },
    { icon: iconAssets.check, label: "Artful Presentation" },
    { icon: iconAssets.gift, label: "Unmatched Hospitality" },
  ];

  return (
    <div className="mt-6 grid gap-4 rounded-[18px] border border-[var(--sb-border)] bg-black/42 p-5 md:grid-cols-[92px_1fr] md:items-center">
      <span className="grid h-16 w-16 place-items-center rounded-full border border-[var(--sb-border-strong)]">
        {iconAssets.chefHat ? <AssetIcon src={iconAssets.chefHat} size={40} /> : null}
      </span>
      <div>
        <h3 className="editorial-title text-xl uppercase text-[var(--sb-gold)]">All Packages Include</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {inclusions.map((item) => (
            <p key={item.label} className="flex items-center gap-2 text-sm text-[var(--sb-muted)]">
              {item.icon ? <AssetIcon src={item.icon} size={22} /> : null}
              {item.label}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Renders the right desktop reservation review rail. */
function DesktopReviewSidebar({
  onNavigate,
  pricing,
  selectedPackage,
}: {
  onNavigate: (view: AppView) => void;
  pricing: OmakaseReviewPricing;
  selectedPackage: OmakasePackageOption;
}) {
  return (
    <aside className="luxury-panel sticky top-28 h-max p-7">
      <h2 className="text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">Review Your Reservation</h2>
      <div className="mt-5 grid grid-cols-[124px_1fr] gap-4">
        <div className="relative min-h-[88px] overflow-hidden rounded-[12px] border border-[var(--sb-border)]">
          <Image src={selectedPackage.image} alt="" fill sizes="124px" className="object-cover" />
        </div>
        <div>
          <span className="rounded-md border border-[var(--sb-border)] bg-black/42 px-3 py-1 text-xs uppercase text-[var(--sb-gold)]">Selected Package</span>
          <h3 className="editorial-title mt-3 text-2xl text-white">{selectedPackage.title}</h3>
          <p className="text-sm uppercase tracking-[0.12em] text-[var(--sb-muted)]">
            <span className="mr-3 text-[var(--sb-gold)]">-</span>
            {selectedPackage.courseCount}
          </p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-[var(--sb-border)] border-y border-[var(--sb-border)]">
        {[
          { icon: iconAssets.calendar, label: "Date", value: "Friday, May 24, 2024" },
          { icon: iconAssets.clock, label: "Time", value: "7:00 PM" },
          { icon: iconAssets.group, label: "Party Size", value: "2 Guests" },
        ].map((row) => (
          <div key={row.label} className="grid grid-cols-[34px_1fr_auto] items-center gap-3 py-4 text-sm">
            <span>{row.icon ? <AssetIcon src={row.icon} size={24} /> : null}</span>
            <span>
              <span className="mr-8 uppercase tracking-[0.12em] text-[var(--sb-muted)]">{row.label}</span>
              <span className="text-white">{row.value}</span>
            </span>
            <button type="button" onClick={() => onNavigate("reservations")} className="text-[var(--sb-red-bright)]">Change</button>
          </div>
        ))}
      </div>

      <DesktopSakeAddOn />
      <div className="mt-6 space-y-3 text-sm">
        <SummaryRow label="Bliss Omakase (2 Guests)" value={formatCurrency(pricing.experienceSubtotal)} />
        <SummaryRow label="Premium Sake Pairing (2)" value={formatCurrency(pricing.sakePairingTotal)} />
        <SummaryRow label="Service Fee" value={formatCurrency(pricing.itemizedServiceFee ?? 0)} />
        <SummaryRow label="Tax & Fees" value={formatCurrency(pricing.itemizedTaxAndFees)} />
        <div className="gold-divider my-5" />
        <SummaryRow label="Total" value={formatCurrency(pricing.total)} strong />
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-[var(--sb-gold)]">
        {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={20} /> : null}
        You'll earn {pricing.pointsEarned} Bliss Points on this reservation.
      </p>
      <Button className="red-glow-button mt-6 h-16 w-full rounded-[14px] text-base uppercase tracking-[0.16em]" onClick={() => onNavigate("reservationConfirmation")}>
        Confirm Reservation
        <ChevronRight className="ml-3 h-5 w-5" />
      </Button>
      <SecureReservationNote className="mt-5" label="Secure reservation powered by SSL encryption" />
    </aside>
  );
}

/** Renders the selected sake add-on row for the desktop review column. */
function DesktopSakeAddOn() {
  return (
    <section className="mt-5">
      <h3 className="text-sm uppercase tracking-[0.14em] text-[var(--sb-gold)]">Add-On Experience</h3>
      <div className="mt-3 grid grid-cols-[96px_1fr_auto] items-center gap-4 border-b border-[var(--sb-border)] pb-5">
        <div className="relative min-h-[76px] overflow-hidden rounded-[10px] border border-[var(--sb-border)]">
          <Image src={sakePairingImage} alt="" fill sizes="96px" className="object-cover" />
        </div>
        <div>
          <p className="text-white">Premium Sake Pairing</p>
          <p className="mt-1 text-sm leading-5 text-[var(--sb-muted)]">Hand-selected sake perfectly paired with your omakase.</p>
        </div>
        <span className="flex items-center gap-3 text-sm text-white">
          + $60.00
          <span className="grid h-7 w-12 grid-cols-2 items-center rounded-full border border-[var(--sb-red-bright)] bg-[var(--sb-red)]/44 px-1">
            <Check className="h-3.5 w-3.5 text-white" />
            <span className="h-5 w-5 rounded-full bg-white" />
          </span>
        </span>
      </div>
    </section>
  );
}

/** Renders the tablet and mobile package review layout. */
function TabletOmakasePackageReview({
  coursePreview,
  onNavigate,
  pricing,
}: {
  coursePreview: OmakaseCoursePreview[];
  onNavigate: (view: AppView) => void;
  pricing: OmakaseReviewPricing;
}) {
  return (
    <div className="space-y-5">
      <TabletReviewHero onNavigate={onNavigate} />
      <SelectedExperienceCard />
      <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <CoursePreviewPanel courses={coursePreview} />
        <TabletReviewSidePanel />
      </div>
      <TabletReservationSummary onNavigate={onNavigate} pricing={pricing} />
    </div>
  );
}

/** Renders the tablet/mobile heading and hero image from the review screenshot. */
function TabletReviewHero({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  return (
    <header className="relative min-h-[260px] overflow-hidden rounded-[22px] border border-[var(--sb-border)] bg-black/52 p-5 sm:p-7">
      <Image src={heroImage} alt="" fill sizes="100vw" className="object-cover object-right opacity-58" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/96 via-black/74 to-black/16" />
      <div className="relative z-10 max-w-2xl">
        <button type="button" onClick={() => onNavigate("omakase")} className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--sb-gold)] sm:text-sm">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Reservations / Select Omakase / Review
        </button>
        <h1 className="editorial-title text-[38px] uppercase leading-none text-white sm:text-[56px] md:text-[66px]">Omakase Package Review</h1>
        <p className="mt-4 max-w-md text-base leading-7 text-[var(--sb-gold)] sm:text-xl">
          Review your omakase experience and details before confirming your reservation.
        </p>
      </div>
    </header>
  );
}

/** Renders the selected experience summary card above the course review. */
function SelectedExperienceCard() {
  return (
    <section className="luxury-panel grid gap-5 p-4 sm:p-5 md:grid-cols-[280px_1fr] md:items-center">
      <div className="relative min-h-[170px] overflow-hidden rounded-[14px] border border-[var(--sb-border)]">
        <Image src={chefCounterImage} alt="" fill sizes="280px" className="object-cover" />
      </div>
      <div>
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--sb-gold)]">Selected Experience</p>
          <span className="rounded-lg border border-[rgba(239,47,37,0.55)] bg-[var(--sb-red)]/25 px-3 py-1 text-xs uppercase text-[var(--sb-red-bright)]">Most Popular</span>
        </div>
        <h2 className="editorial-title mt-4 text-3xl text-white">Chef's Omakase Experience</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--sb-muted)]">
          An immersive multi-course journey crafted by our master chefs, featuring the finest seasonal ingredients and artisanal techniques.
        </p>
        <div className="mt-6 grid gap-3 text-sm text-[var(--sb-muted)] sm:grid-cols-4">
          <MetaItem icon={iconAssets.clock} label="Approx. 90 min" />
          <MetaItem icon={iconAssets.group} label="2 Guests" />
          <MetaItem icon={iconAssets.dining} label="Chef's Counter" />
          <MetaItem icon={iconAssets.flower} label="Seasonal Selection" />
        </div>
      </div>
    </section>
  );
}

/** Renders one metadata label with a transparent packaged icon. */
function MetaItem({ icon, label }: { icon?: string; label: string }) {
  return (
    <p className="flex items-center gap-2">
      {icon ? <AssetIcon src={icon} size={24} /> : null}
      {label}
    </p>
  );
}

/** Renders the vertical course preview panel with numbered timeline markers. */
function CoursePreviewPanel({ courses }: { courses: OmakaseCoursePreview[] }) {
  return (
    <section className="luxury-panel p-4 sm:p-5">
      <h2 className="text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">Course Preview</h2>
      <div className="relative mt-5 space-y-2 pl-8">
        <span className="absolute bottom-8 left-[19px] top-5 w-px bg-[var(--sb-border-strong)]" />
        {courses.map((course) => (
          <div key={course.sequence} className="relative grid min-h-[64px] grid-cols-[92px_1fr] gap-3 rounded-[12px] border border-[var(--sb-border)] bg-black/34 p-2 sm:grid-cols-[120px_1fr_220px]">
            <span className="absolute -left-[34px] top-4 grid h-7 w-7 place-items-center rounded-full border border-[var(--sb-gold)] bg-black text-xs text-[var(--sb-gold)]">{course.sequence}</span>
            <span className="relative min-h-[56px] overflow-hidden rounded-[10px] border border-[var(--sb-border)]">
              <Image src={course.image} alt="" fill sizes="120px" className="object-cover" />
            </span>
            <span className="self-center text-base text-white sm:text-lg">{course.title}</span>
            <span className="hidden self-center text-sm leading-5 text-[var(--sb-muted)] sm:block">{course.copy}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-[var(--sb-muted)]"><span className="text-[var(--sb-gold)]">*</span>Course items are subject to change based on seasonal availability.</p>
    </section>
  );
}

/** Renders the tablet/mobile right-side seating and sake review stack. */
function TabletReviewSidePanel() {
  return (
    <aside className="space-y-4">
      <section className="luxury-panel p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">
          {iconAssets.dining ? <AssetIcon src={iconAssets.dining} size={28} /> : null}
          Chef's Counter Seating
        </h2>
        <div className="relative mt-5 min-h-[150px] overflow-hidden rounded-[14px] border border-[var(--sb-border)]">
          <Image src={chefCounterImage} alt="" fill sizes="330px" className="object-cover" />
        </div>
        <p className="mt-5 text-sm leading-6 text-[var(--sb-muted)]">
          You'll be seated at our chef's counter for an up-close, personal dining experience. Counter seats are limited and in high demand.
        </p>
      </section>
      <section className="luxury-panel p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">
          {iconAssets.gift ? <AssetIcon src={iconAssets.gift} size={28} /> : null}
          Sake Pairing <span className="text-xs">(Optional)</span>
        </h2>
        <div className="mt-5 grid grid-cols-[116px_1fr] gap-4">
          <div className="relative min-h-[92px] overflow-hidden rounded-[12px] border border-[var(--sb-border)]">
            <Image src={sakePairingImage} alt="" fill sizes="116px" className="object-cover" />
          </div>
          <p className="text-sm leading-6 text-[var(--sb-muted)]">Premium sake pairing curated to complement each course.</p>
        </div>
        <div className="mt-5 space-y-3">
          <SakePairingChoice checked label="Add Sake Pairing" value="+$60.00" />
          <SakePairingChoice label="No, thank you" />
        </div>
      </section>
    </aside>
  );
}

/** Renders one sake add-on choice row. */
function SakePairingChoice({ checked = false, label, value }: { checked?: boolean; label: string; value?: string }) {
  return (
    <button
      type="button"
      className={`grid h-12 w-full grid-cols-[28px_1fr_auto] items-center gap-3 rounded-[12px] border px-3 text-left text-sm ${
        checked ? "border-[var(--sb-border-strong)] bg-black/48 text-white" : "border-[var(--sb-border)] bg-black/28 text-[var(--sb-muted)]"
      }`}
    >
      <span className={`grid h-5 w-5 place-items-center rounded-full border ${checked ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]" : "border-[var(--sb-border-strong)]"}`}>
        {checked ? <Check className="h-3 w-3 text-white" /> : null}
      </span>
      {label}
      {value ? <span className="text-[var(--sb-gold)]">{value}</span> : null}
    </button>
  );
}

/** Renders the bottom reservation summary and continue action. */
function TabletReservationSummary({ onNavigate, pricing }: { onNavigate: (view: AppView) => void; pricing: OmakaseReviewPricing }) {
  return (
    <section className="luxury-panel p-4 sm:p-5">
      <h2 className="text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">Reservation Summary</h2>
      <div className="mt-5 grid gap-3 rounded-[14px] border border-[var(--sb-border)] bg-black/28 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryTile icon={iconAssets.flower} label="Experience" value="Chef's Omakase Experience" />
        <SummaryTile icon={iconAssets.calendar} label="Date & Time" value="Friday, May 24, 2024 7:00 PM" />
        <SummaryTile icon={iconAssets.group} label="Party Size" value="2 Guests" />
        <SummaryTile icon={iconAssets.dining} label="Seating" value="Chef's Counter" />
        <SummaryTile icon={iconAssets.gift} label="Sake Pairing" value="Added +$60.00" />
      </div>
      <div className="mt-5 grid gap-4 rounded-[14px] border border-[var(--sb-border)] bg-black/36 p-4 md:grid-cols-4 md:items-center">
        <SummaryRow label="Omakase Experience (2 x $180.00)" value={formatCurrency(pricing.experienceSubtotal)} />
        <SummaryRow label="Sake Pairing (2 x $30.00)" value={formatCurrency(pricing.sakePairingTotal)} />
        <SummaryRow label="Tax & Fees" value={formatCurrency(pricing.itemizedTaxAndFees)} />
        <SummaryRow label="Total" value={formatCurrency(pricing.total)} strong />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-[220px_1fr_330px] md:items-center">
        <Button
          variant="outline"
          className="h-14 rounded-[14px] border-[var(--sb-border-strong)] bg-black/35 uppercase tracking-[0.14em] text-[var(--sb-gold)]"
          onClick={() => onNavigate("omakase")}
        >
          <ChevronRight className="mr-3 h-5 w-5 rotate-180" />
          Back To Selection
        </Button>
        <SecureReservationNote label="Secure checkout powered by SSL encryption" />
        <Button className="red-glow-button h-14 rounded-[14px] uppercase tracking-[0.14em]" onClick={() => onNavigate("reservationReview")}>
          Continue To Reservation
          <ChevronRight className="ml-3 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}

/** Renders one compact summary tile in the package review footer. */
function SummaryTile({ icon, label, value }: { icon?: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[30px_1fr] gap-3 border-b border-[var(--sb-border)] pb-3 last:border-b-0 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3 sm:last:border-r-0">
      <span>{icon ? <AssetIcon src={icon} size={24} /> : null}</span>
      <span>
        <span className="block text-xs uppercase tracking-[0.14em] text-[var(--sb-gold)]">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-white/82">{value}</span>
      </span>
    </div>
  );
}

/** Displays one label/value line for desktop and tablet pricing summaries. */
function SummaryRow({ label, strong = false, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-[var(--sb-gold)]" : "text-[var(--sb-muted)]"}`}>
      <span className={strong ? "editorial-title text-lg uppercase text-white md:text-xl" : "text-sm"}>{label}</span>
      <span className={strong ? "text-3xl text-[var(--sb-gold)]" : "text-sm text-white"}>{value}</span>
    </div>
  );
}

/** Shows the shared SSL/security reassurance line. */
function SecureReservationNote({ className = "", label }: { className?: string; label: string }) {
  return (
    <p className={`flex items-center justify-center gap-2 text-sm text-[var(--sb-muted)] ${className}`}>
      <ShieldCheck className="h-4 w-4 text-[var(--sb-gold)]" />
      {label}
    </p>
  );
}
