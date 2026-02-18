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
              <p className="text-sm text-muted-foreground">Av. Galo Plaza Lasso y De Los Eucaliptos, Quito 170144</p>
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
          src="https://maps.google.com/maps?q=VGMC%2BH46+Quito+170144&output=embed"
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
