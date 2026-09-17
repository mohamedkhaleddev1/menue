"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Edit3, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import ImageUploader from "./image-uploader";
import type { Category } from "@/lib/types";
import { demoCategories } from "@/lib/demo-data";
const empty = {
  name: "",
  nameAr: "",
  slug: "",
  description: "",
  image: "",
  icon: "",
  order: 0,
  active: true,
};
export default function CategoryManager() {
  const [items, setItems] = useState<Category[]>([]),
    [editing, setEditing] = useState<Category | typeof empty | null>(null),
    [notice, setNotice] = useState(""),
    [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  useEffect(() => {
    fetch("/api/categories")
      .then(async (r) => {
        if (!r.ok) throw new Error("Database unavailable");
        return r.json();
      })
      .then(setItems)
      .catch(() => {
        setItems(demoCategories);
        setNotice("Using local demo categories until MongoDB is connected.");
      });
  }, []);
  const update = async (c: Category, patch: Partial<Category>) => {
    setItems((v) => v.map((x) => (x._id === c._id ? { ...x, ...patch } : x)));
    await fetch(`/api/categories/${c._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
  };
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const hasId = "_id" in editing,
      method = hasId ? "PATCH" : "POST",
      url = hasId ? `/api/categories/${editing._id}` : "/api/categories";
    const r = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(editing),
      }).catch(() => null);
    if (!r || r.status >= 500) {
      const local = {
        ...editing,
        _id: hasId ? editing._id : crypto.randomUUID(),
      } as Category;
      setItems((v) =>
        hasId ? v.map((x) => (x._id === local._id ? local : x)) : [...v, local],
      );
      setEditing(null);
      setNotice(`Category ${hasId ? "updated" : "added"} locally. Connect MongoDB to persist changes.`);
      return;
    }
    const out = await r.json().catch(() => ({}));
    if (!r.ok) return setNotice(out.error || "Unable to save category.");
    setItems((v) =>
      hasId ? v.map((x) => (x._id === out._id ? out : x)) : [...v, out],
    );
    setEditing(null);
    setNotice(`Category ${hasId ? "updated" : "added"} successfully.`);
  }
  async function remove(c: Category) {
    if (
      !confirm(
        `Delete “${c.name}”? Products in this category prevent deletion unless they are moved or removed first.`,
      )
    )
      return;
    const r = await fetch(`/api/categories/${c._id}`, { method: "DELETE" }),
      out = await r.json();
    if (!r.ok) return alert(out.error);
    setItems((v) => v.filter((x) => x._id !== c._id));
    setNotice("Category deleted successfully.");
  }
  return (
    <main className="min-h-screen bg-[#f4f5f1] p-5 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-3 flex items-center gap-1 text-sm text-[#718077]"
            >
              <ArrowLeft size={15} />
              Dashboard
            </Link>
            <p className="eyebrow">Menu structure</p>
            <h1 className="font-serif text-3xl">Categories</h1>
          </div>
          <button
            onClick={() => setEditing({ ...empty, order: items.length + 1 })}
            className="flex gap-2 rounded-xl bg-[#1f3025] px-5 py-3 text-sm font-bold text-white"
          >
            <Plus size={17} />
            Add category
          </button>
        </div>
        {notice && (
          <p className="mt-5 rounded-xl bg-[#e3f2e6] p-3 text-sm text-green-800">
            {notice}
          </p>
        )}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white">
          <div className="hidden grid-cols-[1fr_150px_100px_120px] border-b p-4 text-xs font-bold uppercase text-[#7d867f] md:grid">
            <span>Category</span>
            <span>Order</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {items.map((c) => (
            <div
              key={c._id}
              className="grid items-center gap-3 border-b p-4 last:border-0 md:grid-cols-[1fr_150px_100px_120px]"
            >
              <div className="flex items-center gap-3">
                {c.image ? (
                  <img
                    src={c.image}
                    className="size-12 rounded-xl object-cover"
                    alt=""
                  />
                ) : (
                  <div className="grid size-12 place-items-center rounded-xl bg-[#eef1ec]">
                    {c.icon || c.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p dir="rtl" className="text-right text-sm text-[#808982]">
                    {c.nameAr}
                  </p>
                </div>
              </div>
              <input
                aria-label="Display order"
                type="number"
                className="input w-24"
                value={c.order}
                onChange={(e) => update(c, { order: Number(e.target.value) })}
              />
              <button
                onClick={() => update(c, { active: !c.active })}
                className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {c.active ? "Active" : "Hidden"}
              </button>
              <div className="flex gap-2">
                <button
                  aria-label="Edit"
                  onClick={() => setEditing(c)}
                  className="rounded-lg p-2 hover:bg-gray-100"
                >
                  <Edit3 size={17} />
                </button>
                <button
                  aria-label="Delete"
                  onClick={() => remove(c)}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
          {!items.length && (
            <p className="p-12 text-center text-[#778078]">
              No categories found. Create your first category to get started.
            </p>
          )}
        </div>
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <form
            onSubmit={save}
            className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6"
          >
            <div className="flex justify-between">
              <h2 className="font-serif text-2xl">
                {"_id" in editing ? "Edit category" : "Add category"}
              </h2>
              <button type="button" onClick={() => setEditing(null)}>
                <X />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label="English name"
                value={editing.name}
                set={(v) =>
                  setEditing({
                    ...editing,
                    name: v,
                    slug: "_id" in editing ? editing.slug : slug(v),
                  })
                }
              />
              <Input
                label="Arabic name"
                value={editing.nameAr || ""}
                set={(v) => setEditing({ ...editing, nameAr: v })}
                dir="rtl"
              />
              <Input
                label="Slug"
                value={editing.slug}
                set={(v) => setEditing({ ...editing, slug: slug(v) })}
              />
              <Input
                label="Icon"
                value={editing.icon || ""}
                set={(v) => setEditing({ ...editing, icon: v })}
              />
              <label className="sm:col-span-2">
                <span className="field-label">Description</span>
                <textarea
                  className="input"
                  value={editing.description || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </label>
              <div className="sm:col-span-2">
                <ImageUploader
                  label="Category image"
                  value={editing.image || ""}
                  onChange={(v) => setEditing({ ...editing, image: v })}
                />
              </div>
            </div>
            <button className="mt-6 w-full rounded-xl bg-[#1f3025] py-3 font-bold text-white">
              Save category
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
function Input({
  label,
  value,
  set,
  dir,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  dir?: "rtl";
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input
        required={!label.includes("Arabic") && !label.includes("Icon")}
        dir={dir}
        className="input"
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  );
}
function slug(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
