import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Intech Computer Shop" }] }),
  component: () => (
    <SiteLayout>
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-4">Terms of Service</h1>
        <p>By using this website you agree to these terms. Prices are in Kenyan Shillings and inclusive of applicable taxes unless stated. We reserve the right to refuse or cancel orders due to stock or pricing errors.</p>
        <h2 className="text-xl font-bold mt-6 mb-2">Orders</h2>
        <p>Orders are confirmed once payment is received. Delivery times are estimates.</p>
        <h2 className="text-xl font-bold mt-6 mb-2">Liability</h2>
        <p>Our liability is limited to the value of the goods purchased.</p>
      </article>
    </SiteLayout>
  ),
});
