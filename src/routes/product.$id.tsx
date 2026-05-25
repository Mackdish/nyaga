import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ProductCard } from "@/components/product-card";
import { FallbackImage } from "@/components/fallback-image";
import { findCategory, KES } from "@/lib/catalog";
import { useCatalogProducts } from "@/hooks/use-catalog-products";
import { useCart, useWishlist } from "@/lib/store";
import { useState } from "react";
import { ChevronRight, Heart, Loader2, Minus, Plus, ShoppingCart, Star, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  head: () => ({
    meta: [{ title: "Product — Intech Computer Shop" }],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <Link to="/" className="text-primary hover:underline mt-3 inline-block">← Back to home</Link>
      </div>
    </SiteLayout>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const catalog = useCatalogProducts();
  const product = catalog.findProduct(id);
  const cat = product ? findCategory(product.category) : undefined;
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(id));
  const [qty, setQty] = useState(1);

  if (catalog.loading && catalog.products.length === 0) {
    return (
      <SiteLayout>
        <div className="py-24 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading product…
        </div>
      </SiteLayout>
    );
  }

  if (!product) {
    throw notFound();
  }

  const related = catalog.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 mt-4 text-xs sm:text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" />
        {cat && (
          <>
            <Link to="/category/$slug" params={{ slug: cat.slug }} className="hover:text-primary">{cat.name}</Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="container mx-auto px-4 mt-4 grid lg:grid-cols-[1fr_1fr_280px] gap-5">
        {/* Image gallery */}
        <div>
          <div className={cn("aspect-square rounded-xl border border-border overflow-hidden shadow-card", product.bg)}>
            <FallbackImage
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              fallback={<div className="grid place-items-center text-9xl">{product.image}</div>}
            />
          </div>
          {product.imageUrl && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              <button
                className={cn("aspect-square rounded-lg border border-border overflow-hidden ring-2 ring-primary", product.bg)}
              >
                <img src={product.imageUrl} alt={`${product.name} thumbnail`} className="h-full w-full object-cover" />
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="text-xs uppercase tracking-wide text-primary font-bold">{product.brand}</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mt-1">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className={cn("h-4 w-4", i <= Math.round(product.rating) ? "fill-warning text-warning" : "text-muted")} />
              ))}
              <span className="ml-1 font-medium">{product.rating}</span>
            </div>
            <span className="text-muted-foreground">{product.reviews} reviews</span>
            <span className={cn("font-semibold", product.stock > 0 ? "text-success" : "text-destructive")}>
              {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
            </span>
          </div>

          <div className="mt-4 flex items-end gap-3 flex-wrap">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand">{KES(product.price)}</div>
            {product.oldPrice && (
              <>
                <div className="text-lg text-muted-foreground line-through">{KES(product.oldPrice)}</div>
                <span className="bg-brand text-white text-xs font-bold px-2 py-1 rounded">Save {discount}%</span>
              </>
            )}
          </div>

          {product.specs && (
            <div className="mt-5 bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-accent text-accent-foreground px-4 py-2 font-bold text-sm">Specifications</div>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([k, v]) => (
                    <tr key={k} className="border-t border-border">
                      <th className="text-left px-4 py-2 bg-muted/50 font-medium w-1/3">{k}</th>
                      <td className="px-4 py-2">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5 prose prose-sm max-w-none text-foreground/80">
            <p>{product.description}</p>
          </div>
        </div>

        {/* Buy box */}
        <aside className="bg-card border border-border rounded-xl p-4 h-fit lg:sticky lg:top-32 space-y-3 shadow-card">
          <div className="text-2xl font-extrabold text-brand">{KES(product.price)}</div>
          <div className="text-sm text-success font-semibold">✓ {product.stock > 0 ? "In stock — ready to ship" : "Out of stock"}</div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Qty:</span>
            <div className="flex items-center border border-border rounded-md">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-9 w-9 grid place-items-center hover:bg-accent">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="h-9 w-9 grid place-items-center hover:bg-accent">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => { add(product, qty); toast.success("Added to cart", { description: `${qty} × ${product.name}` }); }}
            className="w-full h-11 inline-flex items-center justify-center gap-2 bg-primary hover:bg-brand text-primary-foreground rounded-md font-bold"
          >
            <ShoppingCart className="h-5 w-5" /> Add to Cart
          </button>
          <Link
            to="/cart"
            onClick={() => add(product, qty)}
            className="w-full h-11 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white rounded-md font-bold"
          >
            Buy Now
          </Link>
          <button
            onClick={() => { toggleWish(product.id); toast.success(wished ? "Removed from wishlist" : "Added to wishlist"); }}
            className="w-full h-10 inline-flex items-center justify-center gap-2 border border-border rounded-md text-sm font-medium hover:bg-accent"
          >
            <Heart className={cn("h-4 w-4", wished && "fill-brand text-brand")} /> {wished ? "Wishlisted" : "Add to Wishlist"}
          </button>

          <div className="border-t border-border pt-3 space-y-2 text-xs">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Free Nairobi CBD delivery</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> 1-year warranty</div>
            <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" /> 7-day returns</div>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="container mx-auto px-4 mt-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block w-1.5 h-7 rounded-full bg-primary" />
            <h2 className="text-xl sm:text-2xl font-extrabold">Related Products</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
