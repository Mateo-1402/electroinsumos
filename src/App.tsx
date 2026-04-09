import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartFAB from "@/components/CartFAB";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import Location from "./pages/Location";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    <CartFAB />
    <WhatsAppFAB />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
            <Route path="/catalogo" element={<PublicLayout><Catalog /></PublicLayout>} />
            <Route path="/ubicacion" element={<PublicLayout><Location /></PublicLayout>} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
