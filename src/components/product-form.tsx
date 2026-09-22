"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import ImageUploader from "./image-uploader";
import type { Category, MenuItem, Option } from "@/lib/types";
const blank = {
  name: "",
  nameAr: "",
  slug: "",
  shortDescription: "",
  description: "",
  descriptionAr: "",
  image: "",
  images: [],
  category: "",
  price: 0,
  discountPrice: undefined,
  available: true,
  featured: false,
  isNew: false,
  bestSeller: false,
  customBadges: [],
  sizes: [],
  extras: [],
  order: 0,
};
export default function ProductForm({ id }: { id?: string }) {
  const router = useRouter(),
    [cats, setCats] = useState<Category[]>([]),
    [form, setForm] = useState<Record<string, unknown>>(blank),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((c) => {
        setCats(c);
        if (!id && c[0]) setForm((v) => ({ ...v, category: c[0]._id }));
      });
    if (id)
      fetch(`/api/items/${id}`)
        .then((r) => r.json())
        .then((p: MenuItem) =>
          setForm({
            ...p,
            category:
              typeof p.category === "string" ? p.category : p.category._id,
          }),
        );
  }, [id]);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const r = await fetch(id ? `/api/items/${id}` : "/api/items", {
      method: id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const out = await r.json();
    if (!r.ok) {
      setMessage(out.error || "Unable to save product.");
      setSaving(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }
  function optionList(key: "sizes" | "extras") {
    const list = form[key] as Option[];
    return (
      <div className="space-y-2">
        {list.map((o, i) => (
          <div className="flex gap-2" key={i}>
            <input
              aria-label="Option name"
              value={o.name}
              onChange={(e) =>
                set(
                  key,
                  list.map((x, j) =>
                    j === i ? { ...x, name: e.target.value } : x,
                  ),
                )
              }
              className="input"
              placeholder="Name"
            />
            <input
              aria-label="Option price"
              value={o.price}
              type="number"
              onChange={(e) =>
                set(
                  key,
                  list.map((x, j) =>
                    j === i ? { ...x, price: Number(e.target.value) } : x,
                  ),
                )
              }
              className="input w-32"
            />
            <button
              type="button"
              onClick={() =>
                set(
                  key,
                  list.filter((_, j) => j !== i),
                )
              }
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set(key, [...list, { name: "", price: 0 }])}
          className="flex items-center gap-1 text-sm font-bold text-[#496652]"
        >
          <Plus size={15} />
          Add option
        </button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Menu management</p>
          <h1 className="font-serif text-3xl">
            {id ? "Edit product" : "Add product"}
          </h1>
        </div>
        <button
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#1f3025] px-5 py-3 text-sm font-bold text-white"
        >
          <Save size={17} />
          {saving ? "Saving..." : "Save product"}
        </button>
      </div>
      {message && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {message}
        </p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Basic information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Name"
                value={form.name}
                set={(v) => {
                  set("name", v);
                  if (!id) set("slug", slug(v));
                }}
              />
              <Field
                label="Arabic name"
                value={form.nameAr}
                set={(v) => set("nameAr", v)}
                dir="rtl"
              />
              <Field
                label="Slug"
                value={form.slug}
                set={(v) => set("slug", slug(v))}
              />
              <Field
                label="Short description"
                value={form.shortDescription}
                set={(v) => set("shortDescription", v)}
              />
              <Area
                label="Full description"
                value={form.description}
                set={(v) => set("description", v)}
              />
              <Area
                label="Arabic description"
                value={form.descriptionAr}
                set={(v) => set("descriptionAr", v)}
                dir="rtl"
              />
            </div>
          </Card>
          <Card title="Pricing & options">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                type="number"
                label="Price"
                value={form.price}
                set={(v) => set("price", Number(v))}
                min={0}
                step="0.01"
              />
              <Field
                type="number"
                label="Discount price"
                value={form.discountPrice}
                set={(v) => set("discountPrice", v ? Number(v) : undefined)}
                min={0}
                max={
                  Number(form.price) > 0 ? Number(form.price) - 0.01 : undefined
                }
                step="0.01"
              />
              <div>
                <p className="mb-3 font-bold">Sizes</p>
                {optionList("sizes")}
              </div>
              <div>
                <p className="mb-3 font-bold">Extras</p>
                {optionList("extras")}
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Product image">
            <ImageUploader
              value={String(form.image || "")}
              onChange={(v) => set("image", v)}
            />
          </Card>
          <Card title="Organization">
            <label>
              <span className="field-label">Category</span>
              <select
                className="input"
                value={String(form.category || "")}
                onChange={(e) => set("category", e.target.value)}
              >
                {cats.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <Field
              type="number"
              label="Display order"
              value={form.order}
              set={(v) => set("order", Number(v))}
            />
            {[
              ["available", "Available"],
              ["featured", "Featured"],
              ["bestSeller", "Best seller"],
              ["isNew", "New item"],
            ].map(([k, l]) => (
              <label className="mt-3 flex items-center gap-3 text-sm" key={k}>
                <input
                  type="checkbox"
                  checked={Boolean(form[k])}
                  onChange={(e) => set(k, e.target.checked)}
                />
                {l}
              </label>
            ))}
            <div className="mt-5 border-t border-[#e5e7e2] pt-4">
              <Field
                label="Custom statuses (comma separated)"
                value={((form.customBadges as string[]) || []).join(", ")}
                set={(value) =>
                  set(
                    "customBadges",
                    value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
              />
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
function slug(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6">
      <h2 className="mb-5 font-serif text-xl">{title}</h2>
      {children}
    </section>
  );
}
function Field({
  label,
  value,
  set,
  type = "text",
  dir,
  min,
  max,
  step,
}: {
  label: string;
  value: unknown;
  set: (v: string) => void;
  type?: string;
  dir?: "rtl";
  min?: number;
  max?: number;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        dir={dir}
        required={
          !label.includes("Arabic") &&
          !label.includes("Discount") &&
          !label.includes("Short")
        }
        className="input"
        type={type}
        min={min}
        max={max}
        step={step}
        value={String(value ?? "")}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  );
}
function Area({
  label,
  value,
  set,
  dir,
}: {
  label: string;
  value: unknown;
  set: (v: string) => void;
  dir?: "rtl";
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <textarea
        dir={dir}
        required={!label.includes("Arabic")}
        minLength={label === "Full description" ? 5 : undefined}
        className="input min-h-28"
        value={String(value ?? "")}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  );
}
