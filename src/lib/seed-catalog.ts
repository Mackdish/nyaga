import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS } from "@/lib/catalog";

export type SeedResult = { inserted: number; skipped: number; failed: number };

/** Build Supabase insert rows from the built-in storefront catalog. */
export function getDefaultProductRows() {
  return PRODUCTS.map((p) => ({
    name: p.name,
    description: p.description ?? null,
    category: p.category,
    price: p.price,
    stock: p.stock,
    low_stock_threshold: 5,
    image_url: p.imageUrl ?? null,
    active: true,
  }));
}

/** Re-insert default catalog products into Supabase (skips names that already exist). */
export async function seedDefaultProductsToDb(): Promise<SeedResult> {
  const { data: existing, error: loadError } = await supabase.from("products").select("name");
  if (loadError) throw new Error(loadError.message);

  const existingNames = new Set((existing ?? []).map((r) => r.name.trim().toLowerCase()));
  const rows = getDefaultProductRows().filter((r) => !existingNames.has(r.name.trim().toLowerCase()));

  if (rows.length === 0) {
    return { inserted: 0, skipped: PRODUCTS.length, failed: 0 };
  }

  const chunkSize = 25;
  let inserted = 0;
  let failed = 0;
  let lastError = "";

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from("products").insert(chunk);
    if (error) {
      lastError = error.message;
      // Retry failed chunk one row at a time so one bad row doesn't block the batch.
      for (const row of chunk) {
        const { error: rowError } = await supabase.from("products").insert(row);
        if (rowError) {
          failed++;
          lastError = rowError.message;
        } else {
          inserted++;
        }
      }
    } else {
      inserted += chunk.length;
    }
  }

  return {
    inserted,
    skipped: PRODUCTS.length - rows.length,
    failed,
  };
}
