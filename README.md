Electroinsumos ERP & Smart Inventory Suite ⚡
📌 Descripción
Electroinsumos es un ecosistema integral de gestión diseñado para negocios de suministros eléctricos con taller de servicio técnico. Combina un Punto de Venta (POS) ágil, un sistema de gestión de inventarios inteligente y un módulo de automatización de imágenes con IA.
Desarrollado con un enfoque en la ingeniería de usabilidad, el sistema optimiza la toma de decisiones mediante un dashboard basado en prioridades y reportes automatizados.
🚀 Características Principales
🛠️ Gestión Híbrida (Ventas + Taller)
Punto de Venta (POS): Interfaz optimizada para ventas físicas con ajuste dinámico de precios.
Módulo de Taller: Registro de consumo interno de materiales (alambres, rodamientos, etc.) con trazabilidad total y balance de stock automático.
Gestión de Proveedores: Módulo completo de compras para actualización de stock y control de costos.
🧠 Automatización con IA (Image Pipeline)
Background Removal: Procesamiento automático de fotografías para eliminar fondos del taller.
Corporate Branding: Superposición automática de marcos corporativos (marco-corporativo.png) para estandarizar el catálogo.
WebP Optimization: Conversión automática a formatos livianos para garantizar carga rápida en redes móviles.
📊 Sistema de Reportes "Triple" (Branded CSV)
Generación de reportes mensuales estandarizados con membrete profesional:
Reporte de Ventas: Resumen comercial detallado.
Reporte de Taller: Auditoría de uso interno de materiales.
Corte de Inventario: Valoración de activos y estatus de reposición.
📱 Ergonomía Móvil (DX-Style UI)
Action Hub (FAB): Botón flotante para acceso rápido a tareas frecuentes (Nueva Venta, Nuevo Producto).
Dashboard de Semáforo: Visualización de stock basada en criticidad (Rojo/Naranja/Verde) para evitar roturas de inventario.
Diseño Responsivo: Adaptación completa para tablets y móviles (Fat-finger friendly).
🛠️ Stack Tecnológico
Frontend: React + Vite + Tailwind CSS.
Backend: Supabase (PostgreSQL).
Seguridad: Row Level Security (RLS) y Auth basado en roles.
Base de Datos: Transacciones atómicas vía RPC para integridad de stock.
UI: Lucide Icons + Shadcn/UI (inspirado en estilos SaaS modernos).

├── src/
│   ├── components/      # UI components (Dashboard, POS, FAB)
│   ├── hooks/           # Custom hooks for AI processing & stock
│   ├── lib/             # Supabase client & utilities
│   └── types/           # Type definitions for Products/Sales
├── public/              # Assets & Corporate Template
└── supabase/            # SQL Functions & RLS Policies

👷‍♂️ Autor
Mateo Rodríguez – Estudiante de Ingeniería en Computación, UISEK.
💡 Nota para reclutadores e ingenieros:
Este proyecto utiliza un modelo de almacenamiento ligero: las imágenes se procesan en el cliente/edge y se almacenan en Supabase Storage, manteniendo la base de datos libre de archivos pesados y optimizando el tiempo de respuesta del servidor.
