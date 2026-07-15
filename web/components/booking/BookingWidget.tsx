"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import type { BookingConfig } from "@/lib/booking";

const WEEKDAY_CODES = ["zo", "ma", "di", "wo", "do", "vr", "za"]; // JS getDay() order
const DOW_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"]; // Monday-first grid
const MONTHS = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];
type ServiceOption = { slug: string; label: string };

const inputCls =
  "w-full rounded-ctl border border-line bg-ink-800 px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-ice focus:ring-2 focus:ring-ice/20";

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function BookingWidget({
  config,
  serviceOptions,
}: {
  config: BookingConfig;
  serviceOptions: ServiceOption[];
}) {
  const [service, setService] = useState(
    () => serviceOptions.find((s) => s.slug === "waxen-slijpen")?.slug ?? serviceOptions[0]?.slug ?? "",
  );
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const earliest = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + Math.max(0, Math.ceil(config.leadHours / 24)));
    return d;
  }, [today, config.leadHours]);
  const latest = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + config.horizonDays);
    return d;
  }, [today, config.horizonDays]);

  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ ref: string; date: string; slot: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = new URLSearchParams(window.location.search).get("dienst");
    if (p && serviceOptions.some((s) => s.slug === p)) setService(p);
  }, [serviceOptions]);

  function isSelectable(d: Date) {
    if (d < earliest || d > latest) return false;
    const code = WEEKDAY_CODES[d.getDay()];
    if (!config.openWeekdays.includes(code)) return false;
    // Grey out days no slot runs on, rather than letting them open an empty list.
    if (!config.slots.some((s) => !s.days.length || s.days.includes(code))) return false;
    if (config.blockedDates.includes(ymd(d))) return false;
    return true;
  }

  async function pickDate(d: Date) {
    const key = ymd(d);
    setSelectedDate(key);
    setSelectedSlot(null);
    setSlots(null);
    setError(null);
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/booking/availability?date=${key}`);
      const data = await res.json();
      setSlots(res.ok ? (data.slots ?? []) : []);
    } catch {
      setSlots([]);
    }
    setLoadingSlots(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, service, date: selectedDate, time_slot: selectedSlot }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setDone({ ref: data.ref, date: selectedDate!, slot: selectedSlot! });
      } else {
        setError(data.error ?? "Er ging iets mis.");
        if (res.status === 409 && selectedDate) {
          setSelectedSlot(null);
          pickDate(new Date(selectedDate));
        }
      }
    } catch {
      setError("Kon geen verbinding maken. Probeer opnieuw.");
    }
    setSubmitting(false);
  }

  const grid = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(view.getFullYear(), view.getMonth(), day));
    return cells;
  }, [view]);

  const monthStart = new Date(view.getFullYear(), view.getMonth(), 1);
  const canPrev = monthStart > new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = monthStart < new Date(latest.getFullYear(), latest.getMonth(), 1);

  if (!mounted) {
    return (
      <div className="rounded-card border border-line bg-ink-700 p-8 text-sm text-fg-dim">
        Kalender laden…
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-card border border-ice/30 bg-ice/5 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ice/10 text-xl text-ice">
          ✓
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold">Afspraak aangevraagd!</h3>
        <p className="mt-2 text-sm text-fg-muted">
          Referentie <span className="font-mono text-fg">{done.ref}</span>. Je krijgt een
          bevestiging per e-mail. Tot {done.date} om {done.slot}!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr]">
      {/* service + calendar */}
      <div className="rounded-card border border-line bg-ink-700 p-5">
        <label className="mb-2 block text-xs text-fg-muted">Dienst</label>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="mb-5 w-full rounded-ctl border border-line bg-ink-800 px-3 py-2.5 text-sm text-fg outline-none focus:border-ice"
        >
          {serviceOptions.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
            className="px-2 text-ice disabled:opacity-30"
            aria-label="Vorige maand"
          >
            ‹
          </button>
          <span className="font-display text-sm font-semibold">
            {MONTHS[view.getMonth()]} {view.getFullYear()}
          </span>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
            className="px-2 text-ice disabled:opacity-30"
            aria-label="Volgende maand"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {DOW_LABELS.map((d) => (
            <div key={d} className="text-center font-mono text-[9px] uppercase text-fg-faint">
              {d}
            </div>
          ))}
          {grid.map((d, i) => {
            if (d === null) return <div key={i} />;
            const key = ymd(d);
            const sel = key === selectedDate;
            const ok = isSelectable(d);
            return (
              <button
                type="button"
                key={i}
                disabled={!ok}
                onClick={() => pickDate(d)}
                className={clsx(
                  "flex aspect-square items-center justify-center rounded-lg font-mono text-xs transition-colors",
                  sel
                    ? "bg-ice text-on-ice"
                    : ok
                      ? "border border-ice/25 text-fg hover:bg-ice/10"
                      : "cursor-not-allowed text-fg-faint/40",
                )}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* slots + form */}
      <div className="rounded-card border border-line bg-ink-700 p-5">
        {!selectedDate ? (
          <p className="text-sm text-fg-dim">Kies eerst een dag in de kalender.</p>
        ) : (
          <>
            <div className="mb-3 text-sm text-fg-muted">
              Beschikbare tijden · <span className="text-fg">{selectedDate}</span>
            </div>
            {loadingSlots ? (
              <p className="text-sm text-fg-dim">Laden…</p>
            ) : slots && slots.length ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
                {slots.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setSelectedSlot(t)}
                    className={clsx(
                      "rounded-ctl border py-2.5 font-mono text-xs transition-colors",
                      selectedSlot === t
                        ? "border-ice bg-ice text-on-ice"
                        : "border-ice/25 bg-ice/5 text-ice hover:bg-ice/10",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-fg-dim">Geen vrije tijden op deze dag. Kies een andere dag.</p>
            )}

            {selectedSlot && (
              <form onSubmit={submit} className="mt-5 flex flex-col gap-3 border-t border-line pt-5">
                <input
                  required
                  placeholder="Naam *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                />
                <input
                  required
                  type="email"
                  placeholder="E-mailadres *"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                />
                <input
                  placeholder="Telefoon (optioneel)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputCls}
                />
                <textarea
                  rows={2}
                  placeholder="Notitie (optioneel)"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className={inputCls}
                />
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="hidden"
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 rounded-ctl bg-ice py-3 font-display text-sm font-semibold text-on-ice transition-colors hover:bg-ice-hover disabled:opacity-60"
                >
                  {submitting ? "Bezig…" : "Bevestig afspraak"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
