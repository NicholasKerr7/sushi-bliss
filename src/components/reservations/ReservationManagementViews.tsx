import Image from "next/image";
import { ChevronRight, Info, Minus, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { getAppContent, getAssetById, getFeaturedAssets, getItemById } from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import {
  createLocalDateTimeValue,
  getReservationSlots,
  occasionOptions,
  parseReservationDateTime,
  seatingOptions,
  validateReservationForm,
  type Reservation,
  type ReservationFormState,
} from "../../lib/reservation-utils";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import type { GuestProfile } from "../profile/types";
import { Button } from "../ui/button";

interface ReservationManagementProps {
  profile: GuestProfile;
  reservations: Reservation[];
  onCancelReservation: (reservationId: number) => void;
  onNavigate: (view: AppView) => void;
  onUpdateReservation: (reservation: Reservation) => void;
  showNotice: (message: string, tone?: "success" | "error" | "info") => void;
}

const appContent = getAppContent();
const featuredAssets = getFeaturedAssets();
const iconAssets = getSushiIconAssets();
const reservationHero = getItemById("otoro-nigiri")?.image.publicUrl ?? featuredAssets.heroSushi.publicUrl;
const atmosphereImage = getAssetById("moody-japanese-inspired-dining-ambiance-at-night")?.publicUrl ?? featuredAssets.heroSushi.publicUrl;

/** Converts a stored reservation into the editable form shape used by the modify page. */
function createReservationFormFromReservation(reservation: Reservation, profile: GuestProfile): ReservationFormState {
  const parsed = parseReservationDateTime(reservation.datetime);
  return {
    date: parsed.date,
    time: parsed.time,
    guests: reservation.guests,
    name: reservation.name || profile.name,
    phone: reservation.phone || profile.phone,
    seating: reservation.seating,
    occasion: reservation.occasion,
    notes: reservation.notes,
  };
}

/** Formats stored or edited reservation form fields into the exact row text needed by summary cards. */
function getReservationDisplayRows(form: ReservationFormState) {
  const date = new Date(`${form.date}T12:00`);
  const timeSlot = getReservationSlots(form.date, form.guests, []).find((slot) => slot.time === form.time);
  return [
    { icon: iconAssets.calendar, label: "Date", value: date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) },
    { icon: iconAssets.clock, label: "Time", value: timeSlot?.label ?? form.time },
    { icon: iconAssets.group, label: "Party Size", value: `${form.guests} Guests` },
    { icon: iconAssets.dining, label: "Experience", value: getSeatingLabel(form.seating) },
    { icon: iconAssets.calendar, label: "Occasion", value: form.occasion === "Birthday" ? "Birthday Celebration" : form.occasion },
  ];
}

/** Returns the polished seating label for reservation summary and screenshot copy. */
function getSeatingLabel(seating: ReservationFormState["seating"]): string {
  if (seating === "Counter") return "Chef's Counter";
  if (seating === "Dining Room") return "Main Dining Room";
  return "Outdoor Lantern Terrace";
}

