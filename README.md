# ⚡ Electroinsumos: Smart ERP & AI Inventory Suite

![GitHub Repo Size](https://img.shields.io/github/repo-size/tu-usuario/electroinsumos?color=blue&style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Electroinsumos** es una plataforma integral de gestión (ERP) diseñada específicamente para negocios de suministros eléctricos que operan tanto en ventas directas como en servicios de taller. El sistema optimiza la operatividad mediante **Inteligencia Artificial**, un panel de control basado en prioridades y una arquitectura móvil altamente ergonómica.

---

## 🚀 Pilares del Proyecto

### 🧠 Motor de IA: Automatización de Catálogo
El sistema integra un pipeline de procesamiento de imágenes que profesionaliza el inventario en segundos:
- **Background Removal:** Eliminación automática de fondos (mesas de trabajo, herramientas) para aislar el producto.
- **Corporate Branding:** Superposición automática del marco estándar de **Electroinsumos** para estandarizar la estética visual.
- **WebP Optimization:** Conversión en el *edge* a formatos ligeros para garantizar una carga veloz en dispositivos móviles de taller.

### 🚥 Dashboard Inteligente (Sistema de Semáforo)
Gestión de inventario basada en el principio de **Gestión por Excepción**:
- **Nivel Crítico (Rojo):** Productos con stock cero o bajo el mínimo absoluto.
- **Advertencia (Naranja):** Reposición necesaria a corto plazo.
- **Seguro (Verde):** Niveles de stock óptimos.

### 📊 Triple Reporte "John" (Branded CSV)
Generación de reportes mensuales con membrete corporativo automatizado:
1. **Ventas:** Registro comercial de POS y pedidos de WhatsApp.
2. **Consumo de Taller:** Auditoría de materiales utilizados en reparaciones internas (Revenue $0).
3. **Inventario:** Corte de stock con valoración de activos y estatus de reposición.

---

## 📱 Ergonomía Móvil (DX-Style UI)
Inspirado en interfaces SaaS modernas, el sistema resuelve la fricción de uso en dispositivos móviles:
- **Action Hub (FAB):** Un botón flotante "+" ubicado en la zona de acción del pulgar para registros rápidos sin navegar menús superiores.
- **Soft UI:** Uso de paletas pastel para alertas, reduciendo la fatiga visual del administrador.
- **Modo Oscuro:** Interfaz optimizada para entornos de baja luz (bodegas o talleres).

---

## 🛠️ Stack Tecnológico



- **Frontend:** React.js con Vite.
- **Estilos:** Tailwind CSS (Mobile-First approach).
- **Backend/DB:** Supabase (PostgreSQL) con políticas de **Row Level Security (RLS)**.
- **Lógica de Stock:** Funciones RPC para transacciones atómicas (evita errores de resta de stock).
- **Iconografía:** Lucide-React.

---

## 📂 Estructura de Datos
Para mantener la eficiencia, el sistema utiliza un modelo de **Almacenamiento Ligero**:
- **Imágenes:** Se almacenan en *Supabase Storage buckets*.
- **Base de Datos:** Solo almacena la `image_url` (string), evitando archivos pesados y garantizando consultas de milisegundos.

---

## 👨‍💻 Autor
**Mateo Rodríguez** *Estudiante de Ingeniería en Computación - UISEK (Quito, Ecuador)* Proyecto desarrollado para la modernización digital de la industria de suministros eléctricos.

---

## 📄 Licencia
Este proyecto es de uso privado para Electroinsumos.
