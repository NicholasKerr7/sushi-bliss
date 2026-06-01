import Image from "next/image";
import { ChevronRight, Pencil, Phone, ShieldCheck, Trash2 } from "lucide-react";
import { getAppContent, getFeaturedAssets, getItemById, getMasterChefsOmakaseExperience } from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import { formatCurrency } from "../../lib/format-utils";
import type { Reservation } from "../../lib/reservation-utils";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";
import type { GuestProfile } from "../profile/types";

interface ReservationDetailsViewProps {
  loyaltyPoints: number;
  profile: GuestProfile;
  profileImage: string;
  reservations: Reservation[];
  onNavigate: (view: AppView) => void;
  showNotice: (message: string, tone?: "success" | "error" | "info") => void;
}

const appContent = getAppContent();
const featuredAssets = getFeaturedAssets();
const iconAssets = getSushiIconAssets();
const masterExperience = getMasterChefsOmakaseExperience();

/** Renders a screenshot-aligned reservation detail page for current and demo bookings. */
export function ReservationDetailsView({
  loyaltyPoints,
  profile,
  profileImage,
  reservations,
  onNavigate,
  showNotice,
}: ReservationDetailsViewProps) {
  const reservation = reservations[0];
  const heroImage = getItemById("otoro-nigiri")?.image.publicUrl ?? featuredAssets.heroSushi.publicUrl;
  const selectedExperience = getReservationDisplayExperience(reservation);
  const details = buildReservationDetails(reservation, selectedExperience);
  const depositTotal = reservation ? reservation.guests * 50 : 100;

  return (
    <div className="space-y-6 pt-8 md:pt-2">
      <button
        type="button"
        aria-label="Back to reservations"
        onClick={() => onNavigate("reservations")}
        className="grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border)] bg-black/48 text-[var(--sb-gold)] backdrop-blur-xl transition hover:border-[var(--sb-gold)]"
      >
        <ChevronRight className="h-5 w-5 rotate-180" />
      </button>

      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--sb-gold)] md:hidden">Reservation</p>
        <h1 className="editorial-title mt-2 text-[36px] uppercase leading-none text-[var(--sb-gold)] sm:text-[46px] md:text-[64px] md:text-white">
          Reservation <span className="md:text-[var(--sb-red-bright)]">Details</span>
        </h1>
        <p className="mt-4 hidden text-xl text-[var(--sb-gold)] md:block">Review your details before confirming your reservation.</p>
      </header>

      <section className="luxury-panel mx-auto max-w-[1520px] overflow-hidden p-4 sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
          <div className="space-y-6">
            <div className="grid gap-5 border-b border-[var(--sb-border)] pb-6 md:grid-cols-[160px_1fr_auto] md:items-center">
              <Image src={profileImage} alt={`${profile.name} profile`} width={148} height={148} className="h-32 w-32 rounded-full border border-[var(--sb-gold)] object-cover md:h-36 md:w-36" />
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--sb-gold)]">Reservation For</p>
                <h2 className="editorial-title mt-2 text-4xl text-white md:text-5xl">{profile.name}</h2>
                <p className="mt-3 text-lg text-white/76">
                  Bliss Member <span className="ml-3 rounded-full border border-[var(--sb-border-strong)] px-3 py-1 text-xs uppercase text-[var(--sb-gold)]">Premium</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("loyalty")}
                className="flex h-20 items-center justify-between rounded-2xl border border-[var(--sb-border)] bg-black/36 px-5 text-left transition hover:border-[var(--sb-gold)] md:w-64"
              >
                <span className="flex items-center gap-3">
                  {iconAssets.crown ? <AssetIcon src={iconAssets.crown} size={38} /> : null}
                  <span>
                    <span className="block text-xl text-white">{loyaltyPoints.toLocaleString()} pts</span>
                    <span className="text-sm text-[var(--sb-muted)]">to Next Tier</span>
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 text-[var(--sb-gold)]" />
              </button>
            </div>

            <div className="divide-y divide-[var(--sb-border)]">
              {details.map((detail) => (
                <ReservationDetailLine key={detail.label} {...detail} />
              ))}
            </div>

            <section className="relative overflow-hidden rounded-[18px] border border-[var(--sb-border-strong)] bg-black/40 p-5 md:min-h-[230px]">
              <Image src={heroImage} alt="" fill sizes="(min-width: 1024px) 720px, 100vw" className="object-cover opacity-52" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/58 to-transparent" />
              <div className="relative z-10 max-w-md">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--sb-gold)]">Your Experience</p>
                <h3 className="editorial-title mt-4 text-3xl uppercase text-white">{selectedExperience}</h3>
                <p className="mt-3 text-lg text-white/78">Premium Omakase Experience</p>
                <p className="mt-1 text-sm text-[var(--sb-muted)]">Curated by Master Chefs</p>
                <Button
                  variant="outline"
                  className="mt-6 h-12 rounded-xl border-[var(--sb-border-strong)] bg-black/35 px-5 uppercase tracking-[0.16em] text-[var(--sb-gold)]"
                  onClick={() => onNavigate("omakase")}
                >
                  View Experience Details
                  <ChevronRight className="ml-3 h-4 w-4" />
                </Button>
              </div>
            </section>

            <div className="flex items-center gap-4 rounded-[18px] border border-[var(--sb-border)] bg-black/34 p-4 text-sm leading-6 text-[var(--sb-muted)]">
              <ShieldCheck className="h-7 w-7 shrink-0 text-[var(--sb-gold)]" />
              <p>Free cancellation up to 24 hours before your reservation. We look forward to creating an unforgettable experience for you.</p>
            </div>
          </div>

          <aside className="luxury-panel h-max p-5">
            <h2 className="editorial-title text-2xl uppercase text-[var(--sb-gold)]">Reservation Summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              {details.slice(0, 5).map((detail) => (
                <SummaryLine key={`summary-${detail.label}`} label={detail.label} value={detail.value} />
              ))}
              <div className="gold-divider my-4" />
              <SummaryLine label="Experience Price" value={formatCurrency(180)} />
              <SummaryLine label="Deposit Per Guest" value={formatCurrency(50)} />
              <SummaryLine label="Deposit Due Today" value={formatCurrency(depositTotal)} strong />
            </div>
            <div className="mt-5 rounded-2xl border border-[var(--sb-border)] bg-black/32 p-4 text-sm leading-6 text-[var(--sb-muted)]">
              <p className="font-semibold uppercase tracking-[0.14em] text-[var(--sb-gold)]">Deposit & Cancellation Policy</p>
              <p className="mt-2">A deposit is required to secure your reservation. Cancellations made at least 24 hours in advance receive a full refund.</p>
            </div>
            <Button className="red-glow-button mt-5 h-14 w-full rounded-[16px] uppercase tracking-[0.18em]" onClick={() => showNotice("Reservation confirmed.", "success")}>
              Confirm Reservation
            </Button>
          </aside>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr]">
          <Button className="red-glow-button h-16 rounded-[16px] uppercase tracking-[0.16em]" onClick={() => onNavigate("reservations")}>
            <Pencil className="mr-3 h-5 w-5" />
            Modify Reservation
          </Button>
          <Button variant="outline" className="h-16 rounded-[16px] border-[var(--sb-border-strong)] bg-black/30 uppercase tracking-[0.16em] text-[var(--sb-gold)]" onClick={() => onNavigate("contact")}>
            <Phone className="mr-3 h-5 w-5" />
            Contact Restaurant
          </Button>
          <Button
            variant="outline"
            className="h-16 rounded-[16px] border-[rgba(239,47,37,0.5)] bg-black/30 uppercase tracking-[0.16em] text-[var(--sb-red-bright)]"
            onClick={() => showNotice("Cancellation flow is ready for confirmation.", "info")}
          >
            <Trash2 className="mr-3 h-5 w-5" />
            Cancel Reservation
          </Button>
        </div>
      </section>
    </div>
  );
}

