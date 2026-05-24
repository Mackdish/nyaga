import type { Product } from "@/lib/catalog";

export function findProductIn(products: Product[], id: string) {
  return products.find((p) => p.id === id);
}

export function productsByCategoryFrom(products: Product[], slug: string) {
  return products.filter((p) => p.category === slug);
}

export function featuredProductsFrom(products: Product[]) {
  return products.filter((p) => p.badge === "best" || p.rating >= 4.7).slice(0, 10);
}

export function bestSellersFrom(products: Product[]) {
  return [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 10);
}

export function newArrivalsFrom(products: Product[]) {
  return products
    .filter((p) => p.badge === "new")
    .concat(products.slice(0, 6))
    .slice(0, 10);
}

export function flashDealsFrom(products: Product[]) {
  return products
    .filter((p) => p.oldPrice && 1 - p.price / p.oldPrice >= 0.15)
    .slice(0, 12);
}
