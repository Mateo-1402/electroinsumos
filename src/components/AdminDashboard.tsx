import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Package, TrendingUp, AlertTriangle } from "lucide-react";

interface Product {
  id: string;
  price: number;
  stock: number;
  min_stock: number;
}

interface Order {
  total_final_pagado: number | null;
  total_price: number | null;
  source: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [prodRes, ordRes] = await Promise.all([
        supabase.from("products").select("id, price, stock, min_stock"),
        supabase.from("orders").select("total_final_pagado, total_price, source, created_at").eq("status", "completed"),
      ]);
      setProducts((prodRes.data as Product[]) || []);
      setOrders((ordRes.data as unknown as Order[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyRevenue = orders
      .filter((o) => o.source !== "workshop" && new Date(o.created_at) >= today)
      .reduce((sum, o) => sum + (o.total_final_pagado ?? o.total_price ?? 0), 0);

    const totalSKU = products.length;
    const inventoryValue = products.reduce((sum, p) => sum + (p.price ?? 0) * (p.stock ?? 0), 0);
    const lowStock = products.filter((p) => (p.stock ?? 0) <= (p.min_stock ?? 5)).length;

    return { dailyRevenue, totalSKU, inventoryValue, lowStock };
  }, [products, orders]);

  if (loading) return <div className="py-8 text-center text-muted-foreground">Cargando dashboard...</div>;

  const cards = [
    { label: "Ventas del Día", value: `$${stats.dailyRevenue.toFixed(2)}`, icon: DollarSign, color: "text-accent" },
    { label: "Productos en Inventario", value: stats.totalSKU.toString(), icon: Package, color: "text-primary" },
    { label: "Valor Inventario", value: `$${stats.inventoryValue.toFixed(2)}`, icon: TrendingUp, color: "text-blue-500" },
    { label: "Stock Bajo", value: stats.lowStock.toString(), icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`rounded-xl bg-muted p-3 ${c.color}`}>
                <c.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-display font-bold">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Traffic Light */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "🔴 Agotado (0)", items: products.filter((p) => (p.stock ?? 0) === 0), bg: "bg-destructive/5 border-destructive/20" },
          { title: "🟠 Bajo Stock", items: products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= (p.min_stock ?? 5)), bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" },
          { title: "🟢 OK", items: products.filter((p) => (p.stock ?? 0) > (p.min_stock ?? 5)), bg: "bg-accent/5 border-accent/20" },
        ].map((group) => (
          <Card key={group.title} className={`rounded-2xl border ${group.bg}`}>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">{group.title} ({group.items.length})</h3>
              <p className="text-3xl font-display font-bold">{group.items.length}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
