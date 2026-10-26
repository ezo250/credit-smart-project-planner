import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Heart, MapPin, Ruler, ShieldCheck } from "lucide-react";
import { fmtRWF, type Listing } from "@/lib/data";
import { setState, useStore } from "@/lib/store";
import { toast } from "sonner";

const typeLabel = { sale: "For Sale", rent: "For Rent", auction: "Auction" };

export function ListingCard({ l }: { l: Listing }) {
  const fav = useStore((s) => (s.currentUserId ? (s.favorites[s.currentUserId] ?? []).includes(l.id) : false));
  const me = useStore((s) => s.currentUserId);
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!me) return toast.error("Sign in to save favorites");
    setState((s) => {
      const cur = s.favorites[me] ?? [];
      return { favorites: { ...s.favorites, [me]: fav ? cur.filter((x) => x !== l.id) : [...cur, l.id] } };
    });
    toast.success(fav ? "Removed from favorites" : "Saved to favorites");
  };
  return (
    <Link to="/listings/$id" params={{ id: l.id }} className="group overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={l.img} alt={l.title} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {l.featured && <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">Featured</span>}
          {l.sponsored && <span className="rounded-md bg-warning px-2 py-0.5 text-xs font-medium text-navy">Sponsored</span>}
          <span className="rounded-md bg-navy/70 px-2 py-0.5 text-xs font-medium text-navy-foreground">{typeLabel[l.type]}</span>
        </div>
        <button onClick={toggle} aria-label="Save favorite" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-card/90">
          <Heart className={"h-4 w-4 " + (fav ? "fill-primary text-primary" : "text-muted-foreground")} />
        </button>
        <span className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-navy-foreground drop-shadow"><MapPin className="h-3.5 w-3.5" />{l.sector}, {l.district}</span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold">{l.title}</h3>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {l.beds != null && <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />Beds: {l.beds}</span>}
          {l.baths != null && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />Baths: {l.baths}</span>}
          {l.size != null && <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{l.size.toLocaleString()} m²</span>}
          {l.beds == null && l.features.slice(0, 2).map((f) => <span key={f}>{f}</span>)}
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">{l.verified && <><ShieldCheck className="h-3.5 w-3.5 text-success" />Verified</>}</span>
          <span className="font-bold text-navy">{fmtRWF(l.price)}{l.type === "rent" && <span className="text-xs font-normal text-muted-foreground">/mo</span>}</span>
        </div>
      </div>
    </Link>
  );
}
