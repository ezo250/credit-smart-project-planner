import house from "@/assets/house.jpg";
import land from "@/assets/land.jpg";
import apartment from "@/assets/apartment.jpg";
import car from "@/assets/car.jpg";

export const CATEGORY_IMAGES: Record<Category, string> = {
  land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  house: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
  apartment: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  car: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  electronics: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  commercial: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
};

const LISTING_IMAGE_LIBRARY: Record<Category, string[]> = {
  land: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  ],
  house: [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
  ],
  apartment: [
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  ],
  car: [
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
  ],
  electronics: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
  ],
  commercial: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  ],
};

export function resolveListingImage(title: string, category: Category, explicitImage?: string) {
  if (explicitImage) return explicitImage;

  const pool = LISTING_IMAGE_LIBRARY[category] ?? [CATEGORY_IMAGES[category]];
  const hash = Array.from(title.toLowerCase()).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return pool[Math.abs(hash) % pool.length];
}

export type Role = "superadmin" | "admin" | "commissioner" | "user";
export type Category = "land" | "house" | "apartment" | "car" | "electronics" | "commercial";
export type ListingType = "sale" | "rent" | "auction";
export type Status = "draft" | "pending" | "approved" | "rejected" | "suspended";

export interface User { id: string; name: string; email: string; password: string; role: Role; active: boolean; createdAt: number; profilePicture?: string }
export interface PremiumField { label: string; value: string }
export interface Coordinates { lat: number; lng: number }
export interface Listing {
  id: string; ref: string; title: string; description: string; category: Category; type: ListingType;
  price: number; district: string; sector: string; img: string; location?: Coordinates | string;
  beds?: number; baths?: number; size?: number; features: string[];
  status: Status; ownerId: string; featured?: boolean; verified?: boolean; sponsored?: boolean;
  createdAt: number; premium: PremiumField[]; premiumPrice: number; reason?: string;
  negotiable?: boolean; headline?: string[];
  details?: { group: string; items: [string, string][] }[];
  equipment?: string[];
  descriptions?: { en: string; rw: string; fr: string };
}
export interface Bid { userId: string; amount: number; at: number }
export interface Auction {
  id: string; title: string; img: string; description: string; startPrice: number; increment: number;
  reserve: number; entryFee: number; endsAt: number; bids: Bid[]; entrants: string[]; status: "active" | "paused" | "closed";
}
export interface Ticket { id: string; userId: string | null; name: string; topic: string; message: string; status: "open" | "answered" | "closed"; reply?: string; at: number }
export interface Txn { id: string; userId: string; kind: "premium" | "auction_fee"; ref: string; amount: number; status: "success" | "refunded"; at: number }
export interface Audit { at: number; actor: string; action: string }

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "land", label: "Land & Plots" }, { id: "house", label: "Houses" }, { id: "apartment", label: "Apartments" },
  { id: "car", label: "Cars" }, { id: "electronics", label: "Electronics" }, { id: "commercial", label: "Commercial" },
];
export const DISTRICTS = ["Gasabo", "Kicukiro", "Nyarugenge", "Bugesera", "Rwamagana", "Musanze", "Rubavu", "Huye"];
export const DISTRICT_COORDINATES: Record<string, Coordinates> = {
  Gasabo: { lat: -1.9469, lng: 30.0705 },
  Kicukiro: { lat: -1.9316, lng: 30.0939 },
  Nyarugenge: { lat: -1.9444, lng: 30.0596 },
  Bugesera: { lat: -2.1684, lng: 30.0872 },
  Rwamagana: { lat: -1.9481, lng: 30.0977 },
  Musanze: { lat: -1.5005, lng: 29.6287 },
  Rubavu: { lat: -1.6982, lng: 29.2619 },
  Huye: { lat: -2.5967, lng: 29.7422 },
};
export const AREA_COORDINATES: Record<string, Coordinates> = {
  "Kicukiro, Kanombe, Busanza, Rukore": { lat: -1.9373, lng: 30.0998 },
  "Kicukiro, Kigarama, Bwerankori": { lat: -1.9291, lng: 30.1064 },
  "Gasabo, Kinyinya, Kigali": { lat: -1.9127, lng: 30.1184 },
  "Nyarugenge, Nyabugogo, Kigali": { lat: -1.9461, lng: 30.0555 },
  "Gasabo, Remera, Kigali": { lat: -1.9472, lng: 30.1112 },
  "Gasabo, Kimihurura, Kigali": { lat: -1.9538, lng: 30.0903 },
  "Gasabo, Gisozi, Kigali": { lat: -1.9648, lng: 30.0842 },
  "Gasabo, Kacyiru, Kigali": { lat: -1.9505, lng: 30.0763 },
  "Gasabo, Ruyenzi, Kigali": { lat: -1.9155, lng: 30.1301 },
  "Kicukiro, Gikondo, Kigali": { lat: -1.9378, lng: 30.1315 },
  "Kicukiro, Nyarugunga, Kigali": { lat: -1.9148, lng: 30.1497 },
  "Kicukiro, Masaka, Kigali": { lat: -1.9385, lng: 30.1445 },
  "Nyarugenge, Muhima, Kigali": { lat: -1.9583, lng: 30.0682 },
  "Nyarugenge, CBD, Kigali": { lat: -1.9448, lng: 30.0617 },
  "Kicukiro, Kagarama, Kigali": { lat: -1.9258, lng: 30.1037 },
  "Gasabo, Kibagabaga, Kigali": { lat: -1.9223, lng: 30.0828 },
  "Kicukiro, Niboyi, Kigali": { lat: -1.9094, lng: 30.1281 },
  "Nyarugenge, Nyamirambo, Kigali": { lat: -1.9587, lng: 30.0611 },
  "Nyarugenge, Rebero, Kigali": { lat: -1.9720, lng: 30.0839 },
  "Gasabo, Gacuriro, Kigali": { lat: -1.9308, lng: 30.0849 },
  "Gasabo, Kigali Heights, Kigali": { lat: -1.9518, lng: 30.0708 },
  "Rwamagana, Muhazi, Kigali": { lat: -1.9410, lng: 30.1496 },
  "Gasabo, Kinyinya, Kigali": { lat: -1.9127, lng: 30.1184 },
  "Gasabo, Remera, Kigali": { lat: -1.9472, lng: 30.1112 },
  "Kicukiro, Niboyi, Kigali": { lat: -1.9094, lng: 30.1281 },
  "Gasabo, Kacyiru, Kigali": { lat: -1.9505, lng: 30.0763 },
  "Rwamagana, Muhazi": { lat: -1.9497, lng: 30.1668 },
  "Gasabo, Gisozi": { lat: -1.9628, lng: 30.0853 },
  "Nyarugenge, Kigali Central, Kigali": { lat: -1.9444, lng: 30.0596 },
  "Nyarugenge, Nyabugogo": { lat: -1.9461, lng: 30.0555 },
  "Gasabo, Kinyinya": { lat: -1.9127, lng: 30.1184 },
  "Gasabo, Remera": { lat: -1.9469, lng: 30.1047 },
  "Gasabo, Kimihurura": { lat: -1.9538, lng: 30.0903 },
  "Gasabo, Gacuriro": { lat: -1.9317, lng: 30.0827 },
  "Gasabo, Ruyenzi": { lat: -1.9155, lng: 30.1301 },
  "Kicukiro, Kigarama": { lat: -1.9291, lng: 30.1064 },
  "Kicukiro, Nyarugunga": { lat: -1.9148, lng: 30.1497 },
  "Kicukiro, Masaka": { lat: -1.9385, lng: 30.1445 },
  "Nyarugenge, Muhima": { lat: -1.9583, lng: 30.0682 },
  "Bugesera, Nyamata": { lat: -2.1512, lng: 30.0911 },
  "Musanze, Kinigi": { lat: -1.4920, lng: 29.6322 },
  "Rwamagana, Muhazi": { lat: -1.9497, lng: 30.1668 },
};
export const IMAGES = CATEGORY_IMAGES;

