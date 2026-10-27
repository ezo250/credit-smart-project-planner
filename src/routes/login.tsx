import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getState, log, setState, uid } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — AmSi Real Estate" }, { name: "description", content: "Sign in or create an AmSi Real Estate account." }, { property: "og:title", content: "Sign in — AmSi Real Estate" }, { property: "og:description", content: "Access your AmSi Real Estate dashboard." }] }),
  component: Login,
});

const demo: [string, string][] = [["Super Admin", "super@demo.rw"], ["Admin", "admin@demo.rw"], ["Commissioner", "agent@demo.rw"], ["User", "user@demo.rw"]];

function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const inp = "h-11 w-full rounded-xl border bg-card px-4 text-sm";
  const signIn = (email: string, password: string) => {
    const u = getState().users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) return toast.error("Wrong email or password");
    if (!u.active) return toast.error("This account is deactivated");
    setState(() => ({ currentUserId: u.id }));
    toast.success(`Welcome, ${u.name}`);
    nav({ to: "/dashboard" });
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "in") return signIn(f.email, f.password);
    if (!f.name || !f.email.includes("@") || f.password.length < 6) return toast.error("Enter a name, valid email and 6+ character password");
    if (getState().users.some((u) => u.email === f.email)) return toast.error("Email already registered");
    const id = uid();
    setState((s) => ({ users: [...s.users, { id, name: f.name, email: f.email, password: f.password, role: "user", active: true, createdAt: Date.now() }], currentUserId: id }));
    log(`New registration: ${f.email}`);
    nav({ to: "/dashboard" });
  };
  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-4 py-14 md:grid-cols-2">
      <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-card p-6 shadow-card">
        <h1 className="text-2xl font-bold">{mode === "in" ? "Sign in" : "Create account"}</h1>
        {mode === "up" && <input className={inp} placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}
        <input className={inp} type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className={inp} type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Button type="submit" className="h-11 w-full">{mode === "in" ? "Sign in" : "Register"}</Button>
        <button type="button" className="w-full text-sm text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "No account? Register" : "Have an account? Sign in"}</button>
      </form>
      <div className="rounded-2xl bg-navy p-6 text-navy-foreground">
        <h2 className="font-bold">Passwords for accounts</h2>
        <p className="text-sm opacity-70">Password for all accounts: demo123</p>
        <div className="mt-4 space-y-2">
          {demo.map(([r, e]) => (
            <button key={e} onClick={() => signIn(e, "demo123")} className="flex w-full justify-between rounded-xl bg-sidebar-accent px-4 py-3 text-left text-sm hover:opacity-90"><b>{r}</b><span className="opacity-70">{e}</span></button>
          ))}
        </div>
      </div>
    </div>
  );
}
