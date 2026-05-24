import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import bannerLaptops from "@/assets/banner-laptops.jpg";
import bannerTvs from "@/assets/banner-tvs.jpg";
import bannerDeals from "@/assets/banner-deals.jpg";

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  align: "left" | "right";
};

const SLIDES: Slide[] = [
  {
    image: bannerLaptops,
    eyebrow: "Hot Deals",
    title: "Lenovo Laptops from KSh 62,000",
    subtitle: "ThinkPad, IdeaPad & Legion. 1-year warranty. Free delivery in Nairobi.",
    cta: "Shop Laptops",
    href: "/category/laptops-desktops",
    align: "left",
  },
  {
    image: bannerTvs,
    eyebrow: "Mega TV Sale",
    title: "Smart TVs from KSh 15,000",
    subtitle: "Hisense, TCL, Vitron. 32\" to 65\" with 4K UHD & QLED options.",
    cta: "Shop TVs",
    href: "/category/tvs",
    align: "right",
  },
  {
    image: bannerDeals,
    eyebrow: "Flash Deals",
    title: "Up to 30% Off Phones & Audio",
    subtitle: "Samsung, iPad, Tecno, Oraimo — limited-time prices.",
    cta: "See Deals",
    href: "/category/phones-tablets",
    align: "left",
  },
];

export function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);
  const go = (d: 1 | -1) => setIdx((i) => (i + d + SLIDES.length) % SLIDES.length);

  return (
    <div className="relative overflow-hidden bg-muted">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {SLIDES.map((s, i) => (
          <div key={i} className="relative w-full shrink-0 aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5]">
            <img
              src={s.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              width={1920}
              height={640}
            />
            <div className={`absolute inset-0 ${s.align === "left" ? "bg-gradient-to-r from-black/60 via-black/30 to-transparent" : "bg-gradient-to-l from-black/60 via-black/30 to-transparent"}`} />
            <div className={`relative h-full container mx-auto px-4 sm:px-8 flex items-center ${s.align === "right" ? "justify-end text-right" : "justify-start"}`}>
              <div className="max-w-md text-white">
                <span className="inline-block bg-warning text-warning-foreground text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2 py-1 rounded">
                  {s.eyebrow}
                </span>
                <h2 className="mt-2 sm:mt-3 text-xl sm:text-3xl md:text-5xl font-extrabold leading-tight">
                  {s.title}
                </h2>
                <p className="hidden sm:block mt-2 text-sm md:text-base text-white/85">
                  {s.subtitle}
                </p>
                <Link
                  to={s.href}
                  className="mt-3 sm:mt-5 inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary hover:bg-brand text-primary-foreground rounded-md text-sm sm:text-base font-bold shadow-brand transition-colors"
                >
                  {s.cta} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="hidden sm:grid absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 place-items-center rounded-full bg-white/80 hover:bg-white text-foreground"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="hidden sm:grid absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 place-items-center rounded-full bg-white/80 hover:bg-white text-foreground"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
