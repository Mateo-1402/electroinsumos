import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, Trash2, Wrench, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string; code: string; name: string; category: string;
  specifications: string | null; price: number; unit: string | null; stock: number;
}

interface UsageItem {
  id: string; name: string; specifications: string | null; quantity: number; maxStock: number;
}

const AdminWorkshop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [usageItems, setUsageItems] = useState<UsageItem[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      setProducts((data as Product[]) || []);
    };
    fetchProducts();
  }, []);

  const filtered = search.length >= 2
    ? products.filter(
        (p) => p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.code.toLowerCase().includes(search.toLowerCase()) ||
          (p.specifications || "").toLowerCase().includes(search.toLowerCase())
      ).slice(0, 10)
    : [];

  const addItem = (product: Product) => {
    if (product.stock <= 0) { toast.error("Producto agotado"); return; }
    setUsageItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) { toast.error("Stock insuficiente"); return prev; }
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, specifications: product.specifications, quantity: 1, maxStock: product.stock }];
    });
    setSearch("");
  };

  const updateQty = (id: string, delta: number) => {
    setUsageItems((prev) => prev.map((i) => {
      if (i.id !== id) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > i.maxStock) { toast.error("Stock insuficiente"); return i; }
      return { ...i, quantity: newQty };
    }).filter(Boolean) as UsageItem[]);
  };

  const removeItem = (id: string) => { setUsageItems((prev) => prev.filter((i) => i.id !== id)); };

  const finalizeUsage = async () => {
    if (usageItems.length === 0) { toast.error("Agrega productos consumidos"); return; }
    setProcessing(true);
    try {
      const items = usageItems.map((i) => ({ id: i.id, name: i.name, specifications: i.specifications, quantity: i.quantity, price: 0 }));
      const { error } = await supabase.rpc("create_workshop_usage", { p_items: items });
      if (error) throw error;
      toast.success("¡Consumo de taller registrado! 🔧");
      setUsageItems([]);
      const { data } = await supabase.from("products").select("*").order("name");
      setProducts((data as Product[]) || []);
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Product Search */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="font-display font-semibold text-lg">Buscar Producto</h3>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Nombre, código o especificación..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11" enterKeyHint="search" />
        </div>
        {filtered.length > 0 && (
          <div className="border border-border rounded-lg divide-y divide-border max-h-72 md:max-h-96 overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addItem(p)}
                disabled={p.stock <= 0}
                className="w-full text-left p-3 hover:bg-muted/50 active:bg-muted transition-colors flex items-center justify-between disabled:opacity-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.code} {p.specifications ? `· ${p.specifications}` : ""}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className={`text-xs ${p.stock <= 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    {p.stock <= 0 ? "Agotado" : `Stock: ${p.stock}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
        {search.length >= 2 && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Sin resultados</p>
        )}
      </div>

      {/* Usage List */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <Wrench size={18} className="text-primary" /> Consumo Actual
        </h3>

        {usageItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
            Busca y agrega productos consumidos
          </p>
        ) : (
          <div className="space-y-2">
            {usageItems.map((item) => (
              <div key={item.id} className="border border-border rounded-lg p-3 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    {item.specifications && <p className="text-xs text-muted-foreground">{item.specifications}</p>}
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded active:scale-95"><Trash2 size={14} /></button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Cantidad:</span>
                  <button onClick={() => updateQty(item.id, -1)} className="p-2 rounded bg-muted hover:bg-muted/80 active:scale-95"><Minus size={14} /></button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="p-2 rounded bg-muted hover:bg-muted/80 active:scale-95"><Plus size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {usageItems.length > 0 && (
          <div className="border-t border-border pt-4">
            <Button onClick={finalizeUsage} disabled={processing} className="w-full gap-2 h-12 active:scale-[0.98]" size="lg">
              {processing ? <Loader2 size={18} className="animate-spin" /> : <Wrench size={18} />}
              {processing ? "Procesando..." : "Confirmar Consumo"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWorkshop;
