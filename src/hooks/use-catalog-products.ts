import { useCallback, useEffect, useState } from "react";
import { PRODUCTS as SEED_PRODUCTS, type Product } from "@/lib/catalog";
import {
  bestSellersFrom,
  featuredProductsFrom,
  findProductIn,
  flashDealsFrom,
  newArrivalsFrom,
  productsByCategoryFrom,
} from "@/lib/catalog-helpers";
import { fetchCatalogProducts } from "@/lib/products-api";

export function useCatalogProducts() {
  const [products, setProducts] = useState<Product[]>(() => [...SEED_PRODUCTS]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await fetchCatalogProducts());
    } catch (err) {
      console.warn("[catalog] Reload failed, keeping default catalog:", err);
      setProducts([...SEED_PRODUCTS]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    products,
    loading,
    reload,
    findProduct: (id: string) => findProductIn(products, id),
    productsByCategory: (slug: string) => productsByCategoryFrom(products, slug),
    featuredProducts: () => featuredProductsFrom(products),
    bestSellers: () => bestSellersFrom(products),
    newArrivals: () => newArrivalsFrom(products),
    flashDeals: () => flashDealsFrom(products),
  };
}
