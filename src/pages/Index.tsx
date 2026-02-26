import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Truck, MessageCircle, ShoppingCart, Send, Handshake, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    title: "Especialistas en Insumos Eléctricos",
    desc: "Todo para el rebobinado y mantenimiento de motores.",
    cta: "Ver Catálogo",
    ctaLink: "/catalogo",
  },
  {
    title: "Calidad y Variedad Garantizada",
    desc: "Alambres de cobre, condensadores y repuestos de alta durabilidad.",
    cta: "Explorar Productos",
    ctaLink: "/catalogo",
  },
  {
    title: "Pedidos Rápidos por WhatsApp",
    desc: "Compra en línea y coordina la entrega en minutos.",
    cta: "Contactar Ahora",
    ctaLink: "https://wa.me/593994103005",
    external: true,
  },
];

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
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <div>
      {/* Hero Carousel */}
      <section className="relative bg-secondary text-secondary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/60 z-10" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-20">
          <div className="max-w-2xl min-h-[180px]">
            <h1
              key={`title-${current}`}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight animate-fade-in"
            >
              {slide.title}
            </h1>
            <p
              key={`desc-${current}`}
              className="mt-4 text-lg opacity-80 max-w-lg animate-fade-in"
            >
              {slide.desc}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {slide.external ? (
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                  <a href={slide.ctaLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={18} />
                    {slide.cta}
                  </a>
                </Button>
              ) : (
                <Button asChild size="lg" className="gap-2">
                  <Link to={slide.ctaLink}>
                    {slide.cta}
                    <ArrowRight size={18} />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-3 mt-8">
            <button onClick={prev} className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors" aria-label="Anterior">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-primary w-6" : "bg-secondary-foreground/30"}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors" aria-label="Siguiente">
              <ChevronRight size={20} />
            </button>
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
