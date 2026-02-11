
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  specifications TEXT,
  price NUMERIC DEFAULT 0,
  unit TEXT,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

-- Only authenticated users can modify
CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (true);

-- Seed data
-- 1. CONDENSADORES
INSERT INTO public.products (code, name, category, specifications, unit, stock, price) VALUES
('EI-CDA-145', 'Condensador de Arranque', 'Condensadores', '145-175 MFD / 125V', 'unidad', 12, 8.50),
('EI-CDA-216', 'Condensador de Arranque', 'Condensadores', '216-259 MFD / 125V', 'unidad', 9, 9.00),
('EI-CDA-340', 'Condensador de Arranque', 'Condensadores', '340-408 MFD / 125V', 'unidad', 11, 10.50),
('EI-CDT-40', 'Condensador de Trabajo', 'Condensadores', '40 UF / 250V', 'unidad', 14, 6.00),
('EI-CDT-60', 'Condensador Metálico', 'Condensadores', '60 UF / 370V', 'unidad', 12, 12.00);

-- 2. ALAMBRES
INSERT INTO public.products (code, name, category, specifications, unit, stock, price) VALUES
('AL-CU-18', 'Alambre de Cobre Esmaltado', 'Alambres', 'Calibre 18 AWG - Doble Capa', 'libra', 50, 18.00),
('AL-CU-20', 'Alambre de Cobre Esmaltado', 'Alambres', 'Calibre 20 AWG', 'libra', 45, 18.00),
('AL-CU-22', 'Alambre de Cobre Esmaltado', 'Alambres', 'Calibre 22 AWG', 'libra', 54, 18.50);

-- 3. AISLANTES Y QUÍMICOS
INSERT INTO public.products (code, name, category, specifications, unit, stock, price) VALUES
('EI-AIS-NOMEX', 'Papel Nomex', 'Aislantes', 'Espesor 0.25mm Alta Temp', 'metro', 20, 5.00),
('EI-BZ-SPRAY', 'Barniz Aislante Rojo', 'Químicos', 'Spray Secado al Aire', 'lata', 17, 8.50),
('EI-EGT-FV', 'Espagueti Fibra Vidrio', 'Aislantes', '3mm Alta Temperatura', 'metro', 100, 1.25),
('EI-PEGA-PERM', 'Silicona Pega Roja', 'Químicos', 'Marca Permatex - Alta Temp', 'tubo', 24, 6.50),
('EI-PEGA-BRUJ', 'Pegamento Instantáneo', 'Químicos', 'Tipo Brujita Original', 'unidad', 50, 0.75);

-- 4. RODAMIENTOS Y SELLOS
INSERT INTO public.products (code, name, category, specifications, unit, stock, price) VALUES
('EI-ROD-6203', 'Rodamiento Rígido', 'Rodamientos', '6203 NTN (Metálico)', 'unidad', 12, 6.50),
('EI-ROD-6205', 'Rodamiento Rígido', 'Rodamientos', '6205 NTN', 'unidad', 12, 7.80),
('EI-ROD-6304', 'Rodamiento Serie 6300', 'Rodamientos', '6304 NTN', 'unidad', 3, 9.20),
('EI-SLL-5/8', 'Sello Mecánico Tipo 21', 'Sellos', 'Medida 5/8 pulgada', 'unidad', 6, 12.00),
('EI-SLL-15-B', 'Sello Mecánico Barril', 'Sellos', '15mm Resorte Corto', 'unidad', 9, 8.50);

-- 5. VENTILADORES Y TAPAS
INSERT INTO public.products (code, name, category, specifications, unit, stock, price) VALUES
('EI-VENT-10', 'Ventilador de Motor', 'Ventiladores', 'Eje Interior 10mm', 'unidad', 15, 3.50),
('EI-VENT-24', 'Ventilador de Motor', 'Ventiladores', 'Eje Interior 24mm', 'unidad', 10, 5.25),
('EI-VENT-60', 'Ventilador Industrial', 'Ventiladores', 'Eje Interior 60mm', 'unidad', 5, 18.00),
('EI-TAPA-110', 'Tapa Cubre Ventilador', 'Ventiladores', 'Diámetro 110mm', 'unidad', 8, 4.50),
('EI-TAPA-350', 'Tapa Cubre Ventilador', 'Ventiladores', 'Diámetro 350mm', 'unidad', 4, 12.00);

-- 6. REPUESTOS VARIOS
INSERT INTO public.products (code, name, category, specifications, unit, stock, price) VALUES
('EI-CENT-16', 'Centrífugo', 'Repuestos', '16CP', 'unidad', 12, 4.50),
('EI-PLAT-CEN', 'Platinera', 'Repuestos', 'Modelo Century-A', 'unidad', 6, 5.00),
('EI-BOR-50', 'Bornera de Conexión', 'Repuestos', 'Modelo #50', 'unidad', 9, 2.50);
