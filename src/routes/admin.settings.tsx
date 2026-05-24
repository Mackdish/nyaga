import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

type SettingKey = "general" | "payments" | "shipping" | "tax";

interface Setting { key: SettingKey; value: any; }

function SettingsPage() {
  const [settings, setSettings] = useState<Record<SettingKey, any>>({ general: {}, payments: {}, shipping: { zones: [] }, tax: {} });
  const [tab, setTab] = useState<SettingKey>("general");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("store_settings").select("*");
      if (error) return toast.error(error.message);
      const map: any = {};
      ((data as Setting[]) ?? []).forEach((s) => { map[s.key] = s.value; });
      setSettings({ general: map.general ?? {}, payments: map.payments ?? {}, shipping: map.shipping ?? { zones: [] }, tax: map.tax ?? {} });
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const rows = (Object.keys(settings) as SettingKey[]).map((key) => ({ key, value: settings[key], updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("store_settings").upsert(rows);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
  };

  const update = (k: SettingKey, patch: any) => setSettings((s) => ({ ...s, [k]: { ...s[k], ...patch } }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Store Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your storefront.</p>
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-brand disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="flex flex-wrap gap-1 border-b">
        {(["general", "payments", "shipping", "tax"] as SettingKey[]).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {k}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        {tab === "general" && (
          <>
            <Row label="Store name"><input value={settings.general.store_name ?? ""} onChange={(e) => update("general", { store_name: e.target.value })} className="input" /></Row>
            <Row label="Currency"><input value={settings.general.currency ?? ""} onChange={(e) => update("general", { currency: e.target.value })} className="input" /></Row>
            <Row label="Address"><input value={settings.general.store_address ?? ""} onChange={(e) => update("general", { store_address: e.target.value })} className="input" /></Row>
            <Row label="Phone"><input value={settings.general.store_phone ?? ""} onChange={(e) => update("general", { store_phone: e.target.value })} className="input" /></Row>
            <Row label="Email"><input value={settings.general.store_email ?? ""} onChange={(e) => update("general", { store_email: e.target.value })} className="input" /></Row>
          </>
        )}
        {tab === "payments" && (
          <>
            <p className="text-xs text-muted-foreground">Toggle payment gateways. Live processing requires gateway credentials.</p>
            {[
              { k: "mpesa", label: "M-Pesa (Daraja)" },
              { k: "stripe", label: "Stripe (Cards)" },
              { k: "paypal", label: "PayPal" },
              { k: "cod", label: "Cash on Delivery" },
              { k: "bank_transfer", label: "Bank Transfer" },
            ].map((g) => (
              <label key={g.k} className="flex items-center justify-between border-b py-2">
                <span className="font-medium">{g.label}</span>
                <input type="checkbox" checked={!!settings.payments[g.k]} onChange={(e) => update("payments", { [g.k]: e.target.checked })} className="h-5 w-5" />
              </label>
            ))}
          </>
        )}
        {tab === "shipping" && (
          <>
            <p className="text-xs text-muted-foreground mb-2">Shipping zones and base fee.</p>
            {(settings.shipping.zones ?? []).map((z: any, idx: number) => (
              <div key={idx} className="flex gap-2 items-center">
                <input value={z.name} onChange={(e) => {
                  const zones = [...settings.shipping.zones];
                  zones[idx] = { ...zones[idx], name: e.target.value };
                  update("shipping", { zones });
                }} className="input flex-1" placeholder="Zone name" />
                <input type="number" value={z.fee} onChange={(e) => {
                  const zones = [...settings.shipping.zones];
                  zones[idx] = { ...zones[idx], fee: Number(e.target.value) };
                  update("shipping", { zones });
                }} className="input w-32" placeholder="Fee (KSh)" />
                <button onClick={() => update("shipping", { zones: settings.shipping.zones.filter((_: any, i: number) => i !== idx) })} className="text-destructive text-sm">Remove</button>
              </div>
            ))}
            <button onClick={() => update("shipping", { zones: [...(settings.shipping.zones ?? []), { name: "", fee: 0 }] })} className="text-sm text-primary font-medium">+ Add zone</button>
          </>
        )}
        {tab === "tax" && (
          <>
            <Row label="VAT %"><input type="number" value={settings.tax.vat_percent ?? 0} onChange={(e) => update("tax", { vat_percent: Number(e.target.value) })} className="input" /></Row>
            <Row label="Prices include tax">
              <input type="checkbox" checked={!!settings.tax.prices_include_tax} onChange={(e) => update("tax", { prices_include_tax: e.target.checked })} className="h-5 w-5" />
            </Row>
          </>
        )}
      </div>

      <style>{`.input{display:block;width:100%;height:2.5rem;padding:0 .75rem;border:1px solid hsl(var(--border));border-radius:.375rem;background:hsl(var(--background));font-size:.875rem;}`}</style>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-[180px_1fr] gap-2 sm:items-center">
      <label className="text-sm font-medium">{label}</label>
      <div>{children}</div>
    </div>
  );
}
