import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Car, Gavel, Home, KeyRound, Laptop, Map, Search, Sparkles } from "lucide-react";
import { CATEGORIES, DISTRICTS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IsokoHub — Buy, Rent, Sell & Auction in Rwanda" },
      { name: "description", content: "Search land, houses, apartments, cars and auctions across Rwanda. Prices in RWF." },
      { property: "og:title", content: "IsokoHub — Rwanda's premium marketplace" },
      { property: "og:description", content: "Search land, houses, cars and auctions across Rwanda." },
    ],
  }),
  component: Index,
});

const shortcuts = [
  { label: "Land", icon: Map, search: { cat: "land" } }, { label: "Houses", icon: Home, search: { cat: "house" } },
  { label: "Cars", icon: Car, search: { cat: "car" } }, { label: "Electronics", icon: Laptop, search: { cat: "electronics" } },
  { label: "Rentals", icon: KeyRound, search: { type: "rent" } },
];

function Index() {
  const nav = useNavigate();
  const listings = useStore((s) => s.listings.filter((l) => l.status === "approved"));
  const auctions = useStore((s) => s.auctions.filter((a) => a.status === "active"));
  const [f, setF] = useState({ q: "", cat: "", district: "", type: "", max: "" });
  const go = (e: React.FormEvent) => { e.preventDefault(); nav({ to: "/listings", search: { ...f, max: f.max ? Number(f.max) : undefined } }); };
  const sel = "h-12 rounded-xl border bg-card px-3 text-sm";
  return (
    <>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <p className="text-sm font-medium text-primary">Rwanda's premium marketplace</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-extrabold tracking-tight md:text-5xl">Find land, homes, cars & more — in seconds.</h1>
          <form onSubmit={go} className="mt-8 grid gap-2 rounded-2xl bg-card p-3 text-foreground shadow-card md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
            <input className={sel} placeholder="Search keywords…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
            <select className={sel} value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
            <select className={sel} value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })}><option value="">Any district</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
            <select className={sel} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="">Sale or rent</option><option value="sale">For Sale</option><option value="rent">For Rent</option></select>
            <input className={sel} type="number" placeholder="Max price (RWF)" value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} />
            <Button type="submit" className="h-12 rounded-xl px-6"><Search className="h-4 w-4" />Search</Button>
          </form>
          <div className="mt-6 flex flex-wrap gap-2">
            {shortcuts.map((s) => (
              <Link key={s.label} to="/listings" search={s.search} className="flex items-center gap-2 rounded-full border border-sidebar-border px-4 py-2 text-sm hover:bg-sidebar-accent"><s.icon className="h-4 w-4" />{s.label}</Link>
            ))}
            <Link to="/auctions" className="flex items-center gap-2 rounded-full border border-sidebar-border px-4 py-2 text-sm hover:bg-sidebar-accent"><Gavel className="h-4 w-4" />Auctions</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12">
        <Section title="Featured listings" to="/listings">{listings.filter((l) => l.featured || l.sponsored).slice(0, 4).map((l) => <ListingCard key={l.id} l={l} />)}</Section>

        <Link to="/advisor" className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center">
          <div><p className="flex items-center gap-2 text-sm opacity-90"><Sparkles className="h-4 w-4" />AI Investment Advisor</p><p className="mt-1 text-2xl font-bold">"I have 20M RWF and want land for a house — what fits?"</p></div>
          <span className="rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-primary">Ask the advisor →</span>
        </Link>

        <section>
          <div className="mb-5 flex items-end justify-between"><h2 className="text-2xl font-bold">Auctions ending soon</h2><Link to="/auctions" className="text-sm font-medium text-primary">View all →</Link></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {auctions.map((a) => (
              <Link key={a.id} to="/auctions" className="group overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={a.img} alt={a.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute left-2 top-2 flex gap-1">
                    <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">Live</span>
                    <span className="rounded-md bg-warning px-1.5 py-0.5 text-[10px] font-medium text-navy">Hot</span>
                  </div>
                  <span className="absolute bottom-2 left-2 rounded-md bg-navy/70 px-1.5 py-0.5 text-[10px] font-medium text-navy-foreground">{a.bids.length} bids</span>
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-semibold">{a.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{a.description}</p>
                  <div className="mt-2 flex items-center justify-between border-t pt-2">
                    <span className="text-[10px] text-muted-foreground">Entry {new Intl.NumberFormat("en-US").format(a.entryFee)} RWF</span>
                    <span className="text-xs font-bold text-navy">{new Intl.NumberFormat("en-US").format(a.startPrice)} RWF</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <Section title="Recently added" to="/listings">{[...listings].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8).map((l) => <ListingCard key={l.id} l={l} />)}</Section>

        <section className="rounded-2xl border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">Need help?</h2>
          <p className="mt-2 text-muted-foreground">Our support team answers within one business day.</p>
          <Button className="mt-4 rounded-full" onClick={() => nav({ to: "/contact" })}>Contact support</Button>
        </section>
      </div>
    </>
  );
}

function Section({ title, to, children }: { title: string; to: "/listings"; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between"><h2 className="text-2xl font-bold">{title}</h2><Link to={to} className="text-sm font-medium text-primary">View all →</Link></div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}
