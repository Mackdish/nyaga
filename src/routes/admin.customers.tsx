import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Search, RefreshCw, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
});

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
};

type RoleRow = { user_id: string; role: "admin" | "customer" };

type OrderRow = {
  id: string;
  user_id: string | null;
  customer_email: string | null;
  total_amount: number;
  status: string;
  created_at: string;
};

type Customer = Profile & {
  roles: ("admin" | "customer")[];
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
};

const KES = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });

function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }, { data: orderRows, error: oErr }] =
      await Promise.all([
        supabase.from("profiles").select("id, email, full_name, created_at"),
        supabase.from("user_roles").select("user_id, role"),
        supabase
          .from("orders")
          .select("id, user_id, customer_email, total_amount, status, created_at")
          .order("created_at", { ascending: false }),
      ]);

    if (pErr || rErr || oErr) {
      toast.error("Failed to load customers");
      setLoading(false);
      return;
    }

    const rolesByUser = new Map<string, ("admin" | "customer")[]>();
    for (const r of (roles as RoleRow[]) ?? []) {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    }

    const ordersByUser = new Map<string, OrderRow[]>();
    for (const o of (orderRows as OrderRow[]) ?? []) {
      if (!o.user_id) continue;
      const arr = ordersByUser.get(o.user_id) ?? [];
      arr.push(o);
      ordersByUser.set(o.user_id, arr);
    }

    const list: Customer[] = ((profiles as Profile[]) ?? []).map((p) => {
      const userOrders = ordersByUser.get(p.id) ?? [];
      const totalSpent = userOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total_amount), 0);
      return {
        ...p,
        roles: rolesByUser.get(p.id) ?? [],
        orderCount: userOrders.length,
        totalSpent,
        lastOrderAt: userOrders[0]?.created_at ?? null,
      };
    });

    list.sort((a, b) => b.orderCount - a.orderCount || (b.created_at > a.created_at ? 1 : -1));
    setCustomers(list);
    setOrders((orderRows as OrderRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.full_name ?? "").toLowerCase().includes(q),
    );
  }, [customers, search]);

  const selectedOrders = useMemo(
    () => (selected ? orders.filter((o) => o.user_id === selected.id) : []),
    [orders, selected],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Browse customer profiles and their order activity.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">All customers ({filtered.length})</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No customers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total spent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{c.full_name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{c.email ?? "—"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {c.roles.length === 0 ? (
                            <Badge variant="outline">customer</Badge>
                          ) : (
                            c.roles.map((r) => (
                              <Badge key={r} variant={r === "admin" ? "default" : "outline"}>
                                {r}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString("en-KE")}
                      </TableCell>
                      <TableCell className="font-semibold">{c.orderCount}</TableCell>
                      <TableCell className="font-semibold">{KES.format(c.totalSpent)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelected(c)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer profile</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Field label="Name" value={selected.full_name || "—"} />
                <Field label="Email" value={selected.email ?? "—"} />
                <Field label="Joined" value={new Date(selected.created_at).toLocaleString("en-KE")} />
                <Field
                  label="Last order"
                  value={selected.lastOrderAt ? new Date(selected.lastOrderAt).toLocaleString("en-KE") : "—"}
                />
                <Field label="Orders" value={String(selected.orderCount)} />
                <Field label="Total spent" value={KES.format(selected.totalSpent)} />
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Recent orders</h3>
                {selectedOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  <div className="rounded-md border max-h-72 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrders.map((o) => (
                          <TableRow key={o.id}>
                            <TableCell className="font-mono text-xs">#{o.id.slice(0, 8)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(o.created_at).toLocaleDateString("en-KE")}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{o.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {KES.format(Number(o.total_amount))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
