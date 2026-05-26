import { Calendar, CheckCircle2, Clock3, MessageSquareText, Phone, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  buildReservationDays,
  formatReservationDateTime,
  getReservationSlots,
  occasionOptions,
  seatingOptions,
  type Reservation,
  type ReservationFormState,
} from "../../lib/reservation-utils";

interface ReservationSheetProps {
  form: ReservationFormState;
  reservations: Reservation[];
  editingReservationId: number | null;
  onFormChange: (patch: Partial<ReservationFormState>) => void;
  onSave: () => void;
  onEdit: (reservation: Reservation) => void;
  onCancelReservation: (id: number) => void;
  onClose: () => void;
}

/** Guides guests through a realistic reservation flow with live slot capacity and contact details. */
export function ReservationSheet({
  form,
  reservations,
  editingReservationId,
  onFormChange,
  onSave,
  onEdit,
  onCancelReservation,
  onClose,
}: ReservationSheetProps) {
  const reservationDays = buildReservationDays();
  const slots = getReservationSlots(form.date, form.guests, reservations, editingReservationId);
  const selectedSlot = slots.find((slot) => slot.time === form.time);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-title"
    >
      <motion.section
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 36, opacity: 0 }}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[34px] border border-white/15 bg-brand-midnight/95 p-4 text-white shadow-[0_-20px_80px_rgba(0,0,0,0.7)] sm:max-w-5xl sm:rounded-[34px] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Reservations</p>
            <h2 id="reservation-title" className="text-2xl font-semibold">
              Reserve the Counter
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Pick a live seating window, add the guest details, and keep the confirmation in your profile.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reservations"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.34em] text-white/50">
                <Calendar className="h-4 w-4" />
                Date
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {reservationDays.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    aria-pressed={form.date === day.value}
                    onClick={() => onFormChange({ date: day.value })}
                    className={`rounded-2xl border p-3 text-left transition ${
                      form.date === day.value
                        ? "border-white/60 bg-white/20 text-white"
                        : "border-white/15 bg-white/5 text-white/70 hover:border-white/35 hover:text-white"
                    }`}
                  >
                    <span className="block text-[10px] uppercase tracking-[0.28em]">{day.sublabel}</span>
                    <span className="mt-1 block text-base font-semibold">{day.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.34em] text-white/50">
                  <Clock3 className="h-4 w-4" />
                  Time
                </div>
                {selectedSlot && (
                  <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-50">
                    {selectedSlot.seatsRemaining} seats left
                  </span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={slot.disabled}
                    aria-pressed={form.time === slot.time}
                    onClick={() => onFormChange({ time: slot.time })}
                    className={`rounded-2xl border p-3 text-left transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-white/30 ${
                      form.time === slot.time
                        ? "border-white/60 bg-white/20 text-white"
                        : "border-white/15 bg-white/5 text-white/70 hover:border-white/35 hover:text-white"
                    }`}
                  >
                    <span className="block text-base font-semibold">{slot.label}</span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.24em]">{slot.service}</span>
                    <span className="mt-2 block text-xs">{slot.disabled ? "Waitlist" : `${slot.seatsRemaining} open`}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.34em] text-white/50">
                  <Users className="h-4 w-4" />
                  Guests
                </label>
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/15 bg-black/15 p-2">
                  <button
                    type="button"
                    onClick={() => onFormChange({ guests: Math.max(1, form.guests - 1) })}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-xl transition hover:bg-white/10"
                    aria-label="Decrease guests"
                  >
                    -
                  </button>
                  <span className="text-2xl font-semibold">{form.guests}</span>
                  <button
                    type="button"
                    onClick={() => onFormChange({ guests: Math.min(8, form.guests + 1) })}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-xl transition hover:bg-white/10"
                    aria-label="Increase guests"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.34em] text-white/50">Seating</p>
                <div className="mt-3 grid gap-2">
                  {seatingOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={form.seating === option.value}
                      onClick={() => onFormChange({ seating: option.value })}
                      className={`rounded-2xl border p-3 text-left transition ${
                        form.seating === option.value
                          ? "border-white/60 bg-white/20 text-white"
                          : "border-white/15 bg-white/5 text-white/70 hover:border-white/35 hover:text-white"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className="mt-1 block text-xs text-white/55">{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.34em] text-white/50">Occasion</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {occasionOptions.map((occasion) => (
                  <button
                    key={occasion}
                    type="button"
                    aria-pressed={form.occasion === occasion}
                    onClick={() => onFormChange({ occasion })}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      form.occasion === occasion
                        ? "border-white/60 bg-white/20 text-white"
                        : "border-white/15 bg-white/5 text-white/70 hover:border-white/35 hover:text-white"
                    }`}
                  >
                    {occasion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.34em] text-white/50">
                <Phone className="h-4 w-4" />
                Guest Details
              </div>
              <div className="grid gap-3">
                <div>
                  <label htmlFor="reservation-name" className="text-xs uppercase tracking-[0.28em] text-white/50">
                    Name
                  </label>
                  <Input
                    id="reservation-name"
                    value={form.name}
                    onChange={(event) => onFormChange({ name: event.target.value })}
                    placeholder="Guest name"
                    className="mt-2 h-11 rounded-2xl border-white/20 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div>
                  <label htmlFor="reservation-phone" className="text-xs uppercase tracking-[0.28em] text-white/50">
                    Phone
                  </label>
                  <Input
                    id="reservation-phone"
                    value={form.phone}
                    onChange={(event) => onFormChange({ phone: event.target.value })}
                    placeholder="+1 555 0100"
                    className="mt-2 h-11 rounded-2xl border-white/20 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div>
                  <label htmlFor="reservation-notes" className="text-xs uppercase tracking-[0.28em] text-white/50">
                    Notes
                  </label>
                  <textarea
                    id="reservation-notes"
                    value={form.notes}
                    onChange={(event) => onFormChange({ notes: event.target.value })}
                    placeholder="Allergies, celebrations, accessibility requests..."
                    className="mt-2 min-h-24 w-full rounded-2xl border border-white/20 bg-transparent px-3 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
              <Button
                className="mt-4 w-full rounded-2xl border-0 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 py-3 text-base font-semibold text-white shadow-glow"
                onClick={onSave}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {editingReservationId ? "Update Reservation" : "Confirm Reservation"}
              </Button>
            </div>

            <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.34em] text-white/60">
                <MessageSquareText className="h-4 w-4" />
                Upcoming Tables
              </div>
              {reservations.length === 0 ? (
                <p className="text-sm leading-6 text-white/60">
                  No reservations yet. The next confirmed table will appear here with its confirmation code.
                </p>
              ) : (
                <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                  {reservations.map((reservation) => (
                    <article key={reservation.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                            {reservation.confirmationCode}
                          </p>
                          <h3 className="mt-1 font-semibold">{formatReservationDateTime(reservation.datetime)}</h3>
                          <p className="mt-1 text-sm text-white/60">
                            {reservation.guests} guests • {reservation.seating} • {reservation.occasion}
                          </p>
                        </div>
                        <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-50">
                          Confirmed
                        </span>
                      </div>
                      <div className="mt-3 flex justify-end gap-2 text-xs uppercase tracking-[0.24em]">
                        <button
                          type="button"
                          onClick={() => onEdit(reservation)}
                          className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 transition hover:border-white/40"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onCancelReservation(reservation.id)}
                          className="rounded-full border border-rose-400/60 bg-rose-500/20 px-3 py-1.5 text-rose-100 transition hover:bg-rose-500/30"
                        >
                          Cancel
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
