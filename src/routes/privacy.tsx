import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Intech Computer Shop" }] }),
  component: () => (
    <SiteLayout>
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-4">Privacy Policy</h1>
        <p>Intech Computer Shop respects your privacy. We collect only the personal data necessary to process your orders, deliver your purchases, and improve your experience.</p>
        <h2 className="text-xl font-bold mt-6 mb-2">What we collect</h2>
        <ul className="list-disc pl-6 space-y-1"><li>Name, phone, email, delivery address</li><li>Order history</li><li>Payment confirmations (we never store full card numbers)</li></ul>
        <h2 className="text-xl font-bold mt-6 mb-2">How we use it</h2>
        <p>To fulfil orders, send order updates, and respond to support requests. We do not sell your data to third parties.</p>
      </article>
    </SiteLayout>
  ),
});
