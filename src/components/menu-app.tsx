"use client";
import { useMemo, useState } from "react";
import {
  Clock3,
  MapPin,
  Phone,
  Search,
  X,
  ChevronRight,
  Flame,
  Sparkles,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import type { Business, Category, MenuItem, Option } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
const money = (n: number, c: string) => `${numberFormatter.format(n)} ${c}`;
const catOf = (p: MenuItem) =>
  typeof p.category === "string" ? p.category : p.category._id;

export default function MenuApp({
  business,
  categories,
  items,
}: {
  business: Business;
  categories: Category[];
  items: MenuItem[];
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const filtered = useMemo(
    () =>
      items.filter((p) => {
        const c = categories.find((x) => x._id === catOf(p));
        const match = (p.name + " " + p.description + " " + (c?.name || ""))
          .toLowerCase()
          .includes(query.toLowerCase());
        return (
          match &&
          (active === "all" || catOf(p) === active) &&
          (!business.hideUnavailable || p.available)
        );
      }),
    [items, categories, query, active, business.hideUnavailable],
  );
  return (
    <main
      className="min-h-screen bg-[#f7f5f0] text-[#1e2b22]"
      style={{
        backgroundColor: business.appearance?.backgroundColor,
        color: business.appearance?.textColor,
      }}
    >
      <section className="hero relative min-h-[520px] overflow-hidden text-white">
        <img
          src={business.coverImage}
          alt="Restaurant interior"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,25,17,.88),rgba(12,25,17,.28))]" />
        <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col px-5 py-6 md:px-10">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-full border border-white/40 bg-white/10 font-serif text-lg">
                {business.logo}
              </div>
              <span className="font-serif text-xl tracking-wide">
                {business.name}
              </span>
            </div>
            <a
              href="#menu"
              className="rounded-full bg-[#e8b86a] px-5 py-2.5 text-sm font-semibold text-[#17251c]"
            >
              View menu
            </a>
          </nav>
          <div className="mt-auto max-w-2xl pb-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.3em] text-[#e8b86a]">
              {business.heroEyebrow || "Welcome to the table"}
            </p>
            <h1 className="font-serif text-5xl leading-[.95] md:text-7xl">
              {business.heroTitle || "Good food."}
              <br />
              <em className="font-normal">
                {business.heroEmphasis || "Beautifully simple."}
              </em>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/80">
              {business.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/80">
              <span className="flex items-center gap-2">
                <MapPin size={16} />
                {business.address}
              </span>
              <span className="flex items-center gap-2">
                <Clock3 size={16} />
                {business.openingHours}
              </span>
            </div>
          </div>
        </div>
      </section>
      <section
        id="menu"
        className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Explore our menu</p>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl">
              Made for the moment
            </h2>
          </div>
          <label className="flex h-12 w-full items-center gap-3 rounded-full border border-[#d8d6cd] bg-white px-5 md:w-80">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes, drinks…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
        </div>
        <div className="scrollbar-none sticky top-0 z-20 -mx-5 mt-8 flex gap-2 overflow-x-auto bg-[#f7f5f0]/95 px-5 py-4 backdrop-blur md:mx-0 md:px-0">
          <button
            onClick={() => setActive("all")}
            className={`pill ${active === "all" ? "pill-active" : ""}`}
          >
            All
          </button>
          {categories
            .filter((c) => c.active)
            .map((c) => (
              <button
                key={c._id}
                onClick={() => setActive(c._id)}
                className={`pill ${active === c._id ? "pill-active" : ""}`}
              >
                {c.name}
              </button>
            ))}
        </div>
        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard
              key={p._id}
              p={p}
              currency={business.currency}
              onClick={() => setSelected(p)}
            />
          ))}
        </div>
        {!filtered.length && (
          <div className="py-24 text-center">
            <Search className="mx-auto mb-4 text-[#8b938c]" />
            <h3 className="font-serif text-2xl">Nothing on the pass</h3>
            <p className="mt-2 text-[#6d746f]">
              Try another search or category.
            </p>
          </div>
        )}
      </section>
      <footer className="bg-[#19271e] px-5 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="font-serif text-2xl">{business.name}</p>
            <p className="mt-3 max-w-sm leading-6 text-white/60">
              {business.description}
            </p>
          </div>
          <div className="space-y-3 text-sm text-white/70">
            <p className="text-xs font-bold uppercase tracking-widest text-[#e8b86a]">
              Visit
            </p>
            <p>{business.address}</p>
            <p>{business.openingHours}</p>
          </div>
          <div className="flex items-end gap-3 md:justify-end">
            <a
              aria-label="Phone"
              href={`tel:${business.phone}`}
              className="social"
            >
              <Phone size={18} />
            </a>
            <a
              aria-label="WhatsApp"
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="social"
            >
              <FaWhatsapp size={19} />
            </a>
            <a
              aria-label="Instagram"
              href={business.instagram}
              target="_blank"
              rel="noreferrer"
              className="social"
            >
              <FaInstagram size={19} />
            </a>
            <a
              aria-label="Facebook"
              href={business.facebook}
              target="_blank"
              rel="noreferrer"
              className="social"
            >
              <FaFacebookF size={17} />
            </a>
          </div>
        </div>
      </footer>
      {selected && (
        <ProductModal
          p={selected}
          currency={business.currency}
          category={
            categories.find((c) => c._id === catOf(selected))?.name || "Menu"
          }
          close={() => setSelected(null)}
        />
      )}
    </main>
  );
}

