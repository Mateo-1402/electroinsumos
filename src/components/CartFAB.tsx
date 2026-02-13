import { ShoppingCart, Minus, Plus, Trash2, Send } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CartFAB = () => {
  const { items, totalItems, updateQuantity, removeItem, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);

  if (totalItems === 0) return null;

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const sendWhatsApp = async () => {
    setSending(true);
    try {
      // Save order to database
      const orderItems = items.map((i) => ({
        id: i.id,
        name: i.name,
        specifications: i.specifications,
        quantity: i.quantity,
        price: i.price,
      }));

      const { error } = await supabase.from("orders").insert({
        customer_name: customerName || null,
        total_price: total,
        status: "pending",
        items: orderItems as any,
      });

      if (error) {
        toast.error("Error al guardar pedido: " + error.message);
        setSending(false);
        return;
      }

      // Send WhatsApp
      const lines = items.map(
        (i) => `- ${i.quantity}x ${i.name} (${i.specifications || "S/E"}) — $${(i.price * i.quantity).toFixed(2)}`
      );
      const nameLine = customerName ? `*Cliente:* ${customerName}\n` : "";
      const msg = `Hola Electroinsumos, deseo cotizar:\n\n${nameLine}${lines.join("\n")}\n\n*Total: $${total.toFixed(2)}*\n\nGracias.`;
      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/593994103005?text=${encoded}`, "_blank");

      toast.success("Pedido registrado correctamente");
      clearCart();
      setCustomerName("");
      setOpen(false);
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        aria-label="Ver cotización"
      >
        <ShoppingCart size={24} />
        <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {totalItems}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Resumen de Cotización</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Tu nombre (opcional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-2"
          />

          <div className="space-y-3 mt-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.specifications}</p>
                  <p className="text-xs font-semibold text-primary">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded hover:bg-background"><Minus size={14} /></button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded hover:bg-background"><Plus size={14} /></button>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <span className="font-display font-semibold">Total estimado:</span>
            <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
          </div>

          <Button onClick={sendWhatsApp} disabled={sending} className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <Send size={18} />
            {sending ? "Enviando..." : "Enviar Pedido por WhatsApp"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CartFAB;
