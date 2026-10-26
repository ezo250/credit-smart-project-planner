import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Building2, LogOut, User } from "lucide-react";
import { setState, useMe, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const defaultAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80";

const nav = [
  { to: "/", label: "Home" }, { to: "/listings", label: "Listings" }, { to: "/auctions", label: "Auctions" },
  { to: "/advisor", label: "AI Advisor" }, { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const me = useMe();
  const nav2 = useNavigate();
  const unread = useStore((s) => s.notifications.filter((n) => n.userId === s.currentUserId).length);
  const siteSettings = useStore((s) => s.siteSettings);
  const leadName = me?.name ?? siteSettings.superAdminName;
  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-navy">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Building2 className="h-5 w-5" /></span>
          <span className="text-lg leading-none">{siteSettings.websiteName || "IsokoHub"}</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-primary" }}>{n.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {me ? (
            <>
              <Link to="/dashboard" className="relative rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Notifications">
                <Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}
              </Link>
              <Button variant="outline" className="rounded-full" onClick={() => nav2({ to: "/dashboard" })}>
                {siteSettings.profilePicture ? <img src={siteSettings.profilePicture || defaultAvatar} alt={leadName} className="mr-2 h-4 w-4 rounded-full object-cover" /> : <User className="mr-2 h-4 w-4" />}
                {leadName.split(" ")[0]}
              </Button>
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => { setState(() => ({ currentUserId: null })); nav2({ to: "/" }); }}><LogOut className="h-4 w-4" /></Button>
            </>
          ) : (
            <Button variant="outline" className="rounded-full" onClick={() => nav2({ to: "/login" })}><User className="h-4 w-4" />Sign in</Button>
          )}
          <Button className="hidden rounded-full sm:inline-flex" onClick={() => nav2({ to: me ? "/dashboard" : "/login" })}>Submit listing</Button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t px-2 py-1 md:hidden">
        {nav.map((n) => <Link key={n.to} to={n.to} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: n.to === "/" }}>{n.label}</Link>)}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const siteSettings = useStore((s) => s.siteSettings);
  return (
    <footer className="mt-16 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div><p className="text-lg font-bold">{siteSettings.websiteName || "IsokoHub"}</p><p className="mt-2 text-sm opacity-70">Rwanda's premium marketplace to buy, rent, sell and auction.</p></div>
        <div className="text-sm opacity-80"><p className="font-semibold opacity-100">Marketplace</p><Link to="/listings" className="block mt-2">Listings</Link><Link to="/auctions" className="block">Auctions</Link><Link to="/advisor" className="block">AI Advisor</Link></div>
        <div className="text-sm opacity-80"><p className="font-semibold opacity-100">Company</p><Link to="/contact" className="block mt-2">Contact & support</Link><p>Terms · Privacy</p></div>
        <div className="text-sm opacity-80"><p className="font-semibold opacity-100">Contact</p><p className="mt-2">KG 7 Ave, Kigali</p><p>support@isokohub.rw</p></div>
      </div>
      <p className="border-t border-sidebar-border py-4 text-center text-xs opacity-60">Developed by Amani Alain</p>
    </footer>
  );
}
