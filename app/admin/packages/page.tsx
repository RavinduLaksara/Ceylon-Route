"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  X,
  Save,
  Upload,
  GripVertical,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidatePublic } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import type { ItineraryDay } from "@/types/tour";
import type { DbPackage } from "@/lib/supabase/types";

interface PackageForm {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  duration_days: number;
  duration_nights: number;
  approx_distance_km: number;
  travel_style: string[];
  overview: string;
  cover_image: string;
  gallery_images: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  is_featured: boolean;
  is_active: boolean;
}

const STYLE_OPTIONS = ["Adventure", "Culture", "Wildlife", "Scenic", "Beach", "Relaxation"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function emptyForm(): PackageForm {
  return {
    slug: "",
    title: "",
    subtitle: "",
    duration_days: 4,
    duration_nights: 3,
    approx_distance_km: 400,
    travel_style: [],
    overview: "",
    cover_image: "",
    gallery_images: [],
    itinerary: [{ day: 1, title: "", activities: [""], overnightStay: "", travelTime: "" }],
    inclusions: [""],
    exclusions: [""],
    is_featured: false,
    is_active: true,
  };
}

function toForm(p: DbPackage): PackageForm {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle ?? "",
    duration_days: p.duration_days,
    duration_nights: p.duration_nights,
    approx_distance_km: Number(p.approx_distance_km),
    travel_style: p.travel_style ?? [],
    overview: p.overview ?? "",
    cover_image: p.cover_image ?? "",
    gallery_images: p.gallery_images ?? [],
    itinerary: Array.isArray(p.itinerary) ? p.itinerary : [],
    inclusions: p.inclusions ?? [],
    exclusions: p.exclusions ?? [],
    is_featured: p.is_featured,
    is_active: p.is_active,
  };
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<DbPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PackageForm | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("packages")
      .select("*")
      .order("created_at", { ascending: true });
    setPackages((data as DbPackage[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("packages")
        .select("*")
        .order("created_at", { ascending: true });
      if (active) {
        setPackages((data as DbPackage[]) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this package? This cannot be undone.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (!error) {
      await revalidatePublic("packages");
      load();
    }
  }

  if (editing) {
    return (
      <PackageEditor
        form={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Tour packages</h1>
          <p className="text-sm text-ink/55">Create and manage the tours shown on the site.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyForm())}
          className="inline-flex items-center gap-2 rounded-full bg-ceylon-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ceylon-700"
        >
          <Plus className="h-4 w-4" /> Add new package
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 p-8 text-ink/50">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading packages…
          </div>
        ) : packages.length === 0 ? (
          <p className="rounded-2xl bg-white p-10 text-center text-sm text-ink/50 ring-1 ring-ink/10">
            No packages yet. Click “Add new package” to create one.
          </p>
        ) : (
          packages.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-ink/10"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface">
                {p.cover_image && (
                  <Image src={p.cover_image} alt={p.title} fill sizes="96px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-ink">{p.title}</p>
                  {p.is_featured && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}
                  {!p.is_active && (
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-semibold text-ink/50">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-ink/50">
                  {p.duration_days}D/{p.duration_nights}N · {p.approx_distance_km} km · /{p.slug}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(toForm(p))}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink/70 hover:bg-surface"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label="Delete"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PackageEditor({
  form: initial,
  onCancel,
  onSaved,
}: {
  form: PackageForm;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<PackageForm>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(p: Partial<PackageForm>) {
    setForm((prev) => ({ ...prev, ...p }));
  }

  function onTitle(title: string) {
    patch({ title, ...(slugTouched ? {} : { slug: slugify(title) }) });
  }

  function toggleStyle(style: string) {
    patch({
      travel_style: form.travel_style.includes(style)
        ? form.travel_style.filter((s) => s !== style)
        : [...form.travel_style, style],
    });
  }

  // Itinerary helpers
  function addDay() {
    patch({
      itinerary: [
        ...form.itinerary,
        {
          day: form.itinerary.length + 1,
          title: "",
          activities: [""],
          overnightStay: "",
          travelTime: "",
        },
      ],
    });
  }
  function removeDay(idx: number) {
    patch({
      itinerary: form.itinerary
        .filter((_, i) => i !== idx)
        .map((d, i) => ({ ...d, day: i + 1 })),
    });
  }
  function patchDay(idx: number, p: Partial<ItineraryDay>) {
    patch({ itinerary: form.itinerary.map((d, i) => (i === idx ? { ...d, ...p } : d)) });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle,
      duration_days: Number(form.duration_days),
      duration_nights: Number(form.duration_nights),
      approx_distance_km: Number(form.approx_distance_km),
      travel_style: form.travel_style,
      overview: form.overview,
      cover_image: form.cover_image,
      gallery_images: form.gallery_images.filter(Boolean),
      itinerary: form.itinerary.map((d) => ({
        ...d,
        activities: d.activities.filter((a) => a.trim()),
      })),
      inclusions: form.inclusions.filter((s) => s.trim()),
      exclusions: form.exclusions.filter((s) => s.trim()),
      is_featured: form.is_featured,
      is_active: form.is_active,
    };

    const { error: dbError } = form.id
      ? await supabase.from("packages").update(payload).eq("id", form.id)
      : await supabase.from("packages").insert(payload);

    setSaving(false);
    if (dbError) {
      setError(dbError.message.includes("duplicate") ? "That slug is already in use." : dbError.message);
      return;
    }
    await revalidatePublic("packages");
    onSaved();
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">
          {form.id ? "Edit package" : "New package"}
        </h1>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-white"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {/* Basics */}
        <Card title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Title" value={form.title} onChange={onTitle} />
            <label className="block">
              <span className={labelCls}>Slug</span>
              <input
                className={inputCls}
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  patch({ slug: slugify(e.target.value) });
                }}
              />
            </label>
            <Text label="Subtitle" value={form.subtitle} onChange={(v) => patch({ subtitle: v })} className="sm:col-span-2" />
            <Num label="Duration days" value={form.duration_days} onChange={(v) => patch({ duration_days: v })} />
            <Num label="Duration nights" value={form.duration_nights} onChange={(v) => patch({ duration_nights: v })} />
            <Num label="Approx distance (km)" value={form.approx_distance_km} onChange={(v) => patch({ approx_distance_km: v })} />
          </div>

          <div className="mt-4">
            <span className={labelCls}>Travel style</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStyle(s)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                    form.travel_style.includes(s)
                      ? "bg-ceylon-800 text-white"
                      : "bg-surface text-ink/60 ring-1 ring-ink/10",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-4 block">
            <span className={labelCls}>Overview</span>
            <textarea
              rows={4}
              className={inputCls}
              value={form.overview}
              onChange={(e) => patch({ overview: e.target.value })}
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-5">
            <Toggle
              label="Featured"
              icon={<Star className="h-4 w-4" />}
              checked={form.is_featured}
              onChange={(v) => patch({ is_featured: v })}
            />
            <Toggle
              label={form.is_active ? "Visible" : "Hidden"}
              icon={form.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              checked={form.is_active}
              onChange={(v) => patch({ is_active: v })}
            />
          </div>
        </Card>

        {/* Images */}
        <Card title="Images">
          <span className={labelCls}>Cover image</span>
          <ImageUploader
            slug={form.slug || "package"}
            value={form.cover_image ? [form.cover_image] : []}
            multiple={false}
            onChange={(urls) => patch({ cover_image: urls[0] ?? "" })}
          />
          <span className={cn(labelCls, "mt-4")}>Gallery images</span>
          <ImageUploader
            slug={form.slug || "package"}
            value={form.gallery_images}
            multiple
            onChange={(urls) => patch({ gallery_images: urls })}
          />
        </Card>

        {/* Itinerary builder */}
        <Card title="Itinerary builder">
          <div className="space-y-3">
            {form.itinerary.map((day, idx) => (
              <div key={idx} className="rounded-xl bg-surface p-4 ring-1 ring-ink/5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ceylon-800">
                    <GripVertical className="h-4 w-4 text-ink/30" /> Day {day.day}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDay(idx)}
                    className="text-red-500 hover:text-red-600"
                    aria-label="Remove day"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Text label="Title" value={day.title} onChange={(v) => patchDay(idx, { title: v })} />
                  <Text label="Overnight stay" value={day.overnightStay} onChange={(v) => patchDay(idx, { overnightStay: v })} />
                  <Text label="Travel time" value={day.travelTime ?? ""} onChange={(v) => patchDay(idx, { travelTime: v })} className="sm:col-span-2" />
                </div>
                <div className="mt-3">
                  <span className={labelCls}>Activities</span>
                  <StringList
                    values={day.activities}
                    placeholder="Activity"
                    onChange={(activities) => patchDay(idx, { activities })}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addDay}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-ceylon-800 px-4 py-1.5 text-xs font-semibold text-ceylon-800 hover:bg-ceylon-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add day
          </button>
        </Card>

        {/* Inclusions / exclusions */}
        <Card title="Inclusions & exclusions">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <span className={labelCls}>Inclusions</span>
              <StringList
                values={form.inclusions}
                placeholder="Included item"
                onChange={(inclusions) => patch({ inclusions })}
              />
            </div>
            <div>
              <span className={labelCls}>Exclusions</span>
              <StringList
                values={form.exclusions}
                placeholder="Excluded item"
                onChange={(exclusions) => patch({ exclusions })}
              />
            </div>
          </div>
        </Card>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ceylon-900 transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save package"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-3 text-sm font-medium text-ink/55 hover:text-ink"
          >
            Discard
          </button>
        </div>
      </div>
    </form>
  );
}

// --------------------------------------------------------------------------
// Reusable editor bits
// --------------------------------------------------------------------------

function ImageUploader({
  slug,
  value,
  multiple,
  onChange,
}: {
  slug: string;
  value: string[];
  multiple: boolean;
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setErr(null);
    const supabase = createClient();
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from("tour-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        setErr(error.message);
        continue;
      }
      const { data } = supabase.storage.from("tour-images").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    setUploading(false);
    onChange(multiple ? [...value, ...uploaded] : uploaded.slice(0, 1));
  }

  return (
    <div className="mt-1">
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((url) => (
            <div key={url} className="relative h-20 w-28 overflow-hidden rounded-lg ring-1 ring-ink/10">
              <Image src={url} alt="" fill sizes="112px" className="object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((u) => u !== url))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink/25 px-4 py-2 text-sm font-medium text-ink/60 hover:border-ceylon-600 hover:text-ceylon-700">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Uploading…" : multiple ? "Upload images" : "Upload image"}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}

function StringList({
  values,
  placeholder,
  onChange,
}: {
  values: string[];
  placeholder: string;
  onChange: (v: string[]) => void;
}) {
  const list = values.length ? values : [""];
  return (
    <div className="mt-1 space-y-2">
      {list.map((val, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inputCls}
            value={val}
            placeholder={placeholder}
            onChange={(e) => onChange(list.map((v, j) => (j === i ? e.target.value : v)))}
          />
          <button
            type="button"
            onClick={() => onChange(list.filter((_, j) => j !== i))}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, ""])}
        className="inline-flex items-center gap-1 text-xs font-semibold text-ceylon-800 hover:underline"
      >
        <Plus className="h-3.5 w-3.5" /> Add
      </button>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-ink/10">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">{title}</h2>
      {children}
    </section>
  );
}

function Text({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className={labelCls}>{label}</span>
      <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Num({
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
      <span className={labelCls}>{label}</span>
      <input
        type="number"
        min="0"
        className={inputCls}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Toggle({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-ink/30 text-ceylon-800 focus:ring-ceylon-600"
      />
      <span className="inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ceylon-600 focus:ring-2 focus:ring-ceylon-600/20";
const labelCls = "mb-1 block text-xs font-medium text-ink/60";
