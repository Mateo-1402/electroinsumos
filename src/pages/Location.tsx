import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Location = () => (
  <div className="container mx-auto px-4 py-12">
    <h1 className="text-3xl font-display font-bold mb-8">Nuestra Ubicación</h1>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold">Dirección</h3>
              <p className="text-sm text-muted-foreground">Quito, Ecuador – Sector Sur</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold">Teléfono</h3>
              <p className="text-sm text-muted-foreground">+593 99 410 3005</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold">Horario</h3>
              <p className="text-sm text-muted-foreground">Lunes a Viernes: 8:00 – 17:00</p>
              <p className="text-sm text-muted-foreground">Sábado: 8:00 – 13:00</p>
            </div>
          </div>
        </div>

        <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <a href="https://wa.me/593994103005" target="_blank" rel="noopener noreferrer">
            <MessageCircle size={20} />
            Escribir por WhatsApp
          </a>
        </Button>
      </div>

      <div className="rounded-lg overflow-hidden border border-border h-80 lg:h-auto bg-muted">
        <iframe
          title="Ubicación Electroinsumos"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63835.0!2d-78.52!3d-0.22!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59a4002427c9f%3A0x44e4715c21d04820!2sQuito!5e0!3m2!1ses!2sec!4v1700000000000!5m2!1ses!2sec"
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: 320 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  </div>
);

export default Location;
