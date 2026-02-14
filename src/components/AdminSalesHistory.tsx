import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";

interface HistoryOrder {
  id: string;
  customer_name: string | null;
  total_price: number | null;
  total_final_pagado: number | null;
  created_at: string;
  items: any[];
}

const AdminSalesHistory = () => {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      setOrders((data as unknown as HistoryOrder[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const weeklyRevenue = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orders
      .filter((o) => new Date(o.created_at) >= weekAgo)
      .reduce((sum, o) => sum + (o.total_final_pagado ?? o.total_price ?? 0), 0);
  }, [orders]);

  if (loading) return <div className="py-8 text-center text-muted-foreground">Cargando historial...</div>;

  return (
    <div className="space-y-6">
      {/* Weekly Summary */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-5 flex items-center gap-4">
        <div className="rounded-full bg-accent/20 p-3">
          <TrendingUp size={24} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Resumen Semanal (últimos 7 días)</p>
          <p className="text-2xl font-display font-bold text-foreground">${weeklyRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Sales List */}
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay ventas completadas aún.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const date = new Date(order.created_at);
            const finalPrice = order.total_final_pagado ?? order.total_price ?? 0;
            return (
              <div key={order.id} className="border border-border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{order.customer_name || "Cliente anónimo"}</p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleDateString("es-EC")} {date.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">${finalPrice.toFixed(2)}</span>
                    {order.total_final_pagado != null && order.total_final_pagado !== order.total_price && (
                      <p className="text-xs text-muted-foreground line-through">${(order.total_price || 0).toFixed(2)}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  {(order.items as any[]).map((item: any, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground">
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
