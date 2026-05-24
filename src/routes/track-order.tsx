import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useState } from "react";
import { Package, Truck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/track-order")({
  head: () => ({ meta: [{ title: "Track Order — Intech Computer Shop" }] }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<null | { id: string; status: string; eta: string }>(null);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="text-3xl font-extrabold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground mb-6">Enter your order number to see the latest status.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); setResult({ id: orderId || "INT-000000", status: "Processing", eta: "Tomorrow, 12:00pm" }); }}
          className="flex gap-2"
        >
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. INT-123456" className="flex-1 h-11 px-3 rounded-md border border-border bg-background" />
          <button className="px-6 h-11 bg-primary hover:bg-brand text-primary-foreground rounded-md font-bold">Track</button>
        </form>

        {result && (
          <div className="mt-6 bg-card border border-border rounded-xl p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Order</div>
            <div className="text-xl font-extrabold text-brand">{result.id}</div>
            <div className="mt-4 flex items-center justify-between">
              <Step icon={<CheckCircle2 className="h-5 w-5" />} label="Confirmed" done />
              <div className="flex-1 h-px bg-border mx-2" />
              <Step icon={<Package className="h-5 w-5" />} label="Processing" done />
              <div className="flex-1 h-px bg-border mx-2" />
              <Step icon={<Truck className="h-5 w-5" />} label="Out for delivery" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Estimated arrival: <span className="font-semibold text-foreground">{result.eta}</span></p>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Step({ icon, label, done }: { icon: React.ReactNode; label: string; done?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-10 w-10 grid place-items-center rounded-full ${done ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>{icon}</div>
      <div className="text-xs font-medium text-center">{label}</div>
    </div>
  );
}
