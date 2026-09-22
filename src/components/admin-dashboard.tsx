"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  BookOpen,
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  QrCode,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import type { Business, Category, MenuItem, Option } from "@/lib/types";
import { demoBusiness, demoCategories, demoItems } from "@/lib/demo-data";
import ImageUploader from "@/components/image-uploader";
type Tab = "overview" | "items" | "categories" | "settings" | "qr";
export default function AdminDashboard({
  initialTab = "overview",
}: {
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab),
    [items, setItems] = useState<MenuItem[]>(demoItems),
    [cats, setCats] = useState<Category[]>(demoCategories),
    [business, setBusiness] = useState<Business>(demoBusiness),
    [open, setOpen] = useState(false),
    [mobile, setMobile] = useState(false);
  const [qr, setQr] = useState("");
  useEffect(() => {
    Promise.all([
      fetch("/api/items").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/categories").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/business").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([i, c, b]) => {
        if (i) setItems(Array.isArray(i) ? i : i.items);
        if (c) setCats(c);
        if (b) setBusiness(b);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (tab === "qr")
      QRCode.toDataURL(location.origin, {
        width: 600,
        margin: 2,
        color: { dark: "#1e3025", light: "#ffffff" },
      }).then(setQr);
  }, [tab]);
  const nav = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "items", label: "Menu items", icon: BookOpen },
    { id: "categories", label: "Categories", icon: FolderOpen },
    { id: "settings", label: "Business profile", icon: Settings },
    { id: "qr", label: "QR code", icon: QrCode },
  ] as const;
  const go = (id: Tab) => {
    setTab(id);
    setMobile(false);
  };
  return (
    <div className="min-h-screen bg-[#f4f5f1] text-[#203026]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1c2d22] p-5 text-white transition md:translate-x-0 ${mobile ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-[#e5b565] font-serif text-[#1c2d22]">
              SC
            </div>
            <div>
              <p className="font-serif text-lg">Savor Admin</p>
              <p className="text-[10px] uppercase tracking-widest text-white/45">
                Menu studio
              </p>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>
        <nav className="mt-10 space-y-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${tab === n.id ? "bg-white/12 text-white" : "text-white/60 hover:bg-white/5"}`}
            >
              <n.icon size={18} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 space-y-1 border-t border-white/10 pt-5">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60"
          >
            <ExternalLink size={18} />
            View live menu
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="md:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-[#dde0da] bg-white px-5 md:px-9">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobile(true)}>
              <Menu />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9a7c4b]">
                Dashboard
              </p>
              <h1 className="font-serif text-2xl capitalize">
                {nav.find((n) => n.id === tab)?.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Restaurant owner</p>
              <p className="text-xs text-[#7b847d]">Administrator</p>
            </div>
            <div className="grid size-10 place-items-center rounded-full bg-[#dbe5dd] text-sm font-bold">
              RO
            </div>
          </div>
        </header>
        <div className="p-5 md:p-9">
          {tab === "overview" && (
            <Overview items={items} cats={cats} setTab={go} />
          )}{" "}
          {tab === "items" && (
            <Items
              items={items}
              cats={cats}
              setItems={setItems}
              open={() => setOpen(true)}
            />
          )}{" "}
          {tab === "categories" && <Categories cats={cats} setCats={setCats} />}{" "}
          {tab === "settings" && (
            <BusinessForm value={business} setValue={setBusiness} />
          )}{" "}
          {tab === "qr" && <QRPanel qr={qr} business={business} />}
        </div>
      </main>
      {open && (
        <ItemModal
          cats={cats}
          close={() => setOpen(false)}
          added={(p) => {
            setItems((v) => [p, ...v]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Overview({
  items,
  cats,
  setTab,
}: {
  items: MenuItem[];
  cats: Category[];
  setTab: (t: Tab) => void;
}) {
  const stats = [
    {
      label: "Menu items",
      value: items.length,
      sub: `${items.filter((i) => i.available).length} available`,
      target: "items" as Tab,
    },
    {
      label: "Categories",
      value: cats.length,
      sub: `${cats.filter((c) => c.active).length} active`,
      target: "categories" as Tab,
    },
    {
      label: "Featured",
      value: items.filter((i) => i.featured).length,
      sub: "On the homepage",
      target: "items" as Tab,
    },
    {
      label: "Sold out",
      value: items.filter((i) => !i.available).length,
      sub: "Need attention",
      target: "items" as Tab,
    },
  ];
  return (
    <>
      <div className="rounded-[1.75rem] bg-[#dce6dd] p-7 md:flex md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Good afternoon</p>
          <h2 className="mt-2 font-serif text-3xl">
            Your menu looks delicious.
          </h2>
          <p className="mt-2 text-sm text-[#637067]">
            Keep it fresh—update availability before the dinner rush.
          </p>
        </div>
        <button
          onClick={() => setTab("items")}
          className="mt-5 rounded-full bg-[#1e3025] px-5 py-3 text-sm font-bold text-white md:mt-0"
        >
          Manage menu
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-5">
            <p className="text-sm text-[#78817a]">{s.label}</p>
            <p className="mt-2 font-serif text-4xl">{s.value}</p>
            <p className="mt-2 text-xs text-[#909791]">{s.sub}</p>
            <button
              type="button"
              onClick={() => setTab(s.target)}
              className="mt-5 flex w-full items-center justify-between border-t border-[#eceee9] pt-3 text-sm font-bold text-[#496652]"
            >
              View
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl">Popular picks</h3>
            <p className="text-sm text-[#7a827c]">
              Featured and best-selling dishes
            </p>
          </div>
          <BarChart3 className="text-[#b79054]" />
        </div>
        <div className="mt-5 divide-y divide-[#eceee9]">
          {items
            .filter((i) => i.featured || i.bestSeller)
            .slice(0, 4)
            .map((i) => (
              <div key={i._id} className="flex items-center gap-4 py-3">
                <img
                  src={i.image}
                  alt=""
                  className="size-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{i.name}</p>
                  <p className="text-xs text-[#8a928c]">
                    {i.available ? "Available" : "Sold out"}
                  </p>
                </div>
                <p className="text-sm font-bold">
                  {i.discountPrice || i.price} EGP
                </p>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
function Items({
  items,
  cats,
  setItems,
  open,
}: {
  items: MenuItem[];
  cats: Category[];
  setItems: (v: MenuItem[]) => void;
  open: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [itemError, setItemError] = useState("");
  const toggle = async (p: MenuItem) => {
    const next = { ...p, available: !p.available };
    setItems(items.map((i) => (i._id === p._id ? next : i)));
    await fetch(`/api/items/${p._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ available: next.available }),
    }).catch(() => {});
  };
  const del = async (p: MenuItem) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    setItemError("");
    const response = await fetch(`/api/items/${p._id}`, {
      method: "DELETE",
    }).catch(() => null);
    if (response?.status === 401) {
      router.push("/admin/login");
      return;
    }
    if (!response?.ok) {
      const result = await response?.json().catch(() => null);
      setItemError(result?.error || "Unable to delete this item.");
      return;
    }
    setItems(items.filter((i) => i._id !== p._id));
  };
  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <label className="flex h-11 max-w-sm flex-1 items-center gap-2 rounded-xl border border-[#dfe1dc] bg-white px-4">
          <Search size={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search menu items"
            className="w-full outline-none"
          />
        </label>
        <button
          onClick={open}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1f3025] px-5 py-3 text-sm font-bold text-white"
        >
          <Plus size={17} />
          Add menu item
        </button>
      </div>
      {itemError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {itemError}
        </p>
      )}
      <div className="mt-5 overflow-hidden rounded-2xl bg-white">
        <div className="hidden grid-cols-[1fr_150px_120px_160px] gap-4 border-b p-4 text-xs font-bold uppercase tracking-wide text-[#8a918c] md:grid">
          <span>Item</span>
          <span>Category</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {items
          .filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))
          .map((p) => (
            <div
              key={p._id}
              className="grid items-center gap-3 border-b border-[#eceee9] p-4 last:border-0 md:grid-cols-[1fr_150px_120px_160px]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.image}
                  alt=""
                  className="size-14 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <div className="flex items-baseline gap-2 text-sm">
                    <span
                      className={
                        p.discountPrice != null
                          ? "font-semibold text-[#b64b38]"
                          : "text-[#89908b]"
                      }
                    >
                      {p.discountPrice ?? p.price} EGP
                    </span>
                    {p.discountPrice != null && (
                      <span className="text-xs text-[#a0a6a1] line-through">
                        {p.price} EGP
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#667068]">
                {typeof p.category === "string"
                  ? cats.find((c) => c._id === p.category)?.name
                  : p.category.name}
              </p>
              <button
                onClick={() => toggle(p)}
                className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${p.available ? "bg-[#e2f2e6] text-[#327044]" : "bg-[#f3e3df] text-[#9b4938]"}`}
              >
                {p.available ? "Available" : "Sold out"}
              </button>
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/products/${p._id}/edit`}
                  className="rounded-lg border border-[#dce1da] px-3 py-2 text-xs font-bold text-[#496652] hover:bg-[#f3f6f2]"
                >
                  Update
                </Link>
                <button
                  onClick={() => del(p)}
                  aria-label={`Delete ${p.name}`}
                  className="rounded-lg p-2 text-[#9e6559] hover:bg-red-50"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
function Categories({
  cats,
}: {
  cats: Category[];
  setCats: (v: Category[]) => void;
}) {
  return (
    <>
      <div className="flex justify-end">
        <Link
          href="/admin/categories"
          className="flex gap-2 rounded-xl bg-[#1f3025] px-5 py-3 text-sm font-bold text-white"
        >
          <Plus size={17} />
          New category
        </Link>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c, i) => (
          <div key={c._id} className="rounded-2xl bg-white p-5">
            <div className="flex justify-between">
              <span className="grid size-9 place-items-center rounded-full bg-[#eff1ec] text-sm font-bold">
                {i + 1}
              </span>
              <span
                className={`text-xs font-bold ${c.active ? "text-green-700" : "text-gray-400"}`}
              >
                {c.active ? "ACTIVE" : "HIDDEN"}
              </span>
            </div>
            <h3 className="mt-5 font-serif text-2xl">{c.name}</h3>
            <p className="mt-1 text-sm text-[#838b85]">
              {c.description || "Menu category"}
            </p>
            <p className="mt-5 text-xs text-[#a0a6a1]">{c.slug}</p>
          </div>
        ))}
      </div>
      <Link
        href="/admin/categories"
        className="mt-5 inline-block text-sm font-bold text-[#496652]"
      >
        Open category manager →
      </Link>
    </>
  );
}
function BusinessForm({
  value,
  setValue,
}: {
  value: Business;
  setValue: (b: Business) => void;
}) {
  const [saved, setSaved] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/business", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(value),
    }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  const field = (key: keyof Business, label: string) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#737c75]">
        {label}
      </span>
      <input
        value={String(value[key] || "")}
        onChange={(e) => setValue({ ...value, [key]: e.target.value })}
        className="w-full rounded-xl border border-[#dfe2dc] bg-white px-4 py-3 outline-none focus:border-[#7f9b87]"
      />
    </label>
  );
  return (
    <form onSubmit={save} className="max-w-3xl rounded-2xl bg-white p-6">
      <h2 className="font-serif text-2xl">Restaurant details</h2>
      <p className="mt-1 text-sm text-[#7d857f]">
        Everything here appears on your public menu.
      </p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        {field("name", "Business name")}
        {field("description", "Short description")}
        <div className="sm:col-span-2 rounded-xl border border-[#e3e5e0] bg-[#fafbf8] p-4">
          <p className="mb-4 text-sm font-bold text-[#405047]">
            Homepage hero text
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("heroEyebrow", "Welcome label")}
            {field("heroTitle", "Main headline")}
            <div className="sm:col-span-2">
              {field("heroEmphasis", "Emphasized headline")}
            </div>
          </div>
        </div>
        {field("address", "Address")}
        {field("openingHours", "Opening hours")}
        {field("phone", "Phone")}
        {field("whatsapp", "WhatsApp")}
        {field("instagram", "Instagram URL")}
        {field("facebook", "Facebook URL")}
        <div className="sm:col-span-2">
          <ImageUploader
            label="Cover image"
            value={value.coverImage}
            onChange={(coverImage) => setValue({ ...value, coverImage })}
          />
        </div>
      </div>
      <label className="mt-5 flex items-center gap-3 rounded-xl bg-[#f5f6f2] p-4">
        <input
          type="checkbox"
          checked={value.hideUnavailable}
          onChange={(e) =>
            setValue({ ...value, hideUnavailable: e.target.checked })
          }
        />
        <span>
          <b className="block text-sm">Hide unavailable items</b>
          <span className="text-xs text-[#7c847e]">
            Otherwise they appear with a Sold Out badge.
          </span>
        </span>
      </label>
      <button className="mt-6 rounded-xl bg-[#1f3025] px-6 py-3 text-sm font-bold text-white">
        {saved ? "Saved ✓" : "Save changes"}
      </button>
    </form>
  );
}
function QRPanel({ qr, business }: { qr: string; business: Business }) {
  return (
    <div className="grid max-w-4xl overflow-hidden rounded-[1.75rem] bg-white md:grid-cols-2">
      <div className="bg-[#1e3025] p-9 text-white">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#e5b565]">
          Scan. Browse. Enjoy.
        </p>
        <h2 className="mt-4 font-serif text-4xl">Your menu, one scan away.</h2>
        <p className="mt-4 text-sm leading-6 text-white/60">
          Print this code on tables, packaging, windows or receipts. It always
          opens the latest version of your menu.
        </p>
        <p className="mt-10 font-serif text-xl">{business.name}</p>
      </div>
      <div className="grid place-items-center p-9 text-center">
        {qr && <img src={qr} alt="Menu QR code" className="w-56" />}
        <a
          href={qr}
          download="menu-qr.png"
          className="mt-5 rounded-xl border border-[#d9ddd7] px-5 py-3 text-sm font-bold"
        >
          Download PNG
        </a>
      </div>
    </div>
  );
}
function ItemModal({
  cats,
  close,
  added,
}: {
  cats: Category[];
  close: () => void;
  added: (p: MenuItem) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
      name: "",
      description: "",
      price: 0,
      discountPrice: undefined as number | undefined,
      image: "",
      category: cats[0]?._id || "",
      sizes: [] as Option[],
      extras: [] as Option[],
      available: true,
      featured: false,
      bestSeller: false,
      isNew: false,
      customBadges: [] as string[],
    }),
    [customStatus, setCustomStatus] = useState(""),
    [submitError, setSubmitError] = useState(""),
    [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSubmitError("");
    const data = {
      ...form,
      slug: form.name.toLowerCase().replace(/\s+/g, "-"),
      order: 0,
    };
    const r = await fetch("/api/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);
    if (r?.status === 401) {
      router.push("/admin/login");
      return;
    }
    if (!r?.ok) {
      const response = await r?.json().catch(() => null);
      setSubmitError(
        response?.error || "Unable to create the product. Please try again.",
      );
      setSaving(false);
      return;
    }
    const p = await r.json();
    added(p);
  };
  const optionEditor = (key: "sizes" | "extras", title: string) => {
    const options = form[key];
    return (
      <div className="rounded-xl border border-[#e2e5df] bg-[#fafbf8] p-4 sm:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">{title}</p>
            <p className="text-xs text-[#7b847d]">
              Add a name and price for each option.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm({ ...form, [key]: [...options, { name: "", price: 0 }] })
            }
            className="flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-xs font-bold"
          >
            <Plus size={14} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="grid grid-cols-[1fr_110px_36px] gap-2">
              <input
                aria-label={`${title} name`}
                value={option.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: options.map((current, i) =>
                      i === index
                        ? { ...current, name: e.target.value }
                        : current,
                    ),
                  })
                }
                className="input"
                placeholder={key === "sizes" ? "Medium" : "Extra cheese"}
              />
              <input
                aria-label={`${title} price`}
                type="number"
                min="0"
                value={option.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: options.map((current, i) =>
                      i === index
                        ? { ...current, price: Number(e.target.value) }
                        : current,
                    ),
                  })
                }
                className="input"
                placeholder="EGP"
              />
              <button
                type="button"
                aria-label={`Remove ${title} option`}
                onClick={() =>
                  setForm({
                    ...form,
                    [key]: options.filter((_, i) => i !== index),
                  })
                }
                className="grid place-items-center rounded-lg text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {!options.length && (
            <p className="py-2 text-center text-xs text-[#929992]">
              No options added.
            </p>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 sm:place-items-center sm:p-4">
      <form
        onSubmit={submit}
        className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-5 pb-0 sm:rounded-2xl sm:p-6 sm:pb-0"
      >
        <div className="flex justify-between">
          <div>
            <p className="eyebrow">Menu editor</p>
            <h2 className="font-serif text-2xl">Add a new item</h2>
          </div>
          <button type="button" onClick={close}>
            <X />
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            label="Product name"
            value={form.name}
            change={(v) => setForm({ ...form, name: v })}
          />
          <Field
            label="Price (EGP)"
            type="number"
            value={String(form.price)}
            change={(v) => setForm({ ...form, price: Number(v) })}
          />
          <label>
            <span className="field-label">Discount price (EGP)</span>
            <input
              type="number"
              min="0"
              max={form.price > 0 ? form.price - 0.01 : undefined}
              step="0.01"
              value={form.discountPrice ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  discountPrice:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              className="input"
              placeholder="Leave empty for no discount"
            />
            <span className="mt-1 block text-xs text-[#7b847d]">
              Must be lower than the regular price.
            </span>
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Description</span>
            <textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input min-h-24"
            />
          </label>
          <label>
            <span className="field-label">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
            >
              {cats.map((c) => (
                <option value={c._id} key={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {optionEditor("sizes", "Available sizes")}
          {optionEditor("extras", "Extras and add-ons")}
          <div className="rounded-xl border border-[#e2e5df] bg-[#fafbf8] p-4 sm:col-span-2">
            <p className="mb-3 text-sm font-bold">Product status</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["available", "Available"],
                  ["featured", "Featured"],
                  ["bestSeller", "Best seller"],
                  ["isNew", "New item"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e1e4df] bg-white px-4 py-3 text-sm font-semibold"
                >
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.checked })
                    }
                    className="size-4 accent-[#1f3025]"
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-4 border-t border-[#e2e5df] pt-4">
              <span className="field-label">Custom status</span>
              <div className="flex gap-2">
                <input
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  className="input min-w-0 flex-1"
                  maxLength={30}
                  placeholder="e.g. Chef's Choice"
                />
                <button
                  type="button"
                  onClick={() => {
                    const label = customStatus.trim();
                    if (!label || form.customBadges.includes(label)) return;
                    setForm({
                      ...form,
                      customBadges: [...form.customBadges, label],
                    });
                    setCustomStatus("");
                  }}
                  className="rounded-xl bg-[#1f3025] px-4 text-sm font-bold text-white"
                >
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {form.customBadges.map((label) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() =>
                      setForm({
                        ...form,
                        customBadges: form.customBadges.filter(
                          (item) => item !== label,
                        ),
                      })
                    }
                    className="flex items-center gap-1 rounded-full bg-[#e8eee9] px-3 py-1.5 text-xs font-bold text-[#405248]"
                    title="Remove status"
                  >
                    {label} <X size={13} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <ImageUploader
              label="Product image"
              value={form.image}
              onChange={(v) => setForm({ ...form, image: v })}
            />
          </div>
        </div>
        {submitError && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        )}
        <div className="sticky bottom-0 -mx-5 mt-6 border-t border-[#eceee9] bg-white/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <button
            disabled={saving}
            className="w-full rounded-xl bg-[#1f3025] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1f3025]/15 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create menu item"}
          </button>
        </div>
      </form>
    </div>
  );
}
function Field({
  label,
  value,
  change,
  type = "text",
}: {
  label: string;
  value: string;
  change: (v: string) => void;
  type?: string;
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => change(e.target.value)}
        className="input"
      />
    </label>
  );
}
