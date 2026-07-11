"use client";

import { useEffect, useState } from "react";

const inputCls =
  "w-full rounded-ctl border border-line bg-ink-800 px-3.5 py-3 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-ice focus:ring-2 focus:ring-ice/20";

export function ContactForm({ serviceLabels }: { serviceLabels: Record<string, string> }) {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("dienst");
    const label = p ? serviceLabels[p] : null;
    if (label) setForm((f) => ({ ...f, message: `Ik heb een vraag over: ${label}.\n\n` }));
  }, [serviceLabels]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.ok) setDone(true);
      else setError(data.error ?? "Er ging iets mis.");
    } catch {
      setError("Kon geen verbinding maken. Probeer opnieuw.");
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="rounded-card border border-ice/30 bg-ice/5 p-6 text-sm text-fg-muted">
        Bedankt! Je bericht is verstuurd. We reageren zo snel mogelijk.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs text-fg-muted">Naam *</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-fg-muted">E-mailadres *</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-fg-muted">Bericht *</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={inputCls}
        />
      </div>
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
        className="mt-1 w-fit rounded-ctl bg-ice px-6 py-3 font-display text-sm font-semibold text-on-ice transition-colors hover:bg-ice-hover disabled:opacity-60"
      >
        {submitting ? "Bezig…" : "Verzenden"}
      </button>
    </form>
  );
}
