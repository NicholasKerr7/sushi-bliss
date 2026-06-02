import Image from "next/image";
import { ChevronRight, Info, Pencil, ShieldCheck } from "lucide-react";
import { getAppContent, getFeaturedAssets, getMasterChefsOmakaseExperience } from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import { formatCurrency } from "../../lib/format-utils";
import type { ReservationFormState } from "../../lib/reservation-utils";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";

interface ReservationReviewViewProps {
  form: ReservationFormState;
  onConfirm: () => void;
  onNavigate: (view: AppView) => void;
}

interface ReviewRow {
  icon?: string;
  label: string;
  value: string;
  copy?: string;
}

const appContent = getAppContent();
const iconAssets = getSushiIconAssets();
const featuredAssets = getFeaturedAssets();
const masterExperience = getMasterChefsOmakaseExperience();
const reviewHero = featuredAssets.heroSushi.publicUrl;
const experienceImage = masterExperience.courses[0]?.specialty.image.publicUrl ?? reviewHero;

/** Renders the screenshot-driven reservation review page before final confirmation. */
export function ReservationReviewView({ form, onConfirm, onNavigate }: ReservationReviewViewProps) {
  const rows = getReviewRows(form);
  const pricing = getReservationPricing(form.guests);
  const experienceTitle = getExperienceTitle(form.seating);

  return (
    <section className="mx-auto w-full max-w-[1500px] space-y-5 pt-4 md:pt-2">
      <header className="relative overflow-hidden rounded-[22px] border border-[var(--sb-border)] bg-black/56 p-5 md:p-8">
        <Image src={reviewHero} alt="" fill sizes="100vw" className="object-cover object-[70%_50%] opacity-54" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94),rgba(0,0,0,0.72)_48%,rgba(0,0,0,0.24))]" />
        <div className="relative z-10">
          <button type="button" onClick={() => onNavigate("reservations")} className="mb-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.14em] text-[var(--sb-gold)]">
            <ChevronRight className="h-4 w-4 rotate-180" />
            Reservations / Review
          </button>
          <h1 className="editorial-title max-w-3xl text-[40px] uppercase leading-none text-white md:text-[62px]">Review Your Reservation</h1>
          <p className="mt-4 text-lg text-[var(--sb-gold)]">Please review your details before confirming your reservation.</p>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <section className="luxury-panel p-5 md:p-6">
          <h2 className="text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">Your Reservation Details</h2>
          <div className="mt-5 rounded-[18px] border border-[var(--sb-border)] bg-black/32">
            {rows.map((row) => (
              <ReviewDetailRow key={row.label} row={row} onEdit={() => onNavigate("reservations")} />
            ))}
          </div>
        </section>

        <aside className="luxury-panel h-max overflow-hidden p-0">
          <div className="relative h-64">
            <Image src={experienceImage} alt="" fill sizes="390px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/82 to-transparent" />
          </div>
          <div className="p-5">
            <p className="text-sm uppercase tracking-[0.16em] text-[var(--sb-gold)]">Experience Summary</p>
            <h2 className="editorial-title mt-4 text-2xl text-white">{experienceTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">{getExperienceCopy(form.seating)}</p>
            <div className="gold-divider my-5" />
            <SummaryLine label={`${formatCurrency(pricing.perGuest)} x ${form.guests} Guests`} value={formatCurrency(pricing.subtotal)} />
            <SummaryLine label="Service Charge (10%)" value={formatCurrency(pricing.serviceCharge)} />
            <SummaryLine label="Tax (10%)" value={formatCurrency(pricing.tax)} />
            <div className="gold-divider my-5" />
            <SummaryLine label="Total" value={formatCurrency(pricing.total)} strong />
          </div>
        </aside>
      </div>

      <section className="luxury-panel grid gap-4 p-5 md:grid-cols-[70px_1fr_auto] md:items-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border)] bg-black/38 text-[var(--sb-gold)]">
          <Info className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-sm uppercase tracking-[0.16em] text-[var(--sb-gold)]">Important Information</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">
            A credit card is required to secure your reservation. You may cancel or modify your reservation up to 24 hours in advance with no penalty.
          </p>
        </div>
        <ChevronRight className="hidden h-5 w-5 text-[var(--sb-gold)] md:block" />
      </section>

      <Button className="red-glow-button h-16 w-full rounded-[16px] text-base uppercase tracking-[0.18em]" onClick={onConfirm}>
        Confirm Reservation
        <ChevronRight className="ml-3 h-5 w-5" />
      </Button>
      <p className="flex items-center justify-center gap-2 text-sm text-[var(--sb-muted)]">
        <ShieldCheck className="h-4 w-4 text-[var(--sb-gold)]" />
        Secure reservation. You will not be charged until you dine.
      </p>
    </section>
  );
}

