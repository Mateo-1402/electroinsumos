import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Package, ClipboardList, History, Store, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminOrders from "@/components/AdminOrders";
import AdminSalesHistory from "@/components/AdminSalesHistory";
import AdminPOS from "@/components/AdminPOS";
import AdminWorkshop from "@/components/AdminWorkshop";
import AdminInventory from "@/components/AdminInventory";

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
          <AdminInventory />
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
    </div>
  );
};

export default Admin;
