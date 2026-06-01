import Image from "next/image";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { getAppContent, getAssetsByFolder, getFeaturedAssets } from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import type { Reservation } from "../../lib/reservation-utils";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import type { GuestProfile } from "../profile/types";
import { Button } from "../ui/button";

interface ReservationConfirmationViewProps {
  profile: GuestProfile;
  reservations: Reservation[];
  onNavigate: (view: AppView) => void;
  showNotice: (message: string, tone?: "success" | "error" | "info") => void;
}

interface ConfirmationRow {
  icon?: string;
  label: string;
  value: string;
  subcopy?: string;
}

const appContent = getAppContent();
const iconAssets = getSushiIconAssets();
const featuredAssets = getFeaturedAssets();
const ambienceAssets = getAssetsByFolder("ambience");

/** Renders the screenshot-matched reservation confirmation page after booking succeeds. */
export function ReservationConfirmationView({ profile, reservations, onNavigate, showNotice }: ReservationConfirmationViewProps) {
  const reservation = reservations[0];

  if (!reservation) {
    return (
      <section className="luxury-panel mx-auto mt-10 max-w-xl p-6 text-center">
        <h1 className="editorial-title text-4xl text-white">No Reservation Found</h1>
        <p className="mt-3 text-[var(--sb-muted)]">Create a reservation and your confirmation will appear here.</p>
        <Button className="red-glow-button mt-6 h-12 rounded-[14px] px-6 uppercase tracking-[0.14em]" onClick={() => onNavigate("reservations")}>
          Reserve A Table
        </Button>
      </section>
    );
  }

  const rows = getConfirmationRows(reservation);
  const confirmationCode = reservation.confirmationCode.replace("SB-RSV-", "SB-");

  return (
    <section className="relative -mx-4 min-h-[calc(100vh-80px)] overflow-hidden px-4 pb-8 pt-10 sm:-mx-6 sm:px-6 lg:mx-0 lg:min-h-0 lg:pt-2">
      <Image src={ambienceAssets[0]?.publicUrl ?? featuredAssets.heroSushi.publicUrl} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-24" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.58),rgba(0,0,0,0.92)_38%,rgba(0,0,0,0.98))]" />

      <header className="mx-auto max-w-4xl text-center">
        <span className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/44 text-[var(--sb-gold)] shadow-[0_0_36px_rgba(202,164,93,0.26)] backdrop-blur-xl">
          {iconAssets.check ? <AssetIcon src={iconAssets.check} size={48} /> : null}
        </span>
        <h1 className="editorial-title mt-7 text-[36px] uppercase leading-none text-white md:text-[52px]">Reservation Confirmed</h1>
        <p className="mt-4 text-lg text-[var(--sb-gold)]">Your exceptional experience awaits.</p>
      </header>

      <section className="luxury-panel mx-auto mt-7 max-w-[860px] p-5 sm:p-7">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--sb-gold)]">Your Reservation Code</p>
          <p className="editorial-title mt-3 text-[50px] leading-none text-[var(--sb-red-bright)] md:text-[68px]">{confirmationCode}</p>
          <div className="gold-divider mx-auto my-6 max-w-xl" />
          <p className="text-sm leading-6 text-[var(--sb-muted)]">
            A confirmation has been sent to <span className="text-[var(--sb-gold)]">{profile.email}</span>
          </p>
        </div>

        <div className="mt-7 divide-y divide-[var(--sb-border)]">
          {rows.map((row) => (
            <ConfirmationDetailRow key={row.label} row={row} />
          ))}
        </div>

        <section className="mt-7 grid gap-4 rounded-[18px] border border-[var(--sb-border)] bg-black/34 p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid grid-cols-[58px_1fr] gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-[14px] border border-[var(--sb-border)] bg-black/40">
              {iconAssets.calendar ? <AssetIcon src={iconAssets.calendar} size={32} /> : <CalendarCheck className="h-6 w-6" />}
            </span>
            <span>
              <span className="block text-sm uppercase tracking-[0.16em] text-[var(--sb-gold)]">Add To Calendar</span>
              <span className="mt-1 block text-sm leading-6 text-[var(--sb-muted)]">Never miss your reservation. Add it to your calendar now.</span>
            </span>
          </div>
          <Button variant="outline" className="h-12 rounded-[12px] border-[var(--sb-border)] bg-black/30 px-6 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => showNotice("Calendar reminder prepared.", "success")}>
            Add To Calendar
          </Button>
        </section>

        <div className="mt-6 grid gap-3">
          <Button className="red-glow-button h-14 rounded-[14px] uppercase tracking-[0.16em]" onClick={() => onNavigate("reservationDetails")}>
            View Reservations
            <ChevronRight className="ml-3 h-4 w-4" />
          </Button>
          <Button variant="outline" className="h-14 rounded-[14px] border-[var(--sb-border)] bg-black/30 uppercase tracking-[0.16em] text-[var(--sb-gold)]" onClick={() => onNavigate("home")}>
            Back To Home
            {iconAssets.orders ? <AssetIcon src={iconAssets.orders} size={22} className="ml-3" /> : null}
          </Button>
        </div>
      </section>
    </section>
  );
}

/** Converts reservation state into the exact confirmation-detail rows shown in the screenshots. */
function getConfirmationRows(reservation: Reservation): ConfirmationRow[] {
  const date = new Date(reservation.datetime);
  return [
    {
      icon: iconAssets.calendar,
      label: "Date",
      value: date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    },
    { icon: iconAssets.clock, label: "Time", value: date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) },
    { icon: iconAssets.group, label: "Party Size", value: `${reservation.guests} Guests` },
    {
      icon: iconAssets.mapPin,
      label: "Location",
      value: appContent.location.label,
      subcopy: `${appContent.location.street.toUpperCase()}, ${appContent.location.city.toUpperCase()}, JAPAN`,
    },
    {
      icon: iconAssets.flower,
      label: "Experience",
      value: getReservationExperienceLabel(reservation),
      subcopy: reservation.seating === "Counter" ? "Premium Omakase" : "Signature Dining",
    },
  ];
}

/** Converts stored seating options to customer-facing confirmation labels. */
function getReservationExperienceLabel(reservation: Reservation): string {
  if (reservation.seating === "Counter") return "Omakase Experience";
  if (reservation.seating === "Dining Room") return "Main Dining Room";
  return "Outdoor Lantern Terrace";
}

/** Displays one icon-led confirmation detail row. */
function ConfirmationDetailRow({ row }: { row: ConfirmationRow }) {
  return (
    <div className="grid grid-cols-[38px_1fr] gap-4 py-4 md:grid-cols-[44px_190px_1fr] md:items-center">
      <span className="grid h-9 w-9 place-items-center text-[var(--sb-gold)]">{row.icon ? <AssetIcon src={row.icon} size={27} /> : null}</span>
      <span className="md:contents">
        <span className="block text-xs uppercase tracking-[0.16em] text-[var(--sb-muted)]">{row.label}</span>
        <span className="mt-2 block text-lg text-white md:mt-0 md:text-right md:text-xl">
          <span className="block">{row.value}</span>
          {row.subcopy ? <span className="mt-1 block text-sm text-[var(--sb-gold)]">{row.subcopy}</span> : null}
        </span>
      </span>
    </div>
  );
}
