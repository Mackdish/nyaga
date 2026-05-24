import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/coupons")({
  component: CouponsPage,
});

interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed_cart" | "fixed_product";
  amount: number;
  minimum_spend: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  description: string | null;
}

const empty: Partial<Coupon> = { code: "", type: "percent", amount: 10, minimum_spend: 0, usage_limit: null, expires_at: null, active: true, description: "" };

function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setCoupons((data as Coupon[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.code) return;
    const payload = { ...editing, code: editing.code!.toUpperCase().trim(), amount: Number(editing.amount ?? 0), minimum_spend: Number(editing.minimum_spend ?? 0) };
    const { error } = editing.id
      ? await supabase.from("coupons").update(payload).eq("id", editing.id)
      : await supabase.from("coupons").insert(payload as any);
    if (error) return toast.error(error.message);
    toast.success("Coupon saved");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground">Create and manage discount codes.</p>
        </div>
        <button onClick={() => setEditing(empty)} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-brand">
          <Plus className="h-4 w-4" /> New coupon
        </button>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No coupons yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-right">Min spend</th>
                <th className="px-4 py-2 text-right">Used / Limit</th>
                <th className="px-4 py-2 text-left">Expires</th>
                <th className="px-4 py-2 text-center">Active</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2 font-mono font-semibold">{c.code}</td>
                  <td className="px-4 py-2">{c.type}</td>
                  <td className="px-4 py-2 text-right">{c.type === "percent" ? `${c.amount}%` : `KSh ${c.amount}`}</td>
                  <td className="px-4 py-2 text-right">KSh {c.minimum_spend}</td>
                  <td className="px-4 py-2 text-right">{c.used_count} / {c.usage_limit ?? "∞"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${c.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                      {c.active ? "Active" : "Off"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditing(c)} className="p-1 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(c.id)} className="p-1 hover:text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-card border rounded-xl p-5 w-full max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">{editing.id ? "Edit coupon" : "New coupon"}</h3>
            <Field label="Code"><input value={editing.code ?? ""} onChange={(e) => setEditing({ ...editing, code: e.target.value })} className="input" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as Coupon["type"] })} className="input">
                  <option value="percent">Percentage</option>
                  <option value="fixed_cart">Fixed cart</option>
                  <option value="fixed_product">Fixed product</option>
                </select>
              </Field>
              <Field label="Amount"><input type="number" value={editing.amount ?? 0} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })} className="input" /></Field>
              <Field label="Minimum spend (KSh)"><input type="number" value={editing.minimum_spend ?? 0} onChange={(e) => setEditing({ ...editing, minimum_spend: Number(e.target.value) })} className="input" /></Field>
              <Field label="Usage limit"><input type="number" value={editing.usage_limit ?? ""} onChange={(e) => setEditing({ ...editing, usage_limit: e.target.value ? Number(e.target.value) : null })} className="input" placeholder="Unlimited" /></Field>
              <Field label="Expires at"><input type="date" value={editing.expires_at?.slice(0,10) ?? ""} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value || null })} className="input" /></Field>
              <Field label="Active">
                <label className="flex items-center gap-2 h-10"><input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Enabled</label>
              </Field>
            </div>
            <Field label="Description"><textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input min-h-20" /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-4 h-10 border border-border rounded-md hover:bg-accent">Cancel</button>
              <button onClick={save} className="px-4 h-10 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-brand">Save</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.input{display:block;width:100%;height:2.5rem;padding:0 .75rem;border:1px solid hsl(var(--border));border-radius:.375rem;background:hsl(var(--background));font-size:.875rem;}textarea.input{height:auto;padding:.5rem .75rem;}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}