/** Builds a small date option list anchored around the current reservation date. */
function getDateOptions(currentDate: string): string[] {
  const baseDate = currentDate ? new Date(`${currentDate}T12:00`) : new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

/** Renders the screenshot-inspired modify reservation form with validation and persistence. */
export function ModifyReservationView({
  profile,
  reservations,
  onNavigate,
  onUpdateReservation,
  showNotice,
}: ReservationManagementProps) {
  const reservation = reservations[0];
  const [form, setForm] = useState<ReservationFormState>(() =>
    reservation
      ? createReservationFormFromReservation(reservation, profile)
      : {
          date: "",
          time: "",
          guests: 2,
          name: profile.name,
          phone: profile.phone,
          seating: "Dining Room",
          occasion: "Birthday",
          notes: "",
        }
  );
  const dateOptions = useMemo(() => getDateOptions(form.date), [form.date]);
  const slots = useMemo(() => getReservationSlots(form.date, form.guests, reservations, reservation?.id ?? null), [form.date, form.guests, reservation?.id, reservations]);
  const currentRows = reservation ? getReservationDisplayRows(createReservationFormFromReservation(reservation, profile)) : [];
  const updatedRows = getReservationDisplayRows(form);

  /** Saves the edited reservation after checking availability and required fields. */
  const saveChanges = () => {
    if (!reservation) {
      showNotice("No reservation is available to modify.", "error");
      return;
    }
    const validation = validateReservationForm(form, reservations, reservation.id);
    if (!validation.valid) {
      showNotice(validation.message, "error");
      return;
    }
    onUpdateReservation({
      ...reservation,
      datetime: createLocalDateTimeValue(form.date, form.time),
      guests: form.guests,
      name: form.name.trim(),
      phone: form.phone.trim(),
      seating: form.seating,
      occasion: form.occasion,
      notes: form.notes.trim(),
    });
  };

  if (!reservation) {
    return <ReservationEmptyState onNavigate={onNavigate} title="No Reservation Found" copy="Create a reservation before trying to modify it." />;
  }

  return (
    <section className="space-y-5 pt-8 md:pt-2">
      <div className="luxury-panel relative min-h-[320px] overflow-hidden p-6 sm:p-10">
        <Image src={reservationHero} alt="" fill sizes="100vw" className="object-cover opacity-72" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/64 to-black/18" />
        <div className="smoke-overlay absolute inset-0" />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_330px]">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--sb-gold)]">Manage Your Reservation</p>
            <h1 className="editorial-title mt-4 text-[48px] leading-[0.92] text-white sm:text-[78px]">
              Modify
              <span className="block text-[var(--sb-red-bright)]">Reservation</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-[var(--sb-gold)]">Update your reservation details below. We look forward to welcoming you.</p>
          </div>
          <aside className="rounded-[18px] border border-[var(--sb-border-strong)] bg-black/56 p-5 backdrop-blur-xl">
            <h2 className="editorial-title text-xl text-white">Your Reservation</h2>
            <div className="mt-5 space-y-4 text-sm text-white/74">
              <ReservationMiniLine icon={iconAssets.gift} label={`Confirmation # ${reservation.confirmationCode.replace("SB-RSV-", "SB")}`} />
              <ReservationMiniLine icon={iconAssets.calendar} label={`Booked on ${new Date(reservation.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`} />
            </div>
            <Button variant="outline" className="mt-6 h-12 w-full rounded-[14px] border-[rgba(239,47,37,0.5)] bg-black/30 uppercase tracking-[0.14em] text-[var(--sb-red-bright)]" onClick={() => onNavigate("cancelReservation")}>
              Cancel Reservation
            </Button>
          </aside>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="luxury-panel p-5 sm:p-6">
          <h2 className="flex items-center gap-3 editorial-title text-2xl text-white">
            {iconAssets.calendar ? <AssetIcon src={iconAssets.calendar} size={28} /> : null}
            Edit Reservation Details
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <ModifyField label="Date" icon={iconAssets.calendar}>
              <select value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="h-14 w-full rounded-[12px] border border-[var(--sb-border)] bg-black/42 px-4 text-white">
                {dateOptions.map((date) => (
                  <option key={date} value={date}>
                    {new Date(`${date}T12:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </option>
                ))}
              </select>
            </ModifyField>
            <ModifyField label="Time" icon={iconAssets.clock}>
              <select value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} className="h-14 w-full rounded-[12px] border border-[var(--sb-border)] bg-black/42 px-4 text-white">
                {slots.map((slot) => (
                  <option key={slot.time} value={slot.time} disabled={slot.disabled}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </ModifyField>
            <ModifyField label="Party Size" icon={iconAssets.group}>
              <div className="grid h-14 grid-cols-[56px_1fr_56px] rounded-[12px] border border-[var(--sb-border)] bg-black/42">
                <button type="button" onClick={() => setForm((current) => ({ ...current, guests: Math.max(1, current.guests - 1) }))} className="grid place-items-center text-[var(--sb-gold)]">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="grid place-items-center border-x border-[var(--sb-border)] text-white">{form.guests} Guests</span>
                <button type="button" onClick={() => setForm((current) => ({ ...current, guests: Math.min(8, current.guests + 1) }))} className="grid place-items-center text-[var(--sb-gold)]">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </ModifyField>
            <ModifyField label="Experience" icon={iconAssets.dining}>
              <select value={form.seating} onChange={(event) => setForm((current) => ({ ...current, seating: event.target.value as ReservationFormState["seating"] }))} className="h-14 w-full rounded-[12px] border border-[var(--sb-border)] bg-black/42 px-4 text-white">
                {seatingOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="mt-2 text-sm text-[var(--sb-muted)]">Elegant ambiance with full menu available</p>
            </ModifyField>
            <ModifyField label="Special Occasion (Optional)" icon={iconAssets.calendar}>
              <select value={form.occasion} onChange={(event) => setForm((current) => ({ ...current, occasion: event.target.value as ReservationFormState["occasion"] }))} className="h-14 w-full rounded-[12px] border border-[var(--sb-border)] bg-black/42 px-4 text-white">
                {occasionOptions.map((occasion) => (
                  <option key={occasion} value={occasion}>{occasion === "Birthday" ? "Birthday Celebration" : occasion}</option>
                ))}
              </select>
            </ModifyField>
            <ModifyField label="Notes (Optional)" icon={iconAssets.email}>
              <textarea
                value={form.notes}
                maxLength={250}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="min-h-[132px] w-full rounded-[12px] border border-[var(--sb-border)] bg-black/42 px-4 py-3 text-white outline-none placeholder:text-[var(--sb-muted)]"
                placeholder="We're celebrating a special birthday. Looking forward to an amazing experience!"
              />
              <p className="mt-1 text-right text-xs text-[var(--sb-muted)]">{form.notes.length}/250</p>
            </ModifyField>
          </div>
        </section>

        <section className="luxury-panel p-5 sm:p-6">
          <h2 className="flex items-center gap-3 editorial-title text-2xl text-white">
            {iconAssets.calendar ? <AssetIcon src={iconAssets.calendar} size={28} /> : null}
            Change Summary
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <ReservationSummaryColumn eyebrow="Current Reservation" rows={currentRows} />
            <ReservationSummaryColumn eyebrow="Updated To" highlightIndex={1} rows={updatedRows} />
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-[12px] border border-[var(--sb-border-strong)] bg-[rgba(202,164,93,0.08)] p-4 text-sm text-white/72">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sb-gold)]" />
            Please review your changes before saving.
          </div>
          <Button className="red-glow-button mt-5 h-14 w-full rounded-[14px] uppercase tracking-[0.16em]" onClick={saveChanges}>
            Save Changes
            <ChevronRight className="ml-3 h-4 w-4" />
          </Button>
        </section>
      </div>
    </section>
  );
}

/** Wraps one labeled form field in the modify reservation layout. */
function ModifyField({ children, icon, label }: { children: ReactNode; icon?: string; label: string }) {
  return (
    <div>
      <span className="mb-3 flex items-center gap-3 text-sm uppercase tracking-[0.16em] text-white">
        {icon ? <AssetIcon src={icon} size={24} /> : null}
        {label}
      </span>
      {children}
    </div>
  );
}

/** Displays a compact icon line in the reservation side card. */
function ReservationMiniLine({ icon, label }: { icon?: string; label: string }) {
  return (
    <p className="flex items-center gap-3">
      {icon ? <AssetIcon src={icon} size={24} /> : null}
      {label}
    </p>
  );
}

/** Renders one current/updated reservation summary column. */
function ReservationSummaryColumn({ eyebrow, highlightIndex, rows }: { eyebrow: string; highlightIndex?: number; rows: ReturnType<typeof getReservationDisplayRows> }) {
  return (
    <div>
      <p className="mb-4 text-sm uppercase tracking-[0.18em] text-[var(--sb-gold)]">{eyebrow}</p>
      <div className="space-y-4">
        {rows.map((row, index) => (
          <p key={`${eyebrow}-${row.label}`} className="grid grid-cols-[30px_1fr] items-center gap-3 text-sm">
            {row.icon ? <AssetIcon src={row.icon} size={23} /> : null}
            <span className={highlightIndex === index ? "text-[var(--sb-red-bright)]" : "text-white/80"}>{row.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

/** Renders the cancel reservation screenshot as a centered modal over reservation context. */
export function CancelReservationView({ profile, reservations, onCancelReservation, onNavigate }: ReservationManagementProps) {
  const reservation = reservations[0];
  const [selectedReason, setSelectedReason] = useState("Change of plans");
  const detailRows = reservation
    ? getReservationDisplayRows(createReservationFormFromReservation(reservation, profile))
    : [];
  const reasons = ["Change of plans", "Scheduling conflict", "Found a better option", "Too expensive", "Other (please specify)"];

  if (!reservation) {
    return <ReservationEmptyState onNavigate={onNavigate} title="No Reservation Found" copy="There is no active reservation to cancel." />;
  }

  return (
    <section className="relative space-y-5 pt-8 md:pt-2">
      <button type="button" onClick={() => onNavigate("reservationDetails")} className="flex items-center gap-2 text-sm uppercase tracking-[0.14em] text-[var(--sb-gold)]">
        <ChevronRight className="h-4 w-4 rotate-180" />
        Back to Reservations
      </button>
      <div className="grid gap-5 opacity-40 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="luxury-panel p-6">
          <h1 className="editorial-title text-2xl text-[var(--sb-gold)]">Reservation Details</h1>
          <div className="mt-6 space-y-5">
            {detailRows.map((row) => (
              <ReservationCancelDetail key={row.label} icon={row.icon} label={row.label} value={row.value} />
            ))}
          </div>
          <div className="gold-divider my-6" />
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--sb-gold)]">Reservation ID: {reservation.confirmationCode.replace("SB-RSV-", "#SB")}</p>
        </section>
        <section className="luxury-panel overflow-hidden p-0">
          <div className="relative min-h-[320px]">
            <Image src={atmosphereImage} alt="" fill sizes="900px" className="object-cover" />
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Button variant="outline" className="h-14 rounded-[14px] border-[var(--sb-border-strong)] bg-black/30 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => onNavigate("modifyReservation")}>
              Modify Reservation
            </Button>
            <Button variant="outline" className="h-14 rounded-[14px] border-[rgba(239,47,37,0.5)] bg-black/30 uppercase tracking-[0.14em] text-[var(--sb-red-bright)]">
              Cancel Reservation
            </Button>
          </div>
        </section>
      </div>

      <section className="luxury-panel fixed left-1/2 top-1/2 z-[60] w-[calc(100%-32px)] max-w-[570px] -translate-x-1/2 -translate-y-1/2 p-6 shadow-[0_34px_120px_rgba(0,0,0,0.86)] sm:p-8">
        <button type="button" aria-label="Keep reservation" onClick={() => onNavigate("reservationDetails")} className="absolute right-5 top-5 text-[var(--sb-gold)]">
          <X className="h-6 w-6" />
        </button>
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[var(--sb-red-bright)] bg-[var(--sb-red)]/18 text-[var(--sb-gold)] shadow-[0_0_28px_var(--sb-red-glow)]">!</span>
          <h2 className="editorial-title mt-5 text-3xl text-white">
            Cancel <span className="text-[var(--sb-red-bright)]">Reservation</span>
          </h2>
          <p className="mt-3 text-[var(--sb-gold)]">Are you sure you want to cancel this reservation?</p>
          <p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">Please let us know why so we can serve you better in the future.</p>
        </div>
        <fieldset className="mt-6 rounded-[14px] border border-[var(--sb-border)] bg-black/34 p-4">
          <legend className="px-2 text-sm uppercase tracking-[0.14em] text-[var(--sb-gold)]">Please Share A Reason (Optional)</legend>
          <div className="mt-3 space-y-2">
            {reasons.map((reason) => (
              <label key={reason} className="flex h-9 items-center gap-3 rounded-[10px] border border-white/10 bg-black/28 px-3 text-sm text-white/74">
                <input type="radio" checked={selectedReason === reason} onChange={() => setSelectedReason(reason)} className="accent-[var(--sb-gold)]" />
                {reason}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 space-y-3">
          <PolicyCard icon={iconAssets.check} title="Cancellation Policy" copy="Cancellations made at least 4 hours in advance receive a full refund of any deposit." />
          <PolicyCard icon={iconAssets.creditCard} title="Deposit Refund" copy="$25.00 deposit will be refunded to your original payment method within 3-5 business days." />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" className="h-14 rounded-[14px] border-[var(--sb-border-strong)] bg-black/30 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => onNavigate("reservationDetails")}>
            Keep Reservation
          </Button>
          <Button className="red-glow-button h-14 rounded-[14px] uppercase tracking-[0.14em]" onClick={() => onCancelReservation(reservation.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Cancel Reservation
          </Button>
        </div>
        <p className="mt-4 text-center text-sm text-[var(--sb-muted)]">This action cannot be undone.</p>
      </section>
    </section>
  );
}

/** Displays one dimmed reservation detail behind the cancellation modal. */
function ReservationCancelDetail({ icon, label, value }: { icon?: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[40px_1fr] gap-3">
      {icon ? <AssetIcon src={icon} size={28} /> : null}
      <span>
        <span className="block text-xs uppercase tracking-[0.16em] text-[var(--sb-muted)]">{label}</span>
        <span className="mt-1 block text-lg text-white">{value}</span>
      </span>
    </div>
  );
}

/** Displays one policy note inside the cancel confirmation modal. */
function PolicyCard({ copy, icon, title }: { copy: string; icon?: string; title: string }) {
  return (
    <div className="grid grid-cols-[42px_1fr] gap-3 rounded-[14px] border border-[var(--sb-border)] bg-black/34 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] bg-black/40">
        {icon ? <AssetIcon src={icon} size={24} /> : null}
      </span>
      <span>
        <span className="block text-sm uppercase tracking-[0.14em] text-[var(--sb-gold)]">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-[var(--sb-muted)]">{copy}</span>
      </span>
    </div>
  );
}

/** Shows a focused empty state when reservation management is opened without data. */
function ReservationEmptyState({ copy, onNavigate, title }: { copy: string; onNavigate: (view: AppView) => void; title: string }) {
  return (
    <section className="luxury-panel mx-auto mt-20 max-w-2xl p-8 text-center">
      <h1 className="editorial-title text-4xl text-white">{title}</h1>
      <p className="mt-4 text-[var(--sb-muted)]">{copy}</p>
      <Button className="red-glow-button mt-6 h-12 rounded-[14px] uppercase tracking-[0.14em]" onClick={() => onNavigate("reservations")}>
        Open Reservations
      </Button>
    </section>
  );
}
