import { describe, expect, it } from "vitest";
import {
  createDefaultReservationForm,
  createLocalDateTimeValue,
  getReservationSlots,
  validateReservationForm,
  type Reservation,
} from "../lib/reservation-utils";

const reservation: Reservation = {
  id: 100,
  datetime: "2026-05-26T18:00",
  guests: 8,
  name: "Aki Tanaka",
  phone: "+1 555 0100",
  seating: "Counter",
  occasion: "Dinner",
  notes: "",
  confirmationCode: "SB-RSV-000100",
  createdAt: 100,
};

describe("reservation utilities", () => {
  it("marks a fully booked slot as unavailable for new guests", () => {
    const slots = getReservationSlots("2026-05-26", 1, [reservation]);
    const bookedSlot = slots.find((slot) => slot.time === "18:00");

    expect(bookedSlot?.disabled).toBe(true);
    expect(bookedSlot?.seatsRemaining).toBe(0);
  });

  it("allows the edited reservation to keep its current slot", () => {
    const slots = getReservationSlots("2026-05-26", 8, [reservation], reservation.id);
    const editedSlot = slots.find((slot) => slot.time === "18:00");

    expect(editedSlot?.disabled).toBe(false);
    expect(editedSlot?.seatsRemaining).toBe(8);
  });

  it("validates contact details before confirming a reservation", () => {
    const form = {
      ...createDefaultReservationForm(new Date(2026, 4, 26)),
      date: "2026-05-26",
      time: "18:30",
      guests: 2,
      name: "",
      phone: "555",
    };

    expect(validateReservationForm(form, []).valid).toBe(false);
  });

  it("combines local date and time values for datetime storage", () => {
    expect(createLocalDateTimeValue("2026-05-26", "19:30")).toBe("2026-05-26T19:30");
  });
});
