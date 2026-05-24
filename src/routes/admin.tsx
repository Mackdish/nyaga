import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { SiteLayout } from "@/components/site-layout";
import { LayoutDashboard, Package, ShoppingBag, Users, AlertTriangle, Tag, BarChart3, Settings } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading, isAdmin, configured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && configured && !user) navigate({ to: "/auth", search: { redirect: "/admin" } });
  }, [loading, configured, user, navigate]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-md px-4 py-16 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            Your account doesn't have admin privileges. Contact a system administrator to be granted the <code className="bg-muted px-1 rounded">admin</code> role.
          </p>
          <Link to="/" className="text-primary font-medium hover:underline">← Back to store</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          <h2 className="px-3 mb-3 text-xs uppercase tracking-wide text-muted-foreground font-semibold">Admin</h2>
          <NavItem to="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="Overview" />
          <NavItem to="/admin/products" icon={<Package className="h-4 w-4" />} label="Products" />
          <NavItem to="/admin/orders" icon={<ShoppingBag className="h-4 w-4" />} label="Orders" />
          <NavItem to="/admin/customers" icon={<Users className="h-4 w-4" />} label="Customers" />
          <NavItem to="/admin/coupons" icon={<Tag className="h-4 w-4" />} label="Coupons" />
          <NavItem to="/admin/reports" icon={<BarChart3 className="h-4 w-4" />} label="Reports" />
          <NavItem to="/admin/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </SiteLayout>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      activeProps={{ className: "bg-primary text-primary-foreground" }}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
