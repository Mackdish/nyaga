import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/catalog";
import { resolveCategorySlug } from "@/lib/products-api";
import { seedDefaultProductsToDb } from "@/lib/seed-catalog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Search, RefreshCw, Upload, X, FileUp, FileDown, Settings2, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: AdminProductsPage,
});

type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type FormState = {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  low_stock_threshold: string;
  image_url: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  category: CATEGORIES[0]?.slug ?? "laptops-desktops",
  price: "0",
  stock: "0",
  low_stock_threshold: "5",
  image_url: "",
  active: true,
};

const KES = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);

  async function restoreDefaultCatalog() {
    setRestoring(true);
    try {
      const result = await seedDefaultProductsToDb();
      if (result.inserted === 0 && result.failed === 0) {
        toast.info("Default catalog is already in the database");
      } else if (result.failed > 0) {
        toast.warning(`Restored ${result.inserted} product(s); ${result.failed} failed`);
      } else {
        toast.success(`Restored ${result.inserted} default product(s)`);
      }
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setRestoring(false);
    }
  }

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load products");
    else setProducts((data as Product[]) ?? []);
    setLoading(false);
    return (data as Product[]) ?? [];
  }

  useEffect(() => {
    load().then(async (rows) => {
      if (rows.length > 0) return;
      setRestoring(true);
      try {
        const result = await seedDefaultProductsToDb();
        if (result.inserted > 0) {
          toast.success(`Restored ${result.inserted} default product(s)`);
          await load();
        }
      } catch (e) {
        console.warn("[admin] Auto-restore skipped:", e);
      } finally {
        setRestoring(false);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    );
  }, [products, search]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setOpen(true);
  }

  async function handleDelete(id: string) {
    const prev = products;
    setProducts((curr) => curr.filter((p) => p.id !== id));
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
      setProducts(prev);
    } else {
      toast.success("Product deleted");
    }
  }

  async function toggleActive(p: Product) {
    const next = !p.active;
    setProducts((curr) => curr.map((x) => (x.id === p.id ? { ...x, active: next } : x)));
    const { error } = await supabase.from("products").update({ active: next }).eq("id", p.id);
    if (error) {
      toast.error("Update failed");
      setProducts((curr) => curr.map((x) => (x.id === p.id ? { ...x, active: p.active } : x)));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your catalog, stock, and pricing.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={restoreDefaultCatalog} disabled={restoring || loading}>
            <RotateCcw className={`h-4 w-4 ${restoring ? "animate-spin" : ""}`} />
            Restore default catalog
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCsv(products)}>
            <FileDown className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <FileUp className="h-4 w-4" />
            Import CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                New product
              </Button>
            </DialogTrigger>
            <ProductDialog
              key={editing?.id ?? "new"}
              editing={editing}
              onClose={() => setOpen(false)}
              onSaved={(saved) => {
                setProducts((curr) => {
                  const idx = curr.findIndex((p) => p.id === saved.id);
                  if (idx === -1) return [saved, ...curr];
                  const copy = curr.slice();
                  copy[idx] = saved;
                  return copy;
                });
                setOpen(false);
              }}
            />
          </Dialog>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-4 py-2">
          <div className="text-sm font-medium">{selected.size} selected</div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>
              <Settings2 className="h-4 w-4" />
              Bulk edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selected.size} product(s)?</AlertDialogTitle>
                  <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    const ids = Array.from(selected);
                    const prev = products;
                    setProducts((c) => c.filter((p) => !selected.has(p.id)));
                    setSelected(new Set());
                    const { error } = await supabase.from("products").delete().in("id", ids);
                    if (error) { toast.error("Bulk delete failed"); setProducts(prev); }
                    else toast.success(`Deleted ${ids.length} product(s)`);
                  }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      <BulkEditDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        ids={Array.from(selected)}
        onApplied={(updates) => {
          setProducts((curr) => curr.map((p) => selected.has(p.id) ? { ...p, ...updates } : p));
          setSelected(new Set());
          setBulkOpen(false);
        }}
      />

      <ImportCsvDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => { setImportOpen(false); load(); }}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Catalog ({filtered.length})</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or category…"
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
            <p className="py-12 text-center text-sm text-muted-foreground">No products found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={filtered.length > 0 && filtered.every((p) => selected.has(p.id))}
                        onCheckedChange={(v) => {
                          const next = new Set(selected);
                          if (v) filtered.forEach((p) => next.add(p.id));
                          else filtered.forEach((p) => next.delete(p.id));
                          setSelected(next);
                        }}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const low = p.stock <= p.low_stock_threshold;
                    return (
                      <TableRow key={p.id} data-state={selected.has(p.id) ? "selected" : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(p.id)}
                            onCheckedChange={(v) => {
                              const next = new Set(selected);
                              if (v) next.add(p.id); else next.delete(p.id);
                              setSelected(next);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="h-10 w-10 rounded object-cover bg-muted"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-muted" />
                            )}
                            <div>
                              <div className="font-medium text-sm">{p.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                #{p.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {CATEGORIES.find((c) => c.slug === p.category)?.name ??
                            CATEGORIES.find((c) => c.name.toLowerCase() === p.category.toLowerCase())?.name ??
                            p.category}
                        </TableCell>
                        <TableCell className="font-semibold">{KES.format(Number(p.price))}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{p.stock}</span>
                            {low && <Badge variant="destructive">Low</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch checked={p.active} onCheckedChange={() => toggleActive(p)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete “{p.name}”?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This permanently removes the product from the catalog.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(p.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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

function ProductDialog({
  editing,
  onClose,
  onSaved,
}: {
  editing: Product | null;
  onClose: () => void;
  onSaved: (p: Product) => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    editing
      ? {
          name: editing.name,
          description: editing.description ?? "",
          category: resolveCategorySlug(editing.category),
          price: String(editing.price),
          stock: String(editing.stock),
          low_stock_threshold: String(editing.low_stock_threshold),
          image_url: editing.image_url ?? "",
          active: editing.active,
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) {
      toast.error("Name and category are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category.trim(),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 0,
      image_url: form.image_url.trim() || null,
      active: form.active,
    };

    if (editing) {
      const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editing.id)
        .select()
        .single();
      setSaving(false);
      if (error) return toast.error("Update failed");
      toast.success("Product updated");
      onSaved(data as Product);
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select().single();
      setSaving(false);
      if (error) return toast.error("Create failed");
      toast.success("Product created");
      onSaved(data as Product);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Products appear on the matching category page on the storefront.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="price">Price (KES)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="low">Low at</Label>
            <Input
              id="low"
              type="number"
              min="0"
              value={form.low_stock_threshold}
              onChange={(e) => set("low_stock_threshold", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Product image</Label>
          <ImageUploader
            value={form.image_url}
            onChange={(url) => set("image_url", url)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label htmlFor="active" className="text-sm">Active</Label>
            <p className="text-xs text-muted-foreground">Visible to customers</p>
          </div>
          <Switch id="active" checked={form.active} onCheckedChange={(v) => set("active", v)} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? "Save changes" : "Create product"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (error) {
      setUploading(false);
      toast.error(error.message || "Upload failed");
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    toast.success("Image uploaded");
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-32 h-32 rounded-md border bg-muted overflow-hidden">
          <img src={value} alt="Product" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-background/90 rounded-full p-1 hover:bg-background"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 rounded-md border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Upload</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
      )}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste an image URL"
        className="text-xs"
      />
    </div>
  );
}

// ---------- CSV helpers ----------
function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const CSV_COLS = ["id", "name", "category", "price", "stock", "low_stock_threshold", "image_url", "active", "description"] as const;

function exportCsv(products: Product[]) {
  const rows = [CSV_COLS.join(",")];
  for (const p of products) {
    rows.push(CSV_COLS.map((c) => csvEscape((p as any)[c])).join(","));
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${products.length} product(s)`);
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let val = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { val += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else val += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { cur.push(val); val = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (val !== "" || cur.length) { cur.push(val); rows.push(cur); cur = []; val = ""; }
        if (ch === "\r" && text[i + 1] === "\n") i++;
      } else val += ch;
    }
  }
  if (val !== "" || cur.length) { cur.push(val); rows.push(cur); }
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).filter((r) => r.some((c) => c.trim() !== "")).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = r[i] ?? ""; });
    return obj;
  });
}

// ---------- Bulk edit dialog ----------
type BulkUpdates = Partial<Pick<Product, "category" | "price" | "stock" | "low_stock_threshold" | "active">>;

function BulkEditDialog({
  open, onOpenChange, ids, onApplied,
}: { open: boolean; onOpenChange: (v: boolean) => void; ids: string[]; onApplied: (u: BulkUpdates) => void }) {
  const [fields, setFields] = useState({
    category: false, price: false, stock: false, low: false, active: false,
  });
  const [vals, setVals] = useState({ category: "", price: "0", stock: "0", low: "5", active: true });
  const [saving, setSaving] = useState(false);

  async function apply() {
    const updates: BulkUpdates = {};
    if (fields.category && vals.category.trim()) updates.category = vals.category.trim();
    if (fields.price) updates.price = Number(vals.price) || 0;
    if (fields.stock) updates.stock = Number(vals.stock) || 0;
    if (fields.low) updates.low_stock_threshold = Number(vals.low) || 0;
    if (fields.active) updates.active = vals.active;
    if (Object.keys(updates).length === 0) { toast.error("Pick at least one field"); return; }
    setSaving(true);
    const { error } = await supabase.from("products").update(updates).in("id", ids);
    setSaving(false);
    if (error) return toast.error("Bulk update failed");
    toast.success(`Updated ${ids.length} product(s)`);
    onApplied(updates);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk edit {ids.length} product(s)</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <BulkRow checked={fields.category} onCheck={(v) => setFields((f) => ({ ...f, category: v }))} label="Category">
            <Input value={vals.category} onChange={(e) => setVals((v) => ({ ...v, category: e.target.value }))} />
          </BulkRow>
          <BulkRow checked={fields.price} onCheck={(v) => setFields((f) => ({ ...f, price: v }))} label="Price (KES)">
            <Input type="number" min="0" value={vals.price} onChange={(e) => setVals((v) => ({ ...v, price: e.target.value }))} />
          </BulkRow>
          <BulkRow checked={fields.stock} onCheck={(v) => setFields((f) => ({ ...f, stock: v }))} label="Stock">
            <Input type="number" min="0" value={vals.stock} onChange={(e) => setVals((v) => ({ ...v, stock: e.target.value }))} />
          </BulkRow>
          <BulkRow checked={fields.low} onCheck={(v) => setFields((f) => ({ ...f, low: v }))} label="Low stock at">
            <Input type="number" min="0" value={vals.low} onChange={(e) => setVals((v) => ({ ...v, low: e.target.value }))} />
          </BulkRow>
          <BulkRow checked={fields.active} onCheck={(v) => setFields((f) => ({ ...f, active: v }))} label="Active">
            <Switch checked={vals.active} onCheckedChange={(b) => setVals((v) => ({ ...v, active: b }))} />
          </BulkRow>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={apply} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkRow({ checked, onCheck, label, children }: { checked: boolean; onCheck: (v: boolean) => void; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox checked={checked} onCheckedChange={(v) => onCheck(!!v)} />
      <Label className="w-32 text-sm">{label}</Label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ---------- Import CSV dialog ----------
function ImportCsvDialog({
  open, onOpenChange, onImported,
}: { open: boolean; onOpenChange: (v: boolean) => void; onImported: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ inserted: number; updated: number; failed: number } | null>(null);

  async function handleFile(f: File) {
    const t = await f.text();
    setText(t);
  }

  async function runImport() {
    const rows = parseCsv(text);
    if (rows.length === 0) { toast.error("No rows found"); return; }
    setBusy(true);
    let inserted = 0, updated = 0, failed = 0;
    for (const r of rows) {
      const payload: any = {
        name: (r.name || "").trim(),
        category: (r.category || "").trim(),
        description: (r.description || "").trim() || null,
        price: Number(r.price) || 0,
        stock: Number(r.stock) || 0,
        low_stock_threshold: Number(r.low_stock_threshold) || 5,
        image_url: (r.image_url || "").trim() || null,
        active: r.active === undefined || r.active === "" ? true : ["true", "1", "yes", "y"].includes(r.active.toLowerCase()),
      };
      if (!payload.name || !payload.category) { failed++; continue; }
      const id = (r.id || "").trim();
      if (id) {
        const { error } = await supabase.from("products").update(payload).eq("id", id);
        if (error) failed++; else updated++;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) failed++; else inserted++;
      }
    }
    setBusy(false);
    setResult({ inserted, updated, failed });
    toast.success(`Imported: ${inserted} new, ${updated} updated, ${failed} failed`);
    if (failed === 0) onImported();
  }

  function downloadTemplate() {
    const sample = [
      CSV_COLS.join(","),
      `,"Sample Laptop","Laptops",75000,10,5,,true,"Optional description"`,
      `,"Sample Phone","Phones",25000,20,5,,true,`,
    ].join("\n");
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setText(""); setResult(null); } }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import / update products from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1.5">
            <p><strong>Quick price &amp; stock update:</strong> Click <em>Export CSV</em> first to get all your products with their IDs. Edit the <code>price</code> and <code>stock</code> columns in Excel/Sheets, save as CSV, then upload here. Rows with an <code>id</code> are <strong>updated</strong>; rows without an <code>id</code> are <strong>created</strong>.</p>
            <p className="text-muted-foreground">
              Required for new rows: <code>name</code>, <code>category</code>. Optional: <code>price, stock, low_stock_threshold, image_url, active, description</code>.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
              <FileDown className="h-4 w-4" /> Download template
            </Button>
            <Input type="file" accept=".csv,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="flex-1" />
          </div>
          <Textarea
            placeholder="…or paste CSV here"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="font-mono text-xs"
          />
          {result && (
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <div>✅ Inserted: <strong>{result.inserted}</strong></div>
              <div>✏️ Updated: <strong>{result.updated}</strong></div>
              <div>❌ Failed: <strong>{result.failed}</strong></div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={runImport} disabled={busy || !text.trim()}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
