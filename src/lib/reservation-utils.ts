export const reservationSlotTemplates = [
  { time: "17:00", label: "5:00 PM", service: "Golden hour", capacity: 10 },
  { time: "17:30", label: "5:30 PM", service: "Early omakase", capacity: 8 },
  { time: "18:00", label: "6:00 PM", service: "Chef counter", capacity: 8 },
  { time: "18:30", label: "6:30 PM", service: "Dining room", capacity: 12 },
  { time: "19:00", label: "7:00 PM", service: "Prime seating", capacity: 10 },
  { time: "19:30", label: "7:30 PM", service: "Prime seating", capacity: 10 },
  { time: "20:00", label: "8:00 PM", service: "Late omakase", capacity: 8 },
  { time: "20:30", label: "8:30 PM", service: "Night bar", capacity: 6 },
] as const;

export const seatingOptions = [
  { value: "Counter", label: "Chef Counter", description: "Closest to the omakase action." },
  { value: "Dining Room", label: "Dining Room", description: "A quieter table for conversation." },
  { value: "Window", label: "Window", description: "Low-lit seats with street views." },
] as const;

export const occasionOptions = [
  "Dinner",
  "Date Night",
  "Birthday",
  "Business",
  "Celebration",
] as const;

export type SeatingPreference = (typeof seatingOptions)[number]["value"];
export type ReservationOccasion = (typeof occasionOptions)[number];

export interface Reservation {
  id: number;
  datetime: string;
  guests: number;
  name: string;
  phone: string;
  seating: SeatingPreference;
  occasion: ReservationOccasion;
  notes: string;
  confirmationCode: string;
  createdAt: number;
}

export interface ReservationFormState {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  seating: SeatingPreference;
  occasion: ReservationOccasion;
  notes: string;
}

export interface ReservationDay {
  value: string;
  label: string;
  sublabel: string;
}

export interface ReservationSlot {
  time: string;
  label: string;
  service: string;
  capacity: number;
  seatsRemaining: number;
  disabled: boolean;
}

interface RawReservation {
  id?: unknown;
  datetime?: unknown;
  guests?: unknown;
  name?: unknown;
  phone?: unknown;
  seating?: unknown;
  occasion?: unknown;
  notes?: unknown;
  confirmationCode?: unknown;
  createdAt?: unknown;
}

const defaultSeating: SeatingPreference = "Counter";
const defaultOccasion: ReservationOccasion = "Dinner";

function isRawReservation(value: unknown): value is RawReservation {
  return typeof value === "object" && value !== null;
}

function isSeatingPreference(value: unknown): value is SeatingPreference {
  return seatingOptions.some((option) => option.value === value);
}

function isReservationOccasion(value: unknown): value is ReservationOccasion {
  return occasionOptions.some((option) => option === value);
}

function getStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getNumberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function formatDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildReservationDays(baseDate = new Date(), dayCount = 7): ReservationDay[] {
  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + index);
    return {
      value: formatDateValue(date),
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      sublabel:
        index === 0
          ? "Today"
          : index === 1
            ? "Tomorrow"
            : date.toLocaleDateString(undefined, { weekday: "short" }),
    };
  });
}

export function createDefaultReservationForm(
  baseDate = new Date(),
  guest?: { name?: string; phone?: string }
): ReservationFormState {
  return {
    date: formatDateValue(baseDate),
    time: reservationSlotTemplates[2].time,
    guests: 2,
    name: guest?.name ?? "",
    phone: guest?.phone ?? "",
    seating: defaultSeating,
    occasion: defaultOccasion,
    notes: "",
  };
}

export function createLocalDateTimeValue(dateValue: string, timeValue: string): string {
  return `${dateValue}T${timeValue}`;
}

export function createReservationCode(id: number): string {
  return `SB-RSV-${String(id).slice(-6).padStart(6, "0")}`;
}

export function parseReservationDateTime(datetime: string): { date: string; time: string } {
  const [date = "", timeWithSeconds = ""] = datetime.split("T");
  const time = timeWithSeconds.slice(0, 5);
  return { date, time };
}

export function formatReservationDateTime(datetime: string): string {
  const { date, time } = parseReservationDateTime(datetime);
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return datetime;

  const parsedDate = new Date(year, month - 1, day, hour, minute);
  const formattedDate = parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = parsedDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formattedDate} • ${formattedTime}`;
}

export function getReservationSlots(
  dateValue: string,
  guests: number,
  reservations: Reservation[],
  editingReservationId: number | null = null
): ReservationSlot[] {
  const requestedGuests = Math.max(1, guests);
  return reservationSlotTemplates.map((template) => {
    const bookedSeats = reservations
      .filter((reservation) => {
        const parsed = parseReservationDateTime(reservation.datetime);
        return parsed.date === dateValue && parsed.time === template.time && reservation.id !== editingReservationId;
      })
      .reduce((sum, reservation) => sum + reservation.guests, 0);
    const seatsRemaining = Math.max(0, template.capacity - bookedSeats);

    return {
      ...template,
      seatsRemaining,
      disabled: seatsRemaining < requestedGuests,
    };
  });
}

export function validateReservationForm(
  form: ReservationFormState,
  reservations: Reservation[],
  editingReservationId: number | null = null
): { valid: boolean; message: string } {
  if (!form.date || !form.time) return { valid: false, message: "Choose an available date and time." };
  if (form.guests < 1) return { valid: false, message: "Guests must be at least 1." };
  if (form.guests > 8) return { valid: false, message: "For parties over 8, please call the restaurant." };
  if (!form.name.trim()) return { valid: false, message: "Add a guest name for the reservation." };
  if (!/[0-9+\-() ]{7,}/.test(form.phone.trim())) {
    return { valid: false, message: "Add a valid phone number for reservation updates." };
  }

  const selectedSlot = getReservationSlots(form.date, form.guests, reservations, editingReservationId).find(
    (slot) => slot.time === form.time
  );
  if (!selectedSlot || selectedSlot.disabled) {
    return { valid: false, message: "That reservation slot no longer has enough seats." };
  }

  return { valid: true, message: "" };
}

/** Normalizes saved reservation data so older localStorage entries keep working after the richer booking flow. */
export function hydrateReservations(rawReservations: unknown): Reservation[] {
  if (!Array.isArray(rawReservations)) return [];

  return rawReservations
    .filter(isRawReservation)
    .map((rawReservation, index) => {
      const id = getNumberValue(rawReservation.id, Date.now() + index);
      return {
        id,
        datetime: getStringValue(rawReservation.datetime),
        guests: Math.max(1, getNumberValue(rawReservation.guests, 2)),
        name: getStringValue(rawReservation.name, "Guest"),
        phone: getStringValue(rawReservation.phone),
        seating: isSeatingPreference(rawReservation.seating) ? rawReservation.seating : defaultSeating,
        occasion: isReservationOccasion(rawReservation.occasion) ? rawReservation.occasion : defaultOccasion,
        notes: getStringValue(rawReservation.notes),
        confirmationCode: getStringValue(rawReservation.confirmationCode, createReservationCode(id)),
        createdAt: getNumberValue(rawReservation.createdAt, id),
      };
    })
    .filter((reservation) => Boolean(reservation.datetime));
}
