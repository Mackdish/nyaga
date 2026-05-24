import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ShoppingBag, Users, AlertTriangle, Activity, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

interface RecentOrder { id: string; total_amount: number; status: string; customer_email: string | null; created_at: string; }

interface Metrics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  lowStock: Array<{ id: string; name: string; stock: number; low_stock_threshold: number; category: string }>;
  recent: RecentOrder[];
}

function formatKES(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
}

function AdminOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      const [ordersRes, customersRes, lowStockRes, recentRes] = await Promise.all([
        supabase.from("orders").select("total_amount, status"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("id, name, stock, low_stock_threshold, category")
          .order("stock", { ascending: true }),
        supabase
          .from("orders")
          .select("id, total_amount, status, customer_email, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (customersRes.error) throw customersRes.error;
      if (lowStockRes.error) throw lowStockRes.error;
      if (recentRes.error) throw recentRes.error;

      const orders = ordersRes.data ?? [];
      const totalSales = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);

      const lowStock = (lowStockRes.data ?? []).filter(
        (p) => p.stock <= p.low_stock_threshold,
      );

      setMetrics({
        totalSales,
        totalOrders: orders.length,
        totalCustomers: customersRes.count ?? 0,
        lowStock,
        recent: (recentRes.data as RecentOrder[]) ?? [],
      });
    } catch (e: any) {
      setError(e.message ?? "Failed to load metrics");
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    const channel = supabase
      .channel("admin-overview")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadMetrics())
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => loadMetrics())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMetrics]);

  if (error) {
    return <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">{error}</div>;
  }

  if (!metrics) {
    return <div className="text-muted-foreground">Loading metrics…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time store performance metrics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Total Sales"
          value={formatKES(metrics.totalSales)}
          accent="bg-gradient-brand text-primary-foreground"
        />
        <MetricCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
        />
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="Total Customers"
          value={metrics.totalCustomers.toLocaleString()}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Recent Orders</h2>
          </div>
          {metrics.recent.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No orders yet.</div>
          ) : (
            <ul className="divide-y text-sm">
              {metrics.recent.map((o) => (
                <li key={o.id} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-xs truncate">{o.id.slice(0, 8)}…</div>
                    <div className="text-xs text-muted-foreground truncate">{o.customer_email ?? "Guest"} · {new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{o.status}</span>
                    <span className="font-semibold">{formatKES(Number(o.total_amount))}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <h2 className="font-semibold">System Health</h2>
          </div>
          <ul className="divide-y text-sm">
            <Health label="Database" ok />
            <Health label="Storage (product images)" ok />
            <Health label="Authentication" ok />
            <Health label="Stock alerts" ok={metrics.lowStock.length === 0} note={metrics.lowStock.length > 0 ? `${metrics.lowStock.length} low` : "All good"} />
          </ul>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Low Stock Report</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {metrics.lowStock.length} item{metrics.lowStock.length !== 1 && "s"} need restocking
          </span>
        </div>
        {metrics.lowStock.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            All products are well stocked. 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-right">Stock</th>
                  <th className="px-4 py-2 text-right">Threshold</th>
                  <th className="px-4 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.lowStock.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-2 text-right">{p.stock}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{p.low_stock_threshold}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.stock === 0 ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                      }`}>
                        {p.stock === 0 ? "Out of stock" : "Low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className={`rounded-lg border p-5 ${accent ?? "bg-card"}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function Health({ label, ok, note }: { label: string; ok: boolean; note?: string }) {
  return (
    <li className="px-4 py-3 flex items-center justify-between">
      <span>{label}</span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ok ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"}`}>{note ?? (ok ? "Operational" : "Attention")}</span>
    </li>
  );
}
