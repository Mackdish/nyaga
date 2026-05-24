import { Link, useLocation } from "@tanstack/react-router";
import { ShoppingCart, User, Menu, Zap } from "lucide-react";
import { useCart } from "@/lib/store";
import { CATEGORIES } from "@/lib/catalog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function MobileBottomNav() {
  const location = useLocation();
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-lg">
        <div className="grid grid-cols-4 gap-1 px-1 py-2">
          {/* Cart */}
          <Link
            to="/cart"
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors",
              isActive("/cart")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            )}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="line-clamp-1">Cart</span>
          </Link>

          {/* Checkout */}
          <Link
            to="/checkout"
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors",
              isActive("/checkout")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            )}
          >
            <Zap className="h-5 w-5" />
            <span className="line-clamp-1">Checkout</span>
          </Link>

          {/* Categories Sheet Toggle */}
          <button
            onClick={() => setCategoriesOpen(true)}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span className="line-clamp-1">Categories</span>
          </button>

          {/* Home */}
          <Link
            to="/"
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors",
              isActive("/")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            )}
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="line-clamp-1">Home</span>
          </Link>
        </div>
      </nav>

      {/* Categories Sheet */}
      <Sheet open={categoriesOpen} onOpenChange={setCategoriesOpen}>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Browse Categories</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setCategoriesOpen(false)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div className="text-2xl">{c.icon}</div>
                <div className="text-xs font-medium text-center line-clamp-2">{c.name}</div>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Spacer for fixed nav */}
      <div className="md:hidden h-20" />
    </>
  );
}
