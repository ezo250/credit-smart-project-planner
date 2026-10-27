import { useSyncExternalStore } from "react";
import { seedAuctions, seedListings, seedUsers, type Audit, type Auction, type FinanceRecord, type Listing, type TargetsState, type Ticket, type Txn, type User } from "./data";

async function syncToMongo(snapshot: State) {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/mongo-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
  } catch {
    // Fall back silently when MongoDB is unavailable in this environment.
  }
}

async function hydrateFromMongo() {
  if (typeof window === "undefined") return;

  try {
    const response = await fetch("/api/mongo-state");
    if (!response.ok) return;
    const mongoState = (await response.json()) as Partial<State>;
    const next = resolveStateFromPersistence(state, mongoState);
    state = next;
    localStorage.setItem(KEY, JSON.stringify(state));
    subs.forEach((f) => f());
  } catch {
    // Keep the local fallback behavior when MongoDB is unreachable.
  }
}

export interface SiteSettings {
  websiteName: string;
  logo: string;
  superAdminName: string;
  profilePicture: string;
}

export interface State {
  users: User[]; listings: Listing[]; auctions: Auction[]; tickets: Ticket[]; txns: Txn[]; audit: Audit[]; finance: FinanceRecord[]; targets: TargetsState;
  favorites: Record<string, string[]>; unlocked: Record<string, string[]>; currentUserId: string | null;
  notifications: { userId: string; text: string; at: number }[];
  siteSettings: SiteSettings;
}
const KEY = "rw-market-v2";
const seed = (): State => ({ users: seedUsers, listings: seedListings, auctions: seedAuctions, tickets: [], txns: [], audit: [], finance: [], targets: { propertyTarget: 12, revenueTarget: 250000000 }, favorites: {}, unlocked: {}, currentUserId: null, notifications: [], siteSettings: { websiteName: "AmSi Real Estate", logo: "AmSi Real Estate", superAdminName: "Amani Alain", profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" } });

function normalizeState(partial: Partial<State>): State {
  const base = seed();
  const next: State = {
    ...base,
    ...partial,
    finance: partial.finance ?? base.finance,
    targets: { ...base.targets, ...(partial.targets ?? {}) },
    users: (partial.users ?? base.users).map((user) => {
      if (user.email?.toLowerCase() === "super@demo.rw" || user.role === "superadmin") {
        return { ...user, name: "Amani Alain", role: "superadmin", email: "super@demo.rw", password: "demo123", active: true };
      }
      return user;
    }),
    siteSettings: {
      ...base.siteSettings,
      ...(partial.siteSettings ?? {}),
      superAdminName: "Amani Alain",
    },
  };

  const superAdmin = next.users.find((user) => user.email.toLowerCase() === "super@demo.rw" || user.role === "superadmin");
  if (superAdmin) {
    superAdmin.name = "Amani Alain";
    superAdmin.email = "super@demo.rw";
    superAdmin.password = "demo123";
    superAdmin.role = "superadmin";
    superAdmin.active = true;
  }

  if (Object.prototype.hasOwnProperty.call(partial, "currentUserId")) {
    next.currentUserId = partial.currentUserId ?? null;
  } else if (superAdmin) {
    next.currentUserId = superAdmin.id;
  } else {
    next.currentUserId = null;
  }
  return next;
}

export function resolveStateFromPersistence(localState: Partial<State> | undefined, mongoState: Partial<State> | undefined): State {
  const hasMongoData = !!mongoState && (
    Array.isArray(mongoState.users)
    || Array.isArray(mongoState.listings)
    || Array.isArray(mongoState.auctions)
    || Array.isArray(mongoState.txns)
    || Array.isArray(mongoState.audit)
  );

  if (hasMongoData) {
    return normalizeState(mongoState);
  }

  if (localState) {
    return normalizeState(localState);
  }

  return seed();
}

const serverState = seed();
let state: State = serverState;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;

  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      state = seed();
      void hydrateFromMongo();
      return;
    }

    const parsed = JSON.parse(raw) as Partial<State>;
    state = normalizeState(parsed);
  } catch {
    state = seed();
  }

  void hydrateFromMongo();
}
export function setState(fn: (s: State) => Partial<State>) {
  load();
  const nextState = { ...state, ...fn(state) };
  state = nextState;

  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  void syncToMongo(state);
  subs.forEach((f) => f());
}
const subscribe = (cb: () => void) => { subs.add(cb); return () => { subs.delete(cb); }; };
const getSnap = () => { load(); return state; };
const getServerSnap = () => serverState;
// Snapshot must be a stable reference; selectors (which may create new arrays) run after.
export function useStore<T>(sel: (s: State) => T): T {
  return sel(useSyncExternalStore(subscribe, getSnap, getServerSnap));
}
export const getState = () => { load(); return state; };
export const uid = () => Math.random().toString(36).slice(2, 9);
export const resetDemo = () => setState(() => seed());
export const log = (action: string) => setState((s) => ({ audit: [{ at: Date.now(), actor: s.users.find((u) => u.id === s.currentUserId)?.name ?? "system", action }, ...s.audit] }));
export const notify = (userId: string, text: string) => setState((s) => ({ notifications: [{ userId, text, at: Date.now() }, ...s.notifications] }));

export function useMe() {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);
}

/** Bid rules: must be entrant, auction open, amount >= minimum next bid. Returns error or null. */
export function validateBid(a: Auction, userId: string, amount: number, at = Date.now()): string | null {
  if (a.status !== "active" || at >= a.endsAt) return "This auction is closed.";
  if (a.entryFee > 0 && !a.entrants.includes(userId)) return "Pay the entry fee before bidding.";
  const min = minBid(a);
  if (amount < min) return `Minimum bid is ${min.toLocaleString()} RWF.`;
  return null;
}
export const minBid = (a: Auction) => (a.bids.length ? Math.max(...a.bids.map((b) => b.amount)) + a.increment : a.startPrice);
export function auctionWinner(a: Auction, at = Date.now()) {
  if (at < a.endsAt && a.status !== "closed") return { closed: false as const };
  const top = [...a.bids].sort((x, y) => y.amount - x.amount)[0];
  if (!top || top.amount < a.reserve) return { closed: true as const, winner: null };
  return { closed: true as const, winner: top };
}
