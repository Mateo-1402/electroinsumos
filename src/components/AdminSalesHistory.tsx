import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Smartphone, Store, Wrench } from "lucide-react";

interface HistoryOrder {
  id: string; customer_name: string | null; total_price: number | null;
  total_final_pagado: number | null; source: string; created_at: string; items: any[];
}

const AdminSalesHistory = () => {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from("orders").select("*").eq("status", "completed").order("created_at", { ascending: false });
      setOrders((data as unknown as HistoryOrder[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const { weeklyRevenue, workshopUnits } = useMemo(() => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const recent = orders.filter((o) => new Date(o.created_at) >= weekAgo);
    const revenue = recent.filter((o) => o.source !== "workshop").reduce((s, o) => s + (o.total_final_pagado ?? o.total_price ?? 0), 0);
    const units = recent.filter((o) => o.source === "workshop").reduce((s, o) => s + (o.items as any[]).reduce((a: number, i: any) => a + (i.quantity || 0), 0), 0);
    return { weeklyRevenue: revenue, workshopUnits: units };
  }, [orders]);

  if (loading) return <div className="py-8 text-center text-muted-foreground">Cargando historial...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 md:p-5 flex items-center gap-3 md:gap-4">
          <div className="rounded-full bg-accent/20 p-2.5 md:p-3"><TrendingUp size={20} className="text-accent" /></div>
          <div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">Ventas Semanales</p>
            <p className="text-xl md:text-2xl font-display font-bold text-foreground">${weeklyRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 md:p-5 flex items-center gap-3 md:gap-4">
          <div className="rounded-full bg-primary/20 p-2.5 md:p-3"><Wrench size={20} className="text-primary" /></div>
          <div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">Consumo Taller (7d)</p>
            <p className="text-xl md:text-2xl font-display font-bold text-foreground">{workshopUnits} unidades</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay ventas completadas aún.</p>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {orders.map((order) => {
            const date = new Date(order.created_at);
            const finalPrice = order.total_final_pagado ?? order.total_price ?? 0;
            return (
              <div key={order.id} className="border border-border rounded-lg p-3 md:p-4 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{order.customer_name || "Anónimo"}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full ${
                        order.source === 'physical' ? 'bg-primary/10 text-primary' :
                        order.source === 'workshop' ? 'bg-muted text-muted-foreground' : 'bg-accent/10 text-accent'
                      }`}>
                        {order.source === 'physical' ? <Store size={10} /> : order.source === 'workshop' ? <Wrench size={10} /> : <Smartphone size={10} />}
                        {order.source === 'physical' ? 'POS' : order.source === 'workshop' ? 'Taller' : 'WA'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{date.toLocaleDateString("es-EC")} {date.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base md:text-lg font-bold text-primary">${finalPrice.toFixed(2)}</span>
                    {order.total_final_pagado != null && order.total_final_pagado !== order.total_price && (
                      <p className="text-xs text-muted-foreground line-through">${(order.total_price || 0).toFixed(2)}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-0.5">
                  {(order.items as any[]).map((item: any, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground truncate">
                      {item.quantity}x {item.name} {item.specifications ? `(${item.specifications})` : ""}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSalesHistory;
