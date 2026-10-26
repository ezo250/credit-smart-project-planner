import "./lib/error-capture";

import { ensureMongoCollections, getMongoDb } from "./lib/mongodb";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function handleMongoApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  if (url.pathname === "/api/mongo-state" && request.method === "GET") {
    try {
      await ensureMongoCollections();
      const db = await getMongoDb();
      const [users, listings, auctions, tickets, txns, audit, siteSettings] = await Promise.all([
        db.collection("users").find({}).toArray(),
        db.collection("listings").find({}).toArray(),
        db.collection("auctions").find({}).toArray(),
        db.collection("tickets").find({}).toArray(),
        db.collection("transactions").find({}).toArray(),
        db.collection("audit").find({}).toArray(),
        db.collection("siteSettings").findOne({ _id: "siteSettings" }),
      ]);

      return Response.json({
        users,
        listings,
        auctions,
        tickets,
        txns,
        audit,
        favorites: {},
        unlocked: {},
        currentUserId: null,
        notifications: [],
        siteSettings: siteSettings?.value ?? {
          websiteName: "IsokoHub",
          logo: "IsokoHub",
          superAdminName: "Amani Alain",
          profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        },
      });
    } catch (error) {
      console.error("mongo-state failed", error);
      return Response.json({
        users: [],
        listings: [],
        auctions: [],
        tickets: [],
        txns: [],
        audit: [],
        favorites: {},
        unlocked: {},
        currentUserId: null,
        notifications: [],
        siteSettings: {
          websiteName: "IsokoHub",
          logo: "IsokoHub",
          superAdminName: "Amani Alain",
          profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        },
      }, { status: 500 });
    }
  }

  if (url.pathname === "/api/mongo-sync" && request.method === "POST") {
    try {
      const snapshot = (await request.json()) as Record<string, unknown>;
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

      await Promise.all([
        collections.users.insertMany((snapshot.users ?? []) as Record<string, unknown>[]),
        collections.listings.insertMany((snapshot.listings ?? []) as Record<string, unknown>[]),
        collections.auctions.insertMany((snapshot.auctions ?? []) as Record<string, unknown>[]),
        collections.tickets.insertMany((snapshot.tickets ?? []) as Record<string, unknown>[]),
        collections.transactions.insertMany((snapshot.txns ?? []) as Record<string, unknown>[]),
        collections.audit.insertMany((snapshot.audit ?? []) as Record<string, unknown>[]),
        collections.siteSettings.replaceOne({ _id: "siteSettings" }, { _id: "siteSettings", value: snapshot.siteSettings ?? { websiteName: "IsokoHub", logo: "IsokoHub", superAdminName: "Amani Alain", profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" } }, { upsert: true }),
      ]);

      return Response.json({ ok: true });
    } catch (error) {
      console.error("mongo-sync failed", error);
      return Response.json({ ok: false, error: "MongoDB sync failed" }, { status: 500 });
    }
  }

  return null;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const mongoApi = await handleMongoApi(request);
    if (mongoApi) return mongoApi;

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
