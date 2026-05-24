import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, Heart, User, Menu, Phone, Mail, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart, useWishlist } from "@/lib/store";
import { CATEGORIES } from "@/lib/catalog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function InstallAppLink() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [hide, setHide] = useState(false);
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) { setHide(true); return; }
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    const onInstalled = () => setHide(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hide) return null;
  if (!deferred && !isIOS) return null;

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else {
      alert("To install: tap the Share icon in Safari, then 'Add to Home Screen'.");
    }
  };

  return (
    <button onClick={onClick} className="flex items-center gap-1 hover:text-white">
      <Download className="h-3 w-3" /> Install app
    </button>
  );
}

export function SiteHeader() {
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top utility bar */}
      <div className="hidden md:block bg-brand-dark text-white/90 text-xs">
        <div className="container mx-auto flex items-center justify-between px-4 py-1.5">
          <div className="flex items-center gap-4">
            <a href="tel:+254728394362" className="flex items-center gap-1.5 hover:text-white">
              <Phone className="h-3 w-3" /><span>+254 728 394 362</span>
            </a>
            <a href="mailto:sales@intechcomputershop.co.ke" className="flex items-center gap-1.5 hover:text-white">
              <Mail className="h-3 w-3" /><span>sales@intechcomputershop.co.ke</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="hover:text-white">Track Order</Link>
            <Link to="/help" className="hover:text-white">Help</Link>
            <Link to="/contact" className="hover:text-white">Contact Us</Link>
            <InstallAppLink />
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-gradient-brand text-primary-foreground shadow-brand">
        <div className="container mx-auto flex items-center gap-3 px-4 py-3">
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 -ml-2" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <MobileNav />
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-md bg-white text-brand grid place-items-center font-black text-lg">
              i
            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-base sm:text-lg tracking-tight">Intech</div>
              <div className="text-[10px] uppercase tracking-widest opacity-90 -mt-0.5">Computer Shop</div>
            </div>
          </Link>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex-1 flex items-stretch bg-white rounded-md overflow-hidden shadow-sm max-w-2xl mx-2"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search laptops, TVs, phones..."
              className="flex-1 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button className="px-3 sm:px-5 bg-brand text-white font-medium text-sm flex items-center gap-1.5">
              <Search className="h-4 w-4" /> <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          <Link to="/wishlist" className="relative hidden sm:flex items-center gap-1 px-2 py-1.5 hover:bg-white/10 rounded-md text-sm">
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-brand text-[10px] font-bold rounded-full h-4 min-w-4 grid place-items-center px-1">
                {wishCount}
              </span>
            )}
          </Link>
          <Link to="/account" className="hidden md:flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/10 rounded-md text-sm">
            <User className="h-5 w-5" />
            <span className="hidden lg:inline">Account</span>
          </Link>
          <Link to="/cart" className="relative flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-md text-sm font-medium">
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-warning text-warning-foreground text-[10px] font-bold rounded-full h-4 min-w-4 grid place-items-center px-1">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category strip */}
      <nav className="bg-white border-b border-border hidden lg:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {CATEGORIES.slice(0, 11).map((c) => (
              <li key={c.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="block px-3 py-2.5 text-xs font-medium text-foreground/80 hover:text-primary whitespace-nowrap border-b-2 border-transparent hover:border-primary transition-colors"
                  activeProps={{ className: "text-primary border-primary" }}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

function MobileNav() {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-brand text-primary-foreground p-4">
        <div className="font-extrabold text-lg">Intech Computer Shop</div>
        <div className="text-xs opacity-90">Browse all categories</div>
      </div>
      <ul className="flex-1 overflow-y-auto py-2">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="block px-4 py-3 text-sm font-medium hover:bg-accent border-b border-border/50"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
