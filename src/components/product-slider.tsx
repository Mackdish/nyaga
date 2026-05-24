import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { ProductCard } from "./product-card";
import type { Product } from "@/lib/catalog";

export function ProductSlider({
  title,
  accent,
  products,
  href,
}: {
  title: string;
  accent?: "primary" | "brand" | "warning";
  products: Product[];
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  const accentMap = {
    primary: "bg-primary",
    brand: "bg-brand",
    warning: "bg-warning",
  };
  const acc = accentMap[accent ?? "primary"];

  return (
    <section className="container mx-auto px-4 mt-10">
      <div className="flex items-end justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-3">
          <span className={`inline-block w-1.5 h-7 rounded-full ${acc}`} />
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {href && (
            <a href={href} className="text-sm font-medium text-primary hover:underline hidden sm:inline">
              View all →
            </a>
          )}
          <button onClick={() => scroll(-1)} aria-label="Scroll left" className="h-9 w-9 grid place-items-center rounded-full border border-border bg-card hover:bg-accent">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll(1)} aria-label="Scroll right" className="h-9 w-9 grid place-items-center rounded-full border border-border bg-card hover:bg-accent">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-4 px-4"
      >
        {products.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[160px] sm:w-[200px] md:w-[220px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
