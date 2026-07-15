import { createAdminClient } from "./pocketbase";

const PB = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";

/** A bookable time. `days` limits it to certain weekdays; empty = every open day. */
export type Slot = { time: string; days: string[] };

export type BookingConfig = {
  openWeekdays: string[]; // e.g. ['ma','di','wo','do','vr','za']
  horizonDays: number;
  leadHours: number;
  blockedDates: string[]; // 'YYYY-MM-DD'
  slots: Slot[];
};

// Map JS Date.getDay() (0=Sun..6=Sat) to our weekday codes.
export const WEEKDAY_CODES = ["zo", "ma", "di", "wo", "do", "vr", "za"];

/** Weekday code for a 'YYYY-MM-DD' string, parsed locally so the TZ can't shift the day. */
export function weekdayOf(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return WEEKDAY_CODES[new Date(y, m - 1, d).getDay()];
}

/** The slots that run on `date`, ignoring what is already booked. */
export function slotsOnDate(slots: Slot[], date: string): string[] {
  const code = weekdayOf(date);
  return slots.filter((s) => !s.days.length || s.days.includes(code)).map((s) => s.time);
}

export async function getBookingConfig(): Promise<BookingConfig> {
  const opts = { next: { revalidate: 60, tags: ["booking-config"] } };
  try {
    const [settingsRes, slotsRes, blockedRes] = await Promise.all([
      fetch(`${PB}/api/collections/settings/records?perPage=1`, opts),
      fetch(`${PB}/api/collections/time_slots/records?perPage=50&sort=sort`, opts),
      fetch(`${PB}/api/collections/blocked_dates/records?perPage=365`, opts),
    ]);
    const settings = (await settingsRes.json()).items?.[0];
    const slots: Slot[] = ((await slotsRes.json()).items ?? []).map((s: any) => ({
      time: s.time,
      // multi-select comes back as an array; tolerate a bare string or null.
      days: Array.isArray(s.days) ? s.days : s.days ? [s.days] : [],
    }));
    const blockedDates: string[] = ((await blockedRes.json()).items ?? []).map((b: any) =>
      String(b.date || "").slice(0, 10),
    );
    return {
      openWeekdays: settings?.open_weekdays ?? ["ma", "di", "wo", "do", "vr", "za"],
      horizonDays: settings?.booking_horizon_days ?? 30,
      leadHours: settings?.lead_time_hours ?? 24,
      blockedDates,
      slots,
    };
  } catch {
    // PB unreachable (e.g. at build time before the container is up) — safe defaults
    // with no open slots; ISR revalidation repopulates once PB is available.
    return {
      openWeekdays: ["ma", "di", "wo", "do", "vr", "za"],
      horizonDays: 30,
      leadHours: 24,
      blockedDates: [],
      slots: [],
    };
  }
}

// Slots that run on this weekday, minus the ones already taken (non-cancelled
// bookings). The booking route validates against this, so a slot posted for the
// wrong day is rejected server-side too.
export async function getAvailableSlots(date: string): Promise<string[]> {
  const cfg = await getBookingConfig();
  // The calendar greys these out; check them here too so a hand-crafted request
  // can't book a closed day or a holiday.
  if (!cfg.openWeekdays.includes(weekdayOf(date))) return [];
  if (cfg.blockedDates.includes(date)) return [];
  const onDay = slotsOnDate(cfg.slots, date);
  if (!onDay.length) return [];
  const pb = await createAdminClient();
  const start = `${date} 00:00:00.000Z`;
  const end = `${date} 23:59:59.999Z`;
  const taken = await pb.collection("bookings").getFullList({
    filter: `date >= "${start}" && date <= "${end}" && status != "geannuleerd"`,
  });
  const takenSlots = new Set(taken.map((b: any) => b.time_slot));
  return onDay.filter((s) => !takenSlots.has(s));
}
