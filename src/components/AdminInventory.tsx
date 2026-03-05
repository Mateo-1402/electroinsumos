import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Save, Search, AlertTriangle, PackageX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { productSchema } from "@/lib/validation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import CategoryCombobox from "@/components/CategoryCombobox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  specifications: string | null;
  price: number;
  unit: string | null;
  stock: number;
  min_stock: number;
  image_url: string | null;
}

const EMPTY: Omit<Product, "id"> = {
  code: "",
  name: "",
  category: "",
  specifications: "",
  price: 0,
  unit: "unidad",
  stock: 0,
  min_stock: 5,
  image_url: null,
};

const AdminInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOnlyOutOfStock, setShowOnlyOutOfStock] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("stock", { ascending: true }).order("name");
    setProducts((data as Product[]) || []);
    setLoaded(true);
  };

  // Initial load
  if (!loaded) fetchProducts();

  // Derived data
  const criticalProducts = useMemo(
    () => products.filter((p) => p.stock <= (p.min_stock ?? 5)),
    [products]
  );

  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => map.set(p.category, (map.get(p.category) || 0) + 1));
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (showOnlyOutOfStock) result = result.filter((p) => p.stock === 0);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, selectedCategory, showOnlyOutOfStock, searchTerm]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      code: p.code, name: p.name, category: p.category,
      specifications: p.specifications || "", price: p.price,
      unit: p.unit, stock: p.stock, min_stock: p.min_stock ?? 5,
      image_url: p.image_url,
    });
    setImagePreview(p.image_url);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const validation = productSchema.safeParse(form);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    const payload = { ...validation.data, min_stock: form.min_stock };
    if (editId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Producto actualizado ✅");
    } else {
      const { error } = await supabase.from("products").insert(payload as any);
      if (error) { toast.error(error.message); return; }
      toast.success("Producto creado ✅");
    }
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); setDeleteId(null); return; }
    toast.success("Producto eliminado");
    setDeleteId(null);
    fetchProducts();
  };

  const stockIcon = (p: Product) => {
    if (p.stock === 0) return <PackageX size={14} className="text-destructive" />;
    if (p.stock <= (p.min_stock ?? 5)) return <AlertTriangle size={14} className="text-amber-500" />;
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Critical Stock Alert */}
      {criticalProducts.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <h3 className="font-semibold text-destructive flex items-center gap-2 mb-3">
            <AlertTriangle size={18} /> Alerta de Stock Crítico ({criticalProducts.length} productos)
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {criticalProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border border-destructive/20 bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => openEdit(p)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {stockIcon(p)}
                  <span className="truncate font-medium">{p.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-mono font-bold ${p.stock === 0 ? "text-destructive" : "text-amber-600"}`}>
                    {p.stock} {p.unit || "un"}
                  </span>
                  <Badge variant="destructive" className="text-[10px] px-1.5">Requiere Compra</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Search & Controls */}
      <div className="sticky top-0 z-10 bg-background py-3 border-b border-border flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="out-of-stock" checked={showOnlyOutOfStock} onCheckedChange={setShowOnlyOutOfStock} />
          <Label htmlFor="out-of-stock" className="text-sm whitespace-nowrap">Solo agotados</Label>
        </div>
        <Button size="sm" onClick={openAdd} className="gap-1"><Plus size={16} /> Agregar</Button>
      </div>

      {/* Main Layout: Sidebar + Table */}
      <div className="flex gap-4">
        {/* Category Sidebar */}
        <aside className="hidden md:block w-48 shrink-0 sticky top-16 self-start">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <nav className="space-y-0.5">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                  !selectedCategory ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
                }`}
              >
                Todos ({products.length})
              </button>
              {categoryStats.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === cat ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
                  }`}
                >
                  {cat} ({count})
                </button>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Table */}
        <div className="flex-1 overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="text-left p-3 font-medium">Código</th>
                <th className="text-left p-3 font-medium">Nombre</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Categoría</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Especificaciones</th>
                <th className="text-right p-3 font-medium">Precio</th>
                <th className="text-right p-3 font-medium">Stock</th>
                <th className="text-right p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className={`border-t border-border ${
                    p.stock === 0
                      ? "bg-destructive/10"
                      : p.stock <= (p.min_stock ?? 5)
                      ? "bg-amber-50 dark:bg-amber-950/20"
                      : ""
                  }`}
                >
                  <td className="p-3 font-mono text-xs">{p.code}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {stockIcon(p)}
                      {p.name}
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{p.category}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">{p.specifications}</td>
                  <td className="p-3 text-right font-semibold">${(p.price ?? 0).toFixed(2)}</td>
                  <td className={`p-3 text-right font-semibold ${
                    p.stock === 0 ? "text-destructive" : p.stock <= (p.min_stock ?? 5) ? "text-amber-600" : ""
                  }`}>
                    {p.stock} {p.unit || "un"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No se encontraron productos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editId ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Código" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <CategoryCombobox
              value={form.category}
              onChange={(val) => setForm({ ...form, category: val })}
              existingCategories={[...new Set(products.map((p) => p.category))]}
            />
            <Input placeholder="Especificaciones" value={form.specifications || ""} onChange={(e) => setForm({ ...form, specifications: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              <div className="space-y-1">
                <Input placeholder="Unidad" value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                <span className="text-[10px] text-muted-foreground px-1">lb, mt, un</span>
              </div>
              <Input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Stock Mínimo (alerta)</Label>
                <Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end">
                <Badge variant={form.stock <= form.min_stock ? "destructive" : "secondary"} className="mb-2">
                  {form.stock <= form.min_stock ? "⚠ Bajo mínimo" : "✓ Stock OK"}
                </Badge>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">URL de imagen</Label>
              <Input
                placeholder="https://..."
                value={form.image_url || ""}
                onChange={(e) => {
                  const url = e.target.value;
                  setForm((prev) => ({ ...prev, image_url: url || null }));
                  setImagePreview(url || null);
                }}
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-contain rounded border border-border" onError={() => setImagePreview(null)} />
              )}
            </div>

            <Button onClick={handleSave} className="w-full gap-1"><Save size={16} /> Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminInventory;
