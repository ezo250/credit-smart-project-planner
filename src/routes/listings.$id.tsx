import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Flag, Lock, MapPin, ShieldCheck, Unlock } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, fmtRWF, type Listing } from "@/lib/data";
import { getState, log, setState, uid, useMe, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/listings/$id")({
  head: () => ({ meta: [{ title: "Listing details — IsokoHub" }, { name: "description", content: "Listing details, features and premium information." }, { property: "og:title", content: "Listing — IsokoHub" }, { property: "og:description", content: "View listing details on IsokoHub." }] }),
  component: Detail,
});

const typeLabel = { sale: "For sale", rent: "For rent", auction: "Auction" };

function grant(userId: string, l: Listing) {
  setState((s) => ({
    unlocked: { ...s.unlocked, [userId]: [...(s.unlocked[userId] ?? []), l.id] },
    txns: [{ id: "TX-" + uid().toUpperCase(), userId, kind: "premium", ref: l.ref, amount: l.premiumPrice, status: "success", at: Date.now() }, ...s.txns],
  }));
  log(`Premium unlocked for ${l.ref}`);
}

function Detail() {
  const { id } = Route.useParams();
  const me = useMe();
  const l = useStore((s) => s.listings.find((x) => x.id === id));
  const unlocked = useStore((s) => (s.currentUserId ? (s.unlocked[s.currentUserId] ?? []).includes(id) : false));
  const [step, setStep] = useState<"none" | "pay" | "login">("none");
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<"en" | "rw" | "fr">("en");
  const [cred, setCred] = useState({ email: "", password: "" });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"mtn" | "airtel" | "card">("mtn");
  const [paymentNumber, setPaymentNumber] = useState("");
  const paymentOptions = [
    { id: "mtn" as const, label: "MTN Mobile Money" },
    { id: "airtel" as const, label: "Airtel Money" },
    { id: "card" as const, label: "Card" },
  ];
  const paymentMethodLabel = paymentOptions.find((option) => option.id === selectedPaymentMethod)?.label ?? "MTN Mobile Money";
  const paymentPlaceholder = selectedPaymentMethod === "card" ? "Card number" : selectedPaymentMethod === "mtn" ? "MTN mobile number" : "Airtel mobile number";

  if (!l || (l.status !== "approved" && (!me || me.role === "user")))
    return <div className="mx-auto max-w-xl p-16 text-center"><h1 className="text-2xl font-bold">Listing not available</h1><Link to="/listings" className="mt-4 inline-block text-primary">Back to listings</Link></div>;

  const canSee = unlocked || (me && me.role !== "user");
  const cat = CATEGORIES.find((c) => c.id === l.category)?.label ?? l.category;
  const basic: [string, string][] = [["Category", cat], ["Listed as", typeLabel[l.type]], ["Price", fmtRWF(l.price) + (l.negotiable ? " · Negotiable" : "")], ["District", l.district], ["Sector", l.sector], ["Reference", l.ref], ["Posted on", new Date(l.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })]];

  // Step 1: payment window (always first). Step 2: login if not signed in.
  const pay = (outcome: "success" | "fail" | "cancel") => {
    if (outcome === "cancel") { setStep("none"); return toast("Payment cancelled"); }
    if (!paymentNumber.trim()) { return toast.error(`Enter your ${selectedPaymentMethod === "card" ? "card" : "mobile money"} number to continue`); }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (outcome === "fail") return toast.error("Simulated payment failed. Nothing was charged.");
      if (me) { grant(me.id, l); setStep("none"); toast.success("Premium details unlocked"); }
      else { setStep("login"); toast.success("Payment received — sign in to view your unlocked details"); }
    }, 900);
  };
  const login = (e: React.FormEvent) => {
    e.preventDefault();
    const u = getState().users.find((x) => x.email.toLowerCase() === cred.email.toLowerCase() && x.password === cred.password);
    if (!u || !u.active) return toast.error("Wrong email or password");
    setState(() => ({ currentUserId: u.id }));
    grant(u.id, l);
    setStep("none");
    toast.success("Signed in — premium details unlocked");
  };
  const box = "rounded-2xl border bg-card p-5";
  const Rows = ({ items }: { items: [string, string][] }) => <dl className="grid gap-x-6 sm:grid-cols-2">{items.map(([k, v]) => <div key={k} className="flex justify-between border-b py-2 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/listings" className="text-sm text-muted-foreground">← Back to listings</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <img src={l.img} alt={l.title} className="aspect-[16/10] w-full rounded-2xl object-cover" />
          <div>
            <h1 className="text-3xl font-bold">{l.title}</h1>
            <p className="mt-2 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{l.sector}, {l.district}{l.verified && <span className="ml-2 flex items-center gap-1 text-success"><ShieldCheck className="h-4 w-4" />Verified</span>}</p>
            {l.headline && <div className="mt-3 flex flex-wrap gap-2">{l.headline.map((h) => <span key={h} className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">{h}</span>)}</div>}
          </div>
          <section className={box}><h2 className="mb-2 font-bold">Basic data</h2><Rows items={basic} /></section>
          {l.details?.map((d) => <section key={d.group} className={box}><h2 className="mb-2 font-bold">{d.group}</h2><Rows items={d.items} /></section>)}
          {(l.equipment ?? l.features).length > 0 && (
            <section className={box}><h2 className="mb-3 font-bold">{l.equipment ? "Equipment" : "Features"}</h2>
              <ul className="grid gap-2 sm:grid-cols-2">{(l.equipment ?? l.features).map((f) => <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" />{f}</li>)}</ul></section>
          )}
          <section className={box}>
            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Description</h2>
              {l.descriptions && <div className="flex gap-1 rounded-full bg-muted p-1 text-xs">{(["en", "rw", "fr"] as const).map((k) => <button key={k} onClick={() => setLang(k)} className={"rounded-full px-3 py-1 " + (lang === k ? "bg-card font-semibold shadow-card" : "text-muted-foreground")}>{{ en: "English", rw: "Kinyarwanda", fr: "Français" }[k]}</button>)}</div>}
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed">{l.descriptions ? l.descriptions[lang] : l.description}</p>
          </section>
        </div>
        <aside className="h-fit space-y-4 rounded-2xl border bg-card p-6 shadow-card lg:sticky lg:top-20">
          <p className="text-3xl font-extrabold text-navy">{fmtRWF(l.price)}{l.type === "rent" && <span className="text-base font-normal text-muted-foreground"> /month</span>}</p>
          {l.negotiable && <p className="-mt-3 text-sm text-muted-foreground">Negotiable</p>}
          <div className="rounded-xl border">
            <div className="flex items-center justify-between border-b p-3"><p className="font-semibold">Premium information</p>{canSee ? <Unlock className="h-4 w-4 text-success" /> : <Lock className="h-4 w-4 text-muted-foreground" />}</div>
            {l.premium.length === 0 && <p className="p-3 text-sm text-muted-foreground">No premium fields on this listing.</p>}
            {l.premium.map((p) => (
              <div key={p.label} className="flex justify-between gap-3 p-3 text-sm"><span className="text-muted-foreground">{p.label}</span>
                {canSee ? <span className="text-right font-medium">{p.value}</span> : <span className="select-none font-medium blur-sm">•••••••••</span>}</div>
            ))}
            {!canSee && l.premium.length > 0 && <div className="p-3"><Button className="w-full" onClick={() => setStep("pay")}><Lock className="h-4 w-4" />Pay {fmtRWF(l.premiumPrice)} to view</Button></div>}
          </div>
          <button className="flex items-center gap-1 text-xs text-muted-foreground" onClick={() => { setState((s) => ({ tickets: [{ id: "T-" + uid().toUpperCase(), userId: me?.id ?? null, name: me?.name ?? "Guest", topic: "Report listing", message: `Suspicious listing ${l.ref}`, status: "open", at: Date.now() }, ...s.tickets] })); toast.success("Thanks — our team will review this listing."); }}><Flag className="h-3 w-3" />Report listing</button>
        </aside>
      </div>

      <Dialog open={step === "pay"} onOpenChange={(o) => !o && setStep("none")}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pay to view premium details</DialogTitle></DialogHeader>
          <p className="text-sm">Unlocks: {l.premium.map((p) => p.label).join(", ")}</p>
          <p className="text-sm">Listing <b>{l.ref}</b> · <b>{fmtRWF(l.premiumPrice)}</b></p>

          <div className="mt-2 space-y-2">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedPaymentMethod(option.id);
                  setPaymentNumber("");
                }}
                className={"flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition " + (selectedPaymentMethod === option.id ? "border-primary bg-primary/5 text-primary" : "bg-card hover:bg-muted/40")}
              >
                <span>{option.label}</span>
                <span className={"h-3.5 w-3.5 rounded-full border " + (selectedPaymentMethod === option.id ? "border-primary bg-primary" : "border-muted-foreground")}></span>
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-lg border bg-muted/30 p-3">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">{paymentMethodLabel}</label>
            <input
              type="text"
              inputMode={selectedPaymentMethod === "card" ? "numeric" : "tel"}
              value={paymentNumber}
              onChange={(event) => setPaymentNumber(event.target.value)}
              placeholder={paymentPlaceholder}
              className="mt-2 h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none ring-0 placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <Button className="h-11" disabled={busy} onClick={() => pay("success")}>{busy ? "Processing…" : "Pay now"}</Button>
            <Button className="h-11" disabled={busy} variant="outline" onClick={() => pay("fail")}>Fail</Button>
            <Button className="h-11" disabled={busy} variant="ghost" onClick={() => pay("cancel")}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={step === "login"} onOpenChange={(o) => !o && setStep("none")}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sign in to view your details</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Payment received. Sign in so the unlocked details are saved to your account. Demo: user@demo.rw / demo123</p>
          <form onSubmit={login} className="space-y-3">
            <input className="h-11 w-full rounded-xl border px-4 text-sm" type="email" placeholder="Email" value={cred.email} onChange={(e) => setCred({ ...cred, email: e.target.value })} />
            <input className="h-11 w-full rounded-xl border px-4 text-sm" type="password" placeholder="Password" value={cred.password} onChange={(e) => setCred({ ...cred, password: e.target.value })} />
            <Button type="submit" className="w-full">Sign in & unlock</Button>
            <Link to="/login" className="block text-center text-sm text-primary">No account? Register</Link>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
