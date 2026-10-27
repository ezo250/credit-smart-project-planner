import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  BellRing,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Gauge,
  Globe2,
  KeyRound,
  LayoutDashboard,
  ListFilter,
  Megaphone,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, DISTRICTS, fmtRWF, IMAGES, parsePremiumText, type Category, type Listing, type ListingType, type Role } from "@/lib/data";
import { log, notify, setState, useMe, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AmSi Real Estate" }, { name: "description", content: "Your AmSi Real Estate dashboard." }, { property: "og:title", content: "Dashboard — AmSi Real Estate" }, { property: "og:description", content: "Manage listings, purchases and auctions." }] }),
  component: Dashboard,
});

const roleLabel: Record<Role, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  commissioner: "Commissioner",
  user: "User",
};

type DashboardSection = "overview" | "users" | "agents" | "customers" | "listings" | "ads" | "system";

const navItems: Record<Role, { label: string; key: DashboardSection; icon: typeof LayoutDashboard }[]> = {
  superadmin: [
    { label: "Dashboard", key: "overview", icon: LayoutDashboard },
    { label: "User Management", key: "users", icon: Users },
    { label: "Agents", key: "agents", icon: CircleUserRound },
    { label: "Customers", key: "customers", icon: Users },
    { label: "Listings", key: "listings", icon: ListFilter },
    { label: "Ads", key: "ads", icon: Megaphone },
    { label: "System Health", key: "system", icon: Gauge },
  ],
  admin: [
    { label: "Dashboard", key: "overview", icon: LayoutDashboard },
    { label: "Users", key: "users", icon: Users },
    { label: "Agents", key: "agents", icon: CircleUserRound },
    { label: "Customers", key: "customers", icon: Users },
    { label: "Listings", key: "listings", icon: ListFilter },
    { label: "Reports", key: "system", icon: BarChart3 },
  ],
  commissioner: [
    { label: "Dashboard", key: "overview", icon: LayoutDashboard },
    { label: "My Listings", key: "listings", icon: Building2 },
    { label: "Customers", key: "customers", icon: Users },
    { label: "Alerts", key: "system", icon: BellRing },
  ],
  user: [
    { label: "Dashboard", key: "overview", icon: LayoutDashboard },
    { label: "Saved", key: "customers", icon: Sparkles },
    { label: "Payments", key: "listings", icon: CreditCard },
    { label: "Alerts", key: "system", icon: BellRing },
  ],
};

