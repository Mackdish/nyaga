// Kenya shipping zones with estimated costs (KES) and delivery ETAs.
// Costs cover standard courier delivery for typical electronics parcels.

export type ShippingZone = {
  id: string;
  name: string;
  region: string;
  cost: number;
  eta: string;
};

export const SHIPPING_ZONES: ShippingZone[] = [
  // Nairobi Metro
  { id: "nairobi-cbd", name: "Nairobi CBD", region: "Nairobi Metro", cost: 200, eta: "Same day" },
  { id: "nairobi-westlands", name: "Westlands / Parklands", region: "Nairobi Metro", cost: 250, eta: "Same day" },
  { id: "nairobi-kilimani", name: "Kilimani / Kileleshwa / Lavington", region: "Nairobi Metro", cost: 250, eta: "Same day" },
  { id: "nairobi-karen", name: "Karen / Langata", region: "Nairobi Metro", cost: 350, eta: "Same day" },
  { id: "nairobi-eastlands", name: "Eastlands (Donholm, Buruburu, Umoja)", region: "Nairobi Metro", cost: 300, eta: "Same day" },
  { id: "nairobi-embakasi", name: "Embakasi / JKIA", region: "Nairobi Metro", cost: 350, eta: "Same day" },
  { id: "nairobi-ruaka", name: "Ruaka / Runda / Kiambu Rd", region: "Nairobi Metro", cost: 400, eta: "Next day" },
  { id: "kiambu", name: "Kiambu / Thika / Ruiru / Juja", region: "Nairobi Metro", cost: 500, eta: "Next day" },
  { id: "kajiado", name: "Kajiado / Ngong / Rongai / Kitengela", region: "Nairobi Metro", cost: 500, eta: "Next day" },
  { id: "machakos", name: "Machakos / Athi River / Mlolongo", region: "Nairobi Metro", cost: 450, eta: "Next day" },

  // Coast
  { id: "mombasa", name: "Mombasa", region: "Coast", cost: 700, eta: "1–2 days" },
  { id: "kilifi", name: "Kilifi / Malindi / Watamu", region: "Coast", cost: 850, eta: "2–3 days" },
  { id: "kwale", name: "Kwale / Diani / Ukunda", region: "Coast", cost: 850, eta: "2–3 days" },
  { id: "lamu", name: "Lamu", region: "Coast", cost: 1200, eta: "3–5 days" },
  { id: "taita", name: "Taita Taveta / Voi", region: "Coast", cost: 800, eta: "2–3 days" },

  // Western & Nyanza
  { id: "kisumu", name: "Kisumu", region: "Western & Nyanza", cost: 700, eta: "1–2 days" },
  { id: "kakamega", name: "Kakamega / Vihiga", region: "Western & Nyanza", cost: 750, eta: "2 days" },
  { id: "bungoma", name: "Bungoma / Busia", region: "Western & Nyanza", cost: 800, eta: "2–3 days" },
  { id: "kisii", name: "Kisii / Nyamira", region: "Western & Nyanza", cost: 800, eta: "2–3 days" },
  { id: "migori", name: "Migori / Homa Bay", region: "Western & Nyanza", cost: 850, eta: "2–3 days" },
  { id: "siaya", name: "Siaya / Bondo", region: "Western & Nyanza", cost: 800, eta: "2–3 days" },

  // Rift Valley
  { id: "nakuru", name: "Nakuru / Naivasha", region: "Rift Valley", cost: 500, eta: "1–2 days" },
  { id: "eldoret", name: "Eldoret / Uasin Gishu", region: "Rift Valley", cost: 700, eta: "1–2 days" },
  { id: "kericho", name: "Kericho / Bomet", region: "Rift Valley", cost: 700, eta: "2 days" },
  { id: "kitale", name: "Kitale / Trans Nzoia", region: "Rift Valley", cost: 800, eta: "2–3 days" },
  { id: "narok", name: "Narok", region: "Rift Valley", cost: 700, eta: "2 days" },
  { id: "kapenguria", name: "Kapenguria / West Pokot", region: "Rift Valley", cost: 1000, eta: "3–4 days" },

  // Central
  { id: "nyeri", name: "Nyeri", region: "Central", cost: 600, eta: "1–2 days" },
  { id: "muranga", name: "Murang'a", region: "Central", cost: 550, eta: "1–2 days" },
  { id: "kirinyaga", name: "Kirinyaga / Kerugoya", region: "Central", cost: 600, eta: "1–2 days" },
  { id: "nyandarua", name: "Nyandarua / Ol Kalou", region: "Central", cost: 700, eta: "2 days" },
  { id: "embu", name: "Embu", region: "Central", cost: 650, eta: "1–2 days" },
  { id: "meru", name: "Meru / Tharaka Nithi", region: "Central", cost: 800, eta: "2–3 days" },

  // Eastern & Northern
  { id: "kitui", name: "Kitui", region: "Eastern & Northern", cost: 700, eta: "2 days" },
  { id: "makueni", name: "Makueni / Wote", region: "Eastern & Northern", cost: 650, eta: "2 days" },
  { id: "isiolo", name: "Isiolo", region: "Eastern & Northern", cost: 1000, eta: "3–4 days" },
  { id: "marsabit", name: "Marsabit / Moyale", region: "Eastern & Northern", cost: 1500, eta: "4–6 days" },
  { id: "garissa", name: "Garissa", region: "Eastern & Northern", cost: 1200, eta: "3–5 days" },
  { id: "wajir", name: "Wajir", region: "Eastern & Northern", cost: 1500, eta: "4–6 days" },
  { id: "mandera", name: "Mandera", region: "Eastern & Northern", cost: 1800, eta: "5–7 days" },
  { id: "lodwar", name: "Lodwar / Turkana", region: "Eastern & Northern", cost: 1500, eta: "4–6 days" },
];

export const FREE_SHIPPING_THRESHOLD = 50000; // KES — orders above this get free shipping

export function getZoneById(id: string): ShippingZone | undefined {
  return SHIPPING_ZONES.find((z) => z.id === id);
}

export function calcShippingCost(zoneId: string, subtotal: number): number {
  const zone = getZoneById(zoneId);
  if (!zone) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return zone.cost;
}

export const ZONES_BY_REGION = SHIPPING_ZONES.reduce<Record<string, ShippingZone[]>>((acc, z) => {
  (acc[z.region] ||= []).push(z);
  return acc;
}, {});
