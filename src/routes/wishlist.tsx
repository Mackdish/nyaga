import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ProductCard } from "@/components/product-card";
import { useWishlist } from "@/lib/store";
import { useCatalogProducts } from "@/hooks/use-catalog-products";
import { Heart, Loader2 } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Intech Computer Shop" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const catalog = useCatalogProducts();
  const products = ids.map((id) => catalog.findProduct(id)).filter(Boolean) as NonNullable<
    ReturnType<typeof catalog.findProduct>
  >[];

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 mt-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold">My Wishlist</h1>
        <p className="text-sm text-muted-foreground">{products.length} saved item{products.length === 1 ? "" : "s"}</p>
      </div>
      <div className="container mx-auto px-4 mt-5">
        {catalog.loading && products.length === 0 ? (
          <div className="py-16 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading wishlist…
          </div>
        ) : products.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-accent grid place-items-center text-brand mb-3">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">Your wishlist is empty</h2>
            <p className="text-sm text-muted-foreground mt-1">Tap the heart on any product to save it here.</p>
            <Link to="/" className="inline-block mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-md font-bold hover:bg-brand">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