function ProductCard({
  p,
  currency,
  onClick,
}: {
  p: MenuItem;
  currency: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-[1.75rem] bg-white text-left shadow-[0_8px_30px_rgba(34,51,40,.06)] transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={p.image}
          alt={p.name}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${!p.available ? "grayscale" : ""}`}
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {p.isNew && <Badge>NEW</Badge>}
          {p.bestSeller && (
            <Badge gold>
              <Flame size={12} /> BEST SELLER
            </Badge>
          )}
          {p.featured && (
            <Badge>
              <Sparkles size={12} /> FEATURED
            </Badge>
          )}
          {p.customBadges?.map((label) => (
            <Badge key={label}>{label.toUpperCase()}</Badge>
          ))}
          {p.discountPrice && <Badge gold>SALE</Badge>}
          {!p.available && <Badge dark>SOLD OUT</Badge>}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-[1.35rem] leading-tight">{p.name}</h3>
          <ChevronRight className="mt-1 shrink-0 text-[#768078]" size={18} />
        </div>
        <p className="mt-2 line-clamp-2 min-h-11 text-sm leading-6 text-[#737a74]">
          {p.description}
        </p>
        <div className="mt-4 flex items-baseline gap-2">
          {p.discountPrice ? (
            <>
              <span className="text-lg font-bold text-[#b64b38]">
                {money(p.discountPrice, currency)}
              </span>
              <span className="text-sm text-[#969c97] line-through">
                {money(p.price, currency)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold">
              {money(p.price, currency)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
function Badge({
  children,
  gold,
  dark,
}: {
  children: React.ReactNode;
  gold?: boolean;
  dark?: boolean;
}) {
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider ${dark ? "bg-[#1d2821] text-white" : gold ? "bg-[#e8b86a] text-[#26352b]" : "bg-white text-[#26352b]"}`}
    >
      {children}
    </span>
  );
}
function ProductModal({
  p,
  currency,
  category,
  close,
}: {
  p: MenuItem;
  currency: string;
  category: string;
  close: () => void;
}) {
  const [size, setSize] = useState<Option | undefined>(p.sizes[0]);
  const [extras, setExtras] = useState<Option[]>([]);
  const base = size?.price ?? p.discountPrice ?? p.price;
  const total = base + extras.reduce((s, x) => s + x.price, 0);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/55 p-0 backdrop-blur-sm md:place-items-center md:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="max-h-[92vh] w-full overflow-auto rounded-t-[2rem] bg-[#f9f8f4] md:max-w-4xl md:rounded-[2rem]">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-72">
            <img
              src={p.image}
              alt={p.name}
              className="absolute inset-0 h-full w-full object-cover md:rounded-l-[2rem]"
            />
            <button
              onClick={close}
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white shadow"
            >
              <X size={19} />
            </button>
          </div>
          <div className="p-6 md:p-9">
            <p className="eyebrow">{category}</p>
            <h2 className="mt-2 font-serif text-4xl">{p.name}</h2>
            <p className="mt-4 text-sm leading-6 text-[#687069]">
              {p.description}
            </p>
            {p.sizes.length > 0 && (
              <Choices
                title="Choose a size"
                options={p.sizes}
                selected={size ? [size] : []}
                currency={currency}
                pick={(o) => setSize(o)}
                radio
              />
            )}
            {p.extras.length > 0 && (
              <Choices
                title="Add something extra"
                options={p.extras}
                selected={extras}
                currency={currency}
                pick={(o) =>
                  setExtras((v) =>
                    v.includes(o) ? v.filter((x) => x !== o) : [...v, o],
                  )
                }
              />
            )}
            <div className="mt-7 border-t border-[#dcded8] pt-5">
              <div>
                <p className="text-xs text-[#778078]">Your selection</p>
                <p className="text-xl font-extrabold">
                  {money(total, currency)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Choices({
  title,
  options,
  selected,
  currency,
  pick,
  radio,
}: {
  title: string;
  options: Option[];
  selected: Option[];
  currency: string;
  pick: (o: Option) => void;
  radio?: boolean;
}) {
  return (
    <div className="mt-6">
      <p className="mb-3 text-sm font-bold">{title}</p>
      <div className="space-y-2">
        {options.map((o) => (
          <button
            key={o.name}
            onClick={() => pick(o)}
            className={`flex w-full justify-between rounded-xl border px-4 py-3 text-sm ${selected.includes(o) ? "border-[#294332] bg-[#edf1ed]" : "border-[#dedfd9] bg-white"}`}
          >
            <span>{o.name}</span>
            <span>
              {radio
                ? money(o.price, currency)
                : `+${money(o.price, currency)}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
