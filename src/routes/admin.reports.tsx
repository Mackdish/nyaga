import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, ShoppingBag, Users, Package, Download } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

interface OrderRow { id: string; total_amount: number; status: string; customer_email: string | null; created_at: string; user_id: string | null; }
interface ProductRow { id: string; name: string; stock: number; low_stock_threshold: number; price: number; }

const KES = (n: number) => "KSh " + Math.round(n).toLocaleString("en-KE");

function ReportsPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const [o, p] = await Promise.all([
        supabase.from("orders").select("id, total_amount, status, customer_email, created_at, user_id").gte("created_at", since),
        supabase.from("products").select("id, name, stock, low_stock_threshold, price"),
      ]);
      setOrders((o.data as OrderRow[]) ?? []);
      setProducts((p.data as ProductRow[]) ?? []);
    })();
  }, [days]);

  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "cancelled");
    const revenue = valid.reduce((s, o) => s + Number(o.total_amount), 0);
    const aov = valid.length ? revenue / valid.length : 0;
    const byCustomer: Record<string, number> = {};
    valid.forEach((o) => {
      const k = o.customer_email ?? o.user_id ?? "Guest";
      byCustomer[k] = (byCustomer[k] ?? 0) + Number(o.total_amount);
    });
    const topCustomers = Object.entries(byCustomer).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { revenue, orders: valid.length, aov, topCustomers };
  }, [orders]);

  const lowStock = products.filter((p) => p.stock <= p.low_stock_threshold);

  const exportCSV = () => {
    const rows = [["Order ID", "Date", "Customer", "Status", "Total"]];
    orders.forEach((o) => rows.push([o.id, new Date(o.created_at).toLocaleString(), o.customer_email ?? "Guest", o.status, String(o.total_amount)]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sales-report-${days}d.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">Sales performance and inventory snapshot.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-10 px-3 rounded-md border border-border bg-background text-sm">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button onClick={exportCSV} className="inline-flex items-center gap-2 h-10 px-4 border border-border rounded-md font-semibold hover:bg-accent text-sm">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card icon={<TrendingUp />} label="Revenue" value={KES(stats.revenue)} />
        <Card icon={<ShoppingBag />} label="Orders" value={stats.orders.toLocaleString()} />
        <Card icon={<Users />} label="AOV" value={KES(stats.aov)} />
        <Card icon={<Package />} label="Low stock items" value={String(lowStock.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Top customers">
          {stats.topCustomers.length === 0 ? <Empty /> : (
            <ul className="text-sm divide-y">
              {stats.topCustomers.map(([k, v]) => (
                <li key={k} className="py-2 flex justify-between"><span className="truncate">{k}</span><span className="font-semibold">{KES(v)}</span></li>
              ))}
            </ul>
          )}
        </Section>
        <Section title="Stock report">
          {lowStock.length === 0 ? <p className="text-sm text-muted-foreground">All stock healthy.</p> : (
            <ul className="text-sm divide-y">
              {lowStock.map((p) => (
                <li key={p.id} className="py-2 flex justify-between">
                  <span className="truncate">{p.name}</span>
                  <span className={`font-semibold ${p.stock === 0 ? "text-destructive" : "text-primary"}`}>{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">{icon}{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border bg-card p-5"><h2 className="font-semibold mb-3">{title}</h2>{children}</div>;
}
function Empty() { return <p className="text-sm text-muted-foreground">No data in selected period.</p>; }
