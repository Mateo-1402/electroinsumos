import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LogOut, LayoutDashboard, Store, Package, History, ClipboardList,
  Wrench, Truck, ShoppingCart, FileBarChart, ChevronLeft, ChevronRight, Menu, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

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
  { key: "pos", label: "POS", icon: Store },
  { key: "inventory", label: "Productos", icon: Package },
  { key: "orders", label: "Pedidos", icon: ClipboardList },
  { key: "history", label: "Ventas", icon: History },
  { key: "workshop", label: "Taller", icon: Wrench },
  { key: "providers", label: "Proveedores", icon: Truck },
  { key: "purchases", label: "Compras", icon: ShoppingCart },
  { key: "reports", label: "Reportes", icon: FileBarChart },
];

// Bottom nav shows only 4 key items on mobile
const BOTTOM_NAV = ["dashboard", "pos", "inventory", "purchases"];

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen gap-3">
      <Loader2 size={24} className="animate-spin text-primary" />
      <span className="text-muted-foreground">Cargando...</span>
    </div>
  );

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted px-4">
        <form onSubmit={handleLogin} className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm w-full max-w-sm space-y-4">
          <h1 className="text-xl font-display font-bold text-center">Acceso Administrativo</h1>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
          <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
          <Button type="submit" className="w-full h-12 text-base">Iniciar Sesión</Button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted px-4">
        <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm w-full max-w-sm text-center space-y-4">
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

  const selectSection = (key: string) => {
    setActiveSection(key);
    setMobileMenuOpen(false);
  };

  const activeLabel = NAV_ITEMS.find((i) => i.key === activeSection)?.label || "Inicio";

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex fixed top-0 left-0 h-full bg-card border-r border-border z-30 flex-col transition-all duration-200 ${sidebarCollapsed ? "w-16" : "w-56"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && <h2 className="font-display font-bold text-sm truncate">Electroinsumos</h2>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => selectSection(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
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

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border h-14 flex items-center justify-between px-4">
        <h2 className="font-display font-bold text-sm">Electroinsumos</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{activeLabel}</span>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-muted">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Menu (for non-bottom-nav items) */}
      {mobileMenuOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="md:hidden fixed top-14 left-0 right-0 z-50 bg-card border-b border-border shadow-lg max-h-[60vh] overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => selectSection(item.key)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm transition-colors active:scale-[0.98] ${
                    isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-destructive hover:bg-destructive/10 border-t border-border"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex justify-around items-center h-16 safe-area-bottom">
        {NAV_ITEMS.filter((i) => BOTTOM_NAV.includes(i.key)).map((item) => {
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => selectSection(item.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors active:scale-95 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? "md:ml-16" : "md:ml-56"} mt-14 md:mt-0 mb-16 md:mb-0`}>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
