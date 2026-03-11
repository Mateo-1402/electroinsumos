import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface OrderItem { id: string; name: string; specifications: string | null; quantity: number; price: number; }
interface Order { id: string; customer_name: string | null; total_price: number | null; total_final_pagado: number | null; status: string; items: OrderItem[]; created_at: string; }

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<Order | null>(null);
  const [finalPrice, setFinalPrice] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as unknown as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const openConfirmModal = (order: Order) => { setConfirmModal(order); setFinalPrice((order.total_price || 0).toFixed(2)); };

  const confirmOrder = async () => {
    if (!confirmModal) return;
    setConfirming(confirmModal.id);
    try {
      const price = parseFloat(finalPrice);
      if (isNaN(price) || price < 0) { toast.error("Ingresa un precio válido"); setConfirming(null); return; }
      const { error } = await supabase.rpc("confirm_order", { p_order_id: confirmModal.id, p_final_price: price });
      if (error) throw error;
      toast.success("¡Venta confirmada! ✅");
      setConfirmModal(null);
      fetchOrders();
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally { setConfirming(null); }
  };

  const cancelOrder = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    if (error) { toast.error(error.message); return; }
    toast.success("Pedido cancelado");
    fetchOrders();
  };

  const pending = orders.filter((o) => o.status === "pending");
  const completed = orders.filter((o) => o.status === "completed");
  const cancelled = orders.filter((o) => o.status === "cancelled");

  if (loading) return <div className="py-8 text-center text-muted-foreground">Cargando pedidos...</div>;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-3">
          <Clock size={18} className="text-primary" /> Pendientes ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay pedidos pendientes.</p>
        ) : (
          <div className="space-y-3">{pending.map((o) => <OrderCard key={o.id} order={o} onConfirm={() => openConfirmModal(o)} onCancel={() => cancelOrder(o.id)} confirming={confirming === o.id} />)}</div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-3"><CheckCircle size={18} className="text-accent" /> Completados ({completed.length})</h3>
          <div className="space-y-3">{completed.map((o) => <OrderCard key={o.id} order={o} />)}</div>
        </section>
      )}

      {cancelled.length > 0 && (
        <section>
          <h3 className="text-lg font-display font-semibold flex items-center gap-2 mb-3"><XCircle size={18} className="text-destructive" /> Cancelados ({cancelled.length})</h3>
          <div className="space-y-3">{cancelled.map((o) => <OrderCard key={o.id} order={o} />)}</div>
        </section>
      )}

      <Dialog open={!!confirmModal} onOpenChange={(open) => !open && setConfirmModal(null)}>
        <DialogContent className="max-w-sm w-[calc(100%-2rem)] sm:w-full">
          <DialogHeader><DialogTitle className="font-display">Confirmar Venta</DialogTitle></DialogHeader>
          {confirmModal && (
            <div className="space-y-4 mt-2">
              <div>
                <p className="text-sm text-muted-foreground">Cliente: {confirmModal.customer_name || "Anónimo"}</p>
                <p className="text-sm text-muted-foreground">Original: <span className="font-semibold text-foreground">${(confirmModal.total_price || 0).toFixed(2)}</span></p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Precio Final</label>
                <Input type="number" step="0.01" value={finalPrice} onChange={(e) => setFinalPrice(e.target.value)} className="mt-1 h-12" />
              </div>
              <Button onClick={confirmOrder} disabled={confirming === confirmModal.id} className="w-full gap-1 h-12 active:scale-[0.98]">
                <CheckCircle size={16} />
                {confirming === confirmModal.id ? "Procesando..." : "Confirmar y Descontar Stock"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const OrderCard = ({ order, onConfirm, onCancel, confirming }: { order: Order; onConfirm?: () => void; onCancel?: () => void; confirming?: boolean; }) => {
  const date = new Date(order.created_at);
  return (
    <div className="border border-border rounded-lg p-3 md:p-4 bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{order.customer_name || "Cliente anónimo"}</p>
          <p className="text-xs text-muted-foreground">{date.toLocaleDateString("es-EC")} {date.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-lg font-bold text-primary">${(order.total_price || 0).toFixed(2)}</span>
          {order.total_final_pagado != null && order.total_final_pagado !== order.total_price && (
            <p className="text-xs text-accent font-semibold">Vendido: ${order.total_final_pagado.toFixed(2)}</p>
          )}
        </div>
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
          <Button size="sm" onClick={onConfirm} disabled={confirming} className="gap-1 flex-1 h-10 active:scale-[0.98]">
            <CheckCircle size={14} /> {confirming ? "..." : "Confirmar"}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="gap-1 h-10 text-destructive border-destructive/30 hover:bg-destructive/10 active:scale-95">
            <XCircle size={14} /> <span className="hidden sm:inline">Cancelar</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
