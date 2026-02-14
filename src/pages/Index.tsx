import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Truck, MessageCircle, ShoppingCart, Send, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Zap, title: "Calidad Industrial", desc: "Productos certificados para uso profesional en rebobinado de motores." },
  { icon: Shield, title: "Marcas Confiables", desc: "NTN, Permatex y más marcas reconocidas en el sector." },
  { icon: Truck, title: "Stock Disponible", desc: "Inventario real, listo para entrega inmediata en Quito." },
];

const steps = [
  { icon: ShoppingCart, title: "1. Elige tus productos", desc: "Navega el catálogo y agrega lo que necesitas a tu cotización." },
  { icon: Send, title: "2. Envía por WhatsApp", desc: "Tu pedido se envía directamente a nuestro equipo por WhatsApp." },
  { icon: Handshake, title: "3. Coordinamos el pago", desc: "Te confirmamos disponibilidad, precio final y forma de entrega." },
];

const categories = [
  "Condensadores", "Alambres", "Aislantes", "Rodamientos", "Sellos", "Ventiladores", "Químicos", "Repuestos"
];

const Index = () => {
  return (
    <div>
      {/* Hero */}
      <section className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
              Insumos para{" "}
              <span className="text-primary">rebobinado</span>{" "}
              de motores
            </h1>
            <p className="mt-4 text-lg opacity-80 max-w-lg">
              Todo lo que necesitas para reparar y mantener motores eléctricos. Condensadores, alambres de cobre, rodamientos y más.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/catalogo">
                  Ver Catálogo
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                <a href="https://wa.me/593994103005" target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} />
                  Contactar por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10">
          Pasos para tu compra
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.title} className="flex flex-col items-center text-center animate-fade-in">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <s.icon size={28} className="text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4 items-start animate-fade-in">
                <div className="rounded-lg bg-primary/10 p-3">
                  <f.icon size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-8">
          Nuestras Categorías
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/catalogo?categoria=${encodeURIComponent(cat)}`}
              className="bg-card rounded-lg p-4 text-center font-medium text-sm hover:shadow-md hover:border-primary border border-border transition-all"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold">
            ¿Necesitas una cotización?
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Agrega los productos que necesitas al carrito y envía tu pedido directamente por WhatsApp.
          </p>
          <Button asChild size="lg" className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <Link to="/catalogo">
              Explorar Productos <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
