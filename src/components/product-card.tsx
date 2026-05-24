import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { KES, type Product } from "@/lib/catalog";
import { useCart, useWishlist } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FallbackImage } from "@/components/fallback-image";

export function ProductCard({ product, compact }: { product: Product; compact?: boolean }) {
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(product.id));

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  const badgeStyles: Record<string, string> = {
    hot: "bg-brand text-white",
    flash: "bg-warning text-warning-foreground",
    new: "bg-success text-white",
    best: "bg-primary text-primary-foreground",
  };

  return (
    <div className="group relative bg-card rounded-lg border border-border shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className={cn("relative block aspect-square overflow-hidden w-full", product.bg)}
      >
        <FallbackImage
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          fallback={
            <div className="absolute inset-0 grid place-items-center text-7xl sm:text-8xl group-hover:scale-110 transition-transform duration-300">
              {product.image}
            </div>
          }
        />
        {product.badge && (
          <span className={cn("absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded", badgeStyles[product.badge])}>
            {product.badge === "flash" ? "Flash Deal" : product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-brand text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWish(product.id);
            toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
          }}
          className="absolute bottom-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-white/90 hover:bg-white shadow-card opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Toggle wishlist"
        >
          <Heart className={cn("h-4 w-4", wished ? "fill-brand text-brand" : "text-foreground")} />
        </button>
      </Link>

      <div className={cn("flex-1 flex flex-col p-3", compact && "p-2.5")}>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="text-sm font-medium leading-snug line-clamp-2 hover:text-primary min-h-[2.5rem]"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i <= Math.round(product.rating) ? "fill-warning text-warning" : "text-muted",
                )}
              />
            ))}
          </div>
          <span>({product.reviews})</span>
        </div>
        <div className="mt-1.5">
          <div className="text-base font-bold text-brand">{KES(product.price)}</div>
          {product.oldPrice && (
            <div className="text-xs text-muted-foreground line-through">{KES(product.oldPrice)}</div>
          )}
        </div>
        <button
          onClick={() => {
            add(product, 1);
            toast.success("Added to cart", { description: product.name });
          }}
          className="mt-2.5 inline-flex items-center justify-center gap-1.5 h-9 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-brand transition-colors"
        >
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
}
