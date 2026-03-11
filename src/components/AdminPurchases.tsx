import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Minus, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string; code: string; name: string; specifications: string | null; price: number; unit: string | null; stock: number;
}
interface Provider {
  id: string; name: string;
}
interface PurchaseItem {
  id: string; name: string; specifications: string | null; quantity: number; cost_per_unit: number;
}

const AdminPurchases = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("providers").select("id, name").order("name"),
    ]).then(([prodRes, provRes]) => {
      setProducts((prodRes.data as Product[]) || []);
      setProviders((provRes.data as Provider[]) || []);
    });
  }, []);

  const filtered = search.length >= 2
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 10)
    : [];

  const addItem = (p: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) return prev.map((i) => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: p.id, name: p.name, specifications: p.specifications, quantity: 1, cost_per_unit: p.price ?? 0 }];
    });
    setSearch("");
  };

  const updateQty = (id: string, delta: number) => {
    setItems((prev) => prev.map((i) => {
      if (i.id !== id) return i;
      const q = i.quantity + delta;
      return q <= 0 ? null : { ...i, quantity: q };
    }).filter(Boolean) as PurchaseItem[]);
  };

  const updateCost = (id: string, val: string) => {
    const cost = parseFloat(val);
    if (isNaN(cost) || cost < 0) return;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, cost_per_unit: cost } : i));
  };

  const total = items.reduce((s, i) => s + i.cost_per_unit * i.quantity, 0);

  const finalize = async () => {
    if (!selectedProvider) { toast.error("Selecciona un proveedor"); return; }
    if (items.length === 0) { toast.error("Agrega productos"); return; }
    setProcessing(true);
    try {
      const payload = items.map((i) => ({
        id: i.id, name: i.name, specifications: i.specifications, quantity: i.quantity, cost_per_unit: i.cost_per_unit,
      }));

      const { error } = await supabase.rpc("create_purchase", {
        p_provider_id: selectedProvider,
        p_items: payload,
        p_total_cost: total,
        p_notes: null,
      });
      if (error) throw error;
      toast.success("¡Compra registrada y stock actualizado! 📦");
      setItems([]);
      const { data } = await supabase.from("products").select("*").order("name");
      setProducts((data as Product[]) || []);
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-sm">
        <Label className="text-sm font-medium">Proveedor</Label>
        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger><SelectValue placeholder="Seleccionar proveedor..." /></SelectTrigger>
          <SelectContent>
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-lg">Buscar Producto</h3>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Nombre o código..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {filtered.length > 0 && (
            <div className="border border-border rounded-lg divide-y divide-border max-h-96 overflow-y-auto">
              {filtered.map((p) => (
                <button key={p.id} onClick={() => addItem(p)} className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.code} {p.specifications ? `· ${p.specifications}` : ""}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-semibold text-sm">${(p.price ?? 0).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Stock: {p.stock ?? 0}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Items list */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <ShoppingCart size={18} className="text-primary" /> Compra Actual
          </h3>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">Busca y agrega productos a la compra</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-3 bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      {item.specifications && <p className="text-xs text-muted-foreground">{item.specifications}</p>}
                    </div>
                    <button onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={14} /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded bg-muted hover:bg-muted/80"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded bg-muted hover:bg-muted/80"><Plus size={14} /></button>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Costo unitario</label>
                      <Input type="number" step="0.01" value={item.cost_per_unit.toFixed(2)} onChange={(e) => updateCost(item.id, e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Compra:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
              <Button onClick={finalize} disabled={processing} className="w-full gap-2" size="lg">
                {processing ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                {processing ? "Procesando..." : "Registrar Compra"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPurchases;