export function buildListingMapUrl(location?: Coordinates | string | null) {
  const query = typeof location === "string"
    ? location
    : location
      ? `${location.lat},${location.lng}`
      : "Rwanda";
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
}

export function buildGoogleMapEmbedUrl(locations: Array<Coordinates | string | null | undefined>, center?: string) {
  const coords = locations
    .map((location) => {
      if (!location) return null;
      if (typeof location === "string") {
        const exact = AREA_COORDINATES[location.trim()];
        return exact ?? null;
      }
      return location;
    })
    .filter((value): value is Coordinates => Boolean(value));

  if (coords.length === 0) {
    return `https://www.google.com/maps?q=${encodeURIComponent(center ?? "Rwanda")}&z=10&output=embed`;
  }

  const average = coords.reduce((sum, coord) => ({ lat: sum.lat + coord.lat, lng: sum.lng + coord.lng }), { lat: 0, lng: 0 });
  const mid = { lat: average.lat / coords.length, lng: average.lng / coords.length };
  const markers = coords.map((coord) => `&markers=color:blue%7C${coord.lat},${coord.lng}`).join("");
  return `https://www.google.com/maps?q=${encodeURIComponent(`${mid.lat},${mid.lng}`)}&z=11&output=embed${markers}`;
}

export function getListingMapQuery(listing: { district?: string; sector?: string; location?: Coordinates | string | null; premium?: PremiumField[] }) {
  if (typeof listing.location === "string" && listing.location.trim()) return listing.location.trim();
  const exact = listing.premium?.find((field) => /exact location|location|address|area/i.test(field.label))?.value;
  if (exact && exact.trim()) return exact.trim();
  const parts = [listing.sector, listing.district].filter(Boolean);
  return parts.length ? parts.join(", ") : "Rwanda";
}

export function getListingCoordinates(listing: { district?: string; sector?: string; location?: Coordinates | string | null; premium?: PremiumField[] }) {
  if (typeof listing.location === "string") {
    const direct = AREA_COORDINATES[listing.location.trim()];
    if (direct) return direct;
  }
  if (typeof listing.location === "object" && listing.location) return listing.location;
  const query = getListingMapQuery(listing);
  const direct = AREA_COORDINATES[query.trim()];
  if (direct) return direct;
  const sectorMatch = typeof listing.sector === "string" ? AREA_COORDINATES[`${listing.district ?? ""}, ${listing.sector}`] : undefined;
  if (sectorMatch) return sectorMatch;
  return DISTRICT_COORDINATES[listing.district ?? ""] ?? { lat: -1.9367, lng: 30.0975 };
}

