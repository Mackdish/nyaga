import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useCart, useShipping } from "@/lib/store";
import { KES } from "@/lib/catalog";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Smartphone, Truck, Lock, MessageCircle } from "lucide-react";
import { ShippingSelector } from "@/components/shipping-selector";
import { calcShippingCost, getZoneById } from "@/lib/shipping";
import { supabase } from "@/integrations/supabase/client";
import { FallbackImage } from "@/components/fallback-image";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Intech Computer Shop" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "Nairobi",
    address: "",
  });
  const [payment, setPayment] = useState<"mpesa" | "card" | "cod">("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("254");
  const [orderId, setOrderId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const zoneId = useShipping((s) => s.zoneId);
  const zone = getZoneById(zoneId);
  const [discount] = useState(0);

  const subtotal = items.reduce((n, i) => n + i.qty * i.product.price, 0);
  const shippingCost = calcShippingCost(zoneId, subtotal);
  const vat = Math.round(subtotal * 0.16);
  const total = subtotal + vat + shippingCost - discount;

  const buildWhatsAppUrl = () => {
    const lines: string[] = [];
    lines.push("Hello, I'd like to place this order:");
    lines.push("");
    lines.push("🛒 ORDER SUMMARY");
    lines.push("——————————————");
    items.forEach((i) => lines.push(`${i.product.name} x${i.qty} — KES ${(i.product.price * i.qty).toLocaleString()}`));
    lines.push("——————————————");
    lines.push(`Subtotal: KES ${subtotal.toLocaleString()}`);
    lines.push(`Shipping (${zone?.name ?? "—"}): ${shippingCost === 0 ? "FREE" : "KES " + shippingCost.toLocaleString()}`);
    lines.push(`VAT (16%): KES ${vat.toLocaleString()}`);
    if (discount > 0) lines.push(`Discount: KES ${discount.toLocaleString()}`);
    lines.push(`TOTAL: KES ${total.toLocaleString()}`);
    lines.push("");
    lines.push("📦 DELIVERY DETAILS");
    lines.push(`Name: ${shipping.fullName || "—"} | Phone: ${shipping.phone || "—"}`);
    lines.push(`Address: ${shipping.address || "—"}, ${shipping.city || "—"}`);
    if (notes.trim()) {
      lines.push("");
      lines.push(`📝 Notes: ${notes.trim()}`);
    }
    lines.push("");
    lines.push("Please confirm my order. Thank you!");
    return `https://wa.me/254728394362?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  if (items.length === 0 && step !== 3) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <Link to="/" className="text-primary hover:underline mt-2 inline-block">← Back to home</Link>
        </div>
      </SiteLayout>
    );
  }

  const [placing, setPlacing] = useState(false);

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          customer_email: shipping.email || userData.user?.email || null,
          total_amount: total,
          status: payment === "cod" ? "pending" : "paid",
        })
        .select("id")
        .single();
      if (error) {
        console.error("Order insert failed:", error);
        toast.error("Couldn't save order — please try again.");
        setPlacing(false);
        return;
      }
      // Friendly short ID derived from the real DB id
      setOrderId("INT-" + data.id.slice(0, 8).toUpperCase());
      clear();
      setStep(3);
      toast.success("Order placed successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Network error placing order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 mt-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Checkout</h1>

        {/* Stepper */}
        <ol className="mt-4 flex items-center gap-2 text-sm">
          {(["Shipping", "Payment", "Confirmation"] as const).map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const active = step === n;
            const done = step > n;
            return (
              <li key={label} className="flex items-center gap-2">
                <span className={`h-7 w-7 grid place-items-center rounded-full text-xs font-bold ${done ? "bg-success text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {done ? "✓" : n}
                </span>
                <span className={active || done ? "font-semibold" : "text-muted-foreground"}>{label}</span>
                {n < 3 && <span className="w-8 sm:w-12 h-px bg-border mx-1" />}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="container mx-auto px-4 mt-5 grid lg:grid-cols-[1fr_360px] gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          {step === 1 && (
            <form
              onSubmit={(e) => { e.preventDefault(); setStep(2); }}
              className="space-y-3"
            >
              <h2 className="font-bold text-lg flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Shipping Details</h2>
              <Field label="Full name" value={shipping.fullName} onChange={(v) => setShipping((s) => ({ ...s, fullName: v }))} required />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Phone" type="tel" value={shipping.phone} onChange={(v) => setShipping((s) => ({ ...s, phone: v }))} required placeholder="0712 345 678" />
                <Field label="Email" type="email" value={shipping.email} onChange={(v) => setShipping((s) => ({ ...s, email: v }))} required />
              </div>
              <Field label="City / Town" value={shipping.city} onChange={(v) => setShipping((s) => ({ ...s, city: v }))} required />
              <Field label="Delivery address" value={shipping.address} onChange={(v) => setShipping((s) => ({ ...s, address: v }))} required placeholder="Building, street, landmark..." />
              <div className="pt-2">
                <ShippingSelector subtotal={subtotal} />
              </div>
              <button className="mt-2 w-full sm:w-auto px-6 h-11 bg-primary hover:bg-brand text-primary-foreground rounded-md font-bold">
                Continue to Payment →
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Payment Method</h2>

              <div className="grid sm:grid-cols-3 gap-3">
                {([
                  { v: "mpesa", label: "M-Pesa", sub: "STK Push", icon: Smartphone },
                  { v: "card", label: "Card", sub: "Visa / Mastercard", icon: Lock },
                  { v: "cod", label: "Cash on Delivery", sub: "Nairobi only", icon: Truck },
                ] as const).map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setPayment(opt.v)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${payment === opt.v ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}
                  >
                    <opt.icon className="h-6 w-6 text-primary mb-2" />
                    <div className="font-bold text-sm">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.sub}</div>
                  </button>
                ))}
              </div>

              {payment === "mpesa" && (
                <div className="bg-accent/50 border border-border rounded-lg p-4 space-y-2">
                  <div className="text-sm font-semibold">M-Pesa Phone Number</div>
                  <input
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="254712345678"
                    className="w-full h-11 px-3 rounded-md border border-border bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll receive an STK Push prompt on your phone to confirm payment of <span className="font-bold text-foreground">{KES(total)}</span>.
                  </p>
                  <p className="text-xs text-warning-foreground bg-warning/30 px-2 py-1 rounded">
                    ⓘ M-Pesa Daraja API integration is configured separately. This demo simulates a successful payment.
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="block text-sm font-medium">Order notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Special delivery instructions, gift message, etc."
                  className="w-full px-3 py-2 rounded-md border border-border bg-background"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={() => setStep(1)} className="px-5 h-11 border border-border rounded-md font-medium hover:bg-accent">
                  ← Back
                </button>
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="flex-1 px-6 h-11 bg-primary hover:bg-brand text-primary-foreground rounded-md font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {placing ? "Placing order…" : `Place Order — ${KES(total)}`}
                </button>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 h-11 bg-success hover:opacity-90 text-white rounded-md font-bold"
                >
                  <MessageCircle className="h-5 w-5" /> Order via WhatsApp
                </a>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 mx-auto text-success" />
              <h2 className="text-2xl font-extrabold mt-3">Thank you! Order placed.</h2>
              <p className="text-muted-foreground mt-1">A confirmation has been sent to your email.</p>
              <div className="mt-5 inline-block bg-accent rounded-lg px-5 py-3 text-left">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Order Number</div>
                <div className="text-xl font-extrabold text-brand">{orderId}</div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <Link to="/" className="px-5 h-11 inline-flex items-center bg-primary hover:bg-brand text-primary-foreground rounded-md font-bold">
                  Continue Shopping
                </Link>
                <button onClick={() => navigate({ to: "/account" })} className="px-5 h-11 border border-border rounded-md font-medium hover:bg-accent">
                  View My Orders
                </button>
              </div>
            </div>
          )}
        </div>

        {step !== 3 && (
          <aside className="bg-card border border-border rounded-xl p-4 h-fit lg:sticky lg:top-32">
            <h3 className="font-bold text-lg mb-3">Your Order</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.product.id} className="flex gap-2 items-center text-sm">
                  <div className={`h-12 w-12 rounded overflow-hidden shrink-0 ${i.product.bg}`}>
                    <FallbackImage
                      src={i.product.imageUrl}
                      alt={i.product.name}
                      className="h-full w-full object-cover"
                      fallback={<div className="grid place-items-center h-full w-full text-2xl">{i.product.image}</div>}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1 text-xs font-medium">{i.product.name}</div>
                    <div className="text-xs text-muted-foreground">Qty {i.qty}</div>
                  </div>
                  <div className="text-sm font-semibold">{KES(i.product.price * i.qty)}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{KES(subtotal)}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping{zone ? ` · ${zone.name}` : ""}</span>
                <span className={shippingCost === 0 ? "text-success font-semibold" : ""}>
                  {shippingCost === 0 ? "FREE" : KES(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT (16%)</span><span>{KES(vat)}</span></div>
              <div className="flex justify-between pt-2 border-t border-border"><span className="font-bold">Total</span><span className="text-xl font-extrabold text-brand">{KES(total)}</span></div>
            </div>
          </aside>
        )}
      </div>
    </SiteLayout>
  );
}

function Field({
  label, value, onChange, type = "text", required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}{required && <span className="text-destructive">*</span>}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 px-3 rounded-md border border-border bg-background outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}
