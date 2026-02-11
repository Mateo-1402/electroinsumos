import { Link } from "react-router-dom";
import { MapPin, Phone, Clock } from "lucide-react";

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground">
    <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <img src="/logo-electroinsumos.png" alt="Electroinsumos" className="h-10 object-contain mb-4 brightness-0 invert" />
        <p className="text-sm opacity-80">
          Insumos eléctricos e industriales para el rebobinado de motores en Quito, Ecuador.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-display font-semibold text-lg">Contacto</h4>
        <div className="flex items-start gap-2 text-sm opacity-80">
          <MapPin size={16} className="mt-0.5 shrink-0" />
          <span>Quito, Ecuador – Sector Sur</span>
        </div>
        <div className="flex items-center gap-2 text-sm opacity-80">
          <Phone size={16} className="shrink-0" />
          <span>+593 99 410 3005</span>
        </div>
        <div className="flex items-center gap-2 text-sm opacity-80">
          <Clock size={16} className="shrink-0" />
          <span>Lun - Vie: 8:00 - 17:00</span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-display font-semibold text-lg">Navegación</h4>
        <div className="flex flex-col gap-1 text-sm opacity-80">
          <Link to="/" className="hover:opacity-100 transition-opacity">Inicio</Link>
          <Link to="/catalogo" className="hover:opacity-100 transition-opacity">Catálogo</Link>
          <Link to="/ubicacion" className="hover:opacity-100 transition-opacity">Ubicación</Link>
        </div>
      </div>
    </div>

    <div className="border-t border-secondary-foreground/10">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center text-xs opacity-60">
        <span>© {new Date().getFullYear()} Electroinsumos. Todos los derechos reservados.</span>
        <Link to="/admin" className="hover:opacity-100 transition-opacity mt-1 sm:mt-0">
          Acceso Administrativo
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
