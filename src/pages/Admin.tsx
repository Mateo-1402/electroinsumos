import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  specifications: string | null;
  price: number;
  unit: string | null;
  stock: number;
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
  image_url: null,
};

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchProducts();
  }, [session]);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("category").order("name");
    setProducts((data as Product[]) || []);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ code: p.code, name: p.name, category: p.category, specifications: p.specifications || "", price: p.price, unit: p.unit, stock: p.stock, image_url: p.image_url });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.name || !form.category) {
      toast.error("Código, nombre y categoría son requeridos");
      return;
    }
    if (editId) {
      const { error } = await supabase.from("products").update(form).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Producto actualizado");
    } else {
      const { error } = await supabase.from("products").insert(form);
      if (error) { toast.error(error.message); return; }
      toast.success("Producto creado");
    }
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Producto eliminado");
    fetchProducts();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <form onSubmit={handleLogin} className="bg-card p-8 rounded-lg border border-border shadow-sm w-full max-w-sm space-y-4">
          <h1 className="text-xl font-display font-bold text-center">Acceso Administrativo</h1>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full">Iniciar Sesión</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Panel de Inventario</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={openAdd} className="gap-1"><Plus size={16} /> Agregar</Button>
          <Button size="sm" variant="outline" onClick={handleLogout} className="gap-1"><LogOut size={16} /> Salir</Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted">
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
            {products.map((p) => (
              <tr key={p.id} className={`border-t border-border ${p.stock < 5 ? "bg-destructive/10" : ""}`}>
                <td className="p-3 font-mono text-xs">{p.code}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{p.category}</td>
                <td className="p-3 hidden lg:table-cell text-muted-foreground">{p.specifications}</td>
                <td className="p-3 text-right font-semibold">${p.price.toFixed(2)}</td>
                <td className={`p-3 text-right font-semibold ${p.stock < 5 ? "text-destructive" : ""}`}>{p.stock}</td>
                <td className="p-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editId ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Código" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input placeholder="Especificaciones" value={form.specifications || ""} onChange={(e) => setForm({ ...form, specifications: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              <Input placeholder="Unidad" value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              <Input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
            </div>
            <Input placeholder="URL de imagen (opcional)" value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value || null })} />
            <Button onClick={handleSave} className="w-full gap-1"><Save size={16} /> Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
