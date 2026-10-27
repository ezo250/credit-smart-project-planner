import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { DISTRICTS, fmtRWF, type Listing } from "@/lib/data";
import { getState } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/advisor")({
  head: () => ({ meta: [{ title: "AI property investment advisor — AmSi Real Estate" }, { name: "description", content: "Get listing recommendations that match your budget and goals." }, { property: "og:title", content: "AI Advisor — AmSi Real Estate" }, { property: "og:description", content: "Budget-based property recommendations from real listings." }] }),
  component: Advisor,
});

type Msg = { role: "user" | "bot"; text: string; picks?: Listing[] };
const goals = { home: ["land", "house"], rent_income: ["apartment", "house"], farm: ["land"], car: ["car"] } as Record<string, string[]>;

/** Rule-based advisor working only from real listing data. */
export function advise(text: string, budget: number, goal: string, district: string) {
  const listings = getState().listings.filter((l) => l.status === "approved");
  const m = text.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(m|million)?/i);
  const b = m ? Number(m[1]) * (m[2] ? 1_000_000 : 1) : budget;
  const cats = goals[goal] ?? [];
  const pool = listings.filter((l) => (!cats.length || cats.includes(l.category)) && (!district || l.district === district) && l.type !== "rent");
  const within = pool.filter((l) => l.price <= b).sort((x, y) => y.price - x.price).slice(0, 3);
  const above = pool.filter((l) => l.price > b && l.price <= b * 1.3).slice(0, 2);
  let out = b ? `With a budget of **${fmtRWF(b)}**, I found ${within.length} listing(s) within budget` : "Tell me your budget so I can match listings";
  out += district ? ` in ${district}.` : ".";
  within.forEach((l) => { out += `\n• ${l.title} — ${fmtRWF(l.price)}, ${l.size ? l.size + " m², " : ""}${l.district}. Matches because it is ${Math.round((l.price / b) * 100)}% of your budget${l.features.length ? " and has " + l.features.join(", ").toLowerCase() : ""}.`; });
  if (above.length) out += `\nSlightly above budget: ${above.map((l) => `${l.title} (${fmtRWF(l.price)})`).join("; ")}.`;
  out += "\n\nBefore buying: verify the UPI/land title with the land authority, confirm zoning, visit the site, and ask about water/electricity connection costs. This is guidance, not legal or guaranteed investment advice.";
  return { text: out, picks: within };
}

function Advisor() {
  const [budget, setBudget] = useState("20000000");
  const [goal, setGoal] = useState("home");
  const [district, setDistrict] = useState("");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: "Hi! Set your budget, goal and preferred district — or just ask, e.g. \"I have 20M RWF and want land for a house\"." }]);
  const ask = (q: string) => { const r = advise(q, Number(budget), goal, district); setMsgs((m) => [...m, { role: "user", text: q }, { role: "bot", ...r }]); setInput(""); };
  const sel = "h-10 w-full rounded-xl border bg-card px-3 text-sm";
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-[280px_1fr]">
      <aside className="h-fit space-y-3 rounded-2xl border bg-card p-5">
        <p className="flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4 text-primary" />Your preferences</p>
        <label className="block text-xs text-muted-foreground">Budget (RWF)<input className={sel} type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /></label>
        <label className="block text-xs text-muted-foreground">Goal<select className={sel} value={goal} onChange={(e) => setGoal(e.target.value)}><option value="home">Build / buy a home</option><option value="rent_income">Rental income</option><option value="farm">Farming land</option><option value="car">Buy a vehicle</option></select></label>
        <label className="block text-xs text-muted-foreground">District<select className={sel} value={district} onChange={(e) => setDistrict(e.target.value)}><option value="">Any</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></label>
        <Button className="w-full" onClick={() => ask(`Recommend options for my budget of ${budget} RWF`)}>Get recommendations</Button>
      </aside>
      <section className="flex h-[70vh] flex-col rounded-2xl border bg-card">
        <div className="flex-1 space-y-4 overflow-auto p-5">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "ml-auto max-w-[80%] rounded-2xl bg-primary p-3 text-sm text-primary-foreground" : "max-w-[90%] whitespace-pre-line rounded-2xl bg-muted p-3 text-sm"}>
              {m.text.replace(/\*\*/g, "")}
              {m.picks && m.picks.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{m.picks.map((l) => <Link key={l.id} to="/listings/$id" params={{ id: l.id }} className="rounded-full bg-card px-3 py-1 text-xs font-medium text-primary">View {l.ref}</Link>)}</div>}
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) ask(input); }} className="flex gap-2 border-t p-3">
          <input className="h-11 flex-1 rounded-xl border px-3 text-sm" placeholder="Ask about budgets, districts, comparisons…" value={input} onChange={(e) => setInput(e.target.value)} />
          <Button type="submit" size="icon" className="h-11 w-11" aria-label="Send"><Send className="h-4 w-4" /></Button>
        </form>
      </section>
    </div>
  );
}
