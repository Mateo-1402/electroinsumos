import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  name: string;
  specifications: string | null;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string | null;
  total_price: number | null;
  status: string;
  items: OrderItem[];
  created_at: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data as unknown as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const confirmOrder = async (order: Order) => {
    setConfirming(order.id);
    try {
      // Update stock for each item
      for (const item of order.items) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (product) {
          const newStock = Math.max(0, (product.stock || 0) - item.quantity);
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.id);
        }
      }

      // Mark order as completed
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", order.id);

      if (error) throw error;
      toast.success("Venta confirmada y stock actualizado");
      fetchOrders();
    } catch (err: any) {
      toast.error("Error al confirmar: " + err.message);
    } finally {
      setConfirming(null);
    }
  };

  const cancelOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Pedido cancelado");
    fetchOrders();
  };

  const pending = orders.filter((o) => o.status === "pending");
  const completed = orders.filter((o) => o.status === "completed");
  const cancelled = orders.filter((o) => o.status === "cancelled");

  if (loading) return <div className="py-8 text-center text-muted-foreground">Cargando pedidos...</div>;

  return (
    <div className="space-y-6">
      {/* Pending Orders */}
      <section>
        <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-3">
          <Clock size={18} className="text-primary" /> Pedidos Pendientes ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay pedidos pendientes.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onConfirm={() => confirmOrder(order)}
                onCancel={() => cancelOrder(order.id)}
                confirming={confirming === order.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-accent" /> Completados ({completed.length})
          </h3>
          <div className="space-y-3">
            {completed.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {/* Cancelled */}
      {cancelled.length > 0 && (
        <section>
          <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-3">
            <XCircle size={18} className="text-destructive" /> Cancelados ({cancelled.length})
          </h3>
          <div className="space-y-3">
            {cancelled.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const OrderCard = ({
  order,
  onConfirm,
  onCancel,
  confirming,
}: {
  order: { id: string; customer_name: string | null; total_price: number | null; status: string; items: OrderItem[]; created_at: string };
  onConfirm?: () => void;
  onCancel?: () => void;
  confirming?: boolean;
}) => {
  const date = new Date(order.created_at);
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-sm">{order.customer_name || "Cliente anónimo"}</p>
          <p className="text-xs text-muted-foreground">
            {date.toLocaleDateString("es-EC")} {date.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <span className="text-lg font-bold text-primary">${(order.total_price || 0).toFixed(2)}</span>
      </div>
      <div className="space-y-1 mb-3">
        {order.items.map((item, i) => (
          <p key={i} className="text-xs text-muted-foreground">
            {item.quantity}x {item.name} {item.specifications ? `(${item.specifications})` : ""} — ${(item.price * item.quantity).toFixed(2)}
          </p>
        ))}
      </div>
      {order.status === "pending" && onConfirm && onCancel && (
        <div className="flex gap-2">
          <Button size="sm" onClick={onConfirm} disabled={confirming} className="gap-1 flex-1">
            <CheckCircle size={14} /> {confirming ? "Procesando..." : "Confirmar Venta"}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
            <XCircle size={14} /> Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
