import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Save, Search, AlertTriangle, PackageX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { productSchema } from "@/lib/validation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CategoryCombobox from "@/components/CategoryCombobox";
import ImageProcessor from "@/components/ImageProcessor";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Product {
  id: string; code: string; name: string; category: string;
  specifications: string | null; price: number; unit: string | null;
  stock: number; min_stock: number; image_url: string | null;
}

const EMPTY: Omit<Product, "id"> = {
  code: "", name: "", category: "", specifications: "", price: 0,
  unit: "unidad", stock: 0, min_stock: 5, image_url: null,
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

  if (!loaded) fetchProducts();

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
        (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, selectedCategory, showOnlyOutOfStock, searchTerm]);

  const openAdd = () => { setEditId(null); setForm(EMPTY); setImagePreview(null); setDialogOpen(true); };
  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ code: p.code, name: p.name, category: p.category, specifications: p.specifications || "", price: p.price, unit: p.unit, stock: p.stock, min_stock: p.min_stock ?? 5, image_url: p.image_url });
    setImagePreview(p.image_url);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const validation = productSchema.safeParse(form);
    if (!validation.success) { toast.error(validation.error.errors[0].message); return; }
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
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 md:p-4">
          <h3 className="font-semibold text-destructive flex items-center gap-2 mb-3 text-sm md:text-base">
            <AlertTriangle size={18} /> Alerta de Stock ({criticalProducts.length})
          </h3>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {criticalProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border border-destructive/20 bg-background px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/50 active:scale-[0.98] transition-transform"
                onClick={() => openEdit(p)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {stockIcon(p)}
                  <span className="truncate font-medium text-xs sm:text-sm">{p.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-mono font-bold text-xs ${p.stock === 0 ? "text-destructive" : "text-amber-600"}`}>
                    {p.stock}
                  </span>
                  <Badge variant="destructive" className="text-[9px] px-1 hidden sm:inline-flex">Compra</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Search & Controls */}
      <div className="sticky top-0 z-10 bg-background py-3 border-b border-border flex flex-wrap items-center gap-2 md:gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-10 md:h-9" />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="out-of-stock" checked={showOnlyOutOfStock} onCheckedChange={setShowOnlyOutOfStock} />
          <Label htmlFor="out-of-stock" className="text-xs whitespace-nowrap">Agotados</Label>
        </div>
        <Button size="sm" onClick={openAdd} className="gap-1 h-10 md:h-9 active:scale-95"><Plus size={16} /> <span className="hidden sm:inline">Agregar</span></Button>
      </div>

      {/* Main Layout */}
      <div className="flex gap-4">
        {/* Category Sidebar - desktop only */}
        <aside className="hidden md:block w-48 shrink-0 sticky top-16 self-start">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <nav className="space-y-0.5">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"}`}
              >
                Todos ({products.length})
              </button>
              {categoryStats.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${selectedCategory === cat ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"}`}
                >
                  {cat} ({count})
                </button>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Mobile: Card list, Desktop: Table */}
        <div className="flex-1">
          {/* Mobile category filter pills */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Todos
            </button>
            {categoryStats.map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {cat} ({count})
              </button>
            ))}
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-2">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className={`border border-border rounded-lg p-3 bg-card active:scale-[0.99] transition-transform ${
                  p.stock === 0 ? "border-destructive/30 bg-destructive/5" : p.stock <= (p.min_stock ?? 5) ? "border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/10" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {stockIcon(p)}
                      <p className="font-medium text-sm truncate">{p.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.code} · {p.category}</p>
                    {p.specifications && <p className="text-xs text-muted-foreground">{p.specifications}</p>}
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-semibold text-sm">${(p.price ?? 0).toFixed(2)}</p>
                    <p className={`text-xs font-bold ${p.stock === 0 ? "text-destructive" : p.stock <= (p.min_stock ?? 5) ? "text-amber-600" : "text-muted-foreground"}`}>
                      {p.stock} {p.unit || "un"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="flex-1 h-9 gap-1 active:scale-95">
                    <Pencil size={14} /> Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteId(p.id)} className="h-9 px-3 text-destructive border-destructive/30 hover:bg-destructive/10 active:scale-95">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No se encontraron productos.</p>
            )}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-3 font-medium">Código</th>
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Categoría</th>
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
                      p.stock === 0 ? "bg-destructive/10" : p.stock <= (p.min_stock ?? 5) ? "bg-amber-50 dark:bg-amber-950/20" : ""
                    }`}
                  >
                    <td className="p-3 font-mono text-xs">{p.code}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">{stockIcon(p)} {p.name}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.category}</td>
                    <td className="p-3 hidden lg:table-cell text-muted-foreground">{p.specifications}</td>
                    <td className="p-3 text-right font-semibold">${(p.price ?? 0).toFixed(2)}</td>
                    <td className={`p-3 text-right font-semibold ${p.stock === 0 ? "text-destructive" : p.stock <= (p.min_stock ?? 5) ? "text-amber-600" : ""}`}>
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
      </div>

      {/* Product Dialog - Full screen on mobile */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editId ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Código" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-11" />
            <Input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11" />
            <CategoryCombobox
              value={form.category}
              onChange={(val) => setForm({ ...form, category: val })}
              existingCategories={[...new Set(products.map((p) => p.category))]}
            />
            <Input placeholder="Especificaciones" value={form.specifications || ""} onChange={(e) => setForm({ ...form, specifications: e.target.value })} className="h-11" />
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="h-11" />
              <div className="space-y-1">
                <Input placeholder="Unidad" value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="h-11" />
                <span className="text-[10px] text-muted-foreground px-1">lb, mt, un</span>
              </div>
              <Input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Stock Mínimo</Label>
                <Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: parseInt(e.target.value) || 0 })} className="h-11" />
              </div>
              <div className="flex items-end">
                <Badge variant={form.stock <= form.min_stock ? "destructive" : "secondary"} className="mb-2">
                  {form.stock <= form.min_stock ? "⚠ Bajo mínimo" : "✓ Stock OK"}
                </Badge>
              </div>
            </div>
            <ImageProcessor
              currentUrl={form.image_url}
              onProcessed={(url) => {
                setForm((prev) => ({ ...prev, image_url: url }));
                setImagePreview(url);
              }}
            />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">O pegar URL directa</Label>
              <Input
                placeholder="https://..."
                value={form.image_url || ""}
                onChange={(e) => { const url = e.target.value; setForm((prev) => ({ ...prev, image_url: url || null })); setImagePreview(url || null); }}
                className="h-10 text-xs"
              />
            </div>
            <Button onClick={handleSave} className="w-full gap-1 h-12 active:scale-[0.98]"><Save size={16} /> Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminInventory;
