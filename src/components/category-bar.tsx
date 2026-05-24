import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";

export function CategoryBar() {
  return (
    <section className="container mx-auto px-4 mt-6">
      <div className="bg-card rounded-xl border border-border shadow-card p-3 sm:p-4">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
          {CATEGORIES.slice(0, 12).map((c) => {
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[c.icon] ?? Icons.Package;
            return (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-accent transition-colors text-center"
              >
                <span className="h-11 w-11 sm:h-12 sm:w-12 grid place-items-center rounded-full bg-gradient-warm text-white group-hover:scale-110 transition-transform shadow-brand">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-foreground/80 group-hover:text-primary leading-tight line-clamp-2">
                  {c.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
