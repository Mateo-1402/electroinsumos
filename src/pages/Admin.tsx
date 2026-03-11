import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LogOut, LayoutDashboard, Store, Package, History, ClipboardList,
  Wrench, Truck, ShoppingCart, FileBarChart, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

// Lazy section imports
import AdminDashboard from "@/components/AdminDashboard";
import AdminPOS from "@/components/AdminPOS";
import AdminInventory from "@/components/AdminInventory";
import AdminSalesHistory from "@/components/AdminSalesHistory";
import AdminOrders from "@/components/AdminOrders";
import AdminWorkshop from "@/components/AdminWorkshop";
import AdminProviders from "@/components/AdminProviders";
import AdminPurchases from "@/components/AdminPurchases";
import AdminReports from "@/components/AdminReports";

const NAV_ITEMS = [
  { key: "dashboard", label: "Inicio", icon: LayoutDashboard },
  { key: "pos", label: "Punto de Venta", icon: Store },
  { key: "inventory", label: "Productos", icon: Package },
  { key: "orders", label: "Pedidos", icon: ClipboardList },
  { key: "history", label: "Ventas", icon: History },
  { key: "workshop", label: "Taller", icon: Wrench },
  { key: "providers", label: "Proveedores", icon: Truck },
  { key: "purchases", label: "Compras", icon: ShoppingCart },
  { key: "reports", label: "Reportes", icon: FileBarChart },
];

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
        <form onSubmit={handleLogin} className="bg-card p-8 rounded-2xl border border-border shadow-sm w-full max-w-sm space-y-4">
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
        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm w-full max-w-sm text-center space-y-4">
          <h1 className="text-xl font-display font-bold">Acceso Denegado</h1>
          <p className="text-sm text-muted-foreground">No tienes permisos de administrador.</p>
          <Button variant="outline" onClick={handleLogout}>Cerrar Sesión</Button>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <AdminDashboard />;
      case "pos": return <AdminPOS />;
      case "inventory": return <AdminInventory />;
      case "orders": return <AdminOrders />;
      case "history": return <AdminSalesHistory />;
      case "workshop": return <AdminWorkshop />;
      case "providers": return <AdminProviders />;
      case "purchases": return <AdminPurchases />;
      case "reports": return <AdminReports />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Fixed Left Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-card border-r border-border z-30 flex flex-col transition-all duration-200 ${sidebarCollapsed ? "w-16" : "w-56"}`}>
        {/* Logo area */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && <h2 className="font-display font-bold text-sm truncate">Electroinsumos</h2>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors ${sidebarCollapsed ? "justify-center px-0" : ""}`}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Salir</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? "ml-16" : "ml-56"}`}>
        <div className="p-6 max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