/** Converts reservation data into display rows that match the reference detail layout. */
function buildReservationDetails(reservation: Reservation | undefined, selectedExperience: string) {
  const reservationDate = reservation?.datetime ? new Date(reservation.datetime) : new Date("2024-05-24T19:00");
  const dateText = reservationDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const timeText = reservationDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const guests = reservation?.guests ?? 2;
  const notes = reservation?.notes || "Please prepare a small surprise if possible. Thank you!";
  const occasion =
    reservation?.occasion === "Dinner" || reservation?.occasion === "Birthday"
      ? "Birthday Celebration"
      : reservation?.occasion || "Birthday Celebration";
  const seating = reservation?.seating === "Counter" ? "Counter Seat" : reservation?.seating || "Counter Seat";

  return [
    { icon: iconAssets.calendar, label: "Date", value: dateText },
    { icon: iconAssets.clock, label: "Time", value: timeText },
    { icon: iconAssets.group, label: "Party Size", value: `${guests} Guests` },
    { icon: iconAssets.flower, label: "Experience", value: selectedExperience, badge: "Premium" },
    { icon: iconAssets.mapPin, label: "Location", value: `${appContent.location.label}\n${appContent.location.street}, ${appContent.location.postalLine}` },
    { icon: iconAssets.gift, label: "Special Occasion", value: `${occasion}\n${notes}` },
    { icon: iconAssets.dining, label: "Table Preference", value: `${seating}\nPrefer a quiet spot` },
  ];
}

/** Returns a polished experience label using structured omakase data when available. */
function getReservationDisplayExperience(reservation: Reservation | undefined): string {
  const matchedCourse = masterExperience.courses.find((course) => course.chefId === "hiroshi-tanaka");
  if (reservation?.seating === "Counter") return matchedCourse?.specialty.title ?? masterExperience.title;
  if (reservation?.seating === "Dining Room") return "Sushi Bliss Deluxe";
  return "Lantern Terrace Omakase";
}

/** Displays one reservation detail line with icon, gold label, value, and optional badge. */
function ReservationDetailLine({ badge, icon, label, value }: { badge?: string; icon?: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[42px_130px_1fr] gap-3 py-4 sm:grid-cols-[50px_180px_1fr]">
      <span className="grid h-10 w-10 place-items-center text-[var(--sb-gold)]">{icon ? <AssetIcon src={icon} size={27} /> : null}</span>
      <span className="self-center text-sm uppercase tracking-[0.16em] text-[var(--sb-gold)]">{label}</span>
      <span className="self-center whitespace-pre-line text-base leading-7 text-white sm:text-lg">
        {value}
        {badge ? <span className="ml-3 rounded-full border border-[var(--sb-border-strong)] px-2 py-0.5 text-xs uppercase text-[var(--sb-gold)]">{badge}</span> : null}
      </span>
    </div>
  );
}

/** Renders a compact summary row in the reservation sidebar. */
function SummaryLine({ label, strong = false, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className={strong ? "uppercase tracking-[0.12em] text-[var(--sb-gold)]" : "text-[var(--sb-muted)]"}>{label}</span>
      <span className={`max-w-[190px] whitespace-pre-line text-right ${strong ? "text-xl text-[var(--sb-gold)]" : "text-white"}`}>{value}</span>
    </div>
  );
}