/** Builds the visible detail rows from the in-progress reservation form. */
function getReviewRows(form: ReservationFormState): ReviewRow[] {
  return [
    { icon: iconAssets.mapPin, label: "Restaurant", value: appContent.location.label, copy: `${appContent.location.street}, ${appContent.location.city}, Japan 100-0001` },
    { icon: iconAssets.calendar, label: "Date", value: formatReviewDate(form.date) },
    { icon: iconAssets.clock, label: "Time", value: formatReviewTime(form.time) },
    { icon: iconAssets.group, label: "Party Size", value: `${form.guests} Guests` },
    { icon: iconAssets.dining, label: "Experience", value: getExperienceTitle(form.seating), copy: getExperienceCopy(form.seating) },
    { icon: iconAssets.gift, label: "Occasion", value: getOccasionLabel(form.occasion) },
    { icon: iconAssets.email, label: "Special Requests", value: form.notes.trim() || "No special requests added." },
  ];
}

/** Calculates review-page pricing from the party size. */
function getReservationPricing(guests: number) {
  const perGuest = 180;
  const subtotal = perGuest * guests;
  const serviceCharge = subtotal * 0.1;
  const tax = (subtotal + serviceCharge) * 0.1;
  return { perGuest, subtotal, serviceCharge, tax, total: subtotal + serviceCharge + tax };
}

/** Formats the selected date for the reservation review card. */
function formatReviewDate(dateValue: string): string {
  return new Date(`${dateValue}T12:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/** Formats the selected HH:mm time value for the review screen. */
function formatReviewTime(timeValue: string): string {
  return new Date(`2024-01-01T${timeValue}`).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** Converts saved occasion enum text into polished customer copy. */
function getOccasionLabel(occasion: ReservationFormState["occasion"]): string {
  if (occasion === "Birthday") return "Birthday Celebration";
  if (occasion === "Dinner") return "Dinner";
  return occasion;
}

/** Converts seating options into the review-page experience names. */
function getExperienceTitle(seating: ReservationFormState["seating"]): string {
  if (seating === "Counter") return "Chef's Omakase Experience";
  if (seating === "Dining Room") return "Main Dining Room";
  return "Outdoor Lantern Terrace";
}

/** Describes the selected reservation experience without hardcoding route logic. */
function getExperienceCopy(seating: ReservationFormState["seating"]): string {
  if (seating === "Counter") return "An immersive multi-course journey crafted by our master chefs.";
  if (seating === "Dining Room") return "Elegant dining with full menu access and attentive tableside service.";
  return "A lantern-lit outdoor setting for a relaxed premium evening.";
}

/** Renders one editable detail row in the review page. */
function ReviewDetailRow({ row, onEdit }: { row: ReviewRow; onEdit: () => void }) {
  return (
    <div className="grid gap-3 border-b border-[var(--sb-border)] p-4 last:border-b-0 md:grid-cols-[42px_190px_1fr_auto] md:items-center">
      <span className="grid h-10 w-10 place-items-center text-[var(--sb-gold)]">{row.icon ? <AssetIcon src={row.icon} size={26} /> : null}</span>
      <span className="text-xs uppercase tracking-[0.16em] text-[var(--sb-muted)]">{row.label}</span>
      <span className="text-base text-white md:text-lg">
        <span className="block">{row.value}</span>
        {row.copy ? <span className="mt-1 block text-sm leading-6 text-[var(--sb-muted)]">{row.copy}</span> : null}
      </span>
      <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 text-sm text-[var(--sb-gold)]">
        Edit
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Displays a pricing row in the review summary card. */
function SummaryLine({ label, strong = false, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 text-sm">
      <span className={strong ? "editorial-title text-xl text-white" : "text-[var(--sb-muted)]"}>{label}</span>
      <span className={strong ? "text-3xl text-[var(--sb-gold)]" : "text-white"}>{value}</span>
    </div>
  );
}