export function parsePremiumText(text: string): PremiumField[] {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const fields: PremiumField[] = [];
  for (const line of lines) {
    const match = line.match(/^([^:;-]+?)\s*[:;-]\s*(.+)$/);
    if (match) {
      const label = match[1].trim();
      const value = match[2].trim();
      if (label && value) fields.push({ label, value });
      continue;
    }
    const fallback = line.split(/\s{2,}/);
    if (fallback.length > 1) {
      const label = fallback[0].trim().replace(/:$/, "");
      const value = fallback.slice(1).join(" ").trim();
      if (label && value) fields.push({ label, value });
    }
  }
  return fields;
}

const day = 86400000;
const now = Date.now();

export const seedUsers: User[] = [
  { id: "u1", name: "Amani Alain", email: "super@demo.rw", password: "demo123", role: "superadmin", active: true, createdAt: now - 90 * day, profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
  { id: "u2", name: "Eric Habimana", email: "admin@demo.rw", password: "demo123", role: "admin", active: true, createdAt: now - 60 * day, profilePicture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" },
  { id: "u3", name: "Diane Mukamana", email: "agent@demo.rw", password: "demo123", role: "commissioner", active: true, createdAt: now - 40 * day, profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" },
  { id: "u4", name: "Jean Claude N.", email: "user@demo.rw", password: "demo123", role: "user", active: true, createdAt: now - 5 * day, profilePicture: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80" },
];

const L = (p: Partial<Listing> & Pick<Listing, "id" | "title" | "category" | "type" | "price" | "district"> & { img?: string }): Listing => ({
  ref: "RW-" + p.id.toUpperCase().padStart(5, "0"), description: "", sector: "Kimironko", features: [], status: "approved",
  ownerId: "u3", createdAt: now - 3 * day, premium: [], premiumPrice: 5000, ...p, img: p.img ?? resolveListingImage(p.title, p.category),
});

export const seedListings: Listing[] = [
  L({ id: "l11", ref: "L-2MR6M2", title: "Residential plot 355 m² in Busanza", category: "land", type: "sale", price: 35000000, negotiable: true, district: "Kicukiro", sector: "Kanombe", size: 355, featured: true, verified: true, createdAt: new Date("2026-10-21").getTime(), location: "Kicukiro, Kanombe, Busanza, Rukore",
    headline: ["355 m²", "Residential", "For sale", "Kicukiro", "Plot / Land"],
    features: ["Land title (UPI)", "Water on site", "Electricity on site", "Tarmac road access", "Near school", "Near hospital"],
    details: [{ group: "Plot data", items: [["Plot size", "355 m²"], ["Zoning", "Residential"]] }, { group: "More details", items: [["Area", "Busanza"]] }],
    descriptions: {
      en: "Location: Kicukiro, Kanombe, Busanza\nZone: Residential\nSize: 355 sqm\nPrice: 35,000,000 RWF\n\nFeatures: Water, Electricity\nNearby: Busanza Traffic Police bureau, Hospitals, Schools, Tarmac road",
      rw: "Aho uherereye: Kicukiro, Kanombe, Busanza\nAgace: Gutura\nUbunini: 355 m²\nIgiciro: 35.000.000 RWF\n\nIbiranga: Amazi, Amashanyarazi\nHafi: Ibiro bya Polisi ishinzwe umutekano wo mu muhanda, Ibitaro, Amashuri, Umuhanda wa Tarmac",
      fr: "Lieu : Kicukiro, Kanombe, Busanza\nZone : Résidentiel\nSuperficie : 355 m²\nPrix : 35 000 000 RWF\n\nCaractéristiques : Eau, Électricité\nProche : Bureau de police de la circulation de Busanza, Hôpitaux, Écoles, Route goudronnée",
    },
    premium: [{ label: "UPI (land title)", value: "1/03/05/01/5107" }, { label: "Exact location", value: "Kicukiro, Kanombe, Busanza, Rukore" }, { label: "Owner phone", value: "0788405145 / 0735053274" }], premiumPrice: 5000 }),
  L({ id: "l12", ref: "L-ETN77R", title: "Toyota RAV4 2014 — Automatic", category: "car", type: "sale", price: 18000000, negotiable: true, district: "Kicukiro", sector: "Kigarama", featured: true, createdAt: new Date("2026-10-20").getTime(), location: "Kicukiro, Kigarama, Bwerankori",
    headline: ["Automatic", "5 seats", "For sale", "Kicukiro", "Vehicle"],
    features: ["Automatic", "Petrol", "5 seats"],
    details: [
      { group: "Vehicle data", items: [["Vehicle type", "Passenger"], ["Body type", "Car"], ["Make", "Toyota RAV4"], ["Year", "2014"], ["Color", "Dark gray"], ["Fuel", "Petrol"], ["Seats", "5"]] },
      { group: "Technical data", items: [["Transmission", "Automatic"], ["Condition", "Used — excellent"]] },
    ],
    equipment: ["Air conditioning", "Power steering", "Reverse camera", "Bluetooth", "Radio", "Touchscreen", "USB", "Alloy wheels", "Left-hand drive"],
    descriptions: {
      en: "CAR FOR SALE\nLocation: Kicukiro, Kigarama\nPrice: 18,000,000 RWF (negotiable)\n\nMake: RAV4 · Year: 2014 · Color: Dark gray · Automatic · Petrol\n\nCondition: Engine good · Gearbox smooth · Interior clean · Exterior well maintained · Tires good · Documents available\n\nExtras: 5 seats, 4 doors + automatic boot door, Radio & Bluetooth, A/C, Power steering, Electric windows, Alloy wheels, REMA certificate, Camera",
      rw: "IMODOKA IRAGURISHWA\nAho iherereye: Kicukiro, Kigarama\nIgiciro: 18.000.000 RWF (gishobora kuganirwaho)\n\nImodoka: RAV4 · Umwaka: 2014 · Ibara: Umukara wijimye · Yikora · Lisansi\n\nImiterere: Moteri imeze neza · Gearbox nziza · Imbere hasukuye · Inyuma hitaweho · Amapine meza · Ibyangombwa birahari\n\nIbindi: Imyanya 5, inzugi 4, Radiyo & Bluetooth, Air condition, Amadirishya y'amashanyarazi, Icyemezo cya REMA, Kamera",
      fr: "VOITURE À VENDRE\nLieu : Kicukiro, Kigarama\nPrix : 18 000 000 RWF (négociable)\n\nMarque : RAV4 · Année : 2014 · Couleur : Gris foncé · Automatique · Essence\n\nÉtat : Moteur bon · Boîte fluide · Intérieur propre · Extérieur bien entretenu · Pneus bons · Documents disponibles\n\nÉquipements : 5 places, 4 portes + hayon électrique, Radio & Bluetooth, Climatisation, Direction assistée, Vitres électriques, Jantes alliage, Certificat REMA, Caméra de recul",
    },
    premium: [{ label: "Exact location", value: "Kicukiro, Kigarama, Bwerankori" }, { label: "Owner phone", value: "0788381126 / 0788308711" }, { label: "WhatsApp", value: "0788381126" }], premiumPrice: 4000 }),
  L({ id: "l1", title: "Residential plot with lake view", category: "land", type: "sale", price: 18000000, district: "Bugesera", sector: "Nyamata", size: 600, features: ["Water", "Electricity", "Road access"], featured: true, verified: true, description: "Gently sloping plot zoned R1, 10 minutes from the new airport site.", premium: [{ label: "UPI number", value: "5/03/01/02/4471" }, { label: "Exact coordinates", value: "-2.1534, 30.0981" }, { label: "Owner phone", value: "+250 788 412 903" }], premiumPrice: 5000 }),
  L({ id: "l2", title: "Modern 5-bed villa with pool", category: "house", type: "sale", price: 450000000, district: "Gasabo", sector: "Nyarutarama", beds: 5, baths: 5, size: 420, features: ["Pool", "Garden", "Parking", "Furnished"], featured: true, verified: true, sponsored: true, description: "Architect-designed villa overlooking Kigali with infinity pool.", premium: [{ label: "Land title status", value: "Freehold, title verified 2025" }, { label: "Exact address", value: "KG 9 Ave, House 41" }, { label: "Seller contact", value: "+250 789 220 114" }], premiumPrice: 15000 }),
  L({ id: "l3", title: "Furnished 2-bed apartment, city view", category: "apartment", type: "rent", price: 850000, district: "Nyarugenge", sector: "Kiyovu", beds: 2, baths: 2, size: 110, features: ["Furnished", "Lift", "Security", "Parking"], verified: true, description: "Bright apartment, 5 minutes from CBD. Price per month.", premium: [{ label: "Unit number", value: "Tower B, 7th floor" }, { label: "Landlord contact", value: "+250 785 001 772" }], premiumPrice: 3000 }),
  L({ id: "l4", title: "Toyota Land Cruiser V8 2019", category: "car", type: "sale", price: 62000000, district: "Kicukiro", sector: "Gikondo", size: undefined, features: ["Automatic", "Diesel", "68,000 km"], featured: true, description: "One owner, full service history, RRA cleared.", premium: [{ label: "Plate number", value: "RAD 512 K" }, { label: "Chassis number", value: "JTMHV05J9K4021387" }, { label: "Seller contact", value: "+250 788 990 341" }], premiumPrice: 4000 }),
  L({ id: "l5", title: "Plot ready for construction", category: "land", type: "sale", price: 12500000, district: "Kicukiro", sector: "Masaka", size: 450, features: ["Water", "Road access"], description: "Flat plot in growing neighbourhood near schools.", premium: [{ label: "UPI number", value: "1/03/10/05/2210" }, { label: "Owner phone", value: "+250 783 114 600" }] }),
  L({ id: "l6", title: "Family house with garden", category: "house", type: "rent", price: 1200000, district: "Kicukiro", sector: "Kagarama", beds: 4, baths: 3, size: 260, features: ["Garden", "Parking", "Security"], verified: true, description: "Quiet compound, monthly rent.", premium: [{ label: "Exact address", value: "KK 31 St, House 8" }, { label: "Landlord contact", value: "+250 787 300 210" }] }),
  L({ id: "l7", title: "Large agricultural land 2 ha", category: "land", type: "sale", price: 35000000, district: "Rwamagana", sector: "Muhazi", size: 20000, features: ["Water", "Road access"], description: "Fertile land near Lake Muhazi, suitable for farming or eco-lodge.", premium: [{ label: "UPI number", value: "5/01/06/03/0091" }, { label: "Survey report", value: "Available — surveyed Mar 2026" }] }),
  L({ id: "l8", title: "Penthouse apartment, Kacyiru", category: "apartment", type: "sale", price: 210000000, district: "Gasabo", sector: "Kacyiru", beds: 3, baths: 3, size: 190, features: ["Terrace", "Lift", "Gym"], sponsored: true, description: "Top-floor penthouse near embassies.", premium: [{ label: "Unit number", value: "PH-2" }, { label: "Seller contact", value: "+250 788 600 812" }] }),
  L({ id: "l9", title: "Plot in Musanze near volcanoes", category: "land", type: "sale", price: 22000000, district: "Musanze", sector: "Kinigi", size: 900, features: ["Electricity", "Road access"], description: "Ideal for a tourism lodge.", premium: [{ label: "UPI number", value: "4/03/02/01/1188" }] }),
  L({ id: "l10", title: "Pending: Office space downtown", category: "commercial", type: "rent", price: 3000000, district: "Nyarugenge", sector: "Nyarugenge", size: 300, features: ["Lift", "Parking"], status: "pending", description: "Open-plan office, monthly rent." }),
  L({ id: "l13", title: "Serviced plot in Kinyinya", category: "land", type: "sale", price: 16000000, district: "Gasabo", sector: "Kinyinya", size: 420, features: ["Water", "Electricity", "Road access", "Near market"], featured: true, description: "Ready-to-build plot in a fast-growing residential zone.", premium: [{ label: "Exact location", value: "Gasabo, Kinyinya, Kigali" }, { label: "UPI number", value: "1/04/02/08/4032" }], premiumPrice: 3500, location: "Gasabo, Kinyinya, Kigali" }),
  L({ id: "l14", title: "Commercial plot next to Nyabugogo", category: "commercial", type: "sale", price: 75000000, district: "Nyarugenge", sector: "Nyabugogo", size: 800, features: ["Prime frontage", "High visibility", "Utilities"], sponsored: true, description: "Corner commercial plot in a busy transport hub.", premium: [{ label: "Exact location", value: "Nyarugenge, Nyabugogo, Kigali" }, { label: "Plot title", value: "Freehold title" }], premiumPrice: 6000, location: "Nyarugenge, Nyabugogo, Kigali" }),
  L({ id: "l15", title: "Family home in Remera", category: "house", type: "sale", price: 96000000, district: "Gasabo", sector: "Remera", beds: 4, baths: 3, size: 260, features: ["Garden", "Parking", "Security"], verified: true, description: "Spacious family house in a quiet neighborhood near schools.", premium: [{ label: "Exact address", value: "KG 14 Ave, Remera" }, { label: "Seller contact", value: "+250 788 840 115" }], premiumPrice: 4500, location: "Gasabo, Remera, Kigali" }),
  L({ id: "l16", title: "Modern 3-bedroom apartment in Kimihurura", category: "apartment", type: "rent", price: 1400000, district: "Gasabo", sector: "Kimihurura", beds: 3, baths: 2, size: 150, features: ["Furnished", "Balcony", "Security"], description: "Light-filled apartment close to restaurants and embassies.", premium: [{ label: "Landlord contact", value: "+250 788 901 349" }, { label: "Unit number", value: "Block C, 3A" }], premiumPrice: 2500, location: "Gasabo, Kimihurura, Kigali" }),
  L({ id: "l17", title: "Toyota Prado 2021", category: "car", type: "sale", price: 84000000, district: "Gasabo", sector: "Kacyiru", features: ["Automatic", "Diesel", "Full options"], description: "Executive SUV with premium interior and excellent condition.", premium: [{ label: "Exact location", value: "Gasabo, Kacyiru, Kigali" }, { label: "Seller phone", value: "+250 785 330 901" }], premiumPrice: 5000, location: "Gasabo, Kacyiru, Kigali" }),
  L({ id: "l18", title: "Boutique townhouse in Gisozi", category: "house", type: "sale", price: 118000000, district: "Gasabo", sector: "Gisozi", beds: 3, baths: 3, size: 220, features: ["Open plan", "Garage", "Garden"], verified: true, description: "Tastefully finished townhouse in the hills of Kigali.", premium: [{ label: "Exact address", value: "KG 11 St, Gisozi" }, { label: "Owner phone", value: "+250 788 302 447" }], premiumPrice: 4500, location: "Gasabo, Gisozi, Kigali" }),
  L({ id: "l19", title: "Harbor view land in Kicukiro", category: "land", type: "sale", price: 27000000, district: "Kicukiro", sector: "Gikondo", size: 540, features: ["Water", "Electricity", "Good access"], description: "Large plot for a residence or mixed-use project.", premium: [{ label: "UPI number", value: "2/03/02/08/7715" }, { label: "Exact location", value: "Kicukiro, Gikondo, Kigali" }], premiumPrice: 4000, location: "Kicukiro, Gikondo, Kigali" }),
  L({ id: "l20", title: "Two-bedroom flat in Nyarugunga", category: "apartment", type: "rent", price: 1100000, district: "Kicukiro", sector: "Nyarugunga", beds: 2, baths: 2, size: 120, features: ["Water", "Generator", "Security"], description: "Modern flat suitable for couples or small families.", premium: [{ label: "Exact location", value: "Kicukiro, Nyarugunga, Kigali" }, { label: "Landlord phone", value: "+250 782 885 221" }], premiumPrice: 2800, location: "Kicukiro, Nyarugunga, Kigali" }),
  L({ id: "l21", title: "Honda CR-V 2020", category: "car", type: "sale", price: 34000000, district: "Kicukiro", sector: "Masaka", features: ["Automatic", "Petrol", "Low mileage"], description: "Clean family SUV with full service history.", premium: [{ label: "Owner phone", value: "+250 784 445 924" }, { label: "WhatsApp", value: "+250 784 445 924" }], premiumPrice: 3000, location: "Kicukiro, Masaka, Kigali" }),
  L({ id: "l22", title: "Apartment with pool access in Kigali Heights", category: "apartment", type: "sale", price: 165000000, district: "Nyarugenge", sector: "Kigali Central", beds: 3, baths: 3, size: 170, features: ["Pool", "Lift", "Parking"], description: "Upscale apartment in a central urban complex.", premium: [{ label: "Exact address", value: "Kigali Heights, Nyarugenge" }, { label: "Seller contact", value: "+250 786 431 012" }], premiumPrice: 5000, location: "Nyarugenge, Kigali Central, Kigali" }),
  L({ id: "l23", title: "Warehouse unit in Gikondo", category: "commercial", type: "rent", price: 5000000, district: "Kicukiro", sector: "Gikondo", size: 450, features: ["Storage", "Power", "Roll-up door"], description: "Ideal warehouse for small logistics or storage operations.", premium: [{ label: "Site contact", value: "+250 783 776 331" }, { label: "Exact location", value: "Kicukiro, Gikondo, Kigali" }], premiumPrice: 4000, location: "Kicukiro, Gikondo, Kigali" }),
  L({ id: "l24", title: "Microwave oven and fridge bundle", category: "electronics", type: "sale", price: 4200000, district: "Nyarugenge", sector: "Muhima", features: ["New", "Home appliance bundle", "Warranty"], description: "Electronics bundle for modern apartments and homes.", premium: [{ label: "Seller contact", value: "+250 789 774 112" }, { label: "Exact location", value: "Nyarugenge, Muhima, Kigali" }], premiumPrice: 1800, location: "Nyarugenge, Muhima, Kigali" }),
  L({ id: "l25", title: "Luxury 5-bed villa in Ruyenzi", category: "house", type: "sale", price: 240000000, district: "Gasabo", sector: "Ruyenzi", beds: 5, baths: 4, size: 410, features: ["Infinity pool", "Gym", "Guest suite"], sponsored: true, description: "High-end villa with panoramic views and landscaped gardens.", premium: [{ label: "Exact address", value: "Ruyenzi, Gasabo" }, { label: "Owner phone", value: "+250 782 339 772" }], premiumPrice: 7000, location: "Gasabo, Ruyenzi, Kigali" }),
  L({ id: "l26", title: "Office space in Nyarugenge CBD", category: "commercial", type: "rent", price: 4200000, district: "Nyarugenge", sector: "CBD", size: 240, features: ["Reception", "Parking", "Lift"], description: "Flexible office suite in the city center with strong visibility.", premium: [{ label: "Exact location", value: "Nyarugenge, CBD, Kigali" }, { label: "Manager contact", value: "+250 788 908 224" }], premiumPrice: 3500, location: "Nyarugenge, CBD, Kigali" }),
  L({ id: "l27", title: "3-bedroom duplex in Kigarama", category: "house", type: "rent", price: 1800000, district: "Kicukiro", sector: "Kigarama", beds: 3, baths: 2, size: 190, features: ["Secure", "Parking", "Water"], description: "Comfortable duplex near schools and shops.", premium: [{ label: "Exact location", value: "Kicukiro, Kigarama, Kigali" }, { label: "Landlord contact", value: "+250 783 801 120" }], premiumPrice: 2500, location: "Kicukiro, Kigarama, Kigali" }),
  L({ id: "l28", title: "Brand-new BMW X5 2023", category: "car", type: "sale", price: 142000000, district: "Gasabo", sector: "Kigali Heights", features: ["Automatic", "Diesel", "Leather seats"], description: "Executive SUV with premium trim and low mileage.", premium: [{ label: "Seller phone", value: "+250 788 505 661" }, { label: "Exact location", value: "Gasabo, Kigali Heights, Kigali" }], premiumPrice: 6000, location: "Gasabo, Kigali Heights, Kigali" }),
  L({ id: "l29", title: "One-bedroom unit in Kibagabaga", category: "apartment", type: "rent", price: 900000, district: "Gasabo", sector: "Kibagabaga", beds: 1, baths: 1, size: 75, features: ["Small family friendly", "Water", "Security"], description: "Affordable one-bedroom apartment close to clinics and shops.", premium: [{ label: "Landlord contact", value: "+250 788 339 014" }, { label: "Exact location", value: "Gasabo, Kibagabaga, Kigali" }], premiumPrice: 2000, location: "Gasabo, Kibagabaga, Kigali" }),
  L({ id: "l30", title: "Furnished studio in Kicukiro Niboyi", category: "apartment", type: "rent", price: 980000, district: "Kicukiro", sector: "Niboyi", beds: 1, baths: 1, size: 65, features: ["Furnished", "Wi-Fi", "Secure"], description: "Studio unit with kitchenette and serene surroundings.", premium: [{ label: "Owner phone", value: "+250 784 780 237" }, { label: "Exact location", value: "Kicukiro, Niboyi, Kigali" }], premiumPrice: 2200, location: "Kicukiro, Niboyi, Kigali" }),
  L({ id: "l31", title: "Industrial yard in Masaka", category: "commercial", type: "sale", price: 54000000, district: "Kicukiro", sector: "Masaka", size: 620, features: ["Open yard", "Wide access", "Security"], description: "Ideal for logistics, workshops or equipment storage.", premium: [{ label: "Exact location", value: "Kicukiro, Masaka, Kigali" }, { label: "Seller contact", value: "+250 789 223 441" }], premiumPrice: 4200, location: "Kicukiro, Masaka, Kigali" }),
  L({ id: "l32", title: "Gaming laptop and accessories", category: "electronics", type: "sale", price: 3400000, district: "Gasabo", sector: "Kacyiru", features: ["Gaming PC", "RTX", "Limited offer"], description: "High-performance laptop with gaming accessories and warranty.", premium: [{ label: "Exact location", value: "Gasabo, Kacyiru, Kigali" }, { label: "Seller phone", value: "+250 788 220 981" }], premiumPrice: 1800, location: "Gasabo, Kacyiru, Kigali" }),
  L({ id: "l33", title: "Prime residential plot in Nyamirambo", category: "land", type: "sale", price: 19500000, district: "Nyarugenge", sector: "Nyamirambo", size: 390, features: ["Plot ready", "Water", "Road access"], description: "Great for a compact family home or rental project.", premium: [{ label: "UPI number", value: "3/01/04/07/3190" }, { label: "Exact location", value: "Nyarugenge, Nyamirambo, Kigali" }], premiumPrice: 3500, location: "Nyarugenge, Nyamirambo, Kigali" }),
  L({ id: "l34", title: "Luxury 2-bedroom apartment in Rebero", category: "apartment", type: "sale", price: 98000000, district: "Nyarugenge", sector: "Rebero", beds: 2, baths: 2, size: 130, features: ["Balcony", "Parking", "Gym"], description: "Contemporary apartment in a quiet residential pocket.", premium: [{ label: "Exact address", value: "Rebero, Nyarugenge" }, { label: "Seller contact", value: "+250 786 785 345" }], premiumPrice: 5200, location: "Nyarugenge, Rebero, Kigali" }),
  L({ id: "l35", title: "Renovated 4-bed house in Gacuriro", category: "house", type: "sale", price: 138000000, district: "Gasabo", sector: "Gacuriro", beds: 4, baths: 3, size: 310, features: ["Renovated", "Parking", "Garden"], description: "Beautiful home in a family-friendly neighbourhood.", premium: [{ label: "Exact address", value: "Gacuriro, Gasabo" }, { label: "Owner phone", value: "+250 788 913 876" }], premiumPrice: 5500, location: "Gasabo, Gacuriro, Kigali" }),
  L({ id: "l36", title: "Mercedes-Benz C200 2022", category: "car", type: "sale", price: 61000000, district: "Kicukiro", sector: "Kagarama", features: ["Automatic", "Petrol", "Excellent condition"], description: "Premium compact executive car with complete service records.", premium: [{ label: "Exact location", value: "Kicukiro, Kagarama, Kigali" }, { label: "Seller contact", value: "+250 783 930 190" }], premiumPrice: 5000, location: "Kicukiro, Kagarama, Kigali" }),
  L({ id: "l37", title: "Land near Lake Muhazi", category: "land", type: "sale", price: 29000000, district: "Rwamagana", sector: "Muhazi", size: 760, features: ["Water", "Road access", "Open view"], description: "Peaceful land for residential or agribusiness investment.", premium: [{ label: "UPI number", value: "6/02/03/04/6612" }, { label: "Exact location", value: "Rwamagana, Muhazi, Kigali" }], premiumPrice: 4100, location: "Rwamagana, Muhazi, Kigali" }),
  L({ id: "l38", title: "Condo apartment in Nyabugogo", category: "apartment", type: "rent", price: 1500000, district: "Nyarugenge", sector: "Nyabugogo", beds: 2, baths: 2, size: 135, features: ["Security", "Parking", "Near transport"], description: "Convenient condo with easy access to transport and shopping.", premium: [{ label: "Landlord phone", value: "+250 784 776 221" }, { label: "Exact location", value: "Nyarugenge, Nyabugogo, Kigali" }], premiumPrice: 2600, location: "Nyarugenge, Nyabugogo, Kigali" }),
  L({ id: "l39", title: "Audi A4 2019", category: "car", type: "sale", price: 47500000, district: "Gasabo", sector: "Remera", features: ["Automatic", "Diesel", "Alloy wheels"], description: "Luxury sedan in very good condition and fully serviced.", premium: [{ label: "Exact location", value: "Gasabo, Remera, Kigali" }, { label: "Owner phone", value: "+250 782 445 112" }], premiumPrice: 4100, location: "Gasabo, Remera, Kigali" }),
  L({ id: "l40", title: "Mixed-use plot in Kicukiro", category: "commercial", type: "sale", price: 87000000, district: "Kicukiro", sector: "Niboyi", size: 970, features: ["Mixed use", "Road frontage", "Utilities"], description: "Flexible plot for retail or mixed-use property development.", premium: [{ label: "Exact location", value: "Kicukiro, Niboyi, Kigali" }, { label: "Seller contact", value: "+250 789 998 227" }], premiumPrice: 6000, location: "Kicukiro, Niboyi, Kigali" }),
];

export const seedAuctions: Auction[] = [
  { id: "a1", title: "Lakeside plot, Bugesera (auction)", img: resolveListingImage("Lakeside plot, Bugesera (auction)", "land"), description: "800 m² residential plot. Reserve price applies.", startPrice: 10000000, increment: 250000, reserve: 14000000, entryFee: 10000, endsAt: now + 2 * day, bids: [{ userId: "u2", amount: 11000000, at: now - day }], entrants: ["u2"], status: "active" },
  { id: "a2", title: "Toyota RAV4 2018", img: resolveListingImage("Toyota RAV4 2018", "car"), description: "Petrol, 90,000 km, clean title.", startPrice: 15000000, increment: 200000, reserve: 17000000, entryFee: 5000, endsAt: now + 5 * 3600000, bids: [], entrants: [], status: "active" },
  { id: "a3", title: "Villa in Rebero", img: resolveListingImage("Villa in Rebero", "house"), description: "Completed auction.", startPrice: 150000000, increment: 1000000, reserve: 180000000, entryFee: 20000, endsAt: now - 2 * day, bids: [{ userId: "u4", amount: 185000000, at: now - 3 * day }], entrants: ["u4"], status: "closed" },
  { id: "a4", title: "Prime commercial land in Kicukiro", img: resolveListingImage("Prime commercial land in Kicukiro", "commercial"), description: "Commercial plot with road frontage and strong future demand.", startPrice: 22000000, increment: 300000, reserve: 26000000, entryFee: 15000, endsAt: now + 3 * day, bids: [{ userId: "u3", amount: 23500000, at: now - 6 * 3600000 }], entrants: ["u3"], status: "active" },
  { id: "a5", title: "Family house in Gacuriro", img: resolveListingImage("Family house in Gacuriro", "house"), description: "3-bedroom home with garden, parking and secure compound.", startPrice: 85000000, increment: 1200000, reserve: 98000000, entryFee: 20000, endsAt: now + 7 * 3600000, bids: [], entrants: [], status: "active" },
  { id: "a6", title: "BMW X3 2021", img: resolveListingImage("BMW X3 2021", "car"), description: "Luxury SUV with low mileage and full spec.", startPrice: 48000000, increment: 600000, reserve: 52000000, entryFee: 10000, endsAt: now + 14 * 3600000, bids: [{ userId: "u4", amount: 50000000, at: now - 2 * 3600000 }], entrants: ["u4"], status: "active" },
  { id: "a7", title: "Office suite in Nyarugenge", img: resolveListingImage("Office suite in Nyarugenge", "commercial"), description: "Central office space with reception and customer parking.", startPrice: 35000000, increment: 500000, reserve: 42000000, entryFee: 15000, endsAt: now - 8 * 3600000, bids: [{ userId: "u2", amount: 43000000, at: now - 10 * 3600000 }], entrants: ["u2"], status: "closed" },
  { id: "a8", title: "Residential plot in Masaka", img: resolveListingImage("Residential plot in Masaka", "land"), description: "Near schools, hospitals and major roads.", startPrice: 12000000, increment: 200000, reserve: 14000000, entryFee: 8000, endsAt: now + 10 * 3600000, bids: [], entrants: [], status: "active" },
  { id: "a9", title: "Luxury apartment in Kimihurura", img: resolveListingImage("Luxury apartment in Kimihurura", "apartment"), description: "3-bedroom residence with balcony and full security.", startPrice: 92000000, increment: 1000000, reserve: 105000000, entryFee: 20000, endsAt: now + 1 * day, bids: [{ userId: "u2", amount: 99000000, at: now - 12 * 3600000 }], entrants: ["u2"], status: "active" },
  { id: "a10", title: "Toyota Hilux Double Cab 2019", img: resolveListingImage("Toyota Hilux Double Cab 2019", "car"), description: "Reliable pickup with strong demand and clean title.", startPrice: 23000000, increment: 400000, reserve: 26000000, entryFee: 7000, endsAt: now + 6 * 3600000, bids: [], entrants: [], status: "active" },
];

export const fmtRWF = (n: number) => "RWF " + n.toLocaleString("en-US");
