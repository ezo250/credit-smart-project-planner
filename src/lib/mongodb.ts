import type { Db, MongoClient } from "mongodb";
import { seedAuctions, seedListings, seedUsers } from "./data";

export const MONGO_DB_NAME = "isokohub";

export function buildMongoUri(password: string) {
  const safePassword = encodeURIComponent(password);
  return `mongodb+srv://amanialaindrin7_db_user:${safePassword}@cluster0.gcmrqqs.mongodb.net/isokohub?retryWrites=true&w=majority`;
}

export function getSeedState() {
  return {
    users: seedUsers,
    listings: seedListings,
    auctions: seedAuctions,
    tickets: [],
    txns: [],
    audit: [],
    finance: [],
    targets: { propertyTarget: 12, revenueTarget: 250000000 },
    ads: [
      { id: "ad-1", title: "Kigali prime residences", placement: "Home page hero", size: "leaderboard", budget: "$12,500", status: "Active", description: "Premium residential listings across Kigali with buyer leads and high-converting creatives.", mediaUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80", mediaType: "image" },
      { id: "ad-2", title: "Off-plan investment campaign", placement: "Sidebar", size: "medium-rectangle", budget: "$8,900", status: "Scheduled", description: "Targeted campaign for high-demand off-plan properties in Gasabo and Kicukiro.", mediaUrl: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80", mediaType: "image" },
    ],
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
  };
}

function getMongoUri() {
  const configured = typeof process !== "undefined"
    ? process.env.MONGODB_URI || process.env.VITE_MONGODB_URI
    : undefined;

  if (configured) return configured;

  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_MONGODB_URI) {
    return import.meta.env.VITE_MONGODB_URI;
  }

  return buildMongoUri("Ishoborabyose");
}

let clientPromise: Promise<MongoClient> | null = null;

export function getMongoClient() {
  const uri = getMongoUri();

  if (!clientPromise) {
    clientPromise = (async () => {
      const { MongoClient: MongoDriver } = await import("mongodb");
      return new MongoDriver(uri).connect();
    })();
  }

  return clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(MONGO_DB_NAME);
}

export async function ensureMongoCollections() {
  const db = await getMongoDb();

  const collections = ["users", "listings", "auctions", "tickets", "transactions", "audit", "finance", "targets", "siteSettings", "ads"];
  for (const name of collections) {
    const exists = await db.listCollections({ name }).hasNext();
    if (!exists) {
      await db.createCollection(name);
    }
  }

  const seed = getSeedState();
  const users = db.collection("users");
  const listings = db.collection("listings");
  const auctions = db.collection("auctions");
  const finance = db.collection("finance");
  const targets = db.collection("targets");
  const ads = db.collection("ads");

  const userCount = await users.countDocuments();
  if (userCount === 0) await users.insertMany(seed.users);

  const listingCount = await listings.countDocuments();
  if (listingCount === 0) await listings.insertMany(seed.listings);

  const auctionCount = await auctions.countDocuments();
  if (auctionCount === 0) await auctions.insertMany(seed.auctions);

  const financeCount = await finance.countDocuments();
  if (financeCount === 0) await finance.insertMany(seed.finance);

  const targetDoc = await targets.findOne({ _id: "targets" });
  if (!targetDoc) {
    await targets.replaceOne({ _id: "targets" }, { _id: "targets", value: seed.targets }, { upsert: true });
  }

  const adCount = await ads.countDocuments();
  if (adCount === 0) await ads.insertMany(seed.ads);

  const siteSettings = db.collection("siteSettings");
  const siteSettingsDoc = await siteSettings.findOne({ _id: "siteSettings" });
  if (!siteSettingsDoc) {
    await siteSettings.replaceOne({ _id: "siteSettings" }, { _id: "siteSettings", value: seed.siteSettings }, { upsert: true });
  }
}

export async function persistStateToMongo(state: unknown) {
  try {
    const db = await getMongoDb();
    const collections = {
      users: db.collection("users"),
      listings: db.collection("listings"),
      auctions: db.collection("auctions"),
      tickets: db.collection("tickets"),
      transactions: db.collection("transactions"),
      audit: db.collection("audit"),
      finance: db.collection("finance"),
      targets: db.collection("targets"),
      ads: db.collection("ads"),
      siteSettings: db.collection("siteSettings"),
    };

    await Promise.all([
      collections.users.deleteMany({}),
      collections.listings.deleteMany({}),
      collections.auctions.deleteMany({}),
      collections.tickets.deleteMany({}),
      collections.transactions.deleteMany({}),
      collections.audit.deleteMany({}),
      collections.finance.deleteMany({}),
      collections.targets.deleteMany({}),
      collections.ads.deleteMany({}),
    ]);

    const snapshot = state as Record<string, unknown>;
    const insertOps = [
      collections.users.insertMany((snapshot.users ?? []) as Record<string, unknown>[]),
      collections.listings.insertMany((snapshot.listings ?? []) as Record<string, unknown>[]),
      collections.auctions.insertMany((snapshot.auctions ?? []) as Record<string, unknown>[]),
      collections.tickets.insertMany((snapshot.tickets ?? []) as Record<string, unknown>[]),
      collections.transactions.insertMany((snapshot.txns ?? []) as Record<string, unknown>[]),
      collections.audit.insertMany((snapshot.audit ?? []) as Record<string, unknown>[]),
      collections.finance.insertMany((snapshot.finance ?? []) as Record<string, unknown>[]),
      collections.targets.replaceOne({ _id: "targets" }, { _id: "targets", value: snapshot.targets ?? getSeedState().targets }, { upsert: true }),
      collections.ads.insertMany((snapshot.ads ?? getSeedState().ads) as Record<string, unknown>[]),
      collections.siteSettings.replaceOne({ _id: "siteSettings" }, { _id: "siteSettings", value: snapshot.siteSettings ?? getSeedState().siteSettings }, { upsert: true }),
    ];

    await Promise.all(insertOps);
    return true;
  } catch {
    return false;
  }
}

export async function loadStateFromMongo() {
  try {
    const db = await getMongoDb();
    const [users, listings, auctions, tickets, txns, audit, finance, targets, ads, siteSettings] = await Promise.all([
      db.collection("users").find({}).toArray(),
      db.collection("listings").find({}).toArray(),
      db.collection("auctions").find({}).toArray(),
      db.collection("tickets").find({}).toArray(),
      db.collection("transactions").find({}).toArray(),
      db.collection("audit").find({}).toArray(),
      db.collection("finance").find({}).toArray(),
      db.collection("targets").findOne({ _id: "targets" }),
      db.collection("ads").find({}).toArray(),
      db.collection("siteSettings").findOne({ _id: "siteSettings" }),
    ]);

    return {
      users,
      listings,
      auctions,
      tickets,
      txns,
      audit,
      finance,
      targets: targets?.value ?? getSeedState().targets,
      ads: ads.length ? ads : getSeedState().ads,
      favorites: {},
      unlocked: {},
      currentUserId: null,
      notifications: [],
      siteSettings: siteSettings?.value ?? getSeedState().siteSettings,
    };
  } catch {
    return getSeedState();
  }
}
