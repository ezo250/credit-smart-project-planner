import { createFileRoute, Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { buildGoogleMapEmbedUrl, buildListingMapUrl, CATEGORIES, DISTRICTS, fmtRWF, getListingCoordinates, getListingMapQuery } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";

type S = { q?: string; cat?: string; district?: string; type?: string; min?: number; max?: number; sort?: string; page?: number };

export const Route = createFileRoute("/listings")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: (s.q as string) || undefined, cat: (s.cat as string) || undefined, district: (s.district as string) || undefined,
    type: (s.type as string) || undefined, min: s.min ? Number(s.min) : undefined, max: s.max ? Number(s.max) : undefined,
    sort: (s.sort as string) || undefined, page: s.page ? Number(s.page) : undefined,
  }),
  head: () => ({ meta: [{ title: "Property & product listings — AmSi Real Estate" }, { name: "description", content: "Browse land, houses, apartments and cars for sale or rent in Rwanda." }, { property: "og:title", content: "Listings — AmSi Real Estate" }, { property: "og:description", content: "Browse verified listings across Rwanda." }] }),
  component: ListingsPage,
});

const PER = 6;

function ListingsPage() {
  const child = useMatch({ from: "/listings/$id", shouldThrow: false });
  if (child) return <Outlet />;
  return <Browse />;
}

function Browse() {
  const s = Route.useSearch();
  const nav = useNavigate({ from: "/listings" });
  const [draft, setDraft] = useState<S>(s);
  const all = useStore((st) => st.listings);
  let items = all.filter((l) => l.status === "approved"
    && (!s.q || (l.title + l.description + l.sector).toLowerCase().includes(s.q.toLowerCase()))
    && (!s.cat || l.category === s.cat) && (!s.district || l.district === s.district) && (!s.type || l.type === s.type)
    && (!s.min || l.price >= s.min) && (!s.max || l.price <= s.max));
  if (s.sort === "low") items = [...items].sort((a, b) => a.price - b.price);
  else if (s.sort === "high") items = [...items].sort((a, b) => b.price - a.price);
  else items = [...items].sort((a, b) => Number(!!b.sponsored) - Number(!!a.sponsored) || b.createdAt - a.createdAt);
  const page = s.page ?? 1;
  const pages = Math.max(1, Math.ceil(items.length / PER));
  const shown = items.slice((page - 1) * PER, page * PER);
  const mapCenter = useMemo(() => {
    const first = shown[0] ? getListingMapQuery(shown[0]) : "Rwanda";
    return first;
  }, [shown]);
  const mapPins = useMemo(() => shown.map((listing) => {
    const query = getListingMapQuery(listing);
    const coords = getListingCoordinates(listing);
    return { listing, query, coords };
  }), [shown]);
  const mapEmbedUrl = useMemo(() => buildGoogleMapEmbedUrl(mapPins.map((pin) => pin.coords), mapCenter), [mapCenter, mapPins]);
  const inp = "h-11 w-full rounded-full border bg-card px-4 text-sm";
  const apply = () => nav({ search: { ...draft, page: undefined } });

  return (
    <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-8 lg:grid-cols-[300px_1fr_380px]">
      <aside className="h-fit space-y-3 rounded-2xl border bg-card p-5 lg:sticky lg:top-20">
        <div className="grid grid-cols-2 gap-2">
          {(["rent", "sale"] as const).map((t) => (
            <button key={t} onClick={() => setDraft({ ...draft, type: draft.type === t ? undefined : t })} className={"h-11 rounded-full text-sm font-semibold uppercase " + (draft.type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>For {t}</button>
          ))}
        </div>
        <input className={inp} placeholder="Type keyword…" value={draft.q ?? ""} onChange={(e) => setDraft({ ...draft, q: e.target.value })} />
        <select className={inp} value={draft.district ?? ""} onChange={(e) => setDraft({ ...draft, district: e.target.value || undefined })}><option value="">Location (district)</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
        <select className={inp} value={draft.cat ?? ""} onChange={(e) => setDraft({ ...draft, cat: e.target.value || undefined })}><option value="">Property type</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
        <div className="grid grid-cols-2 gap-2">
          <input className={inp} type="number" placeholder="Min RWF" value={draft.min ?? ""} onChange={(e) => setDraft({ ...draft, min: e.target.value ? Number(e.target.value) : undefined })} />
          <input className={inp} type="number" placeholder="Max RWF" value={draft.max ?? ""} onChange={(e) => setDraft({ ...draft, max: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
        <Button className="h-12 w-full rounded-full" onClick={apply}>Find properties →</Button>
        <button className="w-full text-sm text-muted-foreground" onClick={() => { setDraft({}); nav({ search: {} }); }}>Clear filters</button>
      </aside>

      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Listings <span className="text-base font-normal text-muted-foreground">({items.length})</span></h1>
          <select className="h-10 rounded-xl border bg-card px-3 text-sm" value={s.sort ?? ""} onChange={(e) => nav({ search: { ...s, sort: e.target.value || undefined } })}>
            <option value="">Sort: Recommended</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
          </select>
        </div>
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">No listings match your filters. Try widening your search.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">{shown.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        )}
        {pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => nav({ search: { ...s, page: p } })} className={"h-9 w-9 rounded-full text-sm " + (p === page ? "bg-primary text-primary-foreground" : "border bg-card")}>{p}</button>
            ))}
          </div>
        )}
      </section>

      <aside className="relative hidden h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border bg-accent lg:sticky lg:top-20 lg:block">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        <p className="absolute left-4 top-4 z-10 rounded-full bg-card px-3 py-1 text-xs font-medium">Map view · general locations</p>
        <div className="relative h-full w-full">
          <iframe
            title="Listings map"
            className="h-full w-full border-0"
            src={mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {mapPins.map(({ listing: l, query }) => (
            <div key={l.id} className="pointer-events-none absolute" style={{ left: `${(Math.abs(Math.sin(l.id.length) * 100) % 72) + 12}%`, top: `${(Math.abs(Math.cos(l.id.length) * 100) % 68) + 12}%` }}>
              <span className="group relative block pointer-events-auto">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/25"><span className="h-3.5 w-3.5 rounded-full bg-primary ring-2 ring-card" /></span>
                <span className="absolute left-8 top-0 hidden w-48 rounded-xl bg-card p-2 text-xs shadow-card group-hover:block"><b className="block">{l.title}</b><MapPin className="inline h-3 w-3" /> {l.district} · {fmtRWF(l.price)}</span>
              </span>
              <a href={buildListingMapUrl(query)} target="_blank" rel="noreferrer" className="sr-only">Open map for {l.title}</a>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
