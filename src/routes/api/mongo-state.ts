import { createServerFileRoute } from "@tanstack/react-start/server";
import { ensureMongoCollections, getMongoDb } from "@/lib/mongodb";

export const ServerRoute = createServerFileRoute("/api/mongo-state").GET(async () => {
  try {
    await ensureMongoCollections();
    const db = await getMongoDb();
    const [users, listings, auctions, tickets, txns, audit, finance, targets, siteSettings] = await Promise.all([
      db.collection("users").find({}).toArray(),
      db.collection("listings").find({}).toArray(),
      db.collection("auctions").find({}).toArray(),
      db.collection("tickets").find({}).toArray(),
      db.collection("transactions").find({}).toArray(),
      db.collection("audit").find({}).toArray(),
      db.collection("finance").find({}).toArray(),
      db.collection("targets").findOne({ _id: "targets" }),
      db.collection("siteSettings").findOne({ _id: "siteSettings" }),
    ]);

    return Response.json({
      users,
      listings,
      auctions,
      tickets,
      txns,
      audit,
      finance,
      targets: targets?.value ?? { propertyTarget: 12, revenueTarget: 250000000 },
      favorites: {},
      unlocked: {},
      currentUserId: null,
      notifications: [],
      siteSettings: siteSettings?.value ?? {
        websiteName: "AmSi Real Estate",
        logo: "AmSi Real Estate",
        superAdminName: "Amani Alain",
        profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      },
    });
  } catch {
    return Response.json({
      users: [],
      listings: [],
      auctions: [],
      tickets: [],
      txns: [],
      audit: [],
      finance: [],
      targets: { propertyTarget: 12, revenueTarget: 250000000 },
      favorites: {},
      unlocked: {},
      currentUserId: null,
      notifications: [],
      siteSettings: {
        websiteName: "AmSi Real Estate",
        logo: "AmSi Real Estate",
        superAdminName: "Amani Alain",
        profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      },
    });
  }
});
