import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ProductCard } from "@/components/product-card";
import { findCategory } from "@/lib/catalog";
import { useCatalogProducts } from "@/hooks/use-catalog-products";
import { useMemo, useState } from "react";
import { ChevronRight, Loader2, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = findCategory(params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.cat.name ?? "Category"} — Intech Computer Shop` },
      {
        name: "description",
        content: `Shop ${loaderData?.cat.name ?? "products"} at Intech Computer Shop in Kenya. Genuine products, M-Pesa payments, nationwide delivery.`,
      },
    ],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Category not found</h1>
        <Link to="/" className="text-primary hover:underline mt-3 inline-block">← Back to home</Link>
      </div>
    </SiteLayout>
  ),
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const catalog = useCatalogProducts();
  const products = useMemo(
    () => catalog.productsByCategory(cat.slug),
    [catalog.products, cat.slug],
  );

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))), [products]);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [activeBrands, setActiveBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(
    products.length ? Math.max(...products.map((p) => p.price)) : 200000,
  );
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "rating" | "newest">("featured");

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice);
    if (activeSub) list = list.filter((p) => p.sub === activeSub);
    if (activeBrands.length) list = list.filter((p) => activeBrands.includes(p.brand));
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "newest": list = [...list].sort((a, b) => (b.badge === "new" ? 1 : 0) - (a.badge === "new" ? 1 : 0)); break;
    }
    return list;
  }, [products, activeSub, activeBrands, maxPrice, sort]);

  const toggleBrand = (b: string) =>
    setActiveBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

  return (
    <SiteLayout>
      {catalog.loading && catalog.products.length === 0 ? (
        <div className="py-24 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading products…
        </div>
      ) : (
        <>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 mt-4 text-xs sm:text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{cat.name}</span>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 mt-3">
        <div className="bg-gradient-brand text-primary-foreground rounded-xl p-4 sm:p-6 shadow-brand">
          <h1 className="text-2xl sm:text-3xl font-extrabold">{cat.name}</h1>
          <p className="text-sm opacity-90 mt-1">{products.length} product{products.length === 1 ? "" : "s"} available</p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-5 grid lg:grid-cols-[260px_1fr] gap-5">
        {/* Sidebar */}
        <aside className="bg-card border border-border rounded-lg p-4 h-fit lg:sticky lg:top-32 space-y-5">
          <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </h3>

          {cat.subs && cat.subs.length > 0 && (
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide mb-2">Subcategory</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <button
                    onClick={() => setActiveSub(null)}
                    className={cn("text-left w-full px-2 py-1.5 rounded hover:bg-accent", !activeSub && "text-primary font-semibold")}
                  >
                    All
                  </button>
                </li>
                {cat.subs.map((s: { slug: string; name: string }) => (
                  <li key={s.slug}>
                    <button
                      onClick={() => setActiveSub(s.slug)}
                      className={cn("text-left w-full px-2 py-1.5 rounded hover:bg-accent", activeSub === s.slug && "text-primary font-semibold")}
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {brands.length > 0 && (
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide mb-2">Brand</h3>
              <ul className="space-y-1.5 text-sm">
                {(brands as string[]).map((b: string) => (
                  <li key={b}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeBrands.includes(b)}
                        onChange={() => toggleBrand(b)}
                        className="accent-primary h-4 w-4"
                      />
                      <span>{b}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide mb-2">Max price</h3>
            <input
              type="range"
              min={1000}
              max={Math.max(...products.map((p) => p.price), 200000)}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="text-xs text-muted-foreground mt-1">Up to KSh {maxPrice.toLocaleString()}</div>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 bg-card border border-border rounded-lg px-3 py-2">
            <div className="text-sm text-muted-foreground">{filtered.length} results</div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="text-sm bg-background border border-border rounded px-2 py-1.5"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Best Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-lg font-bold">No products match your filters</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting the brand, price or subcategory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </SiteLayout>
  );
}
