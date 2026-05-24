import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

type Order = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_email: string | null;
  user_id: string | null;
};

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_FLOW: Record<Status, { label: string; tone: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", tone: "outline" },
  paid: { label: "Paid", tone: "secondary" },
  processing: { label: "Processing", tone: "secondary" },
  shipped: { label: "Shipped", tone: "default" },
  delivered: { label: "Delivered", tone: "default" },
  cancelled: { label: "Cancelled", tone: "destructive" },
};

const KES = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("id, created_at, status, total_amount, customer_email, user_id")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load orders");
    } else {
      setOrders((data as Order[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // Realtime — pick up new customer orders & status changes instantly
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of STATUSES) c[s] = 0;
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  async function updateStatus(id: string, next: Status) {
    setUpdatingId(id);
    const prev = orders.find((o) => o.id === id)?.status;
    setOrders((curr) => curr.map((o) => (o.id === id ? { ...o, status: next } : o)));
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast.error("Update failed");
      if (prev) setOrders((curr) => curr.map((o) => (o.id === id ? { ...o, status: prev } : o)));
    } else {
      toast.success(`Order marked as ${next}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">View, filter, and update order status.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={`All (${counts.all})`} />
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            label={`${STATUS_FLOW[s].label} (${counts[s] ?? 0})`}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filter === "all" ? "All orders" : `${STATUS_FLOW[filter].label} orders`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading orders…
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[180px]">Update tracking</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => {
                    const status = (STATUSES as readonly string[]).includes(o.status)
                      ? (o.status as Status)
                      : "pending";
                    const meta = STATUS_FLOW[status];
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">#{o.id.slice(0, 8)}</TableCell>
                        <TableCell className="text-sm">{o.customer_email ?? "Guest"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(o.created_at).toLocaleString("en-KE")}
                        </TableCell>
                        <TableCell className="font-semibold">{KES.format(Number(o.total_amount))}</TableCell>
                        <TableCell>
                          <Badge variant={meta.tone}>{meta.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={status}
                            onValueChange={(v) => updateStatus(o.id, v as Status)}
                            disabled={updatingId === o.id}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {STATUS_FLOW[s].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background hover:bg-muted border-border text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