function Dashboard() {
  const me = useMe();
  const s = useStore((st) => st);

  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(s.users[0]?.id ?? null);
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [listingInfoOpen, setListingInfoOpen] = useState(false);
  const [listingFormOpen, setListingFormOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [userFormMode, setUserFormMode] = useState<"add" | "edit">("add");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [adFormMode, setAdFormMode] = useState<"add" | "edit">("add");
  const [userSearch, setUserSearch] = useState("");
  const [agentSearch, setAgentSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "admin" as Role, password: "demo123", profilePicture: "" });
  const [settingsForm, setSettingsForm] = useState({
    websiteName: s.siteSettings.websiteName,
    logo: s.siteSettings.logo,
    superAdminName: s.siteSettings.superAdminName,
    profilePicture: s.siteSettings.profilePicture,
  });
  const [listingForm, setListingForm] = useState({
    title: "",
    category: "land" as Category,
    type: "sale" as ListingType,
    district: "Kicukiro",
    sector: "Kanombe",
    price: "35000000",
    description: "",
    premiumText: "Exact location: Kicukiro, Kanombe, Busanza\nUPI: 1/03/05/01/5107\nOwner phone: 0788405145 / 0735053274",
    mediaUrls: "",
  });
  const [listingMediaPreviews, setListingMediaPreviews] = useState<Array<{ url: string; type: "image" | "video" }>>([]);
  const [adDraft, setAdDraft] = useState({
    title: "",
    placement: "Home page hero",
    budget: "12000",
    status: "Active",
    description: "",
    mediaUrl: "",
  });
  const [ads, setAds] = useState([
    { id: "ad-1", title: "Kigali prime residences", placement: "Home page hero", budget: "$12,500", status: "Active", description: "Premium residential listings across Kigali with buyer leads and high-converting creatives.", mediaUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80" },
    { id: "ad-2", title: "Off-plan investment campaign", placement: "Sidebar", budget: "$8,900", status: "Scheduled", description: "Targeted campaign for high-demand off-plan properties in Gasabo and Kicukiro.", mediaUrl: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80" },
  ]);

  useEffect(() => {
    if (!s.users.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(s.users[0]?.id ?? null);
    }
  }, [s.users, selectedUserId]);

  useEffect(() => {
    setSettingsForm({
      websiteName: s.siteSettings.websiteName,
      logo: s.siteSettings.logo,
      superAdminName: s.siteSettings.superAdminName,
      profilePicture: s.siteSettings.profilePicture,
    });
  }, [s.siteSettings]);

  const safeMe = me ?? {
    id: "guest",
    name: s.siteSettings.superAdminName,
    email: "",
    role: "superadmin" as Role,
    active: true,
    createdAt: Date.now(),
    password: "",
  };

  const isAdmin = safeMe.role === "admin" || safeMe.role === "superadmin";
  const isSuperAdmin = safeMe.role === "superadmin";
  const pending = s.listings.filter((l) => l.status === "pending");
  const approved = s.listings.filter((l) => l.status === "approved");
  const activeUsers = s.users.filter((u) => u.active);
  const suspended = s.users.filter((u) => !u.active);
  const revenue = s.txns.filter((t) => t.status === "success").reduce((a, t) => a + t.amount, 0);
  const myTxns = s.txns.filter((t) => t.userId === safeMe.id);
  const notes = s.notifications.filter((n) => n.userId === safeMe.id);
  const selectedUser = s.users.find((user) => user.id === selectedUserId) ?? s.users[0] ?? null;
  const agentRows = s.users.filter((user) => user.role === "commissioner");
  const customerAccounts = s.users.filter((user) => user.role === "user");
  const selectedListing = s.listings.find((listing) => listing.id === selectedListingId) ?? null;
  const selectedAd = ads.find((ad) => ad.id === selectedAdId) ?? null;

  const weeklySales = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = Array(7).fill(0);

    for (const txn of s.txns) {
      if (txn.status !== "success") continue;
      const dayIndex = (new Date(txn.at).getDay() + 6) % 7;
      counts[dayIndex] += 1;
    }

    return days.map((label, index) => ({ label, value: counts[index] }));
  }, [s.txns]);

  const weeklySalesTotal = weeklySales.reduce((sum, day) => sum + day.value, 0);
  const totalRevenue = s.txns.filter((txn) => txn.status === "success").reduce((sum, txn) => sum + txn.amount, 0);
  const dashboardCards = useMemo(() => [
    { label: "No. of Properties", value: s.listings.length.toLocaleString(), change: `${approved.length} approved` },
    { label: "Regi. Agents", value: agentRows.length.toLocaleString(), change: `${agentRows.filter((agent) => agent.active).length} active` },
    { label: "Customers", value: customerAccounts.length.toLocaleString(), change: `${customerAccounts.filter((customer) => customer.active).length} active` },
    { label: "Revenue", value: fmtRWF(totalRevenue), change: `${s.txns.filter((txn) => txn.status === "success").length} sales` },
  ], [agentRows, approved.length, customerAccounts, s.listings.length, s.txns, totalRevenue]);

  const transactionRows = useMemo(() => s.txns
    .filter((txn) => txn.status === "success")
    .slice(0, 4)
    .map((txn) => ({
      id: txn.ref,
      buyer: s.users.find((user) => user.id === txn.userId)?.name ?? "Unknown buyer",
      invoice: txn.ref,
      date: new Date(txn.at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      amount: fmtRWF(txn.amount),
      method: txn.kind === "auction_fee" ? "Auction fee" : "Premium unlock",
      status: txn.status === "success" ? "Completed" : "Cancelled",
    })), [s.txns, s.users]);

  const agentStats = useMemo(() => {
    const successRate = Math.min(100, Math.max(0, Math.round((approved.length / Math.max(1, s.listings.length)) * 100)));
    return [
      { label: "Active agents", value: String(agentRows.filter((agent) => agent.active).length) },
      { label: "Listings managed", value: String(s.listings.filter((listing) => listing.ownerId === safeMe.id || listing.status === "approved").length) },
      { label: "Success rate", value: `${successRate}%` },
      { label: "Gross revenue", value: fmtRWF(totalRevenue) },
    ];
  }, [agentRows, approved.length, safeMe.id, s.listings, totalRevenue]);

  const toggleUserAccount = (userId: string, nextState: boolean) => {
    const target = s.users.find((user) => user.id === userId);
    if (!target) return;
    setState((st) => ({ users: st.users.map((user) => (user.id === userId ? { ...user, active: nextState } : user)) }));
    notify(userId, `Your account has been ${nextState ? "reactivated" : "suspended"}.`);
    log(`${nextState ? "Unblocked" : "Blocked"} account ${target.email}`);
    toast.success(`${target.name} account ${nextState ? "active" : "suspended"}`);
  };

  const changePassword = (userId: string) => {
    const target = s.users.find((user) => user.id === userId);
    if (!target) return;
    const nextPassword = `${target.role}2026!`;
    setState((st) => ({ users: st.users.map((user) => (user.id === userId ? { ...user, password: nextPassword } : user)) }));
    notify(userId, "Your password was reset successfully.");
    log(`Password reset for ${target.email}`);
    toast.success(`Password reset for ${target.name}`);
  };

  const deleteUser = (userId: string) => {
    const target = s.users.find((user) => user.id === userId);
    if (!target) return;
    if (target.role === "superadmin") {
      toast.error("The super admin account cannot be deleted.");
      return;
    }
    setState((st) => ({ users: st.users.filter((user) => user.id !== userId) }));
    log(`Deleted ${target.role} account ${target.email}`);
    toast.success(`${target.name} was deleted`);
    setSelectedUserId(null);
    setUserDetailOpen(false);
  };

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast.error("Complete all user account fields");
      return;
    }

    if (userFormMode === "add") {
      if (s.users.some((user) => user.email.toLowerCase() === userForm.email.toLowerCase())) {
        toast.error("This email is already in use");
        return;
      }

      const nextUser = {
        id: `u-${Date.now()}`,
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        active: true,
        createdAt: Date.now(),
        profilePicture: userForm.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      };

      setState((st) => ({ users: [...st.users, nextUser] }));
      setSelectedUserId(nextUser.id);
      log(`Created ${userForm.role} account for ${userForm.email}`);
      toast.success(`${userForm.name} added as ${roleLabel[userForm.role]}`);
    } else if (editingUserId) {
      setState((st) => ({
        users: st.users.map((user) => user.id === editingUserId ? { ...user, name: userForm.name, email: userForm.email, role: userForm.role, password: userForm.password || user.password, profilePicture: userForm.profilePicture || user.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80" } : user),
      }));
      setSelectedUserId(editingUserId);
      log(`Updated ${userForm.role} account for ${userForm.email}`);
      toast.success(`${userForm.name} account updated`);
    }

    setUserForm({ name: "", email: "", role: "admin", password: "demo123", profilePicture: "" });
    setUserFormMode("add");
    setEditingUserId(null);
    setUserFormOpen(false);
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setState((st) => ({
      siteSettings: {
        ...st.siteSettings,
        websiteName: settingsForm.websiteName.trim() || st.siteSettings.websiteName,
        logo: settingsForm.logo.trim() || st.siteSettings.logo,
        superAdminName: settingsForm.superAdminName.trim() || st.siteSettings.superAdminName,
        profilePicture: settingsForm.profilePicture.trim() || st.siteSettings.profilePicture,
      },
    }));
    log(`Updated website settings for ${settingsForm.websiteName || "AmSi Real Estate"}`);
    toast.success("Website settings updated");
    setSettingsOpen(false);
  };

  const handleListingMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const uploadedItems = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));
    const merged = [...listingMediaPreviews, ...uploadedItems];
    setListingMediaPreviews(merged);
    setListingForm((current) => ({ ...current, mediaUrls: merged.map((item) => item.url).join("\n") }));
    event.target.value = "";
  };

  const clearListingMediaUploads = () => {
    listingMediaPreviews.forEach(({ url }) => URL.revokeObjectURL(url));
    setListingMediaPreviews([]);
    setListingForm((current) => ({ ...current, mediaUrls: "" }));
  };

  const addListing = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPremium = parsePremiumText(listingForm.premiumText);
    const mediaEntries = listingForm.mediaUrls.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
    const firstMedia = mediaEntries[0] ?? "";
    const listing: Listing = {
      id: `new-${Date.now()}`,
      ref: `L-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      title: listingForm.title.trim() || "New listing",
      description: listingForm.description.trim() || "Fresh listing published from the dashboard.",
      category: listingForm.category,
      type: listingForm.type,
      price: Number(listingForm.price) || 0,
      district: listingForm.district,
      sector: listingForm.sector,
      img: firstMedia || (listingForm.category === "car" ? IMAGES.car : listingForm.category === "house" ? IMAGES.house : listingForm.category === "apartment" ? IMAGES.apartment : IMAGES.land),
      features: ["Verified", listingForm.type === "sale" ? "For sale" : "For rent"],
      status: "approved",
      ownerId: safeMe.id,
      createdAt: Date.now(),
      premium: parsedPremium,
      premiumPrice: parsedPremium.length ? 4000 : 0,
      featured: true,
      verified: true,
      negotiable: listingForm.type === "sale",
      details: [{ group: "Basic data", items: [["Category", CATEGORIES.find((c) => c.id === listingForm.category)?.label ?? listingForm.category], ["District", listingForm.district], ["Sector", listingForm.sector]] }],
    };
    setState((st) => ({ listings: [listing, ...st.listings] }));
    log(`Created listing ${listing.ref}`);
    toast.success("Listing added to the marketplace");
    setListingForm({
      title: "",
      category: "land",
      type: "sale",
      district: "Kicukiro",
      sector: "Kanombe",
      price: "35000000",
      description: "",
      premiumText: "Exact location: Kicukiro, Kanombe, Busanza\nUPI: \nOwner phone: ",
      mediaUrls: "",
    });
    clearListingMediaUploads();
    setListingFormOpen(false);
    setListingInfoOpen(false);
  };

  const updateListingStatus = (id: string, status: "approved" | "rejected") => {
    const listing = s.listings.find((x) => x.id === id);
    if (!listing) return;
    setState((st) => ({ listings: st.listings.map((x) => (x.id === id ? { ...x, status } : x)) }));
    notify(listing.ownerId, `Your listing ${listing.ref} was ${status}`);
    log(`${status} listing ${listing.ref}`);
    toast.success(`Listing ${status}`);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <div key={card.label} className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{card.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-2xl font-bold">{card.value}</p>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">{card.change}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sales Analytic</p>
              <h3 className="mt-1 text-2xl font-bold">Earnings: {fmtRWF(totalRevenue)}</h3>
            </div>
            <button type="button" className="rounded-xl border bg-muted/40 px-3 py-1.5 text-xs">View More</button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">Income</p><p className="mt-2 text-xl font-bold">{fmtRWF(totalRevenue)}</p><p className="mt-1 text-xs text-emerald-600">{s.txns.filter((txn) => txn.status === "success").length} successful sales</p></div>
            <div className="rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">Expenses</p><p className="mt-2 text-xl font-bold">{fmtRWF(Math.round(totalRevenue * 0.12))}</p><p className="mt-1 text-xs text-amber-600">Platform costs</p></div>
            <div className="rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">Balance</p><p className="mt-2 text-xl font-bold">{fmtRWF(Math.max(totalRevenue - Math.round(totalRevenue * 0.12), 0))}</p><p className="mt-1 text-xs text-primary">Net sales</p></div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Property Target</p>
          <div className="mt-4 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm"><span>Property</span><span>15,780</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[60%] rounded-full bg-primary" /></div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm"><span>Revenue</span><span>$78.3M</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[80%] rounded-full bg-emerald-500" /></div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Portfolio Mix</h3>
            <button type="button" className="text-xs text-primary">Live values</button>
          </div>
          <div className="mt-5 space-y-4">
            {[
              ["Approved listings", String(approved.length)],
              ["Pending listings", String(pending.length)],
              ["Active users", String(activeUsers.length)],
              ["Suspended users", String(suspended.length)],
            ].map(([label, value]) => {
              const max = Math.max(1, approved.length + pending.length + activeUsers.length + suspended.length || 1);
              const width = `${(Number(value) / max) * 100}%`;
              return (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-sm"><span>{label}</span><span>{value}</span></div>
                  <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width }} /></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Weekly Sales</p>
              <h3 className="mt-1 text-xl font-bold">Total Property Sales: {weeklySalesTotal}</h3>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-xl border px-2 py-1 text-xs">Previous</button>
              <button type="button" className="rounded-xl border px-2 py-1 text-xs">Next</button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-7 items-end gap-2">
            {weeklySales.map(({ label, value }, index) => {
              const height = value === 0 ? 18 : 18 + value * 16;
              return (
                <div key={label + index} className="flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-primary to-primary/60"
                    style={{ height: `${height}px` }}
                    title={`${label}: ${value} sales`}
                    aria-label={`${label}: ${value} sales`}
                  />
                  <span className="text-[10px] text-muted-foreground">{label[0]}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Latest Transaction</h3>
          <button type="button" className="text-xs text-primary">Export</button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase ID</TableHead>
                <TableHead>Buyer Name</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionRows.length ? transactionRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.buyer}</TableCell>
                  <TableCell>{row.invoice}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${row.status === "Completed" ? "bg-emerald-500/10 text-emerald-600" : row.status === "Cancelled" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}>
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell><button type="button" className="text-primary">View</button></TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No sales recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );

  const renderUserManagement = () => {
    const usersToDisplay = s.users.filter((user) => `${user.name} ${user.email} ${roleLabel[user.role]}`.toLowerCase().includes(userSearch.toLowerCase()));
    return (
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">User Management</h2>
            <Button size="sm" onClick={() => {
              setUserForm({ name: "", email: "", role: "admin", password: "demo123", profilePicture: "" });
              setUserFormOpen(true);
            }}>Add user</Button>
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-xl border bg-muted/20 px-3 py-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <input className="w-full border-0 bg-transparent text-sm outline-none" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users, agents or roles" />
          </div>

          <div data-testid="user-management-scroll" className="h-[320px] overflow-y-auto pr-2">
            <div className="space-y-3">
              {usersToDisplay.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setUserDetailOpen(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${selectedUser?.id === user.id ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/40"}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={user.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"} alt={user.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-muted" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${user.active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                      {user.active ? "Active" : "Suspended"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedUser?.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"} alt={selectedUser?.name ?? "User avatar"} className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/20" />
                <div>
                  <h3 className="font-bold">{selectedUser?.name ?? "No user"}</h3>
                  <p className="text-xs text-muted-foreground">{selectedUser?.role ?? "role"}</p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase ${selectedUser?.active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                {selectedUser?.active ? "Active" : "Suspended"}
              </span>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <p className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedUser?.email}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Role</span><span>{selectedUser ? roleLabel[selectedUser.role] : "-"}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{selectedUser ? new Date(selectedUser.createdAt).toLocaleDateString() : "-"}</span></p>
            </div>

            <div className="mt-5 flex gap-2">
              {selectedUser && (
                <>
                  <Button size="sm" variant={selectedUser.active ? "outline" : "default"} onClick={() => toggleUserAccount(selectedUser.id, !selectedUser.active)}>{selectedUser.active ? "Suspend" : "Unblock"}</Button>
                  <Button size="sm" variant="secondary" onClick={() => changePassword(selectedUser.id)}><KeyRound className="mr-1 h-3.5 w-3.5" />Reset</Button>
                </>
              )}
            </div>
          </section>
        </aside>
      </div>
    );
  };

  const renderAgents = () => (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {agentStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
            <p className="mt-3 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Agent accounts</h3>
          <Button size="sm" onClick={() => {
            setUserForm({ name: "", email: "", role: "commissioner", password: "demo123", profilePicture: "" });
            setUserFormOpen(true);
          }}>Add agent</Button>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-xl border bg-muted/20 px-3 py-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <input className="w-full border-0 bg-transparent text-sm outline-none" value={agentSearch} onChange={(e) => setAgentSearch(e.target.value)} placeholder="Search agents or emails" />
        </div>

        <ScrollArea className="h-[320px] pr-2">
          <div className="space-y-3">
            {agentRows.filter((agent) => `${agent.name} ${agent.email}`.toLowerCase().includes(agentSearch.toLowerCase())).map((agent) => (
              <button key={agent.id} type="button" onClick={() => {
                setSelectedUserId(agent.id);
                setUserDetailOpen(true);
              }} className="flex w-full items-center justify-between rounded-xl border bg-card p-3 text-left hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <img src={agent.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"} alt={agent.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-muted" />
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.email}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase ${agent.active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>{agent.active ? "Active" : "Suspended"}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </section>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total Customers</p><p className="mt-3 text-3xl font-bold">{customerAccounts.length}</p></div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Verified</p><p className="mt-3 text-3xl font-bold">{customerAccounts.filter((row) => row.active).length}</p></div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pending</p><p className="mt-3 text-3xl font-bold">{customerAccounts.filter((row) => !row.active).length}</p></div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Customer records</h3>
          <Button size="sm" onClick={() => {
            setUserFormMode("add");
            setEditingUserId(null);
            setUserForm({ name: "", email: "", role: "user", password: "demo123", profilePicture: "" });
            setUserFormOpen(true);
          }}>Add customer</Button>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-xl border bg-muted/20 px-3 py-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <input className="w-full border-0 bg-transparent text-sm outline-none" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search customers or emails" />
        </div>

        <ScrollArea className="h-[320px] pr-2">
          <div className="space-y-3">
            {customerAccounts.filter((customer) => `${customer.name} ${customer.email}`.toLowerCase().includes(customerSearch.toLowerCase())).map((customer) => (
              <button key={customer.id} type="button" onClick={() => {
                setSelectedUserId(customer.id);
                setUserDetailOpen(true);
              }} className="flex w-full items-center justify-between rounded-xl border bg-card p-3 text-left hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <img src={customer.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"} alt={customer.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-muted" />
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase ${customer.active ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>{customer.active ? "Active" : "Suspended"}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </section>
    </div>
  );

  const renderListings = () => (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Published</p><p className="mt-3 text-3xl font-bold">{approved.length}</p></div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pending</p><p className="mt-3 text-3xl font-bold">{pending.length}</p></div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rejected</p><p className="mt-3 text-3xl font-bold">{s.listings.filter((l) => l.status === "rejected").length}</p></div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Listing approval queue</h3>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">{pending.length} waiting</span>
            {isSuperAdmin && <Button size="sm" onClick={() => { setSelectedListingId(null); setListingFormOpen(true); }}>Add listing</Button>}
          </div>
        </div>

        <ScrollArea className="h-[420px] pr-2">
          <div className="space-y-3">
            {s.listings.map((listing) => (
              <button key={listing.id} type="button" onClick={() => { setSelectedListingId(listing.id); setListingInfoOpen(true); }} className="flex w-full flex-col gap-3 rounded-xl border bg-card p-3 text-left hover:bg-muted/40 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <img src={listing.img} alt={listing.title} className="h-16 w-16 rounded-lg object-cover" />
                  <div>
                    <p className="font-medium">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">{listing.ref} · {listing.district} · {listing.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase ${listing.status === "approved" ? "bg-emerald-500/10 text-emerald-600" : listing.status === "pending" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>
                    {listing.status}
                  </span>
                  {listing.status === "pending" && (
                    <>
                      <Button size="sm" onClick={(event) => { event.stopPropagation(); updateListingStatus(listing.id, "approved"); }}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Approve</Button>
                      <Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); updateListingStatus(listing.id, "rejected"); }}><XCircle className="mr-1 h-3.5 w-3.5" />Reject</Button>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </section>
    </div>
  );

  const saveAd = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: adFormMode === "edit" && selectedAdId ? selectedAdId : `ad-${Date.now()}`,
      title: adDraft.title.trim() || "Untitled campaign",
      placement: adDraft.placement,
      budget: adDraft.budget,
      status: adDraft.status,
      description: adDraft.description || "Campaign created from the dashboard.",
      mediaUrl: adDraft.mediaUrl || "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    };

    if (adFormMode === "edit" && selectedAdId) {
      setAds((current) => current.map((ad) => (ad.id === selectedAdId ? { ...ad, ...payload } : ad)));
      toast.success("Ad updated");
    } else {
      setAds((current) => [payload, ...current]);
      toast.success("Ad published");
    }

    setAdFormMode("add");
    setSelectedAdId(null);
    setAdDraft({ title: "", placement: "Home page hero", budget: "12000", status: "Active", description: "", mediaUrl: "" });
    setAdModalOpen(false);
  };

  const deleteAd = (adId: string) => {
    setAds((current) => current.filter((ad) => ad.id !== adId));
    setSelectedAdId(null);
    setAdModalOpen(false);
    toast.success("Ad deleted");
  };

  const renderAds = () => (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Advertising overview</h3>
          <Button size="sm" onClick={() => {
            setAdFormMode("add");
            setSelectedAdId(null);
            setAdDraft({ title: "", placement: "Home page hero", budget: "12000", status: "Active", description: "", mediaUrl: "" });
            setAdModalOpen(true);
          }}>Add ad</Button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Spend this month</p><p className="mt-2 text-2xl font-bold">$18,240</p></div>
          <div className="rounded-xl bg-muted/30 p-4"><p className="text-xs text-muted-foreground">Campaigns live</p><p className="mt-2 text-2xl font-bold">{ads.length}</p></div>
          <div className="rounded-xl bg-muted/30 p-4"><p className="text-xs text-muted-foreground">CTR</p><p className="mt-2 text-2xl font-bold">4.8%</p></div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="text-lg font-bold">Published ads</h3>
        <ScrollArea className="mt-4 h-[340px] pr-2">
          <div className="space-y-3">
            {ads.map((ad) => (
              <button key={ad.id} type="button" onClick={() => { setSelectedAdId(ad.id); setAdFormMode("edit"); setAdDraft({ title: ad.title, placement: ad.placement, budget: ad.budget, status: ad.status, description: ad.description, mediaUrl: ad.mediaUrl }); setAdModalOpen(true); }} className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left hover:bg-muted/40">
                <img src={ad.mediaUrl || "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"} alt={ad.title} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{ad.title}</p>
                  <p className="text-xs text-muted-foreground">{ad.placement} · {ad.budget}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase ${ad.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>{ad.status}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </section>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Uptime</p><p className="mt-3 text-3xl font-bold">99.9%</p></div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Approval SLA</p><p className="mt-3 text-3xl font-bold">2.4h</p></div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Support tickets</p><p className="mt-3 text-3xl font-bold">{s.tickets.length}</p></div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="text-lg font-bold">Platform health</h3>
        <div className="mt-5 space-y-4">
          {[
            ["API services", 98],
            ["Payment gateway", 96],
            ["Listing moderation", 99],
            ["Notification queue", 94],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-sm"><span>{label}</span><span>{value}%</span></div>
              <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${value}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderPanel = () => {
    switch (activeSection) {
      case "users": return renderUserManagement();
      case "agents": return renderAgents();
      case "customers": return renderCustomers();
      case "listings": return renderListings();
      case "ads": return renderAds();
      case "system": return renderSystem();
      case "overview":
      default: return renderOverview();
    }
  };

  const navButtons = (navItems[safeMe.role] ?? navItems.user).filter(({ key }) => key !== "overview");

  if (!me) {
    return <div className="p-16 text-center"><a href="/login" className="text-primary">Sign in to view your dashboard</a></div>;
  }

  return (
    <div className="premium-dashboard-shell min-h-screen px-3 py-5 sm:px-5 xl:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="premium-sidebar rounded-[30px] border border-slate-800/80 p-5 text-slate-100 shadow-[0_32px_80px_-38px_rgba(15,23,42,0.85)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300/80">Access</p>
                <h2 className="mt-1 text-xl font-bold text-white">{roleLabel[safeMe.role]} Panel</h2>
              </div>
              <div className="rounded-full bg-white/10 p-2 text-white ring-1 ring-white/15"><ShieldCheck className="h-5 w-5" /></div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/5 p-2 backdrop-blur-md">
              <button type="button" className="flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-2.5 text-left text-sm text-white ring-1 ring-white/10" onClick={() => setShowDashboardDropdown((value) => !value)}>
                <span className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Dashboard</span>
                <ChevronDown className={`h-4 w-4 transition ${showDashboardDropdown ? "rotate-180" : ""}`} />
              </button>

              {showDashboardDropdown && (
                <div className="mt-2 space-y-1">
                  {navButtons.map(({ label, key, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setActiveSection(key)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${activeSection === key ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/20" : "text-slate-200 hover:bg-white/5"}`}
                    >
                      <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{label}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-[22px] border border-dashed border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-300/80">Role scope</p>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                <p className="flex items-center justify-between"><span>Super Admin</span><span className="text-slate-300">Full control</span></p>
                <p className="flex items-center justify-between"><span>Admin</span><span className="text-slate-300">Operations</span></p>
                <p className="flex items-center justify-between"><span>Commissioner</span><span className="text-slate-300">Listings</span></p>
                <p className="flex items-center justify-between"><span>User</span><span className="text-slate-300">Portfolio</span></p>
              </div>
            </div>

            <ScrollArea className="mt-6 h-[200px] rounded-[22px] border border-white/10 bg-white/5 p-2">
              <div className="space-y-2">
                {["Account status", "System logs", "Payment queue", "Moderation feed", "Campaign alerts", "Support tickets", "Security checks", "Archive reports"].map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-slate-950/10 px-3 py-2 text-sm text-slate-200/85">{item}</div>
                ))}
              </div>
            </ScrollArea>
          </aside>

          <main className="space-y-6">
            <header className="premium-panel p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{roleLabel[safeMe.role]} dashboard</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{roleLabel[safeMe.role]} Control Center</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Signed in as {me?.name ?? s.siteSettings.superAdminName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="premium-button border-slate-200 bg-white text-slate-700 hover:bg-slate-50" variant="outline" onClick={() => { window.location.href = "/"; }}>Public site</Button>
                  <Button className="premium-button bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-blue-500" onClick={() => { setActiveSection("users"); toast.success("Opened user management"); }}>Quick actions</Button>
                  {isSuperAdmin && <Button className="premium-button bg-slate-900 text-white hover:bg-slate-800" variant="secondary" onClick={() => setSettingsOpen(true)}>Settings</Button>}
                </div>
              </div>
            </header>

            {settingsOpen && (
              <section className="premium-panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Website settings</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(false)}>Close</Button>
                </div>
                <form onSubmit={saveSettings} className="grid gap-3 md:grid-cols-2">
                  <input className="h-11 rounded-xl border bg-background px-3 text-sm" value={settingsForm.websiteName} onChange={(e) => setSettingsForm({ ...settingsForm, websiteName: e.target.value })} placeholder="Website name" />
                  <input className="h-11 rounded-xl border bg-background px-3 text-sm" value={settingsForm.logo} onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })} placeholder="Logo text or label" />
                  <input className="h-11 rounded-xl border bg-background px-3 text-sm" value={settingsForm.superAdminName} onChange={(e) => setSettingsForm({ ...settingsForm, superAdminName: e.target.value })} placeholder="Super admin name" />
                  <input className="h-11 rounded-xl border bg-background px-3 text-sm" value={settingsForm.profilePicture} onChange={(e) => setSettingsForm({ ...settingsForm, profilePicture: e.target.value })} placeholder="Profile picture URL" />
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
                    <Button type="submit">Save settings</Button>
                  </div>
                </form>
              </section>
            )}

            <div className="premium-panel p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-full bg-gradient-to-r from-violet-500/15 to-blue-500/15 px-2.5 py-1 font-medium text-violet-700">{roleLabel[safeMe.role]}</span>
                <span className="text-slate-400">•</span>
                <span className="font-medium text-slate-700">{activeSection.replace(/(^\w|[-_](\w))/g, (_, a, b) => (b ? b.toUpperCase() : a.toUpperCase()))}</span>
                <span className="text-slate-400">•</span>
                <span>{s.users.length} accounts</span>
              </div>
            </div>

            {renderPanel()}

            <Dialog open={userFormOpen} onOpenChange={(open) => { setUserFormOpen(open); if (!open) { setUserFormMode("add"); setEditingUserId(null); } }}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{userFormMode === "edit" ? "Edit user" : "Add new user"}</DialogTitle>
                  <DialogDescription>Choose the role and account details for this user.</DialogDescription>
                </DialogHeader>
                <form onSubmit={saveUser} className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
                    <img src={userForm.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"} alt="Profile preview" className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20" />
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Profile photo</p>
                      <input className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm" placeholder="https://example.com/avatar.jpg" value={userForm.profilePicture} onChange={(e) => setUserForm({ ...userForm, profilePicture: e.target.value })} />
                    </div>
                  </div>
                  <input className="h-11 w-full rounded-xl border bg-background px-3 text-sm" placeholder="Full name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                  <input className="h-11 w-full rounded-xl border bg-background px-3 text-sm" placeholder="Email address" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                  <select className="h-11 w-full rounded-xl border bg-background px-3 text-sm" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}>
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="commissioner">Commissioner</option>
                    <option value="user">Customer</option>
                  </select>
                  <input className="h-11 w-full rounded-xl border bg-background px-3 text-sm" type="password" placeholder="Password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setUserFormOpen(false)}>Cancel</Button>
                    <Button type="submit">{userFormMode === "edit" ? "Save changes" : "Create account"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{selectedUser?.name ?? "User profile"}</DialogTitle>
                  <DialogDescription>{selectedUser ? roleLabel[selectedUser.role] : "User information"}</DialogDescription>
                </DialogHeader>
                {selectedUser && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-4">
                      <img src={selectedUser.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"} alt={selectedUser.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20" />
                      <div>
                        <p className="font-medium">{selectedUser.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 rounded-xl border bg-muted/20 p-4 text-sm">
                      <p className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedUser.email}</span></p>
                      <p className="flex justify-between"><span className="text-muted-foreground">Role</span><span>{roleLabel[selectedUser.role]}</span></p>
                      <p className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{selectedUser.active ? "Active" : "Suspended"}</span></p>
                      <p className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant={selectedUser.active ? "outline" : "default"} onClick={() => { toggleUserAccount(selectedUser.id, !selectedUser.active); setUserDetailOpen(false); }}>{selectedUser.active ? "Suspend" : "Unblock"}</Button>
                      <Button size="sm" variant="secondary" onClick={() => { changePassword(selectedUser.id); setUserDetailOpen(false); }}>Reset password</Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setUserFormMode("edit");
                        setEditingUserId(selectedUser.id);
                        setUserForm({ name: selectedUser.name, email: selectedUser.email, role: selectedUser.role, password: selectedUser.password, profilePicture: selectedUser.profilePicture ?? "" });
                        setUserDetailOpen(false);
                        setUserFormOpen(true);
                      }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteUser(selectedUser.id)}>Delete</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={listingInfoOpen} onOpenChange={(open) => { setListingInfoOpen(open); if (!open) setSelectedListingId(null); }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{selectedListing?.title ?? "Listing details"}</DialogTitle>
                  <DialogDescription>{selectedListing?.ref ?? "Property information"}</DialogDescription>
                </DialogHeader>
                {selectedListing && (
                  <div className="space-y-4">
                    <img src={selectedListing.img} alt={selectedListing.title} className="h-52 w-full rounded-xl object-cover" />
                    <div className="grid gap-3 md:grid-cols-2 text-sm">
                      <p><span className="text-muted-foreground">Type:</span> {selectedListing.type}</p>
                      <p><span className="text-muted-foreground">Category:</span> {selectedListing.category}</p>
                      <p><span className="text-muted-foreground">District:</span> {selectedListing.district}</p>
                      <p><span className="text-muted-foreground">Sector:</span> {selectedListing.sector}</p>
                      <p><span className="text-muted-foreground">Price:</span> {fmtRWF(selectedListing.price)}</p>
                      <p><span className="text-muted-foreground">Status:</span> {selectedListing.status}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedListing.description}</p>
                    <div className="flex justify-end gap-2">
                      {selectedListing.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => { updateListingStatus(selectedListing.id, "approved"); setListingInfoOpen(false); }}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => { updateListingStatus(selectedListing.id, "rejected"); setListingInfoOpen(false); }}>Reject</Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setListingInfoOpen(false)}>Close</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={listingFormOpen} onOpenChange={(open) => { setListingFormOpen(open); if (!open) setSelectedListingId(null); }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add new listing</DialogTitle>
                  <DialogDescription>Create a new property listing for the marketplace.</DialogDescription>
                </DialogHeader>
                <form onSubmit={addListing} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input className="h-11 rounded-xl border bg-background px-3 text-sm md:col-span-2" value={listingForm.title} onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })} placeholder="Listing title" />
                  <select className="h-11 rounded-xl border bg-background px-3 text-sm" value={listingForm.category} onChange={(e) => setListingForm({ ...listingForm, category: e.target.value as Category })}>
                    {CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
                  </select>
                  <select className="h-11 rounded-xl border bg-background px-3 text-sm" value={listingForm.type} onChange={(e) => setListingForm({ ...listingForm, type: e.target.value as ListingType })}>
                    <option value="sale">For sale</option>
                    <option value="rent">For rent</option>
                  </select>
                  <select className="h-11 rounded-xl border bg-background px-3 text-sm" value={listingForm.district} onChange={(e) => setListingForm({ ...listingForm, district: e.target.value })}>
                    {DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
                  </select>
                  <input className="h-11 rounded-xl border bg-background px-3 text-sm" value={listingForm.sector} onChange={(e) => setListingForm({ ...listingForm, sector: e.target.value })} placeholder="Sector" />
                  <input className="h-11 rounded-xl border bg-background px-3 text-sm md:col-span-2" value={listingForm.price} onChange={(e) => setListingForm({ ...listingForm, price: e.target.value })} placeholder="Price" />
                  <div className="md:col-span-2 rounded-xl border bg-background p-3">
                    <label htmlFor="listing-media-upload" className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Upload photos or videos</label>
                    <input id="listing-media-upload" aria-label="Upload photos or videos" type="file" accept="image/*,video/*" multiple onChange={handleListingMediaUpload} className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary" />
                    {listingMediaPreviews.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {listingMediaPreviews.map(({ url, type }, index) => (
                          <div key={`${url}-${index}`} className="overflow-hidden rounded-lg border bg-muted/20">
                            {type === "video" ? (
                              <video src={url} className="h-20 w-20 object-cover" muted playsInline />
                            ) : (
                              <img src={url} alt={`Upload preview ${index + 1}`} className="h-20 w-20 object-cover" />
                            )}
                          </div>
                        ))}
                        <button type="button" className="rounded-xl border px-2 py-1 text-xs text-muted-foreground" onClick={clearListingMediaUploads}>Clear uploads</button>
                      </div>
                    )}
                  </div>
                  <textarea className="min-h-24 rounded-xl border bg-background px-3 py-2 text-sm md:col-span-2" value={listingForm.description} onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })} placeholder="Description" />
                  <textarea className="min-h-24 rounded-xl border bg-background px-3 py-2 text-sm md:col-span-2" value={listingForm.premiumText} onChange={(e) => setListingForm({ ...listingForm, premiumText: e.target.value })} placeholder="Premium details" />
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setListingFormOpen(false)}>Cancel</Button>
                    <Button type="submit">Publish listing</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={adModalOpen} onOpenChange={(open) => { setAdModalOpen(open); if (!open) { setSelectedAdId(null); setAdFormMode("add"); } }}>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{adFormMode === "edit" ? "Ad details" : "Create advertisement"}</DialogTitle>
                  <DialogDescription>Publish a new campaign or review the current placement.</DialogDescription>
                </DialogHeader>
                <form onSubmit={saveAd} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input className="h-11 rounded-xl border bg-background px-3 text-sm md:col-span-2" placeholder="Ad title" value={adDraft.title} onChange={(e) => setAdDraft({ ...adDraft, title: e.target.value })} />
                  <select className="h-11 rounded-xl border bg-background px-3 text-sm" value={adDraft.placement} onChange={(e) => setAdDraft({ ...adDraft, placement: e.target.value })}>
                    <option>Home page hero</option>
                    <option>Top banner</option>
                    <option>Sidebar</option>
                    <option>Featured listings</option>
                  </select>
                  <input className="h-11 rounded-xl border bg-background px-3 text-sm" placeholder="Budget" value={adDraft.budget} onChange={(e) => setAdDraft({ ...adDraft, budget: e.target.value })} />
                  <select className="h-11 rounded-xl border bg-background px-3 text-sm" value={adDraft.status} onChange={(e) => setAdDraft({ ...adDraft, status: e.target.value })}>
                    <option>Active</option>
                    <option>Paused</option>
                    <option>Scheduled</option>
                  </select>
                  <input className="h-11 rounded-xl border bg-background px-3 text-sm md:col-span-2" placeholder="Media URL (optional)" value={adDraft.mediaUrl} onChange={(e) => setAdDraft({ ...adDraft, mediaUrl: e.target.value })} />
                  <textarea className="md:col-span-2 min-h-24 rounded-xl border bg-background px-3 py-2 text-sm" placeholder="Ad description" value={adDraft.description} onChange={(e) => setAdDraft({ ...adDraft, description: e.target.value })} />
                  <div className="md:col-span-2 flex justify-end gap-2">
                    {selectedAd && <Button type="button" variant="destructive" onClick={() => deleteAd(selectedAd.id)}>Delete</Button>}
                    <Button type="button" variant="outline" onClick={() => setAdModalOpen(false)}>Close</Button>
                    <Button type="submit">{adFormMode === "edit" ? "Save changes" : "Publish ad"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <section className="premium-panel p-5">
              <h2 className="text-lg font-bold">Notifications</h2>
              {notes.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No notifications.</p> : (
                <div className="mt-4 space-y-3">{notes.map((notification, index) => <p key={`${notification.text}-${index}`} className="border-t py-2 text-sm first:border-t-0 first:pt-0">{notification.text}</p>)}</div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
