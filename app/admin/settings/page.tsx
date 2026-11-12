"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidatePublic } from "@/app/admin/actions";
import type { DbSettings } from "@/lib/supabase/types";

export default function AdminSettingsPage() {
  const [row, setRow] = useState<DbSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
      setRow((data as DbSettings) ?? null);
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof DbSettings>(key: K, value: DbSettings[K]) {
    setRow((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!row) return;
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("settings")
      .update({
        rate_wagon_r: Number(row.rate_wagon_r),
        rate_aqua: Number(row.rate_aqua),
        rate_sedan: Number(row.rate_sedan),
        rate_kdh: Number(row.rate_kdh),
        driver_daily_batta: Number(row.driver_daily_batta),
        whatsapp_number: row.whatsapp_number,
        admin_email: row.admin_email,
      })
      .eq("id", row.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      await revalidatePublic("settings");
      setTimeout(() => setSaved(false), 4000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-12 text-ink/50">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading settings…
      </div>
    );
  }

  if (!row) {
    return (
      <p className="rounded-xl bg-white p-6 text-sm text-ink/60 ring-1 ring-ink/10">
        No settings row found. Run <code>supabase/schema.sql</code> to seed it.
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-ink">Fleet & pricing settings</h1>
      <p className="text-sm text-ink/55">
        Update per-km rates and contact details. Public prices refresh immediately.
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-ink/10">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
            Per-km rates (USD)
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Wagon R" value={row.rate_wagon_r} onChange={(v) => set("rate_wagon_r", v)} />
            <NumberField label="Aqua" value={row.rate_aqua} onChange={(v) => set("rate_aqua", v)} />
            <NumberField label="Sedan" value={row.rate_sedan} onChange={(v) => set("rate_sedan", v)} />
            <NumberField label="KDH Van" value={row.rate_kdh} onChange={(v) => set("rate_kdh", v)} />
            <NumberField
              label="Driver daily batta (USD)"
              value={row.driver_daily_batta}
              onChange={(v) => set("driver_daily_batta", v)}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-ink/10">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
            Contact
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink/60">WhatsApp number</span>
              <input
                className={inputCls}
                value={row.whatsapp_number ?? ""}
                onChange={(e) => set("whatsapp_number", e.target.value)}
                placeholder="+94770291675"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink/60">Admin email (booking alerts)</span>
              <input
                type="email"
                className={inputCls}
                value={row.admin_email ?? ""}
                onChange={(e) => set("admin_email", e.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-ceylon-800 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save settings"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ceylon-700">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink/60">{label}</span>
      <input
        type="number"
        step="0.01"
        min="0"
        className={inputCls}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ceylon-600 focus:ring-2 focus:ring-ceylon-600/20";
