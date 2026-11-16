"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import type { BookingConfig } from "@/lib/booking";
import { formatDateNl } from "@/lib/dates";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { inputCls } from "@/components/ui/field";

const WEEKDAY_CODES = ["zo", "ma", "di", "wo", "do", "vr", "za"]; // JS getDay() order
const DOW_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"]; // Monday-first grid
const MONTHS = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];
type ServiceOption = { slug: string; label: string; popular: boolean };

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
    () => (serviceOptions.find((s) => s.popular) ?? serviceOptions[0])?.slug ?? "",
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
      <div className="rounded-card border border-line bg-ink-700 p-8 text-base text-fg-dim">
        Kalender laden…
      </div>
    );
  }

  if (done) {
    return (
      <div className="animate-rise rounded-card border border-ice/30 bg-ice/5 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 animate-pop items-center justify-center rounded-full bg-ice/10 text-xl text-ice [animation-delay:200ms]">
          ✓
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold">Afspraak aangevraagd!</h3>
        <p className="mt-2 text-base text-fg-muted">
          Referentie <span className="font-mono text-fg">{done.ref}</span>. Je krijgt een
          bevestiging per e-mail. Tot {formatDateNl(done.date)} om {done.slot}!
        </p>
      </div>
    );
  }

  return (
    <div data-stagger className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
      {/* service + calendar */}
      <div className="rounded-card border border-line bg-ink-700 p-5">
        <label htmlFor="booking-service" className="mb-2 block text-sm text-fg-muted">
          Dienst
        </label>
        <select
          id="booking-service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className={clsx(inputCls, "mb-5")}
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
            className="press flex h-8 w-8 items-center justify-center rounded-md text-lg text-ice hover:bg-ice/10 disabled:opacity-30"
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
            className="press flex h-8 w-8 items-center justify-center rounded-md text-lg text-ice hover:bg-ice/10 disabled:opacity-30"
            aria-label="Volgende maand"
          >
            ›
          </button>
        </div>

        {/* Keyed on the month, so paging fades the new month in. */}
        <div key={`${view.getFullYear()}-${view.getMonth()}`} className="grid animate-fade grid-cols-7 gap-1.5">
          {DOW_LABELS.map((d) => (
            <div key={d} className="text-center font-mono text-[11px] uppercase text-fg-faint">
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
                  "press flex aspect-square items-center justify-center rounded-lg font-mono text-sm",
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

        <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-fg-dim">
          Geen passende dag of tijd?{" "}
          <a href="#contact" className="font-medium text-ice transition-colors hover:text-ice-hover">
            Stuur ons gerust een bericht
          </a>{" "}
          — dan zoeken we samen naar een moment dat wel uitkomt.
        </p>
      </div>

      {/* slots + form */}
      <div className="rounded-card border border-line bg-ink-700 p-5">
        {!selectedDate ? (
          <div className="flex h-full flex-col justify-center gap-6 py-2 md:px-4">
            <div>
              <p className="font-display text-lg font-semibold">Kies een dag in de kalender</p>
              <p className="mt-1 text-base text-fg-dim">
                Daarna zie je de vrije tijden en vul je alleen je naam en e-mailadres in.
              </p>
            </div>
            <ul data-stagger="fade" className="flex flex-col gap-3 text-[15px] text-fg-muted">
              <li className="flex gap-3">
                <Icon name="pin" className="text-ice" />
                Je brengt je ski&apos;s of board langs op het moment dat je kiest.
              </li>
              <li className="flex gap-3">
                <Icon name="clock" className="text-ice" />
                We tunen alles met de hand, meestal binnen 2 tot 3 werkdagen.
              </li>
              <li className="flex gap-3">
                <Icon name="mail" className="text-ice" />
                Je krijgt bericht zodra je materiaal klaarstaat om op te halen.
              </li>
            </ul>
          </div>
        ) : (
          <>
            <div key={`label-${selectedDate}`} className="mb-3 animate-fade text-base text-fg-muted">
              Beschikbare tijden op <span className="text-fg">{formatDateNl(selectedDate)}</span>
            </div>
            {loadingSlots ? (
              <p className="text-base text-fg-dim">Laden…</p>
            ) : slots && slots.length ? (
              // A new grid per day, so each day's times pop in one after another.
              <div
                key={`slots-${selectedDate}`}
                data-stagger="pop"
                className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3"
              >
                {slots.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setSelectedSlot(t)}
                    className={clsx(
                      "press rounded-ctl border py-2.5 font-mono text-sm",
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
              <p className="text-base text-fg-dim">Geen vrije tijden op deze dag. Kies een andere dag.</p>
            )}

            {selectedSlot && (
              <form
                onSubmit={submit}
                className="mt-5 flex animate-rise flex-col gap-3 border-t border-line pt-5"
              >
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
                <Button type="submit" disabled={submitting} fullWidth className="mt-1">
                  {submitting ? "Bezig…" : "Bevestig afspraak"}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
