import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { HeroCarousel } from "@/components/hero-carousel";
import { CategoryBar } from "@/components/category-bar";
import { ProductSlider } from "@/components/product-slider";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES, type Product } from "@/lib/catalog";
import { useCatalogProducts } from "@/hooks/use-catalog-products";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader2, Truck, ShieldCheck, CreditCard, Headphones } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Intech Computer Shop — Laptops, TVs & Electronics in Kenya" },
      {
        name: "description",
        content:
          "Shop laptops, smart TVs, phones, printers, networking & electronics in Kenya. Free Nairobi delivery and M-Pesa checkout.",
      },
      { property: "og:title", content: "Intech Computer Shop" },
      {
        property: "og:description",
        content:
          "Kenya's trusted electronics retailer — laptops, TVs, phones, accessories & more.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const catalog = useCatalogProducts();
  const featuredLaptops = catalog.productsByCategory("laptops-desktops").slice(0, 6);
  const featuredTvs = catalog.productsByCategory("tvs").slice(0, 6);

  if (catalog.loading && catalog.products.length === 0) {
    return (
      <SiteLayout>
        <CatalogLoading />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 mt-3 sm:mt-4">
        <HeroCarousel />
      </div>

      <CategoryBar />

      {/* Trust strip */}
      <section className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: Truck, title: "Free Delivery", desc: "Within Nairobi CBD" },
            { icon: ShieldCheck, title: "Genuine Products", desc: "1-year warranty" },
            { icon: CreditCard, title: "Pay with M-Pesa", desc: "Secure STK Push" },
            { icon: Headphones, title: "24/7 Support", desc: "Call or WhatsApp" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3 p-3 sm:p-4 bg-card rounded-lg border border-border shadow-card">
              <div className="h-10 w-10 sm:h-11 sm:w-11 grid place-items-center rounded-full bg-accent text-primary shrink-0">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProductSlider title="🔥 Flash Deals" accent="warning" products={catalog.flashDeals()} />
      <ProductSlider title="Featured Products" accent="primary" products={catalog.featuredProducts()} />

      {/* Featured category: Laptops */}
      <FeaturedCategoryBlock
        slug="laptops-desktops"
        title="Laptops & Desktops"
        tagline="Lenovo · HP · Dell — built for work, study & gaming"
        products={featuredLaptops}
      />

      <ProductSlider title="Best Sellers" accent="brand" products={catalog.bestSellers()} />

      {/* Featured category: TVs */}
      <FeaturedCategoryBlock
        slug="tvs"
        title="TVs & TV Accessories"
        tagline="Smart TVs from KSh 15,000 — 4K UHD, QLED & more"
        products={featuredTvs}
      />

      <ProductSlider title="New Arrivals" accent="primary" products={catalog.newArrivals()} />

      {/* All categories teaser */}
      <section className="container mx-auto px-4 mt-12">
        <h2 className="text-xl sm:text-2xl font-extrabold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group p-4 rounded-lg bg-card border border-border hover:border-primary hover:shadow-hover transition-all flex items-center justify-between"
            >
              <span className="text-sm font-medium group-hover:text-primary">{c.name}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function FeaturedCategoryBlock({
  slug,
  title,
  tagline,
  products,
}: {
  slug: string;
  title: string;
  tagline: string;
  products: Product[];
}) {
  return (
    <section className="container mx-auto px-4 mt-12">
      <div className="rounded-xl overflow-hidden bg-gradient-warm text-primary-foreground p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 shadow-brand">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">{title}</h2>
          <p className="text-sm sm:text-base opacity-90 mt-1">{tagline}</p>
        </div>
        <Link
          to="/category/$slug"
          params={{ slug }}
          className="self-start sm:self-end inline-flex items-center gap-1.5 bg-white text-brand font-bold px-4 py-2 rounded-md hover:bg-white/90"
        >
          Shop all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function CatalogLoading() {
  return (
    <div className="py-24 flex items-center justify-center text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      Loading products…
    </div>
  );
}
