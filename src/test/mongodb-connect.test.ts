import { describe, expect, it } from "vitest";
import { buildMongoUri, getSeedState } from "@/lib/mongodb";
import { resolveStateFromPersistence, type State } from "@/lib/store";

describe("MongoDB connection setup", () => {
  it("builds a valid MongoDB connection string from the provided credentials", () => {
    const uri = buildMongoUri("Ishoborabyose");

    expect(uri).toContain("mongodb+srv://amanialaindrin7_db_user:Ishoborabyose@cluster0.gcmrqqs.mongodb.net/isokohub");
    expect(uri).toContain("/isokohub");
  });

  it("includes the seeded user and listing data expected by the app", () => {
    const state = getSeedState();

    expect(state.users.length).toBeGreaterThan(0);
    expect(state.listings.length).toBeGreaterThan(0);
    expect(state.users.some((user) => user.email === "super@demo.rw")).toBe(true);
    expect(state.listings.some((listing) => listing.category === "land")).toBe(true);
  });

  it("prefers a Mongo snapshot over stale local demo state", () => {
    const localState: Partial<State> = {
      users: [{ id: "local-user", name: "Local", email: "local@example.com", password: "secret", role: "user", active: true, createdAt: 1 }],
      listings: [],
      currentUserId: "local-user",
    };

    const mongoState: Partial<State> = {
      users: getSeedState().users,
      listings: getSeedState().listings,
      currentUserId: "super-admin",
      siteSettings: {
        websiteName: "AmSi Real Estate",
        logo: "AmSi Real Estate",
        superAdminName: "Amani Alain",
        profilePicture: "https://example.com/avatar.png",
      },
    };

    const next = resolveStateFromPersistence(localState, mongoState);

    expect(next.users.length).toBeGreaterThan(localState.users!.length);
    expect(next.listings.length).toBeGreaterThan(0);
    expect(next.currentUserId).toBe("super-admin");
  });
});
