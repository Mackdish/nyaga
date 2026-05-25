import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { User, Package, Heart, LogOut, LayoutDashboard, RefreshCw, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { KES } from "@/lib/catalog";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Intech Computer Shop" }] }),
  component: AccountPage,
});

type Order = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
};

const STATUS_TONES: Record<string, string> = {
  pending: "bg-warning/20 text-warning-foreground",
  paid: "bg-primary/15 text-primary",
  processing: "bg-primary/15 text-primary",
  shipped: "bg-accent text-foreground",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

function AccountPage() {
  const { user, loading, isAdmin, configured } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!configured) return;
    if (!user) navigate({ to: "/auth", search: { redirect: "/account" } });
  }, [loading, configured, user, navigate]);

  const loadOrders = useCallback(async () => {
    if (!user || !configured) return;
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, status, total_amount")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setOrders((data as Order[]) ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't load your orders");
    } finally {
      setOrdersLoading(false);
    }
  }, [user, configured]);

  useEffect(() => {
    if (user && configured) loadOrders();
  }, [user, configured, loadOrders]);

  useEffect(() => {
    if (!user || !configured) return;
    const channel = supabase
      .channel(`orders-user-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        () => loadOrders(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, configured, loadOrders]);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out");
      navigate({ to: "/" });
    } catch (err) {
      console.error(err);
      toast.error("Couldn't sign out");
    }
  }

  if (loading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading…
        </div>
      </SiteLayout>
    );
  }

  if (!configured) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-md px-4 py-16 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Account unavailable</h1>
          <p className="text-muted-foreground mb-6">
            Sign-in is not configured on this deployment yet. Please try again after the site finishes updating.
          </p>
          <Link to="/" className="text-primary font-medium hover:underline">← Back to store</Link>
        </div>
      </SiteLayout>
    );
  }

  if (!user) return null;

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 mt-6">
        <div className="bg-gradient-brand text-primary-foreground rounded-xl p-5 sm:p-6 shadow-brand flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-white/20 grid place-items-center">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold">Welcome back!</h1>
            <p className="text-sm opacity-90">{user.email}</p>
          </div>
        </div>

        {isAdmin && (
          <Link
            to="/admin"
            className="mt-5 flex items-center gap-3 p-4 bg-card border-2 border-primary rounded-xl hover:shadow-brand transition-all"
          >
            <div className="h-10 w-10 grid place-items-center rounded-full bg-gradient-brand text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold">Admin Dashboard</div>
              <p className="text-sm text-muted-foreground">Manage products, orders, and view sales reports</p>
            </div>
          </Link>
        )}

        <section className="mt-6 bg-card border border-border rounded-xl">
          <header className="flex items-center justify-between gap-3 p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-bold">My Orders</h2>
              <span className="text-xs text-muted-foreground">({orders.length})</span>
            </div>
            <button
              type="button"
              onClick={loadOrders}
              className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${ordersLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </header>
          {ordersLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
              <Link to="/" className="inline-block mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold">
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-muted-foreground">
                      INT-{o.id.slice(0, 8).toUpperCase()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("en-KE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_TONES[o.status] ?? "bg-muted"}`}>
                      {o.status}
                    </span>
                    <span className="font-bold text-brand">{KES(Number(o.total_amount))}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {(
            [
              { icon: Heart, title: "Wishlist", desc: "Items you've saved", to: "/wishlist" as const },
              { icon: LogOut, title: "Logout", desc: "End your session", action: handleLogout },
            ] as Array<{
              icon: typeof Heart;
              title: string;
              desc: string;
              to?: "/wishlist";
              action?: () => void;
            }>
          ).map((c) => {
            const inner = (
              <div className="p-5 bg-card border border-border rounded-xl hover:shadow-hover hover:-translate-y-0.5 transition-all">
                <div className="h-10 w-10 grid place-items-center rounded-full bg-accent text-primary"><c.icon className="h-5 w-5" /></div>
                <div className="font-bold mt-3">{c.title}</div>
                <div className="text-sm text-muted-foreground">{c.desc}</div>
              </div>
            );
            if (c.to) return <Link key={c.title} to={c.to}>{inner}</Link>;
            if (c.action) return <button key={c.title} type="button" onClick={c.action} className="text-left w-full">{inner}</button>;
            return <div key={c.title}>{inner}</div>;
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
