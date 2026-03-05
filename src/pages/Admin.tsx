import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Plus, Pencil, Trash2, Save, Package, ClipboardList, History, Store, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { productSchema } from "@/lib/validation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminOrders from "@/components/AdminOrders";
import AdminSalesHistory from "@/components/AdminSalesHistory";
import AdminPOS from "@/components/AdminPOS";
import AdminWorkshop from "@/components/AdminWorkshop";
import CategoryCombobox from "@/components/CategoryCombobox";

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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) { setLoading(false); setIsAdmin(null); }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (!s) setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Check admin role when session changes
  useEffect(() => {
    if (!session) return;
    const checkAdmin = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    };
    checkAdmin();
  }, [session]);

  useEffect(() => {
    if (session && isAdmin) fetchProducts();
  }, [session, isAdmin]);

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
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ code: p.code, name: p.name, category: p.category, specifications: p.specifications || "", price: p.price, unit: p.unit, stock: p.stock, image_url: p.image_url });
    setImagePreview(p.image_url);
    setDialogOpen(true);
  };


  const handleSave = async () => {
    const validation = productSchema.safeParse(form);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    const validatedData = validation.data;
    if (editId) {
      const { error } = await supabase.from("products").update(validatedData).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Producto actualizado ✅");
    } else {
      const { error } = await supabase.from("products").insert(validatedData as any);
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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <div className="bg-card p-8 rounded-lg border border-border shadow-sm w-full max-w-sm text-center space-y-4">
          <h1 className="text-xl font-display font-bold">Acceso Denegado</h1>
          <p className="text-sm text-muted-foreground">No tienes permisos de administrador.</p>
          <Button variant="outline" onClick={handleLogout}>Cerrar Sesión</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Panel de Inventario</h1>
        <Button size="sm" variant="outline" onClick={handleLogout} className="gap-1"><LogOut size={16} /> Salir</Button>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="inventory" className="gap-1"><Package size={14} /> Inventario</TabsTrigger>
          <TabsTrigger value="pos" className="gap-1"><Store size={14} /> Mostrador</TabsTrigger>
          <TabsTrigger value="workshop" className="gap-1"><Wrench size={14} /> Taller</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1"><ClipboardList size={14} /> Pedidos</TabsTrigger>
          <TabsTrigger value="history" className="gap-1"><History size={14} /> Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <div className="mb-4">
            <Button size="sm" onClick={openAdd} className="gap-1"><Plus size={16} /> Agregar Producto</Button>
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
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="pos">
          <AdminPOS />
        </TabsContent>

        <TabsContent value="workshop">
          <AdminWorkshop />
        </TabsContent>

        <TabsContent value="orders">
          <AdminOrders />
        </TabsContent>

        <TabsContent value="history">
          <AdminSalesHistory />
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editId ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Código" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <CategoryCombobox
              value={form.category}
              onChange={(val) => setForm({ ...form, category: val })}
              existingCategories={[...new Set(products.map((p) => p.category))]}
            />
            <Input placeholder="Especificaciones" value={form.specifications || ""} onChange={(e) => setForm({ ...form, specifications: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              <Input placeholder="Unidad" value={form.unit || ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              <Input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">URL de imagen</label>
              <Input
                placeholder="https://... (pega el link de la imagen)"
                value={form.image_url || ""}
                onChange={(e) => {
                  const url = e.target.value;
                  setForm((prev) => ({ ...prev, image_url: url || null }));
                  setImagePreview(url || null);
                }}
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-contain rounded border border-border" onError={() => setImagePreview(null)} />
              )}
            </div>

            <Button onClick={handleSave} className="w-full gap-1"><Save size={16} /> Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. El producto será eliminado permanentemente del inventario.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
