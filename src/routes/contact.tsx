import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { setState, uid, useMe } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact & support — AmSi Real Estate" }, { name: "description", content: "Send an inquiry or complaint and get a ticket number." }, { property: "og:title", content: "Contact — AmSi Real Estate" }, { property: "og:description", content: "Reach AmSi Real Estate support." }] }),
  component: Contact,
});

function Contact() {
  const me = useMe();
  const [f, setF] = useState({ name: "", topic: "General inquiry", message: "" });
  const [ticket, setTicket] = useState<string | null>(null);
  const inp = "w-full rounded-xl border bg-card px-4 py-3 text-sm";
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.message.trim().length < 10) return toast.error("Please write at least 10 characters");
    const id = "T-" + uid().toUpperCase();
    setState((s) => ({ tickets: [{ id, userId: me?.id ?? null, name: me?.name ?? (f.name || "Guest"), topic: f.topic, message: f.message, status: "open", at: Date.now() }, ...s.tickets] }));
    setTicket(id); setF({ ...f, message: "" });
  };
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Contact & support</h1>
      <p className="mt-1 text-muted-foreground">KG 7 Ave, Kigali · +250 788 000 000 · support@amsirealestate.rw</p>
      {ticket && <p className="mt-4 rounded-xl bg-success/15 p-4 text-sm">Request received. Your ticket number is <b>{ticket}</b>. {me ? "Track it in your dashboard." : ""}</p>}
      <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border bg-card p-6">
        {!me && <input className={inp} placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}
        <select className={inp} value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>{["General inquiry", "Payment issue", "Listing complaint", "Auction question", "Account help"].map((t) => <option key={t}>{t}</option>)}</select>
        <textarea className={inp} rows={5} placeholder="How can we help?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
        <Button type="submit" className="w-full">Send message</Button>
      </form>
    </div>
  );
}
