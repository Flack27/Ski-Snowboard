import { createAdminClient } from "./pocketbase";

const PB = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";

export type BookingConfig = {
  openWeekdays: string[]; // e.g. ['ma','di','wo','do','vr','za']
  horizonDays: number;
  leadHours: number;
  blockedDates: string[]; // 'YYYY-MM-DD'
  slots: string[]; // ['09:00', ...]
};

// Map JS Date.getDay() (0=Sun..6=Sat) to our weekday codes.
export const WEEKDAY_CODES = ["zo", "ma", "di", "wo", "do", "vr", "za"];

export async function getBookingConfig(): Promise<BookingConfig> {
  const opts = { next: { revalidate: 60, tags: ["booking-config"] } };
  const [settingsRes, slotsRes, blockedRes] = await Promise.all([
    fetch(`${PB}/api/collections/settings/records?perPage=1`, opts),
    fetch(`${PB}/api/collections/time_slots/records?perPage=50&sort=sort`, opts),
    fetch(`${PB}/api/collections/blocked_dates/records?perPage=365`, opts),
  ]);
  const settings = (await settingsRes.json()).items?.[0];
  const slots: string[] = ((await slotsRes.json()).items ?? []).map((s: any) => s.time);
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
}

// Active slots for a date minus the ones already taken (non-cancelled bookings).
export async function getAvailableSlots(date: string): Promise<string[]> {
  const cfg = await getBookingConfig();
  if (!cfg.slots.length) return [];
  const pb = await createAdminClient();
  const start = `${date} 00:00:00.000Z`;
  const end = `${date} 23:59:59.999Z`;
  const taken = await pb.collection("bookings").getFullList({
    filter: `date >= "${start}" && date <= "${end}" && status != "geannuleerd"`,
  });
  const takenSlots = new Set(taken.map((b: any) => b.time_slot));
  return cfg.slots.filter((s) => !takenSlots.has(s));
}
