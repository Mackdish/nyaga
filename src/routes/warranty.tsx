import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/warranty")({
  head: () => ({ meta: [{ title: "Warranty — Intech Computer Shop" }] }),
  component: () => (
    <SiteLayout>
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-4">Warranty</h1>
        <p>All products sold by Intech Computer Shop carry the manufacturer's standard warranty (typically <strong>1 year</strong>). Warranty covers manufacturing defects and excludes physical damage, liquid damage, and unauthorized repairs.</p>
        <h2 className="text-xl font-bold mt-6 mb-2">How to claim</h2>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Bring the product and proof of purchase to our shop at World Business Centre, 3rd Floor.</li>
          <li>Our technicians will diagnose the issue within 48 hours.</li>
          <li>Eligible defects are repaired or the item is replaced.</li>
        </ol>
      </article>
    </SiteLayout>
  ),
});
