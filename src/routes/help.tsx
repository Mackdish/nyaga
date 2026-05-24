import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help Center — Intech Computer Shop" }] }),
  component: HelpPage,
});

const faqs = [
  { q: "How long does delivery take?", a: "Within Nairobi: same-day or next-day. Other counties: 1–3 business days via courier." },
  { q: "What payment methods do you accept?", a: "M-Pesa, Visa/Mastercard, Cash on Delivery (Nairobi), and Bank Transfer." },
  { q: "Do products come with warranty?", a: "Yes, all products carry a minimum 1-year manufacturer warranty unless otherwise stated." },
  { q: "Can I return a product?", a: "Yes, within 7 days of delivery if unused and in original packaging. See our Returns policy." },
  { q: "How do I track my order?", a: "Use the Track Order page with your order number, or check your account dashboard." },
];

function HelpPage() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-2">Help Center</h1>
        <p className="text-muted-foreground mb-6">Answers to the most common questions. Still stuck? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>.</p>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="bg-card border border-border rounded-lg p-4 group">
              <summary className="font-semibold cursor-pointer">{f.q}</summary>
              <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
