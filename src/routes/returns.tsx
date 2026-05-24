import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Returns & Refunds — Intech Computer Shop" }] }),
  component: () => (
    <SiteLayout>
      <article className="container mx-auto px-4 py-10 prose prose-sm max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-4">Returns & Refunds</h1>
        <p>You may return most items within <strong>7 days</strong> of delivery for a full refund or exchange, provided the item is unused, in its original packaging, and accompanied by proof of purchase.</p>
        <h2 className="text-xl font-bold mt-6 mb-2">Refund timelines</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>M-Pesa: refund within 1–3 business days</li>
          <li>Card: refund within 5–10 business days</li>
          <li>Bank transfer: refund within 3–5 business days</li>
        </ul>
        <h2 className="text-xl font-bold mt-6 mb-2">Non-returnable items</h2>
        <p>Software licenses, opened consumables (ink, toner), and clearance items.</p>
        <p className="mt-6">To start a return, contact us via the Help Center or call +254 728 394 362.</p>
      </article>
    </SiteLayout>
  ),
});
