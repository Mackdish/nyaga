import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, PRODUCTS as SEED_PRODUCTS, type Product } from "@/lib/catalog";

type DbProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

const KNOWN_BRANDS = [
  "Lenovo",
  "HP",
  "Dell",
  "Samsung",
  "Apple",
  "Hisense",
  "TCL",
  "Vitron",
  "Amazon",
  "Tecno",
  "Logitech",
  "Seagate",
  "SanDisk",
  "Epson",
  "Tenda",
  "Hikvision",
  "Sony",
  "Kaspersky",
  "Oraimo",
  "Mercury",
  "Mika",
  "Chuwi",
  "Refurbished",
  "Fujitsu",
];

/** Map admin free-text category to a storefront category slug. */
export function resolveCategorySlug(category: string): string {
  const raw = category.trim();
  if (!raw) return "uncategorized";

  const lower = raw.toLowerCase();

  const exactSlug = CATEGORIES.find((c) => c.slug === lower);
  if (exactSlug) return exactSlug.slug;

  const exactName = CATEGORIES.find((c) => c.name.toLowerCase() === lower);
  if (exactName) return exactName.slug;

  const fuzzy = CATEGORIES.find((c) => {
    const name = c.name.toLowerCase();
    const slugWords = c.slug.replace(/-/g, " ");
    return (
      name.includes(lower) ||
      lower.includes(name) ||
      slugWords.includes(lower) ||
      lower.includes(slugWords)
    );
  });
  if (fuzzy) return fuzzy.slug;

  return lower.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function guessBrand(name: string): string {
  const lower = name.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    if (lower.includes(brand.toLowerCase())) return brand;
  }
  const first = name.split(/\s+/)[0]?.replace(/[^a-zA-Z0-9]/g, "") ?? "";
  if (first.length >= 2 && /^[A-Z]/.test(first)) return first;
  return "Intech";
}

export function mapDbProduct(row: DbProduct): Product {
  const created = new Date(row.created_at);
  const isNew = Date.now() - created.getTime() < 7 * 24 * 60 * 60 * 1000;

  return {
    id: row.id,
    name: row.name,
    brand: guessBrand(row.name),
    category: resolveCategorySlug(row.category),
    price: Number(row.price),
    image: "📦",
    bg: "bg-orange-50",
    rating: 4.5,
    reviews: 0,
    stock: row.stock,
    imageUrl: row.image_url ?? undefined,
    description:
      row.description ??
      `Shop ${row.name} at Intech Computer Shop — genuine products with warranty and Nairobi delivery.`,
    badge: isNew ? "new" : undefined,
  };
}

/** Load active products from Supabase, always including the built-in default catalog. */
export async function fetchCatalogProducts(): Promise<Product[]> {
  const seed = [...SEED_PRODUCTS];

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, category, price, stock, image_url, active, created_at")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[catalog] Failed to load products from database:", error.message);
      return seed;
    }

    const dbProducts = ((data ?? []) as DbProduct[]).map(mapDbProduct);
    if (dbProducts.length === 0) return seed;

    const seedIds = new Set(seed.map((p) => p.id));
    const seedNames = new Set(seed.map((p) => p.name.trim().toLowerCase()));
    const adminOnly = dbProducts.filter(
      (p) => !seedIds.has(p.id) && !seedNames.has(p.name.trim().toLowerCase()),
    );

    // Default catalog first so original products always appear on the storefront.
    return [...seed, ...adminOnly];
  } catch (err) {
    console.warn("[catalog] Supabase unavailable, using default catalog:", err);
    return seed;
  }
}
