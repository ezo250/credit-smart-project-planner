import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gavel, Trophy } from "lucide-react";
import { toast } from "sonner";
import { fmtRWF, type Auction } from "@/lib/data";
import { auctionWinner, log, minBid, notify, setState, uid, useMe, useStore, validateBid } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auctions")({
  head: () => ({ meta: [{ title: "Live auctions — IsokoHub" }, { name: "description", content: "Bid on land, homes and cars in timed auctions." }, { property: "og:title", content: "Auctions — IsokoHub" }, { property: "og:description", content: "Timed auctions across Rwanda." }] }),
  component: Auctions,
});

function useNow() { const [n, setN] = useState<number | null>(null); useEffect(() => { setN(Date.now()); const t = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(t); }, []); return n; }
const fmtLeft = (ms: number) => { if (ms <= 0) return "Closed"; const s = Math.floor(ms / 1000); return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`; };

function Auctions() {
  const auctions = useStore((s) => s.auctions);
  const now = useNow();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Auctions</h1>
      <p className="mt-1 text-muted-foreground">Entry fees and bids are simulated — no real money is collected.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">{auctions.map((a) => <AuctionCard key={a.id} a={a} now={now} />)}</div>
    </div>
  );
}

function AuctionCard({ a, now }: { a: Auction; now: number | null }) {
  const me = useMe();
  const nav = useNavigate();
  const users = useStore((s) => s.users);
  const [amt, setAmt] = useState("");
  const closed = now != null && (now >= a.endsAt || a.status === "closed");
  const top = a.bids.length ? Math.max(...a.bids.map((b) => b.amount)) : null;
  const res = now != null ? auctionWinner(a, now) : { closed: false as const };
  const joined = me ? a.entrants.includes(me.id) : false;
  const anon = (id: string) => (id === me?.id ? "You" : "Bidder #" + id.slice(-3).toUpperCase());

  const pay = () => {
    if (!me) return nav({ to: "/login" });
    setState((s) => ({ auctions: s.auctions.map((x) => (x.id === a.id ? { ...x, entrants: [...x.entrants, me.id] } : x)), txns: [{ id: "TX-" + uid().toUpperCase(), userId: me.id, kind: "auction_fee", ref: a.title, amount: a.entryFee, status: "success", at: Date.now() }, ...s.txns] }));
    toast.success("Entry fee paid (simulated). You can now bid.");
  };
  const bid = () => {
    if (!me) return nav({ to: "/login" });
    const n = Number(amt);
    const err = validateBid(a, me.id, n);
    if (err) return toast.error(err);
    const prevTop = [...a.bids].sort((x, y) => y.amount - x.amount)[0];
    setState((s) => ({ auctions: s.auctions.map((x) => (x.id === a.id ? { ...x, bids: [...x.bids, { userId: me.id, amount: n, at: Date.now() }] } : x)) }));
    if (prevTop && prevTop.userId !== me.id) notify(prevTop.userId, `You were outbid on "${a.title}" (${fmtRWF(n)})`);
    log(`Bid ${fmtRWF(n)} on ${a.title}`);
    setAmt("");
    toast.success("Bid placed");
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="relative"><img src={a.img} alt={a.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />
        <span className={"absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-semibold " + (closed ? "bg-navy text-navy-foreground" : "bg-primary text-primary-foreground")}>{now == null ? "…" : fmtLeft(a.endsAt - now)}</span></div>
      <div className="space-y-3 p-5">
        <h2 className="text-lg font-bold">{a.title}</h2>
        <p className="text-sm text-muted-foreground">{a.description}</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg bg-muted p-2"><p className="text-xs text-muted-foreground">Highest bid</p><b>{top ? fmtRWF(top) : "—"}</b></div>
          <div className="rounded-lg bg-muted p-2"><p className="text-xs text-muted-foreground">Increment</p><b>{fmtRWF(a.increment)}</b></div>
          <div className="rounded-lg bg-muted p-2"><p className="text-xs text-muted-foreground">Entry fee</p><b>{fmtRWF(a.entryFee)}</b></div>
        </div>
        {res.closed ? (
          <div className="flex items-center gap-2 rounded-xl bg-accent p-3 text-sm text-accent-foreground"><Trophy className="h-4 w-4" />
            {res.winner ? <>Winner: <b>{anon(res.winner.userId)}</b> with {fmtRWF(res.winner.amount)}</> : "Reserve not met — no qualifying winner."}</div>
        ) : !joined ? (
          <Button className="w-full" onClick={pay}>Pay entry fee {fmtRWF(a.entryFee)} to join</Button>
        ) : (
          <div className="flex gap-2"><input type="number" className="h-10 flex-1 rounded-xl border px-3 text-sm" placeholder={`Min ${minBid(a).toLocaleString()}`} value={amt} onChange={(e) => setAmt(e.target.value)} /><Button onClick={bid}><Gavel className="h-4 w-4" />Bid</Button></div>
        )}
        {a.bids.length > 0 && (
          <div className="max-h-32 overflow-auto text-xs text-muted-foreground">
            {[...a.bids].reverse().map((b, i) => <p key={i} className="flex justify-between py-0.5"><span>{anon(b.userId)}{users.length ? "" : ""}</span><span>{fmtRWF(b.amount)}</span></p>)}
          </div>
        )}
      </div>
    </div>
  );
}
