import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useCart, useShipping } from "@/lib/store";
import { KES } from "@/lib/catalog";
import { Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ShippingSelector } from "@/components/shipping-selector";
import { calcShippingCost } from "@/lib/shipping";
import { FallbackImage } from "@/components/fallback-image";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Intech Computer Shop" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const zoneId = useShipping((s) => s.zoneId);

  const subtotal = items.reduce((n, i) => n + i.qty * i.product.price, 0);
  const shippingCost = calcShippingCost(zoneId, subtotal);
  const vat = Math.round(subtotal * 0.16);
  const total = Math.max(0, subtotal + vat + shippingCost - discount);

  const apply = () => {
    if (coupon.trim().toUpperCase() === "INTECH10") {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success("Coupon applied — 10% off");
    } else {
      setDiscount(0);
      toast.error("Invalid coupon");
    }
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 mt-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Your Cart</h1>
        <p className="text-sm text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</p>
      </div>

      {items.length === 0 ? (
        <div className="container mx-auto px-4 mt-10">
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-accent grid place-items-center text-primary mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mt-1">Browse our catalog and find your next favorite gadget.</p>
            <Link to="/" className="inline-block mt-5 px-5 py-2.5 bg-primary text-primary-foreground rounded-md font-bold hover:bg-brand">
              Start shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 mt-5 grid lg:grid-cols-[1fr_360px] gap-5">
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {items.map((i) => (
              <div key={i.product.id} className="p-4 flex gap-3 sm:gap-4 items-center">
                <Link to="/product/$id" params={{ id: i.product.id }} className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden shrink-0 ${i.product.bg}`}>
                  <FallbackImage
                    src={i.product.imageUrl}
                    alt={i.product.name}
                    className="h-full w-full object-cover"
                    fallback={<div className="grid place-items-center h-full w-full text-4xl">{i.product.image}</div>}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to="/product/$id" params={{ id: i.product.id }} className="font-semibold hover:text-primary line-clamp-2 text-sm sm:text-base">
                    {i.product.name}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5">{i.product.brand}</div>
                  <div className="text-brand font-bold mt-1">{KES(i.product.price)}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center border border-border rounded-md">
                    <button onClick={() => setQty(i.product.id, i.qty - 1)} className="h-8 w-8 grid place-items-center hover:bg-accent"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{i.qty}</span>
                    <button onClick={() => setQty(i.product.id, i.qty + 1)} className="h-8 w-8 grid place-items-center hover:bg-accent"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <button onClick={() => { remove(i.product.id); toast("Item removed"); }} className="text-xs text-destructive hover:underline inline-flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="p-3 flex justify-between items-center">
              <Link to="/" className="text-sm text-primary hover:underline">← Continue shopping</Link>
              <button onClick={() => clear()} className="text-sm text-muted-foreground hover:text-destructive">Clear cart</button>
            </div>
          </div>

          <aside className="bg-card border border-border rounded-xl p-4 h-fit lg:sticky lg:top-32 space-y-3">
            <h3 className="font-bold text-lg">Order Summary</h3>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 border border-border rounded-md px-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Coupon code (try INTECH10)"
                  className="flex-1 bg-transparent outline-none text-sm py-2"
                />
              </div>
              <button onClick={apply} className="px-3 bg-foreground text-background rounded-md text-sm font-semibold hover:opacity-90">
                Apply
              </button>
            </div>
            <div className="pt-2 border-t border-border">
              <ShippingSelector subtotal={subtotal} compact />
            </div>
            <div className="space-y-1.5 text-sm pt-2 border-t border-border">
              <Row label="Subtotal" value={KES(subtotal)} />
              <Row label="VAT (16%)" value={KES(vat)} />
              <Row
                label="Shipping"
                value={shippingCost === 0 ? "FREE" : KES(shippingCost)}
                accent={shippingCost === 0 ? "success" : undefined}
              />
              {discount > 0 && <Row label="Discount" value={`- ${KES(discount)}`} accent="success" />}
              <div className="flex justify-between pt-2 mt-2 border-t border-border">
                <span className="font-bold">Total</span>
                <span className="text-xl font-extrabold text-brand">{KES(total)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="w-full h-11 mt-2 inline-flex items-center justify-center bg-primary hover:bg-brand text-primary-foreground rounded-md font-bold"
            >
              Proceed to Checkout
            </Link>
            <p className="text-xs text-center text-muted-foreground">Secure checkout · Pay with M-Pesa</p>
          </aside>
        </div>
      )}
    </SiteLayout>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: "success" }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent === "success" ? "text-success font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}
