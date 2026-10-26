import { createServerFileRoute } from "@tanstack/react-start/server";
import { ensureMongoCollections, getMongoDb } from "@/lib/mongodb";

export const ServerRoute = createServerFileRoute("/api/mongo-sync").POST(async (event) => {
  try {
    const snapshot = (await event.request.json()) as Record<string, unknown>;
    await ensureMongoCollections();
    const db = await getMongoDb();

    const collections = {
      users: db.collection("users"),
      listings: db.collection("listings"),
      auctions: db.collection("auctions"),
      tickets: db.collection("tickets"),
      transactions: db.collection("transactions"),
      audit: db.collection("audit"),
      siteSettings: db.collection("siteSettings"),
    };

    await Promise.all([
      collections.users.deleteMany({}),
      collections.listings.deleteMany({}),
      collections.auctions.deleteMany({}),
      collections.tickets.deleteMany({}),
      collections.transactions.deleteMany({}),
      collections.audit.deleteMany({}),
    ]);

    const inserts = [
      collections.users.insertMany((snapshot.users ?? []) as Record<string, unknown>[]),
      collections.listings.insertMany((snapshot.listings ?? []) as Record<string, unknown>[]),
      collections.auctions.insertMany((snapshot.auctions ?? []) as Record<string, unknown>[]),
      collections.tickets.insertMany((snapshot.tickets ?? []) as Record<string, unknown>[]),
      collections.transactions.insertMany((snapshot.txns ?? []) as Record<string, unknown>[]),
      collections.audit.insertMany((snapshot.audit ?? []) as Record<string, unknown>[]),
      collections.siteSettings.replaceOne({ _id: "siteSettings" }, { _id: "siteSettings", value: snapshot.siteSettings ?? { websiteName: "IsokoHub", logo: "IsokoHub", superAdminName: "Amani Alain", profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" } }, { upsert: true }),
    ];

    await Promise.all(inserts);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Mongo sync failed", error);
    return Response.json({ ok: false, error: "MongoDB sync failed" }, { status: 500 });
  }
});
